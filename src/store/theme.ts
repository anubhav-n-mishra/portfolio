import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'dark' | 'light';
  antiGravity: boolean;
  fontSize: number;
  showMinimap: boolean;
  showLineNumbers: boolean;
  animations: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleAntiGravity: () => void;
  setFontSize: (size: number) => void;
  toggleMinimap: () => void;
  toggleLineNumbers: () => void;
  toggleAnimations: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      antiGravity: true,
      fontSize: 14,
      showMinimap: true,
      showLineNumbers: true,
      animations: true,
      
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),
      
      setTheme: (theme) => set({ theme }),
      
      toggleAntiGravity: () => set((state) => ({ 
        antiGravity: !state.antiGravity 
      })),
      
      setFontSize: (fontSize) => set({ fontSize }),
      
      toggleMinimap: () => set((state) => ({ 
        showMinimap: !state.showMinimap 
      })),
      
      toggleLineNumbers: () => set((state) => ({ 
        showLineNumbers: !state.showLineNumbers 
      })),
      
      toggleAnimations: () => set((state) => ({ 
        animations: !state.animations 
      })),
    }),
    {
      name: 'portfolio-theme',
    }
  )
);
