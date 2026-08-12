/**
 * Identity mark: a 3-link arm reduced to its joint centres and links, drawn on
 * the same grid the site uses behind hero sections. Reads as a robot arm at
 * 28px and as a kinematic chain diagram at 200px.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Robotics Academy">
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="7.5" className="fill-surface-2 stroke-line" strokeWidth="1.5" />
      <g className="stroke-signal" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M8 25 L8 17" />
        <path d="M8 17 L16 11" />
        <path d="M16 11 L24 15" />
      </g>
      <g className="fill-signal">
        <circle cx="8" cy="17" r="2.6" />
        <circle cx="16" cy="11" r="2.2" />
      </g>
      <circle cx="24" cy="15" r="2.4" className="fill-surface-1 stroke-signal" strokeWidth="2" />
      <rect x="4.5" y="24.5" width="7" height="2.6" rx="1.3" className="fill-text-3" />
    </svg>
  );
}
