import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, accuracy_score

def train():
    current_dir = os.path.dirname(__file__)
    csv_path = os.path.join(current_dir, 'dataset.csv')
    model_path = os.path.join(current_dir, 'mindmate_model.pkl')

    if not os.path.exists(csv_path):
        print(f"Dataset CSV not found at {csv_path}. Running data preparation first...")
        from data_prep import prepare_dataset
        prepare_dataset()

    # Load dataset
    df = pd.read_csv(csv_path)
    print(f"Loaded dataset with {len(df)} records.")

    X = df['text']
    y = df['label']

    # Split dataset into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Convert text to TF-IDF features
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english', min_df=2)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    # Train Multinomial Naive Bayes classifier
    clf = MultinomialNB(alpha=0.5)
    clf.fit(X_train_tfidf, y_train)

    # Evaluate the model
    y_pred = clf.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nModel Evaluation:")
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Save model and vectorizer together
    model_data = {
        'vectorizer': vectorizer,
        'model': clf
    }
    joblib.dump(model_data, model_path)
    print(f"Successfully saved trained model and vectorizer to {model_path}")

    # Test sample predictions
    test_sentences = [
        "I have an exam tomorrow and I haven't studied anything, I'm so stressed",
        "I feel so lonely and empty, nobody is talking to me",
        "I can't get myself to start working, I'm just procrastinating",
        "My heart is beating so fast and my chest is tight"
    ]
    print("\nSample Predictions:")
    for sentence in test_sentences:
        tfidf = vectorizer.transform([sentence])
        pred = clf.predict(tfidf)[0]
        print(f"Text: '{sentence}' -> Predicted Emotion: {pred}")

if __name__ == "__main__":
    train()
