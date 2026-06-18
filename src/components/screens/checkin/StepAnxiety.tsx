import { motion } from 'motion/react';

interface StepAnxietyProps {
  anxietyWorry: number;
  anxietyRelax: number;
  onChange: (worry: number, relax: number) => void;
}

export default function StepAnxiety({ anxietyWorry, anxietyRelax, onChange }: StepAnxietyProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white calm-shadow rounded-3xl p-8 border border-primary/5 space-y-8"
    >
      <div>
        <span className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2 block">In your mind</span>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Worry & relaxation</h2>
        <p className="text-on-surface-variant font-medium mt-1">
          How much has worrying been getting in the way today?
        </p>
      </div>

      {/* Question 1 */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-1 text-xs font-bold shrink-0">1</div>
          <h3 className="text-lg font-bold text-on-surface">In the past 24 hours, how persistent has uncontrolled worrying been?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { val: 0, label: 'Not at all', desc: 'Peace of mind' },
            { val: 1, label: 'Briefly', desc: 'Mild thoughts' },
            { val: 2, label: 'Repeatedly', desc: 'Interrupting tasks' },
            { val: 3, label: 'Constant', desc: 'Highly distracting' }
          ].map((option) => (
            <button
              key={option.val}
              type="button"
              onClick={() => onChange(option.val, anxietyRelax)}
              className={`p-4 rounded-xl text-left border-2 transition-all cursor-pointer ${
                anxietyWorry === option.val
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-surface-container-low border-transparent hover:bg-outline-variant/20 text-on-surface'
              }`}
            >
              <h4 className="font-bold text-sm">{option.label}</h4>
              <p className={`text-xs mt-1 ${anxietyWorry === option.val ? 'text-white/80' : 'text-on-surface-variant'}`}>
                {option.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Question 2 */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-1 text-xs font-bold shrink-0">2</div>
          <h3 className="text-lg font-bold text-on-surface">How challenging has it been to relax or bring quiet to your mind?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { val: 0, label: 'Effortless', desc: 'Naturally slow down' },
            { val: 1, label: 'Slightly Hard', desc: 'Took intentional effort' },
            { val: 2, label: 'Difficult', desc: 'Mind remained racing' },
            { val: 3, label: 'Impossible', desc: 'Constant hyper-alert' }
          ].map((option) => (
            <button
              key={option.val}
              type="button"
              onClick={() => onChange(anxietyWorry, option.val)}
              className={`p-4 rounded-xl text-left border-2 transition-all cursor-pointer ${
                anxietyRelax === option.val
                  ? 'bg-secondary border-secondary text-white shadow-md'
                  : 'bg-surface-container-low border-transparent hover:bg-outline-variant/20 text-on-surface'
              }`}
            >
              <h4 className="font-bold text-sm">{option.label}</h4>
              <p className={`text-xs mt-1 ${anxietyRelax === option.val ? 'text-white/80' : 'text-on-surface-variant'}`}>
                {option.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
