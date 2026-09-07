import { useEffect, useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Modal } from './ui';
import { toYouTubeEmbed } from '../lib/format';
import { DIFFICULTIES, type Difficulty, type Question, type QuestionDraft } from '../types';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const EMPTY: QuestionDraft = {
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  difficulty: 'Easy',
  videoUrl: '',
};

interface Props {
  open: boolean;
  question?: Question | null;
  testTitle: string;
  onClose: () => void;
  onSave: (draft: QuestionDraft) => Promise<void> | void;
}

export default function QuestionEditor({ open, question, testTitle, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<QuestionDraft>(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setDraft(
      question
        ? {
            text: question.text,
            options: [...question.options],
            correctIndex: question.correctIndex,
            explanation: question.explanation,
            difficulty: question.difficulty,
            videoUrl: question.videoUrl,
          }
        : { ...EMPTY, options: ['', '', '', ''] },
    );
  }, [open, question]);

  const embedUrl = toYouTubeEmbed(draft.videoUrl);

  function setOption(index: number, value: string) {
    setDraft({
      ...draft,
      options: draft.options.map((option, optionIndex) => (optionIndex === index ? value : option)),
    });
  }

  function addOption() {
    if (draft.options.length >= 6) return;
    setDraft({ ...draft, options: [...draft.options, ''] });
  }

  function removeOption(index: number) {
    if (draft.options.length <= 2) return;
    const options = draft.options.filter((_, optionIndex) => optionIndex !== index);
    setDraft({
      ...draft,
      options,
      correctIndex:
        draft.correctIndex === index
          ? 0
          : draft.correctIndex > index
            ? draft.correctIndex - 1
            : draft.correctIndex,
    });
  }

  async function handleSave() {
    const options = draft.options.map((option) => option.trim());
    if (draft.text.trim().length < 10) {
      setError('Write the question - at least 10 characters.');
      return;
    }
    if (options.some((option) => option.length === 0)) {
      setError('Every option needs text, or remove the empty ones.');
      return;
    }
    if (new Set(options).size !== options.length) {
      setError('Two options are identical.');
      return;
    }
    if (draft.explanation.trim().length < 10) {
      setError('Add a solution so students learn from a wrong answer.');
      return;
    }
    if (draft.videoUrl.trim() && !embedUrl) {
      setError('That does not look like a YouTube link.');
      return;
    }
    setBusy(true);
    try {
      await onSave({
        ...draft,
        text: draft.text.trim(),
        options,
        explanation: draft.explanation.trim(),
        // Stored ready to embed, so the student app can use it directly.
        videoUrl: embedUrl ?? '',
      });
      onClose();
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      wide
      title={question ? 'Edit question' : 'Add question'}
      subtitle={testTitle}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={handleSave} disabled={busy}>
            Save question
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="question-text">
            Question
          </label>
          <textarea
            id="question-text"
            className="input min-h-[90px] resize-y leading-relaxed"
            value={draft.text}
            onChange={(event) => setDraft({ ...draft, text: event.target.value })}
            placeholder="Find the number of terms of the sequence 32, 24, 16, 8, ..."
          />
        </div>

        <div>
          <span className="label">Options — tap the circle to mark the correct one</span>
          <ul className="space-y-2">
            {draft.options.map((option, index) => (
              <li key={index} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, correctIndex: index })}
                  aria-label={`Mark option ${OPTION_LABELS[index]} correct`}
                  aria-pressed={draft.correctIndex === index}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-2xs font-bold transition-colors ${
                    draft.correctIndex === index
                      ? 'bg-success text-white'
                      : 'bg-surface-3 text-muted hover:bg-line'
                  }`}
                >
                  {draft.correctIndex === index ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    OPTION_LABELS[index]
                  )}
                </button>
                <input
                  className="input"
                  value={option}
                  onChange={(event) => setOption(index, event.target.value)}
                  placeholder={`Option ${OPTION_LABELS[index]}`}
                  aria-label={`Option ${OPTION_LABELS[index]}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={draft.options.length <= 2}
                  aria-label={`Remove option ${OPTION_LABELS[index]}`}
                  className="shrink-0 rounded-md p-2 text-subtle transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          {draft.options.length < 6 && (
            <button type="button" className="btn-secondary btn-sm mt-2" onClick={addOption}>
              <Plus className="h-3.5 w-3.5" /> Add option
            </button>
          )}
        </div>

        <div>
          <label className="label" htmlFor="question-explanation">
            Solution
          </label>
          <textarea
            id="question-explanation"
            className="input min-h-[90px] resize-y leading-relaxed"
            value={draft.explanation}
            onChange={(event) => setDraft({ ...draft, explanation: event.target.value })}
            placeholder="Explain the working, not just the answer."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="question-difficulty">
              Difficulty
            </label>
            <select
              id="question-difficulty"
              className="input"
              value={draft.difficulty}
              onChange={(event) =>
                setDraft({ ...draft, difficulty: event.target.value as Difficulty })
              }
            >
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="question-video">
              Video solution (optional)
            </label>
            <input
              id="question-video"
              className="input"
              value={draft.videoUrl}
              onChange={(event) => setDraft({ ...draft, videoUrl: event.target.value })}
              placeholder="https://www.youtube.com/watch?v="
            />
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}
      </div>
    </Modal>
  );
}
