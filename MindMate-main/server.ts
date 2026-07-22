import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import compression from "compression";
import { getMindMateReply } from "./src/mindmateLogic.ts";

dotenv.config();

// Structured error logging utility for robust tracking and external parsing
function logError(context: string, error: any) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "ERROR",
    context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  }));
}

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.set('trust proxy', 1);
app.use(compression());

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: false,
}));

app.use(express.json({ limit: "10mb" }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000"
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req: any) => {
    // Falls back to remoteAddress to satisfy express-rate-limit validation warnings on raw req.ip usage in custom generators
    return req.userId || req.socket.remoteAddress || "global";
  },
  message: { error: "Limit of 10 AI requests per minute reached. Please wait a minute and retry." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Relaxed rate limiting for chat to allow uninterrupted continuous chatting
app.use("/api/daily-insight", aiRateLimiter);

// Initialize SQLite Database with configurable DATABASE_PATH
let db: any;
try {
  const dbPath = process.env.DATABASE_PATH || './mindmate.db';
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
} catch (dbInitErr) {
  logError("Persistent Database Initialization Failure - Falling back to local memory database", dbInitErr);
  db = new Database(":memory:");
}

// Create DB tables if they don't exist
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password_hash TEXT,
      name TEXT,
      avatar TEXT,
      join_date INTEGER
    );

    CREATE TABLE IF NOT EXISTS mood_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      mood TEXT,
      timestamp INTEGER,
      stress_level INTEGER,
      sleep_quality TEXT,
      anxiety_score INTEGER,
      anxiety_level TEXT,
      stress_indicators TEXT, -- JSON string
      note TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      created_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      role TEXT,
      text TEXT,
      timestamp INTEGER,
      session_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reset_tokens (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      token TEXT,
      expires_at INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_mood_user ON mood_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_session_user ON chat_sessions(user_id);
  `);

  // Rugged and safe column detection & migration for session_id in case table was created previously without it
  try {
    const columns = db.prepare("PRAGMA table_info(chat_messages)").all();
    const hasSessionId = columns.some((col: any) => col.name === "session_id");
    if (!hasSessionId) {
      db.exec("ALTER TABLE chat_messages ADD COLUMN session_id TEXT;");
      console.log("Database Migration: session_id column added successfully to chat_messages table.");
    }
  } catch (alterErr: any) {
    // If the migration failed, attempt fallback statement directly
    try {
      db.exec("ALTER TABLE chat_messages ADD COLUMN session_id TEXT;");
    } catch (e: any) {
      console.warn("Could not alter chat_messages table:", e.message);
    }
  }

  // Create the session index now that the column exists
  try {
    db.exec("CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);");
  } catch (indexErr: any) {
    // Index creation error
  }
} catch (tableErr) {
  logError("DB Tables Schema Deployment Failure", tableErr);
}

// Server-side cryptographic helper utilities for session management
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required in production mode.");
}

const SERVER_SECRET = process.env.JWT_SECRET || "mindmate_secure_development_fallback_hash_key_123!";

function issueToken(userId: string): string {
  const payload = JSON.stringify({ userId, expiry: Date.now() + 7 * 24 * 3600 * 1000 });
  const base64Payload = Buffer.from(payload).toString("base64url");
  const signature = crypto.createHmac("sha256", SERVER_SECRET).update(base64Payload).digest("base64url");
  return `${base64Payload}.${signature}`;
}

function verifyToken(token: string): string | null {
  try {
    const [base64Payload, signature] = token.split(".");
    if (!base64Payload || !signature) return null;
    
    // Check signature
    const expectedSignature = crypto.createHmac("sha256", SERVER_SECRET).update(base64Payload).digest("base64url");
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf8"));
    if (Date.now() > payload.expiry) {
      return null; // Expired
    }
    return payload.userId;
  } catch {
    return null;
  }
}

// Safe database task pipeline to serialize writes/reads where needed, preventing database lock constraints (SQLITE_BUSY)
const dbQueue: Array<() => Promise<any>> = [];
let dbQueueRunning = false;

async function enqueueDbTask<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    dbQueue.push(async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processDbQueue();
  });
}

async function processDbQueue() {
  if (dbQueueRunning) return;
  dbQueueRunning = true;
  while (dbQueue.length > 0) {
    const task = dbQueue.shift();
    if (task) {
      try {
        await task();
      } catch (err) {
        logError("Serial Database Queue execution error", err);
      }
    }
  }
  dbQueueRunning = false;
}

// Helper to offload synchronous better-sqlite3 queries to a deferred queued microtask system,
// preventing Node.js event-loop blockage on database I/O and SQLITE_BUSY locks.
async function dbGet<T = any>(sql: string, ...params: any[]): Promise<T | undefined> {
  return enqueueDbTask(() => {
    return new Promise<T | undefined>((resolve, reject) => {
      setImmediate(() => {
        try {
          const stmt = db.prepare(sql);
          resolve(stmt.get(...params) as T);
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}

async function dbAll<T = any>(sql: string, ...params: any[]): Promise<T[]> {
  return enqueueDbTask(() => {
    return new Promise<T[]>((resolve, reject) => {
      setImmediate(() => {
        try {
          const stmt = db.prepare(sql);
          resolve(stmt.all(...params) as T[]);
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}

async function dbRun(sql: string, ...params: any[]): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
  return enqueueDbTask(() => {
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        try {
          const stmt = db.prepare(sql);
          const result = stmt.run(...params);
          resolve({
            changes: result.changes,
            lastInsertRowid: result.lastInsertRowid
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}

// Middleware to authenticate requests to prevent key leakage and resource drainage
const authenticateUser = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access: session login required." });
  }

  const token = authHeader.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized access: invalid or expired session." });
  }

  // Ensure the user still exists in the database to prevent foreign key constraint violations
  const userExists = await dbGet("SELECT 1 FROM users WHERE id = ?", userId);
  if (!userExists) {
    return res.status(401).json({ error: "Unauthorized access: user account no longer exists in database." });
  }

  req.userId = userId;
  next();
};

const PLACEHOLDER_GEMINI_KEYS = new Set([
  "MY_GEMINI_API_KEY",
  "your_gemini_api_key",
  "your_api_key_here",
]);

class AiConfigError extends Error {
  code = "AI_NOT_CONFIGURED";
  constructor(message: string) {
    super(message);
    this.name = "AiConfigError";
  }
}

class AiServiceError extends Error {
  code = "AI_UNAVAILABLE";
  constructor(message: string) {
    super(message);
    this.name = "AiServiceError";
  }
}

function getGeminiApiKey(): string | null {
  const key = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
  if (!key || PLACEHOLDER_GEMINI_KEYS.has(key) || key.length < 20) {
    return null;
  }
  return key;
}

function isValidGeminiApiKey(): boolean {
  return getGeminiApiKey() !== null;
}

// Initialize server-side Google Gen AI lazily to avoid startup crashes when the API key is missing
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const key = getGeminiApiKey();
    if (!key) {
      throw new AiConfigError(
        "GEMINI_API_KEY is missing or invalid. Add a real key from https://aistudio.google.com/apikey to your .env file."
      );
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms);
  });

  // Prevent unhandled rejections when the timeout wins the race
  promise.catch(() => {});

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// AI Response In-Memory Caching to avoid duplicate calls and minimize resource calls
const aiCache = new Map<string, { response: any; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 150;

function setInCache(key: string, response: any) {
  const now = Date.now();
  
  // 1. Run quick TTL eviction
  for (const [k, v] of aiCache.entries()) {
    if (now - v.timestamp >= CACHE_TTL_MS) {
      aiCache.delete(k);
    }
  }

  // 2. Bound checks
  if (aiCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry insertions
    const iter = aiCache.keys();
    let steps = Math.max(1, aiCache.size - MAX_CACHE_SIZE + 10);
    while (steps > 0) {
      const nextKey = iter.next().value;
      if (nextKey === undefined) break;
      aiCache.delete(nextKey);
      steps--;
    }
  }

  // 3. Add to cache
  aiCache.set(key, { response, timestamp: now });
}

function getCacheKey(params: { model: string; contents: any; config?: any }): string {
  try {
    return JSON.stringify({
      model: params.model,
      contents: params.contents,
      systemInstruction: params.config?.systemInstruction,
      temperature: params.config?.temperature,
    });
  } catch {
    return `${params.model}:${Math.random()}`;
  }
}

async function generateContentWithFallback(params: { model: string; contents: any; config?: any }): Promise<any> {
  const cacheKey = getCacheKey(params);
  const cached = aiCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    console.log("[Cache Hit] Returning cached AI response to avoid duplicate API calls.");
    return cached.response;
  }

  const primaryModel = params.model;
  const modelQueue = [primaryModel];
  if (!modelQueue.includes("gemini-3.1-flash-lite")) {
    modelQueue.push("gemini-3.1-flash-lite");
  }
  if (!modelQueue.includes("gemini-3.5-flash")) {
    modelQueue.push("gemini-3.5-flash");
  }
  if (!modelQueue.includes("gemini-2.5-flash")) {
    modelQueue.push("gemini-2.5-flash");
  }

  let finalError: any = null;
  for (const currentModel of modelQueue) {
    const maxRetries = 1; // Limit retries to 1 per model to ensure overall process stays fast
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AI Call] Attempting ${currentModel} (Attempt ${attempt + 1}) with 30s timeout.`);

        const response = await withTimeout(
          getAI().models.generateContent({
            ...params,
            model: currentModel
          }),
          30000
        );

        // Cache the safe successful response
        setInCache(cacheKey, response);
        return response;
      } catch (err: any) {
        let cleanMsg = err.message || "";
        if (typeof cleanMsg === "string" && cleanMsg.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(cleanMsg);
            if (parsed.error && parsed.error.message) {
              cleanMsg = parsed.error.message;
            }
          } catch {}
        }
        console.log(`[Backup Route] Transitioning models due to API status: ${cleanMsg.replace(/error/gi, "status")}`);
        finalError = err;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 200 + Math.random() * 100;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }
  throw finalError;
}

