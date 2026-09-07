import { BookOpen, CheckCircle2, GraduationCap, Layers, Plus } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { EmptyState, SkeletonList } from '../components/ui';
import { toneOf } from '../lib/theme';
import { timeAgo } from '../lib/format';
import type { ReactNode } from 'react';

interface Props {
  onOpenCourse: (courseId: string) => void;
  onNewCourse: () => void;
  onGoToCourses: () => void;
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-subtle">
        {icon}
        <span className="text-[13px] font-medium">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-[-0.02em]">{value}</p>
    </div>
  );
}

export default function Dashboard({ onOpenCourse, onNewCourse, onGoToCourses }: Props) {
  const { user } = useAuth();
  const { courses, lessons, users, loading } = useData();

  // Admins see the whole school; teachers see the courses they own.
  const visibleCourses =
    user?.role === 'admin' ? courses : courses.filter((course) => course.teacherId === user?.id);
  const visibleCourseIds = new Set(visibleCourses.map((course) => course.id));
  const visibleLessons = lessons.filter((lesson) => visibleCourseIds.has(lesson.courseId));
  const published = visibleCourses.filter((course) => course.published).length;
  const studentCount = users.filter((item) => item.role === 'student').length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.015em]">
            Hi {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {published} of {visibleCourses.length} course
            {visibleCourses.length === 1 ? '' : 's'} live for students
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary btn-sm" onClick={onGoToCourses}>
            <Layers className="h-3.5 w-3.5" /> Add a lesson
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={onNewCourse}>
            <Plus className="h-3.5 w-3.5" /> New course
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-4 w-4" />}
          label="My courses"
          value={visibleCourses.length}
        />
        <StatCard
          icon={<Layers className="h-4 w-4" />}
          label="Total lessons"
          value={visibleLessons.length}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Published"
          value={published}
        />
        <StatCard
          icon={<GraduationCap className="h-4 w-4" />}
          label="Students"
          value={studentCount}
        />
      </section>

      <section>
        <h2 className="mb-3 text-[13px] font-medium text-muted">Recently edited</h2>
        {loading ? (
          <SkeletonList rows={3} />
        ) : visibleCourses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-4 w-4" />}
            title="No courses yet"
            description="Create your first course to get started."
            action={
              <button type="button" className="btn-primary btn-sm" onClick={onNewCourse}>
                <Plus className="h-3.5 w-3.5" /> New course
              </button>
            }
          />
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {visibleCourses.slice(0, 5).map((course) => (
              <li key={course.id}>
                <button
                  type="button"
                  onClick={() => onOpenCourse(course.id)}
                  className={`${toneOf(course.colorTheme)} flex w-full items-center gap-3 bg-surface px-4 py-3 text-left transition-colors hover:bg-surface-2`}
                >
                  <span className="tone-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base">
                    {course.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{course.title}</span>
                    <span className="block text-[13px] text-subtle">
                      {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'} · edited{' '}
                      {timeAgo(course.updatedAt)}
                    </span>
                  </span>
                  <span
                    className={`chip ${
                      course.published ? 'bg-success-soft text-success' : 'chip-neutral'
                    }`}
                  >
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
