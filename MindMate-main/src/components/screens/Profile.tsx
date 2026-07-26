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
import { useTranslation } from 'react-i18next';

interface ProfileProps {
  onSignOut: () => void;
}

export default function Profile({ onSignOut }: ProfileProps) {
  const { t, i18n } = useTranslation();
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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

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
            setDailyReminders(true);
            try {
              localStorage.setItem('mindmate_pref_dailyReminders', 'true');
              localStorage.setItem('mindmate_pref_inAppNotificationsOnly', 'true');
            } catch (err) {}
            setPreferenceFeedback("Push permission denied. MindMate in-app reminders enabled instead!");
          }
        } catch (e) {
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
    { label: t('profile.dayStreak'), val: String(streak), color: 'text-primary border-primary', textColor: 'text-primary', icon: Flame },
    { label: t('profile.totalCheckIns'), val: String(entries.length), color: 'text-tertiary border-tertiary', textColor: 'text-tertiary', icon: Timer },
    { label: t('profile.journaledDays'), val: String(journalDays), color: 'text-secondary border-secondary', textColor: 'text-secondary', icon: Award },
  ];

  const totalEntries = entries.length;
  const achievements = [
    { id: 1, title: t('profile.achievementsList.firstStep'), sub: t('profile.achievementsList.firstStepSub'), completed: totalEntries >= 1 },
    { id: 2, title: t('profile.achievementsList.consistency'), sub: t('profile.achievementsList.consistencySub'), completed: streak >= 3 },
    { id: 3, title: t('profile.achievementsList.selfAware'), sub: t('profile.achievementsList.selfAwareSub'), completed: totalEntries >= 10 },
    { id: 4, title: t('profile.achievementsList.zenMaster'), sub: t('profile.achievementsList.zenMasterSub'), completed: entries.filter(e => e.mood === 'calm').length >= 5 },
  ];

  const formattedJoinDate = user?.joinDate 
    ? new Date(user.joinDate).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })
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
        <div 
          className="relative cursor-pointer group"
          onClick={() => {
            setEditName(user?.name ?? '');
            setEditAvatar(user?.avatar ?? '');
            setEditError(null);
            setEditOpen(true);
          }}
        >
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden calm-shadow border-4 border-white ring-8 ring-primary/5 group-hover:ring-primary/20 transition-all">
            <img src={user?.avatar ?? IMAGES.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-2 right-2 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
            <Upload size={18} />
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold text-on-background tracking-tight">{user?.name ?? 'Alex'}</h2>
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mt-2 px-6 py-1.5 bg-surface-container-low rounded-full w-fit mx-auto border border-outline-variant/20">
            {t('profile.calmSeekerSince', { date: formattedJoinDate })}
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
            {t('profile.editProfile')}
          </button>
          <button 
            onClick={handleExportData}
            aria-label="Export personal history as JSON"
            className="px-6 py-3 bg-white text-primary font-bold rounded-2xl border-2 border-primary/15 hover:bg-surface-container-low transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download size={16} /> {t('profile.exportData')}
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
          <h3 className="text-2xl font-bold text-on-background">{t('profile.achievements')}</h3>
          <button 
            onClick={() => navigate('/achievements')}
            className="text-primary font-bold text-sm hover:underline cursor-pointer"
          >
            {t('profile.viewAll')}
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
        <h3 className="text-2xl font-bold text-on-background px-2">{t('profile.preferences')}</h3>
        <div className="bg-white rounded-[2.5rem] calm-shadow overflow-hidden border border-surface-variant/30">
          <div className="p-8">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-8">{t('profile.accountPrivacy')}</h4>
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 md:gap-5 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary transition-transform shrink-0">
                    <Shield size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-on-surface truncate">{t('profile.publicProfile')}</p>
                    <p className="text-xs font-semibold text-on-surface-variant line-clamp-2">{t('profile.publicProfileDescAlt')}</p>
                  </div>
                </div>
                <button 
                  role="switch" 
                  aria-checked={publicProfile}
                  aria-label="Toggle Public Profile"
                  onClick={handleTogglePublicProfile}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center shrink-0 ${
                    publicProfile ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'
                  }`}
                >
                  <motion.div 
                    layout 
                    className="w-5 h-5 bg-white rounded-full shadow-md" 
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 md:gap-5 min-w-0 flex-1">
                   <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary transition-transform shrink-0">
                    <Bell size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-on-surface truncate">{t('profile.dailyReminders')}</p>
                    <p className="text-xs font-semibold text-on-surface-variant line-clamp-2">{t('profile.dailyRemindersDescAlt')}</p>
                  </div>
                </div>
                <button 
                  role="switch" 
                  aria-checked={dailyReminders}
                  aria-label="Toggle Daily Reminders"
                  onClick={handleToggleDailyReminders}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center shrink-0 ${
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
             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-8">{t('profile.appExperience')}</h4>
             <div className="space-y-8">
                <div className="flex items-center justify-between group gap-4">
                  <div className="flex items-center gap-4 md:gap-5 font-bold text-on-surface min-w-0 flex-1">
                     <Moon size={22} className="text-on-surface-variant shrink-0" />
                     <span className="truncate">{t('profile.darkMode')}</span>
                  </div>
                  <button 
                    role="switch" 
                    aria-checked={darkMode}
                    aria-label="Toggle Dark Mode"
                    onClick={toggleDarkMode}
                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center shrink-0 ${
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
                  className="flex items-center justify-between group gap-4"
                >
                  <div className="flex items-center gap-4 md:gap-5 font-bold text-on-surface min-w-0 flex-1">
                     <Globe size={22} className="text-on-surface-variant shrink-0" />
                     <span className="truncate">{t('profile.language')}</span>
                  </div>
                  <select 
                    value={i18n.language.split('-')[0]} // use prefix like 'en' from 'en-US'
                    onChange={handleLanguageChange}
                    className="text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-full border border-primary/10 cursor-pointer outline-none hover:bg-primary/10 transition-colors shrink-0 max-w-[120px] truncate"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
             </div>
          </div>

          <div className="p-8">
            <button 
              onClick={handleLogOut}
              className="w-full py-5 rounded-3xl border-4 border-dashed border-error/20 text-error font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-error/5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <LogOut size={24} />
              {t('profile.logout')}
            </button>
          </div>
        </div>
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
              <h3 className="text-2xl font-extrabold text-on-background">{t('profile.editProfile')}</h3>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface">{t('profile.displayName')}</label>
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
                  {t('profile.avatar')} <span className="text-outline font-normal">{t('profile.max2MB')}</span>
                </label>
                
                <label className="relative border-4 border-dashed border-outline-variant/30 rounded-2xl p-6 bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col items-center justify-center text-center cursor-pointer group">
                  <Upload size={24} className="text-outline group-hover:text-primary transition-colors mb-2" />
                  <span className="text-xs font-bold text-on-surface-variant group-hover:text-primary">{t('profile.clickToUpload')}</span>
                  <span className="text-[10px] text-outline mt-1 font-semibold">{t('profile.supportingFormats')}</span>
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {editAvatar && (
                  <div className="flex flex-col items-center justify-center pt-2 gap-1.5">
                    <span className="text-[10px] font-bold text-outline">{t('profile.activeAvatarPreview')}</span>
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
                  {t('profile.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold calm-shadow hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {saving ? t('profile.saving') : t('profile.saveChanges')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
