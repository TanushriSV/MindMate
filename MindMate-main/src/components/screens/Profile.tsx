import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Globe, Moon, Bell, Shield, Award, Flame, Timer, Sparkles, Settings, Upload, Download } from 'lucide-react';
import { IMAGES } from '../../constants';
import { useUser } from '../../context/UserContext';
import { useEntries } from '../../context/EntriesContext';
import { computeStreak } from '../../utils/stats';
import { useTheme } from '../../context/ThemeContext';
import { updateProfile } from '../../services/geminiService';

interface ProfileProps {
  onSignOut: () => void;
}

export default function Profile({ onSignOut }: ProfileProps) {
  const { user, setUser, clearUser } = useUser();
  const { entries, clearEntries } = useEntries();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [preferenceFeedback, setPreferenceFeedback] = useState<string | null>(null);

  // Edit Profile States
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar ?? '');
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const validateEdit = () => {
    if (!editName.trim() || editName.trim().length < 2) {
      return 'Name must be at least 2 characters.';
    }
    if (editName.trim().length > 40) {
      return 'Name must be 40 characters or fewer.';
    }
    return null;
  };

  const handleSaveProfile = async () => {
    const err = validateEdit();
    if (err) {
      setEditError(err);
      return;
    }

    setSaving(true);
    setEditError(null);

    try {
      const finalAvatar = editAvatar.trim() ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(editName.trim())}&background=6750A4&color=fff`;

      await updateProfile(editName.trim(), finalAvatar);

      if (!user) {
        throw new Error("No authenticated session available.");
      }

      // Write changes to context + localStorage
      const updatedUser = {
        ...user,
        name: editName.trim(),
        avatar: finalAvatar,
      };

      setUser(updatedUser);
      setEditOpen(false);
    } catch (e: any) {
      console.error("Save profile error:", e);
      setEditError(e.message || "Failed to update profile on the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 2MB size ceiling
    if (file.size > 2 * 1024 * 1024) {
      setEditError("Avatar files must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditAvatar(reader.result);
        setEditError(null);
      }
    };
    reader.onerror = () => {
      setEditError("Failed to convert image file.");
    };
    reader.readAsDataURL(file);
  };

  const [publicProfile, setPublicProfile] = useState(() => {
    try {
      return localStorage.getItem('mindmate_pref_publicProfile') === 'true';
    } catch {
      return false;
    }
  });
  
  const [dailyReminders, setDailyReminders] = useState(() => {
    try {
      return localStorage.getItem('mindmate_pref_dailyReminders') !== 'false';
    } catch {
      return true;
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const triggerTooltip = (id: string) => {
    setActiveTooltip(id);
    setTimeout(() => {
      setActiveTooltip(null);
    }, 2000);
  };

  const handleTogglePublicProfile = () => {
    const nextVal = !publicProfile;
    setPublicProfile(nextVal);
    try {
      localStorage.setItem('mindmate_pref_publicProfile', String(nextVal));
    } catch (e) {
      console.warn("Failed to set public profile setting in localStorage:", e);
    }
  };

  const handleToggleDailyReminders = async () => {
    const nextVal = !dailyReminders;
    if (nextVal) {
      let isIframe = false;
      try {
        isIframe = window.self !== window.parent || window.self !== window.top;
      } catch (e) {
        isIframe = true;
      }

      let isNotificationSupported = false;
      try {
        isNotificationSupported = 'Notification' in window && 
          typeof Notification === 'function' &&
          typeof Notification.requestPermission === 'function';
      } catch (e) {
        isNotificationSupported = false;
      }

      if (isIframe || !isNotificationSupported) {
        // Fallback directly to in-app mindful reminders inside iframe or unsupported environment without throwing errors
        setDailyReminders(true);
        try {
          localStorage.setItem('mindmate_pref_dailyReminders', 'true');
          localStorage.setItem('mindmate_pref_inAppNotificationsOnly', 'true');
        } catch (err) {}
        setPreferenceFeedback("In-app reminders turned on! Native push notices are restricted in this preview, but you'll get gentle in-app prompts.");
      } else {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setDailyReminders(true);
            try {
              localStorage.setItem('mindmate_pref_dailyReminders', 'true');
              localStorage.setItem('mindmate_pref_inAppNotificationsOnly', 'false');
            } catch (err) {}
            setPreferenceFeedback("Notifications successfully enabled & scheduled!");
          } else {
            // Permission rejected, fall back to in-app reminders seamlessly as requested
            setDailyReminders(true);
            try {
              localStorage.setItem('mindmate_pref_dailyReminders', 'true');
              localStorage.setItem('mindmate_pref_inAppNotificationsOnly', 'true');
            } catch (err) {}
            setPreferenceFeedback("Push permission denied. MindMate in-app reminders enabled instead!");
          }
        } catch (e) {
          // If anything else fails, fall back gracefully to in-app
          setDailyReminders(true);
          try {
            localStorage.setItem('mindmate_pref_dailyReminders', 'true');
            localStorage.setItem('mindmate_pref_inAppNotificationsOnly', 'true');
          } catch (err) {}
          setPreferenceFeedback("In-app wellness reminders successfully enabled!");
        }
      }
    } else {
      setDailyReminders(false);
      try {
        localStorage.setItem('mindmate_pref_dailyReminders', 'false');
        localStorage.setItem('mindmate_pref_inAppNotificationsOnly', 'false');
      } catch (err) {}
      setPreferenceFeedback("Reminders turned off.");
    }
    setTimeout(() => setPreferenceFeedback(null), 4000);
  };

  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify(
          {
            profile: user,
            history: entries,
            exportedAt: new Date().toISOString()
          }, 
          null, 
          2
        )
      );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `mindmate_backup_${user?.name?.toLowerCase().replace(/\s+/g, '_') || 'seeker'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setPreferenceFeedback("Export complete! Access your JSON backup safely.");
    } catch (err: any) {
      setPreferenceFeedback("Export failed: " + err.message);
    }
    setTimeout(() => setPreferenceFeedback(null), 3000);
  };

  const handleLogOut = async () => {
    try {
      await clearEntries();
    } catch (e) {
      console.warn("Failed to clear entries on server during logout:", e);
    }
    clearUser();
    onSignOut();
  };

  const streak = computeStreak(entries);
  const journalDays = new Set(
    entries
      .filter(entry => entry.note && entry.note.trim() !== '')
      .map(entry => new Date(entry.timestamp).toDateString())
  ).size;

  const stats = [
    { label: 'Day Streak', val: String(streak), color: 'text-primary border-primary', textColor: 'text-primary', icon: Flame },
    { label: 'Total Check-ins', val: String(entries.length), color: 'text-tertiary border-tertiary', textColor: 'text-tertiary', icon: Timer },
    { label: 'Journaled Days', val: String(journalDays), color: 'text-secondary border-secondary', textColor: 'text-secondary', icon: Award },
  ];

  const totalEntries = entries.length;
  const achievements = [
    { id: 1, title: 'First Step', sub: 'Log first check-in', completed: totalEntries >= 1 },
    { id: 2, title: 'Consistency', sub: '3-day streak', completed: streak >= 3 },
    { id: 3, title: 'Self-Aware', sub: '10 evaluations', completed: totalEntries >= 10 },
    { id: 4, title: 'Zen Master', sub: '5 "Calm" logs', completed: entries.filter(e => e.mood === 'calm').length >= 5 },
  ];

  const formattedJoinDate = user?.joinDate 
    ? new Date(user.joinDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'October 2023';

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 space-y-12 pb-16 relative">
      {/* Toast settings alert */}
      <AnimatePresence>
        {preferenceFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-on-surface text-background font-extrabold text-xs py-3 px-6 rounded-2xl calm-shadow z-50 border border-outline-variant/30 text-center"
          >
            {preferenceFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Hero */}
      <section className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden calm-shadow border-4 border-white ring-8 ring-primary/5">
            <img src={user?.avatar ?? IMAGES.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-2 right-2 bg-tertiary text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <Shield size={20} />
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold text-on-background tracking-tight">{user?.name ?? 'Alex'}</h2>
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mt-2 px-6 py-1.5 bg-surface-container-low rounded-full w-fit mx-auto border border-outline-variant/20">
            Calm Seeker since {formattedJoinDate}
          </p>
        </div>
        
        <div className="flex gap-4 relative">
          <button 
            onClick={() => {
              setEditName(user?.name ?? '');
              setEditAvatar(user?.avatar ?? '');
              setEditError(null);
              setEditOpen(true);
            }}
            className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Edit Profile
          </button>
          <button 
            onClick={handleExportData}
            aria-label="Export personal history as JSON"
            className="px-6 py-3 bg-white text-primary font-bold rounded-2xl border-2 border-primary/15 hover:bg-surface-container-low transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download size={16} /> Export JSON Data
          </button>
        </div>
      </section>

      {/* Bento Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div 
            key={s.label} 
            className={`p-8 rounded-[2rem] bg-white border-b-8 shadow-sm flex flex-col items-center text-center space-y-3 transition-transform hover:-translate-y-1 ${s.color}`}
          >
             <s.icon className={s.textColor} size={32} />
             <div className="space-y-0.5">
                <span className={`text-4xl font-extrabold tracking-tight ${s.textColor}`}>{s.val}</span>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{s.label}</p>
             </div>
          </div>
        ))}
      </section>

      {/* Achievements */}
      <section className="space-y-6 relative">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-2xl font-bold text-on-background">Achievements</h3>
          <button 
            onClick={() => navigate('/achievements')}
            className="text-primary font-bold text-sm hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((a) => (
            <motion.div 
              key={a.id}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-[2rem] shadow-sm flex flex-col items-center text-center space-y-4 border-2 transition-all ${
                a.completed ? 'bg-white border-primary/5 hover:bg-primary/5' : 'bg-surface-container-low/50 border-dashed border-outline-variant/30 opacity-60'
              }`}
            >
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${
                a.completed ? 'bg-primary/10 text-primary ring-4 ring-primary/5' : 'bg-outline-variant/20 text-outline-variant'
              }`}>
                {a.completed ? <Award size={32} /> : <Settings size={32} />}
              </div>
              <div className="space-y-1">
                <p className={`text-sm font-bold ${a.completed ? 'text-on-surface' : 'text-outline'}`}>{a.title}</p>
                <p className="text-[10px] font-semibold text-on-surface-variant leading-tight">{a.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </section>

      {/* Settings List */}
      <section className="space-y-6 relative">
        <h3 className="text-2xl font-bold text-on-background px-2">Preferences</h3>
        <div className="bg-white rounded-[2.5rem] calm-shadow overflow-hidden border border-surface-variant/30">
          <div className="p-8">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-8">Account Privacy</h4>
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary transition-transform">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-on-surface">Public Profile</p>
                    <p className="text-xs font-semibold text-on-surface-variant">Allow others to see your badges</p>
                  </div>
                </div>
                <button 
                  role="switch" 
                  aria-checked={publicProfile}
                  aria-label="Toggle Public Profile"
                  onClick={handleTogglePublicProfile}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center ${
                    publicProfile ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'
                  }`}
                >
                  <motion.div 
                    layout 
                    className="w-5 h-5 bg-white rounded-full shadow-md" 
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary transition-transform">
                    <Bell size={24} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-on-surface">Daily Reminders</p>
                    <p className="text-xs font-semibold text-on-surface-variant">Get a nudge for your check-ins</p>
                  </div>
                </div>
                <button 
                  role="switch" 
                  aria-checked={dailyReminders}
                  aria-label="Toggle Daily Reminders"
                  onClick={handleToggleDailyReminders}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center ${
                    dailyReminders ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'
                  }`}
                >
                  <motion.div 
                    layout 
                    className="w-5 h-5 bg-white rounded-full shadow-md" 
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 bg-surface-container-low/30 border-y border-surface-variant/20">
             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-8">App Experience</h4>
             <div className="space-y-8">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-5 font-bold text-on-surface">
                     <Moon size={22} className="text-on-surface-variant" />
                     <span>Dark Mode</span>
                  </div>
                  <button 
                    role="switch" 
                    aria-checked={darkMode}
                    aria-label="Toggle Dark Mode"
                    onClick={toggleDarkMode}
                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center ${
                      darkMode ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'
                    }`}
                  >
                    <motion.div 
                      layout 
                      className="w-5 h-5 bg-white rounded-full shadow-md" 
                    />
                  </button>
                </div>
                
                <div 
                  onClick={() => triggerTooltip('language')}
                  className="flex items-center justify-between hover:translate-x-1 transition-transform cursor-pointer group"
                >
                  <div className="flex items-center gap-5 font-bold text-on-surface">
                     <Globe size={22} className="text-on-surface-variant" />
                     <span>Language</span>
                  </div>
                  <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">English</span>
                </div>
             </div>
          </div>

          <div className="p-8">
            <button 
              onClick={handleLogOut}
              className="w-full py-5 rounded-3xl border-4 border-dashed border-error/20 text-error font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-error/5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <LogOut size={24} />
              Log Out
            </button>
          </div>
        </div>

        <AnimatePresence>
          {activeTooltip === 'language' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-32 left-0 right-0 bg-primary/95 text-white py-2 px-4 rounded-xl text-center font-bold text-xs calm-shadow z-20"
            >
              Multi-language support coming soon!
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            key="edit-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setEditOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 space-y-5 md:space-y-6 calm-shadow relative text-left my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-extrabold text-on-background">Edit Profile</h3>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface">Display Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={40}
                  className="w-full h-14 px-4 rounded-2xl bg-surface-container-low border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-all font-medium text-on-surface"
                  placeholder="Your name"
                />
              </div>

              {/* Base64 Avatar File Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface block">
                  Profile Avatar Image <span className="text-outline font-normal">(Max 2MB)</span>
                </label>
                
                <div className="relative border-4 border-dashed border-outline-variant/30 rounded-2xl p-6 bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col items-center justify-center text-center cursor-pointer group">
                  <Upload size={24} className="text-outline group-hover:text-primary transition-colors mb-2" />
                  <span className="text-xs font-bold text-on-surface-variant group-hover:text-primary">Click to upload photo</span>
                  <span className="text-[10px] text-outline mt-1 font-semibold">Supporting PNG, JPG, or WEBP formats</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {editAvatar && (
                  <div className="flex flex-col items-center justify-center pt-2 gap-1.5">
                    <span className="text-[10px] font-bold text-outline">Active Avatar Preview:</span>
                    <img 
                      src={editAvatar} 
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary/25"
                      onError={(e) => { (e.target as HTMLImageElement).src = IMAGES.avatar; }}
                    />
                  </div>
                )}
              </div>

              {editError && (
                <p className="text-sm font-semibold text-error bg-error/5 px-4 py-2.5 rounded-xl border border-error/10">
                  {editError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 h-14 rounded-2xl border-2 border-outline-variant/30 font-bold text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold calm-shadow hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