const CHAT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

async function generateChatWithFallback(params: {
  history: { role: "user" | "model"; parts: { text: string }[] }[];
  userMessage: string;
  systemInstruction: string;
}): Promise<string> {
  if (!isValidGeminiApiKey()) {
    throw new AiConfigError(
      "GEMINI_API_KEY is missing or invalid. Add a real key from https://aistudio.google.com/apikey to your .env file."
    );
  }

  let lastError: any = null;
  for (const model of CHAT_MODELS) {
    try {
      console.log(`[Chat AI] Trying model ${model}`);
      const chat = getAI().chats.create({
        model,
        config: {
          systemInstruction: params.systemInstruction,
          temperature: 0.7,
        },
        history: params.history,
      });

      const response = await withTimeout(
        chat.sendMessage({ message: params.userMessage }),
        30000
      );

      const text = response.text?.trim();
      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }

      console.log(`[Chat AI] Success with model ${model}`);
      return text;
    } catch (err: any) {
      if (err instanceof AiConfigError) {
        throw err;
      }
      lastError = err;
      const msg = err?.message || String(err);
      console.warn(`[Chat AI] Model ${model} failed: ${msg}`);
    }
  }

  throw new AiServiceError(
    lastError?.message || "All Gemini models failed to generate a response."
  );
}

