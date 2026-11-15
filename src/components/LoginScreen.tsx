import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Egg } from 'lucide-react';

export function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(username, password);
      } else {
        await signUp(username, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200 mb-4">
            <Egg className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 tracking-tight">Egg Farm Ledger</h1>
          <p className="text-stone-500 mt-1.5">Track trays, bills, and payments — offline.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-green-100/50 border border-green-100 p-6 sm:p-8">
          <div className="flex gap-2 p-1 bg-stone-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                autoComplete="username"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-200 hover:from-green-600 hover:to-emerald-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 mt-6 leading-relaxed">
            Your data is stored only in this browser. Nothing is sent to the internet.
          </p>
        </div>
      </div>
    </div>
  );
}
