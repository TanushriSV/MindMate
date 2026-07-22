import { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, Mood, MoodEntry } from './types';
import BottomNav from './components/BottomNav';
import TopBar from './components/TopBar';
import { useUser } from './context/UserContext';
import { useEntries } from './context/EntriesContext';
import { useDailyInsight } from './hooks/useDailyInsight';
import { useToast } from './context/ToastContext';

// Screens
import Splash from './components/screens/Splash';
import SignIn from './components/screens/SignIn';
import Home from './components/screens/Home';

// Lazy Loaded Screens
const CheckIn = lazy(() => import('./components/screens/CheckIn'));
const HistoryScreen = lazy(() => import('./components/screens/History'));
const Profile = lazy(() => import('./components/screens/Profile'));
const Chat = lazy(() => import('./components/screens/Chat'));
const Breathe = lazy(() => import('./components/screens/Breathe'));
const ResetPassword = lazy(() => import('./components/screens/ResetPassword'));

// New 22 Screens
const Explore = lazy(() => import('./components/screens/Explore'));
const JournalHome = lazy(() => import('./components/screens/JournalHome'));
const JournalEntry = lazy(() => import('./components/screens/JournalEntry'));
const JournalView = lazy(() => import('./components/screens/JournalView'));
const Grounding = lazy(() => import('./components/screens/Grounding'));
const BodyScan = lazy(() => import('./components/screens/BodyScan'));
const CBTDiary = lazy(() => import('./components/screens/CBTDiary'));
const Affirmations = lazy(() => import('./components/screens/Affirmations'));
const GoalSetting = lazy(() => import('./components/screens/GoalSetting'));
const HabitTracker = lazy(() => import('./components/screens/HabitTracker'));
const ResourceLibrary = lazy(() => import('./components/screens/ResourceLibrary'));
const ArticleList = lazy(() => import('./components/screens/ArticleList'));
const ArticleReader = lazy(() => import('./components/screens/ArticleReader'));
const SleepTracker = lazy(() => import('./components/screens/SleepTracker'));
const DetailedAnalytics = lazy(() => import('./components/screens/DetailedAnalytics'));
const Achievements = lazy(() => import('./components/screens/Achievements'));
const DailyChallenges = lazy(() => import('./components/screens/DailyChallenges'));
const CrisisSupport = lazy(() => import('./components/screens/CrisisSupport'));
const CommunityForums = lazy(() => import('./components/screens/CommunityForums'));
const ForumPost = lazy(() => import('./components/screens/ForumPost'));
const SettingsNotifications = lazy(() => import('./components/screens/SettingsNotifications'));
const SettingsPrivacy = lazy(() => import('./components/screens/SettingsPrivacy'));