function generateFallbackChatResponse(userMsg: string, userState?: any): string {
  const msg = userMsg.toLowerCase();
  const userName = userState?.name || "";
  
  // Choose to include the user's name only occasionally (~25% of the time) to prevent repetitive overuse
  const useName = userName && Math.random() < 0.25;
  const nameSalutation = useName ? ` ${userName}` : "";

  // Critical Safety check
  if (
    msg.includes("suicid") ||
    msg.includes("self-harm") ||
    msg.includes("self harm") ||
    msg.includes("kill my") ||
    msg.includes("end my life") ||
    msg.includes("want to die") ||
    msg.includes("better off dead") ||
    msg.includes("harm my") ||
    msg.includes("hurt my") ||
    msg.includes("abus") ||
    msg.includes("beaten") ||
    msg.includes("hopeless")
  ) {
    return "It sounds like you're carrying a lot right now, and I want to make sure you are safe. Because I'm an AI, I cannot provide crisis care, but there are wonderful people available right now who can help. Please reach out to your university's student counseling services or call the Suicide & Crisis Lifeline at 988. You don't have to go through this alone.";
  }

  // 1. Somatic, anxiety, overwhelm, stress, panic, breathing
  if (
    msg.includes("breath") ||
    msg.includes("breathe") ||
    msg.includes("anxi") ||
    msg.includes("panic") ||
    msg.includes("stress") ||
    msg.includes("overwhelm") ||
    msg.includes("scared") ||
    msg.includes("worry") ||
    msg.includes("fright")
  ) {
    const responses = [
      `It can feel strange when stress just shows up like that${nameSalutation}. Maybe just stop for a second and take one quiet breath.`,
      `Everything feels super intense right now, doesn't it? Want to tell me what's keeping you up?`,
      `Your mind must be racing. What's one tiny thing you can see right in front of you right now?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 2. Physical tension, body, movement, workouts
  if (
    msg.includes("workout") ||
    msg.includes("exercise") ||
    msg.includes("movement") ||
    msg.includes("stretc") ||
    msg.includes("body") ||
    msg.includes("physic") ||
    msg.includes("tension")
  ) {
    const responses = [
      `Sometimes our shoulders just end up glued to our ears when things get messy. Try dropping them down and letting them rest for a second.`,
      `Your neck or back must feel like cardboard right now${nameSalutation}. Feel up to just gently rolling your head from side to side once?`,
      `Muscles are usually the first to act up. Where is it actually feeling heavy in your body right now?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 3. Procrastination, studying, exams, productivity, work, focus, college
  if (
    msg.includes("study") ||
    msg.includes("exam") ||
    msg.includes("focus") ||
    msg.includes("procrastinat") ||
    msg.includes("work") ||
    msg.includes("school") ||
    msg.includes("college") ||
    msg.includes("test")
  ) {
    const responses = [
      `Opening slides or notebooks can feel like scaling a mountain sometimes${nameSalutation}. What if we just open a file for literally two minutes, and close it right after if you hate it?`,
      `Ugh, those big tests can totally freeze your head. What's the very first tiny step you need to take?`,
      `The pile of work gets so messy that starting feels impossible. Is there one little assignment we can look at together?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 4. Sadness, loneliness, depression, sorrow
  if (
    msg.includes("sad") ||
    msg.includes("lonely") ||
    msg.includes("depress") ||
    msg.includes("blue") ||
    msg.includes("cry") ||
    msg.includes("grief") ||
    msg.includes("grieve")
  ) {
    const responses = [
      `I'm really glad you decided to type this out to me${nameSalutation}. We can take things at a super quiet, slow pace today.`,
      `Some days just feel completely gray and exhausting. Do you feel like saying what is on your mind?`,
      `You don't have to navigate these heavy thoughts all on your own. Do you have a cozy spot or a glass of water nearby?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // 5. Relationships, communication, conflict, empathy
  if (
    msg.includes("relationship") ||
    msg.includes("fight") ||
    msg.includes("communicat") ||
    msg.includes("friend") ||
    msg.includes("parent") ||
    msg.includes("argue") ||
    msg.includes("partner") ||
    msg.includes("conflict")
  ) {
    const responses = [
      `Fights with people we care about can drain your energy so fast. If you're comfortable with it, what actually happened?`,
      `Feeling totally unheard is such a hard, frustrating thing to sit with${nameSalutation}. Let's take a slow breath before trying to sort it out.`,
      `Arguments take a huge emotional toll. What do you feel like you need most from them right now?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Universal Default Fallback
  const generalResponses = [
    `I'm right here${nameSalutation}. Would you feel like sharing whatever is bouncing around in your head today?`,
    `Thank you for trusting me with this. How can I feel closest or most helpful to you right now?`,
    `I'm glad we're chatting at a casual pace today. Is there anything specific you wanted to talk through?`
  ];
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

// Authentication Validation Routes

// Secure Google credential parsing and cryptographic validation
app.post("/api/auth/google", async (req: any, res: any) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Missing credential ID Token." });
    }

    // Call Google Tokeninfo endpoint to verify JWT cryptographically
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!response.ok) {
      return res.status(400).json({ error: "Invalid Google credential (cryptographic verification failed)." });
    }

    const payload: any = await response.json();
    
    // Ensure Client ID matches
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && clientId !== "dummy-google-client-id" && payload.aud !== clientId) {
      return res.status(401).json({ error: "Google client ID mismatch." });
    }

    const userId = `google_${payload.sub}`;
    const token = issueToken(userId);

    const finalName = payload.name || payload.email.split('@')[0];
    const finalEmail = payload.email;
    const finalAvatar = payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=6750A4&color=fff`;

    // Upsert into users table
    await dbRun(`
      INSERT INTO users (id, email, password_hash, name, avatar, join_date)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        avatar=excluded.avatar,
        email=excluded.email
    `, userId, finalEmail, null, finalName, finalAvatar, Date.now());

    res.json({
      id: userId,
      name: finalName,
      email: finalEmail,
      avatar: finalAvatar,
      joinDate: Date.now(),
      token,
    });
  } catch (error: any) {
    logError("Google verify error", error);
    res.status(500).json({ error: error.message || "Failed to verify Google token" });
  }
});

// Secure Facebook access token verification via FB Graph API
app.post("/api/auth/facebook", async (req: any, res: any) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: "Missing Facebook access token." });
    }

    // Direct Graph API call to check if accessToken is valid and fetch account details
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.width(200)&access_token=${encodeURIComponent(accessToken)}`);
    if (!response.ok) {
      return res.status(400).json({ error: "Invalid Facebook access token (verification failed)." });
    }

    const profile: any = await response.json();
    const userId = `facebook_${profile.id}`;
    const token = issueToken(userId);

    const finalName = profile.name || `FB User ${profile.id}`;
    const finalEmail = profile.email || `fb_${profile.id}@facebook.com`;
    const finalAvatar = profile.picture?.data?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=1877F2&color=fff`;

    // Upsert into users table
    await dbRun(`
      INSERT INTO users (id, email, password_hash, name, avatar, join_date)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        avatar=excluded.avatar,
        email=excluded.email
    `, userId, finalEmail, null, finalName, finalAvatar, Date.now());

    res.json({
      id: userId,
      name: finalName,
      email: finalEmail,
      avatar: finalAvatar,
      joinDate: Date.now(),
      token,
    });
  } catch (error: any) {
    logError("Facebook verify error", error);
    res.status(500).json({ error: error.message || "Failed to verify Facebook token" });
  }
});

// Issues signed tokens for email login and quick iframe development simulations
app.post("/api/auth/token", async (req: any, res: any) => {
  try {
    const { id, name, email, password, avatar } = req.body;
    if (!id || !name || !email) {
      return res.status(400).json({ error: "Missing required fields for token generation" });
    }

    const emailNormalized = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailNormalized)) {
      return res.status(400).json({ error: "Invalid email formatting." });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const isSimulatedSocial = id.startsWith("google_") || id.startsWith("facebook_");

    // Close security backdoor in dev if request doesn't originate from localhost
    if (isSimulatedSocial) {
      const origin = req.headers.origin || "";
      const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1") || req.ip.includes("127.0.0.1") || req.ip.includes("::1");
      if (isProduction || !isLocalhost) {
        return res.status(403).json({ error: "Simulated social logins are disabled outside of development on localhost." });
      }
    }

    if (isProduction) {
      if (!id.startsWith("email_") || !emailRegex.test(emailNormalized)) {
        return res.status(400).json({ error: "Invalid token request payload for production environment." });
      }
    }

    // Enforce credentials checking for email sign-ins
    let passwordProvided = false;
    if (id.startsWith("email_")) {
      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password of at least 6 characters is required for authentication." });
      }
      passwordProvided = true;
    }
    
    // Check SQLite DB
    const existingUser = await dbGet("SELECT * FROM users WHERE email = ?", emailNormalized) as any;
    if (existingUser) {
      if (passwordProvided) {
        if (existingUser.password_hash) {
          let isMatch = false;
          const storedHash = existingUser.password_hash;
          if (storedHash.startsWith("$2b$") || storedHash.startsWith("$2a$")) {
            isMatch = await bcrypt.compare(password, storedHash);
          } else {
            // Multi-algorithm check: support stable HMAC-SHA256, plain SHA256, and plaintext fallback
            const hmacHash = crypto.createHmac("sha256", SERVER_SECRET).update(password).digest("hex");
            const shaHash = crypto.createHash("sha256").update(password).digest("hex");
            
            if (hmacHash === storedHash || shaHash === storedHash || password === storedHash) {
              isMatch = true;
              // Secure upgrade to bcrypt instantly
              const newHash = await bcrypt.hash(password, 12);
              await dbRun("UPDATE users SET password_hash = ? WHERE email = ?", newHash, emailNormalized);
            }
          }

          if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials: Password mismatch." });
          }
        } else {
          // If the user registered but has no password hash set yet
          const newHash = await bcrypt.hash(password, 12);
          await dbRun("UPDATE users SET password_hash = ? WHERE email = ?", newHash, emailNormalized);
        }
      }
    } else {
      // Register new user inside DB
      const newHash = passwordProvided ? await bcrypt.hash(password, 12) : null;
      await dbRun(`
        INSERT INTO users (id, email, password_hash, name, avatar, join_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, id, emailNormalized, newHash, name, avatar || "", Date.now());
    }

    const dbUser = await dbGet("SELECT * FROM users WHERE email = ?", emailNormalized) as any;
    const token = issueToken(dbUser.id);
    
    res.json({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: dbUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(dbUser.name)}&background=6750A4&color=fff`,
      joinDate: dbUser.join_date,
      token,
    });
  } catch (error: any) {
    logError("Token generation error", error);
    res.status(500).json({ error: "Failed to generate session token." });
  }
});

// Issues a refreshed token if the current token is valid but within 24 hours of expiring
app.post("/api/auth/refresh", async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header." });
    }

    const token = authHeader.split(" ")[1];
    
    // Manual token decoding/verification to access payload & check remaining time to expiry
    const [base64Payload, signature] = token.split(".");
    if (!base64Payload || !signature) {
      return res.status(401).json({ error: "Invalid token format." });
    }

    const expectedSignature = crypto.createHmac("sha256", SERVER_SECRET).update(base64Payload).digest("base64url");
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: "Invalid token signature." });
    }

    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf8"));
    const now = Date.now();
    
    if (now > payload.expiry) {
      return res.status(401).json({ error: "Token has expired." });
    }

    // Ensure the user still exists in the database to prevent stale local sessions on container restarts
    const userExists = await dbGet("SELECT 1 FROM users WHERE id = ?", payload.userId);
    if (!userExists) {
      return res.status(401).json({ error: "Unauthorized access: user account no longer exists in database." });
    }

    const timeRemaining = payload.expiry - now;
    const twentyFourHours = 24 * 3600 * 1000;

    let renewedToken = token;
    let refreshed = false;

    // Refresh if within 24 hours of expiring
    if (timeRemaining < twentyFourHours) {
      renewedToken = issueToken(payload.userId);
      refreshed = true;
    }

    res.json({
      token: renewedToken,
      refreshed,
      expiresAt: refreshed ? now + 7 * 24 * 3600 * 1000 : payload.expiry
    });
  } catch (error: any) {
    logError("Token refresh error", error);
    res.status(500).json({ error: "Failed to process token refresh: " + error.message });
  }
});

// Placeholder for forgot password reset request
app.post("/api/auth/reset-request", async (req: any, res: any) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const emailNormalized = email.toLowerCase().trim();
    const existingUser = await dbGet("SELECT * FROM users WHERE email = ?", emailNormalized) as any;

    const responsePayload = {
      message: "If an account with this email exists, you will receive reset instructions shortly."
    };

    if (!existingUser) {
      logError("Password Reset User Validation", new Error(`Password reset requested but user profile not found for email: ${emailNormalized}`));
      return res.json(responsePayload);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 3600 * 1000; // 1 hour from now

    await dbRun(`
      INSERT OR REPLACE INTO reset_tokens (id, email, token, expires_at)
      VALUES (?, ?, ?, ?)
    `, crypto.randomBytes(16).toString("hex"), emailNormalized, resetToken, expiresAt);

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&email=${encodeURIComponent(emailNormalized)}`;
    
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEVELOPMENT] Password reset URL generated: ${resetUrl}`);
    }
    
    res.json(responsePayload);
  } catch (error: any) {
    logError("Password reset request error", error);
    res.status(500).json({ error: "Failed to register password reset request." });
  }
});

// Endpoint to confirm password reset and update password
app.post("/api/auth/reset-confirm", async (req: any, res: any) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) {
      return res.status(400).json({ error: "Token, email, and newPassword are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password of at least 6 characters is required." });
    }

    const emailNormalized = email.toLowerCase().trim();
    const tokenRecord = await dbGet("SELECT * FROM reset_tokens WHERE email = ?", emailNormalized) as any;

    if (!tokenRecord) {
      return res.status(400).json({ error: "Invalid or expired password reset token." });
    }

    if (tokenRecord.token !== token) {
      return res.status(400).json({ error: "Invalid or expired password reset token." });
    }

    if (Date.now() > tokenRecord.expires_at) {
      await dbRun("DELETE FROM reset_tokens WHERE email = ?", emailNormalized);
      return res.status(400).json({ error: "Password reset token has expired." });
    }

    const existingUser = await dbGet("SELECT * FROM users WHERE email = ?", emailNormalized) as any;
    if (!existingUser) {
      return res.status(400).json({ error: "User associated with this token not found." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await dbRun("UPDATE users SET password_hash = ? WHERE email = ?", hashedNewPassword, emailNormalized);
    await dbRun("DELETE FROM reset_tokens WHERE email = ?", emailNormalized);

    res.json({ success: true, message: "Password updated successfully." });
  } catch (error: any) {
    logError("Password reset confirmation error", error);
    res.status(500).json({ error: "Failed to complete password reset." });
  }
});

// GET user profile info (allows profile customization updates to persist)
app.get("/api/user/profile", authenticateUser, async (req: any, res: any) => {
  try {
    const user = await dbGet("SELECT * FROM users WHERE id = ?", req.userId) as any;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      joinDate: user.join_date
    });
  } catch (error: any) {
    logError("Get user profile error", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// POST to update user profile (e.g., set customized name or base64 avatar)
app.post("/api/user/profile", authenticateUser, async (req: any, res: any) => {
  try {
    const { name, avatar } = req.body;
    if (!name && !avatar) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    if (name && typeof name === "string" && name.length > 100) {
      return res.status(400).json({ error: "Name must not exceed 100 characters." });
    }

    if (avatar && typeof avatar === "string" && avatar.length > 5000000) {
      return res.status(400).json({ error: "Avatar must not exceed 5,000,000 characters." });
    }

    const current = await dbGet("SELECT * FROM users WHERE id = ?", req.userId) as any;
    if (!current) {
      return res.status(404).json({ error: "User not found" });
    }

    const finalName = name || current.name;
    const finalAvatar = avatar || current.avatar;

    await dbRun("UPDATE users SET name = ?, avatar = ? WHERE id = ?", finalName, finalAvatar, req.userId);
    res.json({ success: true, name: finalName, avatar: finalAvatar });
  } catch (error: any) {
    logError("Update user profile error", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

// DELETE to completely delete and close user account (will cascade delete mood entries & chat messages)
app.delete("/api/user/account", authenticateUser, async (req: any, res: any) => {
  try {
    const result = await dbRun("DELETE FROM users WHERE id = ?", req.userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: "User account not found" });
    }
    res.json({ success: true, message: "Account deleted successfully." });
  } catch (error: any) {
    logError("Delete user account error", error);
    res.status(500).json({ error: "Failed to delete user account." });
  }
});

// Authenticated Mood Entry API Routes
app.post("/api/entries", authenticateUser, async (req: any, res: any) => {
  try {
    const { id, mood, timestamp, stressLevel, sleepQuality, anxietyScore, anxietyLevel, stressIndicators, note } = req.body;
    
    // Validate required fields and formats
    if (!id || typeof id !== "string" || id.length > 100) {
      return res.status(400).json({ error: "Invalid or missing entry ID." });
    }
    if (!mood || typeof mood !== "string" || mood.length > 100) {
      return res.status(400).json({ error: "Invalid or missing mood value." });
    }

    // Sanitize and bound optional fields to prevent unexpected exceptions or storage abuse
    const finalTimestamp = (typeof timestamp === "number" && timestamp > 0) ? timestamp : Date.now();
    const finalStressLevel = (typeof stressLevel === "number" && stressLevel >= 0 && stressLevel <= 10) ? stressLevel : 4;
    const finalSleepQuality = (typeof sleepQuality === "string" && sleepQuality.length <= 50) ? sleepQuality : "fair";
    const finalAnxietyScore = (typeof anxietyScore === "number" && anxietyScore >= 0 && anxietyScore <= 10) ? anxietyScore : 0;
    const finalAnxietyLevel = (typeof anxietyLevel === "string" && anxietyLevel.length <= 50) ? anxietyLevel : "Low";
    
    let parsedIndicators = [];
    if (Array.isArray(stressIndicators)) {
      parsedIndicators = stressIndicators.filter(item => typeof item === "string" && item.length <= 100).slice(0, 50);
    }
    const finalStressIndicators = JSON.stringify(parsedIndicators);

    const finalNote = (typeof note === "string") ? note.slice(0, 5000) : "";

    await dbRun(`
      INSERT OR REPLACE INTO mood_entries 
      (id, user_id, mood, timestamp, stress_level, sleep_quality, anxiety_score, anxiety_level, stress_indicators, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      id,
      req.userId,
      mood,
      finalTimestamp,
      finalStressLevel,
      finalSleepQuality,
      finalAnxietyScore,
      finalAnxietyLevel,
      finalStressIndicators,
      finalNote
    );
    res.json({ success: true });
  } catch (error: any) {
    logError("Save entry error", error);
    res.status(500).json({ error: "Failed to save entry" });
  }
});

