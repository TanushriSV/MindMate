import { motion } from 'motion/react';

interface StepIndicatorsProps {
  selectedIndicators: string[];
  onChange: (indicators: string[]) => void;
}

export const STRESS_INDICATORS = [
  { id: 'racing_thoughts', label: 'Racing Thoughts', emoji: '💭', category: 'Mental' },
  { id: 'muscle_tension', label: 'Muscle Tension', emoji: '🪨', category: 'Physical' },
  { id: 'irritation', label: 'Easily Irritated', emoji: '⚡', category: 'Emotional' },
  { id: 'lack_of_focus', label: 'Difficulty Focusing', emoji: '🌫️', category: 'Mental' },
  { id: 'shallow_breath', label: 'Shallow Breathing', emoji: '💨', category: 'Physical' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '🌊', category: 'Emotional' },
  { id: 'restlessness', label: 'Appetite Changes', emoji: '🥗', category: 'Physical' },
  { id: 'social_withdraw', label: 'Socially Withdrawn', emoji: '🪵', category: 'Social' },
];

export default function StepIndicators({ selectedIndicators, onChange }: StepIndicatorsProps) {
  const handleToggleIndicator = (id: string) => {
    const updated = selectedIndicators.includes(id)
      ? selectedIndicators.filter(item => item !== id)
      : [...selectedIndicators, id];
    onChange(updated);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white calm-shadow rounded-3xl p-8 border border-primary/5"
    >
      <div className="mb-8">
        <span className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2 block">In your body</span>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Stress Manifestations</h2>
        <p className="text-on-surface-variant font-medium mt-1">
          How does tension currently exhibit itself in your system? Select all that apply.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STRESS_INDICATORS.map((indicator) => {
          const isSelected = selectedIndicators.includes(indicator.id);
          return (
            <button
              key={indicator.id}
              onClick={() => handleToggleIndicator(indicator.id)}
              aria-pressed={isSelected}
              aria-label={indicator.label}
              className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                isSelected 
                  ? 'bg-secondary-container/20 border-secondary text-on-secondary-container shadow-sm ring-4 ring-secondary/5' 
                  : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{indicator.emoji}</span>
                <div>
                  <p className="font-bold text-on-surface">{indicator.label}</p>
                  <span className="text-[10px] font-black uppercase tracking-wider text-outline px-2 py-0.5 bg-surface-container-high rounded-full">
                    {indicator.category}
                  </span>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? 'bg-secondary border-secondary text-white' : 'border-outline-variant'
              }`}>
                {isSelected && <span className="text-xs font-bold">✓</span>}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
