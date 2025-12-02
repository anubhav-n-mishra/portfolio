'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/editor';
import { portfolioData } from '@/data/portfolio';
import { cn } from '@/lib/utils';
import {
  Terminal as TerminalIcon,
  Bug,
  FileOutput,
  Trash2,
  Maximize2,
  Minimize2,
  X,
  GripHorizontal,
  Plus,
  ChevronDown,
} from 'lucide-react';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  content: string;
}

const commandHelp = `
Available commands:
  help          - Show this help message
  about         - Display information about Anubhav
  skills        - List technical skills
  projects      - Show featured projects
  contact       - Display contact information
  github        - Open GitHub profile
  linkedin      - Open LinkedIn profile
  resume        - Download resume
  clear         - Clear terminal
  ls            - List portfolio files
  cat <file>    - Display file contents
  whoami        - Display current user
  date          - Show current date
  neofetch      - System information (fun)
  
  npm run dev   - Start the portfolio website (opens in browser)
  npm start     - Start the portfolio website
  node <file>   - Run a JavaScript file
  python <file> - Run a Python file
  run <file>    - Auto-detect and run file
`;

const neofetchOutput = `
       ████████████████       anubhav@portfolio
     ██                ██     -----------------
   ██    ██████████    ██     OS: Portfolio IDE 1.0
   ██  ██          ██  ██     Host: Next.js 14
   ██  ██  ██████  ██  ██     Kernel: React 18
   ██  ██  ██████  ██  ██     Shell: TypeScript
   ██  ██          ██  ██     Theme: VS Code Dark+
   ██    ██████████    ██     Icons: Lucide React
     ██                ██     Terminal: Custom
       ████████████████       
                              Languages: C, C++, Python,
   Anubhav Mishra             JavaScript, TypeScript
   Full-Stack Developer       
   Systems Enthusiast         Projects: 41 repos
                              Commits: 467 (last year)
`;

