import { motion } from 'motion/react';
import { Sun, Cloud, Moon } from 'lucide-react';

interface StepSleepProps {
  sleepQuality: 'restorative' | 'fair' | 'restless';
  note: string;
  onSleepChange: (quality: 'restorative' | 'fair' | 'restless') => void;
  onNoteChange: (text: string) => void;
}

export default function StepSleep({ sleepQuality, note, onSleepChange, onNoteChange }: StepSleepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white calm-shadow rounded-3xl p-8 border border-primary/5 space-y-8"
    >
      <div>
        <span className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2 block">Rest & reflection</span>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Rest & Reflection</h2>
        <p className="text-on-surface-variant font-medium mt-1">
          Sleep patterns significantly dictate cognitive emotional resilience. Let's catalog your rest and write down any thoughts.
        </p>
      </div>

      {/* Sleep Choice */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-on-surface">Sleep Quality last night:</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            type="button"
            onClick={() => onSleepChange('restorative')}
            className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-36 active:scale-95 cursor-pointer ${
              sleepQuality === 'restorative' 
                ? 'bg-tertiary-container/10 border-tertiary text-tertiary shadow-sm' 
                : 'bg-surface-container-low border-transparent hover:bg-tertiary-container/5 text-on-surface'
            }`}
          >
            <Sun size={32} className={sleepQuality === 'restorative' ? 'text-tertiary' : 'text-outline'} />
            <div>
              <span className="block text-base font-bold">Restorative</span>
              <span className="text-xs font-semibold opacity-70">Woke up feeling fresh</span>
            </div>
          </button>
          
          <button 
            type="button"
            onClick={() => onSleepChange('fair')}
            className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-36 active:scale-95 cursor-pointer ${
              sleepQuality === 'fair' 
                ? 'bg-primary-container/10 border-primary text-primary shadow-sm' 
                : 'bg-surface-container-low border-transparent hover:bg-primary-container/5 text-on-surface'
            }`}
          >
            <Cloud size={32} className={sleepQuality === 'fair' ? 'text-primary' : 'text-outline'} />
            <div>
              <span className="block text-base font-bold">Fair Sleep</span>
              <span className="text-xs font-semibold">Slight interruptions</span>
            </div>
          </button>
          
          <button 
            type="button"
            onClick={() => onSleepChange('restless')}
            className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-36 active:scale-95 cursor-pointer ${
              sleepQuality === 'restless' 
                ? 'bg-secondary-container/10 border-secondary text-secondary shadow-sm' 
                : 'bg-surface-container-low border-transparent hover:bg-secondary-container/5 text-on-surface'
            }`}
          >
            <Moon size={32} className={sleepQuality === 'restless' ? 'text-secondary' : 'text-outline'} />
            <div>
              <span className="block text-base font-bold">Restless</span>
              <span className="text-xs font-semibold">Tossing or waking often</span>
            </div>
          </button>
        </div>
      </div>

      {/* Reflection chamber */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label htmlFor="reflection-note" className="block text-sm font-bold text-on-surface cursor-pointer">
            Reflection Chamber (Optional)
          </label>
          <span className="text-[10px] font-bold text-outline">What's occupying your thoughts now?</span>
        </div>
        <textarea 
          id="reflection-note"
          rows={4}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="w-full rounded-2xl p-4 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all text-sm font-medium focus:ring-2 focus:ring-primary/5 text-on-surface placeholder:text-outline/40 leading-relaxed resize-none"
          placeholder="Express any anxiety triggers, tasks, or situational friction here. Free-writing helps reduce mental noise..."
        />
      </div>
    </motion.div>
  );
}
