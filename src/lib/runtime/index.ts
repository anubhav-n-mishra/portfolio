import { languageFor } from './languages';
import { runJavaScript } from './jsRunner';
import { runPython } from './pythonRunner';
import { runRemote } from './remoteRunner';
import type { RunRequest, RunResult } from './types';

export * from './types';
export * from './languages';
export { PYODIDE_VERSION, isPythonWarm } from './pythonRunner';

/**
 * Builds the document shown in the Simple Browser for `html`/`css` files.
 * Returned rather than executed, because "running" markup means rendering it.
 */
export function buildPreviewDocument(filename: string, code: string): string {
  if (/\.css$/i.test(filename)) {
    return `<!doctype html>
<html><head><meta charset="utf-8"><title>${filename}</title>
<style>${code}</style></head>
<body>
  <h1>Heading one</h1>
  <p>A paragraph of sample copy, so the stylesheet has something to style. <a href="#">A link</a> sits inside it.</p>
  <button>A button</button>
  <ul><li>First item</li><li>Second item</li><li>Third item</li></ul>
</body></html>`;
  }
  return code;
}

/**
 * Runs a file with whichever engine its extension maps to.
 *
 * JavaScript, TypeScript and Python execute locally in the browser and keep working
 * offline. Compiled languages go out to a public sandbox. Markup is rendered, not run.
 */
export async function runCode(req: RunRequest): Promise<RunResult> {
  const lang = languageFor(req.filename);

  if (!lang) {
    const ext = req.filename.split('.').pop();
    return {
      exitCode: 1,
      stdout: '',
      stderr: '',
      durationMs: 0,
      engine: 'none',
      error: `Nothing here knows how to run a .${ext} file.`,
    };
  }

  switch (lang.engine) {
    case 'worker-js':
      return runJavaScript(req);
    case 'pyodide':
      return runPython(req);
    case 'piston':
      return runRemote(req, lang);
    case 'preview':
      return {
        exitCode: 0,
        stdout: '',
        stderr: '',
        durationMs: 0,
        engine: 'preview',
      };
    default:
      return {
        exitCode: 1,
        stdout: '',
        stderr: '',
        durationMs: 0,
        engine: 'none',
        error: `No engine for ${lang.label}.`,
      };
  }
}
