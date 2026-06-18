import data from "./mindmateDataset.json";

export interface Category {
    name: string;
    keywords: string[];
    empathy: string;
    guidance: string;
    support: string;
}

export interface Dataset {
    categories: Category[];
}

const typedData = data as unknown as Dataset;

interface User {
    name: string;
}

export function detectEmotion(input: string) {
    console.log("Detecting emotion for input:", JSON.stringify(input));
    input = input.toLowerCase();

    for (const category of typedData.categories) {
        for (const keyword of category.keywords) {
            if (keyword && input.includes(keyword.toLowerCase())) {
                console.log(`Matched category '${category.name}' via keyword '${keyword}'`);
                return category;
            }
        }
    }

    console.log("No category matched.");
    return null;
}

export function getMindMateReply(
    input: string,
    user: User = { name: "Friend" }
): string {
    const category = detectEmotion(input);

    if (category) {
        return `${category.empathy}\n\n${category.guidance}\n\n${category.support}`;
    }

    return "I'm here to help, but I couldn't find the right guidance in my current knowledge base. Please consider reaching out to a trusted person or professional.";
}
