import { useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Clock,
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
import { themeOf } from '../lib/theme';
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

  if (loading && !course) return <SkeletonList rows={4} height="h-24" />;

  if (!course) {
    return (
      <EmptyState
        emoji="🧭"
        title="That course no longer exists."
        action={
          <button type="button" className="btn-ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Back to courses
          </button>
        }
      />
    );
  }

  const canEdit = user?.role === 'admin' || course.teacherId === user?.id;
  const theme = themeOf(course.colorTheme);

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
    <div className="space-y-6">
      <button type="button" className="btn-ghost btn-sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" /> All courses
      </button>

      {/* Course header */}
      <header className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl ${theme.bg}`}
          aria-hidden="true"
        >
          {course.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl">{course.title}</h1>
          <p className="mt-1 font-bold text-wolf">{course.description || 'No description yet.'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`chip ${theme.soft} ${theme.text}`}>{course.category}</span>
            <span className="chip bg-swan/60 text-wolf">{course.teacherName}</span>
            <span className="chip bg-swan/60 text-wolf">
              {courseLessons.length} lesson{courseLessons.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-extrabold uppercase tracking-wide ${
                course.published ? 'text-grass-dark' : 'text-wolf'
              }`}
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
                className="btn-ghost btn-sm"
                onClick={() => setEditCourseOpen(true)}
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button
                type="button"
                className="btn-danger btn-sm"
                onClick={() => setConfirmCourseDelete(true)}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Lessons */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl">Lessons</h2>
          {canEdit && (
            <button
              type="button"
              className="btn-primary btn-sm ml-auto"
              onClick={() => {
                setEditingLesson(null);
                setLessonEditorOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add lesson
            </button>
          )}
        </div>

        {loading ? (
          <SkeletonList rows={3} height="h-24" />
        ) : courseLessons.length === 0 ? (
          <EmptyState
            emoji="📝"
            title="No lessons yet - add the first one!"
            action={
              canEdit ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setEditingLesson(null);
                    setLessonEditorOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" /> Add lesson
                </button>
              ) : undefined
            }
          />
        ) : (
          <ol className="space-y-3">
            {courseLessons.map((lesson, index) => (
              <li key={lesson.id} className="card flex items-center gap-4 p-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white ${theme.bg}`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold">{lesson.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-3 text-sm font-bold text-wolf">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {lesson.durationMin} min
                    </span>
                    {lesson.imageUrl && (
                      <span className="inline-flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" /> image
                      </span>
                    )}
                    {lesson.videoUrl && (
                      <span className="inline-flex items-center gap-1">
                        <Video className="h-4 w-4" /> video
                      </span>
                    )}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Move ${lesson.title} up`}
                      disabled={index === 0}
                      onClick={() => moveLesson(courseId, lesson.id, -1)}
                      className="rounded-xl p-2 text-wolf transition-colors hover:bg-swan/40 hover:text-ink disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${lesson.title} down`}
                      disabled={index === courseLessons.length - 1}
                      onClick={() => moveLesson(courseId, lesson.id, 1)}
                      className="rounded-xl p-2 text-wolf transition-colors hover:bg-swan/40 hover:text-ink disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit ${lesson.title}`}
                      onClick={() => {
                        setEditingLesson(lesson);
                        setLessonEditorOpen(true);
                      }}
                      className="rounded-xl p-2 text-macaw transition-colors hover:bg-macaw/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${lesson.title}`}
                      onClick={() => setLessonToDelete(lesson)}
                      className="rounded-xl p-2 text-cardinal transition-colors hover:bg-cardinal/10"
                    >
                      <Trash2 className="h-4 w-4" />
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
