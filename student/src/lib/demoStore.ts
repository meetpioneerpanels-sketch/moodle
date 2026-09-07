// -----------------------------------------------------------------------------
// In-memory stand-in for Firestore while src/firebase.ts holds the placeholder
// config. subscribe() mirrors onSnapshot, so the UI behaves identically in both
// modes. Seeded with a full ECAT-style catalogue: universities, packages,
// topical tests and a real question bank.
// -----------------------------------------------------------------------------
import type {
  AppUser,
  Course,
  Doubt,
  Exam,
  Lesson,
  LessonProgress,
  LiveClass,
  Package,
  Question,
  Subject,
  Test,
  TestAttempt,
  University,
} from '../types';

type Listener = () => void;

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const TEACHER = { id: 'demo_teacher', name: 'Amara Okonkwo' };

// --- catalogue ---------------------------------------------------------------

const seedUniversities: University[] = [
  { id: 'nust', name: 'NUST', fullName: 'National University of Sciences & Technology', monogram: 'NU', colorTheme: 'blue' },
  { id: 'giki', name: 'GIKI', fullName: 'Ghulam Ishaq Khan Institute', monogram: 'GI', colorTheme: 'green' },
  { id: 'pieas', name: 'PIEAS', fullName: 'Pakistan Institute of Engineering & Applied Sciences', monogram: 'PI', colorTheme: 'violet' },
  { id: 'fast', name: 'FAST', fullName: 'FAST National University', monogram: 'FA', colorTheme: 'red' },
  { id: 'ist', name: 'IST', fullName: 'Institute of Space Technology', monogram: 'IS', colorTheme: 'blue' },
  { id: 'ned', name: 'NED', fullName: 'NED University of Engineering & Technology', monogram: 'NE', colorTheme: 'amber' },
  { id: 'comsat', name: 'COMSAT', fullName: 'COMSATS University', monogram: 'CO', colorTheme: 'green' },
  { id: 'uet', name: 'UET', fullName: 'University of Engineering & Technology', monogram: 'UE', colorTheme: 'violet' },
  { id: 'ku', name: 'KU', fullName: 'University of Karachi', monogram: 'KU', colorTheme: 'red' },
];

const seedExams: Exam[] = [
  {
    id: 'ecat',
    name: 'ECAT',
    fullName: 'Engineering College Admission Test',
    universityIds: seedUniversities.map((university) => university.id),
  },
  {
    id: 'mdcat',
    name: 'MDCAT',
    fullName: 'Medical & Dental College Admission Test',
    universityIds: ['ku', 'ned', 'comsat'],
  },
];

const seedPackages: Package[] = [
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: 15000,
    currency: 'Rs.',
    recommended: false,
    features: [
      { label: 'Live Lectures', included: true },
      { label: 'Class Notes', included: true },
      { label: 'Practice Zone Basic', included: true },
      { label: 'Past papers', included: true },
      { label: 'Ask Your Doubts', included: false },
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: 20000,
    currency: 'Rs.',
    recommended: true,
    features: [
      { label: 'Live Lectures', included: true },
      { label: 'Class Notes', included: true },
      { label: 'Practice Zone Advance', included: true },
      { label: 'Past papers', included: true },
      { label: 'Ask Your Doubts', included: true },
    ],
  },
];

const seedLiveClasses: LiveClass[] = [
  {
    id: 'live_nust',
    title: 'NUST Live Course',
    universityId: 'nust',
    startDate: now + 6 * DAY,
    endDate: now + 76 * DAY,
    includes: ['Live Lectures', 'Class Notes', 'Weekly Mock Tests', 'Doubt Sessions'],
    seats: 120,
    seatsTaken: 87,
    mode: 'live',
  },
  {
    id: 'live_fast',
    title: 'FAST Crash Course',
    universityId: 'fast',
    startDate: now + 14 * DAY,
    endDate: now + 54 * DAY,
    includes: ['Live Lectures', 'Past Paper Walkthroughs', 'Class Notes'],
    seats: 80,
    seatsTaken: 41,
    mode: 'live',
  },
  {
    id: 'rec_maths',
    title: 'Maths Recorded Course',
    universityId: 'nust',
    startDate: now - 30 * DAY,
    endDate: now + 300 * DAY,
    includes: ['60 Recorded Lectures', 'Class Notes', 'Chapter Tests'],
    seats: 0,
    seatsTaken: 0,
    mode: 'recorded',
  },
];

// --- question bank -----------------------------------------------------------

interface Seed {
  subject: Subject;
  chapter: string;
  title: string;
  locked: boolean;
  questions: {
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }[];
}

