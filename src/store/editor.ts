import { create } from 'zustand';
import { fileContents, getFileContent } from '@/data/files';

export interface FileTab {
  id: string;
  name: string;
  path: string;
  isActive: boolean;
  isDirty: boolean;
}

export interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: TreeNode[];
  isOpen?: boolean;
}

export type SidebarPanel =
  | 'explorer'
  | 'search'
  | 'git'
  | 'extensions'
  | 'ai'
  | 'account'
  | 'settings';

export type PaletteMode = 'commands' | 'files';

export interface ExtensionDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  publisher: string;
}

export const EXTENSIONS: ExtensionDef[] = [
  {
    id: 'resume',
    name: 'Resume Download',
    description: 'Adds the `resume` terminal command and the download action.',
    icon: '📄',
    publisher: 'anubhav-n-mishra',
  },
  {
    id: 'code-runner',
    name: 'Code Runner',
    description: 'Runs the open file — JS, TS, Python, C, C++ and more.',
    icon: '▶️',
    publisher: 'anubhav-n-mishra',
  },
  {
    id: 'github',
    name: 'GitHub Integration',
    description: 'Shows repository activity in the Source Control panel.',
    icon: '🐙',
    publisher: 'anubhav-n-mishra',
  },
  {
    id: 'theme',
    name: 'Theme Switcher',
    description: 'Dark and light variants of the editor theme.',
    icon: '🎨',
    publisher: 'anubhav-n-mishra',
  },
  {
    id: 'assistant',
    name: 'Portfolio Assistant',
    description: 'Answers questions about the work, entirely offline.',
    icon: '🤖',
    publisher: 'anubhav-n-mishra',
  },
  {
    id: 'browser',
    name: 'Simple Browser',
    description: 'Renders HTML and live sites in a side pane.',
    icon: '🌐',
    publisher: 'anubhav-n-mishra',
  },
];

interface EditorState {
  tabs: FileTab[];
  activeFile: string | null;
  sidebarPanel: SidebarPanel;
  sidebarOpen: boolean;
  terminalOpen: boolean;
  terminalHeight: number;
  fileTree: TreeNode[];
  commandPaletteOpen: boolean;
  commandPaletteMode: PaletteMode;
  simpleBrowserOpen: boolean;
  simpleBrowserUrl: string;
  /** Set instead of a URL when previewing HTML written in the editor. */
  simpleBrowserDoc: string | null;
  simpleBrowserTitle: string;
  userFiles: Record<string, string>;
  installedExtensions: string[];

  openFile: (filename: string) => void;
  closeFile: (filename: string) => void;
  closeAllFiles: () => void;
  setActiveFile: (filename: string) => void;
  setSidebarPanel: (panel: SidebarPanel) => void;
  showSidebarPanel: (panel: SidebarPanel) => void;
  toggleSidebar: () => void;
  toggleTerminal: () => void;
  setTerminalOpen: (open: boolean) => void;
  setTerminalHeight: (height: number) => void;
  toggleFolder: (path: string) => void;
  collapseAllFolders: () => void;
  openCommandPalette: (mode?: PaletteMode) => void;
  closeCommandPalette: () => void;
  openSimpleBrowser: (url: string) => void;
  previewDocument: (doc: string, title: string) => void;
  closeSimpleBrowser: () => void;
  createFile: (parentPath: string, name: string, content?: string) => void;
  createFolder: (parentPath: string, name: string) => void;
  updateFileContent: (filename: string, content: string) => void;
  saveFile: (filename: string) => void;
  /** Current text of a file: the visitor's edits if any, otherwise the shipped content. */
  contentOf: (filename: string) => string;
  /** Every filename the explorer knows about, for quick-open and search. */
  allFilenames: () => string[];
}

