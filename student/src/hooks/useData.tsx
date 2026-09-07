import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { addDoc, collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db, isDemoMode } from '../firebase';
import { demoStore } from '../lib/demoStore';
import { cacheLesson, cachedLessons } from '../lib/offline';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import type {
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

interface DataContextValue {
  /** Published courses only - students never see drafts. */
  courses: Course[];
  lessons: Lesson[];
  progress: LessonProgress[];
  exams: Exam[];
  universities: University[];
  packages: Package[];
  tests: Test[];
  liveClasses: LiveClass[];
  attempts: TestAttempt[];
  doubts: Doubt[];
  loading: boolean;
  live: boolean;
  lessonsOf: (courseId: string) => Lesson[];
  questionsOf: (testId: string) => Question[];
  isCompleted: (lessonId: string) => boolean;
  completedCount: (courseId: string) => number;
  markComplete: (courseId: string, lessonId: string) => Promise<void>;
  submitAttempt: (test: Test, answers: AttemptAnswer[], startedAt: number) => Promise<TestAttempt>;
  askDoubt: (subject: Subject, question: string, imageUrl: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

function sortLessons(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  /** Ids already seen, so only genuinely new content raises a toast. */
  const seenLessons = useRef<Set<string> | null>(null);
  const seenCourses = useRef<Set<string> | null>(null);

  const announce = useCallback(
    (nextLessons: Lesson[], nextCourses: Course[]) => {
      if (seenLessons.current === null) {
        // The first snapshot after mount is the baseline, not news.
        seenLessons.current = new Set(nextLessons.map((lesson) => lesson.id));
        seenCourses.current = new Set(nextCourses.map((course) => course.id));
        return;
      }
      const freshCourse = nextCourses.find((course) => !seenCourses.current!.has(course.id));
      const freshLesson = nextLessons.find((lesson) => !seenLessons.current!.has(lesson.id));
      if (freshCourse) toast(`New course: ${freshCourse.title}`, 'info');
      else if (freshLesson) toast('New lesson available', 'info');
      seenLessons.current = new Set(nextLessons.map((lesson) => lesson.id));
      seenCourses.current = new Set(nextCourses.map((course) => course.id));
    },
    [toast],
  );

  // --- catalogue + content -------------------------------------------------
  useEffect(() => {
    if (isDemoMode) {
      const pull = () => {
        const nextCourses = demoStore.courses.filter((course) => course.published);
        const nextLessons = sortLessons(demoStore.lessons);
        setCourses(nextCourses);
        setLessons(nextLessons);
        setTests([...demoStore.tests]);
        setQuestions([...demoStore.questions]);
        setLiveClasses([...demoStore.liveClasses]);
        setExams([...demoStore.exams]);
        setUniversities([...demoStore.universities]);
        setPackages([...demoStore.packages]);
        announce(nextLessons, nextCourses);
      };
      pull();
      setLoading(false);
      setLive(true);
      const stop = demoStore.subscribe(pull);
      return () => {
        stop();
        setLive(false);
      };
    }

    let latestCourses: Course[] = [];
    let latestLessons: Lesson[] = [];

    const collections: [string, (docs: Record<string, unknown>[]) => void][] = [
      ['tests', (docs) => setTests(docs as unknown as Test[])],
      ['questions', (docs) => setQuestions(docs as unknown as Question[])],
      ['liveClasses', (docs) => setLiveClasses(docs as unknown as LiveClass[])],
      ['exams', (docs) => setExams(docs as unknown as Exam[])],
      ['universities', (docs) => setUniversities(docs as unknown as University[])],
      ['packages', (docs) => setPackages(docs as unknown as Package[])],
    ];

    const stops = collections.map(([name, apply]) =>
      onSnapshot(
        collection(db, name),
        (snapshot) => apply(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        () => undefined,
      ),
    );

    const stopCourses = onSnapshot(
      query(collection(db, 'courses'), where('published', '==', true)),
      (snapshot) => {
        latestCourses = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Course);
        setCourses(latestCourses);
        setLive(true);
        setLoading(false);
        announce(latestLessons, latestCourses);
      },
      () => setLoading(false),
    );

    const stopLessons = onSnapshot(
      collection(db, 'lessons'),
      (snapshot) => {
        latestLessons = sortLessons(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Lesson),
        );
        setLessons(latestLessons);
        announce(latestLessons, latestCourses);
      },
      () => undefined,
    );

    return () => {
      stops.forEach((stop) => stop());
      stopCourses();
      stopLessons();
      setLive(false);
    };
  }, [announce]);

  // Offline fallback: if the network is gone, read what we cached last time.
  useEffect(() => {
    if (lessons.length === 0 && !navigator.onLine) {
      const cached = cachedLessons();
      if (cached.length > 0) setLessons(sortLessons(cached));
    }
  }, [lessons.length]);

  // --- everything scoped to the signed-in student --------------------------
  useEffect(() => {
    if (!user) {
      setProgress([]);
      setAttempts([]);
      setDoubts([]);
      return;
    }
    if (isDemoMode) {
      const pull = () => {
        setProgress(demoStore.progress.filter((item) => item.userId === user.id));
        setAttempts(demoStore.attempts.filter((item) => item.userId === user.id));
        setDoubts(demoStore.doubts.filter((item) => item.userId === user.id));
      };
      pull();
      return demoStore.subscribe(pull);
    }

    const mine = (name: string, apply: (docs: Record<string, unknown>[]) => void) =>
      onSnapshot(
        query(collection(db, name), where('userId', '==', user.id)),
        (snapshot) => apply(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        () => undefined,
      );

    const stops = [
      mine('lessonProgress', (docs) => setProgress(docs as unknown as LessonProgress[])),
      mine('testAttempts', (docs) => setAttempts(docs as unknown as TestAttempt[])),
      mine('doubts', (docs) => setDoubts(docs as unknown as Doubt[])),
    ];
    return () => stops.forEach((stop) => stop());
  }, [user]);

  const publishedIds = useMemo(() => new Set(courses.map((course) => course.id)), [courses]);

  const lessonsOf = useCallback(
    (courseId: string) => lessons.filter((lesson) => lesson.courseId === courseId),
    [lessons],
  );

  const questionsOf = useCallback(
    (testId: string) =>
      questions.filter((question) => question.testId === testId).sort((a, b) => a.order - b.order),
    [questions],
  );

  const completedLessonIds = useMemo(
    () => new Set(progress.filter((item) => item.completed).map((item) => item.lessonId)),
    [progress],
  );

  const isCompleted = useCallback(
    (lessonId: string) => completedLessonIds.has(lessonId),
    [completedLessonIds],
  );

  const completedCount = useCallback(
    (courseId: string) =>
      lessons.filter((lesson) => lesson.courseId === courseId && completedLessonIds.has(lesson.id))
        .length,
    [lessons, completedLessonIds],
  );

  const markComplete = useCallback(
    async (courseId: string, lessonId: string) => {
      if (!user) return;
      const entry = {
        courseId,
        lessonId,
        userId: user.id,
        completed: true,
        completedAt: Date.now(),
      };
      // A deterministic id keeps one progress document per student and lesson.
      if (isDemoMode) {
        demoStore.setProgress(entry);
        return;
      }
      await setDoc(doc(db, 'lessonProgress', `${user.id}_${lessonId}`), entry);
    },
    [user],
  );

  const submitAttempt = useCallback(
    async (test: Test, answers: AttemptAnswer[], startedAt: number) => {
      if (!user) throw new Error('You must be signed in to submit a test.');
      const attempt: Omit<TestAttempt, 'id'> = {
        testId: test.id,
        testTitle: test.title,
        subject: test.subject,
        userId: user.id,
        answers,
        correct: answers.filter((answer) => answer.correct).length,
        incorrect: answers.filter((answer) => answer.selectedIndex !== null && !answer.correct)
          .length,
        unanswered: answers.filter((answer) => answer.selectedIndex === null).length,
        bookmarks: answers.filter((answer) => answer.bookmarked).length,
        secondsTaken: answers.reduce((total, answer) => total + answer.secondsTaken, 0),
        startedAt,
        completedAt: Date.now(),
      };
      if (isDemoMode) return demoStore.addAttempt(attempt);
      const created = await addDoc(collection(db, 'testAttempts'), attempt);
      return { ...attempt, id: created.id };
    },
    [user],
  );

  const askDoubt = useCallback(
    async (subject: Subject, question: string, imageUrl: string) => {
      if (!user) return;
      const doubt: Omit<Doubt, 'id'> = {
        userId: user.id,
        userName: user.name,
        subject,
        question,
        imageUrl,
        status: 'open',
        answer: '',
        createdAt: Date.now(),
        answeredAt: 0,
      };
      if (isDemoMode) {
        demoStore.addDoubt(doubt);
        return;
      }
      await addDoc(collection(db, 'doubts'), doubt);
    },
    [user],
  );

  // Keep the offline reading cache warm with everything currently published.
  useEffect(() => {
    lessons
      .filter((lesson) => publishedIds.has(lesson.courseId))
      .slice(0, 30)
      .forEach(cacheLesson);
  }, [lessons, publishedIds]);

  const value = useMemo<DataContextValue>(
    () => ({
      courses,
      lessons: lessons.filter((lesson) => publishedIds.has(lesson.courseId)),
      progress,
      exams,
      universities,
      packages,
      tests,
      liveClasses,
      attempts,
      doubts,
      loading,
      live,
      lessonsOf,
      questionsOf,
      isCompleted,
      completedCount,
      markComplete,
      submitAttempt,
      askDoubt,
    }),
    [
      courses,
      lessons,
      publishedIds,
      progress,
      exams,
      universities,
      packages,
      tests,
      liveClasses,
      attempts,
      doubts,
      loading,
      live,
      lessonsOf,
      questionsOf,
      isCompleted,
      completedCount,
      markComplete,
      submitAttempt,
      askDoubt,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used inside <DataProvider>');
  return context;
}
