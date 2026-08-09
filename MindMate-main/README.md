# MindMate

MindMate is a comprehensive, emotionally intelligent digital wellness companion designed for college students to manage stress, log daily check-ins, track moods, and receive supportive, conversational text reactions in real-time.

---

## Project Overview
MindMate operates as a multi-tier system:
* **Web Frontend / Client**: A modern, interactive React user interface that lets users visualize emotional trends, record check-ins, and chat.
* **Android Client**: A native Kotlin Android application built using Jetpack Compose that communicates with the Express backend via REST APIs.
* **Express Backend**: A robust Node.js API server responsible for authentication, JWT session tracking, AES-256-GCM message/note field encryption at rest, and session histories.
* **Python Flask ML Service**: A separate microservice housing a trained scikit-learn classifier that analyzes the latest user message to detect emotions.

---

## Key Features
* **User Authentication**: Secure sign-up and login with hashed passwords via `bcrypt` and JWT session tracking.
* **Mood Check-ins**: Logging of stress levels, sleep quality, anxiety scores, and check-in notes.
* **Encrypted Chat History**: Instant messaging with MindMate where chat history and check-in notes are encrypted at rest using AES-256-GCM.
* **Emotion Trend Tracking**: Visualization of mood patterns and classification logs.
* **Anonymous User Feedback**: Authenticated users can submit star ratings and reviews, which are stored securely and exposed anonymously for administration.

---

## System Architecture

```mermaid
graph TD
    subgraph Clients
        Android[Native Kotlin Android App]
        Web[React Web Frontend]
    end

    subgraph Backend Services
        NodeAPI[Node.js / Express Backend]
        FlaskML[Python Flask ML API]
    end

    subgraph Storage
        Postgres[(PostgreSQL Database)]
    end

    Android -->|HTTP REST API| NodeAPI
    Web -->|HTTP REST API| NodeAPI
    NodeAPI -->|Raw SQL Query| Postgres
    NodeAPI -->|POST /predict| FlaskML
```

### Emotion Prediction Flow
1. The user sends a text message.
2. The Node.js backend extracts the latest user message and sends it to the Flask ML Service `/predict` endpoint.
3. The ML service predicts the emotion, logs it, and returns the classification confidence.
4. The Node.js backend routes the user message, detected emotion, and conversation history context to OpenRouter (using Gemini) to return a natural, friend-like reaction.

---

## Technology Stack

| Component | Technology Used |
| :--- | :--- |
| **Frontend Web** | React 19, TypeScript, Vite, Recharts, TailwindCSS |
| **Mobile Client** | Android SDK, Kotlin, Jetpack Compose, Retrofit, Coroutines |
| **Server Engine** | Node.js, Express, TypeScript, tsx |
| **Database** | PostgreSQL (`pg` pool client) |
| **Machine Learning** | Python, Flask, scikit-learn, joblib, numpy |
| **Security** | Helmet, CORS, express-rate-limit, bcrypt, Crypto (AES-256-GCM) |

---

## Project Structure
```text
MindMate/
├── MindMate-main/             # Web Frontend & Node.js Backend Workspace
│   ├── src/                   # React web source code (components, screens)
│   ├── ml_model/              # Python Flask ML Service
│   │   ├── app.py             # Flask API server script
│   │   ├── train.py           # Classifier training script
│   │   ├── dataset.csv        # Emotion training dataset
│   │   ├── model.pkl          # Trained model file
│   │   ├── vectorizer.pkl     # Fitted text vectorizer
│   │   └── requirements.txt   # Python deployment dependencies
│   ├── server.ts              # Express API Server
│   ├── migrate.mjs            # SQLite-to-PostgreSQL data migration script
│   ├── package.json           # Node configuration & dependencies
│   ├── .env.example           # Server configuration template
│   └── README.md              # Documentation
└── MindMate-Android/          # Native Android Client (Kotlin / Compose)
```

---

## Database Schema
The database uses PostgreSQL. Below are the key tables defined in `server.ts`:

* **`users`**: User registration records.
  ```sql
  users (
    id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    avatar TEXT,
    join_date BIGINT
  )
  ```
* **`mood_entries`**: Daily check-in log records with encrypted notes.
  ```sql
  mood_entries (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    mood VARCHAR(100),
    timestamp BIGINT,
    stress_level INTEGER,
    sleep_quality VARCHAR(50),
    anxiety_score INTEGER,
    anxiety_level VARCHAR(50),
    stress_indicators TEXT,
    note TEXT
  )
  ```
* **`chat_sessions`**: Conversational session groupings.
* **`chat_messages`**: Chat messages with encrypted text fields.
* **`feedback`**: Star ratings and reviews.

---

## Machine Learning Service
The ML microservice performs text-based sentiment classification.
* **Model**: Logistic Regression / Linear SVM trained on labeled text (`dataset.csv`).
* **Vectorization**: TF-IDF text representation (`vectorizer.pkl`).
* **API Endpoint**: `POST /predict`
  * **Payload**: `{"message": "I feel super stressed about final exams."}`
  * **Response**: `{"emotion": "anxiety", "confidence": 0.88, "level": "High"}`

---

## Environment Variables
Create a server `.env` file inside `MindMate-main/`:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@hostname:port/dbname

# Security Credentials
JWT_SECRET=YOUR_JWT_HMAC_SECRET_KEY
ENCRYPTION_KEY=YOUR_64_HEX_CHARACTERS_AES_KEY

# Third-party Integrations
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_TOKEN

# Deployment Context
FRONTEND_URL=http://localhost:5173
PORT=3000
```

---

## Local Development Setup

### Prerequisites
* Node.js (v18+)
* PostgreSQL
* Python 3.9+

### Backend Setup
1. Install node dependencies:
   ```bash
   npm install
   ```
2. Setup environment keys in `.env`.
3. Start the Node.js API server:
   ```bash
   npm run dev
   ```

### ML Service Setup
1. Navigate to the model folder:
   ```bash
   cd ml_model
   ```
2. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the Flask app:
   ```bash
   python app.py
   ```

### Android Client Configuration
1. Open the `MindMate-Android` directory in Android Studio.
2. Update the target server base URL in `AppContainer.kt`:
   ```kotlin
   private const val BASE_URL = "https://your-deployed-backend-url/"
   ```
3. Run the Gradle build task and start the app on an emulator.

---

## Database Migration (`migrate.mjs`)
To migrate historical data from an existing local SQLite `mindmate.db` file to your new PostgreSQL instance:
1. Configure `DATABASE_URL` and `DATABASE_PATH` in `.env`.
2. Run the migration utility:
   ```bash
   node migrate.mjs
   ```
*Note: If the `feedback` table is not present in the target SQLite file, the script will log a notice and skip that specific table without halting.*

---

## Security Considerations
* **Transport Security**: Deploy with TLS (HTTPS) on cloud servers.
* **Passwords**: Authenticated passwords are never stored in plaintext and are hashed using `bcrypt`.
* **Field-Level Encryption**: Sensitive notes and chat texts are encrypted at rest using AES-256-GCM.
* **SQL Injection**: All operations use parameterized queries.
* **Rate Limiting**: Critical endpoints are protected against brute-force attacks via `express-rate-limit`.

---

## Final Notes
**Disclaimer**: MindMate is a digital wellness journaling and stress tracker app. It is not a replacement for professional psychological care, clinical counseling, therapy, or medical diagnosis.
