import fs from 'fs';
import path from 'path';

const screens = [
  'JournalHome', 'JournalEntry', 'JournalView',
  'Grounding', 'BodyScan', 'CBTDiary', 'Affirmations', 'GoalSetting', 'HabitTracker',
  'ResourceLibrary', 'ArticleList', 'ArticleReader',
  'SleepTracker', 'DetailedAnalytics', 'Achievements', 'DailyChallenges',
  'CrisisSupport', 'CommunityForums', 'ForumPost',
  'SettingsNotifications', 'SettingsPrivacy',
  'Explore' // the hub
];

const dir = 'c:/Users/Tanushri/Downloads/MindMate/MindMate-main/src/components/screens';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

screens.forEach(name => {
  const content = `import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ${name}() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full w-full max-w-2xl mx-auto py-8 px-4 font-sans"
    >
      <div className="flex items-center mb-6 gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-variant rounded-full text-on-surface transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-on-background tracking-tight">${name.replace(/([A-Z])/g, ' $1').trim()}</h1>
      </div>
      
      <div className="flex-1 bg-surface-container rounded-3xl p-8 border border-outline-variant/30 calm-shadow flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 text-2xl">
          ✨
        </div>
        <h2 className="text-lg font-bold text-on-surface mb-2">Coming Soon</h2>
        <p className="text-on-surface-variant text-sm max-w-sm leading-relaxed">
          The ${name.replace(/([A-Z])/g, ' $1').trim()} feature is currently under construction.
        </p>
      </div>
    </motion.div>
  );
}
`;
  
  const filePath = path.join(dir, `${name}.tsx`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created ${name}.tsx`);
  }
});
