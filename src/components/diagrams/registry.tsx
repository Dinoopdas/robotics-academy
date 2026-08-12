/**
 * Technical diagrams as inline SVG.
 *
 * Inline rather than image files so they inherit the theme's colours through
 * Tailwind classes and stay crisp at any zoom — both of which matter for
 * schematics a learner will scale up to study. Each is referenced from content
 * by name via a `diagram` block.
 */

const stroke = "stroke-line-strong";
const label = "fill-text-2 text-[10px] font-mono";
const labelStrong = "fill-text-1 text-[11px] font-semibold";
const accent = "stroke-signal";
const accentFill = "fill-signal";

function Frame({ children, viewBox }: { children: React.ReactNode; viewBox: string }) {
  return (
    <svg viewBox={viewBox} className="h-auto w-full" role="img">
      {children}
    </svg>
  );
}

function MobileRobotAnatomy() {
  return (
    <Frame viewBox="0 0 640 300">
      <title>Subsystems of a sidewalk delivery robot</title>

      {/* Body */}
      <rect x="170" y="120" width="270" height="90" rx="12" className="fill-surface-2 stroke-line-strong" strokeWidth="2" />
      <rect x="195" y="132" width="220" height="45" rx="6" className="fill-surface-3 stroke-line" strokeWidth="1.5" />
      <text x="305" y="160" textAnchor="middle" className={label}>CARGO BAY</text>

      {/* Wheels */}
      {[205, 305, 405].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="222" r="22" className="fill-surface-3 stroke-line-strong" strokeWidth="2" />
          <circle cx={cx} cy="222" r="7" className="fill-text-3" />
        </g>
      ))}

      {/* Sensor mast */}
      <rect x="420" y="60" width="14" height="62" rx="4" className="fill-surface-3 stroke-line-strong" strokeWidth="1.5" />
      <rect x="404" y="42" width="46" height="22" rx="5" className={`fill-surface-1 ${accent}`} strokeWidth="2" />
      <text x="427" y="57" textAnchor="middle" className={label}>CAM</text>

      {/* Camera field of view */}
      <path d="M427 64 L520 118 L520 40 Z" className="fill-signal/12 stroke-signal/40" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Ultrasonic ring */}
      {[
        [170, 165],
        [440, 165],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="8" className={`fill-surface-1 ${accent}`} strokeWidth="2" />
      ))}
      <path d="M162 165 q-22 0 -34 -14 M162 165 q-22 0 -34 14" className="stroke-signal/50" strokeWidth="1.5" fill="none" />

      {/* Labels with leaders */}
      <g className={stroke} strokeWidth="1" strokeDasharray="3 3">
        <path d="M427 42 L427 22 L300 22" fill="none" />
        <path d="M162 158 L100 130" fill="none" />
        <path d="M205 244 L205 268 L300 268" fill="none" />
        <path d="M440 210 L520 210 L520 190" fill="none" />
      </g>

      <text x="294" y="19" textAnchor="end" className={labelStrong}>Camera + IMU + GPS mast</text>
      <text x="96" y="127" textAnchor="end" className={labelStrong}>Ultrasonic ring</text>
      <text x="306" y="272" className={labelStrong}>Six driven wheels — kerb capable</text>
      <text x="524" y="186" className={labelStrong}>Battery + compute</text>

      <text x="20" y="290" className={label}>Every sensor is paired with another whose weakness it covers.</text>
    </Frame>
  );
}

