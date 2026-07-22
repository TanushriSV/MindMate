import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Play, Square, RefreshCw, Sparkles } from 'lucide-react';

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const phaseDetails: Record<BreathPhase, { text: string; action: string; scale: number; color: string }> = {
  'inhale': { text: 'Inhale deeply...', action: 'Expand your chest and fill your lungs', scale: 1.5, color: 'bg-primary' },
  'hold-in': { text: 'Hold the breath in...', action: 'Suspend and feel the stillness', scale: 1.5, color: 'bg-tertiary' },
  'exhale': { text: 'Exhale slowly...', action: 'Let go of tension and worries', scale: 1.0, color: 'bg-secondary' },
  'hold-out': { text: 'Hold empty...', action: 'Find peace in the void', scale: 1.0, color: 'bg-outline-variant' }
};

export default function Breathe() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Box Breathing cycle progression: Inhale -> Hold -> Exhale -> Hold
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Transition phase
            setPhase(currentPhase => {
              switch (currentPhase) {
                case 'inhale':
                  return 'hold-in';
                case 'hold-in':
                  return 'exhale';
                case 'exhale':
                  return 'hold-out';
                case 'hold-out':
                  // Full cycle completed!
                  setCyclesCompleted(c => {
                    const nextC = c + 1;
                    if (nextC >= 4) {
                      setIsCompleted(true);
                      setIsActive(false);
                    }
                    return nextC;
                  });
                  return 'inhale';
                default:
                  return 'inhale';
              }
            });
            return 4; // Reset to 4 seconds
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isCompleted]);

  const handleStart = () => {
    setIsActive(true);
    setIsCompleted(false);
    setCyclesCompleted(0);
    setPhase('inhale');
    setTimeLeft(4);
  };

  const handleStop = () => {
    setIsActive(false);
    setPhase('inhale');
    setTimeLeft(4);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] max-w-4xl mx-auto w-full px-4 text-center">
      <AnimatePresence mode="wait">
        {!isActive && !isCompleted ? (
          /* Introduction view */
          <motion.div 
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md bg-white rounded-3xl p-8 calm-shadow border border-surface-variant/30 space-y-6"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
              <Wind size={36} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Box Breathing</h2>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest font-mono">Calm the Nervous System</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                A clinically validated tool used by athletes and Navy SEALs to curb stress, drop high heart-rate oscillations, and restore extreme cognitive focus under mental fatigue.
              </p>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl text-left border border-outline-variant/10">
              <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider mb-2">The Four-Step Box Loop:</h4>
              <ul className="text-xs font-semibold text-on-surface-variant space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-sm">🌬️</span>
                  <span><strong>Inhale</strong> deeply for 4 seconds</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sm">⏳</span>
                  <span><strong>Hold</strong> block full for 4 seconds</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sm">💨</span>
                  <span><strong>Exhale</strong> slowly for 4 seconds</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sm">⏸️</span>
                  <span><strong>Hold</strong> block empty for 4 seconds</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={handleStart}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={18} fill="white" /> Start 4 Cycles (approx. 1 min)
            </button>
          </motion.div>
        ) : isCompleted ? (
          /* Completion feedback view */
          <motion.div 
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md bg-white rounded-3xl p-8 calm-shadow border border-surface-variant/30 text-center space-y-6"
          >
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto animate-bounce">
              <Sparkles size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">Peace Restored</h3>
              <p className="text-sm font-bold text-success uppercase tracking-widest font-mono">You completed 4 box breathing cycles</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Take a moment to check in with your posture and somatic feeling. Notice how the muscles around your eyes and shoulders have softened. You are centered.
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleStart}
                className="flex-1 bg-surface-container-high text-on-surface-variant py-3.5 rounded-2xl font-bold hover:bg-surface-container transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={16} /> Repeat exercise
              </button>
              <button 
                onClick={() => setIsCompleted(false)}
                className="flex-1 bg-primary text-white py-3.5 rounded-2xl font-bold hover:brightness-105 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        ) : (
          /* Active Interactive Breathing Simulator view */
          <motion.div 
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-12"
          >
            {/* Visual breathing halo ring */}
            <div className="relative flex items-center justify-center w-72 h-72">
              <motion.div 
                animate={{ 
                  scale: phaseDetails[phase].scale,
                  backgroundColor: phase === 'inhale' ? '#6750A4' : phase === 'hold-in' ? '#5545cd' : phase === 'exhale' ? '#388E3C' : '#757575'
                }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className={`w-40 h-40 rounded-full ${phaseDetails[phase].color} opacity-20 absolute`}
              />
              <motion.div 
                animate={{ 
                  scale: phaseDetails[phase].scale - 0.2
                }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className={`w-36 h-36 rounded-full ${phaseDetails[phase].color} opacity-40 absolute`}
              />
              <div className="w-32 h-32 rounded-full border-4 border-white calm-shadow flex flex-col items-center justify-center z-10 bg-white">
                <span className="text-4xl font-black text-on-surface font-mono">{timeLeft}</span>
                <span className="text-[10px] font-bold uppercase text-outline mt-1 font-mono">seconds</span>
              </div>
            </div>

            {/* Labels and Cycle Progress Indicators */}
            <div className="space-y-4 max-w-sm">
              <h3 className="text-3xl font-extrabold capitalize text-on-surface leading-tight transition-all duration-300">
                {phaseDetails[phase].text}
              </h3>
              <p className="text-sm font-medium text-on-surface-variant min-h-[40px]">
                {phaseDetails[phase].action}
              </p>

              {/* Cycle Tracker dots on bottom */}
              <div className="flex justify-center items-center gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div 
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                        i < cyclesCompleted 
                          ? 'bg-primary border-primary scale-110' 
                          : i === cyclesCompleted 
                            ? 'border-primary bg-primary/20 scale-100 animate-pulse' 
                            : 'border-outline-variant bg-transparent'
                      }`} 
                    />
                    <span className="text-[8px] font-black uppercase text-outline font-mono">C{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleStop}
              className="flex items-center gap-2 bg-on-surface/5 text-on-surface px-8 py-3 rounded-2xl font-bold cursor-pointer hover:bg-on-surface/10 duration-200 transition-all text-sm active:scale-95"
            >
              <Square size={14} fill="currentColor" /> Stop Exercise
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
