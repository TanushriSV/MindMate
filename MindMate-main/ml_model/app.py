import os
import re
import random
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -------------------------
# LOAD MODEL
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "model.pkl")
vectorizer_path = os.path.join(BASE_DIR, "vectorizer.pkl")

try:
    clf = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    print("✅ Model and vectorizer loaded successfully!")
except Exception as e:
    print("❌ Error loading model:", str(e))
    clf = None
    vectorizer = None

# -------------------------
# TEXT CLEANING
# -------------------------
def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# -------------------------
# MEMORY
# -------------------------
user_memories = {}

# -------------------------
# NEW HUMAN RESPONSE 🔥
# -------------------------
def generate_human_response(user_input):
    openings = [
        "yeah…",
        "ugh yeah…",
        "damn…",
        "yeah I get that…",
        "honestly…",
    ]

    reactions = [
        "that sounds really exhausting",
        "that sucks honestly",
        "that kind of feeling hits hard",
        "that’s really frustrating",
        "yeah that’s draining"
    ]

    followups = [
        "what’s been going on?",
        "is it everything at once or one thing?",
        "want to talk about it?",
        "what’s been the hardest part?",
        ""
    ]
    print("🔥 USING NEW HUMAN RESPONSE")

    return f"{random.choice(openings)} {random.choice(reactions)}… {random.choice(followups)}"

# -------------------------
# API ROUTE
# -------------------------
@app.route('/predict', methods=['POST'])
def predict():
    print("📩 REQUEST HIT /predict")
    if clf is None or vectorizer is None:
        return jsonify({"error": "Model not loaded properly."}), 500

    data = request.get_json(silent=True)
    if not data or 'message' not in data:
        return jsonify({"error": "Missing 'message' field in request"}), 400

    message = data['message'].strip()
    user_id = data.get('user_id', 'default_user')

    # Empty message
    if not message:
        return jsonify({
            "emotion": "neutral",
            "confidence": 1.0,
            "level": "High",
            "reply": "hey… I’m here whenever you feel like talking"
        })

    # Gibberish check
    if len(message) > 4 and not any(v in message.lower() for v in ['a','e','i','o','u','y']):
        return jsonify({
            "emotion": "neutral",
            "confidence": 1.0,
            "level": "High",
            "reply": "hmm I didn’t really catch that… can you try again?"
        })

    try:
        # Memory
        if user_id not in user_memories:
            user_memories[user_id] = []

        history = user_memories[user_id]

        full_context_msg = " ".join(history) + " " + message if history else message
        cleaned_msg = clean_text(message)

        # Prediction
        features = vectorizer.transform([cleaned_msg])
        prediction = clf.predict(features)[0]
        probs = clf.predict_proba(features)[0]
        confidence = float(max(probs))

        if confidence > 0.75:
            level = "High"
        elif confidence >= 0.5:
            level = "Medium"
        else:
            level = "Low"

        # 🔥 NEW RESPONSE HERE
        reply = generate_human_response(message)

        # Save memory
        history.append(message)
        if len(history) > 5:
            history.pop(0)

        user_memories[user_id] = history

        return jsonify({
            "emotion": prediction,
            "confidence": round(confidence, 2),
            "level": level,
            "reply": reply
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------------
# RUN SERVER
# -------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)