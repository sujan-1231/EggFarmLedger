import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { db, type UserRecord } from '@/db/database';

const SESSION_KEY = 'efl_session_user_id';
const ENC = new TextEncoder();

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = ENC.encode(password + salt);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function makeId(): string {
  return crypto.randomUUID();
}

interface AuthContextValue {
  user: UserRecord | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    db.users
      .get(stored)
      .then((u) => setUser(u ?? null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const existing = await db.users.where('username').equals(username.toLowerCase().trim()).first();
    if (!existing) throw new Error('No account found with that username');
    const hash = await hashPassword(password, existing.id);
    if (hash !== existing.passwordHash) throw new Error('Incorrect password');
    localStorage.setItem(SESSION_KEY, existing.id);
    setUser(existing);
  }, []);

  const signUp = useCallback(async (username: string, password: string) => {
    const name = username.toLowerCase().trim();
    const existing = await db.users.where('username').equals(name).first();
    if (existing) throw new Error('That username is already taken');
    if (password.length < 4) throw new Error('Password must be at least 4 characters');
    const id = makeId();
    const passwordHash = await hashPassword(password, id);
    const record: UserRecord = {
      id,
      username: name,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    await db.users.add(record);
    localStorage.setItem(SESSION_KEY, id);
    setUser(record);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
