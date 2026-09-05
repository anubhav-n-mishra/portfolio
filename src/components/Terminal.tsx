'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorStore, hasExtension } from '@/store/editor';
import { useRunnerStore, type LineKind } from '@/store/runner';
import { portfolioData } from '@/data/portfolio';
import { fileContents, playgroundFiles } from '@/data/files';
import { languageFor, LANGUAGES } from '@/lib/runtime';
import { cn } from '@/lib/utils';
import {
  Terminal as TerminalIcon, Bug, FileOutput, Trash2, Maximize2, Minimize2,
  X, ChevronRight, Keyboard,
} from 'lucide-react';

const HELP = `
Portfolio shell — a small but real shell.

  Content
    about            Who I am and what I do
    products         Things running in production right now
    projects         Selected engineering work
    skills           Stack, sorted honestly
    contact          Every way to reach me
    resume           Download the PDF
    open <url>       Open a URL in the Simple Browser

  Files
    ls [dir]         List files
    cat <file>       Print a file
    edit <file>      Open a file in the editor

  Running code            (these actually execute)
    run <file>       Detect the language and run it
    node <file.js>   JavaScript / TypeScript, locally in a Web Worker
    python <file.py> Real CPython on WebAssembly, locally
    gcc <file.c>     Compile and run C
    g++ <file.cpp>   Compile and run C++
    stdin <text>     Set the input the next program reads
    langs            Every language this shell can run
    stop             Stop whatever is running

  Shell
    clear            Clear the terminal
    whoami / pwd / date / echo / neofetch / help
`;

const NEOFETCH = `
       ████████████████       guest@anubhav-portfolio
     ██                ██     --------------------------------
   ██    ██████████    ██     OS:        Portfolio IDE 2.0
   ██  ██          ██  ██     Host:      Next.js (static export)
   ██  ██  ██████  ██  ██     Kernel:    React 19
   ██  ██  ██████  ██  ██     Shell:     portfolio-sh
   ██  ██          ██  ██     Theme:     VS Code Dark+
   ██    ██████████    ██     Runtimes:  Web Worker, Pyodide, remote gcc
     ██                ██
       ████████████████       Live products: 5
                              Repositories:  116
   Anubhav Mishra             Stack layers:  bootloader -> SaaS
   Product Engineer
   Dehradun, India            Try: run fizzbuzz.py
`;

