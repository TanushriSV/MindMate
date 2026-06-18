import { describe, it, expect } from 'vitest';
import { computeStreak } from './stats';
import { MoodEntry } from '../types';

describe('computeStreak', () => {
  it('returns 0 for zero entries', () => {
    expect(computeStreak([])).toBe(0);
  });

  it('calculates a 1-day streak if there is an entry today', () => {
    const today = Date.now();
    const entries: MoodEntry[] = [
      {
        id: '1',
        mood: 'happy',
        timestamp: today,
        stressLevel: 2,
        sleepQuality: 'restorative',
        anxietyScore: 0,
        anxietyLevel: 'Low',
        stressIndicators: [],
        note: 'Entry today'
      }
    ];
    expect(computeStreak(entries)).toBe(1);
  });

  it('returns 0 if the streak is broken by a missed day (no entry today or yesterday)', () => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const entries: MoodEntry[] = [
      {
        id: '1',
        mood: 'happy',
        timestamp: threeDaysAgo,
        stressLevel: 2,
        sleepQuality: 'restorative',
        anxietyScore: 0,
        anxietyLevel: 'Low',
        stressIndicators: [],
        note: 'Old entry'
      }
    ];
    expect(computeStreak(entries)).toBe(0);
  });

  it('calculates a correct multi-day streak continuing from today backwards', () => {
    const today = Date.now();
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const dayBefore = Date.now() - 2 * 24 * 60 * 60 * 1000;
    
    const entries: MoodEntry[] = [
      { id: '1', mood: 'happy', timestamp: today, stressLevel: 2, sleepQuality: 'restorative', anxietyScore: 0, anxietyLevel: 'Low', stressIndicators: [], note: '' },
      { id: '2', mood: 'calm', timestamp: yesterday, stressLevel: 3, sleepQuality: 'fair', anxietyScore: 1, anxietyLevel: 'Low', stressIndicators: [], note: '' },
      { id: '3', mood: 'tired', timestamp: dayBefore, stressLevel: 5, sleepQuality: 'restless', anxietyScore: 2, anxietyLevel: 'Low', stressIndicators: [], note: '' }
    ];
    expect(computeStreak(entries)).toBe(3);
  });
});

// Mock/Stub logic representing our server database verification rules for reset-confirm
interface TokenRecord {
  email: string;
  token: string;
  expires_at: number;
}

function validateResetConfirm(
  tokenRecord: TokenRecord | undefined,
  inputToken: string,
  inputEmail: string,
  currentTime = Date.now()
): { valid: boolean; error?: string } {
  if (!inputToken || !inputEmail) {
    return { valid: false, error: "Token and email are required." };
  }

  if (!tokenRecord) {
    return { valid: false, error: "Invalid or expired password reset token." };
  }

  if (tokenRecord.token !== inputToken) {
    return { valid: false, error: "Invalid or expired password reset token." };
  }

  if (currentTime > tokenRecord.expires_at) {
    return { valid: false, error: "Password reset token has expired." };
  }

  const emailNormalizedRecord = tokenRecord.email.toLowerCase().trim();
  const emailNormalizedInput = inputEmail.toLowerCase().trim();
  if (emailNormalizedRecord !== emailNormalizedInput) {
    return { valid: false, error: "User associated with this token not found." };
  }

  return { valid: true };
}

describe('Password Reset Confirmation Unit Tests', () => {
  it('verifies that a valid token + correct email returns success', () => {
    const tokenRecord: TokenRecord = {
      email: 'user@example.com',
      token: 'valid_token_123',
      expires_at: Date.now() + 3600000 // 1 hour in future
    };

    const result = validateResetConfirm(tokenRecord, 'valid_token_123', 'user@example.com');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('verifies that an expired token is rejected', () => {
    const tokenRecord: TokenRecord = {
      email: 'user@example.com',
      token: 'valid_token_123',
      expires_at: Date.now() - 1000 // 1 second in the past
    };

    const result = validateResetConfirm(tokenRecord, 'valid_token_123', 'user@example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Password reset token has expired.");
  });

  it('verifies that a mismatched email is rejected', () => {
    const tokenRecord: TokenRecord = {
      email: 'user@example.com',
      token: 'valid_token_123',
      expires_at: Date.now() + 3600000 // 1 hour in future
    };

    const result = validateResetConfirm(tokenRecord, 'valid_token_123', 'intruder@example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toBe("User associated with this token not found.");
  });
});

