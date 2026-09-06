// -----------------------------------------------------------------------------
// In-memory replacement for Firestore, used while src/firebase.ts still holds
// the placeholder config. It exposes the same shape as the live data layer:
// subscribe(...) mirrors onSnapshot(...), and every mutation notifies listeners
// so the UI behaves exactly as it will against the real backend.
// -----------------------------------------------------------------------------
import type { AppUser, Course, Lesson } from '../types';

type Listener = () => void;

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const DEMO_TEACHER_ID = 'demo_teacher';

const seedUsers: AppUser[] = [
  {
    id: DEMO_TEACHER_ID,
    name: 'Amara Okonkwo',
    email: 'amara@school.edu',
    role: 'teacher',
    createdAt: now - 40 * DAY,
  },
  {
    id: 'demo_admin',
    name: 'Priya Raman',
    email: 'priya@school.edu',
    role: 'admin',
    createdAt: now - 55 * DAY,
  },
  {
    id: 'demo_student_1',
    name: 'Liam Novak',
    email: 'liam@school.edu',
    role: 'student',
    createdAt: now - 12 * DAY,
  },
  {
    id: 'demo_student_2',
    name: 'Sofia Marques',
    email: 'sofia@school.edu',
    role: 'student',
    createdAt: now - 9 * DAY,
  },
  {
    id: 'demo_student_3',
    name: 'Noah Bergstrom',
    email: 'noah@school.edu',
    role: 'student',
    createdAt: now - 3 * DAY,
  },
];

const seedCourses: Course[] = [
  {
    id: 'demo_course_algebra',
    title: 'Algebra Foundations',
    description:
      'Variables, equations and the habits of mind that make the rest of maths feel easy.',
    category: 'Math',
    emoji: '🧮',
    colorTheme: 'blue',
    teacherId: DEMO_TEACHER_ID,
    teacherName: 'Amara Okonkwo',
    published: true,
    lessonCount: 3,
    createdAt: now - 30 * DAY,
    updatedAt: now - 2 * DAY,
  },
  {
    id: 'demo_course_bio',
    title: 'Living Systems',
    description:
      'From single cells to whole ecosystems - how life organises itself at every scale.',
    category: 'Science',
    emoji: '🔬',
    colorTheme: 'green',
    teacherId: DEMO_TEACHER_ID,
    teacherName: 'Amara Okonkwo',
    published: true,
    lessonCount: 3,
    createdAt: now - 21 * DAY,
    updatedAt: now - 6 * DAY,
  },
  {
    id: 'demo_course_writing',
    title: 'Everyday Writing',
    description:
      'Clear sentences, honest paragraphs and the confidence to publish what you write.',
    category: 'Language',
    emoji: '✍️',
    colorTheme: 'orange',
    teacherId: DEMO_TEACHER_ID,
    teacherName: 'Amara Okonkwo',
    published: false,
    lessonCount: 2,
    createdAt: now - 8 * DAY,
    updatedAt: now - 1 * DAY,
  },
];

