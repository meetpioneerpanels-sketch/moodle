// -----------------------------------------------------------------------------
// In-memory stand-in for Firestore while src/firebase.ts holds the placeholder
// config. subscribe() mirrors onSnapshot, so the UI behaves identically in both
// modes. Seeded with a full ECAT-style catalogue: universities, packages,
// topical tests and a real question bank.
// -----------------------------------------------------------------------------
import { QUESTION_BANK } from './questionBank';
import type {
  AppUser,
  AttemptAnswer,
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
  { id: 'air', name: 'AIR', fullName: 'Air University', monogram: 'AU', colorTheme: 'blue' },
  { id: 'bahria', name: 'BAHRIA', fullName: 'Bahria University', monogram: 'BU', colorTheme: 'green' },
  { id: 'mehran', name: 'MUET', fullName: 'Mehran University of Engineering & Technology', monogram: 'MU', colorTheme: 'amber' },
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
  {
    id: 'live_giki',
    title: 'GIKI Intensive Batch',
    universityId: 'giki',
    startDate: now + 3 * DAY,
    endDate: now + 63 * DAY,
    includes: ['Live Lectures', 'Daily Practice Sets', 'Class Notes', 'One-to-one Mentoring'],
    seats: 60,
    seatsTaken: 58,
    mode: 'live',
  },
  {
    id: 'rec_physics',
    title: 'Physics Recorded Course',
    universityId: 'nust',
    startDate: now - 60 * DAY,
    endDate: now + 300 * DAY,
    includes: ['48 Recorded Lectures', 'Numerical Workbook', 'Chapter Tests'],
    seats: 0,
    seatsTaken: 0,
    mode: 'recorded',
  },
  {
    id: 'rec_english',
    title: 'English Recorded Course',
    universityId: 'fast',
    startDate: now - 20 * DAY,
    endDate: now + 300 * DAY,
    includes: ['30 Recorded Lectures', 'Vocabulary Builder', 'Past Paper Drills'],
    seats: 0,
    seatsTaken: 0,
    mode: 'recorded',
  },
];

// --- question bank -----------------------------------------------------------

const seedTests: Test[] = [];
const seedQuestions: Question[] = [];

QUESTION_BANK.forEach((chapter, chapterIndex) => {
  const testId = `test_${chapter.subject}_${chapter.chapter}_01`.replace(/\s+/g, '').toLowerCase();
  seedTests.push({
    id: testId,
    title: 'Topical Test - 01',
    subject: chapter.subject,
    chapter: chapter.chapter,
    topic: chapter.topic,
    universityId: 'nust',
    questionCount: chapter.questions.length,
    secondsPerQuestion: 15,
    locked: false,
    order: 1,
  });
  chapter.questions.forEach((question, questionIndex) => {
    seedQuestions.push({
      id: `${testId}_q${questionIndex}`,
      testId,
      order: questionIndex,
      videoUrl: '',
      ...question,
    });
  });

  // Tests 02-06 round out each chapter and open with the Advanced package.
  for (let index = 2; index <= 6; index++) {
    seedTests.push({
      id: `${testId}_${index}`,
      title: `Topical Test - 0${index}`,
      subject: chapter.subject,
      chapter: chapter.chapter,
      topic: chapter.topic,
      universityId: 'nust',
      questionCount: 15,
      secondsPerQuestion: 15,
      locked: true,
      order: index,
    });
  }
  void chapterIndex;
});

// --- LMS content -------------------------------------------------------------

