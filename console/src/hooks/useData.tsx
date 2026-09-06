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
import type { AppUser, Course, CourseDraft, Lesson, LessonDraft, Role } from '../types';

interface DataContextValue {
  courses: Course[];
  lessons: Lesson[];
  users: AppUser[];
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
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  // --- subscriptions -------------------------------------------------------
  useEffect(() => {
    if (isDemoMode) {
      const pull = () => {
        setCourses(sortCourses(demoStore.courses));
        setLessons(sortLessons(demoStore.lessons));
        setUsers([...demoStore.users]);
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

    return () => {
      stopCourses();
      stopLessons();
      stopUsers();
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
    }),
    [
      courses,
      lessons,
      users,
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
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used inside <DataProvider>');
  return context;
}