const seedLessons: Lesson[] = [
  {
    id: 'demo_lesson_1',
    courseId: 'demo_course_algebra',
    title: 'What a variable really is',
    content:
      'A variable is not a mystery. It is a name for a number you do not know yet, and giving that number a name is what lets you reason about it.\n\nWhen you write x + 4 = 11, you are making a promise: there exists some number that, when 4 is added to it, gives 11. Algebra is the set of moves that lets you keep that promise while making x stand alone.\n\nThe habit to build this week is simple. Every time you see a letter, say out loud what it stands for. "x is the number of apples." A variable with a meaning attached is far harder to lose track of.',
    imageUrl: '',
    videoUrl: '',
    durationMin: 8,
    order: 1,
    createdAt: now - 30 * DAY,
  },
  {
    id: 'demo_lesson_2',
    courseId: 'demo_course_algebra',
    title: 'Balancing equations',
    content:
      'An equation is a balance scale. The equals sign is the pivot, and whatever you do to one side you must do to the other, or the scale tips and the statement stops being true.\n\nSubtract 4 from both sides of x + 4 = 11 and you get x = 7. Nothing clever happened - you simply kept the scale level while removing everything that was not x.\n\nTry it with 3y = 21, then with y/5 = 4. In both cases, name the operation that is being done to the variable, and apply its opposite to both sides.',
    imageUrl: '',
    videoUrl: '',
    durationMin: 10,
    order: 2,
    createdAt: now - 29 * DAY,
  },
  {
    id: 'demo_lesson_3',
    courseId: 'demo_course_algebra',
    title: 'Word problems without panic',
    content:
      'Most word problems fail at the translation step, not the algebra step. So translate slowly and in writing.\n\nRead the question once for the story. Read it a second time with a pen, naming every unknown with a letter. Read it a third time turning each sentence into a relationship: "twice as many" becomes 2n, "three fewer" becomes n - 3.\n\nOnly then solve. If your answer is a person and a half, you translated something wrong - go back to step two rather than doubting the arithmetic.',
    imageUrl: '',
    videoUrl: '',
    durationMin: 12,
    order: 3,
    createdAt: now - 28 * DAY,
  },
  {
    id: 'demo_lesson_4',
    courseId: 'demo_course_bio',
    title: 'The cell as a city',
    content:
      'A cell is a working city, not a bag of chemicals. The nucleus is the archive, mitochondria are the power stations, ribosomes are the workshops, and the membrane is the customs office deciding what crosses.\n\nThe analogy is useful because it makes the questions obvious: where does the energy come from, who reads the plans, how is waste removed, how does the city talk to its neighbours.\n\nHold that map in your head as we go. Almost every later topic is a detail about one of those districts.',
    imageUrl: '',
    videoUrl: '',
    durationMin: 9,
    order: 1,
    createdAt: now - 21 * DAY,
  },
  {
    id: 'demo_lesson_5',
    courseId: 'demo_course_bio',
    title: 'Photosynthesis, honestly',
    content:
      'Plants do not eat soil. They build themselves largely out of air and water, using sunlight as the power supply, and that fact is stranger than any textbook diagram suggests.\n\nCarbon dioxide comes in through pores in the leaf, water comes up from the roots, and light energy drives the reaction that stitches them into sugar, releasing oxygen as a by-product.\n\nThe oxygen you are breathing right now was, quite recently, part of a molecule of water inside a leaf.',
    imageUrl: '',
    videoUrl: '',
    durationMin: 11,
    order: 2,
    createdAt: now - 20 * DAY,
  },
  {
    id: 'demo_lesson_6',
    courseId: 'demo_course_bio',
    title: 'Ecosystems and feedback',
    content:
      'An ecosystem is a set of loops. Predators limit prey, prey limit plants, plants limit the carbon in the air, and each loop pushes back on the others.\n\nRemove one species and you are not subtracting one thing - you are cutting a loop, and the system settles somewhere new, sometimes dramatically.\n\nWhen you study a local ecosystem this term, draw the arrows before you write anything else. The arrows are the biology.',
    imageUrl: '',
    videoUrl: '',
    durationMin: 13,
    order: 3,
    createdAt: now - 19 * DAY,
  },
  {
    id: 'demo_lesson_7',
    courseId: 'demo_course_writing',
    title: 'One idea per sentence',
    content:
      'The fastest way to write more clearly is not a bigger vocabulary. It is putting one idea in each sentence and letting the full stop do its job.\n\nTake any paragraph you wrote last week and split every sentence that contains an "and" joining two complete thoughts. Read it aloud. It will almost always be better.\n\nLong sentences are not forbidden - they are earned, once the short ones are under control.',
    imageUrl: '',
    videoUrl: '',
    durationMin: 7,
    order: 1,
    createdAt: now - 8 * DAY,
  },
  {
    id: 'demo_lesson_8',
    courseId: 'demo_course_writing',
    title: 'Editing your own work',
    content:
      'You cannot edit well in the same sitting in which you wrote. Your brain still remembers what you meant, so it reads what you meant rather than what is on the page.\n\nLeave the draft overnight. Then read it on a different device, or aloud, and mark every place you stumble. A stumble is a reader-facing bug, even when the grammar is fine.\n\nCut first, rewrite second. Most drafts get better by 20 per cent simply by removing the first paragraph.',
    imageUrl: '',
    videoUrl: '',
    durationMin: 9,
    order: 2,
    createdAt: now - 7 * DAY,
  },
];

class DemoStore {
  users: AppUser[] = [...seedUsers];
  courses: Course[] = [...seedCourses];
  lessons: Lesson[] = [...seedLessons];

  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }

  // --- users ---------------------------------------------------------------

  addUser(user: Omit<AppUser, 'id'> & { id?: string }): AppUser {
    const created: AppUser = { ...user, id: user.id ?? id('user') };
    this.users = [...this.users, created];
    this.emit();
    return created;
  }

  findUserByEmail(email: string): AppUser | undefined {
    return this.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  setUserRole(userId: string, role: AppUser['role']): void {
    this.users = this.users.map((user) => (user.id === userId ? { ...user, role } : user));
    this.emit();
  }

  // --- courses -------------------------------------------------------------

  addCourse(course: Omit<Course, 'id'>): string {
    const courseId = id('course');
    this.courses = [...this.courses, { ...course, id: courseId }];
    this.emit();
    return courseId;
  }

  updateCourse(courseId: string, patch: Partial<Course>): void {
    this.courses = this.courses.map((course) =>
      course.id === courseId ? { ...course, ...patch, updatedAt: Date.now() } : course,
    );
    this.emit();
  }

  deleteCourse(courseId: string): void {
    this.courses = this.courses.filter((course) => course.id !== courseId);
    this.lessons = this.lessons.filter((lesson) => lesson.courseId !== courseId);
    this.emit();
  }

  // --- lessons -------------------------------------------------------------

  addLesson(lesson: Omit<Lesson, 'id'>): string {
    const lessonId = id('lesson');
    this.lessons = [...this.lessons, { ...lesson, id: lessonId }];
    this.syncLessonCount(lesson.courseId);
    this.emit();
    return lessonId;
  }

  updateLesson(lessonId: string, patch: Partial<Lesson>): void {
    this.lessons = this.lessons.map((lesson) =>
      lesson.id === lessonId ? { ...lesson, ...patch } : lesson,
    );
    this.emit();
  }

  deleteLesson(lessonId: string): void {
    const lesson = this.lessons.find((item) => item.id === lessonId);
    this.lessons = this.lessons.filter((item) => item.id !== lessonId);
    if (lesson) this.syncLessonCount(lesson.courseId);
    this.emit();
  }

  private syncLessonCount(courseId: string): void {
    const count = this.lessons.filter((lesson) => lesson.courseId === courseId).length;
    this.courses = this.courses.map((course) =>
      course.id === courseId ? { ...course, lessonCount: count, updatedAt: Date.now() } : course,
    );
  }
}

export const demoStore = new DemoStore();
