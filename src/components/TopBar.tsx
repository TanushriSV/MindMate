import { memo } from 'react';
import { Bell } from 'lucide-react';
import { IMAGES } from '../constants';
import { useUser } from '../context/UserContext';

interface TopBarProps {
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
}

export default memo(function TopBar({ onProfileClick, onNotificationsClick }: TopBarProps) {
  const { user } = useUser();

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant/30">
      <div className="flex justify-between items-center px-6 md:px-16 h-16 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button 
            onClick={onProfileClick}
            aria-label="Open profile"
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:scale-105 transition-transform cursor-pointer"
          >
            <img 
              src={user?.avatar ?? IMAGES.avatar} 
              alt="Profile" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                const name = encodeURIComponent(user?.name ?? 'U');
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${name}&background=5545cd&color=fff`;
              }}
            />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-primary">MindMate</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onNotificationsClick}
            aria-label="Notifications"
            className="p-2 rounded-full hover:bg-surface-container-low transition-colors active:scale-95 text-primary cursor-pointer"
          >
            <Bell size={24} />
          </button>
        </div>
      </div>
    </header>
  );
});