export default function Terminal() {
  const {
    terminalOpen, toggleTerminal, terminalHeight, setTerminalHeight,
    openSimpleBrowser, previewDocument, contentOf, openFile, fileTree, allFilenames,
  } = useEditorStore();
  const { lines, write, clear, run, stop, running, stdin, setStdin } = useRunnerStore();

  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tab, setTab] = useState<'terminal' | 'problems' | 'output'>('terminal');
  const [showStdin, setShowStdin] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [lines]);

  /* ---------------- resize ---------------- */
  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const next = window.innerHeight - e.clientY - 22;
      setTerminalHeight(Math.max(120, Math.min(window.innerHeight * 0.8, next)));
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, setTerminalHeight]);

  /* ---------------- file helpers ---------------- */

  // Case-insensitive lookup, but the real filename is preserved — the old shell
  // lowercased the whole command line, so `cat README.md` looked for `readme.md`.
  const resolveFile = (name: string): string | null => {
    const names = allFilenames();
    const exact = names.find((n) => n === name);
    if (exact) return exact;
    const base = name.split('/').pop() ?? name;
    return names.find((n) => n.toLowerCase() === base.toLowerCase()) ?? null;
  };

  const listFiles = (): string[] => {
    const out: string[] = [];
    const walk = (nodes: typeof fileTree, depth: number) => {
      for (const n of nodes) {
        out.push(`${'  '.repeat(depth)}${n.type === 'folder' ? `${n.name}/` : n.name}`);
        if (n.children) walk(n.children, depth + 1);
      }
    };
    walk(fileTree[0]?.children ?? [], 0);
    return out;
  };

  /* ---------------- command execution ---------------- */

  const execute = async (raw: string) => {
    // Case is preserved for arguments; only the verb is normalised.
    const parts = raw.trim().split(/\s+/);
    const cmd = (parts[0] ?? '').toLowerCase();
    const args = parts.slice(1);
    const { personal, contact, products, projects, skills } = portfolioData;

    const runFile = async (name: string, expect?: RegExp) => {
      const resolved = resolveFile(name);
      if (!resolved) {
        write('stderr', `${name}: no such file`);
        return;
      }
      if (expect && !expect.test(resolved)) {
        write('stderr', `${resolved}: wrong file type for \`${cmd}\``);
        return;
      }
      if (!languageFor(resolved)) {
        write('stderr', `${resolved}: nothing here knows how to run this file type`);
        return;
      }
      await run(resolved, contentOf(resolved), (doc, title) => previewDocument(doc, title));
    };

    switch (cmd) {
      case '':
        return;

      case 'help':
        write('stdout', HELP);
        return;

      case 'about':
        write('success', `\n${personal.name} — ${personal.title}`);
        write('stdout', personal.subtitle);
        write('stdout', `\n${personal.tagline}\n`);
        write('info', `${personal.education.degree}`);
        write('info', `${personal.education.university} — ${personal.education.status}`);
        write('info', `${personal.location} · ${personal.timezone}\n`);
        return;

      case 'products':
        write('success', '\nLive in production\n');
        for (const p of products) {
          write('info', `  ${p.name}`);
          write('stdout', `    ${p.tagline}`);
          if (p.url) write('stdout', `    ${p.url}${p.note ? `  (${p.note})` : ''}`);
          write('stdout', `    ${p.tech.slice(0, 5).join(', ')}\n`);
        }
        return;

      case 'projects':
        write('success', '\nSelected engineering\n');
        for (const p of projects.filter((x) => x.featured)) {
          write('info', `  ${p.name}${p.stars ? `  ★${p.stars}` : ''}`);
          write('stdout', `    ${p.description}`);
          write('stdout', `    ${p.tech.join(', ')}\n`);
        }
        write('stdout', `Run \`projects all\` for the rest.\n`);
        if (args[0] === 'all') {
          for (const p of projects.filter((x) => !x.featured)) {
            write('info', `  ${p.name}`);
            write('stdout', `    ${p.description}\n`);
          }
        }
        return;

      case 'skills':
        write('success', '\nStack, sorted honestly\n');
        for (const group of [skills.confident, skills.shipped, skills.learning]) {
          write('info', `  ${group.label}`);
          write('stdout', `    ${group.items.join(' · ')}\n`);
        }
        return;

      case 'contact':
        write('success', '\nContact\n');
        write('info', `  Email     ${contact.email}`);
        write('info', `  GitHub    ${contact.github}`);
        write('info', `  LinkedIn  ${contact.linkedin}`);
        write('info', `  Web       ${contact.website}\n`);
        write('stdout', `${personal.availability}.`);
        write('stdout', `${personal.responseTime}.\n`);
        return;

      case 'github':
        window.open(contact.github, '_blank', 'noopener,noreferrer');
        write('success', 'Opening GitHub profile...');
        return;

      case 'linkedin':
        window.open(contact.linkedin, '_blank', 'noopener,noreferrer');
        write('success', 'Opening LinkedIn profile...');
        return;

      case 'resume':
        if (!hasExtension('resume')) {
          write('stderr', 'The Resume Download extension is not installed.');
          write('info', 'Open Extensions (Ctrl+Shift+X) and install it, then try again.');
          return;
        }
        window.open(contact.resume, '_blank', 'noopener,noreferrer');
        write('success', 'Opening resume PDF...');
        return;

      case 'clear':
        clear();
        return;

      case 'ls':
        write('stdout', `\n${listFiles().join('\n')}\n`);
        return;

      case 'cat': {
        if (!args[0]) {
          write('stderr', 'usage: cat <file>');
          return;
        }
        const resolved = resolveFile(args[0]);
        if (!resolved) {
          write('stderr', `${args[0]}: no such file`);
          return;
        }
        write('stdout', `\n${contentOf(resolved)}`);
        return;
      }

      case 'edit': {
        if (!args[0]) {
          write('stderr', 'usage: edit <file>');
          return;
        }
        const resolved = resolveFile(args[0]);
        if (!resolved) {
          write('stderr', `${args[0]}: no such file`);
          return;
        }
        openFile(resolved);
        write('success', `Opened ${resolved} in the editor.`);
        return;
      }

      case 'langs':
        write('success', '\nLanguages this shell can run\n');
        for (const l of LANGUAGES) {
          const where = l.remote ? 'remote sandbox' : 'in your browser';
          write('stdout', `  ${l.label.padEnd(12)} .${l.extensions[0].padEnd(6)} ${where}`);
        }
        write('info', '\nJS, TS and Python run locally and keep working with the network down.\n');
        return;

      case 'stdin':
        if (args.length === 0) {
          write('stdout', stdin ? `stdin is:\n${stdin}` : 'stdin is empty.');
          return;
        }
        setStdin(args.join(' ').replace(/\\n/g, '\n'));
        write('success', 'stdin set for the next run.');
        return;

      case 'stop':
        if (!running) {
          write('stdout', 'Nothing is running.');
          return;
        }
        stop();
        return;

      case 'run':
        if (!args[0]) {
          write('stderr', `usage: run <file>   (try: ${playgroundFiles.join(', ')})`);
          return;
        }
        await runFile(args[0]);
        return;

      case 'node':
        if (!args[0]) { write('stderr', 'usage: node <file.js>'); return; }
        await runFile(args[0], /\.(js|mjs|cjs|jsx|ts|tsx)$/i);
        return;

      case 'python':
      case 'python3':
        if (!args[0]) { write('stderr', 'usage: python <file.py>'); return; }
        await runFile(args[0], /\.py$/i);
        return;

      case 'gcc':
      case 'cc':
        if (!args[0]) { write('stderr', 'usage: gcc <file.c>'); return; }
        await runFile(args[0], /\.c$/i);
        return;

      case 'g++':
      case 'clang++':
        if (!args[0]) { write('stderr', 'usage: g++ <file.cpp>'); return; }
        await runFile(args[0], /\.(cpp|cc|cxx)$/i);
        return;

      case 'java':
        if (!args[0]) { write('stderr', 'usage: java <file.java>'); return; }
        await runFile(args[0], /\.java$/i);
        return;

      case 'open': {
        if (!args[0]) { write('stderr', 'usage: open <url>'); return; }
        const url = /^https?:\/\//.test(args[0]) ? args[0] : `https://${args[0]}`;
        openSimpleBrowser(url);
        write('success', `Opening ${url}`);
        return;
      }

      case 'npm':
        if (args[0] === 'run' && (args[1] === 'dev' || args[1] === 'start')) {
          write('info', '\n> anubhav-portfolio@2.0.0 dev');
          write('info', '> next dev\n');
          write('stdout', '  ▲ Next.js');
          write('stdout', '  - Local:  /portfolio');
          write('success', '  ✓ Ready\n');
          openSimpleBrowser('/portfolio');
          return;
        }
        if (args[0] === 'install' || args[0] === 'i') {
          write('stderr', 'This shell has no package registry — it runs single files, not projects.');
          write('info', 'Type `langs` to see what it can run.');
          return;
        }
        write('stdout', 'usage: npm run dev');
        return;

      case 'whoami':
        write('stdout', 'guest@anubhav-portfolio');
        return;

      case 'pwd':
        write('stdout', '/home/guest/anubhav-portfolio');
        return;

      case 'date':
        write('stdout', new Date().toString());
        return;

      case 'echo':
        write('stdout', args.join(' '));
        return;

      case 'neofetch':
        write('stdout', NEOFETCH);
        return;

      case 'exit':
        toggleTerminal();
        return;

      default: {
        // Suggest the closest command rather than just failing.
        const known = ['help', 'about', 'products', 'projects', 'skills', 'contact', 'run',
          'node', 'python', 'ls', 'cat', 'edit', 'clear', 'langs', 'open', 'resume'];
        const near = known.find((k) => k.startsWith(cmd.slice(0, 2)) && cmd.length > 1);
        write('stderr', `${cmd}: command not found`);
        if (near) write('info', `Did you mean \`${near}\`?`);
        else write('info', "Type 'help' for the command list.");
      }
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = input;
    if (!raw.trim()) return;
    write('input', `$ ${raw}`);
    setHistory((h) => [...h, raw]);
    setHistoryIndex(-1);
    setInput('');
    await execute(raw);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const next = historyIndex + 1;
        setHistoryIndex(next);
        setInput(history[history.length - 1 - next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const next = historyIndex - 1;
        setHistoryIndex(next);
        setInput(history[history.length - 1 - next]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      // Complete a filename argument, or the command itself.
      e.preventDefault();
      const parts = input.split(/\s+/);
      if (parts.length > 1) {
        const partial = parts[parts.length - 1];
        const match = allFilenames().find((f) => f.toLowerCase().startsWith(partial.toLowerCase()));
        if (match) setInput([...parts.slice(0, -1), match].join(' '));
      }
    } else if (e.key === 'c' && e.ctrlKey && running) {
      e.preventDefault();
      stop();
    }
  };

  if (!terminalOpen) return null;

  const kindClass: Record<LineKind, string> = {
    input: 'stream-input',
    stdout: 'stream-stdout',
    stderr: 'stream-stderr',
    info: 'stream-info',
    success: 'stream-success',
    system: 'stream-info',
  };

  const problemCount = 0;

  return (
    <section
      className="flex flex-col shrink-0"
      style={{
        height: isMaximized ? '70vh' : `${terminalHeight}px`,
        minHeight: '120px',
        background: 'var(--bg-terminal)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      {/* Resize handle */}
      <div
        className="h-1 cursor-ns-resize shrink-0 group flex items-center justify-center"
        onMouseDown={startDrag}
      >
        <div
          className="w-10 h-0.5 rounded transition-colors group-hover:bg-[var(--accent-primary)]"
          style={{ background: 'var(--border-color)' }}
        />
      </div>

      {/* Panel tabs */}
      <div
        className="flex items-center justify-between h-9 px-2 shrink-0"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {([
            ['terminal', TerminalIcon, 'TERMINAL'],
            ['problems', Bug, 'PROBLEMS'],
            ['output', FileOutput, 'OUTPUT'],
          ] as const).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs border-b-2 -mb-px whitespace-nowrap transition-colors',
                tab === id ? 'border-[var(--accent-primary)]' : 'border-transparent'
              )}
              style={{ color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
              {id === 'problems' && (
                <span
                  className="ml-1 px-1.5 py-0.5 text-[10px] rounded"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  {problemCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {running && (
            <span className="hidden sm:flex items-center gap-1.5 mr-2 text-[11px]" style={{ color: 'var(--success)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
              running
            </span>
          )}
          <button
            onClick={() => setShowStdin((s) => !s)}
            title="Program input (stdin)"
            className="p-1.5 rounded hover:bg-[var(--bg-hover)]"
            style={{ color: showStdin ? 'var(--accent-primary)' : 'var(--text-muted)' }}
          >
            <Keyboard size={14} />
          </button>
          <button onClick={clear} title="Clear terminal" className="p-1.5 rounded hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-muted)' }}>
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setIsMaximized((m) => !m)}
            title={isMaximized ? 'Restore panel' : 'Maximise panel'}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-muted)' }}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={toggleTerminal} title="Close panel" className="p-1.5 rounded hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* stdin drawer */}
      {showStdin && tab === 'terminal' && (
        <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <label className="block text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
            stdin — what the next program reads from input
          </label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={2}
            spellCheck={false}
            placeholder={'One value per line.\nRead with input() in Python, readline() in JS.'}
            className="w-full px-2 py-1 text-[12px] rounded outline-none resize-y font-mono"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          />
        </div>
      )}

      {tab === 'terminal' && (
        <div
          ref={outputRef}
          className="flex-1 overflow-auto p-3 font-mono text-[13px] min-h-0"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line) => (
            <div key={line.id} className={cn('whitespace-pre-wrap break-words leading-5', kindClass[line.kind])}>
              {line.text || ' '}
            </div>
          ))}

          <form onSubmit={onSubmit} className="flex items-center gap-2 mt-1">
            <span className="shrink-0 font-semibold" style={{ color: 'var(--terminal-prompt)' }}>
              guest@portfolio
            </span>
            <ChevronRight size={14} className="shrink-0 -ml-1" style={{ color: 'var(--terminal-prompt)' }} />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={running}
              placeholder={running ? 'running — Ctrl+C to stop' : ''}
              className="flex-1 bg-transparent outline-none disabled:opacity-50"
              style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-primary)' }}
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal input"
            />
          </form>
        </div>
      )}

      {tab === 'problems' && (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
          No problems have been detected in the workspace.
        </div>
      )}

      {tab === 'output' && (
        <div className="flex-1 p-3 font-mono text-[12px] overflow-auto" style={{ color: 'var(--text-muted)' }}>
          <div>[workspace] {Object.keys(fileContents).length} files loaded</div>
          <div>[runtime]   JavaScript / TypeScript — Web Worker, ready</div>
          <div>[runtime]   Python — Pyodide, loads on first use</div>
          <div>[runtime]   C / C++ / Java / Go / Rust — remote sandbox</div>
          <div>[preview]   Simple Browser ready</div>
        </div>
      )}
    </section>
  );
}
