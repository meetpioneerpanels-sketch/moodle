import { useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Plus, Search } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { EmptyState, SkeletonGrid, Toggle } from '../components/ui';
import CourseModal from '../components/CourseModal';
import { themeOf } from '../lib/theme';
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
  /** Courses that have been published at least once this session - keeps confetti a first-time treat. */
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
      const matchesCategory = category === 'All' || course.category === category;
      return matchesTerm && matchesCategory;
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
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-3xl">Courses</h1>
          <p className="mt-1 font-bold text-wolf">
            {visible.length} course{visible.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          type="button"
          className="btn-primary ml-auto"
          onClick={() => setNewCourseOpen(true)}
        >
          <Plus className="h-4 w-4" /> New course
        </button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-wolf" />
          <input
            className="input pl-12"
            placeholder="Search courses"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search courses"
          />
        </div>
        <select
          className="input sm:w-52"
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
          emoji={search || category !== 'All' ? '🔍' : '📚'}
          title={
            search || category !== 'All'
              ? 'Nothing matches that search yet.'
              : 'No courses yet - create your first one!'
          }
          action={
            <button type="button" className="btn-primary" onClick={() => setNewCourseOpen(true)}>
              <Plus className="h-4 w-4" /> New course
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((course) => {
            const theme = themeOf(course.colorTheme);
            return (
              <article key={course.id} className="card flex flex-col overflow-hidden">
                <button
                  type="button"
                  onClick={() => onOpenCourse(course.id)}
                  className="flex flex-1 flex-col items-start gap-3 p-5 text-left"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${theme.bg}`}
                    aria-hidden="true"
                  >
                    {course.emoji}
                  </span>
                  <h2 className="text-lg leading-snug">{course.title}</h2>
                  <p className="line-clamp-2 text-sm font-bold text-wolf">
                    {course.description || 'No description yet.'}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                    <span className={`chip ${theme.soft} ${theme.text}`}>{course.category}</span>
                    <span className="chip bg-swan/60 text-wolf">
                      {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </button>
                <div className="flex items-center gap-3 border-t-2 border-swan px-5 py-3">
                  <span
                    className={`text-xs font-extrabold uppercase tracking-wide ${
                      course.published ? 'text-grass-dark' : 'text-wolf'
                    }`}
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
            );
          })}
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
