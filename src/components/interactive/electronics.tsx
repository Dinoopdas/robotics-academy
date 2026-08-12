"use client";

import { useState } from "react";

import { LabButton, LabShell, Readout, Slider } from "./controls";

// ---------------------------------------------------------------------------
// Ohm's law
// ---------------------------------------------------------------------------

type Solve = "V" | "I" | "R";

export function OhmsLawCalculator() {
  const [solveFor, setSolveFor] = useState<Solve>("R");
  const [voltage, setVoltage] = useState(3);
  const [current, setCurrent] = useState(0.02);
  const [resistance, setResistance] = useState(150);

  const computed =
    solveFor === "V"
      ? current * resistance
      : solveFor === "I"
        ? resistance === 0
          ? Infinity
          : voltage / resistance
        : current === 0
          ? Infinity
          : voltage / current;

  const V = solveFor === "V" ? computed : voltage;
  const I = solveFor === "I" ? computed : current;
  const R = solveFor === "R" ? computed : resistance;
  const power = V * I;

  const formatOhms = (value: number) =>
    !Number.isFinite(value)
      ? "∞"
      : value >= 1000
        ? `${(value / 1000).toFixed(2)} kΩ`
        : `${value.toFixed(1)} Ω`;

  const formatAmps = (value: number) =>
    !Number.isFinite(value)
      ? "∞"
      : value < 1
        ? `${(value * 1000).toFixed(1)} mA`
        : `${value.toFixed(2)} A`;

  return (
    <LabShell
      readouts={
        <>
          <Readout label="Voltage" value={V.toFixed(2)} unit="V" tone={solveFor === "V" ? "good" : "default"} />
          <Readout label="Current" value={formatAmps(I)} tone={solveFor === "I" ? "good" : "default"} />
          <Readout label="Resistance" value={formatOhms(R)} tone={solveFor === "R" ? "good" : "default"} />
          <Readout
            label="Power"
            value={power < 1 ? `${(power * 1000).toFixed(0)} mW` : `${power.toFixed(2)} W`}
            tone={power > 0.25 ? "warn" : "default"}
          />
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            {(["V", "I", "R"] as Solve[]).map((option) => (
              <LabButton
                key={option}
                variant={solveFor === option ? "primary" : "secondary"}
                onClick={() => setSolveFor(option)}
              >
                Solve for {option === "V" ? "voltage" : option === "I" ? "current" : "resistance"}
              </LabButton>
            ))}
          </div>

          {solveFor !== "V" ? (
            <Slider label="Voltage across the component" value={voltage} min={0} max={24} step={0.1} unit="V" onChange={setVoltage} format={(v) => v.toFixed(1)} />
          ) : null}
          {solveFor !== "I" ? (
            <Slider label="Current through it" value={current} min={0.001} max={5} step={0.001} unit="A" onChange={setCurrent} format={(v) => (v < 1 ? `${(v * 1000).toFixed(0)} m` : v.toFixed(2))} accent="violet" />
          ) : null}
          {solveFor !== "R" ? (
            <Slider label="Resistance" value={resistance} min={1} max={2000} step={1} unit="Ω" onChange={setResistance} format={(v) => v.toFixed(0)} accent="amber" />
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-line pt-3">
            <LabButton onClick={() => { setSolveFor("R"); setVoltage(3); setCurrent(0.02); }}>
              LED on 5 V
            </LabButton>
            <LabButton onClick={() => { setSolveFor("I"); setVoltage(12); setResistance(2); }}>
              Motor stall
            </LabButton>
            <LabButton onClick={() => { setSolveFor("V"); setCurrent(0.5); setResistance(10); }}>
              Sense resistor
            </LabButton>
          </div>
        </>
      }
      footnote={
        power > 0.25
          ? `${power.toFixed(2)} W exceeds a standard 0.25 W resistor's rating — it would overheat.`
          : "V = I × R.  Power P = V × I decides what gets hot."
      }
    >
      <svg viewBox="0 0 400 170" className="h-auto w-full">
        <rect x="40" y="40" width="320" height="90" rx="4" className="fill-none stroke-line-strong" strokeWidth="2" />

        {/* Supply */}
        <line x1="40" y1="72" x2="40" y2="62" className="stroke-line-strong" strokeWidth="2" />
        <line x1="28" y1="76" x2="52" y2="76" className="stroke-signal" strokeWidth="3" />
        <line x1="34" y1="84" x2="46" y2="84" className="stroke-signal" strokeWidth="2" />
        <line x1="40" y1="88" x2="40" y2="98" className="stroke-line-strong" strokeWidth="2" />
        <text x="20" y="115" className="fill-signal font-mono text-[10px]">{V.toFixed(1)} V</text>

        {/* Resistor */}
        <rect x="160" y="30" width="80" height="20" rx="3" className="fill-surface-2 stroke-amber" strokeWidth="2" />
        <text x="200" y="24" textAnchor="middle" className="fill-amber font-mono text-[10px]">{formatOhms(R)}</text>

        {/* Current arrows */}
        {[95, 130, 280, 315].map((x) => (
          <path key={x} d={`M${x} 40 l8 0 m-3 -3 l3 3 l-3 3`} className="stroke-emerald" strokeWidth="1.5" fill="none" />
        ))}
        <text x="200" y="146" textAnchor="middle" className="fill-emerald font-mono text-[10px]">
          I = {formatAmps(I)}
        </text>

        <text x="360" y="115" textAnchor="end" className="fill-text-3 font-mono text-[10px]">
          P = {power < 1 ? `${(power * 1000).toFixed(0)} mW` : `${power.toFixed(2)} W`}
        </text>
      </svg>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------
// Ultrasonic sensor simulator
// ---------------------------------------------------------------------------

export function SensorSimulator({ sensor = "ultrasonic" }: { sensor?: string }) {
  // Only ultrasonic is modelled so far. Saying so beats silently rendering an
  // ultrasonic beam under an "IR sensor" heading.
  if (sensor !== "ultrasonic") {
    return (
      <div className="rounded-panel border border-dashed border-line bg-surface-2 px-4 py-8 text-center">
        <p className="text-sm text-text-2">
          The <span className="font-mono">{sensor}</span> simulator has not been built yet.
        </p>
        <p className="mt-1 text-xs text-text-3">Ultrasonic is the one currently modelled.</p>
      </div>
    );
  }

  return <UltrasonicSimulator />;
}

function UltrasonicSimulator() {
  const [wallAngle, setWallAngle] = useState(0);
  const [wallDistance, setWallDistance] = useState(120);
  const [postPresent, setPostPresent] = useState(false);
  const [postDistance, setPostDistance] = useState(70);

  const beamHalfAngle = 15; // HC-SR04 is roughly 30° wide

  // Beyond about 30° of tilt the specular reflection leaves the transducer
  // entirely and no echo comes back at all.
  const echoReturns = Math.abs(wallAngle) <= 30;

  // A thin post inside the beam is swamped by the much larger wall return,
  // unless the wall itself is not returning anything.
  const postDetected = postPresent && !echoReturns;

  const reading = postDetected ? postDistance : echoReturns ? wallDistance : null;

  const originX = 60;
  const originY = 150;
  const scale = 1.6;

  const beamPath = () => {
    const len = 260;
    const a = (beamHalfAngle * Math.PI) / 180;
    return `M${originX} ${originY} L${originX + len} ${originY - len * Math.tan(a)} L${originX + len} ${originY + len * Math.tan(a)} Z`;
  };

  const wallX = originX + wallDistance * scale;
  const wallRad = (wallAngle * Math.PI) / 180;
  const wallHalf = 90;

  return (
    <LabShell
      readouts={
        <>
          <Readout label="True wall distance" value={(wallDistance / 100).toFixed(2)} unit="m" />
          <Readout
            label="Sensor reports"
            value={reading === null ? "no echo" : (reading / 100).toFixed(2)}
            unit={reading === null ? undefined : "m"}
            tone={reading === null ? "bad" : postDetected ? "warn" : "good"}
          />
          <Readout label="Wall angle" value={wallAngle.toFixed(0)} unit="°" tone={echoReturns ? "default" : "bad"} />
          <Readout
            label="Interpreted as"
            value={reading === null ? "CLEAR (wrong)" : reading < 40 ? "OBSTACLE" : "clear"}
            tone={reading === null ? "bad" : reading < 40 ? "warn" : "good"}
          />
        </>
      }
      controls={
        <>
          <Slider label="Wall angle" value={wallAngle} min={-60} max={60} step={1} unit="°" format={(v) => v.toFixed(0)} onChange={setWallAngle} />
          <Slider label="Wall distance" value={wallDistance} min={30} max={200} step={1} unit="cm" format={(v) => v.toFixed(0)} onChange={setWallDistance} accent="violet" />
          <div className="flex flex-wrap items-center gap-2">
            <LabButton variant={postPresent ? "primary" : "secondary"} onClick={() => setPostPresent(!postPresent)}>
              {postPresent ? "Remove thin post" : "Add thin post"}
            </LabButton>
            {postPresent ? (
              <div className="w-full pt-2">
                <Slider label="Post distance" value={postDistance} min={30} max={180} step={1} unit="cm" format={(v) => v.toFixed(0)} onChange={setPostDistance} accent="amber" />
              </div>
            ) : null}
          </div>
        </>
      }
      footnote={
        reading === null
          ? "No echo returned. The sensor reports maximum range — which reads exactly like a clear path. This is the failure that causes crashes."
          : postDetected
            ? "Only the post is detected, because the wall's echo went elsewhere. The reading is real but not the obstacle you expected."
            : postPresent
              ? "The post is invisible: the wall's much stronger return arrives first and dominates."
              : "A square-on wall gives a clean, reliable echo. This is the only condition ultrasonic sensors are good at."
      }
    >
      <svg viewBox="0 0 400 300" className="h-auto w-full">
        <path d={beamPath()} className="fill-signal/10 stroke-signal/30" strokeWidth="1" strokeDasharray="4 4" />

        <rect x={originX - 24} y={originY - 16} width="26" height="32" rx="4" className="fill-surface-2 stroke-line-strong" strokeWidth="2" />
        <circle cx={originX - 16} cy={originY - 7} r="5" className="fill-surface-3 stroke-line-strong" strokeWidth="1.5" />
        <circle cx={originX - 16} cy={originY + 7} r="5" className="fill-surface-3 stroke-line-strong" strokeWidth="1.5" />

        <g transform={`translate(${wallX}, ${originY}) rotate(${wallAngle})`}>
          <line x1="0" y1={-wallHalf} x2="0" y2={wallHalf} className={echoReturns ? "stroke-emerald" : "stroke-rose"} strokeWidth="5" strokeLinecap="round" />
        </g>

        {postPresent ? (
          <line
            x1={originX + postDistance * scale}
            y1={originY - 26}
            x2={originX + postDistance * scale}
            y2={originY + 26}
            className={postDetected ? "stroke-amber" : "stroke-text-3"}
            strokeWidth="3"
            strokeLinecap="round"
          />
        ) : null}

        {echoReturns ? (
          <path
            d={`M${originX + 4} ${originY} L${wallX - 6} ${originY}`}
            className="stroke-emerald"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        ) : (
          <path
            d={`M${originX + 4} ${originY} L${wallX - 6} ${originY} L${wallX + 70 * Math.sin(wallRad * 2)} ${originY - 70 * Math.cos(wallRad * 2)}`}
            className="stroke-rose/60"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
          />
        )}

        {!echoReturns ? (
          <text x="200" y="278" textAnchor="middle" className="fill-rose font-mono text-[11px] font-semibold">
            ECHO REFLECTED AWAY — SENSOR SEES NOTHING
          </text>
        ) : null}
      </svg>
    </LabShell>
  );
}
