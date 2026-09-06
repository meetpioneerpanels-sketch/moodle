import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { EmptyState } from '../components/ui';
import { burstConfetti } from '../lib/confetti';
import { cacheLesson, cachedLesson } from '../lib/offline';
import { themeOf } from '../lib/theme';
import type { Lesson } from '../types';

interface Props {
  courseId: string;
  lessonId: string;
  onBack: () => void;
  onOpenLesson: (lessonId: string) => void;
}

export default function LessonPlayer({ courseId, lessonId, onBack, onOpenLesson }: Props) {
  const { courses, lessonsOf, isCompleted, markComplete } = useData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const course = courses.find((item) => item.id === courseId);
  const lessons = lessonsOf(courseId);
  const index = lessons.findIndex((item) => item.id === lessonId);
  // Fall back to the offline copy when the network dropped mid-session.
  const lesson: Lesson | undefined = lessons[index] ?? cachedLesson(lessonId);

  const completed = isCompleted(lessonId);

  useEffect(() => {
    if (lesson) cacheLesson(lesson);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [lesson]);

  const paragraphs = useMemo(
    () => (lesson?.content ?? '').split(/\n\s*\n/).filter((block) => block.trim().length > 0),
    [lesson?.content],
  );

  if (!lesson) {
    return (
      <div className="px-4 pt-4">
        <EmptyState
          emoji="📄"
          title="This lesson is not available offline."
          action={
            <button type="button" className="btn-ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" /> Back to course
            </button>
          }
        />
      </div>
    );
  }

  const theme = themeOf(course?.colorTheme);
  const previous = index > 0 ? lessons[index - 1] : undefined;
  const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined;

  async function handleComplete(event: ReactMouseEvent) {
    if (completed || saving) return;
    setSaving(true);
    try {
      await markComplete(courseId, lessonId);
      burstConfetti({ x: event.clientX, y: event.clientY });
      toast('Lesson complete - nice work!');
    } catch (error) {
      toast((error as Error).message || 'Could not save your progress', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b-2 border-swan bg-white/95 px-3 py-2 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to course"
          className="flex h-11 w-11 items-center justify-center rounded-full text-wolf"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-wolf">
          {course?.title ?? 'Lesson'}
        </span>
        <span className="shrink-0 text-sm font-extrabold text-wolf">
          {index >= 0 ? `${index + 1}/${lessons.length}` : ''}
        </span>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-40 pt-5">
        <h1 className="text-2xl leading-tight">{lesson.title}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-wolf">
          <Clock className="h-4 w-4" /> {lesson.durationMin} min read
        </p>

        {lesson.imageUrl && (
          <img
            src={lesson.imageUrl}
            alt=""
            className="mt-4 w-full rounded-2xl border-2 border-swan object-cover"
            onError={(event) => {
              (event.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        <article className="prose-lesson mt-5 text-ink">
          {paragraphs.map((block, blockIndex) => (
            <p key={blockIndex}>{block}</p>
          ))}
        </article>

        {lesson.videoUrl && (
          <div className="mt-5 aspect-video w-full overflow-hidden rounded-2xl border-2 border-swan">
            <iframe
              src={lesson.videoUrl}
              title={`${lesson.title} video`}
              className="h-full w-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <nav className="mt-8 flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1"
            disabled={!previous}
            onClick={() => previous && onOpenLesson(previous.id)}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button
            type="button"
            className="btn-ghost flex-1"
            disabled={!next}
            onClick={() => next && onOpenLesson(next.id)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t-2 border-swan bg-white px-4 pb-safe pt-3">
        {completed ? (
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 font-extrabold text-grass-dark">
              <Check className="h-5 w-5" strokeWidth={3} /> Completed
            </span>
            {next && (
              <button
                type="button"
                className={`btn text-white ${theme.bg} ${theme.border}`}
                onClick={() => onOpenLesson(next.id)}
              >
                Next lesson <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="btn-primary w-full"
            onClick={handleComplete}
            disabled={saving}
          >
            <Check className="h-5 w-5" strokeWidth={3} /> Mark as complete
          </button>
        )}
      </div>
    </div>
  );
}
