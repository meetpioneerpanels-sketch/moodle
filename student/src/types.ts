// -----------------------------------------------------------------------------
// Firestore data model, shared with the teacher console. The first block is the
// original LMS content; the second is the test-prep layer (exams, universities,
// packages, question banks, attempts and doubts).
// -----------------------------------------------------------------------------

export type Role = 'admin' | 'teacher' | 'student';

export type ColorTheme = 'red' | 'blue' | 'amber' | 'green' | 'violet';

export const CATEGORIES = ['Maths', 'Physics', 'Chemistry', 'English'] as const;
export type Subject = (typeof CATEGORIES)[number];

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/** Collection "users" */
export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: number;
  /** Onboarding: the exam the student is preparing for, e.g. "ECAT". */
  examId?: string;
  /** Universities the student is targeting. */
  universityIds?: string[];
  /** The package they selected during onboarding. */
  packageId?: string;
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

// --- test-prep layer ---------------------------------------------------------

/** Collection "exams" - the entry test a student prepares for. */
export interface Exam {
  id: string;
  name: string;
  fullName: string;
  universityIds: string[];
}

/** Collection "universities" - selectable targets under an exam. */
export interface University {
  id: string;
  name: string;
  fullName: string;
  /** Two-or-three letter monogram shown in the picker tile. */
  monogram: string;
  colorTheme: ColorTheme;
}

/** Collection "packages" - what a student can buy. */
export interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  /** Ordered feature list; `included: false` renders as unavailable. */
  features: { label: string; included: boolean }[];
  recommended: boolean;
}

/** Collection "questions" - the MCQ bank behind every test. */
export interface Question {
  id: string;
  testId: string;
  text: string;
  options: string[];
  /** Index into `options`. */
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
  /** Optional worked-solution video, stored as a YouTube embed URL. */
  videoUrl: string;
  order: number;
}

/** Collection "tests" - a topical test inside one chapter of one subject. */
export interface Test {
  id: string;
  title: string;
  subject: Subject;
  chapter: string;
  /** What the chapter covers, e.g. "Sequences and Series". */
  topic: string;
  universityId: string;
  questionCount: number;
  /** Seconds allowed per question. */
  secondsPerQuestion: number;
  /** Requires a paid package. */
  locked: boolean;
  order: number;
}

/** One answered question inside an attempt. */
export interface AttemptAnswer {
  questionId: string;
  /** null when the student ran out of time or skipped. */
  selectedIndex: number | null;
  correct: boolean;
  secondsTaken: number;
  difficulty: Difficulty;
  bookmarked: boolean;
}

/** Collection "testAttempts" - written by this app when a test is submitted. */
export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  subject: Subject;
  userId: string;
  answers: AttemptAnswer[];
  correct: number;
  incorrect: number;
  unanswered: number;
  bookmarks: number;
  secondsTaken: number;
  startedAt: number;
  completedAt: number;
}

/** Collection "liveClasses" - scheduled cohorts a student can register for. */
export interface LiveClass {
  id: string;
  title: string;
  universityId: string;
  startDate: number;
  endDate: number;
  /** What the course includes, shown as a checklist. */
  includes: string[];
  seats: number;
  seatsTaken: number;
  mode: 'live' | 'recorded';
}

/** Collection "doubts" - a question a student asks the teaching team. */
export interface Doubt {
  id: string;
  userId: string;
  userName: string;
  subject: Subject;
  question: string;
  imageUrl: string;
  status: 'open' | 'answered';
  answer: string;
  createdAt: number;
  answeredAt: number;
}
