import { LogOut, Smartphone, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useInstallPrompt } from '../hooks/usePwa';
import { Avatar, EmptyState, ProgressBar, ThemePicker } from '../components/ui';
import { toneOf } from '../lib/theme';
import { isDemoMode } from '../firebase';

export default function Profile({ onOpenCourse }: { onOpenCourse: (courseId: string) => void }) {
  const { user, signOut } = useAuth();
  const { courses, lessons, progress, completedCount } = useData();
  const { canInstall, install } = useInstallPrompt();

  const completed = progress.filter((item) => item.completed).length;
  const started = courses.filter((course) => completedCount(course.id) > 0);

  return (
    <div className="space-y-5 px-4 pb-6 pt-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <Avatar name={user?.name ?? 'Student'} size="lg" />
        <div>
          <h1 className="text-lg font-semibold tracking-[-0.015em]">{user?.name}</h1>
          <p className="text-[13px] text-subtle">{user?.email}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2.5">
        <div className="card p-4">
          <p className="text-[13px] text-subtle">Courses</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-[-0.02em]">
            {courses.length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[13px] text-subtle">Completed</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-[-0.02em]">{completed}</p>
        </div>
      </section>

      {canInstall && (
        <button type="button" className="btn-secondary w-full" onClick={install}>
          <Smartphone className="h-4 w-4" /> Install app
        </button>
      )}

      <section>
        <h2 className="mb-2.5 text-[13px] font-medium text-muted">My courses</h2>
        {started.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-4 w-4" />}
            title="No progress yet"
            description="Finish a lesson and it shows up here."
          />
        ) : (
          <ul className="space-y-2.5">
            {started.map((course) => {
              const total = lessons.filter((lesson) => lesson.courseId === course.id).length;
              const done = completedCount(course.id);
              return (
                <li key={course.id} className={toneOf(course.colorTheme)}>
                  <button
                    type="button"
                    onClick={() => onOpenCourse(course.id)}
                    className="card card-hover w-full p-4 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span className="tone-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg">
                        {course.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{course.title}</span>
                        <span className="text-[13px] text-subtle">
                          {done} of {total} lessons
                        </span>
                      </span>
                    </span>
                    <span className="mt-3 block">
                      <ProgressBar value={done} total={total} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card p-4">
        <h2 className="text-sm font-medium">Appearance</h2>
        <div className="mt-3">
          <ThemePicker />
        </div>
      </section>

      <section className="card p-4">
        <h2 className="text-sm font-medium">Connection</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          {isDemoMode
            ? 'Demo mode — sample content, nothing is saved. Paste your Firebase config in src/firebase.ts for live sync.'
            : 'Live — your courses and progress sync with your school in real time.'}
        </p>
      </section>

      <button type="button" className="btn-secondary w-full text-danger" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
