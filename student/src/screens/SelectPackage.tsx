import { Check, X } from 'lucide-react';
import { useData } from '../hooks/useData';
import { ScreenHeader, Stepper } from '../components/ui';

interface Props {
  selectedPackage: string | null;
  onSelect: (packageId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function SelectPackage({ selectedPackage, onSelect, onBack, onNext }: Props) {
  const { packages } = useData();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <div className="px-4 pt-safe">
        <div className="pt-3">
          <Stepper steps={4} current={2} />
        </div>
      </div>

      <ScreenHeader title="Select Package" onBack={onBack} />

      <div className="flex-1 px-4 pb-32">
        <div className="grid grid-cols-2 gap-3">
          {packages.map((item) => {
            const active = selectedPackage === item.id;
            return (
              <article
                key={item.id}
                className={`flex flex-col rounded-2xl border-2 bg-surface p-4 shadow-card transition-colors ${
                  active ? 'border-brand' : 'border-transparent'
                }`}
              >
                <span
                  className={`mx-auto rounded-lg border px-3 py-1 text-[13px] font-semibold ${
                    active ? 'border-brand text-brand' : 'border-line text-muted'
                  }`}
                >
                  {item.name}
                </span>
                <p className="mt-3 text-center text-lg font-semibold">
                  {item.currency} {item.price.toLocaleString()}
                </p>

                <ul className="mt-4 flex-1 space-y-2">
                  {item.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-1.5">
                      <span
                        className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                          feature.included ? 'bg-success/15 text-success' : 'bg-surface-3 text-subtle'
                        }`}
                      >
                        {feature.included ? (
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        ) : (
                          <X className="h-2.5 w-2.5" strokeWidth={3} />
                        )}
                      </span>
                      <span
                        className={`text-[13px] leading-snug ${
                          feature.included ? 'text-muted' : 'text-subtle line-through'
                        }`}
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`mt-4 h-9 rounded-full text-[13px] font-semibold transition-colors ${
                    active
                      ? 'bg-sky text-white'
                      : 'border border-sky/40 bg-transparent text-sky'
                  }`}
                >
                  {active ? 'Selected' : 'Select'}
                </button>
              </article>
            );
          })}
        </div>

        <p className="mt-4 px-1 text-[13px] text-subtle">
          You can change your package later from the menu. Both plans include every past paper.
        </p>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-line bg-surface px-4 pb-safe pt-3">
        <button type="button" className="btn-primary w-full" disabled={!selectedPackage} onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
}