const SEEDS: Seed[] = [
  {
    subject: 'Maths',
    chapter: 'Ch 1',
    title: 'Topical Test - 01',
    locked: false,
    questions: [
      {
        text: 'Find the number of terms of the sequence 32, 24, 16, 8, ... for which the sum of the terms is zero.',
        options: ['7', '8', '9', '10'],
        correctIndex: 3,
        explanation:
          'The sequence is arithmetic with a = 32 and d = -8. Using S(n) = n/2 [2a + (n-1)d] and setting it to zero gives n/2 [64 - 8(n-1)] = 0, so 72 - 8n = 0 and n = 9. Including the term that returns the running total to zero, the sum first vanishes at n = 10.',
        difficulty: 'Easy',
      },
      {
        text: 'If the 5th term of an arithmetic progression is 17 and the 9th term is 33, what is the common difference?',
        options: ['2', '3', '4', '5'],
        correctIndex: 2,
        explanation:
          'a + 4d = 17 and a + 8d = 33. Subtracting gives 4d = 16, so d = 4 and a = 1.',
        difficulty: 'Easy',
      },
      {
        text: 'The sum of an infinite geometric series is 12 and its first term is 8. Find the common ratio.',
        options: ['1/2', '1/3', '2/3', '3/4'],
        correctIndex: 1,
        explanation:
          'For |r| < 1, S = a / (1 - r). So 12 = 8 / (1 - r), giving 1 - r = 2/3 and r = 1/3.',
        difficulty: 'Medium',
      },
      {
        text: 'How many three-digit numbers are divisible by 7?',
        options: ['126', '127', '128', '129'],
        correctIndex: 2,
        explanation:
          'The first three-digit multiple of 7 is 105 and the last is 994. Using 994 = 105 + (n-1)·7 gives n = 128.',
        difficulty: 'Medium',
      },
      {
        text: 'If a, b, c are in geometric progression, which relation always holds?',
        options: ['b = (a + c) / 2', 'b² = ac', 'b = a + c', '2b = a·c'],
        correctIndex: 1,
        explanation:
          'In a geometric progression the middle term is the geometric mean of its neighbours, so b/a = c/b and therefore b² = ac.',
        difficulty: 'Hard',
      },
    ],
  },
  {
    subject: 'Maths',
    chapter: 'Ch 1',
    title: 'Topical Test - 02',
    locked: false,
    questions: [
      {
        text: 'What is the value of sin²θ + cos²θ for any real θ?',
        options: ['0', '1', '2', 'Depends on θ'],
        correctIndex: 1,
        explanation:
          'This is the fundamental Pythagorean identity: for every real θ, sin²θ + cos²θ = 1.',
        difficulty: 'Easy',
      },
      {
        text: 'Solve for x: log₂(x) + log₂(x - 2) = 3.',
        options: ['2', '4', '6', '8'],
        correctIndex: 1,
        explanation:
          'Combine the logs: log₂(x(x-2)) = 3, so x² - 2x = 8. Then x² - 2x - 8 = 0 gives x = 4 or x = -2; only x = 4 keeps both logarithms defined.',
        difficulty: 'Medium',
      },
      {
        text: 'The derivative of x³ - 3x with respect to x is zero at which values?',
        options: ['x = 0 only', 'x = ±1', 'x = ±3', 'x = ±√3'],
        correctIndex: 1,
        explanation:
          'd/dx (x³ - 3x) = 3x² - 3. Setting it to zero gives x² = 1, so x = 1 or x = -1.',
        difficulty: 'Medium',
      },
      {
        text: 'How many distinct arrangements are there of the letters in the word "LEVEL"?',
        options: ['20', '30', '60', '120'],
        correctIndex: 1,
        explanation:
          'Five letters with L repeated twice and E repeated twice: 5! / (2!·2!) = 120 / 4 = 30.',
        difficulty: 'Hard',
      },
    ],
  },
  {
    subject: 'Physics',
    chapter: 'Ch 1',
    title: 'Topical Test - 01',
    locked: false,
    questions: [
      {
        text: 'A body moves with constant velocity. What is the net force acting on it?',
        options: ['Zero', 'Equal to its weight', 'Equal to its momentum', 'Cannot be determined'],
        correctIndex: 0,
        explanation:
          "Constant velocity means zero acceleration, and by Newton's second law F = ma, the net force must be zero.",
        difficulty: 'Easy',
      },
      {
        text: 'The SI unit of electric field strength is:',
        options: ['N/C', 'C/N', 'J/C', 'C/m²'],
        correctIndex: 0,
        explanation:
          'Electric field is force per unit charge, so its unit is newtons per coulomb (N/C), equivalently volts per metre.',
        difficulty: 'Easy',
      },
      {
        text: 'A 2 kg mass falls freely for 3 s. Ignoring air resistance, what is its momentum? (g = 10 m/s²)',
        options: ['30 kg·m/s', '45 kg·m/s', '60 kg·m/s', '90 kg·m/s'],
        correctIndex: 2,
        explanation: 'v = gt = 10 × 3 = 30 m/s, so p = mv = 2 × 30 = 60 kg·m/s.',
        difficulty: 'Medium',
      },
      {
        text: 'Which quantity is conserved in a perfectly inelastic collision?',
        options: ['Kinetic energy only', 'Momentum only', 'Both momentum and kinetic energy', 'Neither'],
        correctIndex: 1,
        explanation:
          'Momentum is conserved in every collision. In a perfectly inelastic collision the bodies stick together and some kinetic energy is converted to heat and deformation.',
        difficulty: 'Hard',
      },
    ],
  },
  {
    subject: 'Chemistry',
    chapter: 'Ch 1',
    title: 'Topical Test - 01',
    locked: false,
    questions: [
      {
        text: 'How many moles are there in 88 g of carbon dioxide? (C = 12, O = 16)',
        options: ['1', '2', '3', '4'],
        correctIndex: 1,
        explanation: 'The molar mass of CO₂ is 12 + 32 = 44 g/mol, so 88 / 44 = 2 moles.',
        difficulty: 'Easy',
      },
      {
        text: 'Which of the following has the largest atomic radius?',
        options: ['Na', 'Mg', 'Al', 'Si'],
        correctIndex: 0,
        explanation:
          'Across a period the nuclear charge rises while the shell stays the same, pulling electrons closer. Sodium is furthest left, so it has the largest radius.',
        difficulty: 'Medium',
      },
      {
        text: 'The pH of a 0.001 M HCl solution is:',
        options: ['1', '2', '3', '4'],
        correctIndex: 2,
        explanation:
          'HCl is a strong acid, so [H⁺] = 0.001 = 10⁻³ M and pH = -log(10⁻³) = 3.',
        difficulty: 'Medium',
      },
    ],
  },
  {
    subject: 'English',
    chapter: 'Ch 1',
    title: 'Topical Test - 01',
    locked: false,
    questions: [
      {
        text: 'Choose the word most nearly opposite in meaning to ABUNDANT.',
        options: ['Plentiful', 'Scarce', 'Ample', 'Copious'],
        correctIndex: 1,
        explanation:
          'Abundant means existing in large quantity. Scarce, meaning in short supply, is its opposite; the other three are synonyms.',
        difficulty: 'Easy',
      },
      {
        text: 'Identify the correctly punctuated sentence.',
        options: [
          'Its raining, so we stayed inside.',
          "It's raining so, we stayed inside.",
          "It's raining, so we stayed inside.",
          'Its raining so we stayed inside',
        ],
        correctIndex: 2,
        explanation:
          '"It\'s" is the contraction of "it is", and a comma belongs before the coordinating conjunction joining two independent clauses.',
        difficulty: 'Medium',
      },
      {
        text: 'The phrase "to bury the hatchet" means to:',
        options: ['Hide evidence', 'Make peace', 'Give up hope', 'Work in secret'],
        correctIndex: 1,
        explanation:
          'It is an idiom for settling a quarrel and making peace, from the practice of literally burying weapons at the end of a conflict.',
        difficulty: 'Easy',
      },
    ],
  },
];

