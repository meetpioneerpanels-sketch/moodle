import { Bell, ChevronRight, FileQuestion, MessageCircleQuestion, PlayCircle, Share2, Target, Video } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { Avatar, LiveDot, ThemeToggle } from '../components/ui';
import type { ReactNode } from 'react';

interface Props {
  onOpen: (destination: 'live' | 'recorded' | 'practice' | 'doubt' | 'demo' | 'sample') => void;
}

function QuickAction({
  icon,
  label,
  fill,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  /** One of the gradient fill classes: fill-sky, fill-amber, fill-rose. */
  fill: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col items-center gap-2 transition-transform active:scale-95"
    >
      <span
        className={`${fill} flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 group-hover:-translate-y-0.5`}
      >
        {icon}
      </span>
      <span className="text-center text-2xs font-medium leading-tight text-muted">{label}</span>
    </button>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  badge,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card card-hover flex w-full items-center gap-3.5 p-4 text-left"
    >
      <span className="relief relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-muted">
        {icon}
        {badge && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
            {badge}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        {subtitle && <span className="block text-2xs text-subtle">{subtitle}</span>}
        <span className="block truncate text-sm font-semibold">{title}</span>
      </span>
      <span className="icon-btn fill-brand">
        <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
      </span>
    </button>
  );
}

export default function Home({ onOpen }: Props) {
  const { user } = useAuth();
  const { live, exams, universities, liveClasses, tests, attempts } = useData();

  const exam = exams.find((item) => item.id === user?.examId);
  const targets = universities.filter((university) =>
    (user?.universityIds ?? []).includes(university.id),
  );
  const upcoming = liveClasses.filter((item) => item.mode === 'live').length;
  const unlockedTests = tests.filter((test) => !test.locked).length;

  return (
    <div className="space-y-6 px-4 pb-6 pt-3">
      <header className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">Hi {user?.name?.split(' ')[0] ?? 'there'}</p>
          <p className="mt-0.5 flex items-center gap-2 text-2xs text-subtle">
            <span className="truncate">
              {exam?.name ?? 'ECAT'}
              {targets.length > 0 && ` · ${targets.map((item) => item.name).join(', ')}`}
            </span>
            <LiveDot live={live} />
          </p>
        </div>
        <ThemeToggle />
        <button
          type="button"
          aria-label="Notifications"
          className="icon-btn relief-press relative bg-surface text-muted"
        >
          <Bell className="h-4 w-4" />
          {attempts.length === 0 && (
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand" />
          )}
        </button>
        <Avatar name={user?.name ?? 'Student'} />
      </header>

      <section className="grid grid-cols-3 gap-3">
        <QuickAction
          icon={<PlayCircle className="h-6 w-6" />}
          label="Register for Demo Class"
          fill="fill-sky"
          onClick={() => onOpen('demo')}
        />
        <QuickAction
          icon={<FileQuestion className="h-6 w-6" />}
          label="Solve free Sample Questions"
          fill="fill-amber"
          onClick={() => onOpen('sample')}
        />
        <QuickAction
          icon={<MessageCircleQuestion className="h-6 w-6" />}
          label="Ask your Doubt"
          fill="fill-rose"
          onClick={() => onOpen('doubt')}
        />
      </section>

      <section className="space-y-3">
        <ActionRow
          icon={<Video className="h-5 w-5" />}
          subtitle="Register for"
          title="Live Classes"
          badge={upcoming > 0 ? String(upcoming) : undefined}
          onClick={() => onOpen('live')}
        />
        <ActionRow
          icon={<PlayCircle className="h-5 w-5" />}
          subtitle="Register for"
          title="Recorded Course"
          onClick={() => onOpen('recorded')}
        />
        <ActionRow
          icon={<Target className="h-5 w-5" />}
          title="Practice Zone"
          subtitle={`${unlockedTests} tests unlocked`}
          onClick={() => onOpen('practice')}
        />
        <ActionRow
          icon={<Share2 className="h-5 w-5" />}
          title="Share with Friends"
          subtitle="Help your friends fall in love with learning"
          onClick={async () => {
            const text = 'I am preparing for my entry test with EduHub - join me!';
            try {
              if (navigator.share) await navigator.share({ title: 'EduHub', text });
              else await navigator.clipboard.writeText(text);
            } catch {
              // The user dismissed the share sheet - nothing to do.
            }
          }}
        />
      </section>
    </div>
  );
}
