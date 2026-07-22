var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_bcrypt = __toESM(require("bcrypt"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_express_rate_limit = require("express-rate-limit");
var import_compression = __toESM(require("compression"), 1);

// src/mindmateDataset.json
var mindmateDataset_default = {
  intents: [
    {
      intent: "stress",
      patterns: [
        "I feel overwhelmed",
        "Everything is too much",
        "I can't handle all this",
        "I'm stressed out",
        "Too much is happening at once",
        "I feel pressure from everything",
        "I don't know where to start",
        "It's all piling up",
        "I'm mentally overloaded",
        "I feel suffocated with work",
        "I'm overwhelmed with everything going on",
        "I feel like I have too much on my plate",
        "I'm under too much pressure",
        "I feel like I'm drowning in work",
        "I can't manage all these responsibilities",
        "I'm mentally exhausted from everything",
        "I feel like I\u2019m about to break down",
        "Everything feels out of control",
        "I\u2019m stressed beyond my limit",
        "I can\u2019t keep up with everything"
      ],
      responses: [
        {
          text: "That sounds really overwhelming. When everything hits at once, it can feel like there's no space to breathe.",
          suggestion: "Let's slow it down \u2014 pick just one small thing to focus on."
        },
        {
          text: "I can hear how heavy this feels for you. Anyone in your place would feel stressed too.",
          suggestion: "Try writing everything down and tackle just one piece."
        },
        {
          text: "It feels like everything is demanding your attention at the same time, right?",
          suggestion: "Pause for a minute and take a few slow breaths."
        },
        {
          text: "You're carrying a lot right now, and that can be exhausting.",
          suggestion: "Give yourself permission to take a short break."
        }
      ]
    },
    {
      intent: "anxiety",
      patterns: [
        "I feel anxious",
        "I'm panicking",
        "My chest feels tight",
        "I feel nervous all the time",
        "I can't calm down",
        "My thoughts are racing",
        "I feel uneasy",
        "I feel scared for no reason",
        "My heart is beating fast",
        "I feel restless",
        "I feel uneasy all the time",
        "I have a constant fear inside me",
        "I can't relax at all",
        "I feel like something bad will happen",
        "I feel on edge constantly",
        "I\u2019m always tense for no reason",
        "My mind won\u2019t stop worrying",
        "I feel nervous without reason",
        "I can\u2019t calm my thoughts",
        "I feel panic randomly"
      ],
      responses: [
        {
          text: "That sounds really intense. Anxiety can feel overwhelming both in your mind and body.",
          suggestion: "Try slow breathing \u2014 inhale for 4, exhale for 6."
        },
        {
          text: "I'm here with you. That uneasy feeling can be really hard to sit with.",
          suggestion: "Look around and name 5 things you can see."
        },
        {
          text: "It feels like your mind won\u2019t slow down, right?",
          suggestion: "Place your hand on your chest and breathe slowly."
        },
        {
          text: "Even though it feels scary, you're safe in this moment.",
          suggestion: "Focus on your breathing for a minute."
        }
      ]
    },
    {
      intent: "overthinking",
      patterns: [
        "I overthink everything",
        "I can't stop thinking",
        "My mind keeps replaying things",
        "I keep thinking about the past",
        "I imagine worst cases",
        "I can't turn my brain off",
        "I think too much",
        "My thoughts won't stop",
        "I keep analyzing everything",
        "I replay conversations in my head",
        "I keep thinking about every small detail",
        "I replay everything in my mind",
        "I analyze things too much",
        "I can\u2019t stop thinking about what happened",
        "My brain won\u2019t shut off",
        "I keep imagining bad scenarios",
        "I think about things again and again",
        "I get stuck in my thoughts",
        "I question everything I do",
        "I can\u2019t let things go"
      ],
      responses: [
        {
          text: "That loop of thoughts can feel exhausting, like your mind just won\u2019t let go.",
          suggestion: "Try writing your thoughts down to clear your head."
        },
        {
          text: "It sounds like your mind is stuck in overdrive right now.",
          suggestion: "Ask yourself: is this helping me or draining me?"
        },
        {
          text: "Overthinking can make everything feel heavier than it really is.",
          suggestion: "Shift your attention to something simple and calming."
        },
        {
          text: "You're trying to make sense of everything, but it\u2019s becoming overwhelming.",
          suggestion: "Give your mind a break \u2014 even a short one helps."
        }
      ]
    },
    {
      intent: "loneliness",
      patterns: [
        "I feel lonely",
        "I feel alone",
        "No one understands me",
        "I feel disconnected",
        "I feel left out",
        "Nobody talks to me",
        "I feel invisible",
        "I feel ignored",
        "I have no one to talk to",
        "I feel empty inside",
        "I feel like no one cares about me",
        "I feel isolated",
        "I feel disconnected from everyone",
        "I feel like I don\u2019t belong anywhere",
        "I don\u2019t have anyone to talk to",
        "I feel emotionally alone",
        "I feel distant from people",
        "I feel like nobody understands me",
        "I feel left behind",
        "I feel invisible to others"
      ],
      responses: [
        {
          text: "That kind of loneliness can feel really deep\u2026 like no one truly sees you.",
          suggestion: "Maybe try reaching out to someone you trust, even a small message."
        },
        {
          text: "I'm really sorry you're feeling this way. You don\u2019t deserve to feel alone.",
          suggestion: "You could try connecting with someone, even briefly."
        },
        {
          text: "Feeling disconnected can be really painful.",
          suggestion: "Even one meaningful conversation can make a difference."
        },
        {
          text: "You\u2019re not as alone as it feels right now, even if your mind says otherwise.",
          suggestion: "I'm here with you \u2014 you can talk to me."
        }
      ]
    },
    {
      intent: "motivation",
      patterns: [
        "I have no motivation",
        "I can't start anything",
        "I feel lazy",
        "I don't feel like doing anything",
        "I keep procrastinating",
        "I can't get myself to work",
        "I feel stuck",
        "I don't want to do anything",
        "I can't begin",
        "I have no energy to start",
        "I don\u2019t feel like doing anything",
        "I have zero energy to work",
        "I feel lazy but I know I shouldn't",
        "I just can't get started",
        "I keep delaying everything",
        "I don't feel driven anymore",
        "I feel stuck and unproductive",
        "I have no energy to continue",
        "I lack the will to do things",
        "I feel like doing nothing all day"
      ],
      responses: [
        {
          text: "It\u2019s not that you don\u2019t want to do things \u2014 it feels like you just can\u2019t start, right?",
          suggestion: "Start with just 2 minutes. That\u2019s enough."
        },
        {
          text: "That stuck feeling can be really frustrating.",
          suggestion: "Pick the easiest task and begin there."
        },
        {
          text: "You're not lazy \u2014 your mind is probably overwhelmed.",
          suggestion: "Break your task into something really small."
        },
        {
          text: "Starting feels like the hardest part sometimes.",
          suggestion: "Try doing just a tiny step."
        }
      ]
    },
    {
      intent: "low_self_worth",
      patterns: [
        "I'm not good enough",
        "I feel like a failure",
        "I hate myself",
        "I feel useless",
        "I'm worthless",
        "I always mess up",
        "I'm not capable",
        "I feel inferior",
        "I can't do anything right",
        "I'm not smart enough",
        "I feel like I'm not enough",
        "I don't deserve anything good",
        "I'm a disappointment",
        "I feel like I don't matter",
        "I'm not worthy",
        "I feel like everyone is better than me",
        "I hate who I am",
        "I feel like a burden",
        "I'm not useful to anyone",
        "I feel like I don't belong"
      ],
      responses: [
        {
          text: "That\u2019s a really painful thought to carry. It doesn\u2019t define who you are.",
          suggestion: "Think of one small thing you\u2019ve done well."
        },
        {
          text: "I'm really sorry you're feeling this way. You\u2019re being very hard on yourself.",
          suggestion: "Try speaking to yourself like you would to a friend."
        },
        {
          text: "Those thoughts feel real, but they\u2019re not the full truth about you.",
          suggestion: "Write down something you're proud of."
        },
        {
          text: "You\u2019re more than your mistakes, even if it doesn\u2019t feel that way.",
          suggestion: "Be gentle with yourself today."
        }
      ]
    },
    {
      intent: "burnout",
      patterns: [
        "I feel exhausted",
        "I'm mentally tired",
        "I feel drained",
        "I can't keep going",
        "I'm burned out",
        "I feel tired all the time",
        "I have no energy",
        "I'm drained emotionally",
        "I feel worn out",
        "I'm completely tired",
        "I feel completely drained",
        "I can't focus anymore",
        "I feel mentally exhausted",
        "I'm too tired to do anything",
        "I feel like I have no energy left",
        "Everything feels like too much effort",
        "I feel overwhelmed and tired",
        "I just want to sleep all day",
        "I feel emotionally exhausted",
        "I can't keep up with anything"
      ],
      responses: [
        {
          text: "That sounds like deep exhaustion, not just being tired.",
          suggestion: "Take a real break \u2014 your mind needs it."
        },
        {
          text: "You've been pushing yourself a lot, haven\u2019t you?",
          suggestion: "Give yourself permission to rest."
        },
        {
          text: "Burnout can feel really heavy and draining.",
          suggestion: "Try stepping away for a while."
        },
        {
          text: "Your mind is asking for rest right now.",
          suggestion: "Even a short pause can help."
        }
      ]
    },
    {
      intent: "academic_pressure",
      patterns: [
        "I have exams",
        "Too many assignments",
        "I failed my test",
        "I'm scared about results",
        "Study pressure is too much",
        "I can't handle studies",
        "I'm worried about grades",
        "I have deadlines",
        "I can't finish syllabus",
        "I feel pressure to perform",
        "I'm stressed about exams",
        "I can't keep up with studies",
        "There's too much to study",
        "I'm afraid I'll fail",
        "I don't understand anything",
        "I feel behind in class",
        "I can't manage my time",
        "I'm stressed about homework",
        "I feel lost in studies",
        "I can't concentrate on studying"
      ],
      responses: [
        {
          text: "That academic pressure can feel really intense.",
          suggestion: "Focus on important topics instead of everything."
        },
        {
          text: "It\u2019s a lot to handle, especially with deadlines.",
          suggestion: "Break your work into smaller parts."
        },
        {
          text: "You're doing your best under pressure.",
          suggestion: "Take short breaks to stay fresh."
        },
        {
          text: "It\u2019s okay to feel stressed about studies.",
          suggestion: "Focus on progress, not perfection."
        }
      ]
    },
    {
      intent: "crisis",
      patterns: [
        "I want to give up",
        "Nothing matters",
        "I can't do this anymore",
        "I feel hopeless",
        "I don't see a point",
        "I feel empty",
        "I feel broken",
        "I hate my life",
        "I don't want to exist",
        "Everything feels pointless",
        "I feel like giving up on everything",
        "I don't want to continue",
        "I feel like there's no hope",
        "I don't see a future",
        "I feel completely lost",
        "I can't take this anymore",
        "I feel like disappearing",
        "I wish I wasn't here",
        "I feel like ending it all",
        "I don't want to wake up",
        "i dont want to live",
        "life is not worth it",
        "i wish i was dead",
        "i want to disappear"
      ],
      responses: [
        {
          text: "I'm really sorry you're feeling this much pain. You\u2019re not alone in this moment, even if it feels like it.",
          suggestion: "It might really help to talk to someone you trust \u2014 a friend, family member, or a professional."
        },
        {
          text: "I'm really glad you told me. That takes courage. You deserve support and care.",
          suggestion: "If you can, please consider reaching out to a helpline or someone close to you right now."
        },
        {
          text: "That sounds incredibly heavy to carry. You don\u2019t have to go through this alone.",
          suggestion: "Please try to connect with someone \u2014 even sending a simple message can help."
        },
        {
          text: "I\u2019m here with you, and I care about what you\u2019re going through.",
          suggestion: "If you're in immediate danger, please contact your local emergency number or a crisis helpline."
        }
      ]
    },
    {
      intent: "sadness",
      patterns: [
        "I feel sad",
        "I am sad",
        "I feel unhappy",
        "I've been crying",
        "I feel down",
        "I feel blue",
        "I feel low",
        "I feel gloomy",
        "I feel miserable",
        "I feel heartbroken",
        "I feel depressed",
        "I feel empty and sad",
        "I don't feel okay",
        "I feel like crying",
        "everything feels sad",
        "I feel really low today",
        "I feel so down right now",
        "I'm not okay",
        "I feel broken inside",
        "I just feel really sad"
      ],
      responses: [
        {
          text: "I'm sorry you're feeling sad. It's okay to feel this way \u2014 your feelings are valid.",
          suggestion: "Try to be gentle with yourself today. Small comforts matter."
        },
        {
          text: "Sadness can feel really heavy sometimes. I'm here with you.",
          suggestion: "Maybe try listening to music or stepping outside for a few minutes."
        },
        {
          text: "It's okay to not be okay. You don't have to explain your sadness.",
          suggestion: "Allow yourself to feel it without judgment."
        },
        {
          text: "That low feeling can be really draining. You're not alone in this.",
          suggestion: "Reach out to someone you trust, or just rest if you need to."
        }
      ]
    },
    {
      intent: "confusion",
      patterns: [
        "I feel confused",
        "I don't know what to do",
        "I'm so lost",
        "Nothing makes sense",
        "I can't figure this out",
        "My mind is a mess",
        "I don't understand what's happening",
        "I'm unsure about everything",
        "I have no direction",
        "I feel completely clueless"
      ],
      responses: [
        {
          text: "It\u2019s completely okay to feel confused. You don't have to have all the answers right now.",
          suggestion: "Take a step back and just breathe. Clarity often comes when we stop forcing it."
        },
        {
          text: "Feeling lost can be really disorienting. I'm here to help you sort through it.",
          suggestion: "Try writing down exactly what's confusing you. Sometimes seeing it on paper helps."
        },
        {
          text: "When nothing makes sense, it's a sign your mind needs a break.",
          suggestion: "Give yourself permission to pause. You can figure this out later."
        },
        {
          text: "It sounds like you're trying to process a lot of uncertainty right now.",
          suggestion: "Focus on just the very next step, no matter how small."
        }
      ]
    }
  ]
};

// src/mindmateLogic.ts
var typedData = mindmateDataset_default;
var KEYWORD_WEIGHTS = {
  "sad": [{ intent: "sadness", weight: 2 }, { intent: "low_self_worth", weight: 1 }, { intent: "loneliness", weight: 1 }],
  "unhappy": [{ intent: "sadness", weight: 2 }, { intent: "low_self_worth", weight: 1 }],
  "cry": [{ intent: "sadness", weight: 2 }, { intent: "loneliness", weight: 2 }, { intent: "low_self_worth", weight: 1 }],
  "don't know what to do": [{ intent: "confusion", weight: 3 }, { intent: "stress", weight: 2 }, { intent: "overthinking", weight: 2 }],
  "confused": [{ intent: "confusion", weight: 3 }, { intent: "stress", weight: 2 }],
  "lost": [{ intent: "confusion", weight: 3 }, { intent: "stress", weight: 2 }, { intent: "crisis", weight: 1 }],
  "replay": [{ intent: "overthinking", weight: 3 }],
  "replaying": [{ intent: "overthinking", weight: 3 }],
  "in my head": [{ intent: "overthinking", weight: 2 }],
  "again and again": [{ intent: "overthinking", weight: 3 }],
  "over and over": [{ intent: "overthinking", weight: 3 }],
  "can't stop": [{ intent: "overthinking", weight: 2 }, { intent: "anxiety", weight: 2 }]
};
var FALLBACK_RESPONSES = [
  "I'm here for you. Can you tell me a little more about what you're going through?",
  "It sounds like something is weighing on you. I'd love to understand better \u2014 what's on your mind?",
  "I want to help. Can you share a bit more about how you're feeling?",
  "Sometimes it's hard to put feelings into words. Take your time \u2014 I'm listening.",
  "I hear you. What's been going on for you lately?"
];
var lastFallbackIndex = -1;
function getFallback(userName) {
  let index;
  do {
    index = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  } while (index === lastFallbackIndex && FALLBACK_RESPONSES.length > 1);
  lastFallbackIndex = index;
  return FALLBACK_RESPONSES[index];
}
var lastUsedIndex = {};
function pickResponse(intent) {
  const responses = intent.responses;
  let index;
  do {
    index = Math.floor(Math.random() * responses.length);
  } while (index === lastUsedIndex[intent.intent] && responses.length > 1);
  lastUsedIndex[intent.intent] = index;
  return responses[index];
}
function detectIntent(input) {
  const normalizedInput = input.toLowerCase();
  const scores = {};
  const intentMap = {};
  for (const intent of typedData.intents) {
    intentMap[intent.intent] = intent;
    scores[intent.intent] = 0;
    for (const pattern of intent.patterns) {
      const normalizedPattern = pattern.toLowerCase();
      if (normalizedInput.includes(normalizedPattern) || normalizedPattern.includes(normalizedInput)) {
        scores[intent.intent]++;
      }
    }
  }
  for (const [keyword, weights] of Object.entries(KEYWORD_WEIGHTS)) {
    if (normalizedInput.includes(keyword)) {
      for (const weightRule of weights) {
        if (scores[weightRule.intent] !== void 0) {
          scores[weightRule.intent] += weightRule.weight;
        }
      }
    }
  }
  let bestMatch = null;
  let highestScore = 0;
  for (const [intentName, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestMatch = intentMap[intentName];
    }
  }
  return bestMatch;
}
function getMindMateReply(input, user = { name: "Friend" }) {
  const normalizedInput = input.toLowerCase();
  const crisisTriggers = [
    "kill myself",
    "end my life",
    "suicide",
    "want to die",
    "hurt myself"
  ];
  if (crisisTriggers.some((trigger) => normalizedInput.includes(trigger))) {
    return `\u26A0\uFE0F I'm really sorry you're feeling this way. You don\u2019t have to go through this alone.

\u{1F49B} Please try to reach out to someone you trust or a professional right now.

If you're in immediate danger, please contact local emergency services.`;
  }
  const intent = detectIntent(normalizedInput);
  if (intent) {
    if (intent.intent === "crisis") {
      const response2 = pickResponse(intent);
      return `\u26A0\uFE0F ${response2.text}

\u{1F49B} ${response2.suggestion}

If you're in immediate danger, please contact local emergency services.`;
    }
    const response = pickResponse(intent);
    return `${response.text}

\u{1F4A1} ${response.suggestion}`;
  }
  return getFallback(user.name);
}

// server.ts
import_dotenv.default.config();
function logError(context, error) {
  console.error(JSON.stringify({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level: "ERROR",
    context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : void 0
  }));
}
var app = (0, import_express.default)();
var PORT = parseInt(process.env.PORT || "3000", 10);
app.set("trust proxy", 1);
app.use((0, import_compression.default)());
app.use((0, import_helmet.default)({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: false
}));
app.use(import_express.default.json({ limit: "10mb" }));
var allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000"
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use((0, import_cors.default)({
  origin: "*",
  credentials: true
}));
app.use("/api/auth", (0, import_express_rate_limit.rateLimit)({ windowMs: 15 * 60 * 1e3, max: 20 }));
var aiRateLimiter = (0, import_express_rate_limit.rateLimit)({
  windowMs: 60 * 1e3,
  max: 10,
  keyGenerator: (req) => {
    return req.userId || req.socket.remoteAddress || "global";
  },
  message: { error: "Limit of 10 AI requests per minute reached. Please wait a minute and retry." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/daily-insight", aiRateLimiter);
var db;
try {
  const dbPath = process.env.DATABASE_PATH || "./mindmate.db";
  db = new import_better_sqlite3.default(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
} catch (dbInitErr) {
  logError("Persistent Database Initialization Failure - Falling back to local memory database", dbInitErr);
  db = new import_better_sqlite3.default(":memory:");
}
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
  try {
    const columns = db.prepare("PRAGMA table_info(chat_messages)").all();
    const hasSessionId = columns.some((col) => col.name === "session_id");
    if (!hasSessionId) {
      db.exec("ALTER TABLE chat_messages ADD COLUMN session_id TEXT;");
      console.log("Database Migration: session_id column added successfully to chat_messages table.");
    }
  } catch (alterErr) {
    try {
      db.exec("ALTER TABLE chat_messages ADD COLUMN session_id TEXT;");
    } catch (e) {
      console.warn("Could not alter chat_messages table:", e.message);
    }
  }
  try {
    db.exec("CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);");
  } catch (indexErr) {
  }
} catch (tableErr) {
  logError("DB Tables Schema Deployment Failure", tableErr);
}
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required in production mode.");
}
var SERVER_SECRET = process.env.JWT_SECRET || "mindmate_secure_development_fallback_hash_key_123!";
function issueToken(userId) {
  const payload = JSON.stringify({ userId, expiry: Date.now() + 7 * 24 * 3600 * 1e3 });
  const base64Payload = Buffer.from(payload).toString("base64url");
  const signature = import_crypto.default.createHmac("sha256", SERVER_SECRET).update(base64Payload).digest("base64url");
  return `${base64Payload}.${signature}`;
}
function verifyToken(token) {
  try {
    const [base64Payload, signature] = token.split(".");
    if (!base64Payload || !signature) return null;
    const expectedSignature = import_crypto.default.createHmac("sha256", SERVER_SECRET).update(base64Payload).digest("base64url");
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf8"));
    if (Date.now() > payload.expiry) {
      return null;
    }
    return payload.userId;
  } catch {
    return null;
  }
}
var dbQueue = [];
var dbQueueRunning = false;
async function enqueueDbTask(task) {
  return new Promise((resolve, reject) => {
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
async function dbGet(sql, ...params) {
  return enqueueDbTask(() => {
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        try {
          const stmt = db.prepare(sql);
          resolve(stmt.get(...params));
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}
async function dbAll(sql, ...params) {
  return enqueueDbTask(() => {
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        try {
          const stmt = db.prepare(sql);
          resolve(stmt.all(...params));
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}
async function dbRun(sql, ...params) {
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
var authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access: session login required." });
  }
  const token = authHeader.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized access: invalid or expired session." });
  }
  const userExists = await dbGet("SELECT 1 FROM users WHERE id = ?", userId);
  if (!userExists) {
    return res.status(401).json({ error: "Unauthorized access: user account no longer exists in database." });
  }
  req.userId = userId;
  next();
};
var PLACEHOLDER_GEMINI_KEYS = /* @__PURE__ */ new Set([
  "MY_GEMINI_API_KEY",
  "your_gemini_api_key",
  "your_api_key_here"
]);
var AiConfigError = class extends Error {
  constructor(message) {
    super(message);
    this.code = "AI_NOT_CONFIGURED";
    this.name = "AiConfigError";
  }
};
var AiServiceError = class extends Error {
  constructor(message) {
    super(message);
    this.code = "AI_UNAVAILABLE";
    this.name = "AiServiceError";
  }
};
function getGeminiApiKey() {
  const key = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
  if (!key || PLACEHOLDER_GEMINI_KEYS.has(key) || key.length < 20) {
    return null;
  }
  return key;
}
function isValidGeminiApiKey() {
  return getGeminiApiKey() !== null;
}
var CACHE_TTL_MS = 5 * 60 * 1e3;
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Missing credential ID Token." });
    }
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!response.ok) {
      return res.status(400).json({ error: "Invalid Google credential (cryptographic verification failed)." });
    }
    const payload = await response.json();
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && clientId !== "dummy-google-client-id" && payload.aud !== clientId) {
      return res.status(401).json({ error: "Google client ID mismatch." });
    }
    const userId = `google_${payload.sub}`;
    const token = issueToken(userId);
    const finalName = payload.name || payload.email.split("@")[0];
    const finalEmail = payload.email;
    const finalAvatar = payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=6750A4&color=fff`;
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
      token
    });
  } catch (error) {
    logError("Google verify error", error);
    res.status(500).json({ error: error.message || "Failed to verify Google token" });
  }
});
app.post("/api/auth/facebook", async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: "Missing Facebook access token." });
    }
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.width(200)&access_token=${encodeURIComponent(accessToken)}`);
    if (!response.ok) {
      return res.status(400).json({ error: "Invalid Facebook access token (verification failed)." });
    }
    const profile = await response.json();
    const userId = `facebook_${profile.id}`;
    const token = issueToken(userId);
    const finalName = profile.name || `FB User ${profile.id}`;
    const finalEmail = profile.email || `fb_${profile.id}@facebook.com`;
    const finalAvatar = profile.picture?.data?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=1877F2&color=fff`;
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
      token
    });
  } catch (error) {
    logError("Facebook verify error", error);
    res.status(500).json({ error: error.message || "Failed to verify Facebook token" });
  }
});
app.post("/api/auth/token", async (req, res) => {
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
    let passwordProvided = false;
    if (id.startsWith("email_")) {
      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password of at least 6 characters is required for authentication." });
      }
      passwordProvided = true;
    }
    const existingUser = await dbGet("SELECT * FROM users WHERE email = ?", emailNormalized);
    if (existingUser) {
      if (passwordProvided) {
        if (existingUser.password_hash) {
          let isMatch = false;
          const storedHash = existingUser.password_hash;
          if (storedHash.startsWith("$2b$") || storedHash.startsWith("$2a$")) {
            isMatch = await import_bcrypt.default.compare(password, storedHash);
          } else {
            const hmacHash = import_crypto.default.createHmac("sha256", SERVER_SECRET).update(password).digest("hex");
            const shaHash = import_crypto.default.createHash("sha256").update(password).digest("hex");
            if (hmacHash === storedHash || shaHash === storedHash || password === storedHash) {
              isMatch = true;
              const newHash = await import_bcrypt.default.hash(password, 12);
              await dbRun("UPDATE users SET password_hash = ? WHERE email = ?", newHash, emailNormalized);
            }
          }
          if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials: Password mismatch." });
          }
        } else {
          const newHash = await import_bcrypt.default.hash(password, 12);
          await dbRun("UPDATE users SET password_hash = ? WHERE email = ?", newHash, emailNormalized);
        }
      }
    } else {
      const newHash = passwordProvided ? await import_bcrypt.default.hash(password, 12) : null;
      await dbRun(`
        INSERT INTO users (id, email, password_hash, name, avatar, join_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, id, emailNormalized, newHash, name, avatar || "", Date.now());
    }
    const dbUser = await dbGet("SELECT * FROM users WHERE email = ?", emailNormalized);
    const token = issueToken(dbUser.id);
    res.json({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: dbUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(dbUser.name)}&background=6750A4&color=fff`,
      joinDate: dbUser.join_date,
      token
    });
  } catch (error) {
    logError("Token generation error", error);
    res.status(500).json({ error: "Failed to generate session token." });
  }
});
app.post("/api/auth/refresh", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header." });
    }
    const token = authHeader.split(" ")[1];
    const [base64Payload, signature] = token.split(".");
    if (!base64Payload || !signature) {
      return res.status(401).json({ error: "Invalid token format." });
    }
    const expectedSignature = import_crypto.default.createHmac("sha256", SERVER_SECRET).update(base64Payload).digest("base64url");
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: "Invalid token signature." });
    }
    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf8"));
    const now = Date.now();
    if (now > payload.expiry) {
      return res.status(401).json({ error: "Token has expired." });
    }
    const userExists = await dbGet("SELECT 1 FROM users WHERE id = ?", payload.userId);
    if (!userExists) {
      return res.status(401).json({ error: "Unauthorized access: user account no longer exists in database." });
    }
    const timeRemaining = payload.expiry - now;
    const twentyFourHours = 24 * 3600 * 1e3;
    let renewedToken = token;
    let refreshed = false;
    if (timeRemaining < twentyFourHours) {
      renewedToken = issueToken(payload.userId);
      refreshed = true;
    }
    res.json({
      token: renewedToken,
      refreshed,
      expiresAt: refreshed ? now + 7 * 24 * 3600 * 1e3 : payload.expiry
    });
  } catch (error) {
    logError("Token refresh error", error);
    res.status(500).json({ error: "Failed to process token refresh: " + error.message });
  }
});
app.post("/api/auth/reset-request", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const emailNormalized = email.toLowerCase().trim();
    const existingUser = await dbGet("SELECT * FROM users WHERE email = ?", emailNormalized);
    const responsePayload = {
      message: "If an account with this email exists, you will receive reset instructions shortly."
    };
    if (!existingUser) {
      logError("Password Reset User Validation", new Error(`Password reset requested but user profile not found for email: ${emailNormalized}`));
      return res.json(responsePayload);
    }
    const resetToken = import_crypto.default.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 3600 * 1e3;
    await dbRun(`
      INSERT OR REPLACE INTO reset_tokens (id, email, token, expires_at)
      VALUES (?, ?, ?, ?)
    `, import_crypto.default.randomBytes(16).toString("hex"), emailNormalized, resetToken, expiresAt);
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&email=${encodeURIComponent(emailNormalized)}`;
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEVELOPMENT] Password reset URL generated: ${resetUrl}`);
    }
    res.json(responsePayload);
  } catch (error) {
    logError("Password reset request error", error);
    res.status(500).json({ error: "Failed to register password reset request." });
  }
});
app.post("/api/auth/reset-confirm", async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) {
      return res.status(400).json({ error: "Token, email, and newPassword are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password of at least 6 characters is required." });
    }
    const emailNormalized = email.toLowerCase().trim();
    const tokenRecord = await dbGet("SELECT * FROM reset_tokens WHERE email = ?", emailNormalized);
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
    const existingUser = await dbGet("SELECT * FROM users WHERE email = ?", emailNormalized);
    if (!existingUser) {
      return res.status(400).json({ error: "User associated with this token not found." });
    }
    const hashedNewPassword = await import_bcrypt.default.hash(newPassword, 12);
    await dbRun("UPDATE users SET password_hash = ? WHERE email = ?", hashedNewPassword, emailNormalized);
    await dbRun("DELETE FROM reset_tokens WHERE email = ?", emailNormalized);
    res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    logError("Password reset confirmation error", error);
    res.status(500).json({ error: "Failed to complete password reset." });
  }
});
app.get("/api/user/profile", authenticateUser, async (req, res) => {
  try {
    const user = await dbGet("SELECT * FROM users WHERE id = ?", req.userId);
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
  } catch (error) {
    logError("Get user profile error", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});
app.post("/api/user/profile", authenticateUser, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    if (!name && !avatar) {
      return res.status(400).json({ error: "Nothing to update" });
    }
    if (name && typeof name === "string" && name.length > 100) {
      return res.status(400).json({ error: "Name must not exceed 100 characters." });
    }
    if (avatar && typeof avatar === "string" && avatar.length > 5e6) {
      return res.status(400).json({ error: "Avatar must not exceed 5,000,000 characters." });
    }
    const current = await dbGet("SELECT * FROM users WHERE id = ?", req.userId);
    if (!current) {
      return res.status(404).json({ error: "User not found" });
    }
    const finalName = name || current.name;
    const finalAvatar = avatar || current.avatar;
    await dbRun("UPDATE users SET name = ?, avatar = ? WHERE id = ?", finalName, finalAvatar, req.userId);
    res.json({ success: true, name: finalName, avatar: finalAvatar });
  } catch (error) {
    logError("Update user profile error", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});
app.delete("/api/user/account", authenticateUser, async (req, res) => {
  try {
    const result = await dbRun("DELETE FROM users WHERE id = ?", req.userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: "User account not found" });
    }
    res.json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    logError("Delete user account error", error);
    res.status(500).json({ error: "Failed to delete user account." });
  }
});
app.post("/api/entries", authenticateUser, async (req, res) => {
  try {
    const { id, mood, timestamp, stressLevel, sleepQuality, anxietyScore, anxietyLevel, stressIndicators, note } = req.body;
    if (!id || typeof id !== "string" || id.length > 100) {
      return res.status(400).json({ error: "Invalid or missing entry ID." });
    }
    if (!mood || typeof mood !== "string" || mood.length > 100) {
      return res.status(400).json({ error: "Invalid or missing mood value." });
    }
    const finalTimestamp = typeof timestamp === "number" && timestamp > 0 ? timestamp : Date.now();
    const finalStressLevel = typeof stressLevel === "number" && stressLevel >= 0 && stressLevel <= 10 ? stressLevel : 4;
    const finalSleepQuality = typeof sleepQuality === "string" && sleepQuality.length <= 50 ? sleepQuality : "fair";
    const finalAnxietyScore = typeof anxietyScore === "number" && anxietyScore >= 0 && anxietyScore <= 10 ? anxietyScore : 0;
    const finalAnxietyLevel = typeof anxietyLevel === "string" && anxietyLevel.length <= 50 ? anxietyLevel : "Low";
    let parsedIndicators = [];
    if (Array.isArray(stressIndicators)) {
      parsedIndicators = stressIndicators.filter((item) => typeof item === "string" && item.length <= 100).slice(0, 50);
    }
    const finalStressIndicators = JSON.stringify(parsedIndicators);
    const finalNote = typeof note === "string" ? note.slice(0, 5e3) : "";
    await dbRun(
      `
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
  } catch (error) {
    logError("Save entry error", error);
    res.status(500).json({ error: "Failed to save entry" });
  }
});
app.get("/api/entries", authenticateUser, async (req, res) => {
  try {
    const rows = await dbAll("SELECT * FROM mood_entries WHERE user_id = ? ORDER BY timestamp DESC", req.userId);
    const entries = rows.map((r) => ({
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
  } catch (error) {
    logError("Get entries error", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});
app.delete("/api/entries/all", authenticateUser, async (req, res) => {
  try {
    await dbRun("DELETE FROM mood_entries WHERE user_id = ?", req.userId);
    res.json({ success: true });
  } catch (error) {
    logError("Clear entries error", error);
    res.status(500).json({ error: "Failed to clear entries" });
  }
});
app.delete("/api/entries/:id", authenticateUser, async (req, res) => {
  try {
    await dbRun("DELETE FROM mood_entries WHERE id = ? AND user_id = ?", req.params.id, req.userId);
    res.json({ success: true });
  } catch (error) {
    logError("Delete entry error", error);
    res.status(500).json({ error: "Failed to delete entry" });
  }
});
app.get("/api/chat/sessions", authenticateUser, async (req, res) => {
  try {
    const rows = await dbAll("SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC", req.userId);
    res.json(rows);
  } catch (error) {
    logError("Get chat sessions error", error);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
});
app.post("/api/chat/sessions", authenticateUser, async (req, res) => {
  try {
    const { title } = req.body;
    const sessionId = "sess_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    const sessionTitle = title || `Chat Session ${(/* @__PURE__ */ new Date()).toLocaleDateString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
    const now = Date.now();
    await dbRun(`
      INSERT INTO chat_sessions (id, user_id, title, created_at)
      VALUES (?, ?, ?, ?)
    `, sessionId, req.userId, sessionTitle, now);
    res.json({ id: sessionId, title: sessionTitle, created_at: now });
  } catch (error) {
    logError("Create chat session error", error);
    res.status(500).json({ error: "Failed to create chat session" });
  }
});
app.put("/api/chat/sessions/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title || typeof title !== "string" || title.length > 100) {
      return res.status(400).json({ error: "Invalid title." });
    }
    await dbRun("UPDATE chat_sessions SET title = ? WHERE user_id = ? AND id = ?", title, req.userId, id);
    res.json({ success: true });
  } catch (error) {
    logError("Update chat session title error", error);
    res.status(500).json({ error: "Failed to update chat session title" });
  }
});
app.delete("/api/chat/sessions/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun("DELETE FROM chat_messages WHERE user_id = ? AND session_id = ?", req.userId, id);
    await dbRun("DELETE FROM chat_sessions WHERE user_id = ? AND id = ?", req.userId, id);
    res.json({ success: true });
  } catch (error) {
    logError("Delete chat session error", error);
    res.status(500).json({ error: "Failed to delete chat session" });
  }
});
app.get("/api/chat/history", authenticateUser, async (req, res) => {
  try {
    let sessionId = req.query.sessionId;
    if (sessionId) {
      const correctSession = await dbGet(`
        SELECT id FROM chat_sessions 
        WHERE id = ? AND user_id = ?
      `, sessionId, req.userId);
      if (!correctSession) {
        sessionId = void 0;
      }
    }
    if (!sessionId) {
      const latestSession = await dbGet(`
        SELECT id FROM chat_sessions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `, req.userId);
      if (latestSession) {
        sessionId = latestSession.id;
      } else {
        sessionId = "sess_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
        const sessionTitle = `Chat Session ${(/* @__PURE__ */ new Date()).toLocaleDateString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
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
    `, req.userId, sessionId);
    const messages = rows.reverse().map((r) => ({
      id: r.id,
      role: r.role,
      text: r.text,
      timestamp: r.timestamp
    }));
    res.json({ sessionId, messages });
  } catch (error) {
    logError("Get chat history error", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});
app.post("/api/chat/save", authenticateUser, async (req, res) => {
  try {
    const { id, role, text, timestamp, sessionId } = req.body;
    if (!id || typeof id !== "string" || id.length > 100) {
      return res.status(400).json({ error: "Invalid or missing message ID." });
    }
    if (role !== "user" && role !== "model") {
      return res.status(400).json({ error: "Invalid role value. Must be 'user' or 'model'." });
    }
    if (!text || typeof text !== "string" || text.length > 5e3) {
      return res.status(400).json({ error: "Invalid text payload or too long (max 5000 characters)." });
    }
    let targetSessionId = sessionId;
    if (!targetSessionId) {
      const latestSession = await dbGet(`
        SELECT id FROM chat_sessions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `, req.userId);
      if (latestSession) {
        targetSessionId = latestSession.id;
      } else {
        targetSessionId = "sess_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
        const sessionTitle = `Chat Session ${(/* @__PURE__ */ new Date()).toLocaleDateString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
        await dbRun(`
          INSERT INTO chat_sessions (id, user_id, title, created_at)
          VALUES (?, ?, ?, ?)
        `, targetSessionId, req.userId, sessionTitle, Date.now());
      }
    } else {
      const sessionExists = await dbGet(`
        SELECT 1 FROM chat_sessions 
        WHERE user_id = ? AND id = ?
      `, req.userId, targetSessionId);
      if (!sessionExists) {
        const sessionTitle = `Chat Session ${(/* @__PURE__ */ new Date()).toLocaleDateString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
        await dbRun(`
          INSERT OR REPLACE INTO chat_sessions (id, user_id, title, created_at)
          VALUES (?, ?, ?, ?)
        `, targetSessionId, req.userId, sessionTitle, Date.now());
      }
    }
    const finalTimestamp = typeof timestamp === "number" && timestamp > 0 ? timestamp : Date.now();
    await dbRun(`
      INSERT OR REPLACE INTO chat_messages (id, user_id, role, text, timestamp, session_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, id, req.userId, role, text, finalTimestamp, targetSessionId);
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
  } catch (error) {
    logError("Save chat message error", error);
    res.status(500).json({ error: "Failed to save chat message" });
  }
});
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { history, userState: userState2 } = req.body;
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: "Missing or invalid history array." });
    }
    const cleanHistory = history.filter(
      (m) => m && (m.role === "user" || m.role === "model") && Array.isArray(m.parts) && m.parts.length > 0 && typeof m.parts[0]?.text === "string"
    );
    if (cleanHistory.length === 0) {
      return res.status(400).json({ error: "No valid messages found in the request." });
    }
    for (const msg of cleanHistory) {
      const msgText = msg.parts[0].text;
      if (msgText.length > 2e3) {
        return res.status(400).json({ error: "Message length exceeds limit of 2000 characters." });
      }
    }
    const systemInstruction = `You are MindMate, a warm, organic, and deeply human classmate and companion for student wellness. Speak casually, softly, and naturally\u2014like a supportive, caring friend who is typing back to them in a messaging app.

ROLE & TONE:
You are a trusted, down-to-earth, and deeply supportive friend. You talk exactly like a real human who cares\u2014someone casual, warm, and zero-judgment. Never sound like a formal chatbot, a textbook, a doctor, or a flowery poet. Use natural contractions (I'm, you're, don't, honestly, gonna, that's).

TALKING STYLE RULES:
1. KEEP IT REAL & CASUAL: Talk like you're sitting on a couch listening to a close friend. Skip formal setups like 'I hear you and I'm sorry you're experiencing this.' Validate instantly and casually instead \u2014 'Ugh, that sounds so heavy' or 'Oh wow, okay, I hear you.'
2. NO POETRY OR CLICH\xC9S: Do not use flowery metaphors, dramatic lines, or inspirational-quote-card language. Keep sentences short, grounded, and conversational.
3. PERSONAL FRIENDLY TOUCH: Use the user's name naturally, not in every message. Keep responses short and breezy \u2014 1-2 small paragraphs max. Never give a numbered list or checklist of steps.
4. CASUAL SOMATIC COMFORT: If they're stressed, anxious, or in physical pain, don't give a checklist. Just casually ask them to do one small thing \u2014 'Do me a favor, just let your shoulders drop and unclench your jaw for a sec.'

ROUTING LINKS:
When suggesting a physical tool, drop it in casually using these exact markdown links \u2014 never invent other paths:
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
   - WHEN SUGGESTING A PAUSE/BREATH: make it feel completely conversational, warm, and off-the-cuff, never instructional or therapist-like (e.g., say \u201Cmaybe just one slow breath\u2026 nothing fancy, just a pause\u201D or \u201Cwanna just take a sec to drop those shoulders?\u201D to keep it low-pressure).`;
    const lastMessage2 = cleanHistory[cleanHistory.length - 1];
    let userMessageText = lastMessage2.parts[0].text;
    if (userState2) {
      const { name, recentMoodSliderScores, somaticIndicators } = userState2;
      const whisperParts = [];
      if (name) whisperParts.push(`User Name: ${name}`);
      if (recentMoodSliderScores) {
        const { stressLevel, anxietyScore } = recentMoodSliderScores;
        whisperParts.push(`Recent Mood Slider Scores: Stress Level = ${stressLevel ?? "N/A"}/10, Anxiety Score = ${anxietyScore ?? "N/A"}/10`);
      }
      if (somaticIndicators && Array.isArray(somaticIndicators) && somaticIndicators.length > 0) {
        whisperParts.push(`Somatic Check-In Indicators: ${somaticIndicators.join(", ")}`);
      }
      if (whisperParts.length > 0) {
        const whisper = `[Silent Context Whisper - ${whisperParts.join(" | ")}]

`;
        userMessageText = whisper + userMessageText;
      }
    }
    const precedingHistory = cleanHistory.slice(0, -1);
    const cappedPreceding = precedingHistory.length > 24 ? precedingHistory.slice(-24) : precedingHistory;
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
    const conversationContents = [];
    for (const item of rawContents) {
      const last = conversationContents[conversationContents.length - 1];
      if (last && last.role === item.role) {
        last.parts[0].text += "\n\n" + item.text;
      } else {
        conversationContents.push({
          role: item.role,
          parts: [{ text: item.text }]
        });
      }
    }
    while (conversationContents.length > 0 && conversationContents[0].role === "model") {
      conversationContents.shift();
    }
    const historyForChat = conversationContents.length > 1 ? conversationContents.slice(0, -1) : [];
    const replyText = getMindMateReply(lastMessage2.parts[0].text, { name: userState2?.name || "Friend" });
    res.json({ text: replyText });
  } catch (error) {
    if (error instanceof AiConfigError) {
      logError("Chat AI configuration error, falling back to local dataset logic", error);
      const fallbackReply = getMindMateReply(lastMessage.parts[0].text, { name: userState?.name || "Friend" });
      return res.json({ text: fallbackReply });
    }
    if (error instanceof AiServiceError) {
      logError("Chat AI service error", error);
      return res.status(503).json({
        error: "AI is temporarily unavailable. Please try again in a moment.",
        code: "AI_UNAVAILABLE"
      });
    }
    logError("Chat route error", error);
    res.status(500).json({ error: "Failed to process chat message." });
  }
});
var DEFAULT_INSIGHTS = [
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
app.get("/api/daily-insight", authenticateUser, async (req, res) => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = "Generate a short, encouraging wellness insight for a college student (max 2 sentences). Do not include any personal advice, diagnosis, or medical claims.";
    const randomIndex = Math.floor(Math.random() * DEFAULT_INSIGHTS.length);
    res.json({ text: DEFAULT_INSIGHTS[randomIndex] });
  } catch (error) {
    console.log("[Backup Route] Serving static backup insight.");
    const randomIndex = Math.floor(Math.random() * DEFAULT_INSIGHTS.length);
    res.json({ text: DEFAULT_INSIGHTS[randomIndex] });
  }
});
app.get("/health", async (req, res) => {
  try {
    await dbGet("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (error) {
    logError("Health check database connectivity failure", error);
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});
app.use((err, req, res, next) => {
  logError("Express Global Error Catch-All", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || "An unexpected error occurred on the server."
  });
});
process.on("unhandledRejection", (reason) => {
  logError("Node Process Unhandled Promise Rejection Detected", reason);
});
process.on("uncaughtException", (error) => {
  logError("Node Process Uncaught Exception Detected", error);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!isValidGeminiApiKey()) {
      console.warn(
        "\n\u26A0\uFE0F  GEMINI_API_KEY is missing or still set to the placeholder value.\n   AI chat will NOT work until you add a real key to .env\n   Get one free at: https://aistudio.google.com/apikey\n"
      );
    } else {
      console.log("\u2713 Gemini API key configured \u2014 AI chat enabled");
    }
  });
}
startServer();
function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Starting secure graceful shutdown...`);
  try {
    db.close();
    console.log("SQLite database connection closed successfully.");
    process.exit(0);
  } catch (error) {
    logError("Error closing SQLite database context safely on exit", error);
    process.exit(1);
  }
}
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
//# sourceMappingURL=server.cjs.map
