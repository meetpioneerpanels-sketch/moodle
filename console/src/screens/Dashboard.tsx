import { BookOpen, CheckCircle2, GraduationCap, Layers, Plus } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { EmptyState, SkeletonList } from '../components/ui';
import { themeOf } from '../lib/theme';
import { timeAgo } from '../lib/format';
import type { ReactNode } from 'react';

interface Props {
  onOpenCourse: (courseId: string) => void;
  onNewCourse: () => void;
  onGoToCourses: () => void;
}

function StatCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tint}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-3xl leading-none">{value}</p>
        <p className="mt-1 truncate text-xs font-extrabold uppercase tracking-wide text-wolf">
          {label}
        </p>
      </div>
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
  const studentCount = users.filter((item) => item.role === 'student').length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl">
          Hi {user?.name?.split(' ')[0] ?? 'there'} <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-1 font-bold text-wolf">
          {visibleCourses.filter((course) => course.published).length} of {visibleCourses.length}{' '}
          courses are live for students right now.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-6 w-6 text-macaw-dark" />}
          tint="bg-macaw/15"
          label="My courses"
          value={visibleCourses.length}
        />
        <StatCard
          icon={<Layers className="h-6 w-6 text-fox-dark" />}
          tint="bg-fox/15"
          label="Total lessons"
          value={visibleLessons.length}
        />
        <StatCard
          icon={<CheckCircle2 className="h-6 w-6 text-grass-dark" />}
          tint="bg-grass/15"
          label="Published"
          value={visibleCourses.filter((course) => course.published).length}
        />
        <StatCard
          icon={<GraduationCap className="h-6 w-6 text-beetle-dark" />}
          tint="bg-beetle/15"
          label="Students"
          value={studentCount}
        />
      </section>

      <section className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={onNewCourse}>
          <Plus className="h-4 w-4" /> New course
        </button>
        <button type="button" className="btn-ghost" onClick={onGoToCourses}>
          <Layers className="h-4 w-4" /> Add a lesson
        </button>
      </section>

      <section>
        <h2 className="mb-3 text-xl">Recently edited</h2>
        {loading ? (
          <SkeletonList rows={3} />
        ) : visibleCourses.length === 0 ? (
          <EmptyState
            emoji="📚"
            title="No courses yet - create your first one!"
            action={
              <button type="button" className="btn-primary" onClick={onNewCourse}>
                <Plus className="h-4 w-4" /> New course
              </button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {visibleCourses.slice(0, 5).map((course) => {
              const theme = themeOf(course.colorTheme);
              return (
                <li key={course.id}>
                  <button
                    type="button"
                    onClick={() => onOpenCourse(course.id)}
                    className="card flex w-full items-center gap-4 p-4 text-left transition-shadow hover:shadow-md"
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${theme.bg}`}
                      aria-hidden="true"
                    >
                      {course.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-extrabold">{course.title}</span>
                      <span className="block text-sm font-bold text-wolf">
                        {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'} - edited{' '}
                        {timeAgo(course.updatedAt)}
                      </span>
                    </span>
                    <span
                      className={`chip ${
                        course.published ? 'bg-grass/20 text-grass-dark' : 'bg-swan text-wolf'
                      }`}
                    >
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
