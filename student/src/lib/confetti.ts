const COLORS = ['#58CC02', '#1CB0F6', '#FF9600', '#FFC800', '#CE82FF', '#FF86D0'];

/**
 * Lightweight DOM confetti burst - no dependency, self-cleaning.
 * Origin defaults to the centre of the viewport.
 */
export function burstConfetti(origin?: { x: number; y: number }, pieces = 40): void {
  if (typeof document === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 3;

  const layer = document.createElement('div');
  layer.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(layer);

  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement('span');
    const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.4;
    const distance = 90 + Math.random() * 190;
    const size = 6 + Math.random() * 8;
    piece.style.cssText = [
      'position:absolute',
      `left:${x}px`,
      `top:${y}px`,
      `width:${size}px`,
      `height:${size * (Math.random() > 0.5 ? 1 : 1.8)}px`,
      `background:${COLORS[i % COLORS.length]}`,
      `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
      'opacity:1',
    ].join(';');
    layer.appendChild(piece);

    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance + 160;
    piece
      .animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(${dx}px, ${dy}px) rotate(${Math.random() * 720 - 360}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 900 + Math.random() * 600,
          easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
          fill: 'forwards',
        },
      )
      .finished.catch(() => undefined);
  }

  window.setTimeout(() => layer.remove(), 1800);
}
