import { useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Clock,
  FileText,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
  Video,
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog, EmptyState, SkeletonList, Toggle } from '../components/ui';
import CourseModal from '../components/CourseModal';
import LessonEditor from '../components/LessonEditor';
import { toneOf } from '../lib/theme';
import { burstConfetti } from '../lib/confetti';
import type { Lesson, LessonDraft } from '../types';

interface Props {
  courseId: string;
  onBack: () => void;
}

export default function CourseEditor({ courseId, onBack }: Props) {
  const { user } = useAuth();
  const {
    courses,
    lessons,
    loading,
    updateCourse,
    setPublished,
    deleteCourse,
    createLesson,
    updateLesson,
    deleteLesson,
    moveLesson,
  } = useData();
  const { toast } = useToast();

  const [editCourseOpen, setEditCourseOpen] = useState(false);
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [confirmCourseDelete, setConfirmCourseDelete] = useState(false);
  const [everPublished, setEverPublished] = useState(false);

  const course = courses.find((item) => item.id === courseId);
  const courseLessons = useMemo(
    () => lessons.filter((lesson) => lesson.courseId === courseId),
    [lessons, courseId],
  );

  if (loading && !course) return <SkeletonList rows={4} height="h-20" />;

  if (!course) {
    return (
      <EmptyState
        icon={<FileText className="h-4 w-4" />}
        title="Course not found"
        description="It may have been deleted by another teacher."
        action={
          <button type="button" className="btn-secondary btn-sm" onClick={onBack}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
          </button>
        }
      />
    );
  }

  const canEdit = user?.role === 'admin' || course.teacherId === user?.id;
  const tone = toneOf(course.colorTheme);

  async function handlePublish(next: boolean, event: ReactMouseEvent) {
    if (!course) return;
    await setPublished(course.id, next);
    if (next && !everPublished) {
      burstConfetti({ x: event.clientX, y: event.clientY });
      setEverPublished(true);
    }
    toast(next ? 'Course published - students can see it now' : 'Course moved back to draft');
  }

  async function handleSaveLesson(draft: LessonDraft) {
    if (editingLesson) {
      await updateLesson(editingLesson.id, draft);
      toast('Lesson saved');
    } else {
      await createLesson(courseId, draft);
      toast('Lesson added');
    }
  }

  return (
    <div className={`${tone} space-y-6`}>
      <button type="button" className="btn-quiet btn-sm -ml-2" onClick={onBack}>
        <ArrowLeft className="h-3.5 w-3.5" /> All courses
      </button>

      {/* Course header */}
      <header className="card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="tone-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl">
            {course.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold tracking-[-0.015em]">{course.title}</h1>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              {course.description || 'No description yet.'}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="chip tone-soft">{course.category}</span>
              <span className="chip-neutral">{course.teacherName}</span>
              <span className="chip-neutral">
                {courseLessons.length} lesson{courseLessons.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex items-center gap-2">
              <span
                className={`text-[13px] ${course.published ? 'text-success' : 'text-subtle'}`}
              >
                {course.published ? 'Published' : 'Draft'}
              </span>
              <Toggle
                checked={course.published}
                disabled={!canEdit}
                onChange={handlePublish}
                label="Publish course"
              />
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setEditCourseOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm text-danger"
                  onClick={() => setConfirmCourseDelete(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Lessons */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[13px] font-medium text-muted">Lessons</h2>
          {canEdit && (
            <button
              type="button"
              className="btn-secondary btn-sm ml-auto"
              onClick={() => {
                setEditingLesson(null);
                setLessonEditorOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add lesson
            </button>
          )}
        </div>

        {loading ? (
          <SkeletonList rows={3} height="h-16" />
        ) : courseLessons.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-4 w-4" />}
            title="No lessons yet"
            description="Add the first lesson to this course."
            action={
              canEdit ? (
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={() => {
                    setEditingLesson(null);
                    setLessonEditorOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add lesson
                </button>
              ) : undefined
            }
          />
        ) : (
          <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {courseLessons.map((lesson, index) => (
              <li
                key={lesson.id}
                className="group flex items-center gap-3 bg-surface px-4 py-3 transition-colors hover:bg-surface-2"
              >
                <span className="w-5 shrink-0 text-center text-[13px] tabular-nums text-subtle">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{lesson.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2.5 text-[13px] text-subtle">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {lesson.durationMin} min
                    </span>
                    {lesson.imageUrl && (
                      <span className="inline-flex items-center gap-1">
                        <ImageIcon className="h-3.5 w-3.5" /> image
                      </span>
                    )}
                    {lesson.videoUrl && (
                      <span className="inline-flex items-center gap-1">
                        <Video className="h-3.5 w-3.5" /> video
                      </span>
                    )}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex shrink-0 items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label={`Move ${lesson.title} up`}
                      disabled={index === 0}
                      onClick={() => moveLesson(courseId, lesson.id, -1)}
                      className="rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-3 hover:text-fg disabled:opacity-25"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${lesson.title} down`}
                      disabled={index === courseLessons.length - 1}
                      onClick={() => moveLesson(courseId, lesson.id, 1)}
                      className="rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-3 hover:text-fg disabled:opacity-25"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit ${lesson.title}`}
                      onClick={() => {
                        setEditingLesson(lesson);
                        setLessonEditorOpen(true);
                      }}
                      className="rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-3 hover:text-fg"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${lesson.title}`}
                      onClick={() => setLessonToDelete(lesson)}
                      className="rounded-md p-1.5 text-subtle transition-colors hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <CourseModal
        open={editCourseOpen}
        course={course}
        onClose={() => setEditCourseOpen(false)}
        onSave={async (draft) => {
          await updateCourse(course.id, draft);
          toast('Course updated');
        }}
      />

      <LessonEditor
        open={lessonEditorOpen}
        lesson={editingLesson}
        courseTitle={course.title}
        onClose={() => setLessonEditorOpen(false)}
        onSave={handleSaveLesson}
      />

      <ConfirmDialog
        open={lessonToDelete !== null}
        title="Delete lesson?"
        message={`"${lessonToDelete?.title}" will be removed for every student. This cannot be undone.`}
        onCancel={() => setLessonToDelete(null)}
        onConfirm={async () => {
          if (!lessonToDelete) return;
          await deleteLesson(lessonToDelete.id, courseId);
          setLessonToDelete(null);
          toast('Lesson deleted', 'info');
        }}
      />

      <ConfirmDialog
        open={confirmCourseDelete}
        title="Delete course?"
        message={`"${course.title}" and all ${courseLessons.length} of its lessons will be deleted permanently.`}
        confirmLabel="Delete course"
        onCancel={() => setConfirmCourseDelete(false)}
        onConfirm={async () => {
          await deleteCourse(course.id);
          setConfirmCourseDelete(false);
          toast('Course deleted', 'info');
          onBack();
        }}
      />
    </div>
  );
}
