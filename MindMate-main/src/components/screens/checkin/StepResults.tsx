import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Brain, Sparkles, AlertCircle, Info, Feather,
  ShieldCheck, AlertTriangle, AlertOctagon, Phone, MessageCircle 
} from 'lucide-react';
import { Mood } from '../../../types';
import { STRESS_INDICATORS } from './StepIndicators';

interface StepResultsProps {
  mood: Mood;
  stressLevel: number;
  sleepQuality: 'restorative' | 'fair' | 'restless';
  stressIndicators: string[];
  calculatedAnxietyScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  note: string;
  onNavigateToChat: () => void;
}

export default function StepResults({
  mood,
  stressLevel,
  sleepQuality,
  stressIndicators,
  calculatedAnxietyScore,
  riskLevel,
  note,
  onNavigateToChat
}: StepResultsProps) {
  const [dismissedCrisis, setDismissedCrisis] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white calm-shadow rounded-3xl p-8 border border-primary/10 space-y-8"
    >
      <div className="text-center space-y-2">
        <div className="inline-block p-4 rounded-full bg-primary/10 text-primary mb-3 ring-8 ring-primary/5">
          <Feather size={36} />
        </div>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Here's your check-in summary</h2>
        <p className="text-on-surface-variant font-medium">A snapshot of how you're doing today.</p>
      </div>

      {/* Structured Crisis Escalation resources if high-risk and not dismissed */}
      {riskLevel === 'High' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error/5 border-2 border-error/20 rounded-2xl p-6 relative flex flex-col gap-4 transition-all"
        >
          <div className="space-y-1">
            <h4 className="text-lg font-extrabold text-error flex items-center gap-2">
              <AlertOctagon size={20} /> It sounds like things are really tough right now
            </h4>
            <p className="text-sm font-semibold text-on-surface-variant leading-relaxed">
              Your feelings are fully valid, and you don't have to carry this alone. Talking to a trained counselor can provide immediate comfort. Please consider using these confidential wellness resources:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* iCall Helpline India */}
            <div className="bg-white/95 p-4 rounded-xl border border-error/15 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-black uppercase text-error tracking-wider block">TISS Helpline</span>
                <p className="font-bold text-sm text-on-surface mt-1">iCall TISS Helpline</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Free and confidential mental health support</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="tel:9152987821"
                  className="bg-error text-white font-black text-[10px] rounded-lg py-1.5 px-3 uppercase tracking-wider hover:bg-error/90 cursor-pointer inline-flex items-center gap-1"
                >
                  <Phone size={10} /> Call 9152987821
                </a>
                <a
                  href="https://icallhelpline.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-outline-variant text-on-surface font-extrabold text-[10px] rounded-lg py-1.5 px-3 hover:bg-surface-container-low cursor-pointer"
                >
                  Visit Site
                </a>
              </div>
            </div>

            {/* Vandrevala Foundation India */}
            <div className="bg-white/95 p-4 rounded-xl border border-error/15 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-black uppercase text-error tracking-wider block">Crisis Support</span>
                <p className="font-bold text-sm text-on-surface mt-1">Vandrevala Foundation</p>
                <p className="text-xs text-on-surface-variant mt-0.5">24/7 Free counselling and emotional support</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="tel:1860-2662-345"
                  className="bg-error text-white font-black text-[10px] rounded-lg py-1.5 px-3 uppercase tracking-wider hover:bg-error/90 cursor-pointer inline-flex items-center gap-1"
                >
                  <Phone size={10} /> Call 1860-2662-345
                </a>
                <a
                  href="https://www.vandrevalafoundation.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-outline-variant text-on-surface font-extrabold text-[10px] rounded-lg py-1.5 px-3 hover:bg-surface-container-low cursor-pointer"
                >
                  Visit Site
                </a>
              </div>
            </div>
          </div>

          {/* Direct link to chat helper as requested */}
          <div className="pt-2 border-t border-error/15 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs font-semibold text-on-surface-variant">
              Would you like to talk it out with your AI Companion right now?
            </span>
            <button
              onClick={onNavigateToChat}
              className="bg-primary text-white font-extrabold text-[11px] rounded-xl py-2 px-4 uppercase tracking-wider hover:brightness-110 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-98 transition-transform"
            >
              <MessageCircle size={14} /> Open Sanctuary Chat
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Score badge card */}
        <div className="md:col-span-4 bg-surface-container-low rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4 border border-outline-variant/20">
          <span className="text-[10px] font-black text-outline uppercase tracking-wider">Overall score</span>
          
          <div className="relative flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-outline-variant/30 flex items-center justify-center relative">
              <span className="text-4xl font-extrabold text-primary">{calculatedAnxietyScore + stressLevel}</span>
              <span className="absolute bottom-4 text-[10px] font-bold text-outline">Stress Index</span>
            </div>
            {/* Ring colored effect depending on severity */}
            <div className={`absolute inset-0 rounded-full border-8 animate-pulse ${
              riskLevel === 'High' ? 'border-error/20' : riskLevel === 'Moderate' ? 'border-secondary/20' : 'border-success/20'
            }`} />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#150066]">Anxiety level</p>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
              riskLevel === 'High' ? 'bg-error/10 text-error' : riskLevel === 'Moderate' ? 'bg-secondary/10 text-secondary' : 'bg-success/10 text-success'
            }`}>
              {riskLevel === 'High' ? (
                <AlertOctagon size={13} />
              ) : riskLevel === 'Moderate' ? (
                <AlertTriangle size={13} />
              ) : (
                <ShieldCheck size={13} />
              )}
              {riskLevel} Tension
            </span>
          </div>
        </div>

        {/* Analysis detail */}
        <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 space-y-6">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-outline-variant/30 pb-3 flex items-center gap-2 font-mono">
            <Brain size={16} /> What you reported
          </h3>
          
          <div className="space-y-4 text-sm font-medium text-on-surface-variant leading-relaxed">
            <div className="flex justify-between items-center">
              <span className="text-on-surface font-extrabold">Primary Vibe Score:</span>
              <span className="capitalize bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-xs">
                {mood}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-on-surface font-extrabold">Active Tension Signals:</span>
              <span className="text-on-surface font-bold text-xs bg-surface-container px-3 py-1 rounded-full">
                {stressIndicators.length} cataloged
              </span>
            </div>

            {stressIndicators.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {stressIndicators.map(id => {
                  const original = STRESS_INDICATORS.find(ind => ind.id === id);
                  return (
                    <span key={id} className="text-[10px] font-bold px-2.5 py-1 bg-surface-container-low text-on-surface rounded-full border border-outline-variant/20">
                      {original?.emoji} {original?.label}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-on-surface font-extrabold">Cognitive Overload (Worrying):</span>
              <span className="text-on-surface font-bold text-xs">
                {calculatedAnxietyScore === 0 ? 'None' : calculatedAnxietyScore < 3 ? 'Mild' : calculatedAnxietyScore < 5 ? 'Significant' : 'Severe & Constant'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-on-surface font-extrabold">Rest State sleep:</span>
              <span className="capitalize text-on-surface font-bold text-xs">
                {sleepQuality}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions / Dynamic Wellness Prescription */}
      <div className="bg-secondary-container/10 border border-secondary-container/30 rounded-2xl p-6 space-y-4">
        <h4 className="text-base font-black text-secondary uppercase tracking-widest flex items-center gap-2">
          <Sparkles size={18} /> What might help today
        </h4>
        <ul className="space-y-3 text-sm font-medium text-on-surface-variant leading-relaxed">
          {riskLevel === 'High' ? (
            <>
              <li className="flex items-start gap-2">
                <span className="text-error font-bold">•</span>
                <span><strong>Deep Breathing First:</strong> Your tension has hit high priority. We heavily recommend starting a 5-minute deep box breathing exercise right now (4s inhale, 4s hold, 4s exhale, 4s hold).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error font-bold">•</span>
                <span><strong>Chat with AI Companion:</strong> Enter our <em>AI Sanctuary Chat</em> tab. Talk freely to clear your cognitive load—just typing out the specific things occupying your mind will ease deep neurological pressure.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">•</span>
                <span><strong>Digital Quiet:</strong> Put electronic devices away for at least 15 minutes, step outdoors, and allow your muscle tension to soften naturally.</span>
              </li>
            </>
          ) : riskLevel === 'Moderate' ? (
            <>
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">•</span>
                <span><strong>Mindful Micro-Break:</strong> You are managing tension well, but a gentle morning reset is advised. Take a slow walking break or step away from your workspace.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">•</span>
                <span><strong>Intention Setting:</strong> Focus on just <em>one crucial task</em> today rather than over-scheduling yourself. This immediately clears feeling overwhelmed.</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-2">
                <span className="text-success font-bold">•</span>
                <span><strong>Preserve the State:</strong> Your stress and worry quotients are delightfully low. Use this quiet frequency to do creative reading, focus work, or exercise.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success font-bold">•</span>
                <span><strong>Gratitude Journaling:</strong> Write down two things you're grateful for on your Sanctuary timeline to consolidate these high-harmony neurological connections!</span>
              </li>
            </>
          )}
        </ul>
      </div>
    </motion.div>
  );
}
