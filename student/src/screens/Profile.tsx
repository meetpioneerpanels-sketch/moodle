import { BookOpen, CheckCircle2, LogOut, Smartphone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useInstallPrompt } from '../hooks/usePwa';
import { Avatar, EmptyState, ProgressBar } from '../components/ui';
import { themeOf } from '../lib/theme';
import { isDemoMode } from '../firebase';

export default function Profile({ onOpenCourse }: { onOpenCourse: (courseId: string) => void }) {
  const { user, signOut } = useAuth();
  const { courses, lessons, progress, completedCount } = useData();
  const { canInstall, install } = useInstallPrompt();

  const completed = progress.filter((item) => item.completed).length;
  const started = courses.filter((course) => completedCount(course.id) > 0);

  return (
    <div className="space-y-6 px-4 pb-6 pt-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <Avatar name={user?.name ?? 'Student'} size="lg" />
        <div>
          <h1 className="text-2xl">{user?.name}</h1>
          <p className="font-bold text-wolf">{user?.email}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-macaw/15">
            <BookOpen className="h-5 w-5 text-macaw-dark" />
          </span>
          <span>
            <span className="block text-2xl font-extrabold leading-none">{courses.length}</span>
            <span className="text-xs font-extrabold uppercase tracking-wide text-wolf">
              Courses
            </span>
          </span>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-grass/15">
            <CheckCircle2 className="h-5 w-5 text-grass-dark" />
          </span>
          <span>
            <span className="block text-2xl font-extrabold leading-none">{completed}</span>
            <span className="text-xs font-extrabold uppercase tracking-wide text-wolf">
              Completed
            </span>
          </span>
        </div>
      </section>

      {canInstall && (
        <button type="button" className="btn-blue w-full" onClick={install}>
          <Smartphone className="h-4 w-4" /> Install app
        </button>
      )}

      <section>
        <h2 className="mb-3 text-lg">My courses</h2>
        {started.length === 0 ? (
          <EmptyState emoji="🚀" title="Finish a lesson and your progress shows up here." />
        ) : (
          <ul className="space-y-3">
            {started.map((course) => {
              const total = lessons.filter((lesson) => lesson.courseId === course.id).length;
              const done = completedCount(course.id);
              return (
                <li key={course.id}>
                  <button
                    type="button"
                    onClick={() => onOpenCourse(course.id)}
                    className="card w-full p-4 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl ${themeOf(course.colorTheme).bg}`}
                        aria-hidden="true"
                      >
                        {course.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-extrabold">{course.title}</span>
                        <span className="text-sm font-bold text-wolf">
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
        <h2 className="text-lg">Connection</h2>
        <p className="mt-1 font-bold text-wolf">
          {isDemoMode
            ? 'Demo mode - sample content, nothing is saved. Paste your Firebase config in src/firebase.ts for live sync.'
            : 'Live - your courses and progress sync with your school in real time.'}
        </p>
      </section>

      <button type="button" className="btn-danger w-full" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
