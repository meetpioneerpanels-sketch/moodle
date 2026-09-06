// -----------------------------------------------------------------------------
// Firestore data model. Identical to the teacher console's schema - it is the
// contract between the two apps. Change a field here and change it there too.
// -----------------------------------------------------------------------------

export type Role = 'admin' | 'teacher' | 'student';

export type ColorTheme = 'green' | 'blue' | 'orange' | 'purple' | 'pink';

export const CATEGORIES = ['Math', 'Science', 'Language', 'History', 'Other'] as const;

/** Collection "users" */
export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: number;
}

/** Collection "courses" - written by the teacher console, read-only here. */
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

/** Collection "lessons" - written by the teacher console, read-only here. */
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

/** Collection "lessonProgress" - written by this app. */
export interface LessonProgress {
  id: string;
  courseId: string;
  lessonId: string;
  userId: string;
  completed: boolean;
  completedAt: number;
}
