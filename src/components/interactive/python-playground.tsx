"use client";

import { useCallback, useRef, useState } from "react";

import { LabButton } from "./controls";

/**
 * Runs Python entirely in the visitor's browser via Pyodide (CPython compiled
 * to WebAssembly).
 *
 * This is the "secure sandbox" the platform needs: user code never reaches the
 * application server, so there is no sandbox escape that could compromise the
 * host. The WebAssembly runtime has no filesystem, no network and no access to
 * the page's cookies or session.
 *
 * Pyodide is ~10 MB, so it is fetched only on the first Run click rather than
 * on page load — a lesson that is read but not run costs nothing.
 */

const PYODIDE_VERSION = "0.28.0";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

interface PyodideRuntime {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideRuntime>;
  }
}

type Status = "idle" | "loading" | "running" | "ready" | "failed";

export function PythonPlayground({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode || DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const runtime = useRef<PyodideRuntime | null>(null);

  const loadRuntime = useCallback(async (): Promise<PyodideRuntime> => {
    if (runtime.current) return runtime.current;

    setStatus("loading");

    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${PYODIDE_URL}pyodide.js`;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Could not download the Python runtime. Check your connection."));
        document.head.appendChild(script);
      });
    }

    if (!window.loadPyodide) {
      throw new Error("The Python runtime loaded but did not initialise.");
    }

    const instance = await window.loadPyodide({ indexURL: PYODIDE_URL });
    runtime.current = instance;
    return instance;
  }, []);

  const run = useCallback(async () => {
    setError(null);
    setOutput([]);

    try {
      const pyodide = await loadRuntime();
      setStatus("running");

      const lines: string[] = [];
      pyodide.setStdout({ batched: (text) => lines.push(text) });
      pyodide.setStderr({ batched: (text) => lines.push(text) });

      await pyodide.runPythonAsync(code);

      setOutput(lines.length ? lines : ["(the program produced no output)"]);
      setStatus("ready");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      setError(message);
      setStatus(runtime.current ? "ready" : "failed");
    }
  }, [code, loadRuntime]);

  const lineCount = code.split("\n").length;

  return (
    <div className="overflow-hidden rounded-panel border border-line bg-surface-1">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-3 py-2">
        <span className="label-tech">Python · runs in your browser</span>
        <div className="flex items-center gap-2">
          <LabButton onClick={() => setCode(initialCode || DEFAULT_CODE)}>Reset</LabButton>
          <LabButton
            variant="primary"
            onClick={run}
            disabled={status === "loading" || status === "running"}
          >
            {status === "loading" ? "Loading Python…" : status === "running" ? "Running…" : "Run"}
          </LabButton>
        </div>
      </div>

      <div className="relative">
        {/* A textarea rather than a full editor: it keeps the page light, works
            with screen readers and mobile keyboards, and the syntax colouring a
            code editor would add is not what makes these snippets readable. */}
        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          spellCheck={false}
          rows={Math.min(24, Math.max(8, lineCount + 1))}
          className="scrollbar-slim block w-full resize-y bg-surface-1 p-4 font-mono text-[13px] leading-relaxed text-text-1 outline-none"
          aria-label="Python code editor"
        />
      </div>

      {status === "loading" ? (
        <div className="border-t border-line px-4 py-3 text-xs text-text-3">
          Downloading the Python runtime (about 10 MB). This happens once per visit.
        </div>
      ) : null}

      {error ? (
        <div className="border-t border-line bg-rose-soft/40 px-4 py-3">
          <p className="label-tech mb-1 text-rose">Error</p>
          <pre className="scrollbar-slim overflow-x-auto font-mono text-xs whitespace-pre-wrap text-rose">
            {error}
          </pre>
        </div>
      ) : null}

      {output.length > 0 ? (
        <div className="border-t border-line bg-surface-2 px-4 py-3">
          <p className="label-tech mb-1.5">Output</p>
          <pre className="scrollbar-slim overflow-x-auto font-mono text-xs whitespace-pre-wrap text-text-1">
            {output.join("\n")}
          </pre>
        </div>
      ) : null}

      <p className="border-t border-line px-4 py-2 text-[11px] text-text-3">
        Your code runs locally in a WebAssembly sandbox. Nothing is uploaded, and nothing is stored.
      </p>
    </div>
  );
}

const DEFAULT_CODE = `# Differential drive: velocity command to wheel speeds
def wheel_speeds(v, omega, track_width):
    half = omega * track_width / 2.0
    return v - half, v + half

for v, omega in [(1.0, 0.0), (0.0, 2.0), (1.0, 2.0)]:
    left, right = wheel_speeds(v, omega, 0.5)
    print(f"v={v:.1f} omega={omega:.1f}  ->  left={left:+.2f} right={right:+.2f}")
`;
