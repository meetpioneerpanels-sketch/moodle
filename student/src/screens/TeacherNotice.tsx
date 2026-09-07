import { ExternalLink, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AmbientBackground from '../components/AmbientBackground';
import { Avatar, ThemeToggle } from '../components/ui';

/**
 * Teachers and admins can sign in here - the accounts are shared - but this app
 * is the student experience. Rather than pushing them through student
 * onboarding, say so and let them preview it deliberately.
 */
export default function TeacherNotice({ onPreview }: { onPreview: () => void }) {
  const { user, signOut } = useAuth();
  const role = user?.role === 'admin' ? 'admin' : 'teacher';

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <AmbientBackground />

      <div className="flex items-center justify-end px-4 pt-safe">
        <span className="pt-2">
          <ThemeToggle />
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 pb-12">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name ?? 'Teacher'} size="lg" />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">{user?.name}</h1>
              <p className="truncate text-[13px] text-subtle">{user?.email}</p>
              <span className="chip-brand mt-1.5 capitalize">{role}</span>
            </div>
          </div>

          <h2 className="mt-6 text-base font-semibold">This app is the student experience</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {role === 'admin'
              ? 'Admins manage courses, the test bank, doubts and user roles in the EduHub Console on a laptop.'
              : 'Teachers write courses and lessons, build topical tests and answer doubts in the EduHub Console on a laptop.'}{' '}
            Everything you publish there appears here for students within a second.
          </p>

          <ul className="mt-4 space-y-2">
            {[
              'Create courses and write lessons',
              'Build topical tests and question banks',
              'Answer student doubts',
              'See how students score on every test',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>

          <a
            href="/"
            className="btn-primary mt-6 w-full"
            onClick={(event) => {
              // The console is a separate deployment; without a configured URL
              // there is nowhere to send them, so keep this honest.
              event.preventDefault();
            }}
          >
            <LayoutDashboard className="h-4 w-4" /> Open EduHub Console
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
          <p className="hint text-center">Ask your admin for the console address.</p>

          <button type="button" className="btn-secondary mt-3 w-full" onClick={onPreview}>
            Preview the student app
          </button>
        </div>

        <button type="button" className="btn-secondary mt-4 w-full text-danger" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
