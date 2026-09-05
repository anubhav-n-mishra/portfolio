import type { RunRequest, RunResult } from './types';

// Pyodide is real CPython compiled to WebAssembly. It is a large download, so it is
// fetched only the first time someone actually runs a .py file, then kept warm in a
// long-lived worker for the rest of the session.
export const PYODIDE_VERSION = '0.26.4';
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const PY_WORKER_SOURCE = String.raw`
'use strict';

var pyodide = null;
var loading = null;
var stdinLines = [];
var stdinCursor = 0;

function post(msg) { self.postMessage(msg); }
function out(kind, text) { post({ type: 'out', kind: kind, text: text }); }

function nextStdinLine() {
  if (stdinCursor >= stdinLines.length) return null;
  return stdinLines[stdinCursor++];
}

function boot() {
  if (loading) return loading;
  loading = (async function () {
    post({ type: 'status', message: 'Downloading CPython (WebAssembly) — first run only...' });
    importScripts('__PYODIDE_CDN__pyodide.js');
    var instance = await self.loadPyodide({ indexURL: '__PYODIDE_CDN__' });
    instance.setStdout({ batched: function (s) { out('stdout', s + '\n'); } });
    instance.setStderr({ batched: function (s) { out('stderr', s + '\n'); } });
    instance.setStdin({ stdin: nextStdinLine, autoEOF: true });
    post({ type: 'status', message: 'Python ' + instance.version + ' ready.' });
    pyodide = instance;
    return instance;
  })();
  return loading;
}

self.onmessage = async function (event) {
  var data = event.data || {};
  if (data.type !== 'run') return;

  stdinLines = typeof data.stdin === 'string' && data.stdin.length
    ? data.stdin.replace(/\n$/, '').split('\n')
    : [];
  stdinCursor = 0;

  var py;
  try {
    py = await boot();
  } catch (e) {
    out('stderr', 'Could not load the Python runtime: ' + (e && e.message ? e.message : String(e)) + '\n');
    post({ type: 'done', exitCode: 1, error: 'pyodide-load-failed' });
    return;
  }

  // Reset stdin for this run now that the instance exists.
  py.setStdin({ stdin: nextStdinLine, autoEOF: true });

  try {
    // Auto-install any pure-Python/wheel dependency the file imports, when it is
    // one Pyodide ships. Cheap when there is nothing to do.
    await py.loadPackagesFromImports(data.code, {
      messageCallback: function (m) { post({ type: 'status', message: m }); },
      errorCallback: function () {}
    });
  } catch (e) { /* an unavailable package should surface as a normal ImportError */ }

  try {
    await py.runPythonAsync(data.code);
    post({ type: 'done', exitCode: 0 });
  } catch (e) {
    var text = e && e.message ? e.message : String(e);
    if (/SystemExit/.test(text)) {
      var m = text.match(/SystemExit:\s*(\d+)/);
      post({ type: 'done', exitCode: m ? parseInt(m[1], 10) : 0 });
      return;
    }
    out('stderr', text.replace(/\n$/, '') + '\n');
    post({ type: 'done', exitCode: 1 });
  }
};
`.replace(/__PYODIDE_CDN__/g, PYODIDE_CDN);

let worker: Worker | null = null;
let workerBusy = false;

function ensureWorker(): Worker {
  if (!worker) {
    const url = URL.createObjectURL(new Blob([PY_WORKER_SOURCE], { type: 'application/javascript' }));
    worker = new Worker(url);
  }
  return worker;
}

/** Drop the warm interpreter — used when a run has to be killed mid-flight. */
function resetWorker() {
  worker?.terminate();
  worker = null;
  workerBusy = false;
}

export function isPythonWarm(): boolean {
  return worker !== null && !workerBusy;
}

export async function runPython(req: RunRequest): Promise<RunResult> {
  const { code, stdin = '', timeoutMs = 30_000, onOutput, onStatus, signal } = req;
  const started = performance.now();

  if (workerBusy) {
    return {
      exitCode: 1,
      stdout: '',
      stderr: '',
      durationMs: 0,
      engine: 'pyodide',
      error: 'A Python program is already running. Stop it first.',
    };
  }

  let stdout = '';
  let stderr = '';
  const py = ensureWorker();
  workerBusy = true;

  return new Promise<RunResult>((resolve) => {
    let settled = false;

    const finish = (exitCode: number, error?: string, kill = false) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      py.onmessage = null;
      // Pyodide cannot be interrupted cooperatively here, so a timeout or a stop
      // means throwing the whole interpreter away and reloading on next use.
      if (kill) resetWorker();
      else workerBusy = false;
      resolve({
        exitCode,
        stdout,
        stderr,
        durationMs: Math.round(performance.now() - started),
        engine: 'pyodide',
        error,
      });
    };

    const timer = setTimeout(() => {
      const msg = `\nExecution timed out after ${timeoutMs / 1000}s and the interpreter was terminated.\n`;
      stderr += msg;
      onOutput?.({ kind: 'stderr', text: msg });
      finish(124, 'timeout', true);
    }, timeoutMs);

    const onAbort = () => {
      const msg = '\nStopped.\n';
      stderr += msg;
      onOutput?.({ kind: 'stderr', text: msg });
      finish(130, 'aborted', true);
    };
    signal?.addEventListener('abort', onAbort);

    py.onmessage = (event: MessageEvent) => {
      const data = event.data || {};
      if (data.type === 'out') {
        if (data.kind === 'stderr') stderr += data.text;
        else stdout += data.text;
        onOutput?.({ kind: data.kind, text: data.text });
      } else if (data.type === 'status') {
        onStatus?.(data.message);
      } else if (data.type === 'done') {
        finish(data.exitCode ?? 0, data.error ?? undefined);
      }
    };

    py.onerror = (event) => {
      const msg = `${event.message || 'Python worker error'}\n`;
      stderr += msg;
      onOutput?.({ kind: 'stderr', text: msg });
      finish(1, event.message, true);
    };

    py.postMessage({ type: 'run', code, stdin });
  });
}
