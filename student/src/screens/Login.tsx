import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isDemoMode } from '../firebase';
import type { Role } from '../types';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (mode === 'signup' && name.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') await signUp(name.trim(), email.trim(), password, role);
      else await signIn(email.trim(), password);
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      {/* Brand panel */}
      <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-grass to-grass-dark px-6 pb-10 pt-safe text-center text-white">
        <span className="mt-8 text-7xl" aria-hidden="true">
          🎓
        </span>
        <h1 className="text-3xl text-white">EduHub</h1>
        <p className="max-w-xs font-bold text-white/90">
          Your courses, your lessons, your progress - always in your pocket.
        </p>
      </div>

      <div className="flex-1 px-6 py-8">
        <h2 className="text-2xl">{mode === 'signin' ? 'Log in' : 'Create your account'}</h2>

        {isDemoMode && (
          <p className="mt-3 rounded-2xl bg-bee/20 px-4 py-3 text-sm font-bold">
            Demo mode: any email and a 6-character password will get you in.
          </p>
        )}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div>
              <label className="label" htmlFor="name">
                Your name
              </label>
              <input
                id="name"
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Liam Novak"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@school.edu"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <span className="label">I am a</span>
              <div className="grid grid-cols-2 gap-3">
                {(['student', 'teacher'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    className={`min-h-[44px] rounded-2xl border-2 px-4 py-3 text-sm font-extrabold capitalize transition-colors ${
                      role === option
                        ? 'border-grass bg-grass/10 text-grass-dark'
                        : 'border-swan text-wolf'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {role === 'teacher' && (
                <p className="mt-2 text-sm font-bold text-wolf">
                  Teachers create courses in the EduHub web console - this app is for reading them.
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-2xl bg-cardinal/10 px-4 py-3 text-sm font-bold text-cardinal">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'signin' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center font-bold text-wolf">
          {mode === 'signin' ? 'New here?' : 'Already have an account?'}{' '}
          <button
            type="button"
            className="text-macaw underline-offset-2 hover:underline"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
            }}
          >
            {mode === 'signin' ? 'Create an account' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