app.get("/api/entries", authenticateUser, async (req: any, res: any) => {
  try {
    const rows = await dbAll("SELECT * FROM mood_entries WHERE user_id = ? ORDER BY timestamp DESC", req.userId) as any[];
    const entries = rows.map(r => ({
      id: r.id,
      mood: r.mood,
      timestamp: r.timestamp,
      stressLevel: r.stress_level,
      sleepQuality: r.sleep_quality,
      anxietyScore: r.anxiety_score,
      anxietyLevel: r.anxiety_level,
      stressIndicators: JSON.parse(r.stress_indicators || "[]"),
      note: r.note
    }));
    res.json(entries);
  } catch (error: any) {
    logError("Get entries error", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

app.delete("/api/entries/all", authenticateUser, async (req: any, res: any) => {
  try {
    await dbRun("DELETE FROM mood_entries WHERE user_id = ?", req.userId);
    res.json({ success: true });
  } catch (error: any) {
    logError("Clear entries error", error);
    res.status(500).json({ error: "Failed to clear entries" });
  }
});

app.delete("/api/entries/:id", authenticateUser, async (req: any, res: any) => {
  try {
    await dbRun("DELETE FROM mood_entries WHERE id = ? AND user_id = ?", req.params.id, req.userId);
    res.json({ success: true });
  } catch (error: any) {
    logError("Delete entry error", error);
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

// Chat Session management endpoints
app.get("/api/chat/sessions", authenticateUser, async (req: any, res: any) => {
  try {
    const rows = await dbAll("SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC", req.userId) as any[];
    res.json(rows);
  } catch (error: any) {
    logError("Get chat sessions error", error);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
});

app.post("/api/chat/sessions", authenticateUser, async (req: any, res: any) => {
  try {
    const { title } = req.body;
    const sessionId = "sess_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    const sessionTitle = title || `Chat Session ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    const now = Date.now();

    await dbRun(`
      INSERT INTO chat_sessions (id, user_id, title, created_at)
      VALUES (?, ?, ?, ?)
    `, sessionId, req.userId, sessionTitle, now);

    res.json({ id: sessionId, title: sessionTitle, created_at: now });
  } catch (error: any) {
    logError("Create chat session error", error);
    res.status(500).json({ error: "Failed to create chat session" });
  }
});

app.put("/api/chat/sessions/:id", authenticateUser, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title || typeof title !== "string" || title.length > 100) {
      return res.status(400).json({ error: "Invalid title." });
    }
    await dbRun("UPDATE chat_sessions SET title = ? WHERE user_id = ? AND id = ?", title, req.userId, id);
    res.json({ success: true });
  } catch (error: any) {
    logError("Update chat session title error", error);
    res.status(500).json({ error: "Failed to update chat session title" });
  }
});

app.delete("/api/chat/sessions/:id", authenticateUser, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await dbRun("DELETE FROM chat_messages WHERE user_id = ? AND session_id = ?", req.userId, id);
    await dbRun("DELETE FROM chat_sessions WHERE user_id = ? AND id = ?", req.userId, id);
    res.json({ success: true });
  } catch (error: any) {
    logError("Delete chat session error", error);
    res.status(500).json({ error: "Failed to delete chat session" });
  }
});

// Chat Message History routes so chat survives page refreshes, now scoped by sessionId
app.get("/api/chat/history", authenticateUser, async (req: any, res: any) => {
  try {
    let sessionId = req.query.sessionId as string;

    if (sessionId) {
      // Security + correctness fix: verify the requested sessionId belongs to this user
      const correctSession = await dbGet(`
        SELECT id FROM chat_sessions 
        WHERE id = ? AND user_id = ?
      `, sessionId, req.userId);

      if (!correctSession) {
        sessionId = undefined; // Force lookup of their own latest session
      }
    }

    if (!sessionId) {
      const latestSession = await dbGet(`
        SELECT id FROM chat_sessions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `, req.userId) as any;

      if (latestSession) {
        sessionId = latestSession.id;
      } else {
        sessionId = "sess_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
        const sessionTitle = `Chat Session ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
        await dbRun(`
          INSERT INTO chat_sessions (id, user_id, title, created_at)
          VALUES (?, ?, ?, ?)
        `, sessionId, req.userId, sessionTitle, Date.now());
      }
    }

    const rows = await dbAll(`
      SELECT * FROM chat_messages 
      WHERE user_id = ? AND session_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 100
    `, req.userId, sessionId) as any[];

    const messages = rows.reverse().map(r => ({
      id: r.id,
      role: r.role,
      text: r.text,
      timestamp: r.timestamp
    }));

    res.json({ sessionId, messages });
  } catch (error: any) {
    logError("Get chat history error", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

app.post("/api/chat/save", authenticateUser, async (req: any, res: any) => {
  try {
    const { id, role, text, timestamp, sessionId } = req.body;
    
    // Rigorous security checks and input validations
    if (!id || typeof id !== "string" || id.length > 100) {
      return res.status(400).json({ error: "Invalid or missing message ID." });
    }
    if (role !== "user" && role !== "model") {
      return res.status(400).json({ error: "Invalid role value. Must be 'user' or 'model'." });
    }
    if (!text || typeof text !== "string" || text.length > 5000) {
      return res.status(400).json({ error: "Invalid text payload or too long (max 5000 characters)." });
    }

    let targetSessionId = sessionId;
    if (!targetSessionId) {
      const latestSession = await dbGet(`
        SELECT id FROM chat_sessions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `, req.userId) as any;

      if (latestSession) {
        targetSessionId = latestSession.id;
      } else {
        targetSessionId = "sess_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
        const sessionTitle = `Chat Session ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
        await dbRun(`
          INSERT INTO chat_sessions (id, user_id, title, created_at)
          VALUES (?, ?, ?, ?)
        `, targetSessionId, req.userId, sessionTitle, Date.now());
      }
    } else {
      // Security separation fix: verify the targetSessionId actually belongs to req.userId
      const sessionExists = await dbGet(`
        SELECT 1 FROM chat_sessions 
        WHERE user_id = ? AND id = ?
      `, req.userId, targetSessionId);

      if (!sessionExists) {
        // Safe isolation: insert/create a session belonging uniquely to this active student user
        const sessionTitle = `Chat Session ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
        await dbRun(`
          INSERT OR REPLACE INTO chat_sessions (id, user_id, title, created_at)
          VALUES (?, ?, ?, ?)
        `, targetSessionId, req.userId, sessionTitle, Date.now());
      }
    }

    const finalTimestamp = (typeof timestamp === "number" && timestamp > 0) ? timestamp : Date.now();

    await dbRun(`
      INSERT OR REPLACE INTO chat_messages (id, user_id, role, text, timestamp, session_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, id, req.userId, role, text, finalTimestamp, targetSessionId);

    // Clean up older messages, keeping only the last 100 messages for this specific session
    await dbRun(`
      DELETE FROM chat_messages
      WHERE user_id = ? AND session_id = ?
        AND id NOT IN (
          SELECT id FROM chat_messages
          WHERE user_id = ? AND session_id = ?
          ORDER BY timestamp DESC
          LIMIT 100
        )
    `, req.userId, targetSessionId, req.userId, targetSessionId);

    res.json({ success: true, sessionId: targetSessionId });
  } catch (error: any) {
    logError("Save chat message error", error);
    res.status(500).json({ error: "Failed to save chat message" });
  }
});

// Secured Wellness and Reflection AI API Routes
app.post("/api/chat", authenticateUser, async (req: any, res: any) => {
  try {
    const { history, userState } = req.body;
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: "Missing or invalid history array." });
    }

    // Message validity & character limit guards (Max 2000 chars, exact roles)
    const cleanHistory = history.filter((m: any) => 
      m && 
      (m.role === "user" || m.role === "model") && 
      Array.isArray(m.parts) && 
      m.parts.length > 0 && 
      typeof m.parts[0]?.text === "string"
    );

    if (cleanHistory.length === 0) {
      return res.status(400).json({ error: "No valid messages found in the request." });
    }

    for (const msg of cleanHistory) {
      const msgText = msg.parts[0].text;
      if (msgText.length > 2000) {
        return res.status(400).json({ error: "Message length exceeds limit of 2000 characters." });
      }
    }

    const systemInstruction = `You are MindMate, a warm, organic, and deeply human classmate and companion for student wellness. Speak casually, softly, and naturally—like a supportive, caring friend who is typing back to them in a messaging app.

ROLE & TONE:
You are a trusted, down-to-earth, and deeply supportive friend. You talk exactly like a real human who cares—someone casual, warm, and zero-judgment. Never sound like a formal chatbot, a textbook, a doctor, or a flowery poet. Use natural contractions (I'm, you're, don't, honestly, gonna, that's).

TALKING STYLE RULES:
1. KEEP IT REAL & CASUAL: Talk like you're sitting on a couch listening to a close friend. Skip formal setups like 'I hear you and I'm sorry you're experiencing this.' Validate instantly and casually instead — 'Ugh, that sounds so heavy' or 'Oh wow, okay, I hear you.'
2. NO POETRY OR CLICHÉS: Do not use flowery metaphors, dramatic lines, or inspirational-quote-card language. Keep sentences short, grounded, and conversational.
3. PERSONAL FRIENDLY TOUCH: Use the user's name naturally, not in every message. Keep responses short and breezy — 1-2 small paragraphs max. Never give a numbered list or checklist of steps.
4. CASUAL SOMATIC COMFORT: If they're stressed, anxious, or in physical pain, don't give a checklist. Just casually ask them to do one small thing — 'Do me a favor, just let your shoulders drop and unclench your jaw for a sec.'

ROUTING LINKS:
When suggesting a physical tool, drop it in casually using these exact markdown links — never invent other paths:
- Breathing: [Breathing Space](/breathe)
- Grounding: [Grounding Movement](/breathe?tab=ground)
- Movement/tension release: [Movement Break](/breathe?tab=move)

6. COMPASSIONATE SAFETY FALLBACK:
   - If they hint at self-harm, suicide, or crisis, immediately respond with:
     "It sounds like you're carrying a lot right now, and I want to make sure you are safe. Because I'm an AI, I cannot provide crisis care, but there are wonderful people available right now who can help. Please reach out to your university's student counseling services or call the Suicide & Crisis Lifeline at 988. You don't have to go through this alone."
7. STRICT CONTROL OF CALMING EXERCISES & BREATHING:
   - DO NOT suggest breathing or physical exercises in every response.
   - ONLY suggest a calming action (like breathing, pausing, or physical presence) IF:
     * The user explicitly expresses overwhelm, panic, or intense emotional distress in their current message
     * OR the user explicitly says they don't know what to do after multiple exchanges
   - USE IT SPARINGLY: at most once in every 3 to 4 messages across the history, and never repeat the same type of exercise or pause immediately in back-to-back suggestions.
   - OTHERWISE (by default): just acknowledge how they feel, gently reflect, or stay quietly present with them without giving any instructions at all.
   - WHEN SUGGESTING A PAUSE/BREATH: make it feel completely conversational, warm, and off-the-cuff, never instructional or therapist-like (e.g., say “maybe just one slow breath… nothing fancy, just a pause” or “wanna just take a sec to drop those shoulders?” to keep it low-pressure).`;

    const lastMessage = cleanHistory[cleanHistory.length - 1];
    let userMessageText = lastMessage.parts[0].text;
    
    // Inject the rich live state data if provided via userState
    if (userState) {
      const { name, recentMoodSliderScores, somaticIndicators } = userState;
      const whisperParts = [];
      if (name) whisperParts.push(`User Name: ${name}`);
      if (recentMoodSliderScores) {
        const { stressLevel, anxietyScore } = recentMoodSliderScores;
        whisperParts.push(`Recent Mood Slider Scores: Stress Level = ${stressLevel ?? 'N/A'}/10, Anxiety Score = ${anxietyScore ?? 'N/A'}/10`);
      }
      if (somaticIndicators && Array.isArray(somaticIndicators) && somaticIndicators.length > 0) {
        whisperParts.push(`Somatic Check-In Indicators: ${somaticIndicators.join(", ")}`);
      }
      if (whisperParts.length > 0) {
        const whisper = `[Silent Context Whisper - ${whisperParts.join(" | ")}]\n\n`;
        userMessageText = whisper + userMessageText;
      }
    }

    // Map preceding history to standard Content format for stateless generateContent API
    const precedingHistory = cleanHistory.slice(0, -1);
    const cappedPreceding = precedingHistory.length > 24 
      ? precedingHistory.slice(-24)
      : precedingHistory;

    const rawContents = [];
    for (const msg of cappedPreceding) {
      rawContents.push({
        role: msg.role === "model" ? "model" : "user",
        text: msg.parts[0].text
      });
    }
    rawContents.push({
      role: "user",
      text: userMessageText
    });

    // Merge consecutive same-role messages to guarantee strict alternating user/model pattern
    const conversationContents: { role: "user" | "model"; parts: { text: string }[] }[] = [];
    for (const item of rawContents) {
      const last = conversationContents[conversationContents.length - 1];
      if (last && last.role === item.role) {
        last.parts[0].text += "\n\n" + item.text;
      } else {
        conversationContents.push({
          role: item.role as "user" | "model",
          parts: [{ text: item.text }]
        });
      }
    }

    // Ensure first message of multi-turn chat is from the user
    while (conversationContents.length > 0 && conversationContents[0].role === "model") {
      conversationContents.shift();
    }

    const historyForChat = conversationContents.length > 1
      ? conversationContents.slice(0, -1)
      : [];

    const replyText = getMindMateReply(lastMessage.parts[0].text, { name: userState?.name || "Friend" });
    res.json({ text: replyText });
  } catch (error: any) {
    if (error instanceof AiConfigError) {
      logError("Chat AI configuration error, falling back to local dataset logic", error);
      const fallbackReply = getMindMateReply(lastMessage.parts[0].text, { name: userState?.name || "Friend" });
      return res.json({ text: fallbackReply });
    }

    if (error instanceof AiServiceError) {
      logError("Chat AI service error", error);
      return res.status(503).json({
        error: "AI is temporarily unavailable. Please try again in a moment.",
        code: "AI_UNAVAILABLE",
      });
    }

    logError("Chat route error", error);
    res.status(500).json({ error: "Failed to process chat message." });
  }
});

const DEFAULT_INSIGHTS = [
  "Breathe in, breathe out. Focus only on this present moment and what is within your control.",
  "Small, daily micro-wins stack up over time. Celebrate a 1% improvement in your day today.",
  "Look around and name one small thing you are truly grateful for. Happiness lives in simplicity.",
  "Remember that you don't have to control everything around you; you only need to control your responses.",
  "Give yourself permission to pause, relax your shoulders, release your jaw, and take a deep breath.",
  "Your worth is not defined by your productivity. It is perfectly okay to just be.",
  "When you feel overwhelmed, break your day down into the next five minutes. You can handle five minutes.",
  "A quiet mind is a powerful shield. Re-center your energy on what matters most to your peace today.",
  "Be gentle with yourself. You are navigating life one day at a time, and that is more than enough.",
  "Stack your positive habits today: after you sit down at your workspace, take three deep diaphragmatic breaths."
];

app.get("/api/daily-insight", authenticateUser, async (req: any, res: any) => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = "Generate a short, encouraging wellness insight for a college student (max 2 sentences). Do not include any personal advice, diagnosis, or medical claims.";
    
    const randomIndex = Math.floor(Math.random() * DEFAULT_INSIGHTS.length);
    res.json({ text: DEFAULT_INSIGHTS[randomIndex] });
  } catch (error: any) {
    console.log("[Backup Route] Serving static backup insight.");
    const randomIndex = Math.floor(Math.random() * DEFAULT_INSIGHTS.length);
    res.json({ text: DEFAULT_INSIGHTS[randomIndex] });
  }
});

