import { useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { BookOpen, Plus, Search } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { EmptyState, SkeletonGrid, Toggle } from '../components/ui';
import CourseModal from '../components/CourseModal';
import { toneOf } from '../lib/theme';
import { burstConfetti } from '../lib/confetti';
import { CATEGORIES, type Course, type CourseDraft } from '../types';

interface Props {
  onOpenCourse: (courseId: string) => void;
  newCourseOpen: boolean;
  setNewCourseOpen: (open: boolean) => void;
}

export default function Courses({ onOpenCourse, newCourseOpen, setNewCourseOpen }: Props) {
  const { user } = useAuth();
  const { courses, loading, createCourse, setPublished } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  /** Courses published at least once this session - keeps confetti a first-time treat. */
  const [celebrated, setCelebrated] = useState<Set<string>>(new Set());

  const canEdit = (course: Course) => user?.role === 'admin' || course.teacherId === user?.id;

  const visible = useMemo(() => {
    const mine =
      user?.role === 'admin' ? courses : courses.filter((course) => course.teacherId === user?.id);
    const term = search.trim().toLowerCase();
    return mine.filter((course) => {
      const matchesTerm =
        !term ||
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term);
      return matchesTerm && (category === 'All' || course.category === category);
    });
  }, [courses, user, search, category]);

  async function handleCreate(draft: CourseDraft) {
    if (!user) return;
    await createCourse(draft, { id: user.id, name: user.name });
    toast('Course created');
  }

  async function handlePublish(course: Course, next: boolean, event: ReactMouseEvent) {
    await setPublished(course.id, next);
    if (next && !celebrated.has(course.id)) {
      burstConfetti({ x: event.clientX, y: event.clientY });
      setCelebrated(new Set(celebrated).add(course.id));
    }
    toast(next ? `"${course.title}" is live for students` : `"${course.title}" moved to draft`);
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.015em]">Courses</h1>
          <p className="mt-1 text-[13px] text-muted">
            {visible.length} course{visible.length === 1 ? '' : 's'}
          </p>
        </div>
        <button type="button" className="btn-primary btn-sm" onClick={() => setNewCourseOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New course
        </button>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            className="input pl-9"
            placeholder="Search courses"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search courses"
          />
        </div>
        <select
          className="input sm:w-44"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={search || category !== 'All' ? <Search className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
          title={search || category !== 'All' ? 'No matches' : 'No courses yet'}
          description={
            search || category !== 'All'
              ? 'Try a different search or category.'
              : 'Create your first course to get started.'
          }
          action={
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => setNewCourseOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> New course
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((course) => (
            <article
              key={course.id}
              className={`${toneOf(course.colorTheme)} card card-hover flex flex-col`}
            >
              <button
                type="button"
                onClick={() => onOpenCourse(course.id)}
                className="flex flex-1 flex-col items-start gap-3 p-4 text-left"
              >
                <span className="tone-soft flex h-10 w-10 items-center justify-center rounded-lg text-lg">
                  {course.emoji}
                </span>
                <span className="w-full">
                  <span className="block truncate text-sm font-medium">{course.title}</span>
                  <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-subtle">
                    {course.description || 'No description yet.'}
                  </span>
                </span>
                <span className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="chip tone-soft">{course.category}</span>
                  <span className="chip-neutral">
                    {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'}
                  </span>
                </span>
              </button>
              <div className="flex items-center gap-2 border-t border-line px-4 py-2.5">
                <span
                  className={`text-[13px] ${course.published ? 'text-success' : 'text-subtle'}`}
                >
                  {course.published ? 'Published' : 'Draft'}
                </span>
                <span className="ml-auto">
                  <Toggle
                    checked={course.published}
                    disabled={!canEdit(course)}
                    onChange={(next, event) => handlePublish(course, next, event)}
                    label={`Publish ${course.title}`}
                  />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <CourseModal
        open={newCourseOpen}
        onClose={() => setNewCourseOpen(false)}
        onSave={handleCreate}
      />
    </div>
  );
}
