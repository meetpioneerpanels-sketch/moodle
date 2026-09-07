import { useState, type FormEvent } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isDemoMode } from '../firebase';
import { ThemeToggle } from '../components/ui';
import type { Role } from '../types';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

const HIGHLIGHTS = [
  ['Courses and lessons', 'Draft, reorder and publish from one screen.'],
  ['Realtime sync', 'Students see changes in about a second, no refresh.'],
  ['Roles', 'Admins, teachers and students, managed in-app.'],
];

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('teacher');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (mode === 'signup' && name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === 'signup') await signUp(name.trim(), email.trim(), password, role);
      else await signIn(email.trim(), password);
    } catch (error) {
      setFormError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Brand column */}
      <div className="relative hidden w-[44%] max-w-xl flex-col justify-between border-r border-line bg-surface-2 px-12 py-12 lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[13px] font-semibold text-accent-fg">
            E
          </span>
          <span className="text-sm font-semibold">EduHub</span>
        </div>

        <div className="max-w-sm">
          <h1 className="text-3xl font-semibold leading-[1.15] tracking-[-0.02em]">
            Everything your school teaches, in one place.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Build courses, write lessons and publish them to every student device instantly.
          </p>

          <dl className="mt-10 space-y-5">
            {HIGHLIGHTS.map(([term, description]) => (
              <div key={term} className="border-l-2 border-line pl-4">
                <dt className="text-[13px] font-medium text-fg">{term}</dt>
                <dd className="mt-0.5 text-[13px] text-subtle">{description}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-2xs text-subtle">EduHub Console · teacher and admin workspace</p>
      </div>

      {/* Form column */}
      <div className="flex flex-1 flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <span className="flex items-center gap-2 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[13px] font-semibold text-accent-fg">
              E
            </span>
            <span className="text-sm font-semibold">EduHub</span>
          </span>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[22rem] py-10">
            <h2 className="text-xl font-semibold tracking-[-0.015em]">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-1.5 text-[13px] text-muted">
              {mode === 'signin'
                ? 'Sign in to manage your courses.'
                : 'The first account of a new school becomes the admin.'}
            </p>

            {isDemoMode && (
              <p className="mt-5 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-[13px] text-muted">
                Demo mode — any email and a 6-character password will sign you in.
              </p>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              {mode === 'signup' && (
                <div>
                  <label className="label" htmlFor="name">
                    Full name
                  </label>
                  <input
                    id="name"
                    className="input"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Amara Okonkwo"
                    autoComplete="name"
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>
              )}

              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@school.edu"
                  autoComplete="email"
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
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
                {errors.password && <p className="error-text">{errors.password}</p>}
              </div>

              {mode === 'signup' && (
                <div>
                  <span className="label">Account type</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['teacher', 'student'] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRole(option)}
                        aria-pressed={role === option}
                        className={`h-10 rounded-lg border text-[13px] font-medium capitalize transition-colors ${
                          role === option
                            ? 'border-accent bg-accent-soft text-accent-on-soft'
                            : 'border-line text-muted hover:bg-surface-3'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formError && (
                <p className="rounded-lg border border-line bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
                  {formError}
                </p>
              )}

              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-[13px] text-muted">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                className="font-medium text-accent hover:underline"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setErrors({});
                  setFormError('');
                }}
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
