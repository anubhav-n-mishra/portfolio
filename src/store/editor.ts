import { create } from 'zustand';

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

interface EditorState {
  tabs: FileTab[];
  activeFile: string | null;
  sidebarPanel: 'explorer' | 'search' | 'git' | 'extensions' | 'ai' | 'account';
  sidebarOpen: boolean;
  terminalOpen: boolean;
  terminalHeight: number;
  fileTree: TreeNode[];
  commandPaletteOpen: boolean;
  simpleBrowserOpen: boolean;
  simpleBrowserUrl: string;
  userFiles: Record<string, string>;
  
  // Actions
  openFile: (filename: string) => void;
  closeFile: (filename: string) => void;
  setActiveFile: (filename: string) => void;
  setSidebarPanel: (panel: EditorState['sidebarPanel']) => void;
  toggleSidebar: () => void;
  toggleTerminal: () => void;
  setTerminalHeight: (height: number) => void;
  toggleFolder: (path: string) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openSimpleBrowser: (url: string) => void;
  closeSimpleBrowser: () => void;
  createFile: (path: string, name: string) => void;
  updateFileContent: (filename: string, content: string) => void;
  createFolder: (path: string, name: string) => void;
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
        id: 'src',
        name: 'src',
        type: 'folder',
        path: '/src',
        isOpen: true,
        children: [
          {
            id: 'app',
            name: 'app',
            type: 'folder',
            path: '/src/app',
            isOpen: true,
            children: [
              { id: 'page', name: 'page.tsx', type: 'file', path: '/src/app/page.tsx' },
              { id: 'layout', name: 'layout.tsx', type: 'file', path: '/src/app/layout.tsx' },
              { id: 'globals', name: 'globals.css', type: 'file', path: '/src/app/globals.css' },
            ],
          },
          {
            id: 'components',
            name: 'components',
            type: 'folder',
            path: '/src/components',
            isOpen: true,
            children: [
              { id: 'ide-layout', name: 'IDELayout.tsx', type: 'file', path: '/src/components/IDELayout.tsx' },
              { id: 'titlebar', name: 'TitleBar.tsx', type: 'file', path: '/src/components/TitleBar.tsx' },
              { id: 'activitybar', name: 'ActivityBar.tsx', type: 'file', path: '/src/components/ActivityBar.tsx' },
              { id: 'sidebar', name: 'Sidebar.tsx', type: 'file', path: '/src/components/Sidebar.tsx' },
              { id: 'editor', name: 'Editor.tsx', type: 'file', path: '/src/components/Editor.tsx' },
              { id: 'terminal', name: 'Terminal.tsx', type: 'file', path: '/src/components/Terminal.tsx' },
              { id: 'statusbar', name: 'StatusBar.tsx', type: 'file', path: '/src/components/StatusBar.tsx' },
            ],
          },
          {
            id: 'store',
            name: 'store',
            type: 'folder',
            path: '/src/store',
            isOpen: false,
            children: [
              { id: 'editor-store', name: 'editor.ts', type: 'file', path: '/src/store/editor.ts' },
              { id: 'theme-store', name: 'theme.ts', type: 'file', path: '/src/store/theme.ts' },
            ],
          },
          {
            id: 'data',
            name: 'data',
            type: 'folder',
            path: '/src/data',
            isOpen: false,
            children: [
              { id: 'portfolio-data', name: 'portfolio.ts', type: 'file', path: '/src/data/portfolio.ts' },
            ],
          },
        ],
      },
      { id: 'readme', name: 'README.md', type: 'file', path: '/README.md' },
      { id: 'package', name: 'package.json', type: 'file', path: '/package.json' },
      { id: 'tsconfig', name: 'tsconfig.json', type: 'file', path: '/tsconfig.json' },
      { id: 'gitignore', name: '.gitignore', type: 'file', path: '/.gitignore' },
    ],
  },
];

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [
    { id: 'readme', name: 'README.md', path: '/README.md', isActive: true, isDirty: false },
  ],
  activeFile: 'README.md',
  sidebarPanel: 'explorer',
  sidebarOpen: true,
  terminalOpen: true,
  terminalHeight: 200,
  fileTree: initialFileTree,
  commandPaletteOpen: false,
  simpleBrowserOpen: false,
  simpleBrowserUrl: '',
  userFiles: {},
  
  openFile: (filename) => {
    const { tabs } = get();
    const existingTab = tabs.find(t => t.name === filename);
    
    if (existingTab) {
      set({
        tabs: tabs.map(t => ({ ...t, isActive: t.name === filename })),
        activeFile: filename,
      });
    } else {
      set({
        tabs: [
          ...tabs.map(t => ({ ...t, isActive: false })),
          { 
            id: filename.replace(/\./g, '-'), 
            name: filename, 
            path: `/${filename}`, 
            isActive: true, 
            isDirty: false 
          },
        ],
        activeFile: filename,
      });
    }
  },
  
  closeFile: (filename) => {
    const { tabs, activeFile } = get();
    const newTabs = tabs.filter(t => t.name !== filename);
    
    if (newTabs.length === 0) {
      set({ tabs: [], activeFile: null });
    } else if (activeFile === filename) {
      const lastTab = newTabs[newTabs.length - 1];
      set({
        tabs: newTabs.map(t => ({ ...t, isActive: t.name === lastTab.name })),
        activeFile: lastTab.name,
      });
    } else {
      set({ tabs: newTabs });
    }
  },
  
  setActiveFile: (filename) => {
    const { tabs } = get();
    set({
      tabs: tabs.map(t => ({ ...t, isActive: t.name === filename })),
      activeFile: filename,
    });
  },
  
  setSidebarPanel: (panel) => {
    const { sidebarPanel, sidebarOpen } = get();
    if (sidebarPanel === panel && sidebarOpen) {
      set({ sidebarOpen: false });
    } else {
      set({ sidebarPanel: panel, sidebarOpen: true });
    }
  },
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen })),
  
  setTerminalHeight: (height) => set({ terminalHeight: height }),
  
  toggleFolder: (path) => {
    const toggleInTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.path === path && node.type === 'folder') {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: toggleInTree(node.children) };
        }
        return node;
      });
    };
    
    set((state) => ({ fileTree: toggleInTree(state.fileTree) }));
  },
  
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  
  openSimpleBrowser: (url) => set({ simpleBrowserOpen: true, simpleBrowserUrl: url }),
  
  closeSimpleBrowser: () => set({ simpleBrowserOpen: false, simpleBrowserUrl: '' }),
  
  createFile: (path, name) => {
    const addToTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.path === path && node.type === 'folder') {
          const newFile: TreeNode = {
            id: `${Date.now()}-${name}`,
            name,
            type: 'file',
            path: `${path}/${name}`,
          };
          return { 
            ...node, 
            isOpen: true,
            children: [...(node.children || []), newFile] 
          };
        }
        if (node.children) {
          return { ...node, children: addToTree(node.children) };
        }
        return node;
      });
    };
    
    set((state) => ({ 
      fileTree: addToTree(state.fileTree),
      userFiles: { ...state.userFiles, [name]: '' }
    }));
  },
  
  updateFileContent: (filename, content) => {
    set((state) => ({
      userFiles: { ...state.userFiles, [filename]: content },
      tabs: state.tabs.map(t => 
        t.name === filename ? { ...t, isDirty: true } : t
      )
    }));
  },
  
  createFolder: (path, name) => {
    const addToTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.path === path && node.type === 'folder') {
          const newFolder: TreeNode = {
            id: `${Date.now()}-${name}`,
            name,
            type: 'folder',
            path: `${path}/${name}`,
            isOpen: false,
            children: [],
          };
          return { 
            ...node, 
            isOpen: true,
            children: [...(node.children || []), newFolder] 
          };
        }
        if (node.children) {
          return { ...node, children: addToTree(node.children) };
        }
        return node;
      });
    };
    
    set((state) => ({ fileTree: addToTree(state.fileTree) }));
  },
}));
