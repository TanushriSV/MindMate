import { motion } from 'motion/react';
import { Mood } from '../../../types';

interface StepMoodProps {
  currentMood: Mood;
  onChange: (mood: Mood) => void;
}

export const moods: { emoji: string; label: Mood; desc: string }[] = [
  { emoji: '😌', label: 'calm', desc: 'At peace, content' },
  { emoji: '😊', label: 'happy', desc: 'Joyful, positive' },
  { emoji: '🤔', label: 'thoughtful', desc: 'Reflective, curious' },
  { emoji: '😴', label: 'tired', desc: 'Low energy, sleepy' },
  { emoji: '😔', label: 'low', desc: 'Sad, unmotivated' },
  { emoji: '😢', label: 'sad', desc: 'Down, upset, weeping' },
  { emoji: '😐', label: 'neutral', desc: 'Okay, regular baseline' },
  { emoji: '🤯', label: 'stressed', desc: 'Overburdened, high pressure' },
];

export default function StepMood({ currentMood, onChange }: StepMoodProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white calm-shadow rounded-3xl p-8 border border-primary/5"
    >
      <div className="mb-8 text-center md:text-left">
        <span className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2 block">Right now</span>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Choose your primary frequency</h2>
        <p className="text-on-surface-variant font-medium mt-1">What best describes your internal vibe right now?</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {moods.map((m) => (
          <button
            key={m.label}
            onClick={() => onChange(m.label)}
            aria-label={m.desc}
            aria-pressed={currentMood === m.label}
            className={`flex flex-col items-center justify-center p-5 rounded-2xl transition-all border-2 text-center h-40 cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
              currentMood === m.label 
                ? 'bg-primary/5 border-primary text-primary shadow-sm ring-4 ring-primary/5' 
                : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/65'
            }`}
          >
            <span className="text-4xl mb-2 drop-shadow-sm">{m.emoji}</span>
            <span className="text-sm font-bold capitalize text-on-surface">{m.label}</span>
            <span className="text-[10px] text-on-surface-variant mt-1 leading-snug">{m.desc}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
