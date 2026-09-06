import { useEffect, useState } from 'react';
import { Modal } from './ui';
import { THEME } from '../lib/theme';
import { CATEGORIES, COLOR_THEMES, EMOJI_CHOICES, type ColorTheme, type Course, type CourseDraft } from '../types';

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
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={busy}>
            {course ? 'Save changes' : 'Create course'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
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
            className="input min-h-[92px] resize-y font-normal"
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
          <span className="label">Emoji</span>
          <div className="grid grid-cols-6 gap-2">
            {EMOJI_CHOICES.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-label={`Use ${emoji}`}
                aria-pressed={draft.emoji === emoji}
                onClick={() => setDraft({ ...draft, emoji })}
                className={`flex h-12 items-center justify-center rounded-2xl border-2 text-2xl transition-colors ${
                  draft.emoji === emoji ? 'border-grass bg-grass/10' : 'border-swan hover:bg-gray-50'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">Colour theme</span>
          <div className="flex flex-wrap gap-3">
            {COLOR_THEMES.map((theme: ColorTheme) => (
              <button
                key={theme}
                type="button"
                aria-label={`Use ${theme} theme`}
                aria-pressed={draft.colorTheme === theme}
                onClick={() => setDraft({ ...draft, colorTheme: theme })}
                className={`h-11 w-11 rounded-2xl ${THEME[theme].bg} transition-transform ${
                  draft.colorTheme === theme
                    ? 'ring-4 ring-ink/15 scale-105'
                    : 'opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-2xl bg-cardinal/10 px-4 py-3 text-sm font-bold text-cardinal">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
