"use client";

import dynamic from "next/dynamic";

/**
 * Simulators are code-split and loaded on demand.
 *
 * A lesson typically embeds one widget, so bundling all of them into every
 * lesson page would ship several hundred kilobytes nobody uses. `ssr: false`
 * because each one is driven by pointer input and animation frames — there is
 * nothing meaningful to prerender, and skipping SSR avoids a hydration pass on
 * a component the reader may never scroll to.
 */

const loading = () => (
  <div className="flex h-56 items-center justify-center rounded-panel border border-line bg-surface-1">
    <span className="flex items-center gap-2 text-xs text-text-3">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-line border-t-signal" />
      Loading simulator…
    </span>
  </div>
);

const ArmForwardKinematics = dynamic(
  () => import("./kinematics").then((m) => m.ArmForwardKinematics),
  { ssr: false, loading },
);
const ArmInverseKinematics = dynamic(
  () => import("./kinematics").then((m) => m.ArmInverseKinematics),
  { ssr: false, loading },
);
const DofExplorer = dynamic(() => import("./kinematics").then((m) => m.DofExplorer), {
  ssr: false,
  loading,
});
const FrameViewer = dynamic(() => import("./kinematics").then((m) => m.FrameViewer), {
  ssr: false,
  loading,
});
const TransformVisualiser = dynamic(
  () => import("./kinematics").then((m) => m.TransformVisualiser),
  { ssr: false, loading },
);
const PidSimulator = dynamic(() => import("./control").then((m) => m.PidSimulator), {
  ssr: false,
  loading,
});
const DiffDriveSimulator = dynamic(
  () => import("./control").then((m) => m.DiffDriveSimulator),
  { ssr: false, loading },
);
const PwmVisualiser = dynamic(() => import("./control").then((m) => m.PwmVisualiser), {
  ssr: false,
  loading,
});
const OhmsLawCalculator = dynamic(
  () => import("./electronics").then((m) => m.OhmsLawCalculator),
  { ssr: false, loading },
);
const SensorSimulator = dynamic(
  () => import("./electronics").then((m) => m.SensorSimulator),
  { ssr: false, loading },
);
const PythonPlayground = dynamic(
  () => import("./python-playground").then((m) => m.PythonPlayground),
  { ssr: false, loading },
);

export const WIDGET_KEYS = [
  "arm-fk",
  "arm-ik",
  "dof-explorer",
  "frame-viewer",
  "transform-visualiser",
  "pid-simulator",
  "diff-drive",
  "pwm-visualiser",
  "ohms-law",
  "sensor-sim",
  "python-playground",
] as const;

/**
 * Dispatched with a switch rather than a lookup table so each branch keeps its
 * own prop types — the widgets take different props, and a shared map would
 * have to be typed as `any` to hold them all.
 */
export function InteractiveWidget({
  widget,
  config,
}: {
  widget: string;
  config?: Record<string, unknown>;
}) {
  switch (widget) {
    case "arm-fk":
      return <ArmForwardKinematics showSingularityWarning={Boolean(config?.showSingularityWarning)} />;
    case "arm-ik":
      return <ArmInverseKinematics />;
    case "dof-explorer":
      return <DofExplorer />;
    case "frame-viewer":
      return <FrameViewer />;
    case "transform-visualiser":
      return <TransformVisualiser />;
    case "pid-simulator":
      return <PidSimulator />;
    case "diff-drive":
      return <DiffDriveSimulator />;
    case "pwm-visualiser":
      return <PwmVisualiser />;
    case "ohms-law":
      return <OhmsLawCalculator />;
    case "sensor-sim":
      return <SensorSimulator sensor={typeof config?.sensor === "string" ? config.sensor : "ultrasonic"} />;
    case "python-playground":
      return (
        <PythonPlayground
          initialCode={typeof config?.initialCode === "string" ? config.initialCode : ""}
        />
      );
    default:
      // An unknown key means content references a widget that was renamed or
      // not built yet. Say so plainly rather than rendering an empty box that
      // looks like a broken simulator.
      return (
        <div className="rounded-panel border border-dashed border-line bg-surface-2 px-4 py-8 text-center">
          <p className="text-sm text-text-2">This interactive is not available yet.</p>
          <p className="mt-1 font-mono text-xs text-text-3">widget: {widget}</p>
        </div>
      );
  }
}
