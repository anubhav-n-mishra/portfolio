import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'vscode-bg': '#1e1e1e',
        'vscode-sidebar': '#252526',
        'vscode-titlebar': '#3c3c3c',
        'vscode-activitybar': '#333333',
        'vscode-statusbar': '#007acc',
        'vscode-accent': '#007acc',
        'vscode-text': '#cccccc',
        'vscode-text-dim': '#858585',
        'vscode-border': '#3c3c3c',
        'vscode-hover': '#2a2d2e',
        'vscode-selection': '#264f78',
        'vscode-tab-active': '#1e1e1e',
        'vscode-tab-inactive': '#2d2d2d',
      },
      fontFamily: {
        'mono': ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'fadeIn': 'fadeIn 0.5s ease-out',
        'slideUp': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        blink: {
          '50%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
