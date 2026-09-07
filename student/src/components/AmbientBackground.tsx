/**
 * The soft colour fields and dot grid behind the whole app.
 *
 * One fixed, pointer-events-none layer painted with CSS gradients rather than a
 * stack of blurred elements - blurring several large nodes is what makes this
 * pattern expensive on phones, and gradients cost nothing to composite.
 */
export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="ambient-fields absolute inset-0" />
      <div className="ambient-dots absolute inset-0" />
    </div>
  );
}
