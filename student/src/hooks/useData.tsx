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
import { collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db, isDemoMode } from '../firebase';
import { demoStore } from '../lib/demoStore';
import { cacheLesson, cachedLessons } from '../lib/offline';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import type { Course, Lesson, LessonProgress } from '../types';

interface DataContextValue {
  /** Published courses only - students never see drafts. */
  courses: Course[];
  lessons: Lesson[];
  progress: LessonProgress[];
  loading: boolean;
  live: boolean;
  lessonsOf: (courseId: string) => Lesson[];
  isCompleted: (lessonId: string) => boolean;
  completedCount: (courseId: string) => number;
  markComplete: (courseId: string, lessonId: string) => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  /** Lesson/course ids already seen, so only genuinely new content raises a toast. */
  const seenLessons = useRef<Set<string> | null>(null);
  const seenCourses = useRef<Set<string> | null>(null);

  const announce = useCallback(
    (nextLessons: Lesson[], nextCourses: Course[]) => {
      if (seenLessons.current === null) {
        // First snapshot after mount is the baseline, not news.
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

  // --- courses + lessons ---------------------------------------------------
  useEffect(() => {
    if (isDemoMode) {
      const pull = () => {
        const nextCourses = demoStore.courses.filter((course) => course.published);
        const nextLessons = sortLessons(demoStore.lessons);
        setCourses(nextCourses);
        setLessons(nextLessons);
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

  // --- progress for the signed-in student ----------------------------------
  useEffect(() => {
    if (!user) {
      setProgress([]);
      return;
    }
    if (isDemoMode) {
      const pull = () =>
        setProgress(demoStore.progress.filter((item) => item.userId === user.id));
      pull();
      return demoStore.subscribe(pull);
    }
    return onSnapshot(
      query(collection(db, 'lessonProgress'), where('userId', '==', user.id)),
      (snapshot) => {
        setProgress(
          snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as LessonProgress),
        );
      },
      () => undefined,
    );
  }, [user]);

  const publishedIds = useMemo(() => new Set(courses.map((course) => course.id)), [courses]);

  const lessonsOf = useCallback(
    (courseId: string) => lessons.filter((lesson) => lesson.courseId === courseId),
    [lessons],
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
      const progressId = `${user.id}_${lessonId}`;
      if (isDemoMode) {
        demoStore.setProgress(entry);
        return;
      }
      await setDoc(doc(db, 'lessonProgress', progressId), entry);
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
      loading,
      live,
      lessonsOf,
      isCompleted,
      completedCount,
      markComplete,
    }),
    [
      courses,
      lessons,
      publishedIds,
      progress,
      loading,
      live,
      lessonsOf,
      isCompleted,
      completedCount,
      markComplete,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used inside <DataProvider>');
  return context;
}
