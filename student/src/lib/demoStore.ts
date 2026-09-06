// -----------------------------------------------------------------------------
// In-memory stand-in for Firestore while src/firebase.ts holds the placeholder
// config. Mirrors the live data layer: subscribe(...) behaves like onSnapshot.
// Courses here are the published ones a student would actually receive.
// -----------------------------------------------------------------------------
import type { AppUser, Course, Lesson, LessonProgress } from '../types';

type Listener = () => void;

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const TEACHER = { id: 'demo_teacher', name: 'Amara Okonkwo' };

const seedUsers: AppUser[] = [
  {
    id: TEACHER.id,
    name: TEACHER.name,
    email: 'amara@school.edu',
    role: 'teacher',
    createdAt: now - 40 * DAY,
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
    teacherId: TEACHER.id,
    teacherName: TEACHER.name,
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
    teacherId: TEACHER.id,
    teacherName: TEACHER.name,
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
    teacherId: TEACHER.id,
    teacherName: TEACHER.name,
    published: true,
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
  progress: LessonProgress[] = [];

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

  addUser(user: Omit<AppUser, 'id'>): AppUser {
    const created: AppUser = { ...user, id: `user_${Math.random().toString(36).slice(2, 10)}` };
    this.users = [...this.users, created];
    this.emit();
    return created;
  }

  findUserByEmail(email: string): AppUser | undefined {
    return this.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  setProgress(entry: Omit<LessonProgress, 'id'>): void {
    const id = `${entry.userId}_${entry.lessonId}`;
    const existing = this.progress.find((item) => item.id === id);
    this.progress = existing
      ? this.progress.map((item) => (item.id === id ? { ...item, ...entry } : item))
      : [...this.progress, { ...entry, id }];
    this.emit();
  }
}

export const demoStore = new DemoStore();
