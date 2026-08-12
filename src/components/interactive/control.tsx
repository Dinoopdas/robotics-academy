"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { LabButton, LabShell, Readout, Slider, Toggle } from "./controls";

// ---------------------------------------------------------------------------
// PID simulator
// ---------------------------------------------------------------------------

interface StepResult {
  samples: { t: number; y: number; u: number }[];
  overshootPct: number;
  settlingTime: number | null;
  steadyStateError: number;
}

/**
 * Simulates a second-order plant — a mass with damping, which is what a robot
 * joint approximates — under PID control, and measures the three numbers a
 * control engineer actually tunes against.
 */
function simulate(
  kp: number,
  ki: number,
  kd: number,
  noise: number,
  antiWindup: boolean,
): StepResult {
  const dt = 0.005;
  const duration = 4;
  const steps = Math.round(duration / dt);

  const mass = 1.0;
  const damping = 0.8;
  const gravityLoad = 2.0; // constant disturbance — what makes P-only droop
  const outputLimit = 12;

  const setpoint = 1.0;

  let position = 0;
  let velocity = 0;
  let integral = 0;
  let previousError = setpoint;

  const samples: { t: number; y: number; u: number }[] = [];

  // Deterministic pseudo-noise so the trace is stable across re-renders —
  // a live Math.random() would make the chart jitter on every slider move
  // and hide the effect being demonstrated.
  let seed = 12345;
  const pseudoRandom = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff - 0.5;
  };

  for (let i = 0; i <= steps; i += 1) {
    const measurement = position + noise * pseudoRandom();
    const error = setpoint - measurement;

    integral += error * dt;
    const derivative = (error - previousError) / dt;
    previousError = error;

    let output = kp * error + ki * integral + kd * derivative;
    const clamped = Math.max(-outputLimit, Math.min(outputLimit, output));

    if (antiWindup && clamped !== output) {
      integral -= error * dt;
    }
    output = clamped;

    const acceleration = (output - damping * velocity - gravityLoad) / mass;
    velocity += acceleration * dt;
    position += velocity * dt;

    if (i % 4 === 0) samples.push({ t: i * dt, y: position, u: output });
  }

  const peak = Math.max(...samples.map((s) => s.y));
  const finalValue = samples.slice(-20).reduce((sum, s) => sum + s.y, 0) / 20;
  const overshootPct = setpoint > 0 ? Math.max(0, ((peak - setpoint) / setpoint) * 100) : 0;

  // Settling time: the last moment the response left the ±2% band.
  const band = 0.02 * setpoint;
  let settlingTime: number | null = null;
  for (let i = samples.length - 1; i >= 0; i -= 1) {
    if (Math.abs(samples[i].y - setpoint) > band) {
      settlingTime = samples[i + 1]?.t ?? null;
      break;
    }
    if (i === 0) settlingTime = 0;
  }

  return {
    samples,
    overshootPct,
    settlingTime,
    steadyStateError: setpoint - finalValue,
  };
}

