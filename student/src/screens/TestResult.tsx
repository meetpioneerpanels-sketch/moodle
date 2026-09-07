import { useMemo, useState } from 'react';
import { Bookmark, Check, X } from 'lucide-react';
import { useData } from '../hooks/useData';
import { BarChart, Donut } from '../components/charts';
import { ScreenHeader } from '../components/ui';
import { CHART } from '../lib/theme';
import type { Difficulty, TestAttempt } from '../types';

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function TestResult({
  attempt,
  onDone,
}: {
  attempt: TestAttempt;
  onDone: () => void;
}) {
  const { questionsOf } = useData();
  const [showSolutions, setShowSolutions] = useState(false);

  const questions = useMemo(() => questionsOf(attempt.testId), [questionsOf, attempt.testId]);
  const total = attempt.answers.length;
  const accuracy = total > 0 ? Math.round((attempt.correct / total) * 100) : 0;
  /** How much of the allowed time the attempt used, for the third ring. */
  const timeBudget = Math.max(1, attempt.answers.length * 15);
  const timeUsed = Math.min(100, (attempt.secondsTaken / timeBudget) * 100);

  // Correct / incorrect / skipped counts, grouped by question difficulty.
  const byDifficulty = useMemo(
    () =>
      DIFFICULTIES.map((difficulty) => {
        const slice = attempt.answers.filter((answer) => answer.difficulty === difficulty);
        return {
          correct: slice.filter((answer) => answer.correct).length,
          incorrect: slice.filter((answer) => answer.selectedIndex !== null && !answer.correct)
            .length,
          skipped: slice.filter((answer) => answer.selectedIndex === null).length,
        };
      }),
    [attempt.answers],
  );

  return (
    <div className="min-h-[100dvh] pb-28">
      <ScreenHeader title="Score and Stats" onBack={onDone} />

      <div className="space-y-4 px-4">
        {/* Headline numbers */}
        <section className="card p-4">
          <div className="flex justify-around">
            <Donut
              percent={total ? (attempt.correct / total) * 100 : 0}
              label={String(attempt.correct).padStart(2, '0')}
              caption="Correct"
              color={CHART.correct}
            />
            <Donut
              percent={total ? (attempt.incorrect / total) * 100 : 0}
              label={String(attempt.incorrect).padStart(2, '0')}
              caption="Incorrect"
              color={CHART.incorrect}
            />
            <Donut
              percent={timeUsed}
              label={String(attempt.secondsTaken)}
              caption="Seconds"
              color={CHART.skipped}
            />
          </div>

          <div className="mt-4 flex justify-center gap-6 text-2xs text-subtle">
            <span>
              Unanswered{' '}
              <span className="font-semibold text-fg">
                {String(attempt.unanswered).padStart(2, '0')}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Bookmark className="h-3 w-3" /> Bookmarks{' '}
              <span className="font-semibold text-fg">
                {String(attempt.bookmarks).padStart(2, '0')}
              </span>
            </span>
          </div>

          <button
            type="button"
            className="btn-outline btn-sm mt-4 w-full"
            onClick={() => setShowSolutions((value) => !value)}
          >
            {showSolutions ? 'Hide solutions' : 'View solutions'}
          </button>
        </section>

        {/* Accuracy */}
        <section className="card p-4">
          <h2 className="text-sm font-semibold">Accuracy</h2>
          <div className="mt-3 flex items-center gap-5">
            <Donut percent={accuracy} color={CHART.skipped} size={84} stroke={8} />
            <dl className="flex-1 space-y-2 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: CHART.neutral }} />
                  Total Questions
                </dt>
                <dd className="font-semibold tabular-nums">{total}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: CHART.skipped }} />
                  Questions Attempted
                </dt>
                <dd className="font-semibold tabular-nums">{total - attempt.unanswered}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: CHART.correct }} />
                  Questions Correct
                </dt>
                <dd className="font-semibold tabular-nums">{attempt.correct}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Difficulty analysis */}
        <section className="card p-4">
          <h2 className="text-sm font-semibold">Performance Analysis by Question Difficulty</h2>
          <div className="mt-4">
            <BarChart
              categories={DIFFICULTIES}
              series={[
                { label: 'Correct', color: CHART.correct, values: byDifficulty.map((item) => item.correct) },
                { label: 'Incorrect', color: CHART.incorrect, values: byDifficulty.map((item) => item.incorrect) },
                { label: 'Skipped', color: CHART.skipped, values: byDifficulty.map((item) => item.skipped) },
              ]}
            />
          </div>
        </section>

        {/* Time per question */}
        <section className="card p-4">
          <h2 className="text-sm font-semibold">Time Taken for Each Question</h2>
          <div className="mt-4">
            <BarChart
              categories={attempt.answers.map((_, index) => String(index + 1))}
              series={[
                {
                  label: 'Seconds',
                  color: CHART.correct,
                  values: attempt.answers.map((answer) => answer.secondsTaken),
                },
              ]}
              axisLabel="Questions"
              valueSuffix="s"
            />
          </div>
        </section>

        {/* Solutions */}
        {showSolutions && (
          <section className="space-y-3">
            <h2 className="px-1 text-sm font-semibold">Solutions</h2>
            {attempt.answers.map((answer, index) => {
              const question = questions.find((item) => item.id === answer.questionId);
              if (!question) return null;
              return (
                <article key={answer.questionId} className="card p-4">
                  <div className="flex gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-2xs font-bold text-white ${
                        answer.correct ? 'bg-success' : answer.selectedIndex === null ? 'bg-subtle' : 'bg-danger'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <p className="flex-1 text-[13px] leading-relaxed">{question.text}</p>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {question.options.map((option, optionIndex) => {
                      const isCorrect = optionIndex === question.correctIndex;
                      const isChosen = optionIndex === answer.selectedIndex;
                      if (!isCorrect && !isChosen) return null;
                      return (
                        <li
                          key={optionIndex}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${
                            isCorrect ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                          }`}
                        >
                          <span className="font-bold">{OPTION_LABELS[optionIndex]}</span>
                          <span className="min-w-0 flex-1 text-fg">{option}</span>
                          {isCorrect ? (
                            <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
                          ) : (
                            <X className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
                    {question.explanation}
                  </p>
                </article>
              );
            })}
          </section>
        )}
      </div>

      <div className="glass fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t px-4 pb-safe pt-3">
        <button type="button" className="btn-primary w-full" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}
