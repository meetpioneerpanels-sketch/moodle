import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, Clock, MonitorPlay, X } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import AmbientBackground from '../components/AmbientBackground';
import { EmptyState } from '../components/ui';
import { burstConfetti } from '../lib/confetti';
import type { AttemptAnswer, Test, TestAttempt } from '../types';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface Props {
  test: Test;
  onExit: () => void;
  onFinished: (attempt: TestAttempt) => void;
}

/**
 * One question at a time, with a per-question countdown. Answering reveals the
 * correct option and its worked solution; running out of time counts the
 * question as skipped and moves on.
 */
export default function TestPlayer({ test, onExit, onFinished }: Props) {
  const { questionsOf, submitAttempt } = useData();
  const { toast } = useToast();

  const questions = useMemo(() => questionsOf(test.id), [questionsOf, test.id]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(test.secondsPerQuestion);
  const [confirmExit, setConfirmExit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const answers = useRef<AttemptAnswer[]>([]);
  const startedAt = useRef(Date.now());
  const questionStartedAt = useRef(Date.now());

  const question = questions[index];
  const total = questions.length;

  const finish = useCallback(
    async (collected: AttemptAnswer[]) => {
      setSubmitting(true);
      try {
        const attempt = await submitAttempt(test, collected, startedAt.current);
        if (attempt.correct > attempt.incorrect) burstConfetti();
        onFinished(attempt);
      } catch (error) {
        toast((error as Error).message || 'Could not submit your test', 'error');
        setSubmitting(false);
      }
    },
    [onFinished, submitAttempt, test, toast],
  );

  const commit = useCallback(
    (selectedIndex: number | null) => {
      if (!question) return;
      answers.current = [
        ...answers.current,
        {
          questionId: question.id,
          selectedIndex,
          correct: selectedIndex === question.correctIndex,
          secondsTaken: Math.max(
            1,
            Math.round((Date.now() - questionStartedAt.current) / 1000),
          ),
          difficulty: question.difficulty,
          bookmarked,
        },
      ];

      if (index + 1 >= total) {
        void finish(answers.current);
        return;
      }
      setIndex((current) => current + 1);
      setSelected(null);
      setRevealed(false);
      setBookmarked(false);
      setSecondsLeft(test.secondsPerQuestion);
      questionStartedAt.current = Date.now();
    },
    [bookmarked, finish, index, question, test.secondsPerQuestion, total],
  );

  // Countdown. Answering freezes the clock so the student can read the solution.
  useEffect(() => {
    if (revealed || submitting || !question) return;
    if (secondsLeft <= 0) {
      commit(null);
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, revealed, submitting, question, commit]);

  if (total === 0) {
    return (
      <div className="min-h-[100dvh] px-4 pt-6">
        <EmptyState
          icon={<Clock className="h-5 w-5" />}
          title="No questions yet"
          description="Your teacher has not added questions to this test."
          action={
            <button type="button" className="btn-secondary btn-sm" onClick={onExit}>
              Back to Practice Zone
            </button>
          }
        />
      </div>
    );
  }

  if (!question) return null;

  const progressPercent = ((index + (revealed ? 1 : 0)) / total) * 100;
  const timePercent = (secondsLeft / test.secondsPerQuestion) * 100;

  function choose(optionIndex: number) {
    if (revealed) return;
    setSelected(optionIndex);
    setRevealed(true);
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <AmbientBackground />
      <div className="px-4 pb-3 pt-safe">
        <div className="card p-4">
          {/* Timer */}
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-2xs text-subtle">Time</p>
              <p className="flex items-center gap-1.5 text-base font-semibold tabular-nums">
                <Clock className="h-4 w-4 text-muted" />
                {secondsLeft} sec
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmExit(true)}
              aria-label="Exit test"
              className="icon-btn relief-press bg-surface text-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${revealed ? 100 : timePercent}%`,
                backgroundColor: secondsLeft <= 5 && !revealed ? 'var(--danger)' : 'var(--sky)',
              }}
            />
          </div>

          {/* Progress */}
          <div className="mt-4 flex items-center justify-between text-2xs text-subtle">
            <span>Progress</span>
            <span className="tabular-nums">
              {index + 1}/{total}
            </span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%`, backgroundImage: 'var(--grad-brand)' }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pb-8">
        <div className="card p-4">
          {/* Question */}
          <div className="flex gap-3">
            <span className="fill-amber flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-2xs font-bold">
              {index + 1}
            </span>
            <p className="flex-1 text-sm leading-relaxed">{question.text}</p>
            <button
              type="button"
              onClick={() => setBookmarked((value) => !value)}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this question'}
              aria-pressed={bookmarked}
              className={`icon-btn h-8 w-8 ${bookmarked ? 'text-amber' : 'text-subtle'}`}
            >
              <Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Options */}
          <ul className="mt-4 space-y-2.5">
            {question.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === question.correctIndex;
              const isChosen = optionIndex === selected;
              const state = !revealed
                ? 'idle'
                : isCorrect
                  ? 'correct'
                  : isChosen
                    ? 'wrong'
                    : 'idle';

              return (
                <li key={optionIndex}>
                  <button
                    type="button"
                    onClick={() => choose(optionIndex)}
                    disabled={revealed}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                      state === 'correct'
                        ? 'border-success bg-success-soft'
                        : state === 'wrong'
                          ? 'border-danger bg-danger-soft'
                          : 'border-line bg-surface active:bg-surface-2'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-2xs font-bold ${
                        state === 'correct'
                          ? 'bg-success text-white'
                          : state === 'wrong'
                            ? 'bg-danger text-white'
                            : 'bg-surface-3 text-muted'
                      }`}
                    >
                      {OPTION_LABELS[optionIndex]}
                    </span>
                    <span className="min-w-0 flex-1 text-sm">{option}</span>
                    {state === 'correct' && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-white">
                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                    {state === 'wrong' && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white">
                        <X className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Solution */}
          {revealed && (
            <div className="relief-inset mt-4 animate-slide-up rounded-xl bg-surface-2 p-3.5">
              <p className="text-2xs font-semibold text-muted">Solution</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{question.explanation}</p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <span className="text-2xs text-subtle">Difficulty Level</span>
            <span
              className={`chip ${
                question.difficulty === 'Easy'
                  ? 'bg-success-soft text-success'
                  : question.difficulty === 'Medium'
                    ? 'bg-amber-soft text-amber'
                    : 'bg-danger-soft text-danger'
              }`}
            >
              {question.difficulty}
            </span>
          </div>

          {revealed && question.videoUrl && (
            <a
              href={question.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-outline mt-4 w-full"
            >
              <MonitorPlay className="h-4 w-4" /> View video solution
            </a>
          )}
        </div>

        {revealed && (
          <button
            type="button"
            className="btn-primary mt-4 w-full"
            disabled={submitting}
            onClick={() => commit(selected)}
          >
            {index + 1 >= total ? 'Finish test' : 'Next question'}
          </button>
        )}
      </div>

      {confirmExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setConfirmExit(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Leave this test?"
            className="relative z-10 w-full max-w-xs rounded-2xl bg-surface p-5 shadow-lg animate-scale-in"
          >
            <h2 className="text-sm font-semibold">Leave this test?</h2>
            <p className="mt-1.5 text-[13px] text-muted">
              Your progress on this attempt will not be saved.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="btn-secondary btn-sm flex-1"
                onClick={() => setConfirmExit(false)}
              >
                Keep going
              </button>
              <button type="button" className="btn-danger btn-sm flex-1" onClick={onExit}>
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
