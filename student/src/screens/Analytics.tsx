import { useMemo, useState } from 'react';
import { BookOpen, Clock, Target, TrendingUp } from 'lucide-react';
import { useData } from '../hooks/useData';
import { MultiRing } from '../components/charts';
import { EmptyState, ProgressBar, Tabs } from '../components/ui';
import { hexOfSubject, toneOfSubject } from '../lib/theme';
import { CATEGORIES, type Subject } from '../types';

const TABS = ['Performance', 'Progress'] as const;
const FILTERS = ['All', ...CATEGORIES] as const;

export default function Analytics() {
  const { attempts, courses, lessons, tests, completedCount } = useData();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Performance');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const scoped = useMemo(
    () => (filter === 'All' ? attempts : attempts.filter((attempt) => attempt.subject === filter)),
    [attempts, filter],
  );

  /** Per-subject accuracy across every attempt. */
  const bySubject = useMemo(
    () =>
      CATEGORIES.map((subject) => {
        const subjectAttempts = attempts.filter((attempt) => attempt.subject === subject);
        const answered = subjectAttempts.reduce((total, attempt) => total + attempt.answers.length, 0);
        const correct = subjectAttempts.reduce((total, attempt) => total + attempt.correct, 0);
        return {
          subject,
          percent: answered > 0 ? Math.round((correct / answered) * 100) : 0,
          attempts: subjectAttempts.length,
        };
      }),
    [attempts],
  );

  const answeredTotal = scoped.reduce((total, attempt) => total + attempt.answers.length, 0);
  const correctTotal = scoped.reduce((total, attempt) => total + attempt.correct, 0);
  const secondsTotal = scoped.reduce((total, attempt) => total + attempt.secondsTaken, 0);
  const overall = answeredTotal > 0 ? Math.round((correctTotal / answeredTotal) * 100) : 0;
  const avgSeconds = answeredTotal > 0 ? Math.round(secondsTotal / answeredTotal) : 0;

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <h1 className="text-lg font-semibold">Analytics</h1>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'Performance' ? (
        <>
          {/* Subject filter */}
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={`flex shrink-0 flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-all ${
                  filter === item ? 'card' : ''
                }`}
              >
                <span
                  className={`${item === 'All' ? '' : toneOfSubject(item as Subject)} flex h-9 w-9 items-center justify-center rounded-lg ${
                    item === 'All' ? 'bg-surface-3 text-muted' : 'tone-soft'
                  }`}
                >
                  {item === 'All' ? (
                    <Target className="h-4 w-4" />
                  ) : (
                    <span className="text-[13px] font-bold">{item[0]}</span>
                  )}
                </span>
                <span
                  className={`text-2xs font-medium ${filter === item ? 'text-fg' : 'text-subtle'}`}
                >
                  {item}
                </span>
              </button>
            ))}
          </div>

          <section className="card p-5">
            <h2 className="text-base font-semibold">
              {filter === 'All' ? 'All Subjects' : filter}
            </h2>
            <p className="text-[13px] text-subtle">Overall statistics</p>

            {attempts.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={<TrendingUp className="h-5 w-5" />}
                  title="No attempts yet"
                  description="Finish a topical test and your analytics appear here."
                />
              </div>
            ) : (
              <>
                <div className="mt-5 flex items-center justify-center gap-6">
                  <ul className="space-y-3 text-right">
                    {bySubject.slice(0, 2).map((item) => (
                      <li key={item.subject}>
                        <p className="text-sm font-semibold tabular-nums">{item.percent}%</p>
                        <p className="text-2xs text-subtle">{item.subject}</p>
                      </li>
                    ))}
                  </ul>

                  <MultiRing
                    overall={overall}
                    rings={bySubject.map((item) => ({
                      label: item.subject,
                      percent: item.percent,
                      color: hexOfSubject(item.subject),
                    }))}
                  />

                  <ul className="space-y-3">
                    {bySubject.slice(2).map((item) => (
                      <li key={item.subject}>
                        <p className="text-sm font-semibold tabular-nums">{item.percent}%</p>
                        <p className="text-2xs text-subtle">{item.subject}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5">
                  {[
                    {
                      icon: <Target className="h-4 w-4" />,
                      value: `${correctTotal}/${answeredTotal}`,
                      label: 'Questions Correct',
                    },
                    {
                      icon: <BookOpen className="h-4 w-4" />,
                      value: `${scoped.length}/20`,
                      label: 'Tests Attempted',
                    },
                    {
                      icon: <Clock className="h-4 w-4" />,
                      value: `${avgSeconds}s`,
                      label: 'Avg. Time / Question',
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center gap-1.5 text-center">
                      <span className="relief flex h-10 w-10 items-center justify-center rounded-full bg-surface text-brand">
                        {stat.icon}
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{stat.value}</span>
                      <span className="text-2xs leading-tight text-subtle">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {scoped.length > 0 && (
            <section className="card p-4">
              <h2 className="text-sm font-semibold">Recent attempts</h2>
              <ul className="mt-3 divide-y divide-line">
                {[...scoped]
                  .sort((a, b) => b.completedAt - a.completedAt)
                  .slice(0, 6)
                  .map((attempt) => (
                    <li key={attempt.id} className="flex items-center gap-3 py-2.5">
                      <span
                        className={`${toneOfSubject(attempt.subject)} tone-soft flex h-8 w-8 items-center justify-center rounded-lg text-2xs font-bold`}
                      >
                        {attempt.subject[0]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">
                          {attempt.testTitle}
                        </span>
                        <span className="block truncate text-2xs text-subtle">
                          {tests.find((test) => test.id === attempt.testId)?.topic ??
                            attempt.subject}{' '}
                          · {attempt.secondsTaken}s
                        </span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {attempt.correct}/{attempt.answers.length}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        <section className="space-y-3">
          {courses.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-5 w-5" />}
              title="No courses yet"
              description="Published courses show their progress here."
            />
          ) : (
            courses.map((course) => {
              const total = lessons.filter((lesson) => lesson.courseId === course.id).length;
              const done = completedCount(course.id);
              return (
                <article key={course.id} className="card p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-lg">
                      {course.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{course.title}</p>
                      <p className="text-2xs text-subtle">
                        {done} of {total} lessons
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {total ? Math.round((done / total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={done} total={total} />
                  </div>
                </article>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}
