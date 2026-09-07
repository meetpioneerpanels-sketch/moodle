import { ArrowLeft, Check, Clock, FileText } from 'lucide-react';
import { useData } from '../hooks/useData';
import { EmptyState, SkeletonList } from '../components/ui';
import { toneOf } from '../lib/theme';

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
          icon={<FileText className="h-4 w-4" />}
          title="Course unavailable"
          description="It may have been unpublished by your teacher."
          action={
            <button type="button" className="btn-secondary btn-sm" onClick={onBack}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          }
        />
      </div>
    );
  }

  const done = completedCount(courseId);
  const percent = lessons.length ? Math.round((done / lessons.length) * 100) : 0;

  return (
    <div className={`${toneOf(course.colorTheme)} pb-6`}>
      <header className="ambient-fields border-b border-line px-4 pb-5 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 mb-3 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-start gap-3">
          <span className="tone-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl">
            {course.emoji}
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-snug tracking-[-0.015em]">
              {course.title}
            </h1>
            <p className="mt-0.5 text-[13px] text-subtle">{course.teacherName}</p>
          </div>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-muted">{course.description}</p>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[13px]">
            <span className="text-muted">
              {done} of {lessons.length} lesson{lessons.length === 1 ? '' : 's'}
            </span>
            <span className="tone-text font-medium tabular-nums">{percent}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-line">
            <div
              className="tone-bar h-full rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </header>

      <section className="px-4 pt-5">
        <h2 className="mb-2.5 text-[13px] font-medium text-muted">Lessons</h2>
        {lessons.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-4 w-4" />}
            title="No lessons yet"
            description="Your teacher has not added any lessons."
          />
        ) : (
          <ol className="card divide-y divide-line overflow-hidden">
            {lessons.map((lesson, index) => {
              const complete = isCompleted(lesson.id);
              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => onOpenLesson(lesson.id)}
                    className="flex w-full items-center gap-3 bg-surface px-4 py-3 text-left transition-colors active:bg-surface-2"
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-2xs font-medium ${
                        complete ? 'tone-solid' : 'bg-surface-3 text-subtle'
                      }`}
                    >
                      {complete ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm ${complete ? 'text-muted' : 'font-medium'}`}
                      >
                        {lesson.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[13px] text-subtle">
                        <Clock className="h-3.5 w-3.5" /> {lesson.durationMin} min
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
