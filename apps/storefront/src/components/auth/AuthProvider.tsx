'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import {
  CurrentUserDocument,
  LogoutUserDocument,
  type SessionUserFragment,
} from '@/generated/graphql';
import { authRequest } from '@/lib/auth/client';
interface AuthState {
  user: SessionUserFragment | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  setUser: (user: SessionUserFragment | null) => void;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthState | null>(null);
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is required');
  return value;
}
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUserFragment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const channel = useRef<BroadcastChannel | null>(null);
  const refresh = useCallback(async () => {
    try {
      const data = await authRequest(CurrentUserDocument, {});
      setUser(data.me ?? null);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'نشست دریافت نشد.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      channel.current = new BroadcastChannel('behjati-auth');
      channel.current.onmessage = () => {
        void refresh();
      };
    }
    void refresh();
    const timer = setInterval(
      () => {
        if (document.visibilityState === 'visible') void refresh();
      },
      5 * 60 * 1000,
    );
    const visible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
      channel.current?.close();
      channel.current = null;
    };
  }, [refresh]);
  function updateUser(user: SessionUserFragment | null) {
    setUser(user);
    setError('');
    setLoading(false);
    channel.current?.postMessage('changed');
  }
  async function logout() {
    await authRequest(LogoutUserDocument, {});
    setUser(null);
    setError('');
    channel.current?.postMessage('changed');
  }
  return (
    <AuthContext.Provider value={{ user, loading, error, refresh, setUser: updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
