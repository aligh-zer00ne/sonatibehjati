import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  AdminMeDocument,
  AdminLogoutDocument,
  type AdminIdentityFieldsFragment,
} from '../generated/graphql';
import { adminRequest, clearAdminAccess, AdminRequestError } from '../lib/client';
interface State {
  admin: AdminIdentityFieldsFragment | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  loggedIn: (admin: AdminIdentityFieldsFragment) => void;
  logout: () => Promise<void>;
  passwordChanged: () => void;
}
const Context = createContext<State | null>(null);
export function useAdmin() {
  const state = useContext(Context);
  if (!state) throw new Error('AdminProvider required');
  return state;
}
export default function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminIdentityFieldsFragment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const channel = useRef<BroadcastChannel | null>(null);
  const refresh = useCallback(async () => {
    try {
      const result = await adminRequest(AdminMeDocument, {});
      setAdmin(result.adminMe ?? null);
      setError('');
    } catch (error) {
      if (error instanceof AdminRequestError && error.code === 'UNAUTHENTICATED') {
        setAdmin(null);
        setError('');
      } else setError(error instanceof Error ? error.message : 'نشست مدیریت دریافت نشد.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    channel.current =
      typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('behjati-admin-auth');
    if (channel.current)
      channel.current.onmessage = () => {
        clearAdminAccess();
        void refresh();
      };
    void refresh();
    const visible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const timer = setInterval(visible, 2 * 60 * 1000);
    const expired = () => {
      setAdmin(null);
      setLoading(false);
      setError('');
    };
    document.addEventListener('visibilitychange', visible);
    window.addEventListener('behjati-admin-expired', expired);
    return () => {
      channel.current?.close();
      channel.current = null;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
      window.removeEventListener('behjati-admin-expired', expired);
    };
  }, [refresh]);
  function loggedIn(admin: AdminIdentityFieldsFragment) {
    setAdmin(admin);
    setError('');
    setLoading(false);
    channel.current?.postMessage('changed');
  }
  async function logout() {
    await adminRequest(AdminLogoutDocument, {});
    setAdmin(null);
    setError('');
    channel.current?.postMessage('changed');
  }
  function passwordChanged() {
    clearAdminAccess();
    setAdmin(null);
    setError('');
    setLoading(false);
    channel.current?.postMessage('changed');
  }
  return (
    <Context.Provider value={{ admin, loading, error, refresh, loggedIn, logout, passwordChanged }}>
      {children}
    </Context.Provider>
  );
}
