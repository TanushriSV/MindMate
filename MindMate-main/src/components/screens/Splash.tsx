import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { IMAGES } from '../../constants';
import { Screen } from '../../types';

interface SplashProps {
  onBegin: () => void;
  onSignIn: () => void;
}

export default function Splash({ onBegin, onSignIn }: SplashProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center ambient-glow px-6 md:px-16 overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-secondary-fixed/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-tertiary-fixed/20 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full"
      >
        {/* Hero Illustration */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="mb-12 cursor-pointer"
        >
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-white flex items-center justify-center soft-shadow relative overflow-hidden p-6">
            <img src={IMAGES.splashHero} alt="Meditation" className="w-full h-full object-cover rounded-full opacity-90" />
            <div className="absolute inset-0 bg-primary/5" />
          </div>
        </motion.div>

        {/* Brand */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">MindMate</h1>
          <p className="text-lg md:text-xl text-on-surface-variant font-medium max-w-xs mx-auto">
            Your digital sanctuary for reflection and inner peace.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-12 w-full flex flex-col items-center gap-4">
          <button 
            onClick={onBegin}
            className="w-full max-w-[280px] bg-primary text-white font-semibold py-4 px-8 rounded-xl soft-shadow transition-all hover:brightness-110 active:scale-95"
          >
            Begin Your Journey
          </button>
          <button 
            onClick={onSignIn}
            className="w-full max-w-[280px] bg-secondary-container/30 text-on-secondary-container font-semibold py-4 px-8 rounded-xl transition-all hover:bg-secondary-container/50 active:scale-95"
          >
            Sign In
          </button>
        </div>

        {/* Badge */}
        <div className="mt-12 flex items-center gap-2 text-outline">
          <Sparkles size={18} />
          <span className="text-xs font-bold tracking-widest uppercase">AI-Powered Wellness</span>
        </div>
      </motion.div>

      {/* Decorative Corners */}
      <div className="fixed bottom-0 left-0 p-6 opacity-30 pointer-events-none">
        <div className="w-32 h-32 border-l-2 border-b-2 border-primary/20 rounded-bl-xl" />
      </div>
      <div className="fixed top-0 right-0 p-6 opacity-30 pointer-events-none">
        <div className="w-32 h-32 border-r-2 border-t-2 border-primary/20 rounded-tr-xl" />
      </div>
    </div>
  );
}
