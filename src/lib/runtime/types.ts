// Shared types for the in-browser code runtime.

export type StreamKind = 'stdout' | 'stderr' | 'system';

export interface OutputChunk {
  kind: StreamKind;
  text: string;
}

export interface RunRequest {
  filename: string;
  code: string;
  /** Lines fed to the program's stdin, in order. */
  stdin?: string;
  /** Hard wall-clock limit in ms. Local runners are terminated; remote ones are abandoned. */
  timeoutMs?: number;
  /** Streamed as the program produces output. */
  onOutput?: (chunk: OutputChunk) => void;
  /** Progress messages for slow one-time setup (downloading a runtime, etc). */
  onStatus?: (message: string) => void;
  /** The program called console.clear(). */
  onClear?: () => void;
  signal?: AbortSignal;
}

export interface RunResult {
  /** Process exit code. 0 is success; 124 is our timeout convention. */
  exitCode: number;
  /** Full stdout, also delivered incrementally through onOutput. */
  stdout: string;
  stderr: string;
  /** Wall-clock duration in ms. */
  durationMs: number;
  /** Which engine actually ran it. */
  engine: EngineId;
  /** Set when the run never started (unsupported language, network down, ...). */
  error?: string;
}

export type EngineId =
  | 'worker-js'      // sandboxed Web Worker, runs locally
  | 'pyodide'        // CPython on WebAssembly, runs locally
  | 'preview'        // rendered in the Simple Browser instead of executed
  | 'piston'         // remote sandbox for compiled languages
  | 'none';

export interface LanguageSpec {
  id: string;
  /** Human label shown in the UI. */
  label: string;
  /** File extensions that map to this language. */
  extensions: string[];
  engine: EngineId;
  /** Piston language id, when engine is 'piston'. */
  pistonId?: string;
  /** Shown in the Run button tooltip / terminal banner. */
  runHint: string;
  /** True when running needs a network round trip. */
  remote: boolean;
}
