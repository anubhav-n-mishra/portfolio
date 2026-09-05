import { JS_WORKER_SOURCE } from './workerSource';
import type { RunRequest, RunResult } from './types';

let blobUrl: string | null = null;

function workerUrl(): string {
  if (!blobUrl) {
    blobUrl = URL.createObjectURL(
      new Blob([JS_WORKER_SOURCE], { type: 'application/javascript' })
    );
  }
  return blobUrl;
}

/**
 * Runs JavaScript or TypeScript on a dedicated worker thread.
 *
 * A fresh worker per run gives every execution clean globals, and means a runaway
 * loop can be killed outright — there is no cooperative way to interrupt a busy
 * `while (true)` from the main thread, but terminating its thread always works.
 */
export async function runJavaScript(req: RunRequest): Promise<RunResult> {
  const { filename, code, stdin = '', timeoutMs = 10_000, onOutput, onStatus, onClear, signal } = req;
  const isTypeScript = /\.tsx?$/i.test(filename);
  const started = performance.now();

  let stdout = '';
  let stderr = '';

  return new Promise<RunResult>((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(workerUrl());
    } catch (err) {
      resolve({
        exitCode: 1,
        stdout: '',
        stderr: '',
        durationMs: 0,
        engine: 'worker-js',
        error: `Could not start the sandbox worker: ${(err as Error).message}`,
      });
      return;
    }

    let settled = false;
    const finish = (exitCode: number, error?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      worker.terminate();
      resolve({
        exitCode,
        stdout,
        stderr,
        durationMs: Math.round(performance.now() - started),
        engine: 'worker-js',
        error,
      });
    };

    const timer = setTimeout(() => {
      const msg = `\nExecution timed out after ${timeoutMs / 1000}s and was terminated.\n`;
      stderr += msg;
      onOutput?.({ kind: 'stderr', text: msg });
      finish(124, 'timeout');
    }, timeoutMs);

    const onAbort = () => {
      const msg = '\nStopped.\n';
      stderr += msg;
      onOutput?.({ kind: 'stderr', text: msg });
      finish(130, 'aborted');
    };
    signal?.addEventListener('abort', onAbort);

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data || {};
      switch (data.type) {
        case 'out':
          if (data.kind === 'stderr') stderr += data.text;
          else stdout += data.text;
          onOutput?.({ kind: data.kind, text: data.text });
          break;
        case 'status':
          onStatus?.(data.message);
          break;
        case 'clear':
          stdout = '';
          onClear?.();
          break;
        case 'done':
          finish(data.exitCode ?? 0, data.error ?? undefined);
          break;
      }
    };

    worker.onerror = (event) => {
      const msg = `${event.message || 'Worker error'}\n`;
      stderr += msg;
      onOutput?.({ kind: 'stderr', text: msg });
      finish(1, event.message);
    };

    worker.postMessage({ type: 'run', code, filename, stdin, isTypeScript });
  });
}
