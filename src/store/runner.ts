import { create } from 'zustand';
import { runCode, languageFor, buildPreviewDocument } from '@/lib/runtime';
import type { EngineId, RunResult } from '@/lib/runtime';

export type LineKind = 'input' | 'stdout' | 'stderr' | 'info' | 'success' | 'system';

export interface TerminalLine {
  id: number;
  kind: LineKind;
  text: string;
}

let lineId = 0;

interface RunnerState {
  lines: TerminalLine[];
  running: boolean;
  runningFile: string | null;
  engine: EngineId | null;
  lastResult: RunResult | null;
  stdin: string;
  controller: AbortController | null;
  /** True when the last stream chunk had no trailing newline, so the next one continues it. */
  openLine: boolean;

  write: (kind: LineKind, text: string) => void;
  /** Appends raw stream text, merging into the previous line when it did not end with a newline. */
  writeStream: (kind: 'stdout' | 'stderr', text: string) => void;
  clear: () => void;
  setStdin: (value: string) => void;
  run: (filename: string, code: string, onPreview?: (doc: string, filename: string) => void) => Promise<void>;
  stop: () => void;
}

export const useRunnerStore = create<RunnerState>((set, get) => ({
  lines: [
    { id: lineId++, kind: 'info', text: "Portfolio shell — type 'help' for commands." },
    { id: lineId++, kind: 'info', text: "Run the open file with the ▶ button or Ctrl+Enter." },
  ],
  running: false,
  runningFile: null,
  engine: null,
  lastResult: null,
  stdin: '',
  controller: null,
  openLine: false,

  write: (kind, text) =>
    set((state) => ({
      lines: [...state.lines, ...text.split('\n').map((t) => ({ id: lineId++, kind, text: t }))],
      openLine: false,
    })),

  writeStream: (kind, text) =>
    set((state) => {
      if (!text) return state;
      const lines = [...state.lines];
      const parts = text.split('\n');

      // Continue the previous line when the last chunk had no trailing newline, so
      // process.stdout.write('a') followed by write('b') renders as "ab", not two lines.
      const last = lines[lines.length - 1];
      if (state.openLine && last && last.kind === kind) {
        lines[lines.length - 1] = { ...last, text: last.text + parts[0] };
      } else {
        lines.push({ id: lineId++, kind, text: parts[0] });
      }
      for (let i = 1; i < parts.length; i++) {
        lines.push({ id: lineId++, kind, text: parts[i] });
      }

      // A chunk ending in '\n' leaves a trailing empty element from split(); it is the
      // start of the next line, tracked by openLine rather than kept as a blank row.
      const endsWithNewline = text.endsWith('\n');
      if (endsWithNewline) lines.pop();

      return { lines, openLine: !endsWithNewline };
    }),

  clear: () => set({ lines: [], openLine: false }),

  setStdin: (value) => set({ stdin: value }),

  stop: () => {
    get().controller?.abort();
  },

  run: async (filename, code, onPreview) => {
    const state = get();
    if (state.running) {
      state.write('stderr', 'Something is already running. Stop it first.');
      return;
    }

    const lang = languageFor(filename);
    if (!lang) {
      state.write('stderr', `Nothing here knows how to run ${filename}.`);
      return;
    }

    // Markup is rendered, not executed.
    if (lang.engine === 'preview') {
      const doc = buildPreviewDocument(filename, code);
      onPreview?.(doc, filename);
      state.write('success', `Rendering ${filename} in the Simple Browser.`);
      return;
    }

    const controller = new AbortController();
    set({ running: true, runningFile: filename, engine: lang.engine, controller });
    get().write('input', `$ run ${filename}`);
    if (lang.remote) {
      get().write('info', `${lang.label}: ${lang.runHint}.`);
    }

    const result = await runCode({
      filename,
      code,
      stdin: get().stdin,
      timeoutMs: lang.engine === 'pyodide' ? 30_000 : lang.remote ? 25_000 : 10_000,
      signal: controller.signal,
      onOutput: ({ kind, text }) => {
        if (kind === 'system') return;
        get().writeStream(kind, text);
      },
      onStatus: (message) => get().write('info', message),
      onClear: () => set({ lines: [], openLine: false }),
    });

    if (result.error && result.error !== 'timeout' && result.error !== 'aborted') {
      get().write('stderr', result.error);
    }

    const seconds = (result.durationMs / 1000).toFixed(2);
    if (result.exitCode === 0) {
      get().write('success', `[${filename} finished in ${seconds}s]`);
    } else {
      get().write('stderr', `[${filename} exited with code ${result.exitCode} after ${seconds}s]`);
    }

    set({ running: false, runningFile: null, controller: null, lastResult: result });
  },
}));