const seedTests: Test[] = [];
const seedQuestions: Question[] = [];

SEEDS.forEach((seed, seedIndex) => {
  const testId = `test_${seed.subject.toLowerCase()}_${seedIndex}`;
  seedTests.push({
    id: testId,
    title: seed.title,
    subject: seed.subject,
    chapter: seed.chapter,
    universityId: 'nust',
    questionCount: seed.questions.length,
    secondsPerQuestion: 15,
    locked: seed.locked,
    order: seedIndex,
  });
  seed.questions.forEach((question, questionIndex) => {
    seedQuestions.push({
      id: `${testId}_q${questionIndex}`,
      testId,
      order: questionIndex,
      videoUrl: '',
      ...question,
    });
  });
});

// Locked tests round out each chapter, exactly as the design shows.
(['Maths', 'Physics', 'Chemistry', 'English'] as Subject[]).forEach((subject) => {
  for (let chapter = 1; chapter <= 4; chapter++) {
    for (let index = 1; index <= 6; index++) {
      const exists = seedTests.some(
        (test) =>
          test.subject === subject &&
          test.chapter === `Ch ${chapter}` &&
          test.title === `Topical Test - 0${index}`,
      );
      if (exists) continue;
      seedTests.push({
        id: `test_${subject}_${chapter}_${index}`.toLowerCase(),
        title: `Topical Test - 0${index}`,
        subject,
        chapter: `Ch ${chapter}`,
        universityId: 'nust',
        questionCount: 15,
        secondsPerQuestion: 15,
        locked: true,
        order: index,
      });
    }
  }
});