const seedUsers: AppUser[] = [
  { id: TEACHER.id, name: TEACHER.name, email: 'amara@school.edu', role: 'teacher', createdAt: now - 40 * DAY },
  { id: 'demo_admin', name: 'Priya Raman', email: 'priya@school.edu', role: 'admin', createdAt: now - 55 * DAY },
  { id: 'demo_teacher_2', name: 'Bilal Ahmed', email: 'bilal@school.edu', role: 'teacher', createdAt: now - 33 * DAY },
  { id: 'demo_teacher_3', name: 'Hina Siddiqui', email: 'hina@school.edu', role: 'teacher', createdAt: now - 27 * DAY },
  { id: 'demo_student_1', name: 'Liam Novak', email: 'liam@school.edu', role: 'student', createdAt: now - 12 * DAY },
  { id: 'demo_student_2', name: 'Sofia Marques', email: 'sofia@school.edu', role: 'student', createdAt: now - 9 * DAY },
  { id: 'demo_student_3', name: 'Noah Bergstrom', email: 'noah@school.edu', role: 'student', createdAt: now - 3 * DAY },
  { id: 'demo_student_4', name: 'Ayesha Tariq', email: 'ayesha@school.edu', role: 'student', createdAt: now - 21 * DAY },
  { id: 'demo_student_5', name: 'Daniyal Raza', email: 'daniyal@school.edu', role: 'student', createdAt: now - 18 * DAY },
  { id: 'demo_student_6', name: 'Maria Gonzalez', email: 'maria@school.edu', role: 'student', createdAt: now - 15 * DAY },
  { id: 'demo_student_7', name: 'Omar Farooq', email: 'omar@school.edu', role: 'student', createdAt: now - 7 * DAY },
  { id: 'demo_student_8', name: 'Zainab Malik', email: 'zainab@school.edu', role: 'student', createdAt: now - 2 * DAY },
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
    published: false,
    lessonCount: 2,
    createdAt: now - 8 * DAY,
    updatedAt: now - 1 * DAY,
  },
  {
    id: 'demo_course_mechanics',
    title: 'Mechanics in Practice',
    description: 'Forces, motion and energy, taught through the problems that actually appear in entry tests.',
    category: 'Physics',
    emoji: '🚀',
    colorTheme: 'blue',
    teacherId: TEACHER.id,
    teacherName: TEACHER.name,
    published: true,
    lessonCount: 3,
    createdAt: now - 16 * DAY,
    updatedAt: now - 4 * DAY,
  },
  {
    id: 'demo_course_periodic',
    title: 'Reading the Periodic Table',
    description: 'Why the table is shaped the way it is, and how to predict a reaction from an element’s address.',
    category: 'Chemistry',
    emoji: '⚗️',
    colorTheme: 'violet',
    teacherId: TEACHER.id,
    teacherName: TEACHER.name,
    published: true,
    lessonCount: 3,
    createdAt: now - 11 * DAY,
    updatedAt: now - 3 * DAY,
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
    'demo_course_mechanics',
    'Free-body diagrams first',
    'Almost every mechanics mistake happens before any arithmetic. Draw the body on its own, then draw every force acting on it - weight down, normal force perpendicular to the surface, friction opposing motion, tension along the string.\n\nLabel each arrow with what causes it. If you cannot name the cause, the force probably does not exist, and that is the single most common invented force in exam answers.\n\nOnly once the diagram is complete do you resolve into components and write F = ma for each direction.',
    10,
  ],
  [
    'demo_course_mechanics',
    'Energy beats kinematics',
    'When a question gives you heights and speeds but no time, reach for energy rather than the equations of motion.\n\nConservation of energy turns a two-step kinematics problem into one line: the potential energy lost equals the kinetic energy gained, so gh = half v squared, independent of the path taken.\n\nThe exception is when friction is involved. Then some energy leaves as heat, and you need the work done against friction as a third term.',
    12,
  ],
  [
    'demo_course_mechanics',
    'Momentum in collisions',
    'Momentum is conserved in every collision, without exception, as long as no external force acts. Kinetic energy is not.\n\nThat single distinction answers most collision questions. If the bodies stick together the collision is perfectly inelastic and you use momentum alone. If the question says "elastic", you may also set the kinetic energy before equal to the kinetic energy after.\n\nWrite the momentum equation with directions as signs, not as words. A sign error is far more common than an algebra error.',
    11,
  ],
  [
    'demo_course_periodic',
    'The table is a map of electrons',
    'The periodic table is not a list; it is a picture of how electrons fill shells. The period number tells you which shell is being filled, and the group number tells you how many electrons are in it.\n\nOnce you see that, the trends stop being facts to memorise. Atomic radius shrinks across a period because the nuclear charge grows while the shell stays the same. Ionisation energy rises for exactly the same reason.\n\nRead an element’s address before you read anything else about it.',
    9,
  ],
  [
    'demo_course_periodic',
    'Predicting a bond',
    'The difference in electronegativity between two atoms tells you what kind of bond forms. A large difference means electrons transfer and you get an ionic bond; a small one means they are shared, giving a covalent bond.\n\nMetals sit on the left with few valence electrons to lose, non-metals on the right with room to gain. A metal plus a non-metal is therefore usually ionic, and two non-metals usually covalent.\n\nThe boundary is a gradient, not a wall - many bonds are polar covalent, somewhere in between.',
    11,
  ],
  [
    'demo_course_periodic',
    'Shapes from repulsion',
    'Molecular shape follows one idea: electron pairs around a central atom repel each other and settle as far apart as they can.\n\nFour bonding pairs give a tetrahedron at 109.5 degrees. Replace one with a lone pair and the shape becomes pyramidal, because a lone pair repels more strongly and squeezes the bond angles down.\n\nCount the pairs, subtract the lone ones, and the shape follows without any memorisation.',
    10,
  ],
  [
    'demo_course_writing',
    'Editing your own work',
    'You cannot edit well in the same sitting in which you wrote. Your brain still remembers what you meant, so it reads what you meant rather than what is on the page.\n\nLeave the draft overnight, then read it aloud and mark every place you stumble. A stumble is a reader-facing bug, even when the grammar is fine.\n\nCut first, rewrite second. Most drafts improve by 20 per cent simply by removing the first paragraph.',
    9,
  ],
];

