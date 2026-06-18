import { motion } from 'motion/react';
import { Info } from 'lucide-react';

interface StepStressProps {
  stressLevel: number;
  onChange: (level: number) => void;
}

export default function StepStress({ stressLevel, onChange }: StepStressProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white calm-shadow rounded-3xl p-8 border border-primary/5 space-y-8"
    >
      <div>
        <span className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2 block">Pressure check</span>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">How much pressure are you under?</h2>
        <p className="text-on-surface-variant font-medium mt-1">
          Drag the slider to where you honestly feel you are right now.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <span className="text-xs font-black text-outline uppercase tracking-wider">Internal Pressure Meter</span>
          <span className="text-3xl font-black text-primary">{stressLevel} <span className="text-sm font-medium text-outline">/ 10</span></span>
        </div>
        <div className="px-2">
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={stressLevel}
            onChange={(e) => onChange(parseInt(e.target.value))}
            aria-label="Stress level"
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={stressLevel}
            aria-valuetext={`${stressLevel} out of 10`}
            className="w-full h-4 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary border border-outline-variant/10 focus:ring-2 focus:ring-primary/20"
          />
          
          {/* Notch markers below slider */}
          <div className="flex justify-between px-1 mt-2">
            {Array.from({ length: 10 }, (_, i) => (
              <div 
                key={i} 
                className={`w-1 h-3 rounded-full transition-colors duration-150 ${
                  i + 1 <= stressLevel ? 'bg-primary' : 'bg-outline-variant/30'
                }`} 
              />
            ))}
          </div>

          <div className="flex justify-between mt-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest bg-surface-container-low px-4 py-2 rounded-xl">
            <span>🧘 Serene Sanctuary</span>
            <span>⚡ Balanced focus</span>
            <span>🔥 Critical Overdrive</span>
          </div>
        </div>

        <div className="bg-primary/5 p-4 rounded-xl flex items-start gap-3 border border-primary/10">
          <Info className="text-primary shrink-0 mt-0.5" size={18} />
          <p className="text-xs font-medium text-on-surface-variant leading-relaxed">
            A regular stress index below 4 typically indicates baseline wellness. Sustained values above 7 are highly associated with fatigue, insomnia, or situational burnout.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
