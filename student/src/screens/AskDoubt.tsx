import { useState } from 'react';
import { CheckCircle2, MessageCircleQuestion, Send } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { EmptyState, ScreenHeader, Tabs } from '../components/ui';
import { timeAgo } from '../lib/format';
import { toneOfSubject } from '../lib/theme';
import { CATEGORIES, type Subject } from '../types';

export default function AskDoubt({ onBack }: { onBack: () => void }) {
  const { doubts, askDoubt } = useData();
  const { toast } = useToast();
  const [subject, setSubject] = useState<Subject>('Maths');
  const [question, setQuestion] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (question.trim().length < 10) {
      toast('Describe your doubt in a sentence or two', 'error');
      return;
    }
    setBusy(true);
    try {
      await askDoubt(subject, question.trim(), imageUrl.trim());
      setQuestion('');
      setImageUrl('');
      toast('Sent - a teacher will reply shortly');
    } catch (error) {
      toast((error as Error).message || 'Could not send your doubt', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-canvas pb-8">
      <ScreenHeader title="Ask your Doubt" onBack={onBack} />

      <div className="space-y-4 px-4">
        <section className="card p-4">
          <span className="label">Subject</span>
          <Tabs tabs={CATEGORIES} active={subject} onChange={setSubject} size="sm" />

          <div className="mt-4">
            <label className="label" htmlFor="doubt">
              Your question
            </label>
            <textarea
              id="doubt"
              className="input min-h-[120px] resize-y leading-relaxed"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Where exactly did you get stuck? Include the question number if it is from a test."
            />
          </div>

          <div className="mt-3">
            <label className="label" htmlFor="doubt-image">
              Image URL (optional)
            </label>
            <input
              id="doubt-image"
              className="input"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://"
            />
            <p className="hint">A photo of your working helps a teacher answer faster.</p>
          </div>

          <button type="button" className="btn-primary mt-4 w-full" disabled={busy} onClick={submit}>
            <Send className="h-4 w-4" /> Send to a teacher
          </button>
        </section>

        <section>
          <h2 className="mb-2.5 px-1 text-sm font-semibold">Your doubts</h2>
          {doubts.length === 0 ? (
            <EmptyState
              icon={<MessageCircleQuestion className="h-5 w-5" />}
              title="Nothing asked yet"
              description="Your questions and the answers appear here."
            />
          ) : (
            <ul className="space-y-2.5">
              {[...doubts]
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((doubt) => (
                  <li key={doubt.id} className={`${toneOfSubject(doubt.subject)} card p-4`}>
                    <div className="flex items-center gap-2">
                      <span className="chip tone-soft">{doubt.subject}</span>
                      <span className="text-2xs text-subtle">{timeAgo(doubt.createdAt)}</span>
                      <span
                        className={`chip ml-auto ${
                          doubt.status === 'answered'
                            ? 'bg-success-soft text-success'
                            : 'bg-amber-soft text-amber'
                        }`}
                      >
                        {doubt.status === 'answered' ? 'Answered' : 'Waiting'}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed">{doubt.question}</p>
                    {doubt.answer && (
                      <p className="mt-2.5 flex gap-2 rounded-xl bg-surface-2 p-3 text-[13px] leading-relaxed text-muted">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                        {doubt.answer}
                      </p>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
