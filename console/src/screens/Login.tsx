import { useState, type FormEvent } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isDemoMode } from '../firebase';
import type { Role } from '../types';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

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
    if (mode === 'signup' && name.trim().length < 2) {
      next.name = 'Please enter your full name.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signUp(name.trim(), email.trim(), password, role);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (error) {
      setFormError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="flex flex-col justify-center gap-6 bg-grass px-8 py-12 text-white lg:w-[42%] lg:px-14">
        <span className="text-7xl lg:text-8xl" aria-hidden="true">
          🎓
        </span>
        <div>
          <h1 className="text-4xl text-white lg:text-5xl">EduHub Console</h1>
          <p className="mt-3 max-w-md text-lg font-bold text-white/90">
            Build courses, write lessons, publish in one tap. Your students see the change
            instantly.
          </p>
        </div>
        <ul className="space-y-2 text-sm font-bold text-white/90">
          <li className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> Courses and lessons in one place
          </li>
          <li className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> Realtime sync to the student app
          </li>
          <li className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> Roles for admins, teachers and students
          </li>
        </ul>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mt-2 font-bold text-wolf">
            {mode === 'signin'
              ? 'Sign in to manage your courses.'
              : 'The first account of a new school becomes the admin.'}
          </p>

          {isDemoMode && (
            <p className="mt-4 rounded-2xl bg-bee/15 px-4 py-3 text-sm font-bold text-ink">
              Demo mode: any email and a 6-character password will sign you in.
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
                {errors.name && <p className="mt-1 text-sm font-bold text-cardinal">{errors.name}</p>}
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
              {errors.email && <p className="mt-1 text-sm font-bold text-cardinal">{errors.email}</p>}
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
              {errors.password && (
                <p className="mt-1 text-sm font-bold text-cardinal">{errors.password}</p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <span className="label">Account type</span>
                <div className="grid grid-cols-2 gap-3">
                  {(['teacher', 'student'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRole(option)}
                      className={`rounded-2xl border-2 px-4 py-3 text-sm font-extrabold capitalize transition-colors ${
                        role === option
                          ? 'border-grass bg-grass/10 text-grass-dark'
                          : 'border-swan text-wolf hover:border-wolf/40'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formError && (
              <p className="rounded-2xl bg-cardinal/10 px-4 py-3 text-sm font-bold text-cardinal">
                {formError}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center font-bold text-wolf">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              className="text-macaw underline-offset-2 hover:underline"
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
  );
}
