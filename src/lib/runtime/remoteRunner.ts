import type { LanguageSpec, RunRequest, RunResult } from './types';

// Compiled languages need a real toolchain. Rather than shipping a 40MB WebAssembly
// clang, they go to Piston — a public, keyless, sandboxed execution API. That keeps
// the site itself a static export with no backend of its own, which is the whole
// point: JS, TS and Python still run locally and work with the network down.
const PISTON_ENDPOINT = 'https://emkc.org/api/v2/piston/execute';

interface PistonStage {
  stdout?: string;
  stderr?: string;
  code?: number | null;
  signal?: string | null;
  output?: string;
}

interface PistonResponse {
  run?: PistonStage;
  compile?: PistonStage;
  message?: string;
}

/** Piston keys some languages on a specific entry filename. */
function entryFilename(lang: LanguageSpec, filename: string, code: string): string {
  if (lang.id === 'java') {
    // The public class name must match the file name.
    const match = code.match(/public\s+(?:final\s+|abstract\s+)?class\s+([A-Za-z_$][\w$]*)/);
    return `${match ? match[1] : 'Main'}.java`;
  }
  const base = filename.split('/').pop() || filename;
  return base;
}

export async function runRemote(req: RunRequest, lang: LanguageSpec): Promise<RunResult> {
  const { filename, code, stdin = '', timeoutMs = 20_000, onOutput, onStatus, signal } = req;
  const started = performance.now();

  const fail = (error: string): RunResult => ({
    exitCode: 1,
    stdout: '',
    stderr: '',
    durationMs: Math.round(performance.now() - started),
    engine: 'piston',
    error,
  });

  if (!lang.pistonId) return fail(`No remote toolchain configured for ${lang.label}.`);

  onStatus?.(`Compiling ${lang.label} in a remote sandbox...`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort);

  try {
    const response = await fetch(PISTON_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language: lang.pistonId,
        version: '*',
        files: [{ name: entryFilename(lang, filename, code), content: code }],
        stdin,
        compile_timeout: 10_000,
        run_timeout: 8_000,
      }),
    });

    if (response.status === 429) {
      return fail('The public execution sandbox is rate limited right now. Wait a moment and run again.');
    }
    if (!response.ok) {
      return fail(`Remote sandbox returned HTTP ${response.status}.`);
    }

    const body = (await response.json()) as PistonResponse;
    if (body.message) return fail(body.message);

    let stdout = '';
    let stderr = '';

    // A compile failure is the interesting output for C/C++/Java/Rust — surface it verbatim.
    const compileErr = body.compile?.stderr?.trim();
    if (compileErr) {
      const text = `${compileErr}\n`;
      stderr += text;
      onOutput?.({ kind: 'stderr', text });
    }
    if (body.compile && typeof body.compile.code === 'number' && body.compile.code !== 0) {
      return {
        exitCode: body.compile.code,
        stdout,
        stderr,
        durationMs: Math.round(performance.now() - started),
        engine: 'piston',
      };
    }

    if (body.run?.stdout) {
      stdout += body.run.stdout;
      onOutput?.({ kind: 'stdout', text: body.run.stdout });
    }
    if (body.run?.stderr) {
      stderr += body.run.stderr;
      onOutput?.({ kind: 'stderr', text: body.run.stderr });
    }
    if (body.run?.signal) {
      const text = `\nProcess terminated by signal ${body.run.signal}.\n`;
      stderr += text;
      onOutput?.({ kind: 'stderr', text });
    }

    return {
      exitCode: body.run?.code ?? 0,
      stdout,
      stderr,
      durationMs: Math.round(performance.now() - started),
      engine: 'piston',
    };
  } catch (err) {
    const e = err as Error;
    if (e.name === 'AbortError') {
      return {
        exitCode: 124,
        stdout: '',
        stderr: '',
        durationMs: Math.round(performance.now() - started),
        engine: 'piston',
        error: signal?.aborted ? 'aborted' : 'timeout',
      };
    }
    return fail(
      `Could not reach the remote sandbox (${e.message}). ` +
        'JavaScript, TypeScript and Python still run locally with no network.'
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}
