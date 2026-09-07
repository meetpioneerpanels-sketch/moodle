import { useEffect, useState } from 'react';
import { Modal } from './ui';
import { toYouTubeEmbed } from '../lib/format';
import type { Lesson, LessonDraft } from '../types';

const EMPTY: LessonDraft = {
  title: '',
  content: '',
  imageUrl: '',
  videoUrl: '',
  durationMin: 10,
};

interface Props {
  open: boolean;
  lesson?: Lesson | null;
  courseTitle: string;
  onClose: () => void;
  onSave: (draft: LessonDraft) => Promise<void> | void;
}

export default function LessonEditor({ open, lesson, courseTitle, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<LessonDraft>(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setDraft(
      lesson
        ? {
            title: lesson.title,
            content: lesson.content,
            imageUrl: lesson.imageUrl,
            videoUrl: lesson.videoUrl,
            durationMin: lesson.durationMin,
          }
        : EMPTY,
    );
  }, [open, lesson]);

  const embedUrl = toYouTubeEmbed(draft.videoUrl);

  async function handleSave() {
    if (draft.title.trim().length < 3) {
      setError('Give the lesson a title of at least 3 characters.');
      return;
    }
    if (draft.content.trim().length < 10) {
      setError('Lesson content looks empty - write at least a paragraph.');
      return;
    }
    if (draft.videoUrl.trim() && !embedUrl) {
      setError('That does not look like a YouTube link. Paste a watch, share or embed URL.');
      return;
    }
    setBusy(true);
    try {
      await onSave({
        ...draft,
        title: draft.title.trim(),
        content: draft.content.trim(),
        imageUrl: draft.imageUrl.trim(),
        // Stored ready to embed, so the student app can drop it straight into an iframe.
        videoUrl: embedUrl ?? '',
        durationMin: Number.isFinite(draft.durationMin) ? Math.max(1, draft.durationMin) : 1,
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
      title={lesson ? 'Edit lesson' : 'Add lesson'}
      subtitle={courseTitle}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={handleSave} disabled={busy}>
            Save lesson
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="lesson-title">
            Title
          </label>
          <input
            id="lesson-title"
            className="input"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="Balancing equations"
          />
        </div>

        <div>
          <label className="label" htmlFor="lesson-content">
            Content
          </label>
          <textarea
            id="lesson-content"
            className="input min-h-[200px] resize-y leading-relaxed"
            value={draft.content}
            onChange={(event) => setDraft({ ...draft, content: event.target.value })}
            placeholder={'Write the lesson here.\n\nLeave a blank line between paragraphs.'}
          />
          <p className="hint">
            {draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0} words · blank lines
            become paragraphs in the student app
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="lesson-duration">
              Duration (minutes)
            </label>
            <input
              id="lesson-duration"
              type="number"
              min={1}
              max={240}
              className="input"
              value={draft.durationMin}
              onChange={(event) =>
                setDraft({ ...draft, durationMin: Number(event.target.value) || 0 })
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="lesson-image">
              Image URL
            </label>
            <input
              id="lesson-image"
              className="input"
              value={draft.imageUrl}
              onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })}
              placeholder="https://"
            />
          </div>
        </div>

        {draft.imageUrl.trim() && (
          <img
            src={draft.imageUrl}
            alt="Lesson illustration preview"
            className="max-h-44 w-full rounded-lg border border-line object-cover"
            onError={(event) => {
              (event.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        <div>
          <label className="label" htmlFor="lesson-video">
            YouTube URL
          </label>
          <input
            id="lesson-video"
            className="input"
            value={draft.videoUrl}
            onChange={(event) => setDraft({ ...draft, videoUrl: event.target.value })}
            placeholder="https://www.youtube.com/watch?v="
          />
          {draft.videoUrl.trim() && !embedUrl ? (
            <p className="error-text">Not a recognised YouTube link.</p>
          ) : (
            <p className="hint">Watch, share and shorts links are converted to embeds on save.</p>
          )}
        </div>

        {embedUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-line">
            <iframe
              src={embedUrl}
              title="Lesson video preview"
              className="h-full w-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>
    </Modal>
  );
}
