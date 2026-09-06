// -----------------------------------------------------------------------------
// Firestore data model. This schema is the contract between the teacher console
// and the student app - change a field here and you must change it there too.
// -----------------------------------------------------------------------------

export type Role = 'admin' | 'teacher' | 'student';

export type ColorTheme = 'green' | 'blue' | 'orange' | 'purple' | 'pink';

export const COLOR_THEMES: ColorTheme[] = ['green', 'blue', 'orange', 'purple', 'pink'];

export const CATEGORIES = ['Math', 'Science', 'Language', 'History', 'Other'] as const;
export type Category = (typeof CATEGORIES)[number];

export const EMOJI_CHOICES = [
  '📚', '🧮', '🔬', '🌍', '🎨', '🎵',
  '💻', '⚽', '🧪', '📐', '🗺️', '✍️',
];

/** Collection "users" */
export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: number;
}

/** Collection "courses" */
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
  colorTheme: ColorTheme;
  teacherId: string;
  teacherName: string;
  published: boolean;
  lessonCount: number;
  createdAt: number;
  updatedAt: number;
}

/** Collection "lessons" */
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  imageUrl: string;
  videoUrl: string;
  durationMin: number;
  order: number;
  createdAt: number;
}

export type CourseDraft = Pick<
  Course,
  'title' | 'description' | 'category' | 'emoji' | 'colorTheme'
>;

export type LessonDraft = Pick<
  Lesson,
  'title' | 'content' | 'imageUrl' | 'videoUrl' | 'durationMin'
>;
