import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, FileText } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import AmbientBackground from '../components/AmbientBackground';
import { EmptyState } from '../components/ui';
import { burstConfetti } from '../lib/confetti';
import { cacheLesson, cachedLesson } from '../lib/offline';
import { toneOf } from '../lib/theme';
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
          icon={<FileText className="h-4 w-4" />}
          title="Not available offline"
          description="Open this lesson once while online to read it later."
          action={
            <button type="button" className="btn-secondary btn-sm" onClick={onBack}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to course
            </button>
          }
        />
      </div>
    );
  }

  const previous = index > 0 ? lessons[index - 1] : undefined;
  const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined;
  const progressPercent = lessons.length ? ((index + 1) / lessons.length) * 100 : 0;

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
    <div className={`${toneOf(course?.colorTheme)} flex min-h-[100dvh] flex-col`}>
      <AmbientBackground />
      <header className="glass sticky top-0 z-20 border-b">
        <div className="flex h-12 items-center gap-1 px-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to course"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="min-w-0 flex-1 truncate text-[13px] text-muted">
            {course?.title ?? 'Lesson'}
          </span>
          <span className="shrink-0 px-2 text-[13px] tabular-nums text-subtle">
            {index >= 0 ? `${index + 1}/${lessons.length}` : ''}
          </span>
        </div>
        {/* Reading position within the course. */}
        <div className="h-0.5 w-full bg-line">
          <div className="tone-bar h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-36 pt-6">
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]">
          {lesson.title}
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-subtle">
          <Clock className="h-3.5 w-3.5" /> {lesson.durationMin} min read
        </p>

        {lesson.imageUrl && (
          <img
            src={lesson.imageUrl}
            alt=""
            className="mt-5 w-full rounded-xl border border-line object-cover"
            onError={(event) => {
              (event.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        <article className="prose-lesson mt-6">
          {paragraphs.map((block, blockIndex) => (
            <p key={blockIndex}>{block}</p>
          ))}
        </article>

        {lesson.videoUrl && (
          <div className="mt-5 aspect-video w-full overflow-hidden rounded-xl border border-line">
            <iframe
              src={lesson.videoUrl}
              title={`${lesson.title} video`}
              className="h-full w-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <nav className="mt-8 flex gap-2">
          <button
            type="button"
            className="btn-secondary btn-sm flex-1"
            disabled={!previous}
            onClick={() => previous && onOpenLesson(previous.id)}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm flex-1"
            disabled={!next}
            onClick={() => next && onOpenLesson(next.id)}
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </nav>
      </div>

      {/* Sticky action bar */}
      <div className="glass fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t px-4 pb-safe pt-3">
        {completed ? (
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-success">
              <Check className="h-4 w-4" strokeWidth={2.5} /> Completed
            </span>
            {next && (
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => onOpenLesson(next.id)}
              >
                Next lesson <ChevronRight className="h-3.5 w-3.5" />
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
            <Check className="h-4 w-4" strokeWidth={2.5} /> Mark as complete
          </button>
        )}
      </div>
    </div>
  );
}
