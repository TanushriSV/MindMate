import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../../constants';
import { Screen, Mood } from '../../types';
import { Flame, Sparkles, History, Check, ChevronRight, Wind, Compass } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useEntries } from '../../context/EntriesContext';
import { computeStreak } from '../../utils/stats';
import { useTranslation, Trans } from 'react-i18next';

interface HomeProps {
  onCheckIn: () => void;
  onQuickCheckIn: (mood: Mood) => void;
  onNavigate: (screen: Screen) => void;
}

const getMoodInfo = (mood: string) => {
  switch (mood.toLowerCase()) {
    case 'calm': return { emoji: '😌', label: 'Calm', color: 'text-tertiary bg-tertiary-fixed' };
    case 'happy': return { emoji: '😊', label: 'Happy', color: 'text-primary bg-primary-fixed' };
    case 'thoughtful': return { emoji: '🤔', label: 'Thoughtful', color: 'text-secondary bg-secondary-fixed' };
    case 'tired': return { emoji: '😴', label: 'Tired', color: 'text-on-surface-variant bg-surface-container' };
    case 'low': return { emoji: '😔', label: 'Low', color: 'text-error bg-error/10' };
    case 'sad': return { emoji: '😢', label: 'Sad', color: 'text-blue-500 bg-blue-50' };
    case 'stressed': return { emoji: '🤯', label: 'Stressed', color: 'text-error bg-error/20 ring-4 ring-error/5' };
    case 'neutral': return { emoji: '😐', label: 'Neutral', color: 'text-surface-variant bg-surface-variant/30' };
    default: return { emoji: '✨', label: 'Reflective', color: 'text-primary bg-primary/10' };
  }
};

