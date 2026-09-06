import { useMemo } from 'react';
import { Flame, Play } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { Avatar, EmptyState, LiveDot, ProgressRing, SkeletonList } from '../components/ui';
import { themeOf } from '../lib/theme';
import type { Course, Lesson, LessonProgress } from '../types';

/** Consecutive days, ending today or yesterday, on which a lesson was completed. */
function streakOf(progress: LessonProgress[]): number {
  const days = new Set(
    progress
      .filter((item) => item.completed && item.completedAt)
      .map((item) => new Date(item.completedAt).toDateString()),
  );
  if (days.size === 0) return 0;

  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date();
  let cursor = days.has(today.toDateString())
    ? today
    : new Date(today.getTime() - dayMs); // a streak survives until the end of the next day
  if (!days.has(cursor.toDateString())) return 0;

  let streak = 0;
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor = new Date(cursor.getTime() - dayMs);
  }
  return streak;
}

interface Props {
  onOpenCourse: (courseId: string) => void;
  onOpenLesson: (courseId: string, lessonId: string) => void;
}

export default function Home({ onOpenCourse, onOpenLesson }: Props) {
  const { user } = useAuth();
  const { courses, lessons, progress, loading, live, isCompleted, completedCount } = useData();

  const streak = useMemo(() => streakOf(progress), [progress]);

  // The next thing to do: first unfinished lesson of the most recently updated course.
  const nextUp = useMemo<{ course: Course; lesson: Lesson } | null>(() => {
    const ordered = [...courses].sort((a, b) => b.updatedAt - a.updatedAt);
    const started = ordered.filter((course) => completedCount(course.id) > 0);
    for (const course of [...started, ...ordered]) {
      const lesson = lessons
        .filter((item) => item.courseId === course.id)
        .find((item) => !isCompleted(item.id));
      if (lesson) return { course, lesson };
    }
    return null;
  }, [courses, lessons, isCompleted, completedCount]);

  return (
    <div className="space-y-6 px-4 pb-6 pt-3">
      <header className="flex items-center gap-3">
        <Avatar name={user?.name ?? 'Student'} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold leading-tight">
            Hi {user?.name?.split(' ')[0] ?? 'there'}!
          </p>
          <LiveDot live={live} />
        </div>
        <span
          className="flex items-center gap-1 rounded-2xl bg-fox/15 px-3 py-2 font-extrabold text-fox-dark"
          title={`${streak}-day streak`}
        >
          <Flame className="h-5 w-5" /> {streak}
        </span>
      </header>

      {loading ? (
        <SkeletonList rows={3} height="h-28" />
      ) : courses.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="No courses published yet - check back soon!"
        />
      ) : (
        <>
          {nextUp && (
            <section>
              <h2 className="mb-2 text-lg">Continue learning</h2>
              <button
                type="button"
                onClick={() => onOpenLesson(nextUp.course.id, nextUp.lesson.id)}
                className={`w-full rounded-2xl p-5 text-left text-white shadow-sm ${themeOf(nextUp.course.colorTheme).bg}`}
              >
                <span className="flex items-center gap-4">
                  <span className="text-4xl" aria-hidden="true">
                    {nextUp.course.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold uppercase tracking-wide text-white/80">
                      {nextUp.course.title}
                    </span>
                    <span className="block truncate text-lg font-extrabold">
                      {nextUp.lesson.title}
                    </span>
                    <span className="block text-sm font-bold text-white/85">
                      {nextUp.lesson.durationMin} min
                    </span>
                  </span>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/25">
                    <Play className="h-6 w-6 fill-white" />
                  </span>
                </span>
              </button>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-lg">All courses</h2>
            <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
              {courses.map((course) => {
                const theme = themeOf(course.colorTheme);
                const total = lessons.filter((lesson) => lesson.courseId === course.id).length;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => onOpenCourse(course.id)}
                    className="card w-[72vw] max-w-[260px] shrink-0 snap-start p-4 text-left"
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${theme.bg}`}
                        aria-hidden="true"
                      >
                        {course.emoji}
                      </span>
                      <ProgressRing value={completedCount(course.id)} total={total} />
                    </span>
                    <span className="mt-3 block truncate font-extrabold">{course.title}</span>
                    <span className="mt-0.5 block text-sm font-bold text-wolf">
                      {completedCount(course.id)} of {total} lesson{total === 1 ? '' : 's'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
