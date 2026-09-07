import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, MessageCircleQuestion, Send } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { Avatar, EmptyState, SkeletonList } from '../components/ui';
import { timeAgo } from '../lib/format';
import { toneOfSubject } from '../lib/theme';
import { CATEGORIES, type Doubt, type Subject } from '../types';

const FILTERS = ['Open', 'Answered', 'All'] as const;

/**
 * The teaching side of Ask-your-Doubt. Students write here from the app; this
 * is where a teacher reads the queue and replies.
 */
export default function Doubts() {
  const { doubts, loading, answerDoubt } = useData();
  const { toast } = useToast();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Open');
  const [subject, setSubject] = useState<Subject | 'All'>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const visible = useMemo(
    () =>
      doubts
        .filter((doubt) => {
          const matchesFilter =
            filter === 'All' ||
            (filter === 'Open' ? doubt.status === 'open' : doubt.status === 'answered');
          return matchesFilter && (subject === 'All' || doubt.subject === subject);
        })
        .sort((a, b) => b.createdAt - a.createdAt),
    [doubts, filter, subject],
  );

  const openCount = doubts.filter((doubt) => doubt.status === 'open').length;

  async function submit(doubt: Doubt) {
    if (draft.trim().length < 10) {
      toast('Write a full answer before sending', 'error');
      return;
    }
    setBusy(true);
    try {
      await answerDoubt(doubt.id, draft.trim());
      setDraft('');
      setOpenId(null);
      toast('Answer sent to the student');
    } catch (error) {
      toast((error as Error).message || 'Could not send the answer', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Doubts</h1>
          <p className="mt-1 text-[13px] text-muted">
            {openCount === 0
              ? 'Every question has been answered.'
              : `${openCount} question${openCount === 1 ? '' : 's'} waiting for a reply.`}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <div className="relief-inset flex rounded-lg bg-surface-2 p-0.5">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
              className={`rounded-[7px] px-3 py-1.5 text-[13px] font-medium transition-all ${
                filter === item ? 'relief-sm bg-surface text-fg' : 'text-muted hover:text-fg'
              }`}
            >
              {item}
              {item === 'Open' && openCount > 0 && (
                <span className="ml-1.5 rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                  {openCount}
                </span>
              )}
            </button>
          ))}
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
      </div>

      {loading ? (
        <SkeletonList rows={4} height="h-24" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<MessageCircleQuestion className="h-4 w-4" />}
          title={filter === 'Open' ? 'Nothing waiting' : 'No doubts here'}
          description={
            filter === 'Open'
              ? 'New questions from students land here as they are asked.'
              : 'Try another filter.'
          }
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((doubt) => {
            const expanded = openId === doubt.id;
            return (
              <li key={doubt.id} className={`${toneOfSubject(doubt.subject)} card p-4`}>
                <div className="flex items-start gap-3">
                  <Avatar name={doubt.userName} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{doubt.userName}</span>
                      <span className="chip tone-soft">{doubt.subject}</span>
                      <span className="text-[13px] text-subtle">{timeAgo(doubt.createdAt)}</span>
                      <span
                        className={`chip ml-auto ${
                          doubt.status === 'answered'
                            ? 'bg-success-soft text-success'
                            : 'bg-warning-soft text-warning'
                        }`}
                      >
                        {doubt.status === 'answered' ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Answered
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> Waiting
                          </>
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-[13px] leading-relaxed">{doubt.question}</p>

                    {doubt.imageUrl && (
                      <img
                        src={doubt.imageUrl}
                        alt="Student's working"
                        className="mt-3 max-h-52 rounded-lg border border-line object-cover"
                        onError={(event) => {
                          (event.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}

                    {doubt.answer && (
                      <div className="relief-inset mt-3 rounded-lg bg-surface-2 p-3">
                        <p className="text-2xs font-semibold text-muted">Your answer</p>
                        <p className="mt-1 text-[13px] leading-relaxed text-muted">
                          {doubt.answer}
                        </p>
                      </div>
                    )}

                    {doubt.status === 'open' &&
                      (expanded ? (
                        <div className="mt-3">
                          <label className="label" htmlFor={`answer-${doubt.id}`}>
                            Your answer
                          </label>
                          <textarea
                            id={`answer-${doubt.id}`}
                            className="input min-h-[96px] resize-y leading-relaxed"
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            placeholder="Explain the step they are stuck on, not just the answer."
                            autoFocus
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              className="btn-primary btn-sm"
                              disabled={busy}
                              onClick={() => submit(doubt)}
                            >
                              <Send className="h-3.5 w-3.5" /> Send answer
                            </button>
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => {
                                setOpenId(null);
                                setDraft('');
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-secondary btn-sm mt-3"
                          onClick={() => {
                            setOpenId(doubt.id);
                            setDraft('');
                          }}
                        >
                          <Send className="h-3.5 w-3.5" /> Answer
                        </button>
                      ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
