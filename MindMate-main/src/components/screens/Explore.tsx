import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Wind, Compass, Award, Heart, HelpCircle, Activity, Moon } from 'lucide-react';

export default function Explore() {
  const navigate = useNavigate();

  const features = [
    { title: 'Journal', icon: <BookOpen size={20} />, path: '/journal', color: 'bg-emerald-500/10 text-emerald-600' },
    { title: 'Grounding', icon: <Compass size={20} />, path: '/grounding', color: 'bg-blue-500/10 text-blue-600' },
    { title: 'CBT Diary', icon: <Activity size={20} />, path: '/cbt', color: 'bg-purple-500/10 text-purple-600' },
    { title: 'Affirmations', icon: <Heart size={20} />, path: '/affirmations', color: 'bg-pink-500/10 text-pink-600' },
    { title: 'Sleep Tracker', icon: <Moon size={20} />, path: '/sleep', color: 'bg-indigo-500/10 text-indigo-600' },
    { title: 'Resources', icon: <HelpCircle size={20} />, path: '/resources', color: 'bg-amber-500/10 text-amber-600' },
    { title: 'Habits', icon: <Wind size={20} />, path: '/habits', color: 'bg-cyan-500/10 text-cyan-600' },
    { title: 'Achievements', icon: <Award size={20} />, path: '/achievements', color: 'bg-orange-500/10 text-orange-600' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full w-full max-w-2xl mx-auto py-8 px-4 font-sans pb-24"
    >
      <div className="flex items-center mb-8 gap-3">
        <button 
          onClick={() => navigate('/home')}
          className="p-2 hover:bg-surface-variant rounded-full text-on-surface transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-on-background tracking-tight">Explore</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Discover tools for your mental wellness.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {features.map((feat) => (
          <button
            key={feat.title}
            onClick={() => navigate(feat.path)}
            className="flex flex-col items-center justify-center p-6 bg-surface-container hover:bg-surface-container-high rounded-3xl border border-outline-variant/30 calm-shadow transition-all cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${feat.color}`}>
              {feat.icon}
            </div>
            <span className="text-sm font-bold text-on-surface">{feat.title}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 p-6 bg-primary/10 rounded-3xl border border-primary/20 flex flex-col items-center text-center cursor-pointer hover:bg-primary/15 transition-all" onClick={() => navigate('/crisis')}>
        <h3 className="text-primary font-black mb-2">Crisis Support</h3>
        <p className="text-xs text-on-surface font-medium">Get immediate help and hotlines.</p>
      </div>
    </motion.div>
  );
}
