import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useData } from '../hooks/useData';
import { EmptyState, ProgressRing, SkeletonList } from '../components/ui';
import { toneOf } from '../lib/theme';
import { CATEGORIES } from '../types';

const CHIPS = ['All', ...CATEGORIES] as const;

export default function Browse({ onOpenCourse }: { onOpenCourse: (courseId: string) => void }) {
  const { courses, lessons, loading, completedCount } = useData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesTerm =
        !term ||
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        course.teacherName.toLowerCase().includes(term);
      return matchesTerm && (category === 'All' || course.category === category);
    });
  }, [courses, search, category]);

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <h1 className="text-lg font-semibold tracking-[-0.015em]">Browse</h1>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input
          className="input pl-9"
          placeholder="Search courses"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search courses"
        />
      </div>

      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setCategory(chip)}
            aria-pressed={category === chip}
            className={`h-8 shrink-0 rounded-full border px-3 text-[13px] font-medium transition-colors ${
              category === chip
                ? 'border-accent bg-accent-soft text-accent-on-soft'
                : 'border-line text-muted'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList rows={4} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Search className="h-4 w-4" />}
          title="No matches"
          description="Try another search or category."
        />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {visible.map((course) => {
            const total = lessons.filter((lesson) => lesson.courseId === course.id).length;
            return (
              <li key={course.id} className={toneOf(course.colorTheme)}>
                <button
                  type="button"
                  onClick={() => onOpenCourse(course.id)}
                  className="flex w-full items-center gap-3 bg-surface px-4 py-3 text-left transition-colors active:bg-surface-2"
                >
                  <span className="tone-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl">
                    {course.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{course.title}</span>
                    <span className="mt-0.5 line-clamp-1 block text-[13px] text-subtle">
                      {course.description}
                    </span>
                    <span className="chip tone-soft mt-1.5">{course.category}</span>
                  </span>
                  <ProgressRing value={completedCount(course.id)} total={total} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
