import { useState, useEffect } from 'react';
import * as aiService from '../services/geminiService';
import { useUser } from '../context/UserContext';

export function useDailyInsight() {
  const [dailyInsight, setDailyInsight] = useState<string>('Breathe deep. Today is a new opportunity for peace.');
  const { user, hydrated: userHydrated } = useUser();

  useEffect(() => {
    if (!user || !userHydrated) return;
    
    const fetchInsight = async () => {
      try {
        const cached = localStorage.getItem('mindmate_daily_insight');
        const cachedTime = localStorage.getItem('mindmate_daily_insight_time');
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        
        if (cached && cachedTime && Date.now() - parseInt(cachedTime) < ONE_DAY_MS) {
          setDailyInsight(cached);
          return;
        }

        const insight = await aiService.getDailyInsight();
        if (insight) {
          setDailyInsight(insight);
          localStorage.setItem('mindmate_daily_insight', insight);
          localStorage.setItem('mindmate_daily_insight_time', Date.now().toString());
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        if (errMsg.includes('Unauthorized') || errMsg.includes('expired') || errMsg.includes('exists') || errMsg.includes('401')) {
          console.warn('Silent authorization handles stale session:', errMsg);
        } else {
          console.error('Failed to fetch wellness insight:', err);
        }
      }
    };

    fetchInsight();
  }, [user?.id, userHydrated]);

  return dailyInsight;
}
