import { useEffect, useState } from 'react';
import { Modal } from './ui';
import { TONE_SWATCH } from '../lib/theme';
import {
  CATEGORIES,
  COLOR_THEMES,
  EMOJI_CHOICES,
  type ColorTheme,
  type Course,
  type CourseDraft,
} from '../types';

const EMPTY: CourseDraft = {
  title: '',
  description: '',
  category: 'Math',
  emoji: '📚',
  colorTheme: 'green',
};

interface Props {
  open: boolean;
  course?: Course | null;
  onClose: () => void;
  onSave: (draft: CourseDraft) => Promise<void> | void;
}

export default function CourseModal({ open, course, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<CourseDraft>(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setDraft(
      course
        ? {
            title: course.title,
            description: course.description,
            category: course.category,
            emoji: course.emoji,
            colorTheme: course.colorTheme,
          }
        : EMPTY,
    );
  }, [open, course]);

  async function handleSave() {
    if (draft.title.trim().length < 3) {
      setError('Give the course a title of at least 3 characters.');
      return;
    }
    setBusy(true);
    try {
      await onSave({ ...draft, title: draft.title.trim(), description: draft.description.trim() });
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
      title={course ? 'Edit course' : 'New course'}
      subtitle={course ? course.title : 'Students see it once you publish.'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={handleSave} disabled={busy}>
            {course ? 'Save changes' : 'Create course'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="course-title">
            Title
          </label>
          <input
            id="course-title"
            className="input"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="Algebra Foundations"
          />
        </div>

        <div>
          <label className="label" htmlFor="course-description">
            Description
          </label>
          <textarea
            id="course-description"
            className="input min-h-[80px] resize-y leading-relaxed"
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            placeholder="What will students be able to do at the end?"
          />
        </div>

        <div>
          <label className="label" htmlFor="course-category">
            Category
          </label>
          <select
            id="course-category"
            className="input"
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value })}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="label">Icon</span>
          <div className="grid grid-cols-6 gap-1.5">
            {EMOJI_CHOICES.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-label={`Use ${emoji}`}
                aria-pressed={draft.emoji === emoji}
                onClick={() => setDraft({ ...draft, emoji })}
                className={`flex h-10 items-center justify-center rounded-lg border text-lg transition-colors ${
                  draft.emoji === emoji
                    ? 'border-brand bg-brand-soft'
                    : 'border-line hover:bg-surface-3'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">Accent</span>
          <div className="flex flex-wrap gap-2">
            {COLOR_THEMES.map((theme: ColorTheme) => (
              <button
                key={theme}
                type="button"
                aria-label={`Use the ${theme} accent`}
                aria-pressed={draft.colorTheme === theme}
                onClick={() => setDraft({ ...draft, colorTheme: theme })}
                style={{ backgroundColor: TONE_SWATCH[theme] }}
                className={`h-7 w-7 rounded-full transition-transform ${
                  draft.colorTheme === theme
                    ? 'ring-2 ring-fg/25 ring-offset-2 ring-offset-surface'
                    : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}
      </div>
    </Modal>
  );
}
