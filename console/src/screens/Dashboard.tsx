import type { ReactNode } from 'react';
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Layers,
  MessageCircleQuestion,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { EmptyState, SkeletonList } from '../components/ui';
import { toneOf, toneOfSubject } from '../lib/theme';
import { timeAgo } from '../lib/format';

interface Props {
  onOpenCourse: (courseId: string) => void;
  onNewCourse: () => void;
  onGoToCourses: () => void;
  onGoToDoubts: () => void;
  onGoToTests: () => void;
}

function StatCard({
  icon,
  label,
  value,
  fill,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  fill: string;
  hint?: string;
}) {
  return (
    <div className="card card-hover p-4">
      <div className="flex items-start justify-between gap-2">
        <span className={`${fill} flex h-10 w-10 items-center justify-center rounded-xl`}>
          {icon}
        </span>
        {hint && <span className="chip-neutral">{hint}</span>}
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[13px] text-subtle">{label}</p>
    </div>
  );
}

export default function Dashboard({
  onOpenCourse,
  onNewCourse,
  onGoToCourses,
  onGoToDoubts,
  onGoToTests,
}: Props) {
  const { user } = useAuth();
  const { courses, lessons, users, tests, questions, attempts, doubts, loading } = useData();

  const isAdmin = user?.role === 'admin';
  // Admins see the whole school; teachers see the courses they own.
  const myCourses = isAdmin ? courses : courses.filter((course) => course.teacherId === user?.id);
  const myCourseIds = new Set(myCourses.map((course) => course.id));
  const myLessons = lessons.filter((lesson) => myCourseIds.has(lesson.courseId));
  const published = myCourses.filter((course) => course.published).length;
  const students = users.filter((item) => item.role === 'student').length;
  const openDoubts = doubts.filter((doubt) => doubt.status === 'open');
  const liveTests = tests.filter((test) => !test.locked).length;

  const answered = attempts.reduce((total, attempt) => total + attempt.answers.length, 0);
  const correct = attempts.reduce((total, attempt) => total + attempt.correct, 0);
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <header className="ambient-fields relative overflow-hidden rounded-2xl border border-line p-6">
        <div className="ambient-dots absolute inset-0" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[13px] text-muted">
              <span className="chip-brand capitalize">{user?.role}</span>
              {isAdmin ? 'Whole school' : 'Your courses'}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Hi {user?.name?.split(' ')[0] ?? 'there'}
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              {published} of {myCourses.length} course{myCourses.length === 1 ? '' : 's'} live ·{' '}
              {liveTests} test{liveTests === 1 ? '' : 's'} open to students
              {openDoubts.length > 0 && ` · ${openDoubts.length} doubt${openDoubts.length === 1 ? '' : 's'} waiting`}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary btn-sm" onClick={onGoToTests}>
              <ClipboardList className="h-3.5 w-3.5" /> Test bank
            </button>
            <button type="button" className="btn-primary btn-sm" onClick={onNewCourse}>
              <Plus className="h-3.5 w-3.5" /> New course
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-4 w-4" />}
          fill="fill-brand"
          label="My courses"
          value={String(myCourses.length)}
          hint={published > 0 ? `${published} live` : undefined}
        />
        <StatCard
          icon={<Layers className="h-4 w-4" />}
          fill="fill-sky"
          label="Lessons written"
          value={String(myLessons.length)}
        />
        <StatCard
          icon={<ClipboardList className="h-4 w-4" />}
          fill="fill-amber"
          label="Questions in the bank"
          value={String(questions.length)}
          hint={`${tests.length} tests`}
        />
        <StatCard
          icon={<GraduationCap className="h-4 w-4" />}
          fill="fill-rose"
          label="Students enrolled"
          value={String(students)}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Doubts waiting */}
        <section className="card p-5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Doubts waiting</h2>
            {openDoubts.length > 0 && (
              <span className="chip bg-warning-soft text-warning">{openDoubts.length}</span>
            )}
            <button
              type="button"
              className="btn-quiet btn-sm ml-auto -mr-2"
              onClick={onGoToDoubts}
            >
              Open inbox <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {openDoubts.length === 0 ? (
            <p className="mt-3 text-[13px] text-subtle">
              Nothing waiting. New questions from students appear here.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {openDoubts.slice(0, 3).map((doubt) => (
                <li key={doubt.id} className={`${toneOfSubject(doubt.subject)} flex gap-3`}>
                  <span className="tone-soft mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-2xs font-bold">
                    {doubt.subject[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[13px]">{doubt.question}</span>
                    <span className="mt-0.5 block text-2xs text-subtle">
                      {doubt.userName} · {timeAgo(doubt.createdAt)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Student performance */}
        <section className="card p-5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Student performance</h2>
            <span className="chip-neutral ml-auto">
              {attempts.length} attempt{attempts.length === 1 ? '' : 's'}
            </span>
          </div>

          {attempts.length === 0 ? (
            <p className="mt-3 text-[13px] text-subtle">
              No attempts yet. Publish a test and results appear here.
            </p>
          ) : (
            <>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular-nums">{accuracy}%</span>
                <span className="text-[13px] text-subtle">average accuracy</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${accuracy}%`, backgroundImage: 'var(--grad-brand)' }}
                />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[13px] text-subtle">
                <TrendingUp className="h-3.5 w-3.5" />
                {correct} of {answered} questions answered correctly
              </p>
            </>
          )}
        </section>
      </div>

      {/* Recently edited */}
      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-[13px] font-medium text-muted">Recently edited</h2>
          <button type="button" className="btn-quiet btn-sm ml-auto -mr-2" onClick={onGoToCourses}>
            All courses <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading ? (
          <SkeletonList rows={3} />
        ) : myCourses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-4 w-4" />}
            title="No courses yet"
            description="Create your first course to get started."
            action={
              <button type="button" className="btn-primary btn-sm" onClick={onNewCourse}>
                <Plus className="h-3.5 w-3.5" /> New course
              </button>
            }
          />
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {myCourses.slice(0, 5).map((course) => (
              <li key={course.id}>
                <button
                  type="button"
                  onClick={() => onOpenCourse(course.id)}
                  className={`${toneOf(course.colorTheme)} flex w-full items-center gap-3 bg-surface px-4 py-3 text-left transition-colors hover:bg-surface-2`}
                >
                  <span className="tone-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base">
                    {course.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{course.title}</span>
                    <span className="block text-[13px] text-subtle">
                      {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'} · edited{' '}
                      {timeAgo(course.updatedAt)}
                    </span>
                  </span>
                  <span
                    className={`chip ${
                      course.published ? 'bg-success-soft text-success' : 'chip-neutral'
                    }`}
                  >
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Teacher scope note */}
      {!isAdmin && (
        <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[13px] text-muted">
          <MessageCircleQuestion className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          You are signed in as a teacher, so course figures cover the courses you own. The test
          bank, doubts inbox and insights are shared across the teaching team.
        </p>
      )}
    </div>
  );
}
