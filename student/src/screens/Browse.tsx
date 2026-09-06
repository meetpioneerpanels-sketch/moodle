import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useData } from '../hooks/useData';
import { EmptyState, ProgressRing, SkeletonList } from '../components/ui';
import { themeOf } from '../lib/theme';
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
      const matchesCategory = category === 'All' || course.category === category;
      return matchesTerm && matchesCategory;
    });
  }, [courses, search, category]);

  return (
    <div className="space-y-4 px-4 pb-6 pt-3">
      <h1 className="text-2xl">Browse</h1>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-wolf" />
        <input
          className="input pl-12"
          placeholder="Search courses"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search courses"
        />
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setCategory(chip)}
            className={`min-h-[40px] shrink-0 rounded-full border-2 px-4 text-sm font-extrabold transition-colors ${
              category === chip
                ? 'border-grass bg-grass/10 text-grass-dark'
                : 'border-swan text-wolf'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList rows={4} />
      ) : visible.length === 0 ? (
        <EmptyState emoji="🔍" title="Nothing here yet - try another category." />
      ) : (
        <ul className="space-y-3">
          {visible.map((course) => {
            const theme = themeOf(course.colorTheme);
            const total = lessons.filter((lesson) => lesson.courseId === course.id).length;
            return (
              <li key={course.id}>
                <button
                  type="button"
                  onClick={() => onOpenCourse(course.id)}
                  className="card flex w-full items-center gap-4 p-4 text-left"
                >
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${theme.bg}`}
                    aria-hidden="true"
                  >
                    {course.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold">{course.title}</span>
                    <span className="line-clamp-2 block text-sm font-bold text-wolf">
                      {course.description}
                    </span>
                    <span className={`chip mt-1.5 ${theme.soft} ${theme.text}`}>
                      {course.category}
                    </span>
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
