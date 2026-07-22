import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Flame, Star, ShieldCheck, Heart, Sparkles, Target, Zap } from 'lucide-react';
import { useEntries } from '../../context/EntriesContext';
import { computeStreak } from '../../utils/stats';

export default function Achievements() {
  const navigate = useNavigate();
  const { entries } = useEntries();
  
  const streak = computeStreak(entries);
  const totalEntries = entries.length;

  const achievements = [
    {
      id: 'first_step',
      title: 'First Step',
      description: 'Log your first wellness check-in',
      icon: <Target size={24} />,
      unlocked: totalEntries >= 1,
      color: 'bg-emerald-500',
      progress: Math.min(totalEntries, 1),
      total: 1
    },
    {
      id: 'streak_3',
      title: 'Consistency',
      description: 'Maintain a 3-day check-in streak',
      icon: <Flame size={24} />,
      unlocked: streak >= 3,
      color: 'bg-orange-500',
      progress: Math.min(streak, 3),
      total: 3
    },
    {
      id: 'reflection_master',
      title: 'Self-Aware',
      description: 'Complete 10 total evaluations',
      icon: <Heart size={24} />,
      unlocked: totalEntries >= 10,
      color: 'bg-pink-500',
      progress: Math.min(totalEntries, 10),
      total: 10
    },
    {
      id: 'resilience',
      title: 'Inner Resilience',
      description: 'Maintain a 7-day check-in streak',
      icon: <ShieldCheck size={24} />,
      unlocked: streak >= 7,
      color: 'bg-blue-500',
      progress: Math.min(streak, 7),
      total: 7
    },
    {
      id: 'zen_master',
      title: 'Zen Master',
      description: 'Log a "Calm" mood 5 times',
      icon: <Sparkles size={24} />,
      unlocked: entries.filter(e => e.mood === 'calm').length >= 5,
      color: 'bg-purple-500',
      progress: Math.min(entries.filter(e => e.mood === 'calm').length, 5),
      total: 5
    },
    {
      id: 'energy_boost',
      title: 'Energy Shift',
      description: 'Complete 25 total evaluations',
      icon: <Zap size={24} />,
      unlocked: totalEntries >= 25,
      color: 'bg-amber-500',
      progress: Math.min(totalEntries, 25),
      total: 25
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full w-full max-w-2xl mx-auto py-8 px-4 font-sans pb-24"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/explore')}
            className="p-2 hover:bg-surface-variant rounded-full text-on-surface transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-on-background tracking-tight">Achievements</h1>
            <p className="text-sm text-on-surface-variant font-medium mt-1">Unlock badges on your wellness journey.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
          <Award size={18} className="text-primary" />
          <span className="font-bold text-primary">{unlockedCount} / {achievements.length}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative overflow-hidden p-6 rounded-3xl border transition-all ${
              badge.unlocked 
                ? 'bg-surface-container border-outline-variant/30 calm-shadow' 
                : 'bg-surface-container-lowest border-outline-variant/10 opacity-75'
            }`}
          >
            <div className="flex gap-4">
              <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                badge.unlocked ? badge.color : 'bg-surface-variant text-on-surface-variant'
              }`}>
                {badge.unlocked ? badge.icon : <Star size={24} className="opacity-50" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg tracking-tight mb-1 ${badge.unlocked ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {badge.title}
                </h3>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed mb-3">
                  {badge.description}
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-surface-variant/30 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(badge.progress / badge.total) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full rounded-full ${badge.unlocked ? badge.color : 'bg-primary'}`}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] font-black uppercase text-outline tracking-widest">{badge.progress} / {badge.total}</span>
                  {badge.unlocked && <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1"><Sparkles size={10}/> Unlocked</span>}
                </div>
              </div>
            </div>
            
            {!badge.unlocked && (
              <div className="absolute inset-0 bg-surface-container-lowest/40 backdrop-blur-[1px]" />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
