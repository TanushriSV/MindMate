import json
import csv
import os

def prepare_dataset():
    dataset_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'mindmateDataset.json')
    output_dir = os.path.dirname(__file__)
    output_csv = os.path.join(output_dir, 'dataset.csv')

    # Load original dataset
    with open(dataset_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Categories we are targeting
    target_categories = {'stress', 'anxiety', 'sadness', 'motivation'}
    extracted_data = {cat: [] for cat in target_categories}

    # Extract existing patterns from json
    for intent in data.get('intents', []):
        cat = intent.get('intent')
        if cat in target_categories:
            extracted_data[cat].extend(intent.get('patterns', []))

    # Supplemental high quality examples to ensure 100 per category
    supplemental = {
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
            "I feel like I'm suffocating under stress"
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
            "I'm nervous about everything today", "I feel so anxious and helpless"
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
            "I feel so sad and helpless", "I feel a wave of sadness"
        ],
        'motivation': [
            "I have absolutely no motivation to study", "I feel so lazy and stuck",
            "I can't get myself to start working", "I keep procrastinating on my projects",
            "I have zero energy to do anything", "I don't feel like working today",
            "I can't focus or get started", "I have no drive to achieve my goals",
            "I feel unproductive and lazy", "I keep delaying my assignments",
            "I lack the will to do anything productive", "I just want to lie in bed all day",
            "I'm finding it impossible to start", "I feel stuck and uninspired",
            "I have no energy to continue studying", "I feel so lazy and unmotivated",
            "I can't bring myself to do my homework", "I keep putting off my tasks",
            "I have no desire to work on anything", "I feel completely unmotivated",
            "I am struggling to get started on my work", "I feel lazy but I need to work",
            "I have no motivation left in me", "I keep wasting time and procrastinating",
            "I feel so stuck and useless", "I can't focus on my studies",
            "I have zero drive to work today", "I feel lazy and uninspired",
            "I can't get myself moving", "I feel stuck in a rut",
            "I have no enthusiasm for my work", "I'm procrastinating on everything",
            "I feel so lazy and unproductive today", "I can't get motivated to study",
            "I keep delaying my preparation", "I have no interest in doing anything",
            "I feel stuck and unable to start", "I am struggling with lack of motivation",
            "I have no energy to do my work", "I feel lazy and tired of studying",
            "I can't start my assignment", "I keep putting off my chores",
            "I have no drive to do anything", "I feel unmotivated and unproductive",
            "I am procrastinating too much", "I can't get myself to study",
            "I feel lazy and disengaged", "I have zero motivation to work on my project",
            "I feel stuck and bored", "I can't focus on anything productive",
            "I have no drive to succeed today", "I keep avoiding my work",
            "I feel so unmotivated and lazy", "I can't get myself to do anything",
            "I feel stuck and uncreative", "I have no interest in studying",
            "I feel lazy and unmotivated to do anything", "I keep delaying my study sessions",
            "I have no motivation to accomplish my goals", "I feel stuck and lazy",
            "I can't get myself to write my essay", "I keep putting off my exam prep",
            "I have zero energy for studies", "I feel unmotivated and tired",
            "I am struggling to find motivation", "I can't get started on my tasks",
            "I feel lazy and unfocused", "I have no drive to get things done",
            "I feel stuck and unmotivated today", "I can't concentrate on my tasks",
            "I keep procrastinating on my work", "I have no energy to start my day",
            "I feel lazy and unproductive right now", "I can't get motivated to do chores",
            "I feel stuck and disengaged", "I have no drive to do homework",
            "I feel unmotivated to study for finals", "I keep putting off my responsibilities",
            "I feel lazy and out of energy", "I have zero motivation to do anything productive"
        ]
    }

    # Merge dataset
    for cat in target_categories:
        extracted_data[cat].extend(supplemental[cat])
        # Remove duplicates while preserving order
        seen = set()
        extracted_data[cat] = [x for x in extracted_data[cat] if not (x in seen or seen.add(x))]

    # Write to CSV
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['text', 'label'])
        for cat in target_categories:
            for text in extracted_data[cat]:
                writer.writerow([text, cat])

    print(f"Data preparation complete! Created {output_csv} with:")
    for cat in target_categories:
        print(f" - {cat}: {len(extracted_data[cat])} examples")

if __name__ == "__main__":
    prepare_dataset()
