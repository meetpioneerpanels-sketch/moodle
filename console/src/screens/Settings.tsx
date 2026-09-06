import { CloudOff, Cloud, LogOut, Radio } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { RoleChip } from '../components/ui';
import { isDemoMode, projectId } from '../firebase';
import { formatDate } from '../lib/format';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { live, courses, lessons, users } = useData();

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl">Settings</h1>
        <p className="mt-1 font-bold text-wolf">Account, connection and app information.</p>
      </header>

      <section className="card p-5">
        <h2 className="text-lg">Account</h2>
        <dl className="mt-4 space-y-3 text-sm font-bold">
          <div className="flex items-center gap-3">
            <dt className="w-24 text-wolf">Name</dt>
            <dd>{user?.name}</dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="w-24 text-wolf">Email</dt>
            <dd className="truncate">{user?.email}</dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="w-24 text-wolf">Role</dt>
            <dd>
              <RoleChip role={user?.role ?? 'teacher'} />
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="w-24 text-wolf">Joined</dt>
            <dd>{formatDate(user?.createdAt ?? 0)}</dd>
          </div>
        </dl>
      </section>

      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-lg">
          {isDemoMode ? (
            <CloudOff className="h-5 w-5 text-fox" />
          ) : (
            <Cloud className="h-5 w-5 text-grass" />
          )}
          Firebase connection
        </h2>
        {isDemoMode ? (
          <>
            <p className="mt-2 font-bold text-wolf">
              Running in <strong className="text-ink">demo mode</strong> on in-memory sample data.
              Nothing is saved when you reload.
            </p>
            <p className="mt-3 rounded-2xl bg-bee/15 px-4 py-3 text-sm font-bold">
              Paste your Firebase config into <code className="font-mono">src/firebase.ts</code> to
              switch on live sync with the student app.
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 font-bold text-wolf">
              Live mode, project <strong className="text-ink">{projectId}</strong>. The student app
              must use this same project ID.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-grass/10 px-4 py-2 text-sm font-extrabold text-grass-dark">
              <Radio className="h-4 w-4" />
              {live ? 'Realtime listeners attached' : 'Connecting...'}
            </p>
          </>
        )}
        <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            ['Courses', courses.length],
            ['Lessons', lessons.length],
            ['Users', users.length],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-2xl bg-swan/30 px-3 py-3">
              <dt className="text-xs font-extrabold uppercase tracking-wide text-wolf">{label}</dt>
              <dd className="text-2xl font-extrabold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card p-5">
        <h2 className="text-lg">About</h2>
        <p className="mt-2 font-bold text-wolf">
          EduHub Console v1.0 - the teacher and admin half of the EduHub learning platform. Students
          use the companion EduHub Student app, which reads the same Firestore collections.
        </p>
      </section>

      <button type="button" className="btn-danger" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
