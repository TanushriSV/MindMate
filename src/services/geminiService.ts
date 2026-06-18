import { MoodEntry, ChatMessage } from '../types';

function getAuthToken(): string | null {
  try {
    const userStr = localStorage.getItem('mindmate_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.token || null;
    }
  } catch (e) {
    console.warn("Failed to retrieve session token:", e);
  }
  return null;
}

async function handleResponse(response: Response, fallbackMsg: string) {
  if (!response.ok) {
    let errorMessage = response.statusText;
    let errorCode: string | undefined;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.error) {
        errorMessage = errorJson.error;
      }
      if (errorJson && errorJson.code) {
        errorCode = errorJson.code;
      }
    } catch (e) {}

    if (response.status === 401) {
      try {
        localStorage.removeItem('mindmate_user');
      } catch (e) {}
      // Force reload to completely clear any stale React tree state and trigger the redirect to Splash/SignIn cleanly
      window.location.reload();
    }

    const err = new Error(`${fallbackMsg}: ${errorMessage || response.status || 'unknown'}`) as Error & { code?: string };
    if (errorCode) err.code = errorCode;
    throw err;
  }
  return response.json();
}

export async function sendMessage(
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  userState?: {
    name?: string;
    recentMoodSliderScores?: {
      stressLevel: number | null;
      anxietyScore: number | null;
    };
    somaticIndicators?: string[];
  }
) {
  const token = getAuthToken();
  const maxRetries = 1;
  let finalErr: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ history, userState })
      });
      
      const data = await handleResponse(response, "Failed to send message");
      return data.text;
    } catch (err: any) {
      console.warn(`[API Attempt ${attempt + 1}] Send message failed:`, err);
      finalErr = err;
      if (attempt < maxRetries) {
        // Backoff delay of 1000ms before retrying the call once
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  throw finalErr;
}

export async function getDailyInsight() {
  const token = getAuthToken();
  const response = await fetch("/api/daily-insight", {
    method: "GET",
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });
  
  const data = await handleResponse(response, "Failed to fetch daily insight");
  return data.text;
}

// Save mood entry
export async function saveEntry(entry: MoodEntry) {
  const token = getAuthToken();
  const response = await fetch("/api/entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    },
    body: JSON.stringify(entry)
  });

  return await handleResponse(response, "Failed to save mood entry");
}

// Fetch all mood entries
export async function fetchEntries(): Promise<MoodEntry[]> {
  const token = getAuthToken();
  const response = await fetch("/api/entries", {
    method: "GET",
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });

  return await handleResponse(response, "Failed to fetch mood entries");
}

// Delete a single mood entry
export async function deleteEntry(id: string) {
  const token = getAuthToken();
  const response = await fetch(`/api/entries/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });

  return await handleResponse(response, "Failed to delete mood entry");
}

// Delete all user mood entries
export async function deleteAllEntries() {
  const token = getAuthToken();
  const response = await fetch("/api/entries/all", {
    method: "DELETE",
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });

  return await handleResponse(response, "Failed to clear mood entries");
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: number;
}

export interface ChatHistoryResponse {
  sessionId: string;
  messages: ChatMessage[];
}

// Fetch chat sessions
export async function listChatSessions(): Promise<ChatSession[]> {
  const token = getAuthToken();
  const response = await fetch("/api/chat/sessions", {
    method: "GET",
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });

  return await handleResponse(response, "Failed to list chat sessions");
}

// Create chat session
export async function createChatSession(title?: string): Promise<ChatSession> {
  const token = getAuthToken();
  const response = await fetch("/api/chat/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ title })
  });

  return await handleResponse(response, "Failed to create chat session");
}

// Update chat session title
export async function updateChatSessionTitle(id: string, title: string): Promise<{ success: boolean }> {
  const token = getAuthToken();
  const response = await fetch(`/api/chat/sessions/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ title })
  });

  return await handleResponse(response, "Failed to update chat session title");
}

// Delete chat session
export async function deleteChatSession(id: string): Promise<{ success: boolean }> {
  const token = getAuthToken();
  const response = await fetch(`/api/chat/sessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });

  return await handleResponse(response, "Failed to delete chat session");
}

// Fetch chat history by session
export async function fetchChatHistory(sessionId?: string): Promise<ChatHistoryResponse> {
  const token = getAuthToken();
  const url = sessionId ? `/api/chat/history?sessionId=${encodeURIComponent(sessionId)}` : "/api/chat/history";
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });

  return await handleResponse(response, "Failed to fetch chat history");
}

// Save a chat message within a session
export async function saveChatMessage(msg: { id: string; role: 'user' | 'model'; text: string; timestamp: number; sessionId?: string }) {
  const token = getAuthToken();
  const response = await fetch("/api/chat/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    },
    body: JSON.stringify(msg)
  });

  return await handleResponse(response, "Failed to save chat message");
}

// Update profile info
export async function updateProfile(name?: string, avatar?: string) {
  const token = getAuthToken();
  const response = await fetch("/api/user/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ name, avatar })
  });

  return await handleResponse(response, "Failed to update profile");
}
