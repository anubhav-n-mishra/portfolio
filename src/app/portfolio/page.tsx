'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, Linkedin, Mail, ExternalLink, Code, Database, Globe, 
  ChevronDown, ChevronLeft, ChevronRight, Menu, X, Sun, Moon,
  User, GraduationCap, Code2, Heart, MapPin, Download, Phone,
  Award, Zap, Send, Sparkles, Twitter
} from 'lucide-react';
import './portfolio.css';

// Skills data from resume
const skillCategories = {
  languages: {
    title: 'Programming Languages',
    skills: [
      { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
      { name: 'C', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
      { name: 'C++', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
      { name: 'Java', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
      { name: 'JavaScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
      { name: 'SQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
      { name: 'x86 Assembly', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg' },
    ]
  },
  frontend: {
    title: 'Frontend Development',
    skills: [
      { name: 'React.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { name: 'Next.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
      { name: 'HTML5', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
      { name: 'CSS3', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
      { name: 'Tailwind CSS', logo: 'https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg' },
    ]
  },
  backend: {
    title: 'Backend & Databases',
    skills: [
      { name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
      { name: 'Express.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' },
      { name: 'MongoDB', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
      { name: 'MySQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
      { name: 'PostgreSQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
      { name: 'Supabase', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg' },
    ]
  },
  tools: {
    title: 'Tools & DevOps',
    skills: [
      { name: 'Git', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
      { name: 'GitHub', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
      { name: 'Docker', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
      { name: 'Linux', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg' },
      { name: 'QEMU', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg' },
      { name: 'Vercel', logo: 'https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png' },
    ]
  },
};

// Projects from resume
const projectData = [
  {
    id: 1,
    title: "ARGON OS",
    description: "A modular x86 operating system from scratch in C and Assembly, including a custom bootloader, protected-mode kernel, in-memory file system, command-line shell with 10+ commands, round-robin process scheduling, and memory-safe I/O. Achieved 100% build success in 20+ CI-tested development cycles.",
    technologies: ["C", "x86 Assembly", "QEMU", "Make", "GCC"],
    githubUrl: "https://github.com/anubhav-n-mishra",
    featured: true
  },
  {
    id: 2,
    title: "GRAN Compiler",
    description: "LLVM-based compiler for a custom programming language. Statically typed, C-like language with variables, functions, control flow, and print statements using a recursive descent parser. Integrated LLVM IR generation and C-based runtime system, compiling 30+ programs across Linux/macOS.",
    technologies: ["C++", "LLVM", "Make", "C"],
    githubUrl: "https://github.com/anubhav-n-mishra",
    featured: true
  },
  {
    id: 3,
    title: "CineWave",
    description: "Full-stack movie trailer & group watch platform. Features user authentication, React.js frontend with Node.js backend, protected routes, watchlist, reviews, and premium content via Supabase and Razorpay. Real-time group watch with chat using Socket.io for 3+ concurrent users.",
    technologies: ["React", "Node.js", "Supabase", "Razorpay", "Socket.io", "Tailwind CSS"],
    liveUrl: "#",
    githubUrl: "https://github.com/anubhav-n-mishra",
    featured: true
  },
  {
    id: 4,
    title: "IDE Portfolio",
    description: "A VS Code-style portfolio website with interactive terminal, file editor, and in-IDE browser. Features dark/light theme toggle, command palette, and responsive design.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Zustand"],
    liveUrl: "/",
    githubUrl: "https://github.com/anubhav-n-mishra",
    featured: true
  },
  {
    id: 5,
    title: "Steganography Tool",
    description: "Python-based LSB steganography implementation for hiding secret messages within images securely.",
    technologies: ["Python", "NumPy", "PIL"],
    githubUrl: "https://github.com/anubhav-n-mishra",
    featured: false
  },
  {
    id: 6,
    title: "OWASP Risk Calculator",
    description: "Risk assessment tool based on OWASP methodology with intuitive Tkinter GUI for security analysis.",
    technologies: ["Python", "Tkinter"],
    githubUrl: "https://github.com/anubhav-n-mishra",
    featured: false
  },
];

// Certifications from resume
const certifications = [
  "Google Cybersecurity Professional Certificate – Google",
  "AWS Cloud Quest - AWS",
  "Google Cloud Computing Foundations – NPTEL",
  "Cybersecurity Fundamentals – Cisco",
  "Networking Fundamentals – Cisco",
];

// Achievements from resume
const achievements = [
  { title: "6th Rank – AWS JAM", year: "2025", description: "Dehradun's First AWS Jam Event" },
  { title: "Finalist – Hack-O-Holic Hackathon", year: "2023", description: "Graphic Era Hill University" },
  { title: "Selected for Amazon ML Summer School", year: "2025", description: "Competitive ML program" },
  { title: "President – College E&D Club", year: "2024-2025", description: "Led 100+ students in workshops on cybersecurity, startup incubation" },
];

export default function PortfolioPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('languages');
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Particle animation
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const mouse = { x: null as number | null, y: null as number | null, radius: 200 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      originalSize: number;
    }> = [];
    const particleCount = 80;
    const connectionDistance = 150;

    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 2 + 1;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: size,
        originalSize: size
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            particle.x -= Math.cos(angle) * force * 3;
            particle.y -= Math.sin(angle) * force * 3;
            particle.size = particle.originalSize * (1 + force * 0.8);
          } else {
            particle.size = particle.originalSize;
          }
        } else {
          particle.size = particle.originalSize;
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const particleColor = isDark ? 'rgba(102, 126, 234, 0.8)' : 'rgba(102, 126, 234, 0.6)';
        const lineColor = '102, 126, 234';

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const mouseOpacity = (1 - distance / mouse.radius) * 0.8;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${mouseOpacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * (isDark ? 0.4 : 0.3);
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  // Project slideshow
  const projectsPerSlide = 3;
  const totalSlides = projectData.length - projectsPerSlide + 1;
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  const getCurrentSlideProjects = () => projectData.slice(currentSlide, currentSlide + projectsPerSlide);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAllSkills = () => Object.values(skillCategories).flatMap(cat => cat.skills);
  const filteredSkills = activeCategory === 'all' 
    ? getAllSkills() 
    : skillCategories[activeCategory as keyof typeof skillCategories]?.skills || [];

  return (
    <div className={`portfolio-app ${darkMode ? '' : 'light'}`}>
      {/* Header */}
      <header className={`portfolio-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="logo">
            <span className="logo-text gradient-text">AM</span>
          </div>
          
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul className="nav-list">
              {['Hero', 'About', 'Skills', 'Projects', 'Contact'].map(item => (
                <li key={item} className="nav-item">
                  <button onClick={() => scrollToSection(item.toLowerCase())} className="nav-link">
                    {item === 'Hero' ? 'Home' : item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-toggle">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero">
        <canvas ref={heroCanvasRef} className="hero-canvas" />
        
        <div className="hero-background">
          <div className="gradient-overlay"></div>
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <div className="floating-shapes">
          <div className="floating-element floating-1"><Code size={40} /></div>
          <div className="floating-element floating-2"><Sparkles size={30} /></div>
          <div className="floating-element floating-3"><div className="geometric-shape triangle"></div></div>
          <div className="floating-element floating-4"><div className="geometric-shape circle"></div></div>
          <div className="floating-element floating-5"><div className="geometric-shape square"></div></div>
        </div>

        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Hi, I&apos;m <span className="gradient-text">Anubhav Mishra</span>
            </h1>
            <h2 className="hero-subtitle">
              <span className="typing-text">Full-Stack Developer &amp; Systems Engineer</span>
            </h2>
            <p className="hero-description">
              Final-Year B.Tech CSE Student at Graphic Era Hill University. 
              Passionate about building operating systems, compilers, and scalable web applications.
              Currently exploring distributed systems, backend architectures, and full-stack engineering.
            </p>

            <div className="hero-cta">
              <button className="btn btn-primary" onClick={() => scrollToSection('about')}>
                <span>Learn More About Me</span>
                <div className="btn-shine"></div>
              </button>
              <button className="btn btn-secondary" onClick={() => scrollToSection('projects')}>
                <span>View My Work</span>
                <div className="btn-shine"></div>
              </button>
              <a href="/Anubhav_Mishra.pdf" download className="btn btn-secondary" style={{display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none'}}>
                <Download size={18} />
                <span>Download Resume</span>
                <div className="btn-shine"></div>
              </a>
            </div>

            <div className="hero-social-links">
              <a href="https://github.com/anubhav-n-mishra" className="hero-social" target="_blank" rel="noopener noreferrer">
                <Github size={20} />
                <span className="social-tooltip">GitHub</span>
              </a>
              <a href="https://linkedin.com/in/anubhav-mishra0" className="hero-social" target="_blank" rel="noopener noreferrer">
                <Linkedin size={20} />
                <span className="social-tooltip">LinkedIn</span>
              </a>
              <a href="mailto:anubhav09.work@gmail.com" className="hero-social">
                <Mail size={20} />
                <span className="social-tooltip">Email</span>
              </a>
              <a href="https://twitter.com/anubhav_writes" className="hero-social" target="_blank" rel="noopener noreferrer">
                <Twitter size={20} />
                <span className="social-tooltip">Twitter</span>
              </a>
            </div>
          </div>
        </div>

        <div className="scroll-indicator" onClick={() => scrollToSection('about')}>
          <ChevronDown size={32} />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="section-background">
          <div className="section-orb orb-1"></div>
          <div className="section-orb orb-2"></div>
        </div>
        
        <div className="container">
          <h2 className="section-title">About Me</h2>
          
          <div className="about-content">
            <div className="about-text">
              <div className="about-card main-card">
                <div className="card-icon"><User size={24} /></div>
                <h3>Who I Am</h3>
                <p>
                  I&apos;m a final-year Computer Science student driven by curiosity and a love for 
                  turning ideas into digital solutions. From building operating systems to crafting 
                  full-stack web applications, I enjoy tackling complex problems and creating 
                  impactful software. My focus is on systems programming, compiler design, and 
                  modern web development.
                </p>
              </div>

              <div className="about-grid">
                <div className="about-card">
                  <div className="card-icon"><GraduationCap size={20} /></div>
                  <h4>Education</h4>
                  <p>B.Tech CSE - 7.63/10 CGPA</p>
                  <span className="card-detail">Graphic Era Hill University, Dehradun (2022 - Present)</span>
                </div>

                <div className="about-card">
                  <div className="card-icon"><Code2 size={20} /></div>
                  <h4>Focus Areas</h4>
                  <p>Systems & Full-Stack</p>
                  <span className="card-detail">Operating Systems, Compilers, React/Node.js</span>
                </div>

                <div className="about-card">
                  <div className="card-icon"><Heart size={20} /></div>
                  <h4>Driven By</h4>
                  <p>Innovation & Learning</p>
                  <span className="card-detail">Building robust software, solving real-world problems</span>
                </div>

                <div className="about-card">
                  <div className="card-icon"><MapPin size={20} /></div>
                  <h4>Location</h4>
                  <p>Dehradun, India</p>
                  <span className="card-detail">Open to remote & relocation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="skills">
        <div className="section-background">
          <div className="section-orb orb-1"></div>
          <div className="section-orb orb-2"></div>
        </div>
        
        <div className="container">
          <h2 className="section-title">Skills & Technologies</h2>

          <div className="skills-categories">
            {[
              { id: 'languages', label: 'Languages', icon: <Code size={18} /> },
              { id: 'frontend', label: 'Frontend', icon: <Globe size={18} /> },
              { id: 'backend', label: 'Backend', icon: <Database size={18} /> },
              { id: 'tools', label: 'Tools', icon: <Zap size={18} /> },
              { id: 'all', label: 'All Skills', icon: <Sparkles size={18} /> },
            ].map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <div className="category-icon">{cat.icon}</div>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="skills-grid">
            {filteredSkills.map((skill) => (
              <div key={skill.name} className="skill-card">
                <div className="skill-icon">
                  <img src={skill.logo} alt={skill.name} width={32} height={32} />
                </div>
                <h4 className="skill-name">{skill.name}</h4>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="certifications">
            <h3 className="subsection-title">Certifications</h3>
            <div className="cert-grid">
              {certifications.map((cert, i) => (
                <div key={i} className="cert-card">
                  <Award size={20} className="cert-icon" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects">
        <div className="section-background">
          <div className="section-orb orb-1"></div>
          <div className="section-orb orb-2"></div>
        </div>
        
        <div className="container">
          <h2 className="section-title">My Projects</h2>
          <p className="section-subtitle">A showcase of my recent work and personal projects</p>

          <div className="projects-slideshow">
            {totalSlides > 1 && (
              <>
                <button className="slide-nav slide-nav-prev" onClick={prevSlide}>
                  <ChevronLeft size={24} />
                </button>
                <button className="slide-nav slide-nav-next" onClick={nextSlide}>
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <div className="projects-grid">
              {getCurrentSlideProjects().map((project) => (
                <div key={project.id} className={`project-card ${project.featured ? 'featured' : ''}`}>
                  <div className="project-content">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                    <div className="project-technologies">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                    <div className="project-links">
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                          <ExternalLink size={18} /> Live Demo
                        </a>
                      )}
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                        <Github size={18} /> Source Code
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalSlides > 1 && (
              <div className="slide-indicators">
                {Array.from({ length: totalSlides }, (_, i) => (
                  <button
                    key={i}
                    className={`slide-indicator ${currentSlide === i ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="achievements">
            <h3 className="subsection-title">Achievements</h3>
            <div className="achievements-grid">
              {achievements.map((ach, i) => (
                <div key={i} className="achievement-card">
                  <div className="achievement-year">{ach.year}</div>
                  <h4>{ach.title}</h4>
                  <p>{ach.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="section-background">
          <div className="section-orb orb-1"></div>
          <div className="section-orb orb-2"></div>
        </div>
        
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">
            I&apos;m always open to discussing new opportunities, interesting projects, 
            or just having a chat about technology.
          </p>

          <div className="contact-content">
            <div className="contact-info">
              <h3>Let&apos;s Connect</h3>
              <p>
                Whether you have a project in mind, want to collaborate, or just want to say hello,
                I&apos;d love to hear from you. Feel free to reach out!
              </p>

              <div className="contact-methods">
                <a href="mailto:anubhav09.work@gmail.com" className="contact-method">
                  <div className="contact-icon"><Mail size={24} /></div>
                  <div className="contact-details">
                    <span className="contact-label">Email</span>
                    <span className="contact-value">anubhav09.work@gmail.com</span>
                  </div>
                </a>
                <a href="tel:+919175887184" className="contact-method">
                  <div className="contact-icon"><Phone size={24} /></div>
                  <div className="contact-details">
                    <span className="contact-label">Phone</span>
                    <span className="contact-value">+91 9175887184</span>
                  </div>
                </a>
              </div>

              <div className="social-links">
                <a href="https://github.com/anubhav-n-mishra" className="social-link" target="_blank" rel="noopener noreferrer">
                  <Github size={20} />
                </a>
                <a href="https://linkedin.com/in/anubhav-mishra0" className="social-link" target="_blank" rel="noopener noreferrer">
                  <Linkedin size={20} />
                </a>
                <a href="https://twitter.com/anubhav_writes" className="social-link" target="_blank" rel="noopener noreferrer">
                  <Twitter size={20} />
                </a>
              </div>

              <button className="resume-download-btn" onClick={() => window.open('/Anubhav_Mishra.pdf', '_blank')}>
                <Download size={20} />
                <span>Download Resume</span>
              </button>
            </div>

            <div className="contact-form-container">
              <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <h3>Send a Message</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" placeholder="Your Name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="your.email@example.com" required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input type="text" id="subject" name="subject" placeholder="What's this about?" required />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows={5} placeholder="Tell me about your project..." required></textarea>
                </div>
                <button type="submit" className="submit-btn">
                  <Send size={18} />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="portfolio-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Anubhav Mishra. All rights reserved.</p>
          <p>Made with ❤️ using Next.js, TypeScript & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