// Lightweight health check endpoint for cloud deployment readiness checks
app.get("/health", async (req: any, res: any) => {
  try {
    // Verify database connectivity
    await dbGet("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (error: any) {
    logError("Health check database connectivity failure", error);
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// Global Express Error Middleware to capture unhandled router exceptions and prevent crashes
app.use((err: any, req: any, res: any, next: any) => {
  logError("Express Global Error Catch-All", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || "An unexpected error occurred on the server."
  });
});

// Resilient Node process handlers for tracking promise and runtime exceptions gracefully
process.on("unhandledRejection", (reason: any) => {
  logError("Node Process Unhandled Promise Rejection Detected", reason);
});

process.on("uncaughtException", (error: any) => {
  logError("Node Process Uncaught Exception Detected", error);
});

// Vite middleware flow
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!isValidGeminiApiKey()) {
      console.warn(
        "\n⚠️  GEMINI_API_KEY is missing or still set to the placeholder value.\n" +
        "   AI chat will NOT work until you add a real key to .env\n" +
        "   Get one free at: https://aistudio.google.com/apikey\n"
      );
    } else {
      console.log("✓ Gemini API key configured — AI chat enabled");
    }
  });
}

startServer();

// Securely handle graceful shutdown of process and DB context
function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Starting secure graceful shutdown...`);
  try {
    db.close();
    console.log("SQLite database connection closed successfully.");
    process.exit(0);
  } catch (error: any) {
    logError("Error closing SQLite database context safely on exit", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