function JointTypes() {
  return (
    <Frame viewBox="0 0 640 240">
      <title>Revolute and prismatic joints</title>

      {/* Revolute */}
      <text x="150" y="28" textAnchor="middle" className={labelStrong}>Revolute — rotates by θ</text>
      <rect x="40" y="150" width="60" height="26" rx="4" className="fill-surface-3 stroke-line-strong" strokeWidth="2" />
      <line x1="70" y1="150" x2="70" y2="120" className={stroke} strokeWidth="6" strokeLinecap="round" />
      <circle cx="70" cy="118" r="11" className={`fill-surface-1 ${accent}`} strokeWidth="3" />
      <line x1="70" y1="118" x2="185" y2="118" className={`${stroke} opacity-30`} strokeWidth="7" strokeLinecap="round" strokeDasharray="6 5" />
      <line x1="70" y1="118" x2="168" y2="62" className={accent} strokeWidth="7" strokeLinecap="round" />
      <circle cx="168" cy="62" r="7" className={accentFill} />
      <path d="M120 118 A50 50 0 0 0 143 92" className={accent} strokeWidth="2" fill="none" />
      <text x="133" y="112" className={`${label} fill-signal`}>θ</text>

      {/* Prismatic */}
      <text x="470" y="28" textAnchor="middle" className={labelStrong}>Prismatic — slides by d</text>
      <rect x="350" y="100" width="240" height="36" rx="6" className="fill-surface-2 stroke-line-strong" strokeWidth="2" />
      <line x1="350" y1="118" x2="590" y2="118" className={`${stroke} opacity-25`} strokeWidth="2" strokeDasharray="5 4" />
      <rect x="430" y="94" width="58" height="48" rx="6" className={`fill-surface-1 ${accent}`} strokeWidth="3" />
      <circle cx="459" cy="118" r="5" className={accentFill} />

      <g className={accent} strokeWidth="1.5">
        <path d="M354 158 L455 158" fill="none" markerEnd="" />
        <path d="M354 154 L354 162 M455 154 L455 162" />
      </g>
      <text x="404" y="176" textAnchor="middle" className={`${label} fill-signal`}>d</text>

      <text x="350" y="206" className={label}>
        The mechanism must be at least as long as its stroke.
      </text>
      <text x="40" y="206" className={label}>
        Compact: a large arc from a small housing.
      </text>
    </Frame>
  );
}

function AccuracyRepeatability() {
  const boards: { cx: number; title: string; caption: string; points: [number, number][] }[] = [
    {
      cx: 110,
      title: "Accurate + repeatable",
      caption: "Calibrated robot",
      points: [
        [0, 0],
        [4, -3],
        [-3, 4],
        [2, 3],
        [-4, -2],
      ],
    },
    {
      cx: 320,
      title: "Repeatable, not accurate",
      caption: "Typical industrial arm",
      points: [
        [26, -20],
        [30, -23],
        [23, -17],
        [28, -18],
        [25, -22],
      ],
    },
    {
      cx: 530,
      title: "Neither",
      caption: "Worn or damaged",
      points: [
        [30, -22],
        [-25, 18],
        [12, 30],
        [-30, -14],
        [5, -33],
      ],
    },
  ];

  return (
    <Frame viewBox="0 0 640 250">
      <title>Accuracy versus repeatability</title>
      {boards.map((board) => (
        <g key={board.cx}>
          <text x={board.cx} y="24" textAnchor="middle" className={labelStrong}>
            {board.title}
          </text>
          {[56, 38, 20].map((r, i) => (
            <circle
              key={r}
              cx={board.cx}
              cy="120"
              r={r}
              className={i === 2 ? "fill-signal/10 stroke-line-strong" : "fill-surface-2 stroke-line"}
              strokeWidth="1.5"
            />
          ))}
          <circle cx={board.cx} cy="120" r="3" className="fill-text-3" />
          {board.points.map(([dx, dy], i) => (
            <circle
              key={i}
              cx={board.cx + dx}
              cy={120 + dy}
              r="4.5"
              className="fill-rose stroke-surface-1"
              strokeWidth="1.5"
            />
          ))}
          <text x={board.cx} y="200" textAnchor="middle" className={label}>
            {board.caption}
          </text>
        </g>
      ))}
      <text x="320" y="234" textAnchor="middle" className={label}>
        Datasheets quote the tightness of the cluster — not its distance from the centre.
      </text>
    </Frame>
  );
}

