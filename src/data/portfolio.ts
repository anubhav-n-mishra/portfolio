// Portfolio Data - Anubhav Mishra
export const portfolioData = {
  personal: {
    name: "Anubhav Mishra",
    title: "Full-Stack Developer | Systems Enthusiast | OS & Compiler Builder",
    tagline: "Meticulous and collaborative defender of data, fueled by innovation and constant learning to tackle ever-evolving cyber challenges.",
    avatar: "/profile.png",
    location: "India",
    education: {
      degree: "B.Tech CSE",
      university: "Graphic Era Hill University",
      year: "Final Year",
      status: "Final-Year Student"
    },
    bio: `🎓 Final-Year B.Tech CSE Student at Graphic Era Hill University
🛠 Systems Enthusiast | Full-Stack Developer | OS & Compiler Builder
🚀 Passionate about building robust software and solving real-world problems through code`,
    whatDrivesMe: [
      "💡 Building scalable systems and compiler-level tech from scratch",
      "🔍 Exploring distributed systems, backend architectures, and full-stack engineering",
      "🚀 Innovating through real-world projects like CineWave, GRAN, and ARGON OS"
    ],
    currentlyExploring: [
      "Distributed Systems, Compiler Optimization",
      "Full-Stack Architecture (Node.js + Supabase + React.js)",
      "DevOps & Linux Internals"
    ]
  },
  
  contact: {
    email: "anubhav09.work@gmail.com",
    github: "https://github.com/anubhav-n-mishra",
    linkedin: "https://linkedin.com/in/anubhav-mishra0",
    twitter: "https://twitter.com/anubhav_writes",
    leetcode: "https://leetcode.com/anubhav_n_mishra/"
  },
  
  github: {
    username: "anubhav-n-mishra",
    contributions: 467,
    repositories: 41,
    stars: 2,
    followers: 2,
    following: 1
  },
  
  skills: {
    languages: [
      { name: "C", icon: "c", proficiency: 90 },
      { name: "C++", icon: "cplusplus", proficiency: 85 },
      { name: "Java", icon: "java", proficiency: 80 },
      { name: "Python", icon: "python", proficiency: 85 },
      { name: "JavaScript", icon: "javascript", proficiency: 90 },
      { name: "TypeScript", icon: "typescript", proficiency: 80 }
    ],
    frameworks: [
      { name: "React.js", icon: "react", proficiency: 90 },
      { name: "Next.js", icon: "nextjs", proficiency: 85 },
      { name: "Node.js", icon: "nodejs", proficiency: 88 },
      { name: "Express.js", icon: "express", proficiency: 85 }
    ],
    databases: [
      { name: "MongoDB", icon: "mongodb", proficiency: 85 },
      { name: "MySQL", icon: "mysql", proficiency: 80 },
      { name: "Supabase", icon: "supabase", proficiency: 75 },
      { name: "PostgreSQL", icon: "postgresql", proficiency: 75 }
    ],
    tools: [
      { name: "Git", icon: "git", proficiency: 90 },
      { name: "Linux", icon: "linux", proficiency: 85 },
      { name: "Docker", icon: "docker", proficiency: 70 },
      { name: "QEMU", icon: "qemu", proficiency: 75 },
      { name: "GCC", icon: "gcc", proficiency: 80 },
      { name: "LLVM", icon: "llvm", proficiency: 70 }
    ],
    other: [
      "x86 Assembly",
      "Bootloader Development",
      "Compiler Design",
      "OpenCV",
      "Pandas",
      "NumPy",
      "Seaborn",
      "Razorpay Integration",
      "Real-time Systems"
    ]
  },
  
  projects: [
    {
      id: 1,
      name: "ARGON OS",
      description: "Built a modular x86 operating system from scratch with custom bootloader, memory management, and scheduler.",
      longDescription: `A modular x86 operating system built from the ground up featuring:
- Custom bootloader written in x86 Assembly
- Memory management with paging
- Process scheduler with context switching
- Keyboard and display drivers
- Basic shell interface`,
      tech: ["C", "x86 Assembly", "QEMU", "GCC", "Bootloader", "Scheduler"],
      icon: "🔧",
      category: "Systems",
      featured: true,
      github: "https://github.com/anubhav-n-mishra",
      status: "completed"
    },
    {
      id: 2,
      name: "CineWave",
      description: "Group Watch Streaming Platform with real-time sync, chat, and Razorpay subscription integration.",
      longDescription: `A full-featured streaming platform that allows users to watch content together:
- Real-time video synchronization across multiple users
- Live chat during watch sessions
- User authentication with Supabase
- Razorpay payment integration for subscriptions
- Responsive React.js frontend with Node.js backend`,
      tech: ["React", "Node.js", "Supabase", "Razorpay", "WebSocket"],
      icon: "🌐",
      category: "Full-Stack",
      featured: true,
      github: "https://github.com/anubhav-n-mishra",
      status: "completed"
    },
    {
      id: 3,
      name: "GRAN Compiler",
      description: "Statically-typed programming language with LLVM backend, type checking, and custom IR generation.",
      longDescription: `A custom programming language and compiler featuring:
- Lexer and parser for custom syntax
- Static type checking system
- Custom Intermediate Representation (IR)
- LLVM backend for code generation
- C++ runtime support`,
      tech: ["C++", "LLVM", "Type Checking", "IR Generation", "Compiler Design"],
      icon: "🛠",
      category: "Compilers",
      featured: true,
      github: "https://github.com/anubhav-n-mishra",
      status: "completed"
    },
    {
      id: 4,
      name: "GRAN Playground",
      description: "In-browser compiler playground for GRAN language with Node.js backend and real-time REPL.",
      longDescription: `An interactive web-based playground for the GRAN language:
- Browser-based code editor
- Real-time compilation and execution
- REPL interface for interactive coding
- Error highlighting and feedback
- Code sharing capabilities`,
      tech: ["Node.js", "React", "REPL", "WebSocket"],
      icon: "🌐",
      category: "Tools",
      featured: false,
      github: "https://github.com/anubhav-n-mishra",
      status: "completed"
    },
    {
      id: 5,
      name: "Sorting Visualizer",
      description: "Interactive visualization of various sorting algorithms with step-by-step animation.",
      tech: ["JavaScript", "HTML", "CSS", "Algorithms"],
      icon: "📊",
      category: "Visualization",
      featured: false,
      github: "https://github.com/anubhav-n-mishra/sorting-visualizer",
      status: "completed"
    },
    {
      id: 6,
      name: "Steganography",
      description: "Python tool for hiding secret messages within images using LSB steganography.",
      tech: ["Python", "PIL", "Cryptography"],
      icon: "🔐",
      category: "Security",
      featured: false,
      github: "https://github.com/anubhav-n-mishra/Steganography",
      stars: 1,
      status: "completed"
    },
    {
      id: 7,
      name: "OWASP Risk Calculator",
      description: "Python app with Tkinter GUI and Matplotlib for security risk assessment visualization.",
      tech: ["Python", "Tkinter", "Matplotlib", "OWASP"],
      icon: "🛡️",
      category: "Security",
      featured: false,
      github: "https://github.com/anubhav-n-mishra/Owasp-Risk-Calculator",
      stars: 1,
      status: "completed"
    },
    {
      id: 8,
      name: "Face Detection App",
      description: "Real-time face tracking application using OpenCV and Python.",
      tech: ["Python", "OpenCV", "Computer Vision"],
      icon: "🧠",
      category: "AI/ML",
      featured: false,
      github: "https://github.com/anubhav-n-mishra",
      status: "completed"
    },
    {
      id: 9,
      name: "Bharat EV Saathi",
      description: "EV charging station locator and management system for India.",
      tech: ["Python", "React", "Maps API"],
      icon: "⚡",
      category: "Full-Stack",
      featured: false,
      github: "https://github.com/anubhav-n-mishra/bharat-ev-saathi",
      status: "completed"
    },
    {
      id: 10,
      name: "Stellar School",
      description: "Educational platform with modern UI and interactive learning features.",
      tech: ["JavaScript", "React", "Node.js"],
      icon: "🎓",
      category: "Full-Stack",
      featured: false,
      github: "https://github.com/anubhav-n-mishra/stellarschool",
      status: "completed"
    },
    {
      id: 11,
      name: "POI Inspector",
      description: "Point of Interest inspection and analysis tool.",
      tech: ["Python", "Data Analysis"],
      icon: "📍",
      category: "Tools",
      featured: false,
      github: "https://github.com/anubhav-n-mishra/POI_INSPECTOR",
      status: "completed"
    },
    {
      id: 12,
      name: "Prime Estate",
      description: "Real estate platform with property listings and management.",
      tech: ["TypeScript", "React", "Node.js"],
      icon: "🏠",
      category: "Full-Stack",
      featured: false,
      github: "https://github.com/anubhav-n-mishra/prime_estate",
      status: "completed"
    }
  ],
  
  achievements: [
    { name: "Quickdraw", description: "GitHub Achievement", icon: "⚡" },
    { name: "YOLO", description: "GitHub Achievement", icon: "🎯" },
    { name: "Pull Shark", description: "GitHub Achievement", icon: "🦈" }
  ],
  
  recentActivity: [
    {
      type: "commits",
      repo: "Day-1-of-10-days-of-ai-agent",
      count: 7,
      date: "November 2025"
    },
    {
      type: "commits",
      repo: "bharat-ev-saathi",
      count: 7,
      date: "November 2025"
    },
    {
      type: "commits",
      repo: "stellarschool",
      count: 6,
      date: "November 2025"
    },
    {
      type: "commits",
      repo: "POI_INSPECTOR",
      count: 4,
      date: "November 2025"
    },
    {
      type: "pull_request",
      repo: "Day-1-of-10-days-of-ai-agent",
      title: "Teach the tutor",
      date: "Nov 25, 2025"
    },
    {
      type: "pull_request",
      repo: "Day-1-of-10-days-of-ai-agent",
      title: "Health agent",
      date: "Nov 24, 2025"
    }
  ],
  
  problemSolving: {
    leetcode: "https://leetcode.com/anubhav_n_mishra/",
    github: "https://github.com/anubhav-n-mishra"
  }
};

export type PortfolioData = typeof portfolioData;