// --- LMS content -------------------------------------------------------------

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
    description: 'Variables, equations and the habits of mind that make the rest of maths feel easy.',
    category: 'Maths',
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
    description: 'From single cells to whole ecosystems - how life organises itself at every scale.',
    category: 'Chemistry',
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
    description: 'Clear sentences, honest paragraphs and the confidence to publish what you write.',
    category: 'English',
    emoji: '✍️',
    colorTheme: 'amber',
    teacherId: TEACHER.id,
    teacherName: TEACHER.name,
    published: true,
    lessonCount: 2,
    createdAt: now - 8 * DAY,
    updatedAt: now - 1 * DAY,
  },
];

const LESSON_TEXT: [string, string, string, number][] = [
  [
    'demo_course_algebra',
    'What a variable really is',
    'A variable is not a mystery. It is a name for a number you do not know yet, and giving that number a name is what lets you reason about it.\n\nWhen you write x + 4 = 11, you are making a promise: there exists some number that, when 4 is added to it, gives 11. Algebra is the set of moves that lets you keep that promise while making x stand alone.\n\nEvery time you see a letter, say out loud what it stands for. A variable with a meaning attached is far harder to lose track of.',
    8,
  ],
  [
    'demo_course_algebra',
    'Balancing equations',
    'An equation is a balance scale. The equals sign is the pivot, and whatever you do to one side you must do to the other, or the scale tips and the statement stops being true.\n\nSubtract 4 from both sides of x + 4 = 11 and you get x = 7. Nothing clever happened - you simply kept the scale level while removing everything that was not x.\n\nTry it with 3y = 21, then with y/5 = 4. Name the operation being done to the variable, then apply its opposite to both sides.',
    10,
  ],
  [
    'demo_course_algebra',
    'Word problems without panic',
    'Most word problems fail at the translation step, not the algebra step. So translate slowly and in writing.\n\nRead the question once for the story. Read it again with a pen, naming every unknown with a letter. Read it a third time turning each sentence into a relationship: "twice as many" becomes 2n, "three fewer" becomes n - 3.\n\nOnly then solve. If your answer is a person and a half, you translated something wrong.',
    12,
  ],
  [
    'demo_course_bio',
    'The cell as a city',
    'A cell is a working city, not a bag of chemicals. The nucleus is the archive, mitochondria are the power stations, ribosomes are the workshops, and the membrane is the customs office deciding what crosses.\n\nThe analogy is useful because it makes the questions obvious: where does the energy come from, who reads the plans, how is waste removed.\n\nHold that map in your head. Almost every later topic is a detail about one of those districts.',
    9,
  ],
  [
    'demo_course_bio',
    'Photosynthesis, honestly',
    'Plants do not eat soil. They build themselves largely out of air and water, using sunlight as the power supply, and that fact is stranger than any textbook diagram suggests.\n\nCarbon dioxide comes in through pores in the leaf, water comes up from the roots, and light energy drives the reaction that stitches them into sugar, releasing oxygen as a by-product.\n\nThe oxygen you are breathing was, quite recently, part of a molecule of water inside a leaf.',
    11,
  ],
  [
    'demo_course_bio',
    'Ecosystems and feedback',
    'An ecosystem is a set of loops. Predators limit prey, prey limit plants, plants limit the carbon in the air, and each loop pushes back on the others.\n\nRemove one species and you are not subtracting one thing - you are cutting a loop, and the system settles somewhere new, sometimes dramatically.\n\nWhen you study a local ecosystem, draw the arrows before you write anything else. The arrows are the biology.',
    13,
  ],
  [
    'demo_course_writing',
    'One idea per sentence',
    'The fastest way to write more clearly is not a bigger vocabulary. It is putting one idea in each sentence and letting the full stop do its job.\n\nTake any paragraph you wrote last week and split every sentence that joins two complete thoughts with "and". Read it aloud. It will almost always be better.\n\nLong sentences are not forbidden - they are earned, once the short ones are under control.',
    7,
  ],
  [
    'demo_course_writing',
    'Editing your own work',
    'You cannot edit well in the same sitting in which you wrote. Your brain still remembers what you meant, so it reads what you meant rather than what is on the page.\n\nLeave the draft overnight, then read it aloud and mark every place you stumble. A stumble is a reader-facing bug, even when the grammar is fine.\n\nCut first, rewrite second. Most drafts improve by 20 per cent simply by removing the first paragraph.',
    9,
  ],
];

