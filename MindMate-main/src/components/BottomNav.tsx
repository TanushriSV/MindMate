import { memo } from 'react';
import { motion } from 'motion/react';
import { Home, Edit3, MessageCircle, BarChart3, User } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export default memo(function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const items = [
    { id: Screen.Home, icon: Home, label: 'Home' },
    { id: Screen.CheckIn, icon: Edit3, label: 'Check-in' },
    { id: Screen.Chat, icon: MessageCircle, label: 'AI Chat' },
    { id: Screen.History, icon: BarChart3, label: 'History' },
    { id: Screen.Profile, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_-4px_20px_rgba(45,42,74,0.06)] rounded-t-xl px-4 py-3 flex justify-around items-center md:fixed md:top-16 md:left-0 md:w-full md:flex-row md:justify-center md:gap-8 md:border-b md:border-outline-variant/30 md:bg-surface/90 md:backdrop-blur-md md:py-2 md:bottom-auto md:rounded-none md:px-0 md:shadow-sm">
      {items.map((item) => {
        const isActive = currentScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-label={item.label}
            className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all active:scale-90 duration-150 cursor-pointer md:flex-row md:gap-2 md:px-5 md:py-2 ${
              isActive ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span aria-hidden="true" className="text-[10px] font-semibold mt-1 uppercase tracking-tight md:mt-0 md:text-xs">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
});
