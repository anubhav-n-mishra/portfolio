import type { LanguageSpec } from './types';

// Everything the IDE knows how to run. Order matters only for the picker UI.
export const LANGUAGES: LanguageSpec[] = [
  {
    id: 'javascript',
    label: 'JavaScript',
    extensions: ['js', 'mjs', 'cjs', 'jsx'],
    engine: 'worker-js',
    runHint: 'Runs locally in a sandboxed Web Worker',
    remote: false,
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    extensions: ['ts', 'tsx'],
    engine: 'worker-js',
    runHint: 'Types stripped, then run locally in a sandboxed Web Worker',
    remote: false,
  },
  {
    id: 'python',
    label: 'Python',
    extensions: ['py'],
    engine: 'pyodide',
    runHint: 'Real CPython compiled to WebAssembly, runs locally',
    remote: false,
  },
  {
    id: 'html',
    label: 'HTML',
    extensions: ['html', 'htm'],
    engine: 'preview',
    runHint: 'Rendered live in the Simple Browser',
    remote: false,
  },
  {
    id: 'css',
    label: 'CSS',
    extensions: ['css'],
    engine: 'preview',
    runHint: 'Previewed on a sample document in the Simple Browser',
    remote: false,
  },
  {
    id: 'c',
    label: 'C',
    extensions: ['c', 'h'],
    engine: 'piston',
    pistonId: 'c',
    runHint: 'Compiled with gcc in a remote sandbox',
    remote: true,
  },
  {
    id: 'cpp',
    label: 'C++',
    extensions: ['cpp', 'cc', 'cxx', 'hpp'],
    engine: 'piston',
    pistonId: 'c++',
    runHint: 'Compiled with g++ in a remote sandbox',
    remote: true,
  },
  {
    id: 'java',
    label: 'Java',
    extensions: ['java'],
    engine: 'piston',
    pistonId: 'java',
    runHint: 'Compiled and run in a remote sandbox',
    remote: true,
  },
  {
    id: 'go',
    label: 'Go',
    extensions: ['go'],
    engine: 'piston',
    pistonId: 'go',
    runHint: 'Compiled and run in a remote sandbox',
    remote: true,
  },
  {
    id: 'rust',
    label: 'Rust',
    extensions: ['rs'],
    engine: 'piston',
    pistonId: 'rust',
    runHint: 'Compiled with rustc in a remote sandbox',
    remote: true,
  },
  {
    id: 'ruby',
    label: 'Ruby',
    extensions: ['rb'],
    engine: 'piston',
    pistonId: 'ruby',
    runHint: 'Run in a remote sandbox',
    remote: true,
  },
  {
    id: 'php',
    label: 'PHP',
    extensions: ['php'],
    engine: 'piston',
    pistonId: 'php',
    runHint: 'Run in a remote sandbox',
    remote: true,
  },
  {
    id: 'csharp',
    label: 'C#',
    extensions: ['cs'],
    engine: 'piston',
    pistonId: 'csharp',
    runHint: 'Compiled and run in a remote sandbox',
    remote: true,
  },
  {
    id: 'kotlin',
    label: 'Kotlin',
    extensions: ['kt', 'kts'],
    engine: 'piston',
    pistonId: 'kotlin',
    runHint: 'Compiled and run in a remote sandbox',
    remote: true,
  },
  {
    id: 'swift',
    label: 'Swift',
    extensions: ['swift'],
    engine: 'piston',
    pistonId: 'swift',
    runHint: 'Compiled and run in a remote sandbox',
    remote: true,
  },
  {
    id: 'bash',
    label: 'Shell',
    extensions: ['sh', 'bash'],
    engine: 'piston',
    pistonId: 'bash',
    runHint: 'Run in a remote sandbox',
    remote: true,
  },
  {
    id: 'sql',
    label: 'SQLite',
    extensions: ['sql'],
    engine: 'piston',
    pistonId: 'sqlite3',
    runHint: 'Executed against an ephemeral SQLite database',
    remote: true,
  },
];

const BY_EXTENSION = new Map<string, LanguageSpec>();
for (const lang of LANGUAGES) {
  for (const ext of lang.extensions) BY_EXTENSION.set(ext, lang);
}

export function extensionOf(filename: string): string {
  const base = filename.split('/').pop() ?? filename;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return '';
  return base.slice(dot + 1).toLowerCase();
}

export function languageFor(filename: string): LanguageSpec | null {
  return BY_EXTENSION.get(extensionOf(filename)) ?? null;
}

export function isRunnable(filename: string): boolean {
  return languageFor(filename) !== null;
}

/** Extensions we can run, for the "no runnable file" hint in the UI. */
export const RUNNABLE_EXTENSIONS = [...BY_EXTENSION.keys()].sort();
