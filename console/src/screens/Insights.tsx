import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Clock, Target, Users } from 'lucide-react';
import { useData } from '../hooks/useData';
import { BarChart, Donut } from '../components/charts';
import { EmptyState, SkeletonList } from '../components/ui';
import { CHART, hexOfSubject, toneOfSubject } from '../lib/theme';
import { CATEGORIES, type Subject } from '../types';

/**
 * What the question bank looks like from the students' side: which tests get
 * attempted, how they score, and which questions trip most people up. Reads
 * testAttempts, which nothing else in the console touches.
 */
export default function Insights() {
  const { attempts, tests, questions, loading } = useData();
  const [subject, setSubject] = useState<Subject | 'All'>('All');

  const scoped = useMemo(
    () => (subject === 'All' ? attempts : attempts.filter((item) => item.subject === subject)),
    [attempts, subject],
  );

  const answered = scoped.reduce((total, attempt) => total + attempt.answers.length, 0);
  const correct = scoped.reduce((total, attempt) => total + attempt.correct, 0);
  const seconds = scoped.reduce((total, attempt) => total + attempt.secondsTaken, 0);
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const learners = new Set(scoped.map((attempt) => attempt.userId)).size;

  /** Accuracy per subject, for the comparison bars. */
  const bySubject = useMemo(
    () =>
      CATEGORIES.map((item) => {
        const slice = attempts.filter((attempt) => attempt.subject === item);
        const total = slice.reduce((sum, attempt) => sum + attempt.answers.length, 0);
        const hits = slice.reduce((sum, attempt) => sum + attempt.correct, 0);
        return total > 0 ? Math.round((hits / total) * 100) : 0;
      }),
    [attempts],
  );

  /** Per-test rollup, most attempted first. */
  const byTest = useMemo(() => {
    const rows = new Map<string, { attempts: number; answered: number; correct: number }>();
    scoped.forEach((attempt) => {
      const row = rows.get(attempt.testId) ?? { attempts: 0, answered: 0, correct: 0 };
      row.attempts += 1;
      row.answered += attempt.answers.length;
      row.correct += attempt.correct;
      rows.set(attempt.testId, row);
    });
    return [...rows.entries()]
      .map(([testId, row]) => ({
        test: tests.find((item) => item.id === testId),
        ...row,
        accuracy: row.answered > 0 ? Math.round((row.correct / row.answered) * 100) : 0,
      }))
      .filter((row) => row.test)
      .sort((a, b) => b.attempts - a.attempts);
  }, [scoped, tests]);

  /** The questions students get wrong most often - where teaching should go. */
  const hardest = useMemo(() => {
    const rows = new Map<string, { seen: number; missed: number }>();
    scoped.forEach((attempt) => {
      attempt.answers.forEach((answer) => {
        const row = rows.get(answer.questionId) ?? { seen: 0, missed: 0 };
        row.seen += 1;
        if (!answer.correct) row.missed += 1;
        rows.set(answer.questionId, row);
      });
    });
    return [...rows.entries()]
      .map(([questionId, row]) => ({
        question: questions.find((item) => item.id === questionId),
        ...row,
        missRate: row.seen > 0 ? Math.round((row.missed / row.seen) * 100) : 0,
      }))
      .filter((row) => row.question && row.seen >= 2 && row.missRate >= 50)
      .sort((a, b) => b.missRate - a.missRate || b.seen - a.seen)
      .slice(0, 6);
  }, [scoped, questions]);

  if (loading) return <SkeletonList rows={5} height="h-20" />;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Insights</h1>
          <p className="mt-1 text-[13px] text-muted">
            How students are performing on the tests you publish.
          </p>
        </div>
        <select
          className="input h-9 w-auto py-0 text-[13px]"
          value={subject}
          onChange={(event) => setSubject(event.target.value as Subject | 'All')}
          aria-label="Filter by subject"
        >
          <option value="All">All subjects</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </header>

      {attempts.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-4 w-4" />}
          title="No attempts yet"
          description="Once students take your tests, their results are summarised here."
        />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: <Target className="h-4 w-4" />, label: 'Attempts', value: String(scoped.length), fill: 'fill-brand' },
              { icon: <Users className="h-4 w-4" />, label: 'Students', value: String(learners), fill: 'fill-sky' },
              { icon: <BarChart3 className="h-4 w-4" />, label: 'Questions answered', value: String(answered), fill: 'fill-amber' },
              {
                icon: <Clock className="h-4 w-4" />,
                label: 'Avg. time / question',
                value: answered > 0 ? `${Math.round(seconds / answered)}s` : '-',
                fill: 'fill-rose',
              },
            ].map((stat) => (
              <div key={stat.label} className="card flex items-center gap-3 p-4">
                <span className={`${stat.fill} flex h-10 w-10 items-center justify-center rounded-xl`}>
                  {stat.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-xl font-semibold tabular-nums">{stat.value}</span>
                  <span className="block truncate text-[13px] text-subtle">{stat.label}</span>
                </span>
              </div>
            ))}
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="card p-5">
              <h2 className="text-sm font-semibold">Accuracy by subject</h2>
              <div className="mt-4 flex items-center gap-6">
                <Donut percent={accuracy} caption="Selected" color={CHART.correct} size={92} stroke={9} />
                <div className="min-w-0 flex-1">
                  <BarChart
                    categories={[...CATEGORIES]}
                    series={[
                      {
                        label: 'Accuracy',
                        color: CHART.correct,
                        colors: CATEGORIES.map((item) => hexOfSubject(item)),
                        values: bySubject,
                      },
                    ]}
                    height={104}
                    valueSuffix="%"
                  />
                </div>
              </div>
            </section>

            <section className="card p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Questions students miss most
              </h2>
              {hardest.length === 0 ? (
                <p className="mt-3 text-[13px] text-subtle">
                  Nothing is being missed by half the class or more - the bank is landing well.
                </p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {hardest.map((row) => (
                    <li key={row.question!.id} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-2xs font-bold ${
                          row.missRate >= 75
                            ? 'bg-danger-soft text-danger'
                            : 'bg-warning-soft text-warning'
                        }`}
                      >
                        {row.missRate}%
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-[13px]">{row.question!.text}</span>
                        <span className="mt-0.5 block text-2xs text-subtle">
                          {row.question!.difficulty} · seen {row.seen} times
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section>
            <h2 className="mb-3 text-[13px] font-medium text-muted">Test performance</h2>
            {byTest.length === 0 ? (
              <EmptyState
                icon={<BarChart3 className="h-4 w-4" />}
                title="No attempts for this subject"
                description="Try another subject filter."
              />
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                {byTest.map((row) => (
                  <li
                    key={row.test!.id}
                    className={`${toneOfSubject(row.test!.subject)} flex items-center gap-3 bg-surface px-4 py-3`}
                  >
                    <span className="tone-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xs font-bold">
                      {row.test!.subject[0]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{row.test!.title}</span>
                      <span className="block truncate text-[13px] text-subtle">
                        {row.test!.topic} · {row.test!.chapter}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-semibold tabular-nums">
                        {row.accuracy}%
                      </span>
                      <span className="block text-2xs text-subtle">
                        {row.attempts} attempt{row.attempts === 1 ? '' : 's'}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
