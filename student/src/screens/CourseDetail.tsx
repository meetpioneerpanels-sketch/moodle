import { ArrowLeft, Check, Clock } from 'lucide-react';
import { useData } from '../hooks/useData';
import { EmptyState, SkeletonList } from '../components/ui';
import { themeOf } from '../lib/theme';

interface Props {
  courseId: string;
  onBack: () => void;
  onOpenLesson: (lessonId: string) => void;
}

export default function CourseDetail({ courseId, onBack, onOpenLesson }: Props) {
  const { courses, loading, lessonsOf, isCompleted, completedCount } = useData();

  const course = courses.find((item) => item.id === courseId);
  const lessons = lessonsOf(courseId);

  if (loading && !course) {
    return (
      <div className="px-4 pt-4">
        <SkeletonList rows={4} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="px-4 pt-4">
        <EmptyState
          emoji="🧭"
          title="This course is no longer available."
          action={
            <button type="button" className="btn-ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          }
        />
      </div>
    );
  }

  const theme = themeOf(course.colorTheme);
  const done = completedCount(courseId);

  return (
    <div className="pb-6">
      {/* Course header */}
      <header className={`${theme.bg} px-4 pb-6 pt-3 text-white`}>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-white/90"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <div className="flex items-start gap-4">
          <span className="text-5xl" aria-hidden="true">
            {course.emoji}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl text-white">{course.title}</h1>
            <p className="mt-1 text-sm font-bold text-white/85">{course.teacherName}</p>
          </div>
        </div>
        <p className="mt-3 font-bold text-white/90">{course.description}</p>
        <div className="mt-4">
          <p className="mb-1.5 text-sm font-extrabold text-white/90">
            {done} of {lessons.length} lesson{lessons.length === 1 ? '' : 's'}
          </p>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${lessons.length ? (done / lessons.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </header>

      <section className="px-4 pt-5">
        <h2 className="mb-3 text-lg">Lessons</h2>
        {lessons.length === 0 ? (
          <EmptyState emoji="📭" title="Your teacher has not added lessons yet." />
        ) : (
          <ol className="space-y-3">
            {lessons.map((lesson, index) => {
              const complete = isCompleted(lesson.id);
              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => onOpenLesson(lesson.id)}
                    className="card flex w-full items-center gap-4 p-4 text-left"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                        complete ? 'bg-grass text-white' : `${theme.soft} ${theme.text}`
                      }`}
                    >
                      {complete ? <Check className="h-5 w-5" strokeWidth={3} /> : index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-extrabold">{lesson.title}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-sm font-bold text-wolf">
                        <Clock className="h-4 w-4" /> {lesson.durationMin} min
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