export function PidSimulator() {
  const [kp, setKp] = useState(8);
  const [ki, setKi] = useState(0);
  const [kd, setKd] = useState(0);
  const [noise, setNoise] = useState(0);
  const [antiWindup, setAntiWindup] = useState(true);

  const result = useMemo(
    () => simulate(kp, ki, kd, noise, antiWindup),
    [kp, ki, kd, noise, antiWindup],
  );

  const width = 560;
  const height = 220;
  const padX = 42;
  const padY = 16;

  const yMax = Math.max(1.6, Math.max(...result.samples.map((s) => s.y)) * 1.1);
  const toX = (t: number) => padX + (t / 4) * (width - padX - 12);
  const toY = (y: number) => height - padY - (y / yMax) * (height - padY * 2);

  const path = result.samples.map((s, i) => `${i === 0 ? "M" : "L"}${toX(s.t)},${toY(s.y)}`).join(" ");

  return (
    <LabShell
      readouts={
        <>
          <Readout
            label="Overshoot"
            value={result.overshootPct.toFixed(1)}
            unit="%"
            tone={result.overshootPct > 20 ? "bad" : result.overshootPct > 5 ? "warn" : "good"}
          />
          <Readout
            label="Settling time"
            value={result.settlingTime === null ? "never" : result.settlingTime.toFixed(2)}
            unit={result.settlingTime === null ? undefined : "s"}
            tone={result.settlingTime === null ? "bad" : result.settlingTime > 2 ? "warn" : "good"}
          />
          <Readout
            label="Steady-state error"
            value={result.steadyStateError.toFixed(3)}
            tone={Math.abs(result.steadyStateError) > 0.02 ? "warn" : "good"}
          />
          <Readout label="Peak output" value={Math.max(...result.samples.map((s) => Math.abs(s.u))).toFixed(1)} />
        </>
      }
      controls={
        <>
          <Slider label="Kp — proportional" value={kp} min={0} max={40} step={0.5} onChange={setKp} format={(v) => v.toFixed(1)} />
          <Slider label="Ki — integral" value={ki} min={0} max={30} step={0.5} onChange={setKi} format={(v) => v.toFixed(1)} accent="emerald" />
          <Slider label="Kd — derivative" value={kd} min={0} max={5} step={0.05} onChange={setKd} format={(v) => v.toFixed(2)} accent="violet" />
          <Slider label="Sensor noise" value={noise} min={0} max={0.05} step={0.001} onChange={setNoise} format={(v) => v.toFixed(3)} accent="amber" />
          {/* Presets chosen against this plant's actual dynamics: with
              ẍ = u − 0.8ẋ − 2, the damping ratio is (Kd + 0.8) / (2√Kp), so a
              well-damped response needs a much larger Kd than the textbook
              "start small" advice suggests. */}
          <div className="flex flex-wrap gap-2">
            <Toggle label="Anti-windup" checked={antiWindup} onChange={setAntiWindup} />
            <LabButton onClick={() => { setKp(8); setKi(0); setKd(0); setNoise(0); }}>P only</LabButton>
            <LabButton onClick={() => { setKp(12); setKi(0); setKd(4); setNoise(0); }}>PD</LabButton>
            <LabButton onClick={() => { setKp(16); setKi(6); setKd(5); setNoise(0); }}>Tuned PID</LabButton>
            <LabButton onClick={() => { setKp(38); setKi(0); setKd(0); setNoise(0); }}>Too much Kp</LabButton>
          </div>
        </>
      }
      footnote="A constant gravity load acts on the plant, so proportional-only control always settles below the setpoint. Only Ki removes that offset."
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        {/* Setpoint and tolerance band */}
        <rect x={padX} y={toY(1.02)} width={width - padX - 12} height={toY(0.98) - toY(1.02)} className="fill-emerald/10" />
        <line x1={padX} y1={toY(1)} x2={width - 12} y2={toY(1)} className="stroke-emerald" strokeWidth="1.5" strokeDasharray="6 4" />
        <text x={width - 14} y={toY(1) - 6} textAnchor="end" className="fill-emerald font-mono text-[10px]">setpoint</text>

        {/* Axes */}
        <line x1={padX} y1={padY} x2={padX} y2={height - padY} className="stroke-line-strong" strokeWidth="1" />
        <line x1={padX} y1={height - padY} x2={width - 12} y2={height - padY} className="stroke-line-strong" strokeWidth="1" />

        {[0, 0.5, 1, 1.5].filter((v) => v <= yMax).map((v) => (
          <g key={v}>
            <line x1={padX - 4} y1={toY(v)} x2={padX} y2={toY(v)} className="stroke-line-strong" strokeWidth="1" />
            <text x={padX - 8} y={toY(v) + 3} textAnchor="end" className="fill-text-3 font-mono text-[9px]">{v.toFixed(1)}</text>
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((t) => (
          <text key={t} x={toX(t)} y={height - 3} textAnchor="middle" className="fill-text-3 font-mono text-[9px]">{t}s</text>
        ))}

        <path d={path} className="fill-none stroke-signal" strokeWidth="2" />
      </svg>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------
// Differential drive
// ---------------------------------------------------------------------------

export function DiffDriveSimulator() {
  const [leftSpeed, setLeftSpeed] = useState(0.4);
  const [rightSpeed, setRightSpeed] = useState(0.6);
  const [running, setRunning] = useState(true);
  const [pose, setPose] = useState({ x: 0, y: 0, theta: 0 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const frame = useRef<number | null>(null);

  const trackWidth = 0.3;
  const v = (leftSpeed + rightSpeed) / 2;
  const omega = (rightSpeed - leftSpeed) / trackWidth;

  useEffect(() => {
    if (!running) return;

    let previous = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - previous) / 1000);
      previous = now;

      setPose((current) => {
        const midTheta = current.theta + (omega * dt) / 2;
        const next = {
          x: current.x + v * Math.cos(midTheta) * dt,
          y: current.y + v * Math.sin(midTheta) * dt,
          theta: current.theta + omega * dt,
        };
        setTrail((t) => [...t.slice(-400), { x: next.x, y: next.y }]);
        return next;
      });

      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [running, v, omega]);

  const scale = 55;
  const cx = 200;
  const cy = 150;

  const reset = () => {
    setPose({ x: 0, y: 0, theta: 0 });
    setTrail([]);
  };

  const radius = omega === 0 ? null : v / omega;

  return (
    <LabShell
      readouts={
        <>
          <Readout label="v (forward)" value={v.toFixed(3)} unit="m/s" />
          <Readout label="ω (turn)" value={omega.toFixed(3)} unit="rad/s" />
          <Readout
            label="Turn radius"
            value={radius === null ? "∞" : Math.abs(radius) > 20 ? "∞" : radius.toFixed(2)}
            unit={radius === null || Math.abs(radius) > 20 ? undefined : "m"}
          />
          <Readout label="Heading" value={((pose.theta * 180) / Math.PI).toFixed(0)} unit="°" />
        </>
      }
      controls={
        <>
          <Slider label="Left wheel" value={leftSpeed} min={-1} max={1} step={0.01} unit="m/s" onChange={setLeftSpeed} />
          <Slider label="Right wheel" value={rightSpeed} min={-1} max={1} step={0.01} unit="m/s" onChange={setRightSpeed} accent="violet" />
          <div className="flex flex-wrap gap-2">
            <Toggle label={running ? "Running" : "Paused"} checked={running} onChange={setRunning} />
            <LabButton onClick={reset}>Reset pose</LabButton>
            <LabButton onClick={() => { setLeftSpeed(0.5); setRightSpeed(0.5); reset(); }}>Straight</LabButton>
            <LabButton onClick={() => { setLeftSpeed(-0.5); setRightSpeed(0.5); reset(); }}>Spin in place</LabButton>
            <LabButton onClick={() => { setLeftSpeed(0.2); setRightSpeed(0.6); reset(); }}>Arc</LabButton>
          </div>
        </>
      }
      footnote="v = (vR + vL) / 2 and ω = (vR − vL) / L. Notice there is no way to command sideways motion — that is the non-holonomic constraint."
    >
      <svg viewBox="0 0 400 300" className="h-auto w-full">
        <defs>
          <pattern id="dd-grid" width="27.5" height="27.5" patternUnits="userSpaceOnUse">
            <path d="M27.5 0 L0 0 0 27.5" className="fill-none stroke-line" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="400" height="300" fill="url(#dd-grid)" />

        {trail.length > 1 ? (
          <polyline
            points={trail.map((p) => `${cx + p.x * scale},${cy - p.y * scale}`).join(" ")}
            className="fill-none stroke-signal/40"
            strokeWidth="2"
          />
        ) : null}

        <g transform={`translate(${cx + pose.x * scale}, ${cy - pose.y * scale}) rotate(${(-pose.theta * 180) / Math.PI})`}>
          <rect x="-16" y="-11" width="32" height="22" rx="4" className="fill-surface-2 stroke-line-strong" strokeWidth="2" />
          <rect x="-9" y="-15" width="8" height="5" rx="1.5" className="fill-text-3" />
          <rect x="-9" y="10" width="8" height="5" rx="1.5" className="fill-text-3" />
          <line x1="0" y1="0" x2="20" y2="0" className="stroke-signal" strokeWidth="2.5" />
          <circle cx="20" cy="0" r="3" className="fill-signal" />
        </g>

        <circle cx={cx} cy={cy} r="3" className="fill-text-3" />
        <text x={cx + 6} y={cy + 14} className="fill-text-3 font-mono text-[9px]">start</text>
      </svg>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------
// PWM
// ---------------------------------------------------------------------------

export function PwmVisualiser() {
  const [duty, setDuty] = useState(45);
  const [frequency, setFrequency] = useState(2000);
  const [supply, setSupply] = useState(12);

  const width = 560;
  const height = 190;
  const padX = 44;
  const padY = 18;

  // Show a fixed 4 ms window so lowering the frequency visibly widens the pulses.
  const windowMs = 4;
  const periodMs = 1000 / frequency;
  const cycles = windowMs / periodMs;

  const path = useMemo(() => {
    const toX = (ms: number) => padX + (ms / windowMs) * (width - padX - 12);
    const high = padY;
    const low = height - padY - 22;

    let d = `M${toX(0)},${low}`;
    for (let i = 0; i < Math.min(cycles, 400); i += 1) {
      const start = i * periodMs;
      const onEnd = start + (periodMs * duty) / 100;
      const end = start + periodMs;
      d += ` L${toX(start)},${high} L${toX(onEnd)},${high} L${toX(onEnd)},${low} L${toX(Math.min(end, windowMs))},${low}`;
      if (end > windowMs) break;
    }
    return d;
  }, [duty, periodMs, cycles]);

  const averageVoltage = (duty / 100) * supply;
  const averageY = height - padY - 22 - (duty / 100) * (height - padY * 2 - 22);

  const audible = frequency < 18000;
  const rippleVisible = frequency < 500;

  return (
    <LabShell
      readouts={
        <>
          <Readout label="Duty cycle" value={duty.toFixed(0)} unit="%" />
          <Readout label="Average voltage" value={averageVoltage.toFixed(2)} unit="V" tone="good" />
          <Readout label="Period" value={periodMs < 1 ? (periodMs * 1000).toFixed(0) : periodMs.toFixed(2)} unit={periodMs < 1 ? "µs" : "ms"} />
          <Readout
            label="Audible?"
            value={audible ? "yes" : "no"}
            tone={audible ? "warn" : "good"}
          />
        </>
      }
      controls={
        <>
          <Slider label="Duty cycle" value={duty} min={0} max={100} step={1} unit="%" format={(v) => v.toFixed(0)} onChange={setDuty} />
          <Slider label="Carrier frequency" value={frequency} min={100} max={25000} step={100} unit="Hz" format={(v) => v.toFixed(0)} onChange={setFrequency} accent="violet" />
          <Slider label="Supply voltage" value={supply} min={3.3} max={24} step={0.1} unit="V" format={(v) => v.toFixed(1)} onChange={setSupply} accent="amber" />
        </>
      }
      footnote={
        rippleVisible
          ? "Below about 500 Hz the motor's inertia can no longer smooth the switching, so torque ripples audibly and mechanically."
          : audible
            ? "Below roughly 18 kHz the switching is within human hearing — this is the whine you hear from cheap motor drivers."
            : "Above about 18 kHz the switching is inaudible, at the cost of slightly higher switching losses."
      }
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <line x1={padX} y1={padY} x2={padX} y2={height - padY - 22} className="stroke-line-strong" strokeWidth="1" />
        <line x1={padX} y1={height - padY - 22} x2={width - 12} y2={height - padY - 22} className="stroke-line-strong" strokeWidth="1" />

        <text x={padX - 8} y={padY + 4} textAnchor="end" className="fill-text-3 font-mono text-[9px]">{supply.toFixed(1)}V</text>
        <text x={padX - 8} y={height - padY - 20} textAnchor="end" className="fill-text-3 font-mono text-[9px]">0V</text>

        <line x1={padX} y1={averageY} x2={width - 12} y2={averageY} className="stroke-emerald" strokeWidth="1.5" strokeDasharray="6 4" />
        <text x={width - 14} y={averageY - 6} textAnchor="end" className="fill-emerald font-mono text-[10px]">
          average {averageVoltage.toFixed(2)} V
        </text>

        <path d={path} className="fill-none stroke-signal" strokeWidth="2" strokeLinejoin="miter" />

        <text x={padX} y={height - 4} className="fill-text-3 font-mono text-[9px]">0 ms</text>
        <text x={width - 12} y={height - 4} textAnchor="end" className="fill-text-3 font-mono text-[9px]">{windowMs} ms</text>
      </svg>
    </LabShell>
  );
}
