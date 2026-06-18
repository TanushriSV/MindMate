import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: number;
  token?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  hydrated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
    try {
      if (newUser) {
        localStorage.setItem('mindmate_user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('mindmate_user');
      }
    } catch (e) {
      console.warn("localStorage sync failing:", e);
    }
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const silentRefresh = useCallback(async (tokenString: string) => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenString}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.refreshed && data.token) {
          console.log("Mindmate: Session token silently refreshed.");
          setUserState((current) => {
            if (!current) return null;
            const updated = { ...current, token: data.token };
            localStorage.setItem('mindmate_user', JSON.stringify(updated));
            return updated;
          });
        }
      } else if (response.status === 401) {
        console.warn("Mindmate: Session token expired or invalid; silent sign-out triggered.");
        setUser(null);
      }
    } catch (err) {
      console.warn("Mindmate: Failed to complete silent token refresh:", err);
    }
  }, [setUser]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mindmate_user');
      if (stored && stored !== 'undefined') {
        const parsedUser = JSON.parse(stored);
        setUserState(parsedUser);
        if (parsedUser && parsedUser.token) {
          silentRefresh(parsedUser.token);
        }
      }
    } catch (e) {
      localStorage.removeItem('mindmate_user');
    } finally {
      setHydrated(true);
    }
  }, [silentRefresh]);

  // Set up periodic silent token refresh every 15 minutes if user has a token
  useEffect(() => {
    if (!user || !user.token) return;

    const intervalId = setInterval(() => {
      if (user.token) {
        silentRefresh(user.token);
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(intervalId);
  }, [user?.token, silentRefresh]);

  const value = useMemo(() => ({ user, setUser, clearUser, hydrated }), [user, setUser, clearUser, hydrated]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
