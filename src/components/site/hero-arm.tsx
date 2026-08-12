/**
 * Hero illustration: a 6-axis arm drawn as an engineering schematic rather
 * than a render — joint circles, link centrelines, a dimensioned reach arc and
 * a labelled TCP frame. It doubles as a legend for the vocabulary Level 1
 * teaches, so the first thing a visitor sees is already instructional.
 */
export function HeroArm() {
  return (
    <svg viewBox="0 0 420 420" className="h-auto w-full" role="img" aria-label="Six-axis robot arm schematic">
      {/* Reach envelope */}
      <circle cx="120" cy="330" r="250" className="fill-signal/[0.04] stroke-signal/20" strokeWidth="1" strokeDasharray="6 6" />
      <circle cx="120" cy="330" r="180" className="fill-none stroke-line" strokeWidth="1" strokeDasharray="3 6" />

      {/* Floor */}
      <line x1="20" y1="352" x2="400" y2="352" className="stroke-line-strong" strokeWidth="1.5" />
      {Array.from({ length: 14 }).map((_, i) => (
        <line
          key={i}
          x1={26 + i * 27}
          y1="352"
          x2={16 + i * 27}
          y2="364"
          className="stroke-line"
          strokeWidth="1"
        />
      ))}

      {/* Base */}
      <rect x="82" y="316" width="76" height="36" rx="5" className="fill-surface-2 stroke-line-strong" strokeWidth="2" />
      <rect x="98" y="292" width="44" height="26" rx="4" className="fill-surface-3 stroke-line-strong" strokeWidth="2" />

      {/* Link 1 — shoulder to elbow */}
      <line x1="120" y1="296" x2="196" y2="168" className="stroke-line-strong" strokeWidth="15" strokeLinecap="round" />
      <line x1="120" y1="296" x2="196" y2="168" className="stroke-signal/25" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 6" />

      {/* Link 2 — elbow to wrist */}
      <line x1="196" y1="168" x2="308" y2="132" className="stroke-line-strong" strokeWidth="13" strokeLinecap="round" />
      <line x1="196" y1="168" x2="308" y2="132" className="stroke-signal/25" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 6" />

      {/* Wrist cluster */}
      <line x1="308" y1="132" x2="344" y2="104" className="stroke-signal" strokeWidth="9" strokeLinecap="round" />

      {/* Joints */}
      <circle cx="120" cy="296" r="13" className="fill-surface-1 stroke-signal" strokeWidth="3.5" />
      <circle cx="196" cy="168" r="11" className="fill-surface-1 stroke-signal" strokeWidth="3.5" />
      <circle cx="308" cy="132" r="9" className="fill-surface-1 stroke-signal" strokeWidth="3" />
      <circle cx="120" cy="296" r="4" className="fill-signal" />
      <circle cx="196" cy="168" r="3.5" className="fill-signal" />

      {/* Gripper */}
      <g transform="translate(344,104) rotate(-38)">
        <rect x="-4" y="-9" width="10" height="18" rx="2" className="fill-surface-2 stroke-signal" strokeWidth="2" />
        <path d="M6 -7 L22 -12 M6 7 L22 12" className="stroke-signal" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>

      {/* TCP frame */}
      <g transform="translate(368,86)">
        <line x1="0" y1="0" x2="30" y2="-14" className="stroke-rose" strokeWidth="2.5" />
        <line x1="0" y1="0" x2="14" y2="-30" className="stroke-emerald" strokeWidth="2.5" />
        <circle cx="0" cy="0" r="3.5" className="fill-text-1" />
        <text x="34" y="-14" className="fill-rose font-mono text-[10px]">X</text>
        <text x="16" y="-34" className="fill-emerald font-mono text-[10px]">Z</text>
      </g>

      {/* Annotations */}
      <g className="stroke-line-strong" strokeWidth="1" strokeDasharray="3 3" fill="none">
        <path d="M133 296 L232 296" />
        <path d="M207 162 L266 96" />
        <path d="M368 86 L368 46 L286 46" />
      </g>

      <text x="238" y="300" className="fill-text-2 font-mono text-[11px]">base / axis 1</text>
      <text x="270" y="92" className="fill-text-2 font-mono text-[11px]">joint</text>
      <text x="282" y="49" textAnchor="end" className="fill-text-2 font-mono text-[11px]">TCP</text>

      {/* Reach dimension */}
      <g className="stroke-signal/45" strokeWidth="1">
        <path d="M120 330 L354 330" strokeDasharray="4 4" />
        <path d="M120 324 L120 336 M354 324 L354 336" />
      </g>
      <text x="237" y="346" textAnchor="middle" className="fill-signal font-mono text-[10px]">reach</text>
    </svg>
  );
}
