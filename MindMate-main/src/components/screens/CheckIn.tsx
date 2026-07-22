import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Mood, MoodEntry } from '../../types';

// Import extracted step views
import StepMood from './checkin/StepMood';
import StepIndicators from './checkin/StepIndicators';
import StepAnxiety from './checkin/StepAnxiety';
import StepStress from './checkin/StepStress';
import StepSleep from './checkin/StepSleep';
import StepResults from './checkin/StepResults';

interface CheckInProps {
  onComplete: (entry: Partial<MoodEntry>) => void;
  onCancel: () => void;
  onNavigateToChat: () => void; // Standard callback for safety redirection
}

export default function CheckIn({ onComplete, onCancel, onNavigateToChat }: CheckInProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    mood: 'calm' as Mood,
    stressLevel: 4,
    sleepQuality: 'fair' as 'restorative' | 'fair' | 'restless',
    stressIndicators: [] as string[],
    anxietyWorry: 1, // 0-3 scale
    anxietyRelax: 1, // 0-3 scale
    note: ''
  });

  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const handleNext = () => {
    setStep(prev => {
      if (prev < 6) return prev + 1;
      return prev;
    });
  };

  const handleBack = () => {
    let shouldCancel = false;
    setStep(prev => {
      if (prev > 1) return prev - 1;
      shouldCancel = true;
      return prev;
    });
    if (shouldCancel) {
      onCancel();
    }
  };

  // Keyboard navigation support - binds once and handles text areas safely
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (stepRef.current < 6) {
          handleNext();
        }
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const calculatedAnxietyScore = data.anxietyWorry + data.anxietyRelax;
  
  let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  if (calculatedAnxietyScore >= 5 || data.stressLevel >= 8) {
    riskLevel = 'High';
  } else if (calculatedAnxietyScore >= 3 || data.stressLevel >= 5) {
    riskLevel = 'Moderate';
  }

  const handleFinish = () => {
    const finalEntry: Partial<MoodEntry> = {
      mood: data.mood,
      stressLevel: data.stressLevel,
      sleepQuality: data.sleepQuality,
      note: data.note,
      anxietyScore: calculatedAnxietyScore,
      anxietyLevel: riskLevel,
      stressIndicators: data.stressIndicators,
      tags: [
        `#${data.mood}`,
        `#Anxiety-${riskLevel}`,
        ...data.stressIndicators.map(id => `#${id.replace('_', '')}`)
      ]
    };
    onComplete(finalEntry);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 relative">
      {/* Back button and progress header */}
      <div className="flex justify-between items-center mb-8 w-full select-none">
        <button 
          onClick={step === 1 ? onCancel : handleBack}
          aria-label="Go to previous step"
          className="flex items-center gap-1.5 text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ChevronLeft size={16} />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 6 && (
          <div className="flex items-center gap-3">
            {step >= 2 && (
              <button
                onClick={handleFinish}
                className="text-xs font-bold text-on-surface-variant border border-outline-variant/30 px-3 py-1 rounded-full cursor-pointer hover:bg-surface-container-low transition-all"
              >
                Save & exit
              </button>
            )}
            <div className="flex items-center gap-1.5 bg-surface-container-high px-4 py-1.5 rounded-full text-xs font-bold text-primary border border-outline-variant/30">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Step {step} of 5
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <StepMood 
            currentMood={data.mood} 
            onChange={(mood) => setData(prev => ({ ...prev, mood }))} 
          />
        )}
        
        {step === 2 && (
          <StepIndicators 
            selectedIndicators={data.stressIndicators} 
            onChange={(stressIndicators) => setData(prev => ({ ...prev, stressIndicators }))} 
          />
        )}

        {step === 3 && (
          <StepAnxiety
            anxietyWorry={data.anxietyWorry}
            anxietyRelax={data.anxietyRelax}
            onChange={(anxietyWorry, anxietyRelax) => setData(prev => ({ ...prev, anxietyWorry, anxietyRelax }))}
          />
        )}

        {step === 4 && (
          <StepStress
            stressLevel={data.stressLevel}
            onChange={(stressLevel) => setData(prev => ({ ...prev, stressLevel }))}
          />
        )}

        {step === 5 && (
          <StepSleep
            sleepQuality={data.sleepQuality}
            note={data.note}
            onSleepChange={(sleepQuality) => setData(prev => ({ ...prev, sleepQuality }))}
            onNoteChange={(note) => setData(prev => ({ ...prev, note }))}
          />
        )}

        {step === 6 && (
          <StepResults
            mood={data.mood}
            stressLevel={data.stressLevel}
            sleepQuality={data.sleepQuality}
            stressIndicators={data.stressIndicators}
            calculatedAnxietyScore={calculatedAnxietyScore}
            riskLevel={riskLevel}
            note={data.note}
            onNavigateToChat={onNavigateToChat}
          />
        )}

        {/* Navigation bottom bar */}
        <div className="flex justify-center pt-8 select-none">
          {step < 5 ? (
            <button 
              onClick={handleNext}
              className="group flex items-center gap-2 bg-primary text-white font-bold px-12 py-4 rounded-2xl shadow-md hover:scale-102 active:scale-98 transition-all duration-300 cursor-pointer text-sm"
            >
              Continue Check-in
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : step === 5 ? (
            <button 
              onClick={() => setStep(6)}
              className="group flex items-center gap-2 bg-primary text-white font-bold px-12 py-4 rounded-2xl shadow-md hover:scale-102 active:scale-98 transition-all duration-300 cursor-pointer text-sm"
            >
              Generate Life Evaluation
              <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            </button>
          ) : (
            <button 
              onClick={handleFinish}
              className="group flex items-center gap-2 bg-primary text-white font-bold px-12 py-4 rounded-2xl shadow-md hover:scale-102 active:scale-98 transition-all duration-300 cursor-pointer text-sm"
            >
              Save to Sanctuary History
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