function WorkspaceShell() {
  return (
    <Frame viewBox="0 0 640 300">
      <title>Reachable versus dexterous workspace</title>

      <circle cx="200" cy="180" r="150" className="fill-surface-2/60 stroke-line" strokeWidth="1.5" strokeDasharray="6 5" />
      <path
        d="M200 180 m-128 0 a128 128 0 1 1 256 0 a128 128 0 1 1 -256 0"
        className="fill-signal/12 stroke-signal/40"
        strokeWidth="1.5"
      />
      <circle cx="200" cy="180" r="48" className="fill-surface-0 stroke-line-strong" strokeWidth="1.5" />

      <rect x="182" y="176" width="36" height="18" rx="3" className="fill-text-3" />

      <g className={stroke} strokeWidth="1" strokeDasharray="3 3">
        <path d="M350 62 L330 62 L262 118" fill="none" />
        <path d="M350 150 L300 150" fill="none" />
        <path d="M350 226 L248 196" fill="none" />
      </g>

      <text x="356" y="58" className={labelStrong}>Reachable workspace</text>
      <text x="356" y="76" className={label}>Reachable in at least one orientation</text>

      <text x="356" y="146" className={labelStrong}>Dexterous shell</text>
      <text x="356" y="164" className={label}>Reachable in any orientation — put the work here</text>

      <text x="356" y="222" className={labelStrong}>Dead zone</text>
      <text x="356" y="240" className={label}>Links collide with the robot body</text>
    </Frame>
  );
}

function Quadrature() {
  const high = 60;
  const low = 100;
  const step = 40;

  const wave = (offset: number) => {
    let d = `M40 ${low}`;
    for (let i = 0; i < 6; i += 1) {
      const x = 40 + offset + i * step * 2;
      d += ` L${x} ${low} L${x} ${high} L${x + step} ${high} L${x + step} ${low}`;
    }
    return d;
  };

  return (
    <Frame viewBox="0 0 640 260">
      <title>Quadrature encoder signals</title>

      <text x="20" y="52" className={label}>A</text>
      <path d={wave(0)} className={accent} strokeWidth="2.5" fill="none" strokeLinejoin="round" />

      <text x="20" y="152" className={label}>B</text>
      <g transform="translate(0,100)">
        <path d={wave(20)} className="stroke-violet" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      </g>

      <g className="stroke-line" strokeWidth="1" strokeDasharray="3 4">
        {[60, 80, 100, 120].map((x) => (
          <line key={x} x1={x} y1="50" x2={x} y2="210" />
        ))}
      </g>

      <text x="60" y="232" textAnchor="middle" className={`${label} fill-signal`}>1</text>
      <text x="80" y="232" textAnchor="middle" className={`${label} fill-signal`}>2</text>
      <text x="100" y="232" textAnchor="middle" className={`${label} fill-signal`}>3</text>
      <text x="120" y="232" textAnchor="middle" className={`${label} fill-signal`}>4</text>

      <text x="150" y="232" className={label}>
        Four edges per line pair — hence 4× the resolution.
      </text>
      <text x="20" y="252" className={label}>
        Forward: A leads B. Reverse: B leads A. Direction comes from the order, not the count.
      </text>
    </Frame>
  );
}

function IkTwoSolutions() {
  return (
    <Frame viewBox="0 0 640 280">
      <title>Elbow-up and elbow-down inverse kinematics solutions</title>

      <line x1="120" y1="200" x2="440" y2="200" className={`${stroke} opacity-30`} strokeWidth="1.5" strokeDasharray="5 4" />
      <rect x="98" y="200" width="44" height="18" rx="3" className="fill-text-3" />

      {/* Elbow up */}
      <line x1="120" y1="200" x2="250" y2="86" className={accent} strokeWidth="6" strokeLinecap="round" />
      <line x1="250" y1="86" x2="392" y2="140" className={accent} strokeWidth="6" strokeLinecap="round" />
      <circle cx="250" cy="86" r="9" className={`fill-surface-1 ${accent}`} strokeWidth="3" />
      <text x="250" y="70" textAnchor="middle" className={`${label} fill-signal`}>elbow up</text>

      {/* Elbow down */}
      <line x1="120" y1="200" x2="272" y2="248" className="stroke-violet" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
      <line x1="272" y1="248" x2="392" y2="140" className="stroke-violet" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
      <circle cx="272" cy="248" r="9" className="fill-surface-1 stroke-violet" strokeWidth="3" />
      <text x="272" y="270" textAnchor="middle" className={`${label} fill-violet`}>elbow down</text>

      {/* Shared target */}
      <circle cx="392" cy="140" r="11" className="fill-emerald/25 stroke-emerald" strokeWidth="2.5" />
      <circle cx="392" cy="140" r="4" className="fill-emerald" />
      <text x="410" y="136" className={labelStrong}>Same target</text>
      <text x="410" y="154" className={label}>Two valid joint solutions</text>

      <circle cx="120" cy="200" r="7" className={accentFill} />
      <text x="120" y="232" textAnchor="middle" className={label}>base</text>
    </Frame>
  );
}

