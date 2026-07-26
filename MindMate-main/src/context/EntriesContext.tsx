import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { MoodEntry } from '../types';
import { fetchEntries, saveEntry, deleteEntry as apiDeleteEntry, deleteAllEntries } from '../services/geminiService';
import { useUser } from './UserContext';
import { useToast } from './ToastContext';

interface EntriesContextType {
  entries: MoodEntry[];
  addEntry: (entry: MoodEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearEntries: () => Promise<void>;
  fetchServerEntries: () => Promise<void>;
  hydrated: boolean;
}

const EntriesContext = createContext<EntriesContextType | undefined>(undefined);

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useUser();
  const { error: toastError } = useToast();
  const userId = user?.id;

  const fetchServerEntries = useCallback(async () => {
    if (!userId) {
      setEntries([]);
      setHydrated(true);
      return;
    }
    try {
      const data = await fetchEntries();
      setEntries(data);
      try {
        localStorage.setItem('mindmate_entries', JSON.stringify(data));
      } catch (err) {
        console.warn("localStorage setItem failed:", err);
      }
    } catch (e) {
      console.warn("Failed to fetch entries from server, falling back to cache:", e);
      // Fallback to cache
      try {
        const stored = localStorage.getItem('mindmate_entries');
        if (stored) {
          setEntries(JSON.parse(stored));
        } else {
          setEntries([]);
        }
      } catch (err) {
        setEntries([]);
      }
    } finally {
      setHydrated(true);
    }
  }, [userId]);

  useEffect(() => {
    fetchServerEntries();
  }, [fetchServerEntries]);

  const addEntry = useCallback(async (entry: MoodEntry) => {
    // Optimistic update
    setEntries(prev => {
      const updated = [entry, ...prev];
      try {
        localStorage.setItem('mindmate_entries', JSON.stringify(updated));
      } catch (err) {
        console.warn("Sync local storage entries failed:", err);
      }
      return updated;
    });

    try {
      await saveEntry(entry);
    } catch (e) {
      console.error("Failed to save entry to server, rolling back:", e);
      // Rollback
      fetchServerEntries();
      toastError("Failed to sync your check-in with the server. Please try again.");
      throw e;
    }
  }, [fetchServerEntries, toastError]);

  const deleteEntry = useCallback(async (id: string) => {
    setEntries(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('mindmate_entries', JSON.stringify(updated));
      } catch (err) {
        console.warn("Delete and save cached entries failed:", err);
      }
      return updated;
    });

    try {
      await apiDeleteEntry(id);
    } catch (e) {
      console.error("Failed to delete entry from server, rolling back:", e);
      fetchServerEntries();
      toastError("Failed to delete the entry on the server. Please try again.");
      throw e;
    }
  }, [fetchServerEntries, toastError]);

  const clearEntries = useCallback(async () => {
    setEntries([]);
    try {
      localStorage.removeItem('mindmate_entries');
    } catch (err) {
      console.warn("Failed to remove cached entries:", err);
    }
    if (userId) {
      try {
        await deleteAllEntries();
      } catch (e) {
        console.error("Failed to clear entries on server:", e);
      }
    }
  }, [userId]);

  const value = useMemo(() => ({
    entries,
    addEntry,
    deleteEntry,
    clearEntries,
    fetchServerEntries,
    hydrated
  }), [entries, addEntry, deleteEntry, clearEntries, fetchServerEntries, hydrated]);

  return (
    <EntriesContext.Provider value={value}>
      {children}
    </EntriesContext.Provider>
  );
}

export function useEntries() {
  const context = useContext(EntriesContext);
  if (context === undefined) {
    throw new Error('useEntries must be used within an EntriesProvider');
  }
  return context;
}
