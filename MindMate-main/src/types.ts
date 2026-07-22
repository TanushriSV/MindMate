export enum Screen {
  Splash = 'splash',
  SignIn = 'signIn',
  Home = 'home',
  CheckIn = 'checkIn',
  Chat = 'chat',
  History = 'history',
  Profile = 'profile',
  Breathe = 'breathe',
  Explore = 'explore'
}

export type Mood = 'calm' | 'happy' | 'neutral' | 'sad' | 'stressed' | 'thoughtful' | 'tired' | 'low';

export interface MoodEntry {
  id: string;
  mood: Mood;
  timestamp: number;
  note?: string;
  stressLevel?: number;
  sleepQuality?: 'restorative' | 'fair' | 'restless';
  tags?: string[];
  anxietyScore?: number;
  anxietyLevel?: 'Low' | 'Moderate' | 'High';
  stressIndicators?: string[];
  aiFeedback?: string;
  journalMode?: 'guided' | 'free';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (cb?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
    fbAsyncInit?: () => void;
  }
  const FB: any;

  interface ImportMetaEnv {
    VITE_GOOGLE_CLIENT_ID?: string;
    VITE_FACEBOOK_APP_ID?: string;
    [key: string]: any;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