function ProtectedLayout() {
  const { user } = useUser();
  const location = useLocation();
  const dailyInsight = useDailyInsight();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showReminder, setShowReminder] = useState(false);
  const [currentReminder, setCurrentReminder] = useState("");

  const wellnessReminders = [
    "Drop your shoulders, release the tension in your jaw, and take a slow, gentle breath. You're doing amazing.",
    "Take a 5-second pause to listen to the quiet sounds around you. Let your racing thoughts settle.",
    "Remember to hydrate and take brief stretching breaks. College life is a marathon, and you need to rest.",
    "Your academic productivity does not define your worth. Be exceptionally kind to yourself today.",
    "Give your eyes a screen break: look at something 20 feet away for 20 seconds. Let your mind take a breather.",
    "It is completely okay if you didn't get everything done today. Rest is an essential part of the progress.",
    "Take one slow, deep breath right now, and let go of whatever you're holding on to."
  ];

  // Warm gentle startup reminder toast
  useEffect(() => {
    if (user && localStorage.getItem('mindmate_pref_dailyReminders') === 'true') {
      const timer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * wellnessReminders.length);
        const reminderText = wellnessReminders[randomIndex];
        toast(`MindMate Notice: ${reminderText}`, 'info');
      }, 4000); // Trigger 4 seconds after mounting
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleNotificationsClick = () => {
    const isRemindersOn = localStorage.getItem('mindmate_pref_dailyReminders') === 'true';
    if (!isRemindersOn) {
      setCurrentReminder("Daily reminders are currently off. You can easily turn them on in your Profile settings to receive gentle mindfulness prompts!");
    } else {
      const randomIndex = Math.floor(Math.random() * wellnessReminders.length);
      setCurrentReminder(wellnessReminders[randomIndex]);
    }
    setShowReminder(true);
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const getCurrentScreenFromPath = (path: string): Screen => {
    const p = path.toLowerCase();
    if (p.includes('/home')) return Screen.Home;
    if (p.includes('/check-in') || p.includes('/checkin')) return Screen.CheckIn;
    if (p.includes('/chat')) return Screen.Chat;
    if (p.includes('/history')) return Screen.History;
    if (p.includes('/profile')) return Screen.Profile;
    if (p.includes('/breathe')) return Screen.Breathe;
    if (p.includes('/explore')) return Screen.Explore;
    if (p.includes('/signin')) return Screen.SignIn;
    return Screen.Splash;
  };

  const currentScreen = getCurrentScreenFromPath(location.pathname);

  const handleNavigate = (s: Screen) => {
    if (s === Screen.CheckIn) {
      navigate('/check-in');
    } else if (s === Screen.SignIn) {
      navigate('/signin');
    } else if (s === Screen.Splash) {
      navigate('/');
    } else {
      navigate('/' + s);
    }
  };

  return (
    <motion.div
      key="app-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col pt-16 md:pt-28"
    >
      <TopBar onProfileClick={() => navigate('/profile')} onNotificationsClick={handleNotificationsClick} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-16 pb-28 md:pb-12 mt-4">
        {/* Dynamic Insight on Home Screen */}
        {currentScreen === Screen.Home && (
          <div className="mb-10 p-6 rounded-3xl bg-primary-container/20 border border-primary/10 calm-shadow flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center calm-shadow ring-8 ring-primary/5 shrink-0">
              <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-2xl">✨</motion.span>
            </div>
            <div>
              <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">MindMate Insight</h5>
              <p className="text-lg font-bold text-on-primary-fixed leading-tight italic">"{dailyInsight}"</p>
            </div>
          </div>
        )}

        <Suspense fallback={
          <div role="status" aria-label="Loading screen" className="flex-1 flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" aria-hidden="true" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>

      {/* Mindfulness Notification Overlay/Modal Fallback */}
      <AnimatePresence>
        {showReminder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReminder(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-surface rounded-3xl p-6 border border-outline-variant/30 calm-shadow flex flex-col items-center text-center gap-4 z-10"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl">
                🔔
              </div>
              <div className="px-2">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-1.5">
                  MindMate Reminder
                </h4>
                <p className="text-on-surface font-semibold text-sm leading-relaxed mt-1">
                  "{currentReminder}"
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setShowReminder(false)}
                className="w-full py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-md"
              >
                Got it, thank you
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav 
        currentScreen={currentScreen} 
        onNavigate={handleNavigate} 
      />
    </motion.div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const { user, setUser, hydrated: userHydrated } = useUser();
  const { addEntry } = useEntries();

  const handleCheckInComplete = (entry: Partial<MoodEntry>) => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: entry.mood || 'calm',
      timestamp: Date.now(),
      stressLevel: entry.stressLevel,
      sleepQuality: entry.sleepQuality,
      ...entry
    };
    addEntry(newEntry);
    navigate('/history');
  };

  const handleQuickCheckIn = (mood: Mood) => {
    let stressLevel = 4;
    let anxietyLevel: 'Low' | 'Moderate' | 'High' = 'Low';
    let anxietyScore = 1;

    switch (mood) {
      case 'calm':
        stressLevel = 2;
        anxietyLevel = 'Low';
        anxietyScore = 1;
        break;
      case 'happy':
        stressLevel = 2;
        anxietyLevel = 'Low';
        anxietyScore = 0;
        break;
      case 'thoughtful':
        stressLevel = 3;
        anxietyLevel = 'Low';
        anxietyScore = 1;
        break;
      case 'tired':
        stressLevel = 5;
        anxietyLevel = 'Low';
        anxietyScore = 2;
        break;
      case 'low':
        stressLevel = 6;
        anxietyLevel = 'Moderate';
        anxietyScore = 4;
        break;
      case 'sad':
        stressLevel = 5;
        anxietyLevel = 'Moderate';
        anxietyScore = 3;
        break;
      case 'stressed':
        stressLevel = 8;
        anxietyLevel = 'High';
        anxietyScore = 6;
        break;
      case 'neutral':
      default:
        stressLevel = 4;
        anxietyLevel = 'Low';
        anxietyScore = 2;
    }

    const quickEntry: MoodEntry = {
      id: Date.now().toString(),
      mood,
      timestamp: Date.now(),
      stressLevel,
      sleepQuality: mood === 'tired' ? 'restless' : 'fair',
      anxietyLevel,
      anxietyScore,
      stressIndicators: [],
      note: ''
    };
    addEntry(quickEntry);
  };

  const handleNavigate = (s: Screen) => {
    if (s === Screen.CheckIn) {
      navigate('/check-in');
    } else if (s === Screen.SignIn) {
      navigate('/signin');
    } else if (s === Screen.Splash) {
      navigate('/');
    } else {
      navigate('/' + s);
    }
  };

  if (!userHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 bg-background text-on-surface">
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/home" replace /> : (
                <motion.div
                  key="splash"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1"
                >
                  <Splash 
                    onBegin={() => navigate('/signin')} 
                    onSignIn={() => navigate('/signin')} 
                  />
                </motion.div>
              )
            } 
          />
          <Route 
            path="/signin" 
            element={
              user ? <Navigate to="/home" replace /> : (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="flex-1"
                >
                  <SignIn 
                    onSignIn={(signedInUser) => {
                      setUser(signedInUser);
                      navigate('/home', { replace: true });
                    }}
                    onBack={() => navigate('/')}
                  />
                </motion.div>
              )
            } 
          />

          <Route 
            path="/reset-password" 
            element={
              user ? <Navigate to="/home" replace /> : (
                <motion.div
                  key="reset-password"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="flex-1"
                >
                  <Suspense fallback={
                    <div role="status" aria-label="Loading screen" className="flex-1 flex items-center justify-center min-h-[40vh]">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" aria-hidden="true" />
                    </div>
                  }>
                    <ResetPassword />
                  </Suspense>
                </motion.div>
              )
            } 
          />

          {/* Secure Authenticated Layover Routes */}
          <Route element={<ProtectedLayout />}>
            <Route 
              path="/home" 
              element={
                <Home 
                  onCheckIn={() => navigate('/check-in')} 
                  onQuickCheckIn={handleQuickCheckIn}
                  onNavigate={handleNavigate}
                />
              } 
            />
            <Route 
              path="/check-in" 
              element={
                <CheckIn 
                  onComplete={handleCheckInComplete}
                  onCancel={() => navigate('/home')}
                  onNavigateToChat={() => navigate('/chat')}
                />
              } 
            />
            <Route path="/chat" element={<Chat />} />
            <Route 
              path="/history" 
              element={<HistoryScreen onNavigate={handleNavigate} />} 
            />
            <Route 
              path="/profile" 
              element={
                <Profile onSignOut={() => navigate('/', { replace: true })} />
              } 
            />
            <Route path="/breathe" element={<Breathe />} />

            {/* New Routes */}
            <Route path="/explore" element={<Explore />} />
            <Route path="/journal" element={<JournalHome />} />
            <Route path="/journal/new" element={<JournalEntry />} />
            <Route path="/journal/:id" element={<JournalView />} />
            <Route path="/grounding" element={<Grounding />} />
            <Route path="/body-scan" element={<BodyScan />} />
            <Route path="/cbt" element={<CBTDiary />} />
            <Route path="/affirmations" element={<Affirmations />} />
            <Route path="/goals" element={<GoalSetting />} />
            <Route path="/habits" element={<HabitTracker />} />
            <Route path="/resources" element={<ResourceLibrary />} />
            <Route path="/resources/:category" element={<ArticleList />} />
            <Route path="/resources/:category/:id" element={<ArticleReader />} />
            <Route path="/sleep" element={<SleepTracker />} />
            <Route path="/analytics" element={<DetailedAnalytics />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/challenges" element={<DailyChallenges />} />
            <Route path="/crisis" element={<CrisisSupport />} />
            <Route path="/forums" element={<CommunityForums />} />
            <Route path="/forums/:id" element={<ForumPost />} />
            <Route path="/settings/notifications" element={<SettingsNotifications />} />
            <Route path="/settings/privacy" element={<SettingsPrivacy />} />
          </Route>

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to={user ? "/home" : "/"} replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