const lessonOrderByCourse = new Map<string, number>();

const seedLessons: Lesson[] = LESSON_TEXT.map(([courseId, title, content, durationMin], index) => {
  const order = (lessonOrderByCourse.get(courseId) ?? 0) + 1;
  lessonOrderByCourse.set(courseId, order);
  return {
    id: `demo_lesson_${index + 1}`,
    courseId,
    title,
    content,
    imageUrl: '',
    videoUrl: '',
    durationMin,
    order,
    createdAt: now - (30 - index) * DAY,
  };
});

// --- seeded history ----------------------------------------------------------

/**
 * A tiny deterministic generator. The demo needs a history that looks lived-in
 * but does not reshuffle on every reload, so results stay stable between runs.
 */
function makeRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Roughly how well this student does in each subject, so the rings differ. */
const SUBJECT_SKILL: Record<Subject, number> = {
  Maths: 0.62,
  Physics: 0.74,
  Chemistry: 0.55,
  English: 0.88,
};

/**
 * Twelve past attempts spread over the last fortnight, including today and
 * yesterday so the streak counter has something to show. Every attempt points
 * at real questions, so opening its solutions works exactly as a fresh one does.
 */
function buildSeedAttempts(): TestAttempt[] {
  const random = makeRandom(20240215);
  const attempts: TestAttempt[] = [];
  const freeTests = seedTests.filter((test) => !test.locked);

  // Day offsets from today - two on day 0 and one yesterday keep a streak alive.
  // Enough of them that individual tests are attempted more than once, which is
  // what makes a per-question miss rate meaningful.
  const dayOffsets = [0, 0, 1, 1, 2, 3, 4, 5, 6, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  // Walk the subjects in rotation so every ring on the analytics screen has a
  // reading; cycling the flat list would have left the last subject at zero.
  const bySubject = new Map<Subject, Test[]>();
  freeTests.forEach((test) => {
    bySubject.set(test.subject, [...(bySubject.get(test.subject) ?? []), test]);
  });
  const subjects = [...bySubject.keys()];

  dayOffsets.forEach((dayOffset, index) => {
    const subject = subjects[index % subjects.length]!;
    // Draw from the first two chapters of each subject so attempts overlap.
    const pool = bySubject.get(subject)!.slice(0, 2);
    const test = pool[Math.floor(index / subjects.length) % pool.length]!;
    const questions = seedQuestions
      .filter((question) => question.testId === test.id)
      .sort((a, b) => a.order - b.order);
    if (questions.length === 0) return;

    const skill = SUBJECT_SKILL[test.subject];
    const completedAt = now - dayOffset * DAY - Math.floor(random() * 6) * 60 * 60 * 1000;

    const answers: AttemptAnswer[] = questions.map((question) => {
      const roll = random();
      // Harder questions are missed more often; a few run out of time entirely.
      const penalty = question.difficulty === 'Hard' ? 0.22 : question.difficulty === 'Medium' ? 0.1 : 0;
      const skipped = roll > 0.94;
      const correct = !skipped && roll < skill - penalty;
      const wrongIndex = (question.correctIndex + 1) % question.options.length;
      return {
        questionId: question.id,
        selectedIndex: skipped ? null : correct ? question.correctIndex : wrongIndex,
        correct,
        secondsTaken: 4 + Math.floor(random() * 11),
        difficulty: question.difficulty,
        bookmarked: random() > 0.85,
      };
    });

    const secondsTaken = answers.reduce((total, answer) => total + answer.secondsTaken, 0);
    attempts.push({
      id: `seed_attempt_${index}`,
      testId: test.id,
      testTitle: test.title,
      subject: test.subject,
      userId: SEED_HISTORY_USER,
      answers,
      correct: answers.filter((answer) => answer.correct).length,
      incorrect: answers.filter((answer) => answer.selectedIndex !== null && !answer.correct).length,
      unanswered: answers.filter((answer) => answer.selectedIndex === null).length,
      bookmarks: answers.filter((answer) => answer.bookmarked).length,
      secondsTaken,
      startedAt: completedAt - secondsTaken * 1000,
      completedAt,
    });
  });

  return attempts;
}

/** Placeholder owner for seeded history, swapped for the real id at sign-in. */
const SEED_HISTORY_USER = 'seed_history_owner';

const seedAttempts: TestAttempt[] = buildSeedAttempts();

const seedDoubts: Doubt[] = [
  {
    id: 'seed_doubt_1',
    userId: SEED_HISTORY_USER,
    userName: 'Ahmed Khan',
    subject: 'Maths',
    question:
      'In the sequences test, why does the sum first become zero at n = 10 and not n = 9? I keep getting 9 from the formula.',
    imageUrl: '',
    status: 'answered',
    answer:
      'Your formula work is right - S(n) = 0 solves to n = 9 for the bracket. The extra term is the one that brings the running total back to zero, so the count of terms is 10. Try writing the partial sums out to n = 10 and you will see it.',
    createdAt: now - 5 * DAY,
    answeredAt: now - 5 * DAY + 3 * 60 * 60 * 1000,
  },
  {
    id: 'seed_doubt_2',
    userId: SEED_HISTORY_USER,
    userName: 'Ahmed Khan',
    subject: 'Chemistry',
    question:
      'How do I know whether CO2 is polar? Both bonds are polar so I assumed the molecule is too.',
    imageUrl: '',
    status: 'answered',
    answer:
      'Bond polarity and molecular polarity are different things. CO2 is linear, so the two bond dipoles point in exactly opposite directions and cancel. Draw the shape first, then add the arrows - if they cancel, the molecule is non-polar.',
    createdAt: now - 2 * DAY,
    answeredAt: now - 2 * DAY + 5 * 60 * 60 * 1000,
  },
  {
    id: 'seed_doubt_3',
    userId: SEED_HISTORY_USER,
    userName: 'Ahmed Khan',
    subject: 'Physics',
    question:
      'For the photoelectric question, why does more intensity not give the electrons more energy? It feels like more light should mean more energy.',
    imageUrl: '',
    status: 'open',
    answer: '',
    createdAt: now - 6 * 60 * 60 * 1000,
    answeredAt: 0,
  },
];

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
  attempts: TestAttempt[] = [...seedAttempts];
  doubts: Doubt[] = [...seedDoubts];

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

  /**
   * Demo mode has no persistent accounts, so the seeded history is handed to
   * whoever signs in. Without this the analytics and doubt screens would look
   * empty on a first run, which is the opposite of what a demo should show.
   */
  attachDemoHistory(userId: string): void {
    let changed = false;
    this.attempts = this.attempts.map((attempt) => {
      if (attempt.userId !== SEED_HISTORY_USER) return attempt;
      changed = true;
      return { ...attempt, userId };
    });
    this.doubts = this.doubts.map((doubt) => {
      if (doubt.userId !== SEED_HISTORY_USER) return doubt;
      changed = true;
      return { ...doubt, userId };
    });
    if (changed) this.emit();
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

  answerDoubt(doubtId: string, answer: string): void {
    this.doubts = this.doubts.map((doubt) =>
      doubt.id === doubtId
        ? { ...doubt, answer, status: 'answered' as const, answeredAt: Date.now() }
        : doubt,
    );
    this.emit();
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