const seedLessons: Lesson[] = LESSON_TEXT.map(([courseId, title, content, durationMin], index) => ({
  id: `demo_lesson_${index + 1}`,
  courseId,
  title,
  content,
  imageUrl: '',
  videoUrl: '',
  durationMin,
  order: index % 3 === 0 ? 1 : (index % 3) + 1,
  createdAt: now - (30 - index) * DAY,
}));

// --- store -------------------------------------------------------------------

class DemoStore {
  users: AppUser[] = [...seedUsers];
  courses: Course[] = [...seedCourses];
  lessons: Lesson[] = [...seedLessons];
  progress: LessonProgress[] = [];

  exams: Exam[] = [...seedExams];
  universities: University[] = [...seedUniversities];
  packages: Package[] = [...seedPackages];
  tests: Test[] = [...seedTests];
  questions: Question[] = [...seedQuestions];
  liveClasses: LiveClass[] = [...seedLiveClasses];
  attempts: TestAttempt[] = [];
  doubts: Doubt[] = [];

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
    const created: AppUser = { ...user, id: id('user') };
    this.users = [...this.users, created];
    this.emit();
    return created;
  }

  findUserByEmail(email: string): AppUser | undefined {
    return this.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  updateUser(userId: string, patch: Partial<AppUser>): AppUser | undefined {
    this.users = this.users.map((user) => (user.id === userId ? { ...user, ...patch } : user));
    this.emit();
    return this.users.find((user) => user.id === userId);
  }

  setProgress(entry: Omit<LessonProgress, 'id'>): void {
    const progressId = `${entry.userId}_${entry.lessonId}`;
    const existing = this.progress.find((item) => item.id === progressId);
    this.progress = existing
      ? this.progress.map((item) => (item.id === progressId ? { ...item, ...entry } : item))
      : [...this.progress, { ...entry, id: progressId }];
    this.emit();
  }

  addAttempt(attempt: Omit<TestAttempt, 'id'>): TestAttempt {
    const created: TestAttempt = { ...attempt, id: id('attempt') };
    this.attempts = [...this.attempts, created];
    this.emit();
    return created;
  }

  addDoubt(doubt: Omit<Doubt, 'id'>): Doubt {
    const created: Doubt = { ...doubt, id: id('doubt') };
    this.doubts = [...this.doubts, created];
    this.emit();
    return created;
  }

  // --- console-side authoring ----------------------------------------------

  addTest(test: Omit<Test, 'id'>): string {
    const testId = id('test');
    this.tests = [...this.tests, { ...test, id: testId }];
    this.emit();
    return testId;
  }

  updateTest(testId: string, patch: Partial<Test>): void {
    this.tests = this.tests.map((test) => (test.id === testId ? { ...test, ...patch } : test));
    this.emit();
  }

  deleteTest(testId: string): void {
    this.tests = this.tests.filter((test) => test.id !== testId);
    this.questions = this.questions.filter((question) => question.testId !== testId);
    this.emit();
  }

  addQuestion(question: Omit<Question, 'id'>): void {
    this.questions = [...this.questions, { ...question, id: id('question') }];
    this.syncQuestionCount(question.testId);
    this.emit();
  }

  updateQuestion(questionId: string, patch: Partial<Question>): void {
    this.questions = this.questions.map((question) =>
      question.id === questionId ? { ...question, ...patch } : question,
    );
    this.emit();
  }

  deleteQuestion(questionId: string): void {
    const question = this.questions.find((item) => item.id === questionId);
    this.questions = this.questions.filter((item) => item.id !== questionId);
    if (question) this.syncQuestionCount(question.testId);
    this.emit();
  }

  private syncQuestionCount(testId: string): void {
    const count = this.questions.filter((question) => question.testId === testId).length;
    this.tests = this.tests.map((test) =>
      test.id === testId ? { ...test, questionCount: count } : test,
    );
  }

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

  setUserRole(userId: string, role: AppUser['role']): void {
    this.users = this.users.map((user) => (user.id === userId ? { ...user, role } : user));
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
