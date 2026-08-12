"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { LabButton, LabShell, Readout, Slider, Toggle } from "./controls";

const DEG = 180 / Math.PI;

// ---------------------------------------------------------------------------
// Forward kinematics: drive the joints, watch the tool
// ---------------------------------------------------------------------------

export function ArmForwardKinematics({
  showSingularityWarning = false,
}: {
  showSingularityWarning?: boolean;
}) {
  const [theta1, setTheta1] = useState(35);
  const [theta2, setTheta2] = useState(50);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  const L1 = 130;
  const L2 = 105;
  const originX = 200;
  const originY = 250;

  const t1 = theta1 / DEG;
  const t2 = theta2 / DEG;

  const elbow = { x: L1 * Math.cos(t1), y: L1 * Math.sin(t1) };
  const tip = {
    x: elbow.x + L2 * Math.cos(t1 + t2),
    y: elbow.y + L2 * Math.sin(t1 + t2),
  };

  // The arm is singular when the elbow is straight (θ₂ ≈ 0) or fully folded
  // (θ₂ ≈ ±180): in both cases the two links are collinear and the tool can no
  // longer be moved radially, so the Jacobian loses rank.
  const nearSingular = Math.abs(theta2) < 8 || Math.abs(Math.abs(theta2) - 180) < 8;

  const toScreen = (p: { x: number; y: number }) => ({
    x: originX + p.x,
    y: originY - p.y,
  });

  const screenElbow = toScreen(elbow);
  const screenTip = toScreen(tip);

  const update = (setter: (v: number) => void) => (value: number) => {
    setter(value);
    setTrail((current) => [...current.slice(-120), tip]);
  };

  return (
    <LabShell
      readouts={
        <>
          <Readout label="θ₁" value={theta1.toFixed(1)} unit="°" />
          <Readout label="θ₂" value={theta2.toFixed(1)} unit="°" />
          <Readout label="tip x" value={(tip.x / 100).toFixed(3)} unit="m" />
          <Readout
            label="tip y"
            value={(tip.y / 100).toFixed(3)}
            unit="m"
            tone={showSingularityWarning && nearSingular ? "warn" : "default"}
          />
        </>
      }
      controls={
        <>
          <Slider label="Shoulder θ₁" value={theta1} min={-180} max={180} step={1} unit="°" onChange={update(setTheta1)} format={(v) => v.toFixed(0)} />
          <Slider label="Elbow θ₂" value={theta2} min={-180} max={180} step={1} unit="°" onChange={update(setTheta2)} format={(v) => v.toFixed(0)} accent="violet" />
          <div className="flex gap-2">
            <LabButton onClick={() => setTrail([])}>Clear trail</LabButton>
            <LabButton
              onClick={() => {
                setTheta1(35);
                setTheta2(50);
                setTrail([]);
              }}
            >
              Reset
            </LabButton>
          </div>
        </>
      }
      footnote={
        showSingularityWarning && nearSingular
          ? "Near a singularity: the links are almost collinear, so radial tool motion needs enormous joint speed."
          : "x = L₁cos θ₁ + L₂cos(θ₁ + θ₂),  y = L₁sin θ₁ + L₂sin(θ₁ + θ₂)"
      }
    >
      <svg viewBox="0 0 400 300" className="h-auto w-full">
        {/* Reach limit */}
        <circle cx={originX} cy={originY} r={L1 + L2} className="fill-none stroke-line" strokeWidth="1" strokeDasharray="4 5" />
        <circle cx={originX} cy={originY} r={Math.abs(L1 - L2)} className="fill-none stroke-line" strokeWidth="1" strokeDasharray="4 5" />

        {/* Tip trail */}
        {trail.length > 1 ? (
          <polyline
            points={trail.map((p) => `${originX + p.x},${originY - p.y}`).join(" ")}
            className="fill-none stroke-signal/30"
            strokeWidth="1.5"
          />
        ) : null}

        {/* Links */}
        <line x1={originX} y1={originY} x2={screenElbow.x} y2={screenElbow.y} className="stroke-line-strong" strokeWidth="9" strokeLinecap="round" />
        <line x1={screenElbow.x} y1={screenElbow.y} x2={screenTip.x} y2={screenTip.y} className={nearSingular && showSingularityWarning ? "stroke-amber" : "stroke-signal"} strokeWidth="9" strokeLinecap="round" />

        {/* Joints */}
        <rect x={originX - 26} y={originY} width="52" height="16" rx="3" className="fill-text-3" />
        <circle cx={originX} cy={originY} r="8" className="fill-surface-1 stroke-line-strong" strokeWidth="3" />
        <circle cx={screenElbow.x} cy={screenElbow.y} r="7" className="fill-surface-1 stroke-violet" strokeWidth="3" />
        <circle cx={screenTip.x} cy={screenTip.y} r="6" className="fill-signal" />

        <text x={originX} y={originY + 34} textAnchor="middle" className="fill-text-3 font-mono text-[10px]">base</text>
        <text x={screenTip.x + 12} y={screenTip.y - 8} className="fill-signal font-mono text-[10px]">TCP</text>
      </svg>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------
// Inverse kinematics: drag a target, watch the joints solve
// ---------------------------------------------------------------------------

export function ArmInverseKinematics() {
  const [target, setTarget] = useState({ x: 150, y: 90 });
  const [elbowUp, setElbowUp] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const L1 = 130;
  const L2 = 105;
  const originX = 200;
  const originY = 250;

  const solution = useMemo(() => {
    const { x, y } = target;
    const rSquared = x * x + y * y;
    const r = Math.sqrt(rSquared);

    if (r > L1 + L2 || r < Math.abs(L1 - L2)) {
      return { reachable: false as const, r };
    }

    let cosTheta2 = (rSquared - L1 * L1 - L2 * L2) / (2 * L1 * L2);
    cosTheta2 = Math.max(-1, Math.min(1, cosTheta2));

    const theta2 = elbowUp ? Math.acos(cosTheta2) : -Math.acos(cosTheta2);
    const theta1 =
      Math.atan2(y, x) - Math.atan2(L2 * Math.sin(theta2), L1 + L2 * Math.cos(theta2));

    return { reachable: true as const, theta1, theta2, r };
  }, [target, elbowUp]);

  const pointFromEvent = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scale = 400 / rect.width;
    return {
      x: (clientX - rect.left) * scale - originX,
      y: originY - (clientY - rect.top) * scale,
    };
  }, []);

  const handlePointer = useCallback(
    (clientX: number, clientY: number) => {
      const point = pointFromEvent(clientX, clientY);
      if (point) setTarget(point);
    },
    [pointFromEvent],
  );

  const elbow = solution.reachable
    ? { x: L1 * Math.cos(solution.theta1), y: L1 * Math.sin(solution.theta1) }
    : null;

  return (
    <LabShell
      readouts={
        <>
          <Readout label="target x" value={(target.x / 100).toFixed(3)} unit="m" />
          <Readout label="target y" value={(target.y / 100).toFixed(3)} unit="m" />
          <Readout
            label="θ₁"
            value={solution.reachable ? (solution.theta1 * DEG).toFixed(1) : "—"}
            unit={solution.reachable ? "°" : undefined}
            tone={solution.reachable ? "default" : "bad"}
          />
          <Readout
            label="θ₂"
            value={solution.reachable ? (solution.theta2 * DEG).toFixed(1) : "—"}
            unit={solution.reachable ? "°" : undefined}
            tone={solution.reachable ? "default" : "bad"}
          />
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <Toggle label={elbowUp ? "Elbow up" : "Elbow down"} checked={elbowUp} onChange={setElbowUp} />
          <LabButton onClick={() => setTarget({ x: 150, y: 90 })}>Reset target</LabButton>
          <span className="ml-auto text-xs text-text-3">Click or drag inside the diagram</span>
        </div>
      }
      footnote={
        solution.reachable
          ? "cos θ₂ = (r² − L₁² − L₂²) / (2 L₁ L₂),  then θ₁ = atan2(y, x) − atan2(L₂ sin θ₂, L₁ + L₂ cos θ₂)"
          : `Unreachable: r = ${(solution.r / 100).toFixed(3)} m is outside [${(Math.abs(L1 - L2) / 100).toFixed(2)}, ${((L1 + L2) / 100).toFixed(2)}] m`
      }
    >
      <svg
        ref={svgRef}
        viewBox="0 0 400 300"
        className="h-auto w-full cursor-crosshair touch-none"
        onPointerDown={(e) => {
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          handlePointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (dragging) handlePointer(e.clientX, e.clientY);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <circle cx={originX} cy={originY} r={L1 + L2} className="fill-signal/5 stroke-line" strokeWidth="1" strokeDasharray="4 5" />
        <circle cx={originX} cy={originY} r={Math.abs(L1 - L2)} className="fill-surface-0 stroke-line" strokeWidth="1" strokeDasharray="4 5" />

        {solution.reachable && elbow ? (
          <>
            <line x1={originX} y1={originY} x2={originX + elbow.x} y2={originY - elbow.y} className="stroke-line-strong" strokeWidth="9" strokeLinecap="round" />
            <line x1={originX + elbow.x} y1={originY - elbow.y} x2={originX + target.x} y2={originY - target.y} className="stroke-signal" strokeWidth="9" strokeLinecap="round" />
            <circle cx={originX + elbow.x} cy={originY - elbow.y} r="7" className="fill-surface-1 stroke-violet" strokeWidth="3" />
          </>
        ) : (
          <line
            x1={originX}
            y1={originY}
            x2={originX + target.x}
            y2={originY - target.y}
            className="stroke-rose/40"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        )}

        <rect x={originX - 26} y={originY} width="52" height="16" rx="3" className="fill-text-3" />
        <circle cx={originX} cy={originY} r="8" className="fill-surface-1 stroke-line-strong" strokeWidth="3" />

        <g>
          <circle
            cx={originX + target.x}
            cy={originY - target.y}
            r="12"
            className={solution.reachable ? "fill-emerald/20 stroke-emerald" : "fill-rose/20 stroke-rose"}
            strokeWidth="2.5"
          />
          <circle
            cx={originX + target.x}
            cy={originY - target.y}
            r="3.5"
            className={solution.reachable ? "fill-emerald" : "fill-rose"}
          />
        </g>

        {!solution.reachable ? (
          <text x="200" y="30" textAnchor="middle" className="fill-rose font-mono text-[11px] font-semibold">
            TARGET UNREACHABLE
          </text>
        ) : null}
      </svg>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------
// DOF explorer: switch joints off and discover what becomes impossible
// ---------------------------------------------------------------------------

// Module scope so the memo below has a stable reference to depend on.
const DOF_LINK_LENGTHS = [110, 85, 55];

export function DofExplorer() {
  const [joints, setJoints] = useState([true, true, true]);
  const [angles, setAngles] = useState([30, 40, -25]);

  const lengths = DOF_LINK_LENGTHS;
  const originX = 200;
  const originY = 250;

  const activeCount = joints.filter(Boolean).length;

  const points = useMemo(() => {
    let total = 0;
    let x = 0;
    let y = 0;
    const result = [{ x, y }];

    for (let i = 0; i < 3; i += 1) {
      if (!joints[i]) continue;
      total += angles[i] / DEG;
      x += lengths[i] * Math.cos(total);
      y += lengths[i] * Math.sin(total);
      result.push({ x, y });
    }
    return { chain: result, toolAngle: total * DEG };
  }, [joints, angles, lengths]);

  return (
    <LabShell
      readouts={
        <>
          <Readout label="Active joints" value={activeCount} />
          <Readout label="Tool x" value={(points.chain.at(-1)!.x / 100).toFixed(3)} unit="m" />
          <Readout label="Tool y" value={(points.chain.at(-1)!.y / 100).toFixed(3)} unit="m" />
          <Readout
            label="Tool angle"
            value={activeCount >= 3 ? points.toolAngle.toFixed(0) : "not free"}
            unit={activeCount >= 3 ? "°" : undefined}
            tone={activeCount >= 3 ? "good" : "warn"}
          />
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            {joints.map((on, i) => (
              <Toggle
                key={i}
                label={`Joint ${i + 1}`}
                checked={on}
                onChange={(checked) => setJoints(joints.map((v, j) => (j === i ? checked : v)))}
              />
            ))}
          </div>
          {joints.map((on, i) =>
            on ? (
              <Slider
                key={i}
                label={`θ${i + 1}`}
                value={angles[i]}
                min={-170}
                max={170}
                step={1}
                unit="°"
                format={(v) => v.toFixed(0)}
                onChange={(value) => setAngles(angles.map((v, j) => (j === i ? value : v)))}
              />
            ) : null,
          )}
        </>
      }
      footnote={
        activeCount >= 3
          ? "Three joints in a plane: position (x, y) and tool orientation can all be chosen independently."
          : `With ${activeCount} joint${activeCount === 1 ? "" : "s"} you can choose ${activeCount} quantity${activeCount === 1 ? "" : "ies"}. Tool orientation is whatever the geometry leaves.`
      }
    >
      <svg viewBox="0 0 400 300" className="h-auto w-full">
        <circle cx={originX} cy={originY} r={lengths.reduce((a, b) => a + b, 0)} className="fill-none stroke-line" strokeWidth="1" strokeDasharray="4 5" />

        {points.chain.slice(0, -1).map((p, i) => {
          const next = points.chain[i + 1];
          return (
            <line
              key={i}
              x1={originX + p.x}
              y1={originY - p.y}
              x2={originX + next.x}
              y2={originY - next.y}
              className={i === 0 ? "stroke-line-strong" : "stroke-signal"}
              strokeWidth="8"
              strokeLinecap="round"
            />
          );
        })}

        {points.chain.map((p, i) => (
          <circle
            key={i}
            cx={originX + p.x}
            cy={originY - p.y}
            r={i === points.chain.length - 1 ? 6 : 7}
            className={
              i === points.chain.length - 1
                ? "fill-signal"
                : "fill-surface-1 stroke-line-strong"
            }
            strokeWidth="3"
          />
        ))}

        <rect x={originX - 26} y={originY} width="52" height="16" rx="3" className="fill-text-3" />
      </svg>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------
// Frame viewer: one physical point, two sets of coordinates
// ---------------------------------------------------------------------------

export function FrameViewer() {
  const [cameraX, setCameraX] = useState(120);
  const [cameraY, setCameraY] = useState(70);
  const [cameraRot, setCameraRot] = useState(30);

  // The point is fixed in the world. Only its description changes.
  const worldPoint = { x: 250, y: 160 };
  const originX = 60;
  const originY = 250;

  const rot = cameraRot / DEG;
  const dx = worldPoint.x - cameraX;
  const dy = worldPoint.y - cameraY;

  // Express the world point in the camera frame: undo the camera's rotation.
  const inCamera = {
    x: dx * Math.cos(rot) + dy * Math.sin(rot),
    y: -dx * Math.sin(rot) + dy * Math.cos(rot),
  };

  const axis = (ox: number, oy: number, angleDeg: number, colour: string, len = 46) => {
    const a = angleDeg / DEG;
    return {
      x1: originX + ox,
      y1: originY - oy,
      x2: originX + ox + len * Math.cos(a),
      y2: originY - oy - len * Math.sin(a),
      className: colour,
    };
  };

  const baseX = axis(0, 0, 0, "stroke-rose");
  const baseY = axis(0, 0, 90, "stroke-emerald");
  const camX = axis(cameraX, cameraY, cameraRot, "stroke-rose");
  const camY = axis(cameraX, cameraY, cameraRot + 90, "stroke-emerald");

  return (
    <LabShell
      readouts={
        <>
          <Readout label="in base_link x" value={(worldPoint.x / 100).toFixed(2)} unit="m" />
          <Readout label="in base_link y" value={(worldPoint.y / 100).toFixed(2)} unit="m" />
          <Readout label="in camera_link x" value={(inCamera.x / 100).toFixed(2)} unit="m" tone="warn" />
          <Readout label="in camera_link y" value={(inCamera.y / 100).toFixed(2)} unit="m" tone="warn" />
        </>
      }
      controls={
        <>
          <Slider label="Camera x offset" value={cameraX} min={20} max={260} step={1} unit="cm" format={(v) => v.toFixed(0)} onChange={setCameraX} />
          <Slider label="Camera y offset" value={cameraY} min={0} max={180} step={1} unit="cm" format={(v) => v.toFixed(0)} onChange={setCameraY} />
          <Slider label="Camera rotation" value={cameraRot} min={-90} max={90} step={1} unit="°" format={(v) => v.toFixed(0)} onChange={setCameraRot} accent="violet" />
        </>
      }
      footnote="The green point never moves. Only the numbers describing it change — which is why a coordinate triple without a frame is meaningless."
    >
      <svg viewBox="0 0 400 300" className="h-auto w-full">
        <line {...baseX} strokeWidth="2.5" />
        <line {...baseY} strokeWidth="2.5" />
        <circle cx={originX} cy={originY} r="4" className="fill-text-1" />
        <text x={originX - 6} y={originY + 18} textAnchor="end" className="fill-text-2 font-mono text-[10px]">base_link</text>

        <line {...camX} strokeWidth="2.5" opacity="0.85" />
        <line {...camY} strokeWidth="2.5" opacity="0.85" />
        <circle cx={originX + cameraX} cy={originY - cameraY} r="4" className="fill-violet" />
        <text x={originX + cameraX} y={originY - cameraY + 20} textAnchor="middle" className="fill-violet font-mono text-[10px]">camera_link</text>

        <line
          x1={originX}
          y1={originY}
          x2={originX + cameraX}
          y2={originY - cameraY}
          className="stroke-line-strong"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        <circle cx={originX + worldPoint.x} cy={originY - worldPoint.y} r="10" className="fill-emerald/25 stroke-emerald" strokeWidth="2.5" />
        <circle cx={originX + worldPoint.x} cy={originY - worldPoint.y} r="3.5" className="fill-emerald" />
        <text x={originX + worldPoint.x + 16} y={originY - worldPoint.y + 4} className="fill-text-2 font-mono text-[10px]">the object</text>
      </svg>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------
// Transformation composer: order matters
// ---------------------------------------------------------------------------

export function TransformVisualiser() {
  const [rotation, setRotation] = useState(45);
  const [translateX, setTranslateX] = useState(120);
  const [translateY, setTranslateY] = useState(40);
  const [rotateFirst, setRotateFirst] = useState(true);

  const originX = 70;
  const originY = 230;
  const rad = rotation / DEG;

  const c = Math.cos(rad);
  const s = Math.sin(rad);

  // Rotate-then-translate applies the translation in the ROTATED frame;
  // translate-then-rotate applies it in the original frame. Different results.
  const result = rotateFirst
    ? { x: translateX * c - translateY * s, y: translateX * s + translateY * c, angle: rotation }
    : { x: translateX, y: translateY, angle: rotation };

  const matrix = rotateFirst
    ? [
        [c, -s, result.x],
        [s, c, result.y],
      ]
    : [
        [c, -s, translateX],
        [s, c, translateY],
      ];

  const axis = (ox: number, oy: number, angleDeg: number, len: number) => {
    const a = angleDeg / DEG;
    return {
      x2: originX + ox + len * Math.cos(a),
      y2: originY - oy - len * Math.sin(a),
    };
  };

  const xAxis = axis(result.x, result.y, result.angle, 50);
  const yAxis = axis(result.x, result.y, result.angle + 90, 50);

  return (
    <LabShell
      readouts={
        <>
          <Readout label="Order" value={rotateFirst ? "R then T" : "T then R"} />
          <Readout label="Result x" value={(result.x / 100).toFixed(3)} unit="m" />
          <Readout label="Result y" value={(result.y / 100).toFixed(3)} unit="m" />
          <Readout label="Rotation" value={rotation.toFixed(0)} unit="°" />
        </>
      }
      controls={
        <>
          <Slider label="Rotation about Z" value={rotation} min={-180} max={180} step={1} unit="°" format={(v) => v.toFixed(0)} onChange={setRotation} />
          <Slider label="Translation X" value={translateX} min={-150} max={220} step={1} unit="cm" format={(v) => v.toFixed(0)} onChange={setTranslateX} accent="violet" />
          <Slider label="Translation Y" value={translateY} min={-100} max={180} step={1} unit="cm" format={(v) => v.toFixed(0)} onChange={setTranslateY} accent="violet" />
          <Toggle
            label={rotateFirst ? "Rotate, then translate" : "Translate, then rotate"}
            checked={rotateFirst}
            onChange={setRotateFirst}
          />
        </>
      }
      footnote="Flip the order with the same numbers and the frame lands somewhere else. Matrix multiplication does not commute."
    >
      <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
        <svg viewBox="0 0 400 280" className="h-auto w-full">
          <line x1={originX} y1={originY} x2={originX + 55} y2={originY} className="stroke-rose/40" strokeWidth="2" />
          <line x1={originX} y1={originY} x2={originX} y2={originY - 55} className="stroke-emerald/40" strokeWidth="2" />
          <circle cx={originX} cy={originY} r="4" className="fill-text-3" />
          <text x={originX - 6} y={originY + 18} textAnchor="end" className="fill-text-3 font-mono text-[10px]">origin</text>

          <line
            x1={originX}
            y1={originY}
            x2={originX + result.x}
            y2={originY - result.y}
            className="stroke-line-strong"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          <line x1={originX + result.x} y1={originY - result.y} x2={xAxis.x2} y2={xAxis.y2} className="stroke-rose" strokeWidth="3" />
          <line x1={originX + result.x} y1={originY - result.y} x2={yAxis.x2} y2={yAxis.y2} className="stroke-emerald" strokeWidth="3" />
          <circle cx={originX + result.x} cy={originY - result.y} r="5" className="fill-signal" />
        </svg>

        <div className="self-center">
          <p className="label-tech mb-2">Homogeneous matrix</p>
          <div className="overflow-x-auto rounded-lg border border-line bg-surface-2 p-3 font-mono text-[11px] tabular-nums">
            <table className="w-full">
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className={`px-1.5 py-1 text-right ${j === 2 ? "text-signal" : "text-text-1"}`}>
                        {j === 2 ? (cell / 100).toFixed(3) : cell.toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="text-text-3">
                  <td className="px-1.5 py-1 text-right">0.000</td>
                  <td className="px-1.5 py-1 text-right">0.000</td>
                  <td className="px-1.5 py-1 text-right">1.000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-text-3">
            Left 2×2 is the rotation; right column is the translation in metres.
          </p>
        </div>
      </div>
    </LabShell>
  );
}
