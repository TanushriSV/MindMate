import os
import re
import csv
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def clean_text(text):
    # Lowercase
    text = text.lower()
    # Remove punctuation
    text = re.sub(r'[^\w\s]', '', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def prepare_and_train():
    current_dir = os.path.dirname(__file__)
    model_path = os.path.join(current_dir, 'model.pkl')
    vec_path = os.path.join(current_dir, 'vectorizer.pkl')

    # Define 100-150 realistic examples per category
    data_dict = {
        'stress': [
            "I'm feeling so pressured right now", "I can't cope with the stress",
            "This workload is killing me", "My mind is running at a million miles per hour with worry",
            "I have too many responsibilities", "I feel like I'm going to drop from exhaustion",
            "There is too much noise and pressure around me", "I can't take this tension anymore",
            "I'm drowning in deadlines", "I have too many exams and projects to handle",
            "I feel like breaking down under pressure", "I can't manage this load",
            "My body feels completely tight from stress", "I'm stressed out by studies",
            "I have so much work and so little time", "I feel overwhelmed by life",
            "Everything is just piling up on me", "I feel suffocated by my workload",
            "I can't handle all these expectations", "I am completely burned out",
            "I feel so tense and overloaded", "I am losing my mind over work",
            "I feel completely stressed", "My head is throbbing with stress",
            "I can't find a moment to breathe", "I feel like I am under a mountain of pressure",
            "This study load is too high", "My parents expect too much and it's stressful",
            "I'm constantly worried about tasks", "I feel overwhelmed by my chores and duties",
            "I am in a constant state of pressure", "I can't stop stressing over everything",
            "I feel overloaded with college work", "I'm stressed about my upcoming projects",
            "I am feeling heavily burdened", "My stress levels are through the roof",
            "I am feeling very tense and pressured", "I am struggling to keep up with college assignments",
            "My stress is getting out of hand", "I feel mentally crushed by expectations",
            "I feel like crying due to stress", "I can't relax my mind",
            "I'm experiencing intense pressure", "I feel overwhelmed by constant demands",
            "This is too stressful for me", "I have so many assignments due tomorrow",
            "I'm struggling under the pressure", "I feel so stressed and tired",
            "Everything feels like a chore", "I feel suffocated by study pressure",
            "I'm carrying too much weight on my shoulders", "My life is so stressful",
            "I feel stressed out of my mind", "I can't deal with this pressure anymore",
            "I feel like screaming because of stress", "I feel completely overwhelmed and helpless",
            "I'm constantly running out of time", "My schedule is packed and stressful",
            "I feel so much pressure to succeed", "I'm stressed about my grades",
            "This academic pressure is too heavy", "I feel like I have no control over my workload",
            "I am stressed to the maximum", "I feel so overwhelmed by my classes",
            "I'm feeling the heat from exams", "I feel completely overloaded and stressed",
            "The stress is making me sick", "I can't sleep because of stress",
            "I am constantly anxious and stressed", "I'm feeling under pressure",
            "My brain is fried from work", "I'm struggling to balance everything",
            "I feel like I'm on a treadmill that won't stop", "I am totally overwhelmed by pressure",
            "This is just too much stress", "I feel so pressured to perform well",
            "I am feeling extremely stressed out", "I'm losing sleep over my work",
            "I feel like I'm suffocating under stress", "My heart is racing from stress",
            "I feel so overwhelmed with homework", "I am stressed about my future career",
            "I have way too much studying to do", "I'm completely exhausted from school",
            "I can't handle this academic stress", "I feel under pressure all day",
            "The workload is way too heavy", "I am constantly stressed about deadlines",
            "I don't know how to handle this pressure", "I am stressed and tired",
            "My classes are so stressful", "I feel overwhelmed by responsibilities"
        ],
        'anxiety': [
            "I feel like something terrible is going to happen", "My chest is tight and I can't breathe well",
            "I am panicking for no reason", "I feel a constant sense of dread",
            "My heart is racing so fast", "I feel extremely restless and uneasy",
            "I can't sit still, I feel so nervous", "I feel on edge all the time",
            "I'm worried about everything", "I feel a knot in my stomach",
            "My mind is constantly filled with worst-case scenarios", "I feel so anxious and scared",
            "I'm terrified of making mistakes", "I feel uneasy and unsafe",
            "I'm trembling and shaking from nervousness", "I can't quiet my thoughts",
            "I feel like I'm going crazy with worry", "I feel panicked and worried",
            "I am constantly tense and jittery", "I'm having a panic attack",
            "I'm scared of what might happen next", "I feel anxious about the future",
            "My body feels tense with anxiety", "I'm constantly overthinking and panicking",
            "I feel a sudden wave of panic", "I'm scared of failing my exams",
            "I feel uneasy in social situations", "My hands are sweaty and my heart is beating fast",
            "I feel like I am losing control", "I feel extremely anxious right now",
            "I have constant nervous energy", "I feel worried and tense",
            "I'm afraid of the worst outcome", "I can't calm my racing heart",
            "I feel so nervous I might throw up", "I feel a deep sense of panic",
            "I'm constantly worried about tomorrow", "I feel uneasy and restless inside",
            "I can't relax my body", "I'm filled with nervous tension",
            "I feel like I'm in danger", "My anxiety is taking over",
            "I feel scared for no apparent reason", "I can't stop worrying about small things",
            "I'm feeling very anxious today", "My mind won't stop racing",
            "I feel on edge and nervous", "I feel panic rising in me",
            "I am constantly anxious about what people think", "I feel like I'm walking on eggshells",
            "I have this nervous feeling in my gut", "I feel anxious all the time",
            "I am having trouble breathing because of anxiety", "I'm constantly filled with fear",
            "I feel like I'm going to collapse from panic", "I feel restless and tense",
            "I'm worried I won't succeed", "I feel uneasy about everything",
            "I feel a wave of nervousness", "I'm terrified of the future",
            "My heart rate is high from nervousness", "I feel anxious and paranoid",
            "I feel so tense and worried", "I am constantly stressed and anxious",
            "I feel a deep sense of unease", "I'm struggling to control my anxiety",
            "I feel a persistent sense of worry", "I feel scared and anxious",
            "I feel panicked about my life", "I'm having racing thoughts",
            "I feel so anxious and overwhelmed", "I feel like I'm on the verge of panic",
            "I can't shake this anxious feeling", "I feel uneasy in my own skin",
            "I feel a sense of impending doom", "I am constantly worried about what's next",
            "I feel anxious and exhausted", "I feel a knot of anxiety in my chest",
            "I'm nervous about everything today", "I feel so anxious and helpless",
            "My hands are shaking from anxiety", "I have constant anxiety",
            "I feel anxious about talking to people", "I get panic attacks randomly",
            "I'm always nervous and uneasy", "I'm scared of the future",
            "I feel so anxious about my performance", "My thoughts won't stop racing",
            "I feel so nervous and scared", "I feel a constant panic inside"
        ],
        'sadness': [
            "I feel so down and unhappy", "I feel like crying all the time",
            "I feel a deep emptiness inside", "Everything feels so gloomy and hopeless",
            "I feel blue and miserable today", "I feel heartbroken and sad",
            "I've been crying my eyes out", "I feel so lonely and sad",
            "I'm not feeling okay at all", "I feel really low and heavy",
            "I feel like I'm in a dark hole", "Everything is sad and grey",
            "I feel completely depressed and low", "I feel so sad and broken",
            "I'm struggling to find joy in anything", "I feel so sad and empty",
            "I feel like nothing goes right", "I am feeling very down today",
            "I feel unhappy with myself", "I feel so sad and miserable",
            "I feel like crying for no reason", "I feel low and lonely",
            "I feel a deep sadness in my heart", "I feel so sad and exhausted",
            "I'm not happy with my life", "I feel down and out",
            "I feel like a cloud is hanging over me", "I feel empty and lonely",
            "I am feeling really blue", "I feel sad about the past",
            "I feel so sad and discouraged", "I feel like giving up because I'm so sad",
            "I feel sad and rejected", "I feel low and hopeless",
            "I feel so sad and isolated", "I'm crying because of how I feel",
            "I feel sad and empty inside", "I feel like nobody cares",
            "I feel so sad and disappointed", "I'm not in a good place mentally",
            "I feel really sad and tired", "I feel like crying myself to sleep",
            "I feel a deep sense of sadness", "I am feeling so sad and lost",
            "I feel unhappy and disconnected", "I feel down in the dumps",
            "I feel so sad and unmotivated", "I'm feeling very sad today",
            "I feel a heavy sadness", "I feel sad and alone",
            "I feel so down and broken inside", "I'm struggling with sadness",
            "I feel sad and overwhelmed", "I feel a constant sadness",
            "I feel so sad and miserable right now", "I feel unhappy and lonely",
            "I feel sad about my life", "I feel so down and empty",
            "I feel like crying all day", "I feel a deep sadness",
            "I feel so sad and hopeless today", "I'm feeling very down",
            "I feel sad and hurt", "I feel unhappy and exhausted",
            "I feel so sad and useless", "I feel a sense of sadness",
            "I feel sad and discouraged about everything", "I'm feeling down",
            "I feel so sad and broken-hearted", "I feel unhappy with everything",
            "I feel sad and empty inside my chest", "I feel so down and blue",
            "I feel like crying right now", "I feel a heavy weight of sadness",
            "I feel sad and disconnected from everyone", "I'm feeling so sad",
            "I feel unhappy and disappointed with myself", "I feel sad and tired of everything",
            "I feel so sad and helpless", "I feel a wave of sadness",
            "I'm crying because I'm sad", "I feel really down",
            "I feel heartbroken and empty", "Everything feels hopeless",
            "I'm feeling very blue today", "I feel so lonely and blue",
            "I just want to cry", "I feel so down and miserable"
        ],
        'happiness': [
            "I am really happy today", "I feel wonderful and joyful",
            "Today is a great day", "I'm so excited about this",
            "I feel amazing and cheerful", "Everything is going perfectly",
            "I'm in a fantastic mood", "I feel so happy and content",
            "This makes me smile so much", "I'm having a beautiful day",
            "I feel so blessed and happy", "I am absolutely thrilled",
            "I'm feeling very positive today", "Life is wonderful right now",
            "I feel so lucky and happy", "I'm so glad things worked out",
            "This is the best feeling ever", "I feel joyful and light",
            "I'm laughing and having fun", "I am so happy with my progress",
            "I feel content and peaceful", "I'm in such a good mood today",
            "I am so proud of myself", "Everything feels bright and happy",
            "I'm feeling great and optimistic", "I am so happy to hear that",
            "I feel happy and energized", "This is so exciting and joyful",
            "I'm smiling from ear to ear", "I feel so happy inside",
            "I am extremely happy today", "Everything is working in my favor",
            "I feel so satisfied and happy", "I am feeling joyful today",
            "This is a wonderful moment", "I'm so happy and grateful",
            "I feel lighthearted and happy", "I am in high spirits",
            "I'm so glad to be here", "I feel fantastic and happy",
            "I'm happy about my grades", "I feel cheerful and bright",
            "This is such a happy day", "I'm so happy with my life",
            "I feel joyful and happy", "I am feeling wonderful",
            "Everything is going so well", "I'm so happy right now",
            "I feel great about my future", "I'm smiling and happy",
            "This is a joyful day", "I feel so happy and alive",
            "I'm having a great time", "I feel very happy and relaxed",
            "This news makes me so happy", "I'm content and happy",
            "I feel absolutely amazing", "I am so happy and excited",
            "Everything is perfect today", "I feel joyful",
            "I'm in a great mood", "I am so happy",
            "I feel very cheerful", "I am happy with how things are",
            "This is a beautiful moment", "I feel so happy and cheerful",
            "I am having a wonderful day", "I feel cheerful",
            "I'm so happy about my progress", "I feel so joyful",
            "I am smiling today", "I feel happy and content",
            "This is fantastic news", "I am in a very happy mood",
            "Everything feels great", "I feel absolutely happy",
            "I'm so glad about this", "I feel cheerful and happy",
            "This is the happiest day", "I feel so good and happy",
            "I am feeling very happy", "I'm so happy to be alive"
        ],
        'neutral': [
            "I am sitting at my desk", "I'm just doing my homework",
            "Today is just a normal day", "I don't feel anything in particular",
            "I'm reading a book right now", "I have a class at 2 PM",
            "I am walking to the library", "I'm eating lunch now",
            "Everything is okay, just standard", "I am writing some code",
            "I have to clean my room today", "I'm listening to a podcast",
            "I just woke up a while ago", "I'm going to buy groceries",
            "I am attending a lecture", "I'm cooking dinner tonight",
            "I don't have any specific plans", "I am waiting for the bus",
            "I'm sitting on the couch", "I have some chores to do",
            "I am working on my project", "I'm watching a documentary",
            "I just finished my class", "I am drinking water",
            "I have a meeting tomorrow morning", "I'm typing on my laptop",
            "I am walking in the park", "I'm just sitting here",
            "Today is a regular Wednesday", "I am planning my schedule",
            "I have an assignment due next week", "I'm packing my bag",
            "I am checking my email", "I'm just doing some light reading",
            "I don't feel happy or sad", "I'm in a neutral state",
            "I am washing the dishes", "I'm going to the store",
            "I have some homework to finish", "I'm just taking a walk",
            "Today is a typical day", "I am sitting quietly",
            "I'm just browsing the web", "I am writing a list",
            "I have to wake up early tomorrow", "I'm just listening to music",
            "I don't have any strong feelings", "I am preparing my meals",
            "I'm just doing some work", "I am studying in the library",
            "I have a class in ten minutes", "I'm sitting by the window",
            "Today is an ordinary day", "I am updating my calendar",
            "I have to call my friend later", "I'm just writing notes",
            "I don't feel much today", "I am sorting my papers",
            "I'm just going about my day", "I am walking home",
            "I have a test next month", "I'm just drinking tea",
            "I am sitting in a cafe", "I'm just relaxing a bit",
            "Today is a plain day", "I am typing a document",
            "I have some tasks to complete", "I'm just waiting here",
            "I don't feel any emotion right now", "I am arranging my books",
            "I'm just doing standard stuff", "I am checking the time",
            "I have a class online", "I'm just looking around",
            "Today is a quiet day", "I am writing in my notebook",
            "I don't feel stressed or happy", "I am preparing for bed",
            "I'm just taking it easy", "I am sitting down"
        ]
    }

    # Format training dataset and write to CSV
    csv_path = os.path.join(current_dir, 'dataset.csv')
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['text', 'label'])
        for label, sentences in data_dict.items():
            for text in sentences:
                cleaned = clean_text(text)
                writer.writerow([cleaned, label])

    # Load dataset
    df = pd.read_csv(csv_path)
    print(f"Dataset generated at {csv_path} with {len(df)} records.")

    # Split dataset (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        df['text'], df['label'], test_size=0.2, random_state=42, stratify=df['label']
    )

    # NLP Pipeline: TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english', min_df=2)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    # NLP Pipeline: Logistic Regression
    clf = LogisticRegression(C=1.5, max_iter=200, random_state=42)
    clf.fit(X_train_tfidf, y_train)

    # Evaluate
    y_pred = clf.predict(X_test_tfidf)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nModel Performance Evaluation:")
    print(f"Accuracy: {acc:.4f} (Target: >75%)")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Save artifacts separately
    joblib.dump(clf, model_path)
    joblib.dump(vectorizer, vec_path)
    print(f"Saved model to {model_path} and vectorizer to {vec_path}")

    # Test sample predictions
    test_sentences = [
        "I feel stressed",
        "I am very happy",
        "I feel anxious about exams"
    ]
    print("\nInference Verification:")
    for sen in test_sentences:
        cleaned = clean_text(sen)
        features = vectorizer.transform([cleaned])
        pred = clf.predict(features)[0]
        prob = clf.predict_proba(features)[0]
        confidence = float(max(prob))
        print(f"Text: '{sen}' -> Predicted: {pred} (Confidence: {confidence:.2f})")

if __name__ == "__main__":
    prepare_and_train()