function TcpFrames() {
  const axes = (x: number, y: number, scale = 1, name?: string) => (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <line x1="0" y1="0" x2="34" y2="0" className="stroke-rose" strokeWidth="2.5" />
      <line x1="0" y1="0" x2="0" y2="-34" className="stroke-emerald" strokeWidth="2.5" />
      <circle cx="0" cy="0" r="3.5" className="fill-text-1" />
      <text x="38" y="4" className="fill-rose text-[9px] font-mono">X</text>
      <text x="4" y="-38" className="fill-emerald text-[9px] font-mono">Z</text>
      {name ? <text x="-4" y="18" textAnchor="end" className={label}>{name}</text> : null}
    </g>
  );

  return (
    <Frame viewBox="0 0 640 300">
      <title>Flange, tool and user frames</title>

      {/* Arm */}
      <rect x="60" y="220" width="60" height="24" rx="4" className="fill-surface-3 stroke-line-strong" strokeWidth="2" />
      <line x1="90" y1="220" x2="170" y2="140" className={stroke} strokeWidth="8" strokeLinecap="round" />
      <line x1="170" y1="140" x2="290" y2="150" className={stroke} strokeWidth="8" strokeLinecap="round" />
      <circle cx="170" cy="140" r="8" className="fill-surface-1 stroke-line-strong" strokeWidth="2.5" />

      {/* Flange */}
      <rect x="288" y="136" width="10" height="28" rx="2" className="fill-text-3" />
      {axes(298, 150, 1, "flange")}

      {/* Tool */}
      <path d="M298 150 L352 150 L360 142 M352 150 L360 158" className={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
      {axes(364, 150, 1)}
      <text x="364" y="126" textAnchor="middle" className={`${labelStrong} fill-signal`}>TCP</text>
      <text x="300" y="196" className={label}>tool frame — offset from the flange</text>

      {/* User frame on a fixture */}
      <rect x="430" y="210" width="170" height="14" rx="3" className="fill-surface-3 stroke-line-strong" strokeWidth="1.5" />
      <rect x="452" y="182" width="46" height="28" rx="3" className="fill-surface-2 stroke-line-strong" strokeWidth="1.5" />
      {axes(440, 210, 1, "user")}
      <text x="470" y="252" textAnchor="middle" className={label}>fixture</text>

      <text x="20" y="286" className={label}>
        Positions taught in the user frame move automatically when the fixture is re-taught.
      </text>
    </Frame>
  );
}

export const DIAGRAM_NAMES = [
  "mobile-robot-anatomy",
  "joint-types",
  "accuracy-repeatability",
  "workspace-shell",
  "quadrature",
  "ik-two-solutions",
  "tcp-frames",
] as const;

export function hasDiagram(name: string): boolean {
  return (DIAGRAM_NAMES as readonly string[]).includes(name);
}

/**
 * Resolved with a switch returning JSX rather than by looking a component up
 * in a map and rendering the result. Selecting a component type during render
 * gives React a different element type whenever the lookup changes, which
 * remounts the subtree — and the React compiler's lint rules reject it for
 * exactly that reason.
 */
export function Diagram({ name }: { name: string }) {
  switch (name) {
    case "mobile-robot-anatomy":
      return <MobileRobotAnatomy />;
    case "joint-types":
      return <JointTypes />;
    case "accuracy-repeatability":
      return <AccuracyRepeatability />;
    case "workspace-shell":
      return <WorkspaceShell />;
    case "quadrature":
      return <Quadrature />;
    case "ik-two-solutions":
      return <IkTwoSolutions />;
    case "tcp-frames":
      return <TcpFrames />;
    default:
      return null;
  }
}
