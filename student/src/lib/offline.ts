// -----------------------------------------------------------------------------
// Offline reading cache: the text of recently opened lessons is kept in
// localStorage so a student can re-read them with no connection.
// -----------------------------------------------------------------------------
import type { Lesson } from '../types';

const KEY = 'eduhub.offlineLessons';
const LIMIT = 30;

type Cache = Record<string, Lesson>;

function read(): Cache {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
}

export function cacheLesson(lesson: Lesson): void {
  try {
    const cache = read();
    cache[lesson.id] = lesson;
    const entries = Object.entries(cache);
    // Keep the cache bounded - drop the oldest entries first.
    const trimmed = entries.slice(Math.max(0, entries.length - LIMIT));
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(trimmed)));
  } catch {
    // Private mode or a full quota: offline reading is a bonus, never a blocker.
  }
}

export function cachedLessons(): Lesson[] {
  return Object.values(read());
}

export function cachedLesson(lessonId: string): Lesson | undefined {
  return read()[lessonId];
}