export default function Home({ onCheckIn, onQuickCheckIn, onNavigate }: HomeProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, hydrated: userHydrated } = useUser();
  const { entries, hydrated: entriesHydrated } = useEntries();
  const hydrated = userHydrated && entriesHydrated;

  const [showToast, setShowToast] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const moods: { emoji: string; label: Mood; displayName: string }[] = [
    { emoji: '😌', label: 'calm', displayName: t('home.moodCalm') },
    { emoji: '😊', label: 'happy', displayName: t('home.moodHappy') },
    { emoji: '😐', label: 'neutral', displayName: t('home.moodNeutral') },
    { emoji: '🤔', label: 'thoughtful', displayName: t('home.moodThoughtful') },
    { emoji: '😴', label: 'tired', displayName: t('home.moodTired') },
    { emoji: '😔', label: 'low', displayName: t('home.moodLow') },
    { emoji: '😢', label: 'sad', displayName: t('home.moodSad') },
    { emoji: '🤯', label: 'stressed', displayName: t('home.moodStressed') },
  ];

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours <= 11) return t('home.morning');
    if (hours >= 12 && hours <= 16) return t('home.afternoon');
    if (hours >= 17 && hours <= 20) return t('home.evening');
    return t('home.greetingDefault');
  };

  const handleMoodClick = (moodLabel: Mood) => {
    onQuickCheckIn(moodLabel);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const triggerTooltip = (id: string) => {
    setActiveTooltip(id);
    setTimeout(() => {
      setActiveTooltip(null);
    }, 2000);
  };

  if (!hydrated || !user) {
    return (
      <div className="space-y-12 pb-12 pt-4 animate-pulse">
        {/* Skeleton Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="h-10 bg-surface-container-high rounded-2xl w-64" />
            <div className="h-5 bg-surface-container-high rounded-xl w-80" />
          </div>
          <div className="h-20 bg-surface-container-high rounded-2xl w-48" />
        </div>

        {/* Skeleton Grid */}
        <div className="space-y-4">
          <div className="h-6 bg-surface-container-high rounded-xl w-40" />
          <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-surface-container-high rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const streak = useMemo(() => computeStreak(entries), [entries]);
  const journalDays = useMemo(() => new Set(
    entries
      .filter(entry => entry.note && entry.note.trim() !== '')
      .map(entry => new Date(entry.timestamp).toDateString())
  ).size, [entries]);

  const todaysCheckins = useMemo(() => entries.filter(
    entry => new Date(entry.timestamp).toDateString() === new Date().toDateString()
  ).length, [entries]);

  const todaysLastEntry = useMemo(() => entries.find(
    entry => new Date(entry.timestamp).toDateString() === new Date().toDateString()
  ), [entries]);

  const todayStats = useMemo(() => ({
    mood: todaysLastEntry ? todaysLastEntry.mood : t('home.noneYet'),
    stress: todaysLastEntry ? `${todaysLastEntry.stressLevel}/10` : t('home.noneYet'),
    anxiety: todaysLastEntry ? todaysLastEntry.anxietyLevel || 'Low' : t('home.noneYet'),
    sleep: todaysLastEntry ? todaysLastEntry.sleepQuality || t('home.noneYet') : t('home.noneYet')
  }), [todaysLastEntry, t]);

  const greetingKey = getGreeting() === t('home.greetingDefault') ? 'home.greetingDefault' : 'home.greeting';
  const greetingText = t(greetingKey, { timeOfDay: getGreeting(), name: user?.name ?? 'there' });

  return (
    <div className="space-y-12 pb-12 pt-4 relative">
      {/* Greeting & Streak */}
      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-4xl font-extrabold text-primary tracking-tight break-words">
            {greetingKey === 'home.greetingDefault' ? `${t('home.greetingDefault')}, ${user?.name ?? 'there'}.` : greetingText}
          </h2>
          <p className="text-lg text-on-surface-variant font-medium mt-2 line-clamp-2">{t('home.momentOfPeace')}</p>
        </div>
        <div className="flex items-center gap-4 bg-secondary-fixed/30 px-6 py-4 rounded-xl calm-shadow border border-secondary-fixed shrink-0">
          <div className="w-12 h-12 flex items-center justify-center bg-secondary-container text-on-secondary-container rounded-full ring-4 ring-secondary-container/20 shrink-0">
            <Flame size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{t('home.currentStreak')}</p>
            <p className="text-2xl font-bold text-on-secondary-fixed">{streak} {streak === 1 ? t('home.day') : t('home.days')}</p>
          </div>
        </div>
      </motion.section>

      {/* Today's Quick Stats Row */}
      <section className="bg-white p-6 rounded-3xl calm-shadow border border-outline-variant/20 space-y-4">
        <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest font-mono">{t('home.todaysStats')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 text-center">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">{t('home.loggedMood')}</span>
            <span className="text-sm font-extrabold capitalize text-on-surface mt-1 block">
              {todayStats.mood === t('home.noneYet') ? todayStats.mood : `${getMoodInfo(todayStats.mood).emoji} ${todayStats.mood}`}
            </span>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 text-center">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">{t('home.stressLevel')}</span>
            <span className="text-sm font-extrabold text-primary mt-1 block">{todayStats.stress}</span>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 text-center">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">{t('home.anxietyRisk')}</span>
            <span className="text-sm font-extrabold text-secondary mt-1 block capitalize">{todayStats.anxiety}</span>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 text-center">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">{t('home.sleepQuality')}</span>
            <span className="text-sm font-extrabold text-tertiary mt-1 block capitalize">{todayStats.sleep}</span>
          </div>
        </div>
      </section>

      {/* Mood Check-in */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-on-surface">{t('home.howAreYouFeeling')}</h3>
          <button
            onClick={() => onNavigate(Screen.History)}
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            {t('home.history')} <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {moods.map((mood) => (
            <motion.button
              key={mood.label}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleMoodClick(mood.label)}
              aria-label={`Log ${mood.displayName} mood`}
              className="flex flex-col items-center justify-center p-5 bg-white calm-shadow rounded-2xl border border-surface-variant/30 hover:border-primary/50 transition-all group cursor-pointer"
            >
              <span className="text-4xl mb-2 drop-shadow-sm">{mood.emoji}</span>
              <span className="text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors w-full text-center truncate">{mood.displayName}</span>
            </motion.button>
          ))}
        </div>

        {/* Deep Check-in Text Link */}
        <div className="text-center pt-2">
          <button
            onClick={onCheckIn}
            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 hover:underline cursor-pointer"
          >
            {t('home.deepCheckInLink')}
          </button>
        </div>
      </section>

      {/* Progress & Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="md:col-span-2 relative overflow-hidden bg-primary text-white p-8 rounded-3xl calm-shadow flex flex-col justify-between min-h-[220px]"
        >
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] text-white/80 font-black uppercase tracking-[0.2em]">{t('home.todaysActivity')}</span>
            <h4 className="text-3xl font-extrabold tracking-tight">{t('home.dailyWellnessCheck')}</h4>
            <p className="text-base font-medium text-white/90">
              <Trans
                i18nKey="home.loggedCheckInsMsg"
                values={{ count: todaysCheckins, s: todaysCheckins === 1 ? '' : 's' }}
                components={{ 1: <strong className="text-amber-300 font-extrabold" /> }}
              />
            </p>
          </div>

          <div className="relative z-10 pt-4 flex gap-3 text-xs font-bold bg-white/10 px-4 py-3 rounded-2xl w-fit">
            <span>{t('home.goalDaily')}</span>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </motion.div>

        <div className="flex flex-col gap-4">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex items-center gap-4 hover:border-primary/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary shadow-sm">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{t('home.totalEvaluations')}</p>
              <p className="text-xl font-bold text-on-surface">{entries.length} {t('home.total')}</p>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex items-center gap-4 hover:border-primary/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/10 flex items-center justify-center text-secondary shadow-sm">
              <History size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{t('home.journalingDays')}</p>
              <p className="text-xl font-bold text-on-surface">{journalDays} {journalDays === 1 ? t('home.day') : t('home.days')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Card Full Width */}
      <div
        className="group relative overflow-hidden p-6 rounded-3xl cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-emerald-500 to-emerald-400 border border-emerald-500/20 calm-shadow mt-6 mb-8"
        onClick={() => onNavigate(Screen.Explore)}
      >
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity group-hover:scale-110 duration-500">
          <Compass size={64} className="text-white" />
        </div>
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
            <Compass size={28} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xl tracking-tight mb-1">{t('home.exploreHub')}</h3>
            <p className="text-emerald-50 text-sm font-medium">{t('home.exploreHubDesc')}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-on-surface">{t('home.recommendedForYou')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => onNavigate(Screen.Breathe)}
            className="bg-white rounded-2xl calm-shadow overflow-hidden border border-surface-variant/30 group cursor-pointer relative"
          >
            <div className="h-48 overflow-hidden">
              <img src={IMAGES.forest} alt="Morning Breathwork" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-3">
                <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded-full uppercase tracking-widest">{t('home.exerciseBadge')}</span>
                <span className="text-on-surface-variant text-xs font-semibold">1 min</span>
              </div>
              <h4 className="text-lg font-bold text-on-surface">{t('home.interactiveBoxBreathing')}</h4>
              <p className="text-sm text-on-surface-variant mt-1 font-medium">{t('home.boxBreathingDesc')}</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => navigate('/journal/new')}
            className="bg-white rounded-2xl calm-shadow overflow-hidden border border-surface-variant/30 group cursor-pointer relative"
          >
            <div className="h-48 overflow-hidden">
              <img src={IMAGES.journalDesk} alt="Daily Reflection" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-3">
                <span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold rounded-full uppercase tracking-widest">{t('home.journalBadge')}</span>
                <span className="text-on-surface-variant text-xs font-semibold">5 min</span>
              </div>
              <h4 className="text-lg font-bold text-on-surface">{t('home.dailyReflectionChamber')}</h4>
              <p className="text-sm text-on-surface-variant mt-1 font-medium">{t('home.dailyReflectionDesc')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Confirmation Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 100, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 100, opacity: 0, x: '-50%' }}
            style={{ left: '50%' }}
            className="fixed bottom-24 bg-primary text-white font-bold px-6 py-3.5 rounded-2xl calm-shadow flex items-center gap-3 z-50 text-sm w-max max-w-[90vw]"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
            <span>{t('home.loggedToast')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
