import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isDemoMode } from '../firebase';
import { ThemeToggle } from '../components/ui';
import AmbientBackground from '../components/AmbientBackground';
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
    <div className="flex min-h-[100dvh] flex-col">
      <AmbientBackground />
      <div className="flex items-center justify-between px-4 pt-safe">
        <span className="flex items-center gap-2 pt-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-[13px] font-semibold text-white">
            E
          </span>
          <span className="text-sm font-semibold">EduHub</span>
        </span>
        <span className="pt-2">
          <ThemeToggle />
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 pb-10">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">
          {mode === 'signin' ? 'Log in' : 'Create your account'}
        </h1>
        <p className="mt-1.5 text-[13px] text-muted">
          {mode === 'signin'
            ? 'Your courses, lessons and progress.'
            : 'Ask your teacher which email to use.'}
        </p>

        {isDemoMode && (
          <p className="mt-5 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-[13px] text-muted">
            Demo mode — any email and a 6-character password will get you in.
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
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
              <div className="grid grid-cols-2 gap-2">
                {(['student', 'teacher'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    aria-pressed={role === option}
                    className={`h-11 rounded-lg border text-[13px] font-medium capitalize transition-colors ${
                      role === option
                        ? 'border-brand bg-brand-soft text-brand-on-soft'
                        : 'border-line text-muted'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {role === 'teacher' && (
                <p className="hint">
                  Teachers create courses in the EduHub web console — this app is for reading them.
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-line bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'signin' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted">
          {mode === 'signin' ? 'New here?' : 'Already have an account?'}{' '}
          <button
            type="button"
            className="font-medium text-brand"
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
