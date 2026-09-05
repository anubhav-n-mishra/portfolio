# Anubhav Mishra — Portfolio IDE

A portfolio that looks like VS Code and behaves like one. The editor is editable, the
file tree is real, the terminal parses commands — and the run button actually executes
the file that is open.

**Live:** [mishraanubhav.me](https://mishraanubhav.me)

---

## Two ways in

The landing page offers a choice, and remembers nothing you cannot undo:

- **VS Code Experience** → the full IDE at `/`
- **Classic Portfolio** → a conventional scrolling page at `/portfolio`

Small screens are sent to `/portfolio` automatically.

---

## Running code

This is the part that is not a simulation. Open anything under `playground/`, edit it,
then press the ▶ button or `Ctrl+Enter`.

| Language | Where it runs | Needs a network? |
|---|---|---|
| JavaScript | Sandboxed Web Worker, on your machine | No |
| TypeScript | Types stripped, then the same worker | Only the first time, to fetch the transform |
| Python | Real CPython compiled to WebAssembly (Pyodide) | Only the first time, to fetch the interpreter |
| HTML / CSS | Rendered live in the Simple Browser | No |
| C, C++, Java, Go, Rust, C#, Kotlin, Swift, Ruby, PHP, Shell, SQLite | Compiled and run in a public remote sandbox | Yes |

Type `langs` in the terminal for the current list.

### How the sandbox works

JavaScript and TypeScript run on a dedicated worker thread with no DOM access — the
worker boundary *is* the sandbox. A runaway `while (true) {}` cannot be interrupted
cooperatively, so it is killed by terminating the thread; the tab stays responsive and
the terminal reports a timeout and exit code 124.

The console is a real one. `console.log({ a: 1 })` prints `{ a: 1 }`, arrays, `Map`,
`Set`, typed arrays and circular references all format properly, `process.stdout.write`
composes partial lines, and top-level `await` works.

Python runs in its own long-lived worker so the interpreter stays warm between runs.
`loadPackagesFromImports` pulls in any bundled package a file imports.

### Program input

Programs can read stdin. Set it from the keyboard icon in the terminal panel, from
Settings, or with `stdin 17\n25`. Read it with `input()` in Python and `readline()` in
JavaScript.

---

## Keyboard

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` | Run the open file (stops it if already running) |
| `Ctrl+P` | Go to file |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+B` | Toggle sidebar |
| `` Ctrl+` `` | Toggle terminal |
| `Ctrl+S` | Save |
| `Ctrl+,` | Settings |
| `Ctrl+Shift+E` / `F` / `G` / `X` | Explorer / Search / Source Control / Extensions |
| `Ctrl+C` | Stop a running program (in the terminal) |

Typing `>` in the quick-open box turns it into a command search, as in real VS Code.

---

## Terminal

```
about  products  projects  skills  contact  resume     content
ls  cat  edit                                          files
run  node  python  gcc  g++  stdin  langs  stop        execution
open  clear  whoami  pwd  date  echo  neofetch  help   shell
```

Tab completes filenames; ↑/↓ walk the history.

---

## Panels

- **Explorer** — the workspace tree. Add files, or open your own from disk.
- **Search** — searches every file, including ones you have edited.
- **Source Control** — local modifications plus the repositories behind the work.
- **Extensions** — install/uninstall; state is shared with the terminal, so installing
  *Resume Download* enables the `resume` command.
- **Assistant** — answers questions about the work from the portfolio's own data. No API
  key and no network call, so it cannot fail and cannot invent a project.
- **Settings** — theme, font size, line numbers, minimap, motion, default stdin.

---

## Tech

- **Next.js 16** (App Router, static export)
- **TypeScript**, **Tailwind CSS**
- **Zustand** for editor, theme and runner state
- **Pyodide** for Python, **Sucrase** for the TypeScript transform, **Piston** for
  compiled languages — all lazy-loaded, none of them required for the site to work

Deployed as a static export, so there is no backend of its own.

---

## Layout

```
src/
├── app/
│   ├── page.tsx            # landing → IDE
│   └── portfolio/          # the classic scrolling page
├── components/             # IDE chrome: title bar, activity bar, sidebar,
│                           # editor, terminal, status bar, browser, palette
├── lib/
│   ├── runtime/            # the execution engine
│   │   ├── languages.ts    # extension → engine mapping
│   │   ├── jsRunner.ts     # Web Worker sandbox
│   │   ├── workerSource.ts # worker body: console, process, stdin, TS transform
│   │   ├── pythonRunner.ts # Pyodide worker
│   │   └── remoteRunner.ts # compiled languages
│   ├── highlight.ts        # tokenising syntax highlighter
│   └── assistant.ts        # offline Q&A over the portfolio data
├── store/                  # editor, theme, runner
└── data/
    ├── portfolio.ts        # single source of truth for every surface
    └── files.ts            # the virtual filesystem
```

`data/portfolio.ts` is the only place facts live. The IDE panels, the terminal, the
virtual files and the classic page all read from it, so they cannot disagree.

---

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export to ./out
```

---

## Contact

- **Email** — anubhav09.work@gmail.com
- **GitHub** — [anubhav-n-mishra](https://github.com/anubhav-n-mishra)
- **LinkedIn** — [anubhav-mishra0](https://linkedin.com/in/anubhav-mishra0)

Dehradun, India · IST (UTC+5:30)
