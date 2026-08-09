import pg from 'pg';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const sqliteDbPath = process.env.DATABASE_PATH || './mindmate.db';
const pgConnectionString = process.env.DATABASE_URL;

if (!pgConnectionString) {
  console.error("Error: DATABASE_URL environment variable is missing.");
  process.exit(1);
}

console.log(`Connecting to SQLite at: ${sqliteDbPath}`);
const sqliteDb = new Database(sqliteDbPath, { readonly: true });

console.log(`Connecting to PostgreSQL...`);
const pgClient = new pg.Client({
  connectionString: pgConnectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  await pgClient.connect();
  console.log("Connected to PostgreSQL successfully.");

  try {
    // 1. Migrate users
    console.log("Migrating 'users' table...");
    const users = sqliteDb.prepare("SELECT * FROM users").all();
    for (const u of users) {
      await pgClient.query(
        `INSERT INTO users (id, email, password_hash, name, avatar, join_date) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.email, u.password_hash, u.name, u.avatar, u.join_date]
      );
    }
    console.log(`Migrated ${users.length} users.`);

    // 2. Migrate mood_entries
    console.log("Migrating 'mood_entries' table...");
    const moodEntries = sqliteDb.prepare("SELECT * FROM mood_entries").all();
    for (const m of moodEntries) {
      await pgClient.query(
        `INSERT INTO mood_entries (id, user_id, mood, timestamp, stress_level, sleep_quality, anxiety_score, anxiety_level, stress_indicators, note) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         ON CONFLICT (id) DO NOTHING`,
        [m.id, m.user_id, m.mood, m.timestamp, m.stress_level, m.sleep_quality, m.anxiety_score, m.anxiety_level, m.stress_indicators, m.note]
      );
    }
    console.log(`Migrated ${moodEntries.length} mood entries.`);

    // 3. Migrate chat_sessions
    console.log("Migrating 'chat_sessions' table...");
    const chatSessions = sqliteDb.prepare("SELECT * FROM chat_sessions").all();
    for (const s of chatSessions) {
      await pgClient.query(
        `INSERT INTO chat_sessions (id, user_id, title, created_at) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.user_id, s.title, s.created_at]
      );
    }
    console.log(`Migrated ${chatSessions.length} chat sessions.`);

    // 4. Migrate chat_messages
    console.log("Migrating 'chat_messages' table...");
    const chatMessages = sqliteDb.prepare("SELECT * FROM chat_messages").all();
    for (const msg of chatMessages) {
      await pgClient.query(
        `INSERT INTO chat_messages (id, user_id, role, text, timestamp, session_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (id) DO NOTHING`,
        [msg.id, msg.user_id, msg.role, msg.text, msg.timestamp, msg.session_id]
      );
    }
    console.log(`Migrated ${chatMessages.length} chat messages.`);

    // 5. Migrate reset_tokens
    console.log("Migrating 'reset_tokens' table...");
    const resetTokens = sqliteDb.prepare("SELECT * FROM reset_tokens").all();
    for (const t of resetTokens) {
      await pgClient.query(
        `INSERT INTO reset_tokens (id, email, token, expires_at) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (id) DO NOTHING`,
        [t.id, t.email, t.token, t.expires_at]
      );
    }
    console.log(`Migrated ${resetTokens.length} reset tokens.`);

    // 6. Migrate user_streaks
    console.log("Migrating 'user_streaks' table...");
    const userStreaks = sqliteDb.prepare("SELECT * FROM user_streaks").all();
    for (const s of userStreaks) {
      await pgClient.query(
        `INSERT INTO user_streaks (user_id, last_checkin_date, streak_count) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (user_id) DO NOTHING`,
        [s.user_id, s.last_checkin_date, s.streak_count]
      );
    }
    console.log(`Migrated ${userStreaks.length} user streaks.`);

    // 7. Migrate emotion_logs
    console.log("Migrating 'emotion_logs' table...");
    const emotionLogs = sqliteDb.prepare("SELECT * FROM emotion_logs").all();
    for (const l of emotionLogs) {
      await pgClient.query(
        `INSERT INTO emotion_logs (id, user_id, emotion, confidence, created_at) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (id) DO NOTHING`,
        [l.id, l.user_id, l.emotion, l.confidence, l.created_at]
      );
    }
    console.log(`Migrated ${emotionLogs.length} emotion logs.`);

    // 8. Migrate feedback
    console.log("Checking if 'feedback' table exists in SQLite...");
    const tableCheck = sqliteDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='feedback'").get();
    if (!tableCheck) {
      console.log("SQLite feedback table not found; skipping feedback migration.");
    } else {
      console.log("Migrating 'feedback' table...");
      const feedbacks = sqliteDb.prepare("SELECT * FROM feedback").all();
      for (const f of feedbacks) {
        await pgClient.query(
          `INSERT INTO feedback (id, user_id, rating, review, created_at) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (id) DO NOTHING`,
          [f.id, f.user_id, f.rating, f.review, f.created_at]
        );
      }
      console.log(`Migrated ${feedbacks.length} feedback items.`);
    }

    console.log("Data migration successfully completed!");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    sqliteDb.close();
    await pgClient.end();
  }
}

runMigration();