const initialFileTree: TreeNode[] = [
  {
    id: 'root',
    name: 'anubhav-portfolio',
    type: 'folder',
    path: '/',
    isOpen: true,
    children: [
      {
        id: 'about-dir',
        name: 'about',
        type: 'folder',
        path: '/about',
        isOpen: true,
        children: [
          { id: 'f-about', name: 'about.md', type: 'file', path: '/about/about.md' },
          { id: 'f-stack', name: 'stack.md', type: 'file', path: '/about/stack.md' },
        ],
      },
      {
        id: 'work-dir',
        name: 'work',
        type: 'folder',
        path: '/work',
        isOpen: true,
        children: [
          { id: 'f-products', name: 'products.json', type: 'file', path: '/work/products.json' },
          { id: 'f-projects', name: 'projects.json', type: 'file', path: '/work/projects.json' },
        ],
      },
      {
        id: 'playground-dir',
        name: 'playground',
        type: 'folder',
        path: '/playground',
        isOpen: true,
        children: [
          { id: 'f-hello', name: 'hello.js', type: 'file', path: '/playground/hello.js' },
          { id: 'f-rate', name: 'rate-limiter.ts', type: 'file', path: '/playground/rate-limiter.ts' },
          { id: 'f-fizz', name: 'fizzbuzz.py', type: 'file', path: '/playground/fizzbuzz.py' },
          { id: 'f-analysis', name: 'analysis.py', type: 'file', path: '/playground/analysis.py' },
          { id: 'f-twosum', name: 'two-sum.cpp', type: 'file', path: '/playground/two-sum.cpp' },
          { id: 'f-sched', name: 'scheduler.c', type: 'file', path: '/playground/scheduler.c' },
          { id: 'f-demo', name: 'demo.html', type: 'file', path: '/playground/demo.html' },
        ],
      },
      { id: 'f-readme', name: 'README.md', type: 'file', path: '/README.md' },
      { id: 'f-contact', name: 'contact.ts', type: 'file', path: '/contact.ts' },
    ],
  },
];

function walk(nodes: TreeNode[], visit: (node: TreeNode) => void) {
  for (const node of nodes) {
    visit(node);
    if (node.children) walk(node.children, visit);
  }
}

