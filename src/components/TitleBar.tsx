'use client';

import React, { useRef } from 'react';
import { useThemeStore } from '@/store/theme';
import { useEditorStore } from '@/store/editor';
import { 
  Sun, 
  Moon, 
  Minus, 
  Square, 
  X, 
  Code2,
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  Search,
  SquareSplitHorizontal,
  PanelLeft,
  PanelRight,
  Menu,
} from 'lucide-react';

interface MenuItemProps {
  label: string;
  items: { label?: string; shortcut?: string; action?: () => void; divider?: boolean }[];
}

const MenuItem: React.FC<MenuItemProps> = ({ label, items }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div 
      className="relative"
      style={{ height: '100%', display: 'flex', alignItems: 'center' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        style={{ 
          height: '100%',
          padding: '0 8px',
          fontSize: '13px',
          color: 'var(--text-primary)',
          background: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseOut={(e) => e.currentTarget.style.background = isOpen ? 'rgba(255,255,255,0.1)' : 'transparent'}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
      </button>
      {isOpen && (
        <div 
          className="absolute top-full left-0 min-w-[220px] py-1 rounded shadow-xl z-[200]"
          style={{ 
            backgroundColor: 'var(--bg-dropdown)', 
            border: '1px solid var(--border-color)' 
          }}
        >
          {items.map((item, idx) => (
            item.divider ? (
              <div key={idx} className="h-px my-1 mx-2" style={{ backgroundColor: 'var(--border-color)' }} />
            ) : (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  item.action?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] hover:bg-white/10 text-left"
                style={{ color: 'var(--text-primary)' }}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="text-[11px] ml-6" style={{ color: 'var(--text-muted)' }}>{item.shortcut}</span>
                )}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default function TitleBar() {
  const { theme, toggleTheme } = useThemeStore();
  const { toggleSidebar, toggleTerminal, openCommandPalette, createFile, openFile, openSimpleBrowser } = useEditorStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          createFile('/src', file.name);
          setTimeout(() => {
            useEditorStore.getState().updateFileContent(file.name, content);
            openFile(file.name);
          }, 100);
        };
        reader.readAsText(file);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle folder upload
  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          createFile('/src', file.name);
          setTimeout(() => {
            useEditorStore.getState().updateFileContent(file.name, content);
          }, 100);
        };
        reader.readAsText(file);
      });
      if (files.length > 0) {
        openFile(files[0].name);
      }
    }
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  // Download resume
  const downloadResume = () => {
    const link = document.createElement('a');
    link.href = '/Anubhav_Mishra.pdf';
    link.download = 'Anubhav_Mishra.pdf';
    link.click();
  };

  const menuItems: MenuItemProps[] = [
    {
      label: 'File',
      items: [
        { label: 'New File', shortcut: 'Ctrl+N', action: () => {
          const name = prompt('Enter file name:');
          if (name) { createFile('/src', name); openFile(name); }
        }},
        { label: 'New Window', shortcut: 'Ctrl+Shift+N', action: () => window.open(window.location.href, '_blank') },
        { divider: true },
        { label: 'Open File...', shortcut: 'Ctrl+O', action: () => fileInputRef.current?.click() },
        { label: 'Open Folder...', shortcut: 'Ctrl+K', action: () => folderInputRef.current?.click() },
        { divider: true },
        { label: 'Download Resume', shortcut: 'Ctrl+D', action: downloadResume },
        { label: 'Export Portfolio', action: () => alert('Portfolio exported!') },
        { divider: true },
        { label: 'Save', shortcut: 'Ctrl+S', action: () => alert('File saved!') },
        { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: () => alert('Save As dialog') },
        { divider: true },
        { label: 'Close Editor', shortcut: 'Ctrl+W', action: () => {
          const { activeFile, closeFile } = useEditorStore.getState();
          if (activeFile) closeFile(activeFile);
        }},
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => document.execCommand('undo') },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => document.execCommand('redo') },
        { divider: true },
        { label: 'Cut', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
        { label: 'Paste', shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
        { divider: true },
        { label: 'Find', shortcut: 'Ctrl+F', action: () => {
          const search = prompt('Find:');
          if (search) window.find(search);
        }},
        { label: 'Replace', shortcut: 'Ctrl+H', action: () => alert('Replace dialog') },
        { divider: true },
        { label: 'Command Palette', shortcut: 'Ctrl+Shift+P', action: openCommandPalette },
      ],
    },
    {
      label: 'Selection',
      items: [
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => document.execCommand('selectAll') },
        { label: 'Expand Selection', shortcut: 'Shift+Alt+→' },
        { label: 'Shrink Selection', shortcut: 'Shift+Alt+←' },
        { divider: true },
        { label: 'Copy Line Up', shortcut: 'Shift+Alt+↑' },
        { label: 'Copy Line Down', shortcut: 'Shift+Alt+↓' },
        { label: 'Move Line Up', shortcut: 'Alt+↑' },
        { label: 'Move Line Down', shortcut: 'Alt+↓' },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Command Palette...', shortcut: 'Ctrl+Shift+P', action: openCommandPalette },
        { divider: true },
        { label: 'Explorer', shortcut: 'Ctrl+Shift+E', action: () => useEditorStore.getState().setSidebarPanel('explorer') },
        { label: 'Search', shortcut: 'Ctrl+Shift+F', action: () => useEditorStore.getState().setSidebarPanel('search') },
        { label: 'Source Control', shortcut: 'Ctrl+Shift+G', action: () => useEditorStore.getState().setSidebarPanel('git') },
        { label: 'Extensions', shortcut: 'Ctrl+Shift+X', action: () => useEditorStore.getState().setSidebarPanel('extensions') },
        { divider: true },
        { label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: toggleSidebar },
        { label: 'Toggle Terminal', shortcut: 'Ctrl+`', action: toggleTerminal },
        { divider: true },
        { label: 'Toggle Theme', shortcut: 'Ctrl+K T', action: toggleTheme },
        { label: 'Zoom In', shortcut: 'Ctrl++', action: () => { document.body.style.zoom = String(parseFloat(document.body.style.zoom || '1') + 0.1); } },
        { label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => { document.body.style.zoom = String(parseFloat(document.body.style.zoom || '1') - 0.1); } },
        { label: 'Reset Zoom', shortcut: 'Ctrl+0', action: () => { document.body.style.zoom = '1'; } },
      ],
    },
    {
      label: 'Go',
      items: [
        { label: 'Go to File...', shortcut: 'Ctrl+P', action: openCommandPalette },
        { divider: true },
        { label: 'Go to About', action: () => openFile('about.md') },
        { label: 'Go to Projects', action: () => openFile('projects.json') },
        { label: 'Go to Skills', action: () => openFile('skills.ts') },
        { label: 'Go to Experience', action: () => openFile('experience.yaml') },
        { label: 'Go to Contact', action: () => openFile('contact.jsx') },
        { divider: true },
        { label: 'Go Back', shortcut: 'Alt+←', action: () => window.history.back() },
        { label: 'Go Forward', shortcut: 'Alt+→', action: () => window.history.forward() },
      ],
    },
    {
      label: 'Terminal',
      items: [
        { label: 'New Terminal', shortcut: 'Ctrl+Shift+`', action: toggleTerminal },
        { label: 'Split Terminal', shortcut: 'Ctrl+Shift+5' },
        { divider: true },
        { label: 'Run npm dev', action: () => openSimpleBrowser('/portfolio') },
        { label: 'Run Build Task...', shortcut: 'Ctrl+Shift+B' },
        { divider: true },
        { label: 'Show Terminal', action: () => useEditorStore.setState({ terminalOpen: true }) },
        { label: 'Hide Terminal', action: () => useEditorStore.setState({ terminalOpen: false }) },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'Welcome', action: () => openFile('README.md') },
        { label: 'Documentation', action: () => window.open('https://github.com/anubhav-n-mishra', '_blank') },
        { label: 'Show All Commands', shortcut: 'Ctrl+Shift+P', action: openCommandPalette },
        { divider: true },
        { label: 'View on GitHub', action: () => window.open('https://github.com/anubhav-n-mishra', '_blank') },
        { label: 'View LinkedIn', action: () => window.open('https://linkedin.com/in/anubhav-mishra0', '_blank') },
        { divider: true },
        { label: 'About', action: () => alert('Anubhav Mishra Portfolio\nBuilt with Next.js, TypeScript & Tailwind CSS\n\nVersion 1.0.0') },
      ],
    },
  ];

  return (
    <>
      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload}
        multiple
        accept=".js,.jsx,.ts,.tsx,.json,.md,.css,.html,.py,.sql,.yaml,.yml,.txt"
      />
      <input 
        type="file" 
        ref={folderInputRef} 
        className="hidden" 
        onChange={handleFolderUpload}
        multiple
      />
      
      <header 
        className="flex items-center h-[35px] select-none relative"
        style={{ 
          backgroundColor: 'var(--bg-titlebar)', 
          borderBottom: '1px solid var(--border-color)' 
        }}
      >
        {/* Left - Logo & Menu */}
        <div className="flex items-center h-full">
          {/* VS Code Logo */}
          <div className="w-12 h-full flex items-center justify-center" style={{ color: 'var(--accent-primary)' }}>
            <Code2 size={18} />
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-white/10 rounded"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={16} style={{ color: 'var(--text-primary)' }} />
          </button>
          
          {/* Menu Bar */}
          <nav 
            className="hidden md:flex items-center h-full"
            style={{ display: 'flex', gap: '0px' }}
          >
            {menuItems.map((menu) => (
              <MenuItem key={menu.label} {...menu} />
            ))}
          </nav>
          
          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center ml-2 gap-0.5">
            <button 
              onClick={() => window.history.back()}
              className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={16} />
            </button>
            <button 
              onClick={() => window.history.forward()}
              className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 flex justify-center px-4">
          <div 
            onClick={openCommandPalette}
            className="flex items-center w-full max-w-[400px] h-[26px] px-3 rounded cursor-pointer hover:brightness-110"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <Search size={14} className="mr-2" style={{ color: 'var(--text-muted)' }} />
            <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>anubhav-portfolio</span>
          </div>
        </div>

        {/* Right - Actions & Window Controls */}
        <div className="flex items-center h-full ml-auto shrink-0">
          <button 
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            style={{ color: 'var(--text-muted)' }}
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          <button 
            onClick={toggleSidebar}
            className="hidden sm:flex w-8 h-8 items-center justify-center hover:bg-white/10 rounded" 
            title="Toggle Sidebar"
            style={{ color: 'var(--text-muted)' }}
          >
            <PanelLeft size={16} />
          </button>
          
          <button 
            onClick={toggleTerminal}
            className="hidden md:flex w-8 h-8 items-center justify-center hover:bg-white/10 rounded" 
            title="Toggle Terminal"
            style={{ color: 'var(--text-muted)' }}
          >
            <SquareSplitHorizontal size={16} />
          </button>
          
          <button 
            className="hidden lg:flex w-8 h-8 items-center justify-center hover:bg-white/10 rounded" 
            title="Toggle Secondary Sidebar"
            style={{ color: 'var(--text-muted)' }}
          >
            <PanelRight size={16} />
          </button>
          
          <button 
            className="hidden lg:flex w-8 h-8 items-center justify-center hover:bg-white/10 rounded" 
            title="Customize Layout"
            style={{ color: 'var(--text-muted)' }}
          >
            <LayoutGrid size={16} />
          </button>
          
          {/* Separator */}
          <div className="hidden sm:block w-px h-4 mx-1" style={{ backgroundColor: 'var(--border-color)' }} />
          
          {/* Window Controls */}
          <button className="w-[46px] h-full flex items-center justify-center hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}>
            <Minus size={16} />
          </button>
          <button className="hidden sm:flex w-[46px] h-full items-center justify-center hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}>
            <Square size={12} />
          </button>
          <button className="w-[46px] h-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <X size={16} />
          </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div 
            className="absolute top-full left-0 right-0 shadow-lg z-50 md:hidden max-h-[70vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-dropdown)', borderBottom: '1px solid var(--border-color)' }}
          >
            {menuItems.map((menu) => (
              <div key={menu.label} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="px-4 py-2 text-[13px] font-semibold" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}>
                  {menu.label}
                </div>
                {menu.items.filter(item => !item.divider).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      item.action?.();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-[13px] hover:bg-white/10"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{item.shortcut}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
