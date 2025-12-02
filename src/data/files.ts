// File content for the IDE editor - Portfolio source code files

export const fileContents: Record<string, string> = {
  "README.md": `# 👋 Anubhav Mishra - Portfolio IDE

## About This Project

This is my **VS Code-style portfolio website** built with modern web technologies.
It showcases my work as a Full-Stack Developer & Systems Engineer.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Icons**: Lucide React

## 🎯 Features

- ✅ VS Code-like interface
- ✅ File explorer with syntax highlighting
- ✅ Interactive terminal
- ✅ Dark/Light theme toggle
- ✅ Command palette (Ctrl+Shift+P)
- ✅ In-IDE browser for live preview
- ✅ Responsive design

## 📂 Project Structure

\`\`\`
src/
├── app/
│   ├── page.tsx          # Main entry
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   └── portfolio/        # Portfolio preview page
├── components/
│   ├── TitleBar.tsx      # VS Code title bar
│   ├── ActivityBar.tsx   # Left icon bar
│   ├── Sidebar.tsx       # File explorer
│   ├── Editor.tsx        # Code editor
│   ├── Terminal.tsx      # Interactive terminal
│   └── StatusBar.tsx     # Bottom status bar
├── store/
│   ├── editor.ts         # Editor state
│   └── theme.ts          # Theme state
└── data/
    ├── portfolio.ts      # Portfolio data
    └── files.ts          # File contents
\`\`\`

## 👤 About Me

**Anubhav Mishra** - Final Year B.Tech CSE Student

🔧 Systems Enthusiast | Full-Stack Developer | OS & Compiler Builder

## 📫 Contact

- Email: anubhav09.work@gmail.com
- GitHub: github.com/anubhav-n-mishra
- LinkedIn: linkedin.com/in/anubhav-mishra0
`,

  "page.tsx": `import IDELayout from '@/components/IDELayout';

export default function Home() {
  return <IDELayout />;
}
`,

  "layout.tsx": `import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anubhav Mishra | Portfolio IDE",
  description: "Full-Stack Developer & Systems Engineer Portfolio",
  keywords: ["Anubhav Mishra", "Portfolio", "Developer"],
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={\`\${inter.variable} \${jetbrainsMono.variable}\`}>
        {children}
      </body>
    </html>
  );
}
`,

  "globals.css": `@import "tailwindcss";

/* VS Code Theme Variables */
:root {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --bg-tertiary: #2d2d2d;
  --bg-titlebar: #323233;
  --bg-activitybar: #181818;
  --bg-sidebar: #252526;
  --bg-editor: #1e1e1e;
  --bg-terminal: #1a1a1a;
  --bg-statusbar: #007acc;
  --text-primary: #cccccc;
  --text-secondary: #9d9d9d;
  --text-muted: #6e6e6e;
  --accent-primary: #007acc;
  --border-color: #3c3c3c;
}

.light {
  --bg-primary: #ffffff;
  --bg-secondary: #f3f3f3;
  --bg-titlebar: #dddddd;
  --text-primary: #1e1e1e;
  --accent-primary: #007acc;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}
`,

  "IDELayout.tsx": `'use client';

import React, { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/theme';
import { useEditorStore } from '@/store/editor';
import TitleBar from './TitleBar';
import ActivityBar from './ActivityBar';
import Sidebar from './Sidebar';
import Editor from './Editor';
import Terminal from './Terminal';
import StatusBar from './StatusBar';
import SimpleBrowser from './SimpleBrowser';

export default function IDELayout() {
  const { theme } = useThemeStore();
  const { sidebarOpen, simpleBrowserOpen } = useEditorStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={\`h-screen w-screen flex flex-col \${theme === 'light' && 'light'}\`}>
      <TitleBar />
      <main className="flex-1 flex overflow-hidden">
        <ActivityBar />
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex">
            <Editor />
            {simpleBrowserOpen && <SimpleBrowser />}
          </div>
          <Terminal />
        </div>
      </main>
      <StatusBar />
    </div>
  );
}
`,

  "TitleBar.tsx": `'use client';

import React from 'react';
import { useThemeStore } from '@/store/theme';
import { useEditorStore } from '@/store/editor';
import { Code2, Search, Minus, Square, X } from 'lucide-react';

// Menu items: File, Edit, Selection, View, Go, Terminal, Help
const menuItems = ['File', 'Edit', 'Selection', 'View', 'Go', 'Terminal', 'Help'];

export default function TitleBar() {
  const { theme, toggleTheme } = useThemeStore();
  const { openCommandPalette } = useEditorStore();

  return (
    <header className="h-[35px] flex items-center bg-[var(--bg-titlebar)]">
      {/* Logo */}
      <div className="w-12 flex items-center justify-center">
        <Code2 size={18} className="text-[var(--accent-primary)]" />
      </div>

      {/* Menu Bar */}
      <nav className="flex items-center h-full">
        {menuItems.map(item => (
          <button key={item} className="px-2 text-[13px] hover:bg-white/10">
            {item}
          </button>
        ))}
      </nav>

      {/* Search Bar */}
      <div className="flex-1 flex justify-center px-4">
        <div 
          onClick={openCommandPalette}
          className="flex items-center h-[26px] px-3 rounded cursor-pointer"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <Search size={14} className="mr-2 text-[var(--text-muted)]" />
          <span className="text-[13px] text-[var(--text-muted)]">
            anubhav-portfolio
          </span>
        </div>
      </div>

      {/* Window Controls */}
      <div className="flex items-center h-full ml-auto">
        <button className="w-[46px] h-full flex items-center justify-center hover:bg-white/10">
          <Minus size={16} />
        </button>
        <button className="w-[46px] h-full flex items-center justify-center hover:bg-white/10">
          <Square size={12} />
        </button>
        <button className="w-[46px] h-full flex items-center justify-center hover:bg-red-600">
          <X size={16} />
        </button>
      </div>
    </header>
  );
}
`,

  "ActivityBar.tsx": `'use client';

import React from 'react';
import { useEditorStore } from '@/store/editor';
import { Files, Search, GitBranch, Puzzle, Bot, User, Settings } from 'lucide-react';

const activityItems = [
  { id: 'explorer', icon: Files, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'git', icon: GitBranch, label: 'Source Control', badge: '3' },
  { id: 'extensions', icon: Puzzle, label: 'Extensions' },
  { id: 'ai', icon: Bot, label: 'AI Assistant' },
];

export default function ActivityBar() {
  const { sidebarPanel, setSidebarPanel } = useEditorStore();

  return (
    <aside className="w-12 bg-[var(--bg-activitybar)] flex flex-col justify-between">
      <div className="flex flex-col items-center">
        {activityItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSidebarPanel(item.id)}
            className={\`w-12 h-12 flex items-center justify-center relative
              \${sidebarPanel === item.id ? 'text-white' : 'text-[var(--text-muted)]'}\`}
          >
            {sidebarPanel === item.id && (
              <div className="absolute left-0 w-0.5 h-6 bg-white" />
            )}
            <item.icon size={24} strokeWidth={1.5} />
            {item.badge && (
              <span className="absolute -top-1 -right-1 bg-[var(--accent-primary)] 
                text-white text-[10px] rounded-full px-1">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center pb-2">
        <button className="w-12 h-12 flex items-center justify-center text-[var(--text-muted)]">
          <User size={24} strokeWidth={1.5} />
        </button>
        <button className="w-12 h-12 flex items-center justify-center text-[var(--text-muted)]">
          <Settings size={24} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
`,

  "Sidebar.tsx": `'use client';

import React from 'react';
import { useEditorStore, TreeNode } from '@/store/editor';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from 'lucide-react';

// File tree component
const TreeItem: React.FC<{ node: TreeNode; depth: number }> = ({ node, depth }) => {
  const { openFile, toggleFolder, activeFile } = useEditorStore();
  const isActive = node.type === 'file' && node.name === activeFile;

  const handleClick = () => {
    if (node.type === 'folder') {
      toggleFolder(node.path);
    } else {
      openFile(node.name);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={\`flex items-center gap-1 py-[2px] cursor-pointer hover:bg-[var(--bg-hover)]
          \${isActive ? 'bg-[var(--bg-selected)]' : ''}\`}
        style={{ paddingLeft: depth * 8 + 8 }}
      >
        {node.type === 'folder' ? (
          <>
            {node.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {node.isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
          </>
        ) : (
          <>
            <span className="w-4" />
            <FileText size={16} />
          </>
        )}
        <span className="text-[13px]">{node.name}</span>
      </div>
      {node.type === 'folder' && node.isOpen && node.children?.map((child) => (
        <TreeItem key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
};

export default function Sidebar() {
  const { fileTree, sidebarPanel } = useEditorStore();

  if (sidebarPanel !== 'explorer') return null;

  return (
    <aside className="w-[260px] bg-[var(--bg-sidebar)] border-r border-[var(--border-color)]">
      <div className="px-4 py-2 text-[11px] font-semibold uppercase">Explorer</div>
      <div className="text-[13px]">
        {fileTree.map((node) => (
          <TreeItem key={node.id} node={node} depth={0} />
        ))}
      </div>
    </aside>
  );
}
`,

  "Editor.tsx": `'use client';

import React from 'react';
import { useEditorStore } from '@/store/editor';
import { getFileContent } from '@/data/files';
import { X } from 'lucide-react';

export default function Editor() {
  const { tabs, activeFile, closeFile, setActiveFile } = useEditorStore();
  const content = activeFile ? getFileContent(activeFile) : '';
  const lines = content.split('\\n');

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-editor)]">
      {/* Tabs */}
      <div className="flex bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveFile(tab.name)}
            className={\`flex items-center gap-2 px-3 py-2 cursor-pointer border-r
              \${tab.isActive ? 'bg-[var(--bg-editor)]' : 'bg-[var(--bg-secondary)]'}\`}
          >
            <span className="text-[13px]">{tab.name}</span>
            <X
              size={14}
              onClick={(e) => { e.stopPropagation(); closeFile(tab.name); }}
              className="hover:bg-white/10 rounded"
            />
          </div>
        ))}
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto font-mono text-[13px]">
        {lines.map((line, idx) => (
          <div key={idx} className="flex hover:bg-[var(--bg-hover)]">
            <span className="w-12 text-right pr-4 text-[var(--text-muted)] select-none">
              {idx + 1}
            </span>
            <pre className="flex-1">{line || ' '}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
`,

  "Terminal.tsx": `'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/editor';

const commands: Record<string, string> = {
  help: 'Available: help, about, skills, projects, contact, clear',
  about: 'Anubhav Mishra - Full-Stack Developer & Systems Engineer',
  skills: 'C, C++, Python, JavaScript, TypeScript, React, Node.js, Next.js',
  projects: 'ARGON OS, CineWave, GRAN Compiler',
  contact: 'Email: anubhav09.work@gmail.com | GitHub: anubhav-n-mishra',
};

export default function Terminal() {
  const { terminalOpen } = useEditorStore();
  const [history, setHistory] = useState<string[]>([
    'Welcome to Anubhav\\'s Portfolio Terminal v1.0.0',
    'Type "help" for available commands.',
  ]);
  const [input, setInput] = useState('');

  if (!terminalOpen) return null;

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    
    const cmd = input.trim().toLowerCase();
    const output = cmd === 'clear' ? [] : [
      ...history,
      \`anubhav@portfolio:~$ \${input}\`,
      commands[cmd] || \`Command not found: \${cmd}\`,
    ];
    
    setHistory(output);
    setInput('');
  };

  return (
    <div className="h-[200px] bg-[var(--bg-terminal)] border-t border-[var(--border-color)]">
      <div className="flex items-center px-4 py-1 border-b border-[var(--border-color)]">
        <span className="text-[13px]">TERMINAL</span>
      </div>
      <div className="p-2 font-mono text-[13px] overflow-auto h-[calc(100%-30px)]">
        {history.map((line, i) => (
          <div key={i} className="text-[var(--text-primary)]">{line}</div>
        ))}
        <div className="flex">
          <span className="text-[#4ec9b0]">anubhav@portfolio:~$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleCommand}
            className="flex-1 ml-2 bg-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );
}
`,

  "StatusBar.tsx": `'use client';

import React from 'react';
import { useEditorStore } from '@/store/editor';
import { GitBranch } from 'lucide-react';

export default function StatusBar() {
  const { activeFile } = useEditorStore();
  
  const getLanguage = (filename: string | null) => {
    if (!filename) return 'Plain Text';
    const ext = filename.split('.').pop();
    const langs: Record<string, string> = {
      tsx: 'TypeScript React',
      ts: 'TypeScript',
      js: 'JavaScript',
      json: 'JSON',
      md: 'Markdown',
      css: 'CSS',
    };
    return langs[ext || ''] || 'Plain Text';
  };

  return (
    <footer className="h-[22px] flex items-center justify-between px-2 
      bg-[var(--bg-statusbar)] text-white text-[12px]">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <GitBranch size={14} />
          main
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span>Ln 1, Col 1</span>
        <span>UTF-8</span>
        <span>{getLanguage(activeFile)}</span>
      </div>
    </footer>
  );
}
`,

  "editor.ts": `import { create } from 'zustand';

export interface FileTab {
  id: string;
  name: string;
  path: string;
  isActive: boolean;
}

export interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: TreeNode[];
  isOpen?: boolean;
}

interface EditorState {
  tabs: FileTab[];
  activeFile: string | null;
  sidebarPanel: string;
  sidebarOpen: boolean;
  terminalOpen: boolean;
  fileTree: TreeNode[];
  
  openFile: (filename: string) => void;
  closeFile: (filename: string) => void;
  setActiveFile: (filename: string) => void;
  setSidebarPanel: (panel: string) => void;
  toggleSidebar: () => void;
  toggleTerminal: () => void;
  toggleFolder: (path: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [{ id: 'readme', name: 'README.md', path: '/README.md', isActive: true }],
  activeFile: 'README.md',
  sidebarPanel: 'explorer',
  sidebarOpen: true,
  terminalOpen: true,
  fileTree: [/* ... file tree structure ... */],
  
  openFile: (filename) => {
    const { tabs } = get();
    const exists = tabs.find(t => t.name === filename);
    if (exists) {
      set({ tabs: tabs.map(t => ({ ...t, isActive: t.name === filename })), activeFile: filename });
    } else {
      set({
        tabs: [...tabs.map(t => ({ ...t, isActive: false })), 
          { id: filename, name: filename, path: '/' + filename, isActive: true }],
        activeFile: filename,
      });
    }
  },
  
  closeFile: (filename) => { /* ... */ },
  setActiveFile: (filename) => { /* ... */ },
  setSidebarPanel: (panel) => set({ sidebarPanel: panel, sidebarOpen: true }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),
  toggleFolder: (path) => { /* ... */ },
}));
`,

  "theme.ts": `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'dark' | 'light';
  antiGravity: boolean;
  animations: boolean;
  toggleTheme: () => void;
  toggleAntiGravity: () => void;
  toggleAnimations: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      antiGravity: true,
      animations: true,
      toggleTheme: () => set((s) => ({ 
        theme: s.theme === 'dark' ? 'light' : 'dark' 
      })),
      toggleAntiGravity: () => set((s) => ({ antiGravity: !s.antiGravity })),
      toggleAnimations: () => set((s) => ({ animations: !s.animations })),
    }),
    { name: 'theme-storage' }
  )
);
`,

  "portfolio.ts": `// Portfolio data for Anubhav Mishra

export const portfolioData = {
  personal: {
    name: "Anubhav Mishra",
    title: "Full-Stack Developer | Systems Engineer",
    avatar: "https://avatars.githubusercontent.com/u/89638375?v=4",
    education: {
      degree: "B.Tech Computer Science Engineering",
      university: "Graphic Era Hill University",
      year: "Final Year (2025)",
    },
  },
  
  contact: {
    email: "anubhav09.work@gmail.com",
    github: "https://github.com/anubhav-n-mishra",
    linkedin: "https://linkedin.com/in/anubhav-mishra0",
    twitter: "https://twitter.com/anubhav_writes",
  },
  
  skills: {
    languages: ["C", "C++", "Java", "Python", "JavaScript", "TypeScript"],
    frontend: ["React.js", "Next.js", "Tailwind CSS"],
    backend: ["Node.js", "Express.js", "Supabase"],
    databases: ["MongoDB", "MySQL", "PostgreSQL"],
    systems: ["Operating Systems", "Compilers", "x86 Assembly"],
  },
  
  projects: [
    {
      name: "ARGON OS",
      description: "Custom x86 operating system with bootloader",
      tech: ["C", "Assembly", "QEMU"],
    },
    {
      name: "CineWave",
      description: "Group watch streaming platform",
      tech: ["React", "Node.js", "Supabase"],
    },
    {
      name: "GRAN Compiler",
      description: "Statically-typed language with LLVM backend",
      tech: ["C++", "LLVM"],
    },
  ],
  
  github: {
    contributions: 467,
    repositories: 41,
    achievements: ["Quickdraw", "YOLO", "Pull Shark"],
  },
};
`,

  "package.json": `{
  "name": "anubhav-portfolio",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "zustand": "^4.4.0",
    "lucide-react": "^0.290.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0"
  }
}
`,

  ".gitignore": `# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Debug
npm-debug.log*
`,

  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
`
};

export const getFileContent = (filename: string): string => {
  return fileContents[filename] || `// File: ${filename}\n// Content not available`;
};

export const getFileLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'md': 'Markdown',
    'json': 'JSON',
    'ts': 'TypeScript',
    'tsx': 'TypeScript React',
    'js': 'JavaScript',
    'jsx': 'JavaScript React',
    'css': 'CSS',
    'gitignore': 'Git Ignore',
  };
  return languageMap[ext || ''] || 'Plain Text';
};

export const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    'md': 'icon-markdown',
    'json': 'icon-json',
    'ts': 'icon-typescript',
    'tsx': 'icon-react',
    'js': 'icon-javascript',
    'css': 'icon-css',
  };
  return iconMap[ext || ''] || 'icon-config';
};
