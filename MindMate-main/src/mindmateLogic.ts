import data from "./mindmateDataset.json";

interface Response {
    text: string;
    suggestion: string;
}

interface Intent {
    intent: string;
    patterns: string[];
    responses: Response[];
}

interface Dataset {
    intents: Intent[];
}

const typedData = data as Dataset;

interface User {
    name: string;
}

const KEYWORD_WEIGHTS: Record<string, { intent: string; weight: number }[]> = {
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

const FALLBACK_RESPONSES = [
    "I'm here for you. Can you tell me a little more about what you're going through?",
    "It sounds like something is weighing on you. I'd love to understand better — what's on your mind?",
    "I want to help. Can you share a bit more about how you're feeling?",
    "Sometimes it's hard to put feelings into words. Take your time — I'm listening.",
    "I hear you. What's been going on for you lately?",
];

let lastFallbackIndex = -1;

function getFallback(userName: string): string {
    let index: number;
    do {
        index = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
    } while (index === lastFallbackIndex && FALLBACK_RESPONSES.length > 1);

    lastFallbackIndex = index;
    return FALLBACK_RESPONSES[index];
}

const lastUsedIndex: Record<string, number> = {};

function pickResponse(intent: Intent): Response {
    const responses = intent.responses;
    let index: number;

    do {
        index = Math.floor(Math.random() * responses.length);
    } while (index === lastUsedIndex[intent.intent] && responses.length > 1);

    lastUsedIndex[intent.intent] = index;
    return responses[index];
}

// 🔍 Detect best matching intent
export function detectIntent(input: string): Intent | null {
    const normalizedInput = input.toLowerCase();
    const scores: Record<string, number> = {};
    const intentMap: Record<string, Intent> = {};

    for (const intent of typedData.intents) {
        intentMap[intent.intent] = intent;
        scores[intent.intent] = 0;

        for (const pattern of intent.patterns) {
            const normalizedPattern = pattern.toLowerCase();

            // flexible matching
            if (
                normalizedInput.includes(normalizedPattern) ||
                normalizedPattern.includes(normalizedInput)
            ) {
                scores[intent.intent]++;
            }
        }
    }

    // Apply keyword weights
    for (const [keyword, weights] of Object.entries(KEYWORD_WEIGHTS)) {
        if (normalizedInput.includes(keyword)) {
            for (const weightRule of weights) {
                if (scores[weightRule.intent] !== undefined) {
                    scores[weightRule.intent] += weightRule.weight;
                }
            }
        }
    }

    let bestMatch: Intent | null = null;
    let highestScore = 0;

    for (const [intentName, score] of Object.entries(scores)) {
        if (score > highestScore) {
            highestScore = score;
            bestMatch = intentMap[intentName];
        }
    }

    return bestMatch;
}

// 💬 Generate chatbot reply
export function getMindMateReply(
    input: string,
    user: User = { name: "Friend" }
): string {
    const normalizedInput = input.toLowerCase();

    // 🚨 STEP 1: HARD CRISIS TRIGGER CHECK (FIRST PRIORITY)
    const crisisTriggers = [
        "kill myself",
        "end my life",
        "suicide",
        "want to die",
        "hurt myself"
    ];

    if (crisisTriggers.some(trigger => normalizedInput.includes(trigger))) {
        return `⚠️ I'm really sorry you're feeling this way. You don’t have to go through this alone.\n\n💛 Please try to reach out to someone you trust or a professional right now.\n\nIf you're in immediate danger, please contact local emergency services.`;
    }

    // 🔍 STEP 2: NORMAL INTENT DETECTION
    const intent = detectIntent(normalizedInput);

    if (intent) {
        // 🚨 EXTRA SAFETY: if dataset also detects crisis
        if (intent.intent === "crisis") {
            const response = pickResponse(intent);
            return `⚠️ ${response.text}\n\n💛 ${response.suggestion}\n\nIf you're in immediate danger, please contact local emergency services.`;
        }

        const response = pickResponse(intent);
        return `${response.text}\n\n💡 ${response.suggestion}`;
    }

    // 🟡 FALLBACK
    return getFallback(user.name);
}