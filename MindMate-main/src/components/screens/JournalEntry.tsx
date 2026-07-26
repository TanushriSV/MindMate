import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MessageCircle, Sparkles, BookOpen, PenTool, CheckCircle, ShieldCheck } from 'lucide-react';
import { useEntries } from '../../context/EntriesContext';
import { useToast } from '../../context/ToastContext';
import { generateJournalFeedback } from '../../services/geminiService';
import { Mood } from '../../types';

type FlowStep = 'mood' | 'mode' | 'writing_guided' | 'writing_free' | 'feedback';

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy', gradient: 'from-amber-400 to-orange-400' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', gradient: 'from-surface-variant to-outline-variant' },
  { id: 'sad', emoji: '😔', label: 'Sad', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'stressed', emoji: '😫', label: 'Stressed', gradient: 'from-error to-rose-600' }
];

export default function JournalEntry() {
  const navigate = useNavigate();
  const { addEntry } = useEntries();
  const { success, error } = useToast();
  
  const [step, setStep] = useState<FlowStep>('mood');
  const [mood, setMood] = useState<string>('');
  
  // Guided content
  const [guidedQ1, setGuidedQ1] = useState('');
  const [guidedQ2, setGuidedQ2] = useState('');
  const [guidedQ3, setGuidedQ3] = useState('');
  
  // Free content
  const [freeContent, setFreeContent] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>('');

  const currentMoodObj = MOODS.find(m => m.id === mood) || MOODS[1];

  const handleModeSelect = (mode: 'guided' | 'free') => {
    setStep(mode === 'guided' ? 'writing_guided' : 'writing_free');
  };

  const submitJournal = async () => {
    const isGuided = step === 'writing_guided';
    let combinedContent = '';
    
    if (isGuided) {
      if (!guidedQ1.trim() && !guidedQ2.trim() && !guidedQ3.trim()) {
        error("Please write at least a few words.");
        return;
      }
      combinedContent = `1. What happened: ${guidedQ1}\n2. How it made me feel: ${guidedQ2}\n3. What I learned: ${guidedQ3}`;
    } else {
      if (!freeContent.trim()) {
        error("Please write something before saving.");
        return;
      }
      combinedContent = freeContent;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Generate AI Feedback
      const feedback = await generateJournalFeedback(combinedContent, mood);
      setAiFeedback(feedback);
      
      // 2. Save to DB/Local Storage
      await addEntry({
        id: Date.now().toString(),
        mood: mood as Mood,
        timestamp: Date.now(),
        note: combinedContent,
        tags: ['Journal', isGuided ? 'Guided' : 'FreeFlow'],
        stressLevel: mood === 'stressed' ? 8 : mood === 'sad' ? 6 : mood === 'happy' ? 2 : 5,
        anxietyLevel: mood === 'stressed' ? 'High' : 'Low',
        aiFeedback: feedback,
        journalMode: isGuided ? 'guided' : 'free'
      });
      
      // 3. Move to Feedback Screen
      setStep('feedback');
      success("Reflection secured safely.");
      
    } catch (e) {
      error("Something went wrong while saving your reflection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const talkToMindMate = () => {
    // Send them to chat. A future enhancement could pass the context in navigation state.
    navigate('/chat');
  };

  return (
    <div className="min-h-[100vh] w-full flex flex-col font-sans transition-all duration-1000 ease-in-out bg-surface relative">
      {/* Dynamic Ambient Background based on Mood */}
      <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${currentMoodObj.gradient} transition-colors duration-1000`} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col h-full w-full max-w-2xl mx-auto py-8 px-4 pb-24"
      >
        {/* Universal Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => step === 'feedback' ? navigate('/home') : navigate(-1)}
              className="p-2 hover:bg-surface-variant rounded-full text-on-surface transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-black text-on-background tracking-tight">Reflection Chamber</h1>
          </div>
          {step !== 'feedback' && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <ShieldCheck size={14} className="text-emerald-500" />
              Private & Secure
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: MOOD SELECTION */}
          {step === 'mood' && (
            <motion.div
              key="step-mood"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center flex-1 py-12"
            >
              <div className="text-center mb-10">
                <Sparkles size={32} className="text-primary mx-auto mb-4 opacity-70" />
                <h2 className="text-3xl font-extrabold text-on-background mb-2">How are you feeling right now?</h2>
                <p className="text-on-surface-variant font-medium">Take a breath. Acknowledge where your mind is.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                {MOODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMood(m.id);
                      setTimeout(() => setStep('mode'), 300);
                    }}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all cursor-pointer group hover:scale-105 active:scale-95 ${
                      mood === m.id ? 'border-primary bg-primary/5 shadow-md' : 'border-outline-variant/30 bg-surface-container hover:border-primary/50'
                    }`}
                  >
                    <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{m.emoji}</span>
                    <span className="font-bold text-on-surface">{m.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: MODE SELECTION */}
          {step === 'mode' && (
            <motion.div
              key="step-mode"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center flex-1 py-12"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-on-background mb-2">Choose your reflection style</h2>
                <p className="text-on-surface-variant font-medium">How would you like to process your thoughts today?</p>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-md">
                <button
                  onClick={() => handleModeSelect('guided')}
                  className="text-left p-6 rounded-3xl border-2 border-outline-variant/30 bg-surface-container hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <BookOpen size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-on-surface">Guided Reflection</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant pl-16">Answer three simple prompts to structure your thoughts and extract learnings.</p>
                </button>

                <button
                  onClick={() => handleModeSelect('free')}
                  className="text-left p-6 rounded-3xl border-2 border-outline-variant/30 bg-surface-container hover:border-secondary hover:bg-secondary/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                      <PenTool size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-on-surface">Free Flow</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant pl-16">An open canvas. Write whatever is on your mind without any structure.</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3A: GUIDED WRITING */}
          {step === 'writing_guided' && (
            <motion.div
              key="step-guided"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col flex-1"
            >
              <div className="space-y-6 flex-1">
                <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 focus-within:border-primary transition-colors">
                  <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-3">Step 1</h4>
                  <p className="font-bold text-lg text-on-background mb-4">What happened today?</p>
                  <textarea
                    value={guidedQ1}
                    onChange={(e) => setGuidedQ1(e.target.value)}
                    placeholder="Briefly describe the events..."
                    className="w-full min-h-[100px] bg-transparent resize-y outline-none text-on-surface"
                    autoFocus
                  />
                </div>

                <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 focus-within:border-primary transition-colors">
                  <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-3">Step 2</h4>
                  <p className="font-bold text-lg text-on-background mb-4">How did it make you feel?</p>
                  <textarea
                    value={guidedQ2}
                    onChange={(e) => setGuidedQ2(e.target.value)}
                    placeholder="Explore the emotions that surfaced..."
                    className="w-full min-h-[100px] bg-transparent resize-y outline-none text-on-surface"
                  />
                </div>

                <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 focus-within:border-primary transition-colors">
                  <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-3">Step 3</h4>
                  <p className="font-bold text-lg text-on-background mb-4">What did you learn or want to improve?</p>
                  <textarea
                    value={guidedQ3}
                    onChange={(e) => setGuidedQ3(e.target.value)}
                    placeholder="Extract a small lesson or intent..."
                    className="w-full min-h-[100px] bg-transparent resize-y outline-none text-on-surface"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={submitJournal}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg cursor-pointer hover:-translate-y-1"
                >
                  {isSubmitting ? 'Analyzing...' : 'Complete Reflection'}
                  {!isSubmitting && <ArrowRight size={18} />}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3B: FREE WRITING */}
          {step === 'writing_free' && (
            <motion.div
              key="step-free"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col flex-1 h-full"
            >
              <div className="flex-1 flex flex-col bg-surface-container-low rounded-3xl border border-outline-variant/30 calm-shadow overflow-hidden focus-within:border-primary transition-colors">
                <textarea
                  value={freeContent}
                  onChange={(e) => setFreeContent(e.target.value)}
                  placeholder="The page is yours. Pour your thoughts out..."
                  className="flex-1 w-full p-8 bg-transparent resize-none outline-none text-on-surface text-lg leading-relaxed"
                  autoFocus
                />
              </div>

              <div className="mt-6 flex justify-between items-center">
                <span className="text-xs font-bold text-outline uppercase tracking-widest font-mono">
                  {freeContent.trim().split(/\s+/).filter(w => w.length > 0).length} words
                </span>
                <button
                  onClick={submitJournal}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg cursor-pointer hover:-translate-y-1"
                >
                  {isSubmitting ? 'Processing...' : 'Complete Reflection'}
                  {!isSubmitting && <ArrowRight size={18} />}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: AI FEEDBACK */}
          {step === 'feedback' && (
            <motion.div
              key="step-feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col flex-1 py-4"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-primary/20 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 text-primary/5">
                  <Sparkles size={200} />
                </div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-on-background tracking-tight mb-6">Reflection Saved</h2>
                  
                  <div className="w-full bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 mb-8 text-left relative">
                    <div className="absolute -left-3 -top-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md">
                      <Sparkles size={16} />
                    </div>
                    <p className="text-on-surface font-medium leading-relaxed italic">
                      "{aiFeedback}"
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                    <button
                      onClick={talkToMindMate}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded-2xl transition-all border border-outline-variant/30 cursor-pointer shadow-sm hover:-translate-y-0.5"
                    >
                      <MessageCircle size={18} className="text-primary" />
                      Talk to MindMate about this
                    </button>
                    
                    <button
                      onClick={() => navigate('/home')}
                      className="w-full px-6 py-4 bg-transparent text-outline hover:text-on-surface font-bold rounded-2xl transition-all cursor-pointer uppercase tracking-widest text-xs"
                    >
                      Return to Home
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