function findPath(nodes: TreeNode[], filename: string): string {
  let found = `/${filename}`;
  walk(nodes, (node) => {
    if (node.type === 'file' && node.name === filename) found = node.path;
  });
  return found;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [{ id: 'f-readme', name: 'README.md', path: '/README.md', isActive: true, isDirty: false }],
  activeFile: 'README.md',
  sidebarPanel: 'explorer',
  sidebarOpen: true,
  terminalOpen: true,
  terminalHeight: 220,
  fileTree: initialFileTree,
  commandPaletteOpen: false,
  commandPaletteMode: 'commands',
  simpleBrowserOpen: false,
  simpleBrowserUrl: '',
  simpleBrowserDoc: null,
  simpleBrowserTitle: '',
  userFiles: {},
  installedExtensions: ['code-runner', 'github', 'theme', 'assistant', 'browser'],

  contentOf: (filename) => {
    const { userFiles } = get();
    return userFiles[filename] !== undefined ? userFiles[filename] : getFileContent(filename);
  },

  allFilenames: () => {
    const names = new Set<string>();
    walk(get().fileTree, (node) => {
      if (node.type === 'file') names.add(node.name);
    });
    Object.keys(get().userFiles).forEach((n) => names.add(n));
    Object.keys(fileContents).forEach((n) => names.add(n));
    return [...names].sort();
  },

  openFile: (filename) => {
    const { tabs, fileTree } = get();
    const existing = tabs.find((t) => t.name === filename);

    if (existing) {
      set({
        tabs: tabs.map((t) => ({ ...t, isActive: t.name === filename })),
        activeFile: filename,
      });
      return;
    }

    set({
      tabs: [
        ...tabs.map((t) => ({ ...t, isActive: false })),
        {
          id: `tab-${filename}`,
          name: filename,
          path: findPath(fileTree, filename),
          isActive: true,
          isDirty: false,
        },
      ],
      activeFile: filename,
    });
  },

  closeFile: (filename) => {
    const { tabs, activeFile } = get();
    const index = tabs.findIndex((t) => t.name === filename);
    const remaining = tabs.filter((t) => t.name !== filename);

    if (remaining.length === 0) {
      set({ tabs: [], activeFile: null });
      return;
    }

    if (activeFile !== filename) {
      set({ tabs: remaining });
      return;
    }

    // VS Code activates the neighbour to the right, falling back to the left.
    const next = remaining[Math.min(index, remaining.length - 1)];
    set({
      tabs: remaining.map((t) => ({ ...t, isActive: t.name === next.name })),
      activeFile: next.name,
    });
  },

  closeAllFiles: () => set({ tabs: [], activeFile: null }),

  setActiveFile: (filename) =>
    set((state) => ({
      tabs: state.tabs.map((t) => ({ ...t, isActive: t.name === filename })),
      activeFile: filename,
    })),

  // Clicking the active icon in the activity bar collapses the sidebar, as in VS Code.
  setSidebarPanel: (panel) => {
    const { sidebarPanel, sidebarOpen } = get();
    if (sidebarPanel === panel && sidebarOpen) set({ sidebarOpen: false });
    else set({ sidebarPanel: panel, sidebarOpen: true });
  },

  showSidebarPanel: (panel) => set({ sidebarPanel: panel, sidebarOpen: true }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),
  setTerminalOpen: (terminalOpen) => set({ terminalOpen }),
  setTerminalHeight: (terminalHeight) => set({ terminalHeight }),

  toggleFolder: (path) => {
    const toggle = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((node) => {
        if (node.path === path && node.type === 'folder') {
          return { ...node, isOpen: !node.isOpen };
        }
        return node.children ? { ...node, children: toggle(node.children) } : node;
      });
    set((state) => ({ fileTree: toggle(state.fileTree) }));
  },

  collapseAllFolders: () => {
    const collapse = (nodes: TreeNode[], depth = 0): TreeNode[] =>
      nodes.map((node) =>
        node.type === 'folder'
          ? {
              ...node,
              // Keep the project root expanded; collapse everything inside it.
              isOpen: depth === 0 ? node.isOpen : false,
              children: node.children ? collapse(node.children, depth + 1) : undefined,
            }
          : node
      );
    set((state) => ({ fileTree: collapse(state.fileTree) }));
  },

  openCommandPalette: (mode = 'commands') =>
    set({ commandPaletteOpen: true, commandPaletteMode: mode }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  openSimpleBrowser: (url) =>
    set({
      simpleBrowserOpen: true,
      simpleBrowserUrl: url,
      simpleBrowserDoc: null,
      simpleBrowserTitle: url,
    }),

  previewDocument: (doc, title) =>
    set({
      simpleBrowserOpen: true,
      simpleBrowserDoc: doc,
      simpleBrowserUrl: '',
      simpleBrowserTitle: title,
    }),

  closeSimpleBrowser: () =>
    set({ simpleBrowserOpen: false, simpleBrowserUrl: '', simpleBrowserDoc: null }),

  createFile: (parentPath, name, content = '') => {
    const add = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((node) => {
        if (node.path === parentPath && node.type === 'folder') {
          if (node.children?.some((c) => c.name === name)) return { ...node, isOpen: true };
          return {
            ...node,
            isOpen: true,
            children: [
              ...(node.children ?? []),
              {
                id: `user-${name}-${Date.now()}`,
                name,
                type: 'file' as const,
                path: `${parentPath === '/' ? '' : parentPath}/${name}`,
              },
            ],
          };
        }
        return node.children ? { ...node, children: add(node.children) } : node;
      });

    set((state) => ({
      fileTree: add(state.fileTree),
      userFiles: { ...state.userFiles, [name]: content },
    }));
  },

  createFolder: (parentPath, name) => {
    const add = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((node) => {
        if (node.path === parentPath && node.type === 'folder') {
          if (node.children?.some((c) => c.name === name)) return { ...node, isOpen: true };
          return {
            ...node,
            isOpen: true,
            children: [
              ...(node.children ?? []),
              {
                id: `dir-${name}-${Date.now()}`,
                name,
                type: 'folder' as const,
                path: `${parentPath === '/' ? '' : parentPath}/${name}`,
                isOpen: true,
                children: [],
              },
            ],
          };
        }
        return node.children ? { ...node, children: add(node.children) } : node;
      });

    set((state) => ({ fileTree: add(state.fileTree) }));
  },

  updateFileContent: (filename, content) =>
    set((state) => ({
      userFiles: { ...state.userFiles, [filename]: content },
      // Dirty means "differs from what shipped", so undoing an edit clears the marker.
      tabs: state.tabs.map((t) =>
        t.name === filename ? { ...t, isDirty: content !== getFileContent(filename) } : t
      ),
    })),

  saveFile: (filename) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.name === filename ? { ...t, isDirty: false } : t)),
    })),
}));

/** Extension gating, used by the terminal and the resume actions. */
export const hasExtension = (id: string): boolean =>
  useEditorStore.getState().installedExtensions.includes(id);

export const installExtension = (id: string) =>
  useEditorStore.setState((state) =>
    state.installedExtensions.includes(id)
      ? state
      : { installedExtensions: [...state.installedExtensions, id] }
  );

export const uninstallExtension = (id: string) =>
  useEditorStore.setState((state) => ({
    installedExtensions: state.installedExtensions.filter((e) => e !== id),
  }));
