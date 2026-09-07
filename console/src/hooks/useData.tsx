import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, isDemoMode } from '../firebase';
import { demoStore } from '../lib/demoStore';
import type {
  AppUser,
  Course,
  CourseDraft,
  Doubt,
  Lesson,
  LessonDraft,
  Question,
  QuestionDraft,
  Role,
  Test,
  TestAttempt,
  TestDraft,
  University,
} from '../types';

interface DataContextValue {
  courses: Course[];
  lessons: Lesson[];
  users: AppUser[];
  tests: Test[];
  questions: Question[];
  universities: University[];
  /** Every student's submitted attempts - the raw material for Insights. */
  attempts: TestAttempt[];
  doubts: Doubt[];
  loading: boolean;
  /** True while the realtime listeners are attached (drives the "Live" dot). */
  live: boolean;
  createCourse: (draft: CourseDraft, teacher: { id: string; name: string }) => Promise<string>;
  updateCourse: (courseId: string, patch: Partial<CourseDraft>) => Promise<void>;
  setPublished: (courseId: string, published: boolean) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  createLesson: (courseId: string, draft: LessonDraft) => Promise<void>;
  updateLesson: (lessonId: string, draft: LessonDraft) => Promise<void>;
  deleteLesson: (lessonId: string, courseId: string) => Promise<void>;
  moveLesson: (courseId: string, lessonId: string, direction: -1 | 1) => Promise<void>;
  setUserRole: (userId: string, role: Role) => Promise<void>;
  createTest: (draft: TestDraft) => Promise<string>;
  updateTest: (testId: string, patch: Partial<TestDraft>) => Promise<void>;
  deleteTest: (testId: string) => Promise<void>;
  questionsOf: (testId: string) => Question[];
  createQuestion: (testId: string, draft: QuestionDraft) => Promise<void>;
  updateQuestion: (questionId: string, draft: QuestionDraft) => Promise<void>;
  deleteQuestion: (questionId: string, testId: string) => Promise<void>;
  answerDoubt: (doubtId: string, answer: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

function sortCourses(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => b.updatedAt - a.updatedAt);
}

function sortLessons(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  // --- subscriptions -------------------------------------------------------
  useEffect(() => {
    if (isDemoMode) {
      const pull = () => {
        setCourses(sortCourses(demoStore.courses));
        setLessons(sortLessons(demoStore.lessons));
        setUsers([...demoStore.users]);
        setTests([...demoStore.tests]);
        setQuestions([...demoStore.questions]);
        setUniversities([...demoStore.universities]);
        setAttempts([...demoStore.attempts]);
        setDoubts([...demoStore.doubts]);
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

    let pending = 3;
    const settle = () => {
      pending -= 1;
      if (pending <= 0) setLoading(false);
    };

    const stopCourses = onSnapshot(collection(db, 'courses'), (snapshot) => {
      setCourses(
        sortCourses(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Course)),
      );
      setLive(true);
      settle();
    });
    const stopLessons = onSnapshot(collection(db, 'lessons'), (snapshot) => {
      setLessons(
        sortLessons(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Lesson)),
      );
      settle();
    });
    const stopUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as AppUser));
      settle();
    });

    const extras: [string, (docs: Record<string, unknown>[]) => void][] = [
      ['tests', (docs) => setTests(docs as unknown as Test[])],
      ['questions', (docs) => setQuestions(docs as unknown as Question[])],
      ['universities', (docs) => setUniversities(docs as unknown as University[])],
      ['testAttempts', (docs) => setAttempts(docs as unknown as TestAttempt[])],
      ['doubts', (docs) => setDoubts(docs as unknown as Doubt[])],
    ];
    const stopExtras = extras.map(([name, apply]) =>
      onSnapshot(
        collection(db, name),
        (snapshot) => apply(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        () => undefined,
      ),
    );

    return () => {
      stopCourses();
      stopLessons();
      stopUsers();
      stopExtras.forEach((stop) => stop());
      setLive(false);
    };
  }, []);

  // --- course mutations ----------------------------------------------------

  const createCourse = useCallback(
    async (draft: CourseDraft, teacher: { id: string; name: string }) => {
      const payload = {
        ...draft,
        teacherId: teacher.id,
        teacherName: teacher.name,
        published: false,
        lessonCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      if (isDemoMode) return demoStore.addCourse(payload);
      const created = await addDoc(collection(db, 'courses'), payload);
      return created.id;
    },
    [],
  );

  const updateCourse = useCallback(async (courseId: string, patch: Partial<CourseDraft>) => {
    if (isDemoMode) {
      demoStore.updateCourse(courseId, patch);
      return;
    }
    await updateDoc(doc(db, 'courses', courseId), { ...patch, updatedAt: Date.now() });
  }, []);

  const setPublished = useCallback(async (courseId: string, published: boolean) => {
    if (isDemoMode) {
      demoStore.updateCourse(courseId, { published });
      return;
    }
    await updateDoc(doc(db, 'courses', courseId), { published, updatedAt: Date.now() });
  }, []);

  const deleteCourse = useCallback(async (courseId: string) => {
    if (isDemoMode) {
      demoStore.deleteCourse(courseId);
      return;
    }
    const owned = await getDocs(query(collection(db, 'lessons'), where('courseId', '==', courseId)));
    const batch = writeBatch(db);
    owned.docs.forEach((item) => batch.delete(item.ref));
    batch.delete(doc(db, 'courses', courseId));
    await batch.commit();
  }, []);

  // --- lesson mutations ----------------------------------------------------

  const createLesson = useCallback(
    async (courseId: string, draft: LessonDraft) => {
      const siblings = (isDemoMode ? demoStore.lessons : lessons).filter(
        (lesson) => lesson.courseId === courseId,
      );
      const nextOrder = siblings.reduce((max, lesson) => Math.max(max, lesson.order), 0) + 1;
      const payload = { ...draft, courseId, order: nextOrder, createdAt: Date.now() };

      if (isDemoMode) {
        demoStore.addLesson(payload);
        return;
      }
      await addDoc(collection(db, 'lessons'), payload);
      await updateDoc(doc(db, 'courses', courseId), {
        lessonCount: siblings.length + 1,
        updatedAt: Date.now(),
      });
    },
    [lessons],
  );

  const updateLesson = useCallback(async (lessonId: string, draft: LessonDraft) => {
    if (isDemoMode) {
      demoStore.updateLesson(lessonId, draft);
      return;
    }
    await updateDoc(doc(db, 'lessons', lessonId), { ...draft });
  }, []);

  const deleteLesson = useCallback(
    async (lessonId: string, courseId: string) => {
      if (isDemoMode) {
        demoStore.deleteLesson(lessonId);
        return;
      }
      await deleteDoc(doc(db, 'lessons', lessonId));
      const remaining = lessons.filter(
        (lesson) => lesson.courseId === courseId && lesson.id !== lessonId,
      ).length;
      await updateDoc(doc(db, 'courses', courseId), {
        lessonCount: remaining,
        updatedAt: Date.now(),
      });
    },
    [lessons],
  );

  /** Swap a lesson with its neighbour and persist both "order" fields. */
  const moveLesson = useCallback(
    async (courseId: string, lessonId: string, direction: -1 | 1) => {
      const ordered = sortLessons(
        (isDemoMode ? demoStore.lessons : lessons).filter((lesson) => lesson.courseId === courseId),
      );
      const index = ordered.findIndex((lesson) => lesson.id === lessonId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= ordered.length) return;

      const current = ordered[index]!;
      const neighbour = ordered[target]!;

      if (isDemoMode) {
        demoStore.updateLesson(current.id, { order: neighbour.order });
        demoStore.updateLesson(neighbour.id, { order: current.order });
        return;
      }
      const batch = writeBatch(db);
      batch.update(doc(db, 'lessons', current.id), { order: neighbour.order });
      batch.update(doc(db, 'lessons', neighbour.id), { order: current.order });
      await batch.commit();
    },
    [lessons],
  );

  // --- test bank ------------------------------------------------------------

  const questionsOf = useCallback(
    (testId: string) =>
      questions.filter((question) => question.testId === testId).sort((a, b) => a.order - b.order),
    [questions],
  );

  const createTest = useCallback(async (draft: TestDraft) => {
    const payload = { ...draft, questionCount: 0, order: Date.now() };
    if (isDemoMode) return demoStore.addTest(payload);
    const created = await addDoc(collection(db, 'tests'), payload);
    return created.id;
  }, []);

  const updateTest = useCallback(async (testId: string, patch: Partial<TestDraft>) => {
    if (isDemoMode) {
      demoStore.updateTest(testId, patch);
      return;
    }
    await updateDoc(doc(db, 'tests', testId), { ...patch });
  }, []);

  const deleteTest = useCallback(async (testId: string) => {
    if (isDemoMode) {
      demoStore.deleteTest(testId);
      return;
    }
    const owned = await getDocs(query(collection(db, 'questions'), where('testId', '==', testId)));
    const batch = writeBatch(db);
    owned.docs.forEach((item) => batch.delete(item.ref));
    batch.delete(doc(db, 'tests', testId));
    await batch.commit();
  }, []);

  const createQuestion = useCallback(
    async (testId: string, draft: QuestionDraft) => {
      const siblings = (isDemoMode ? demoStore.questions : questions).filter(
        (question) => question.testId === testId,
      );
      const payload = { ...draft, testId, order: siblings.length };
      if (isDemoMode) {
        demoStore.addQuestion(payload);
        return;
      }
      await addDoc(collection(db, 'questions'), payload);
      await updateDoc(doc(db, 'tests', testId), { questionCount: siblings.length + 1 });
    },
    [questions],
  );

  const updateQuestion = useCallback(async (questionId: string, draft: QuestionDraft) => {
    if (isDemoMode) {
      demoStore.updateQuestion(questionId, draft);
      return;
    }
    await updateDoc(doc(db, 'questions', questionId), { ...draft });
  }, []);

  const deleteQuestion = useCallback(
    async (questionId: string, testId: string) => {
      if (isDemoMode) {
        demoStore.deleteQuestion(questionId);
        return;
      }
      await deleteDoc(doc(db, 'questions', questionId));
      const remaining = questions.filter(
        (question) => question.testId === testId && question.id !== questionId,
      ).length;
      await updateDoc(doc(db, 'tests', testId), { questionCount: remaining });
    },
    [questions],
  );

  const answerDoubt = useCallback(async (doubtId: string, answer: string) => {
    const patch = { answer, status: 'answered' as const, answeredAt: Date.now() };
    if (isDemoMode) {
      demoStore.answerDoubt(doubtId, answer);
      return;
    }
    await updateDoc(doc(db, 'doubts', doubtId), patch);
  }, []);

  const setUserRole = useCallback(async (userId: string, role: Role) => {
    if (isDemoMode) {
      demoStore.setUserRole(userId, role);
      return;
    }
    await updateDoc(doc(db, 'users', userId), { role });
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      courses,
      lessons,
      users,
      tests,
      questions,
      universities,
      attempts,
      doubts,
      loading,
      live,
      createCourse,
      updateCourse,
      setPublished,
      deleteCourse,
      createLesson,
      updateLesson,
      deleteLesson,
      moveLesson,
      setUserRole,
      createTest,
      updateTest,
      deleteTest,
      questionsOf,
      createQuestion,
      updateQuestion,
      deleteQuestion,
      answerDoubt,
    }),
    [
      courses,
      lessons,
      users,
      tests,
      questions,
      universities,
      attempts,
      doubts,
      loading,
      live,
      createCourse,
      updateCourse,
      setPublished,
      deleteCourse,
      createLesson,
      updateLesson,
      deleteLesson,
      moveLesson,
      setUserRole,
      createTest,
      updateTest,
      deleteTest,
      questionsOf,
      createQuestion,
      updateQuestion,
      deleteQuestion,
      answerDoubt,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used inside <DataProvider>');
  return context;
}
