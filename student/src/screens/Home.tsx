import { useMemo } from 'react';
import { ChevronRight, Flame, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { Avatar, EmptyState, LiveDot, ProgressRing, SkeletonList, ThemeToggle } from '../components/ui';
import { toneOf } from '../lib/theme';
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
  // A streak survives until the end of the following day.
  let cursor = days.has(today.toDateString()) ? today : new Date(today.getTime() - dayMs);
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
          <p className="truncate text-[15px] font-semibold tracking-[-0.01em]">
            Hi {user?.name?.split(' ')[0] ?? 'there'}
          </p>
          <LiveDot live={live} />
        </div>
        {streak > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-md bg-surface-3 px-2 py-1 text-[13px] font-medium text-muted"
            title={`${streak}-day streak`}
          >
            <Flame className="h-3.5 w-3.5" /> {streak}
          </span>
        )}
        <ThemeToggle />
      </header>

      {loading ? (
        <SkeletonList rows={3} height="h-24" />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-4 w-4" />}
          title="Nothing published yet"
          description="Your courses appear here the moment a teacher publishes them."
        />
      ) : (
        <>
          {nextUp && (
            <section>
              <h2 className="mb-2 text-[13px] font-medium text-muted">Continue learning</h2>
              <button
                type="button"
                onClick={() => onOpenLesson(nextUp.course.id, nextUp.lesson.id)}
                className={`${toneOf(nextUp.course.colorTheme)} card card-hover flex w-full items-center gap-3 p-4 text-left`}
              >
                <span className="tone-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl">
                  {nextUp.course.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="tone-text block truncate text-2xs font-medium">
                    {nextUp.course.title}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-medium">
                    {nextUp.lesson.title}
                  </span>
                  <span className="block text-[13px] text-subtle">
                    {nextUp.lesson.durationMin} min
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-subtle" />
              </button>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-[13px] font-medium text-muted">All courses</h2>
            <div className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1">
              {courses.map((course) => {
                const total = lessons.filter((lesson) => lesson.courseId === course.id).length;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => onOpenCourse(course.id)}
                    className={`${toneOf(course.colorTheme)} card card-hover w-[64vw] max-w-[220px] shrink-0 snap-start p-4 text-left`}
                  >
                    <span className="flex items-start justify-between">
                      <span className="tone-soft flex h-10 w-10 items-center justify-center rounded-lg text-lg">
                        {course.emoji}
                      </span>
                      <ProgressRing value={completedCount(course.id)} total={total} />
                    </span>
                    <span className="mt-3 block truncate text-sm font-medium">{course.title}</span>
                    <span className="mt-0.5 block text-[13px] text-subtle">
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
