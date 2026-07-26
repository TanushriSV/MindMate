import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, AlertCircle, Calendar, MessageCircle, ChevronRight, Check } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { IMAGES } from '../../constants';
import { Screen, MoodEntry } from '../../types';
import { useEntries } from '../../context/EntriesContext';

interface HistoryScreenProps {
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

export default function HistoryScreen({ onNavigate }: HistoryScreenProps) {
  const { entries, deleteEntry, hydrated } = useEntries();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter States
  const [dateFilter, setDateFilter] = useState<'All' | 'Week' | 'Month'>('All');
  const [moodFilter, setMoodFilter] = useState<string>('All');

  const triggerTooltip = (id: string) => {
    setActiveTooltip(id);
    setTimeout(() => {
      setActiveTooltip(null);
    }, 2000);
  };

  // 14 Days Stress and Anxiety Trend Chart Data Computation
  const chartData = useMemo(() => {
    if (entries.length === 0) return [];
    
    const now = Date.now();
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
    const recentEntries = entries.filter(e => e.timestamp >= fourteenDaysAgo);

    const groupMap = new Map<string, { totalStress: number; count: number; timestamp: number }>();

    recentEntries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const existing = groupMap.get(dateStr) || { totalStress: 0, count: 0, timestamp: entry.timestamp };
      groupMap.set(dateStr, {
        totalStress: existing.totalStress + (entry.stressLevel ?? 4),
        count: existing.count + 1,
        timestamp: Math.min(existing.timestamp, entry.timestamp)
      });
    });

    const list = Array.from(groupMap.entries()).map(([dateStr, stats]) => ({
      date: dateStr,
      stress: Math.round((stats.totalStress / stats.count) * 10) / 10,
      timestamp: stats.timestamp
    }));

    // Sort chronologically
    return list.sort((a, b) => a.timestamp - b.timestamp);
  }, [entries]);

  // Weekly Stats Calculation Card
  const weeklyStats = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyEntries = entries.filter(e => e.timestamp >= sevenDaysAgo);
    
    if (weeklyEntries.length === 0) {
      return {
        avgStress: 'N/A',
        commonMood: 'None',
        totalCheckins: 0
      };
    }

    const totalStress = weeklyEntries.reduce((sum, e) => sum + (e.stressLevel ?? 4), 0);
    const avgStress = (totalStress / weeklyEntries.length).toFixed(1);

    const moodCounts: Record<string, number> = {};
    weeklyEntries.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });

    let commonMood = 'None';
    let maxCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        commonMood = mood;
      }
    });

    return {
      avgStress,
      commonMood: commonMood.charAt(0).toUpperCase() + commonMood.slice(1),
      totalCheckins: weeklyEntries.length
    };
  }, [entries]);

  // Frontend Filtering
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      // Date constraints
      if (dateFilter === 'Week') {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (e.timestamp < sevenDaysAgo) return false;
      } else if (dateFilter === 'Month') {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        if (e.timestamp < thirtyDaysAgo) return false;
      }

      // Mood tags constraints
      if (moodFilter !== 'All') {
        if (e.mood.toLowerCase() !== moodFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [entries, dateFilter, moodFilter]);

  const avgStressEver = entries.length > 0 
    ? (entries.reduce((sum, e) => sum + (e.stressLevel ?? 4), 0) / entries.length).toFixed(1)
    : '0';

  if (!hydrated) {
    return (
      <div className="space-y-12 pb-12 pt-4 animate-pulse">
        <div className="space-y-3">
          <div className="h-10 bg-surface-container-high rounded-2xl w-48" />
          <div className="h-5 bg-surface-container-high rounded-xl w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 h-80 bg-surface-container-high rounded-3xl" />
          <div className="md:col-span-4 h-80 bg-surface-container-high rounded-3xl" />
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-12 pb-12 pt-4">
        <section className="space-y-4">
          <h1 className="text-4xl font-extrabold text-on-background tracking-tight">Your Journey</h1>
          <p className="text-lg text-on-surface-variant font-medium max-w-2xl leading-relaxed">
            Reflecting on your physical tension, sleep, and emotional patterns helps build resilience. Here is your evaluation history.
          </p>
        </section>

        <section className="bg-white rounded-3xl p-12 calm-shadow border-2 border-dashed border-outline-variant/40 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl">
            📅
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-bold text-on-background">Your sanctuary journal is empty</h3>
            <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
              Every mindful check-in you log helps chart your tension oscillations, somatic symptoms, and AI stress trends. Let's do your first check-in now.
            </p>
          </div>
          <button 
            onClick={() => onNavigate(Screen.CheckIn)}
            className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all text-sm cursor-pointer"
          >
            Start your first check-in
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12 pt-4 relative">
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold text-on-background tracking-tight">Your Journey</h1>
        <p className="text-lg text-on-surface-variant font-medium max-w-2xl leading-relaxed">
          Reflecting on your physical tension, sleep, and emotional patterns helps build resilience. Here is your evaluation history.
        </p>
      </section>

      {/* Interactive Trend Chart Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-8 bg-white rounded-3xl p-8 calm-shadow border border-surface-variant/30 flex flex-col relative">
          <div>
            <h2 className="text-2xl font-bold text-on-background">Stress level trajectory (Last 14 Days)</h2>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Average daily check-in stress indices</p>
          </div>

          <div className="h-64 w-full mt-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                  <XAxis dataKey="date" stroke="#888888" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="#888888" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', background: '#333', color: '#fff', border: 'none' }}
                    labelStyle={{ fontWeight: 'black', color: '#9A82DB' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stress" 
                    stroke="#6750A4" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#6750A4', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 7 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-outline font-medium">
                No check-in entries in the past 14 days. Create entries to generate stats.
              </div>
            )}
          </div>
        </div>

        {/* Highlight Weekly Summary Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Weekly Summary Card */}
          <div className="bg-primary/5 border-2 border-primary/10 rounded-3xl p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-3 text-primary mb-4 ring-2 ring-primary/20 w-fit px-3 py-1 rounded-full bg-white/55">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-widest font-mono">This Week Summary</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-on-surface-variant">Avg Stress Level</span>
                  <span className="text-lg font-extrabold text-primary">{weeklyStats.avgStress} <span className="text-xs font-medium text-outline">/ 10</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-on-surface-variant">Dominant Mood</span>
                  <span className="text-lg font-extrabold text-tertiary">{weeklyStats.commonMood}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-on-surface-variant">Total Check-ins</span>
                  <span className="text-lg font-extrabold text-on-surface">{weeklyStats.totalCheckins} logs</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/30 mt-6 text-xs font-semibold text-on-surface-variant">
              Pattern correlations are computed from evaluations logged in the past week.
            </div>
          </div>

          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/30">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6 font-mono">Sanctuary stats</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-on-surface-variant">All-Time Stress</span>
                <span className="text-xl font-bold text-primary">{avgStressEver} / 10</span>
              </div>
              <div className="w-full bg-surface-variant/30 h-3 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${parseFloat(avgStressEver) * 10}%` }}
                   transition={{ duration: 1 }}
                   className="bg-primary h-full rounded-full" 
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-on-surface-variant uppercase tracking-widest pt-2">
                <span>Journal Entries</span>
                <span>{entries.length} total</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Historical logs filters */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-4">
          <h2 className="text-3xl font-bold text-on-background">Recent Logs & Evaluations</h2>
          
          {/* Frontend filters row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date filter toggle */}
            <div className="bg-surface-container-high rounded-xl p-1 flex border border-outline-variant/20">
              {(['All', 'Week', 'Month'] as const).map(option => (
                <button
                  key={option}
                  onClick={() => setDateFilter(option)}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-transform cursor-pointer ${
                    dateFilter === option 
                      ? 'bg-primary text-white scale-102 shadow-sm' 
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {option === 'All' ? 'All' : option === 'Week' ? 'This Week' : 'This Month'}
                </button>
              ))}
            </div>

            {/* Mood filter dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase text-outline font-mono">Mood:</span>
              <select
                value={moodFilter}
                onChange={(e) => setMoodFilter(e.target.value)}
                className="bg-white border border-outline-variant/40 rounded-xl px-4 py-2 text-xs font-bold text-on-surface outline-none focus:border-primary"
              >
                <option value="All">All Moods</option>
                <option value="happy">😊 Happy</option>
                <option value="calm">😌 Calm</option>
                <option value="thoughtful">🤔 Thoughtful</option>
                <option value="tired">😴 Tired</option>
                <option value="low">😔 Low</option>
                <option value="sad">😢 Sad</option>
                <option value="stressed">🤯 Stressed</option>
                <option value="neutral">😐 Neutral</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredEntries.length === 0 ? (
          <div className="text-center bg-surface-container-low rounded-3xl p-12 text-outline-variant border border-outline-variant/10">
            <p className="text-sm font-bold text-outline">No logs match the current active filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEntries.map((entry) => {
              const moodUnit = getMoodInfo(entry.mood);
              const entryDate = new Date(entry.timestamp).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <motion.div 
                  key={entry.id}
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-3xl p-8 calm-shadow border border-surface-variant/20 hover:border-primary/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${moodUnit.color}`}>
                          {moodUnit.emoji}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-on-background capitalize">
                            {entry.mood} State
                          </h4>
                          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mt-0.5 font-mono">
                            {entryDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[10px] font-black uppercase text-outline tracking-wider font-mono">Stress Index</span>
                        <span className="text-lg font-black text-primary">
                          {entry.stressLevel} <span className="text-xs font-normal text-outline">/ 10</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-on-surface-variant leading-relaxed mb-6">
                      {entry.note || "Logged a simple centered check-in to balance mind frequency."}
                    </p>

                    {entry.stressIndicators && entry.stressIndicators.length > 0 && (
                      <div className="mb-6 space-y-1.5">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-wider font-mono">Somatic Symptoms:</p>
                        <div className="flex flex-wrap gap-1">
                          {entry.stressIndicators.map(id => (
                            <span key={id} className="text-[10px] font-bold px-2.5 py-0.5 bg-surface-container-low text-on-surface-variant rounded-full border border-outline-variant/10 capitalize">
                              • {id.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-surface-variant/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
                          Anxiety: {entry.anxietyLevel || 'Low'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 justify-end max-w-xs">
                        {entry.tags?.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-[10px] font-bold tracking-widest border border-outline-variant/10 uppercase font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Inline check-in delete confirmation */}
                    {deletingId === entry.id ? (
                      <div className="bg-error/5 p-3 rounded-xl border border-error/20 flex justify-between items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-error">Delete log?</span>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await deleteEntry(entry.id);
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setDeletingId(null);
                              }
                            }}
                            className="bg-error text-white font-extrabold text-[9px] rounded-lg py-1 px-2.5 uppercase tracking-wider hover:bg-error/90 cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="bg-white border border-outline-variant text-on-surface font-extrabold text-[9px] rounded-lg py-1 px-2.5 hover:bg-surface-container-low cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(entry.id)}
                        className="text-[10px] font-black text-outline hover:text-error transition-colors text-right uppercase self-end font-mono cursor-pointer"
                      >
                        Delete evaluation
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Map Premium Promo */}
      <section className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row calm-shadow border border-surface-variant/30 relative">
        <div className="md:w-1/2 p-10 md:p-14 space-y-6">
          <span className="px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold uppercase tracking-widest ring-4 ring-tertiary-fixed/30 font-mono">New Feature</span>
          <h3 className="text-4xl font-extrabold text-on-background tracking-tight">Emotional Weather Mapping</h3>
          <p className="text-lg text-on-surface-variant font-medium leading-relaxed">
            We've introduced a new way to visualize your monthly mood patterns. See how external factors like weather and activity levels affect your inner peace.
          </p>
          <div className="relative">
            <button 
              onClick={() => triggerTooltip('explore_map')}
              className="bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Explore Map
            </button>
            
            <AnimatePresence>
              {activeTooltip === 'explore_map' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-16 left-0 bg-primary/95 text-white py-2 px-4 rounded-xl text-center font-bold text-xs calm-shadow z-20 w-fit"
                >
                  Emotional Weather Mapping coming soon!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="md:w-1/2 h-80 md:h-auto bg-primary-fixed relative">
          <img src={IMAGES.hillSunrise} alt="Abstract landscape" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent hidden md:block" />
        </div>
      </section>
    </div>
  );
}
