import { Calendar, Check, Users, Video } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { EmptyState, ScreenHeader } from '../components/ui';
import { formatDate } from '../lib/format';
import { toneOf } from '../lib/theme';

interface Props {
  mode: 'live' | 'recorded';
  onBack: () => void;
}

export default function LiveClasses({ mode, onBack }: Props) {
  const { liveClasses, universities } = useData();
  const { toast } = useToast();

  const visible = liveClasses.filter((item) => item.mode === mode);
  const title = mode === 'live' ? 'Live Classes' : 'Recorded Courses';

  return (
    <div className="min-h-[100dvh] bg-canvas pb-8">
      <ScreenHeader title={title} onBack={onBack} />

      <div className="space-y-4 px-4">
        {visible.length === 0 ? (
          <EmptyState
            icon={<Video className="h-5 w-5" />}
            title={`No ${mode} courses yet`}
            description="Check back soon - new cohorts open every month."
          />
        ) : (
          visible.map((item) => {
            const university = universities.find((entry) => entry.id === item.universityId);
            const seatsLeft = item.seats - item.seatsTaken;
            return (
              <article key={item.id} className={`${toneOf(university?.colorTheme)} card p-4`}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface-2 p-3">
                    <p className="flex items-center gap-1.5 text-2xs text-subtle">
                      <Calendar className="h-3.5 w-3.5" /> Start Date
                    </p>
                    <p className="mt-1 text-[13px] font-semibold">{formatDate(item.startDate)}</p>
                  </div>
                  <div className="rounded-xl bg-surface-2 p-3">
                    <p className="flex items-center gap-1.5 text-2xs text-subtle">
                      <Calendar className="h-3.5 w-3.5" /> End Date
                    </p>
                    <p className="mt-1 text-[13px] font-semibold">{formatDate(item.endDate)}</p>
                  </div>
                </div>

                <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
                {university && (
                  <span className="chip tone-soft mt-1">{university.fullName}</span>
                )}

                <h3 className="mt-4 text-sm font-semibold">What is Included?</h3>
                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                  {item.includes.map((feature) => (
                    <li key={feature} className="flex items-start gap-1.5 text-[13px] text-muted">
                      <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {mode === 'live' && (
                  <p className="mt-4 flex items-center gap-1.5 text-2xs text-subtle">
                    <Users className="h-3.5 w-3.5" />
                    {seatsLeft > 0 ? `${seatsLeft} of ${item.seats} seats left` : 'Waitlist only'}
                  </p>
                )}

                <button
                  type="button"
                  className="btn-primary mt-4 w-full"
                  onClick={() => toast(`Registered for ${item.title}`)}
                >
                  {mode === 'live' ? 'Register now' : 'Start watching'}
                </button>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
