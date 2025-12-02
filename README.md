# 👨‍💻 Anubhav Mishra - Portfolio IDE

Welcome to my **VS Code-style portfolio website**! This interactive portfolio is designed to look and feel like Visual Studio Code, giving you a unique developer experience.

🌐 **Live Site**: [mishraanubhav.me](https://mishraanubhav.me)

## 🚀 Quick Start Guide

### For First-Time Users
When you visit the site, you'll be asked about your IDE experience:
- **"I've used an IDE before"** → Opens the full VS Code-style IDE interface
- **"I'm new to IDEs"** → Opens a simpler portfolio view at `/portfolio`
- **Mobile users** → Automatically redirected to the simpler portfolio view

### 🎮 How to Use the IDE Interface

#### Navigation
- **Explorer (📁)**: Browse project files in the left sidebar
- **Search (🔍)**: Search through the portfolio content
- **Source Control (🔀)**: View my GitHub activity and contributions
- **Extensions (🧩)**: Install/manage portfolio extensions
- **AI Assistant (🤖)**: Chat with AI about my skills and projects
- **Account (👤)**: View my profile and social links

#### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Open Command Palette |
| `Ctrl+P` | Quick file open |
| `Ctrl+B` | Toggle Sidebar |
| `Ctrl+\`` | Toggle Terminal |
| `Ctrl+K` | Toggle Theme (Dark/Light) |
| `Ctrl+Shift+E` | Explorer Panel |
| `Ctrl+Shift+F` | Search Panel |
| `Ctrl+Shift+X` | Extensions Panel |

#### Terminal Commands
Type these commands in the terminal:
```bash
help          # Show all available commands
about         # Learn about me
skills        # View my technical skills
projects      # See my featured projects
contact       # Get my contact information
resume        # Download my resume (requires Resume extension)
github        # Open my GitHub profile
linkedin      # Open my LinkedIn profile
npm run dev   # Launch the portfolio preview
clear         # Clear terminal
neofetch      # Fun system info display
```

#### Extensions System
Before using certain features, you need to install extensions:
1. Press `Ctrl+Shift+X` or click the Extensions icon
2. Find "Resume Download" extension
3. Click "Install" and wait for the animation
4. Now you can use the `resume` command in terminal!

### 📱 Mobile Experience
On mobile devices, you'll be automatically redirected to a simplified portfolio at `/portfolio` with:
- Smooth animations and particle effects
- Easy-to-navigate sections
- Touch-friendly interface
- All the same content, optimized for mobile

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **AI**: Google Gemini

## 📂 Project Structure
```
src/
├── app/
│   ├── page.tsx          # Main IDE page
│   └── portfolio/        # Simple portfolio page
├── components/
│   ├── IDELayout.tsx     # Main IDE layout
│   ├── TitleBar.tsx      # VS Code title bar
│   ├── ActivityBar.tsx   # Left activity icons
│   ├── Sidebar.tsx       # File explorer & panels
│   ├── Editor.tsx        # Code editor view
│   ├── Terminal.tsx      # Interactive terminal
│   └── StatusBar.tsx     # Bottom status bar
├── store/                # Zustand state management
└── data/                 # Portfolio content data
```

## 📬 Contact
- **Email**: anubhav.mishra@outlook.com
- **GitHub**: [github.com/anubhav-n-mishra](https://github.com/anubhav-n-mishra)
- **LinkedIn**: [linkedin.com/in/anubhav-mishra0](https://linkedin.com/in/anubhav-mishra0)
- **Twitter**: [@anubhav_writes](https://twitter.com/anubhav_writes)

---

Built with ❤️ by Anubhav Mishra | © 2024