export default function Terminal() {
  const { terminalOpen, toggleTerminal, terminalHeight, setTerminalHeight, openSimpleBrowser, userFiles } = useEditorStore();
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', content: 'Welcome to Anubhav\'s Portfolio Terminal v1.0.0' },
    { type: 'info', content: 'Type "help" for available commands.\n' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'problems' | 'output'>('terminal');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  // Handle drag resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const windowHeight = window.innerHeight;
      const newHeight = windowHeight - e.clientY - 22;
      const clampedHeight = Math.max(100, Math.min(windowHeight * 0.7, newHeight));
      setTerminalHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, setTerminalHeight]);

  const processCommand = (cmd: string): TerminalLine[] => {
    const parts = cmd.trim().toLowerCase().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        return [{ type: 'output', content: commandHelp }];
      
      case 'about':
        return [
          { type: 'success', content: `\n👤 ${portfolioData.personal.name}` },
          { type: 'output', content: portfolioData.personal.title },
          { type: 'output', content: `\n${portfolioData.personal.tagline}` },
          { type: 'info', content: `\n🎓 ${portfolioData.personal.education.degree} @ ${portfolioData.personal.education.university}` },
          { type: 'info', content: `   Status: ${portfolioData.personal.education.status}\n` },
        ];
      
      case 'skills':
        const { skills } = portfolioData;
        return [
          { type: 'success', content: '\n💻 Technical Skills\n' },
          { type: 'info', content: '  Languages:' },
          { type: 'output', content: `    ${skills.languages.map(s => s.name).join(', ')}` },
          { type: 'info', content: '  Frameworks:' },
          { type: 'output', content: `    ${skills.frameworks.map(s => s.name).join(', ')}` },
          { type: 'info', content: '  Databases:' },
          { type: 'output', content: `    ${skills.databases.map(s => s.name).join(', ')}` },
          { type: 'info', content: '  Tools:' },
          { type: 'output', content: `    ${skills.tools.map(s => s.name).join(', ')}\n` },
        ];
      
      case 'projects':
        const featured = portfolioData.projects.filter(p => p.featured);
        return [
          { type: 'success', content: '\n🚀 Featured Projects\n' },
          ...featured.flatMap(p => [
            { type: 'info' as const, content: `  ${p.icon} ${p.name}` },
            { type: 'output' as const, content: `     ${p.description}` },
            { type: 'output' as const, content: `     Tech: ${p.tech.join(', ')}\n` },
          ]),
        ];
      
      case 'contact':
        const { contact } = portfolioData;
        return [
          { type: 'success', content: '\n📫 Contact Information\n' },
          { type: 'info', content: `  📧 Email:    ${contact.email}` },
          { type: 'info', content: `  💻 GitHub:   github.com/anubhav-n-mishra` },
          { type: 'info', content: `  💼 LinkedIn: linkedin.com/in/anubhav-mishra0` },
          { type: 'info', content: `  🐦 Twitter:  @anubhav_writes\n` },
        ];
      
      case 'github':
        window.open(portfolioData.contact.github, '_blank');
        return [{ type: 'success', content: 'Opening GitHub profile...' }];
      
      case 'linkedin':
        window.open(portfolioData.contact.linkedin, '_blank');
        return [{ type: 'success', content: 'Opening LinkedIn profile...' }];
      
      case 'resume':
        window.open('/Anubhav_Mishra.pdf', '_blank');
        return [{ type: 'success', content: 'Opening resume PDF...' }];
      
      case 'clear':
        setLines([]);
        return [];
      
      case 'ls':
        return [
          { type: 'output', content: '\ndrwxr-xr-x  src/' },
          { type: 'output', content: 'drwxr-xr-x  config/' },
          { type: 'output', content: '-rw-r--r--  README.md' },
          { type: 'output', content: '-rw-r--r--  package.json\n' },
        ];
      
      case 'cat':
        if (args.length === 0) {
          return [{ type: 'error', content: 'Usage: cat <filename>' }];
        }
        return [{ type: 'info', content: `Use the editor to view ${args[0]}` }];
      
      case 'whoami':
        return [{ type: 'output', content: 'guest@anubhav-portfolio' }];
      
      case 'date':
        return [{ type: 'output', content: new Date().toString() }];
      
      case 'neofetch':
        return [{ type: 'output', content: neofetchOutput }];
      
      case 'echo':
        return [{ type: 'output', content: args.join(' ') }];
      
      case 'pwd':
        return [{ type: 'output', content: '/home/guest/anubhav-portfolio' }];
      
      case 'npm':
        if (args[0] === 'run' && args[1] === 'dev') {
          setTimeout(() => {
            openSimpleBrowser('/portfolio');
          }, 1500);
          return [
            { type: 'info', content: '\n> anubhav-portfolio@1.0.0 dev' },
            { type: 'info', content: '> next dev\n' },
            { type: 'output', content: '  ▲ Next.js 14.0.0' },
            { type: 'output', content: '  - Local:        http://localhost:3000/portfolio' },
            { type: 'output', content: '  - Environments: .env\n' },
            { type: 'success', content: '  ✓ Ready in 1.2s' },
            { type: 'info', content: '\nOpening browser...\n' },
          ];
        }
        if (args[0] === 'start') {
          setTimeout(() => {
            openSimpleBrowser('/portfolio');
          }, 1000);
          return [
            { type: 'info', content: '\n> anubhav-portfolio@1.0.0 start' },
            { type: 'info', content: '> next start\n' },
            { type: 'success', content: '  ✓ Starting production server...' },
            { type: 'output', content: '  ✓ Ready on http://localhost:3000/portfolio' },
            { type: 'info', content: '\nOpening browser...\n' },
          ];
        }
        if (args[0] === 'run' && args[1] === 'portfolio') {
          setTimeout(() => {
            openSimpleBrowser('/portfolio');
          }, 1000);
          return [
            { type: 'info', content: '\n> anubhav-portfolio@1.0.0 portfolio' },
            { type: 'info', content: '> Opening portfolio website...\n' },
            { type: 'success', content: '  ✓ Ready\n' },
          ];
        }
        if (args[0] === 'install' || args[0] === 'i') {
          return [
            { type: 'info', content: '\nadded 523 packages in 8s\n' },
            { type: 'success', content: '✓ Packages installed successfully\n' },
          ];
        }
        return [{ type: 'output', content: 'Usage: npm run dev | npm start | npm install' }];
      
      case 'node':
        if (args.length === 0) {
          return [{ type: 'error', content: 'Usage: node <filename.js>' }];
        }
        return executeJS(args[0]);
      
      case 'python':
      case 'python3':
        if (args.length === 0) {
          return [{ type: 'error', content: 'Usage: python <filename.py>' }];
        }
        return executePython(args[0]);
      
      case 'run':
        if (args.length === 0) {
          return [{ type: 'error', content: 'Usage: run <filename>' }];
        }
        const ext = args[0].split('.').pop()?.toLowerCase();
        if (ext === 'js' || ext === 'ts') {
          return executeJS(args[0]);
        } else if (ext === 'py') {
          return executePython(args[0]);
        }
        return [{ type: 'error', content: `Cannot run .${ext} files. Supported: .js, .ts, .py` }];
      
      case 'open':
        if (args.length === 0) {
          return [{ type: 'error', content: 'Usage: open <url>' }];
        }
        const url = args[0].startsWith('http') ? args[0] : `https://${args[0]}`;
        openSimpleBrowser(url);
        return [{ type: 'success', content: `Opening ${url}...` }];
      
      case '':
        return [];
      
      default:
        return [{ type: 'error', content: `Command not found: ${command}. Type "help" for available commands.` }];
    }
  };
  
  // Execute JavaScript code
  const executeJS = (filename: string): TerminalLine[] => {
    const code = userFiles[filename];
    if (!code) {
      return [{ type: 'error', content: `File not found: ${filename}` }];
    }
    
    try {
      // Create a safe console.log capture
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: unknown[]) => logs.push(args.map(a => String(a)).join(' ')),
        error: (...args: unknown[]) => logs.push(`Error: ${args.map(a => String(a)).join(' ')}`),
        warn: (...args: unknown[]) => logs.push(`Warning: ${args.map(a => String(a)).join(' ')}`),
      };
      
      // Execute code with mock console
      const fn = new Function('console', code);
      fn(mockConsole);
      
      if (logs.length === 0) {
        return [{ type: 'success', content: '(executed with no output)' }];
      }
      
      return logs.map(log => ({ type: 'output' as const, content: log }));
    } catch (err) {
      return [{ type: 'error', content: `Error: ${(err as Error).message}` }];
    }
  };
  
  // Execute Python code (simulated)
  const executePython = (filename: string): TerminalLine[] => {
    const code = userFiles[filename];
    if (!code) {
      return [{ type: 'error', content: `File not found: ${filename}` }];
    }
    
    // Simple Python interpreter simulation
    const lines_: string[] = [];
    const codeLines = code.split('\n');
    
    for (const line of codeLines) {
      const trimmed = line.trim();
      
      // Handle print statements
      const printMatch = trimmed.match(/^print\s*\(\s*["'](.*)["']\s*\)$/);
      if (printMatch) {
        lines_.push(printMatch[1]);
        continue;
      }
      
      // Handle print with f-string or variables (simplified)
      const printMatch2 = trimmed.match(/^print\s*\((.*)\)$/);
      if (printMatch2) {
        try {
          // Evaluate simple expressions
          const expr = printMatch2[1].replace(/["']/g, '');
          lines_.push(expr);
        } catch {
          lines_.push(printMatch2[1]);
        }
      }
    }
    
    if (lines_.length === 0) {
      return [{ type: 'success', content: '(executed with no output)' }];
    }
    
    return lines_.map(l => ({ type: 'output' as const, content: l }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newLines: TerminalLine[] = [
      ...lines,
      { type: 'input', content: `$ ${input}` },
      ...processCommand(input),
    ];

    setLines(newLines);
    setHistory([...history, input]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  if (!terminalOpen) return null;

  const currentHeight = isMaximized ? '60vh' : `${terminalHeight}px`;

  return (
    <section 
      className="bg-[var(--bg-terminal)] border-t border-[var(--border-color)] flex flex-col"
      style={{ height: currentHeight, minHeight: '100px' }}
    >
      {/* Resize Handle */}
      <div 
        className="h-1 cursor-ns-resize bg-transparent hover:bg-[var(--accent-primary)] transition-colors flex-shrink-0 group"
        onMouseDown={handleMouseDown}
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-10 h-0.5 bg-[var(--border-color)] group-hover:bg-[var(--accent-primary)] rounded transition-colors" />
        </div>
      </div>

      {/* Terminal Header/Tabs */}
      <div className="flex items-center justify-between h-9 px-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex-shrink-0">
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setActiveTab('terminal')}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs transition-colors border-b-2 -mb-px whitespace-nowrap",
              activeTab === 'terminal' 
                ? "text-[var(--text-primary)] border-[var(--accent-primary)] bg-[var(--bg-terminal)]" 
                : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
            )}
          >
            <TerminalIcon size={14} />
            <span className="hidden sm:inline">TERMINAL</span>
          </button>
          <button 
            onClick={() => setActiveTab('problems')}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs transition-colors border-b-2 -mb-px whitespace-nowrap",
              activeTab === 'problems' 
                ? "text-[var(--text-primary)] border-[var(--accent-primary)] bg-[var(--bg-terminal)]" 
                : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
            )}
          >
            <Bug size={14} />
            <span className="hidden sm:inline">PROBLEMS</span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-[var(--bg-tertiary)] rounded">0</span>
          </button>
          <button 
            onClick={() => setActiveTab('output')}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs transition-colors border-b-2 -mb-px whitespace-nowrap",
              activeTab === 'output' 
                ? "text-[var(--text-primary)] border-[var(--accent-primary)] bg-[var(--bg-terminal)]" 
                : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
            )}
          >
            <FileOutput size={14} />
            <span className="hidden sm:inline">OUTPUT</span>
          </button>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button 
            className="hidden sm:flex p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="New Terminal"
          >
            <Plus size={14} />
          </button>
          <button className="hidden sm:flex p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <ChevronDown size={14} />
          </button>
          <div className="hidden sm:block w-px h-4 bg-[var(--border-color)] mx-1" />
          <button 
            onClick={() => setLines([])}
            className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Clear"
          >
            <Trash2 size={14} />
          </button>
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button 
            onClick={toggleTerminal}
            className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Close Panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      {activeTab === 'terminal' && (
        <div 
          ref={outputRef}
          className="flex-1 overflow-auto p-3 font-mono text-sm min-h-0"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, idx) => (
            <div 
              key={idx} 
              className={cn(
                "whitespace-pre-wrap leading-5",
                line.type === 'input' && "text-[var(--text-primary)]",
                line.type === 'output' && "text-[var(--text-secondary)]",
                line.type === 'error' && "text-[var(--error)]",
                line.type === 'success' && "text-[var(--accent-tertiary)]",
                line.type === 'info' && "text-[var(--accent-primary)]",
              )}
            >
              {line.content}
            </div>
          ))}
          
          {/* Input Line */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
            <span className="text-[var(--terminal-prompt)] font-semibold">anubhav@portfolio:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-[var(--text-primary)] caret-[var(--accent-primary)]"
              autoFocus
              spellCheck={false}
            />
          </form>
        </div>
      )}

      {activeTab === 'problems' && (
        <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm">
          No problems detected ✓
        </div>
      )}

      {activeTab === 'output' && (
        <div className="flex-1 p-3 font-mono text-sm text-[var(--text-muted)]">
          [Portfolio] Ready to serve at localhost:3000
        </div>
      )}
    </section>
  );
}
