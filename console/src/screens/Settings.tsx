import { Cloud, CloudOff, LogOut, Radio } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { Avatar, RoleChip, ThemePicker } from '../components/ui';
import { isDemoMode, projectId } from '../firebase';
import { formatDate } from '../lib/format';

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-2.5">
      <dt className="w-24 shrink-0 text-[13px] text-subtle">{term}</dt>
      <dd className="min-w-0 text-[13px] text-fg">{children}</dd>
    </div>
  );
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { live, courses, lessons, users } = useData();

  return (
    <div className="max-w-2xl space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-[-0.015em]">Settings</h1>
        <p className="mt-1 text-[13px] text-muted">Account, appearance and connection.</p>
      </header>

      <section className="card p-5">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name ?? ''} size="lg" />
          <div className="min-w-0">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="truncate text-[13px] text-subtle">{user?.email}</p>
          </div>
        </div>
        <dl className="mt-4 divide-y divide-line border-t border-line pt-1">
          <Row term="Role">
            <RoleChip role={user?.role ?? 'teacher'} />
          </Row>
          <Row term="Joined">{formatDate(user?.createdAt ?? 0)}</Row>
        </dl>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-medium">Appearance</h2>
        <p className="mt-1 text-[13px] text-muted">
          Stored on this device. System follows your operating system.
        </p>
        <div className="mt-3.5">
          <ThemePicker />
        </div>
      </section>

      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          {isDemoMode ? (
            <CloudOff className="h-4 w-4 text-warning" />
          ) : (
            <Cloud className="h-4 w-4 text-success" />
          )}
          Firebase connection
        </h2>
        {isDemoMode ? (
          <>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Running in <span className="font-medium text-fg">demo mode</span> on in-memory
              sample data. Nothing is saved when you reload.
            </p>
            <p className="mt-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-[13px] text-muted">
              Paste your Firebase config into{' '}
              <code className="rounded bg-surface-3 px-1 py-0.5 font-mono text-2xs">
                src/firebase.ts
              </code>{' '}
              to switch on live sync with the student app.
            </p>
          </>
        ) : (
          <>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Live mode, project <span className="font-medium text-fg">{projectId}</span>. The
              student app must use this same project ID.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-success-soft px-2.5 py-1.5 text-[13px] text-success">
              <Radio className="h-3.5 w-3.5" />
              {live ? 'Realtime listeners attached' : 'Connecting…'}
            </p>
          </>
        )}
        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4">
          {[
            ['Courses', courses.length],
            ['Lessons', lessons.length],
            ['Users', users.length],
          ].map(([label, value]) => (
            <div key={label as string}>
              <dt className="text-[13px] text-subtle">{label}</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-medium">About</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          EduHub Console v1.0 — the teacher and admin half of the EduHub platform. Students use
          the companion EduHub Student app, which reads the same Firestore collections.
        </p>
      </section>

      <button type="button" className="btn-secondary text-danger" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
