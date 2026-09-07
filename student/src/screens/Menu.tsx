import { BookOpen, ChevronRight, LogOut, Package as PackageIcon, School, Smartphone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useInstallPrompt } from '../hooks/usePwa';
import { Avatar, ThemePicker } from '../components/ui';
import { isDemoMode } from '../firebase';

interface Props {
  onOpenCourses: () => void;
  onChangePackage: () => void;
  onChangeUniversities: () => void;
}

export default function Menu({ onOpenCourses, onChangePackage, onChangeUniversities }: Props) {
  const { user, signOut } = useAuth();
  const { packages, universities, exams, attempts, progress } = useData();
  const { canInstall, install } = useInstallPrompt();

  const currentPackage = packages.find((item) => item.id === user?.packageId);
  const exam = exams.find((item) => item.id === user?.examId);
  const targets = universities.filter((university) =>
    (user?.universityIds ?? []).includes(university.id),
  );
  const lessonsDone = progress.filter((item) => item.completed).length;

  const rows = [
    {
      icon: <School className="h-4 w-4" />,
      label: 'Exam & universities',
      value: targets.length > 0 ? targets.map((item) => item.name).join(', ') : 'Not set',
      onClick: onChangeUniversities,
    },
    {
      icon: <PackageIcon className="h-4 w-4" />,
      label: 'Package',
      value: currentPackage ? `${currentPackage.name} · ${currentPackage.currency} ${currentPackage.price.toLocaleString()}` : 'None',
      onClick: onChangePackage,
    },
    {
      icon: <BookOpen className="h-4 w-4" />,
      label: 'Course library',
      value: `${lessonsDone} lessons completed`,
      onClick: onOpenCourses,
    },
  ];

  return (
    <div className="space-y-4 px-4 pb-6 pt-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <Avatar name={user?.name ?? 'Student'} size="lg" />
        <div>
          <h1 className="text-lg font-semibold">{user?.name}</h1>
          <p className="text-[13px] text-subtle">{user?.email}</p>
          {exam && <span className="chip-brand mt-2">{exam.name}</span>}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-[13px] text-subtle">Tests attempted</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{attempts.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[13px] text-subtle">Lessons done</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{lessonsDone}</p>
        </div>
      </section>

      <section className="divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-card">
        {rows.map((row) => (
          <button
            key={row.label}
            type="button"
            onClick={row.onClick}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-surface-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-muted">
              {row.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{row.label}</span>
              <span className="block truncate text-2xs text-subtle">{row.value}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-subtle" />
          </button>
        ))}
      </section>

      {canInstall && (
        <button type="button" className="btn-secondary w-full" onClick={install}>
          <Smartphone className="h-4 w-4" /> Install app
        </button>
      )}

      <section className="card p-4">
        <h2 className="text-sm font-semibold">Appearance</h2>
        <div className="mt-3">
          <ThemePicker />
        </div>
      </section>

      <section className="card p-4">
        <h2 className="text-sm font-semibold">Connection</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          {isDemoMode
            ? 'Demo mode - sample content, nothing is saved. Paste your Firebase config in src/firebase.ts for live sync.'
            : 'Live - your courses, tests and progress sync with your school in real time.'}
        </p>
      </section>

      <button type="button" className="btn-secondary w-full text-danger" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
