import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, Bot, Send, PlusCircle, Wind, MessageSquare, Trash2, Edit2, Check, X, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatMessage } from '../../types';
import * as aiService from '../../services/geminiService';
import { useUser } from '../../context/UserContext';
import { useEntries } from '../../context/EntriesContext';

function messageSuggestsBreathe(text: string): boolean {
  const norm = text.toLowerCase();
  return (
    norm.includes('breathe') ||
    norm.includes('breathing') ||
    norm.includes('breath') ||
    norm.includes('diaphragmatic') ||
    norm.includes('grounding') ||
    norm.includes('rest') ||
    norm.includes('reset')
  );
}

function renderMessageText(text: string, navigate: (path: string) => void) {
  // Regex to find standard Markdown links like [Label](path)
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const label = match[1];
    const path = match[2];

    // Add preceding text if exists
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    // Add interactive link button with beautiful styling
    // `navigate` accepts a full path string, so query params like `?tab=ground` are preserved.
    parts.push(
      <button
        key={matchIndex}
        onClick={() => navigate(path)}
        className="inline-flex items-center gap-1 mx-1 px-3 py-1.5 text-xs font-bold bg-primary hover:bg-primary/95 text-white active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer align-baseline animate-fade-in"
      >
        <span>{label}</span>
      </button>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function Chat() {
  const { user } = useUser();
  const { entries } = useEntries();
  const navigate = useNavigate();

  // Sessions and messages states
  const [sessions, setSessions] = useState<aiService.ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // UI and loading states
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Renaming state
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const formatSessionTitle = (title: string, createdAt?: number) => {
    if (!title) return "New Conversation";
    
    if (title.startsWith("Chat Session")) {
      try {
        if (createdAt) {
          const date = new Date(createdAt);
          if (!isNaN(date.getTime())) {
            const todayStr = new Date().toDateString();
            const sessionDateStr = date.toDateString();
            
            const timeStr = date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
            
            if (todayStr === sessionDateStr) {
              return `Today • ${timeStr}`;
            } else {
              const dateStr = date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
              });
              return `${dateStr} • ${timeStr}`;
            }
          }
        }
      } catch (e) {
        // Fallback
      }
    }
    return title;
  };

  // 1. Fetch sessions list on login/mount
  useEffect(() => {
    // Clear all previous chat session states immediately on user logout or login shift
    setSessions([]);
    setCurrentSessionId(null);
    setMessages([]);
    setError(null);

    const loadSessions = async () => {
      if (!user) return;
      setSessionsLoading(true);
      try {
        const list = await aiService.listChatSessions();
        setSessions(list);
        if (list.length > 0) {
          // Default to the first (most recent) session
          setCurrentSessionId(list[0].id);
        } else {
          // Auto-initiate a fresh chat session if none exist
          const newSess = await aiService.createChatSession();
          setSessions([newSess]);
          setCurrentSessionId(newSess.id);
        }
      } catch (err) {
        console.error("Failed to load chat sessions:", err);
      } finally {
        setSessionsLoading(false);
      }
    };

    loadSessions();
  }, [user]);

  // 2. Fetch history for active session ID
  useEffect(() => {
    const loadMessagesForSession = async () => {
      if (!user || !currentSessionId) return;
      setIsLoadingHistory(true);
      setError(null);
      try {
        const response = await aiService.fetchChatHistory(currentSessionId);
        if (response.sessionId === currentSessionId) {
          setMessages(response.messages);
        }
      } catch (err) {
        console.warn("Failed to load chat history for session:", err);
        setError("Could not load previous messages for this chat.");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadMessagesForSession();
  }, [currentSessionId, user]);

  // Scroll to bottom on updates
  useEffect(() => {
    if (!isLoadingHistory) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isLoadingHistory]);

  const triggerTooltip = (id: string) => {
    setActiveTooltip(id);
    setTimeout(() => {
      setActiveTooltip(null);
    }, 2000);
  };

  // Actions
  const handleNewChat = async () => {
    setError(null);
    try {
      setIsLoading(true);
      const newSess = await aiService.createChatSession();
      setSessions(prev => [newSess, ...prev]);
      setCurrentSessionId(newSess.id);
      setMessages([]);
      setMobileDrawerOpen(false);
    } catch (err) {
      console.error("Failed to create new chat session:", err);
      setError("Failed to start a new conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDeleteSession = (e: React.MouseEvent, sessId: string) => {
    e.stopPropagation();
    setSessionToDelete(sessId);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    const sessId = sessionToDelete;
    setSessionToDelete(null);

    // Cache previous states for optimistic rollback on backend failure
    const originalSessions = [...sessions];
    const originalSessionId = currentSessionId;

    // Optimistically update frontend UI immediately
    const updated = sessions.filter(s => s.id !== sessId);
    setSessions(updated);

    if (currentSessionId === sessId) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
      } else {
        // Clear current session id temporarily
        setCurrentSessionId(null);
      }
    }

    try {
      await aiService.deleteChatSession(sessId);
      
      // If we deleted the last remaining session, spin up a new chat session automatically
      if (updated.length === 0) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to delete chat session on backend, rolling back state:", err);
      // Revert states to original
      setSessions(originalSessions);
      setCurrentSessionId(originalSessionId);
      setError("Failed to delete this chat session. Please try again.");
    }
  };

  const startRenaming = (e: React.MouseEvent, sessId: string, currentTitle: string) => {
    e.stopPropagation();
    setRenamingSessionId(sessId);
    setRenamingValue(currentTitle);
  };

  const handleSaveRename = async (sessId: string) => {
    const trimmed = renamingValue.trim();
    if (!trimmed || trimmed.length > 100) {
      setRenamingSessionId(null);
      return;
    }
    const oldTitle = sessions.find(s => s.id === sessId)?.title || '';
    if (trimmed === oldTitle) {
      setRenamingSessionId(null);
      return;
    }
    try {
      await aiService.updateChatSessionTitle(sessId, trimmed);
      setSessions(prev =>
        prev.map(s => s.id === sessId ? { ...s, title: trimmed } : s)
      );
    } catch (err) {
      console.error("Failed to rename session:", err);
    } finally {
      setRenamingSessionId(null);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, sessId: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(sessId);
    } else if (e.key === 'Escape') {
      setRenamingSessionId(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || input.length > 2000 || !currentSessionId) return;

    setError(null);
    const userMsgText = input.trim();
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      role: 'user',
      text: userMsgText,
      timestamp: Date.now()
    };

    // Optimistically add user reply & clear input
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Save in background — don't block the AI call
    aiService.saveChatMessage({
      id: userMsg.id,
      role: 'user',
      text: userMsg.text,
      timestamp: userMsg.timestamp,
      sessionId: currentSessionId
    }).catch(e => console.warn("Error archiving user message:", e));

    try {
      // Structure the history payload for Gemini
      const historyToSend = messages.slice(-20).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Compile user's live health state
      const latestEntry = entries[0];
      const userState = {
        name: user?.name,
        recentMoodSliderScores: {
          stressLevel: latestEntry?.stressLevel ?? null,
          anxietyScore: latestEntry?.anxietyScore ?? null,
        },
        somaticIndicators: latestEntry?.stressIndicators || [],
      };

      // Add actual live message to history array
      historyToSend.push({ role: 'user', parts: [{ text: userMsgText }] });

      const response = await aiService.sendMessage(historyToSend, userState);
      
      const aiMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        role: 'model',
        text: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);

      // Save AI reply in background — don't block the UI
      aiService.saveChatMessage({
        id: aiMsg.id,
        role: 'model',
        text: aiMsg.text,
        timestamp: aiMsg.timestamp,
        sessionId: currentSessionId
      }).catch(e => console.warn("Error archiving AI message:", e));
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('Unauthorized') || errMsg.includes('expired') || errMsg.includes('exists') || errMsg.includes('401')) {
        console.warn('Silent authorization handles stale session:', errMsg);
      } else {
        console.error("AI service error:", err);
      }

      if (err?.code === 'AI_NOT_CONFIGURED') {
        setError(
          'AI chat is not configured. Add your GEMINI_API_KEY to the .env file and restart the server. Get a free key at aistudio.google.com/apikey'
        );
      } else if (err?.code === 'AI_UNAVAILABLE') {
        setError('AI is temporarily unavailable. Please wait a moment and try again.');
      } else {
        setError('Could not get a response. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Safe fallback if active message history is empty
  const activeMessages = messages.length > 0 ? messages : [
    {
      id: 'greeting',
      role: 'model' as const,
      text: `Hello ${user?.name ? user.name : 'there'}! How are you feeling in this moment? Let me support you at your own pace today.`,
      timestamp: Date.now()
    }
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 mb-6 shrink-0">
        <h3 className="text-lg font-bold text-on-background select-none">My Chats</h3>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/95 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
        {sessionsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-on-surface-variant/60">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-xs font-medium">Checking rooms...</span>
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-xs font-bold text-on-surface-variant/40 py-10 select-none">No past chats.</p>
        ) : (
          sessions.map((sess) => {
            const isSelected = sess.id === currentSessionId;
            const isEditing = renamingSessionId === sess.id;

            return (
              <div
                key={sess.id}
                onClick={() => {
                  if (!isEditing) {
                    setCurrentSessionId(sess.id);
                    setMobileDrawerOpen(false);
                  }
                }}
                className={`group flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-primary/10 border border-primary/20 text-primary font-bold'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/10'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare size={16} className={isSelected ? 'text-primary shrink-0' : 'text-on-surface-variant shrink-0'} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={renamingValue}
                      onChange={(e) => setRenamingValue(e.target.value)}
                      onKeyDown={(e) => handleRenameKeyDown(e, sess.id)}
                      onBlur={() => handleSaveRename(sess.id)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white dark:bg-neutral-800 text-xs px-2 py-1 rounded border border-primary/40 focus:outline-none text-on-background"
                    />
                  ) : (
                    <span className="text-xs truncate font-semibold" title={sess.title}>
                      {formatSessionTitle(sess.title, sess.created_at)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                  {isEditing ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveRename(sess.id);
                      }}
                      className="p-1 hover:bg-white/50 text-emerald-600 rounded cursor-pointer"
                      title="Save"
                    >
                      <Check size={13} />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(e) => startRenaming(e, sess.id, sess.title)}
                        className="p-1 hover:bg-primary/20 hover:text-primary text-on-surface-variant/70 rounded cursor-pointer transition-all"
                        title="Rename"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => triggerDeleteSession(e, sess.id)}
                        className="p-1 hover:bg-error/20 hover:text-error text-on-surface-variant/70 rounded cursor-pointer transition-all"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-140px)] flex-row max-w-6xl mx-auto w-full gap-6 pt-4 relative overflow-hidden">
      
      {/* 2A. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-full bg-surface-container/30 rounded-3xl border border-outline-variant/30 p-5 font-sans">
        {renderSidebarContent()}
      </aside>

      {/* 2B. Mobile Overlay Drawer (AnimatePresence) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-[100]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-[80%] max-w-[320px] bg-surface-container px-6 py-8 z-[101] shadow-2xl border-r border-outline-variant/30 font-sans"
            >
              {/* Close Button Inside Mobile Drawer */}
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="absolute top-5 right-5 p-2 bg-surface-container-high rounded-full hover:bg-surface-container-highest text-on-surface transition-all cursor-pointer"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
              <div className="h-full pt-4">
                {renderSidebarContent()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Main Chat Panel */}
      <div className="flex-1 h-full flex flex-col min-w-0 bg-transparent rounded-3xl relative">
        
        {/* Toggle Headbar */}
        <header className="flex items-center justify-between gap-3 pb-3 border-b border-outline-variant/20 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2.5 bg-surface-container hover:bg-surface-container-high rounded-2xl text-on-surface border border-outline-variant/30 transition-all cursor-pointer"
              aria-label="View conversations"
            >
              <Menu size={18} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-black text-on-surface-variant uppercase tracking-wider">Sanctuary AI Chat</h2>
              <p className="text-xs text-primary font-bold truncate max-w-[150px] sm:max-w-xs">
                {sessionsLoading 
                  ? 'Syncing...' 
                  : (() => {
                      const activeS_ = sessions.find(s => s.id === currentSessionId);
                      return activeS_ ? formatSessionTitle(activeS_.title, activeS_.created_at) : 'Companion';
                    })()
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary/95 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>New</span>
            </button>
          </div>
        </header>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto px-1 py-4 space-y-6 hide-scrollbar pb-28">
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-20 text-on-surface-variant/50 select-none">
              <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-xs font-black uppercase tracking-widest text-primary">Unfolding conversation...</span>
            </div>
          ) : (
            <>
              {/* Optional Prompt/Welcome Header inside the stream if empty and not first entry */}
              {activeMessages.length <= 1 && (
                <div className="text-center py-6 mb-4 shrink-0 select-none animate-fade-in">
                  <div className="inline-block p-4 rounded-3xl bg-tertiary text-white mb-3 shadow-md ring-4 ring-tertiary/10">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="text-xl font-black text-on-background tracking-tight">AI Sanctuary Chat</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 leading-relaxed">
                    A safe, completely private space for expressing and sorting out any feelings.
                  </p>
                </div>
              )}

              <AnimatePresence>
                {activeMessages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex items-end gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mb-1 font-bold text-[10px] select-none ${
                      m.role === 'user' ? 'bg-primary text-white' : 'bg-secondary text-white'
                    }`}>
                      {m.role === 'user' ? 'ME' : 'AI'}
                    </div>
                    <div className="flex flex-col gap-2 max-w-full">
                      <div className={`p-4.5 rounded-2xl text-sm font-medium leading-relaxed calm-shadow ${
                        m.role === 'user' 
                          ? 'bg-secondary-container text-on-secondary-container rounded-br-none' 
                          : 'bg-surface-variant text-on-surface rounded-bl-none border border-outline-variant/20'
                      }`}>
                        {renderMessageText(m.text, navigate)}
                      </div>
                      {m.role === 'model' && messageSuggestsBreathe(m.text) && (
                        <div className="flex justify-start">
                          <button
                            onClick={() => navigate('/breathe')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-primary hover:bg-primary/95 hover:scale-[1.02] active:scale-95 text-white rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer ring-4 ring-primary/10 select-none"
                          >
                            <Wind size={14} className="animate-pulse" />
                            <span>Start Breathing Exercise & Reset</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-end gap-3 select-none">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white animate-pulse" />
              </div>
              <div className="bg-surface-variant p-4 rounded-2xl rounded-bl-none border border-outline-variant/20 calm-shadow flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-300" />
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Controls */}
        <div className="absolute bottom-4 left-0 w-full z-40 px-2">
          <div className="w-full relative">
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-16 left-4 right-4 bg-error text-white text-xs font-bold py-3 px-5 rounded-2xl shadow-xl flex justify-between items-center z-50 border border-white/20 animate-pulse"
                >
                  <span>{error}</span>
                  <button 
                    onClick={() => setError(null)} 
                    className="font-extrabold hover:underline ml-3 flex cursor-pointer shrink-0 uppercase tracking-widest text-[9px]"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-surface-container/95 backdrop-blur-xl rounded-[28px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-2 border border-outline-variant/30">
              <button 
                onClick={() => triggerTooltip('attach')}
                aria-label="Add attachment"
                className="p-3 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors cursor-pointer"
              >
                <PlusCircle size={22} className="text-on-surface-variant/70 hover:text-primary transition-colors" />
              </button>
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && input.length <= 2000 && handleSend()}
                className="flex-1 bg-transparent border-none focus:ring-0 font-medium text-sm text-on-background px-1 placeholder:text-outline/50 outline-none"
                placeholder="Type your thoughts..."
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || isLoadingHistory || !input.trim() || input.length > 2000}
                className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer"
              >
                <Send size={18} />
              </button>
            </div>

            <div className="flex justify-between items-center px-4 mt-1 select-none">
              <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/40">
                Messages are private & secure
              </span>
              <span className={`text-[10px] font-bold tracking-wider ${input.length > 2000 ? 'text-red-500 font-extrabold' : 'text-on-surface-variant/40'}`}>
                {input.length} / 2000
              </span>
            </div>

            <AnimatePresence>
              {activeTooltip === 'attach' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-12 left-4 bg-primary/95 text-white py-1.5 px-4 rounded-xl text-center font-bold text-[10px] uppercase tracking-wider shadow-lg z-20"
                >
                  Media attachments coming soon!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Delete Chat Session Confirmation Modal */}
      <AnimatePresence>
        {sessionToDelete !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSessionToDelete(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-surface rounded-3xl p-6 border border-outline-variant/30 calm-shadow flex flex-col items-center text-center gap-4 z-10 font-sans"
            >
              <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center text-error text-2xl">
                ⚠️
              </div>
              <div className="px-2">
                <h4 className="text-sm font-black text-on-surface uppercase tracking-widest mb-1.5">
                  Delete Chat Session?
                </h4>
                <p className="text-on-surface-variant text-xs leading-relaxed mt-1">
                  Are you absolutely sure you want to permanently delete this chat session? All message logs will be permanently erased. This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 py-2.5 rounded-full bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteSession}
                  className="flex-1 py-2.5 rounded-full bg-error text-white font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-md"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
