'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Github, Linkedin, Mail, ExternalLink, Code, Database,
  ChevronDown, Menu, X, Sun, Moon,
  User, GraduationCap, Code2, Heart, MapPin, Download, Phone,
  Award, Zap, Send, Sparkles, Monitor
} from 'lucide-react';
import { portfolioData } from '@/data/portfolio';
import './portfolio.css';

const { personal, products, projects, skills, certifications, achievements } = portfolioData;

// Skill groups shown on this page. Names come from the shared data; the accent
// colours live here.
//
// These used to be <img> tags pointing at a third-party icon CDN. That made the whole
// section depend on a network the visitor might not reach, and any mismatched path
// rendered as a broken-image icon. Colour plus the name is self-contained and faster.
const ACCENTS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572a5',
  C: '#a8b9cc',
  'C++': '#f34b7d',
  'Next.js': '#ffffff',
  React: '#61dafb',
  'Node.js': '#5fa04e',
  FastAPI: '#059486',
  PostgreSQL: '#4169e1',
  'SQL + Row-Level Security': '#4169e1',
  Supabase: '#3ecf8e',
  Prisma: '#5a67d8',
  Docker: '#2496ed',
  Git: '#f05032',
  'Tailwind CSS': '#38bdf8',
  Electron: '#9feaf9',
  LLVM: '#4f4f4f',
  NASM: '#c9a227',
  WebAssembly: '#654ff0',
  OpenCV: '#5c3ee8',
  Vitest: '#fcc72b',
  pnpm: '#f9ad00',
  Kubernetes: '#326ce5',
  'MinIO / S3': '#c72e49',
  Polars: '#cd792c',
  DuckDB: '#fff000',
  WebAuthn: '#3423a6',
  'Web Push': '#ff6f00',
  WebRTC: '#ac2b1c',
  PeerJS: '#ffd54f',
  'Distributed systems': '#8b95a5',
  'Observability & tracing': '#8b95a5',
  'Payments at scale': '#8b95a5',
};

const withAccents = (names: string[]) =>
  names.map((name) => ({ name, accent: ACCENTS[name] ?? '#7c8595' }));

const skillCategories = {
  confident: { title: skills.confident.label, skills: withAccents(skills.confident.items) },
  shipped: { title: skills.shipped.label, skills: withAccents(skills.shipped.items) },
  learning: { title: skills.learning.label, skills: withAccents(skills.learning.items) },
};

// Products and projects, both from the single shared data source so the IDE,
// the terminal and this page can never disagree with each other.
const projectData = [
  ...products.map((p, i) => ({
    id: `product-${i}`,
    title: p.name,
    description: p.description,
    technologies: p.tech,
    liveUrl: p.url,
    githubUrl: undefined as string | undefined,
    kind: 'product' as const,
    note: p.note,
    featured: true,
  })),
  ...projects.map((p, i) => ({
    id: `project-${i}`,
    title: p.name,
    description: p.description,
    technologies: p.tech,
    liveUrl: undefined as string | undefined,
    githubUrl: p.repo,
    kind: 'project' as const,
    note: undefined as string | undefined,
    featured: p.featured,
  })),
];

export default function PortfolioPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('confident');
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);

  const switchToIDEView = () => {
    // Clean up portfolio attributes before navigation
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
    window.scrollTo(0, 0);

    localStorage.removeItem('ide-experience');
    router.push('/');
  };

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
            <button
              onClick={switchToIDEView}
              className="ide-toggle"
              title="Switch to IDE View"
            >
              <Monitor size={18} />
              <span className="ide-toggle-text">IDE View</span>
            </button>
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
            {/* Profile Image */}
            <div className="hero-profile">
              <div className="profile-image-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/profile.png" alt="Anubhav Mishra" className="profile-image" />
                <div className="profile-ring"></div>
                <div className="profile-glow"></div>
              </div>
            </div>

            <h1 className="hero-title">
              Hi, I&apos;m <span className="gradient-text">Anubhav Mishra</span>
            </h1>
            <h2 className="hero-subtitle">
              <span className="typing-text">{personal.title} — {personal.subtitle}</span>
            </h2>
            <p className="hero-description">
              {personal.tagline}
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
              <a href="/Anubhav_Mishra.pdf" download className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
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
                <p style={{ whiteSpace: 'pre-line' }}>{personal.bio}</p>
              </div>

              <div className="about-grid">
                <div className="about-card">
                  <div className="card-icon"><GraduationCap size={20} /></div>
                  <h4>Education</h4>
                  <p>B.Tech CSE — 7.63/10 CGPA</p>
                  <span className="card-detail">{personal.education.university}, Dehradun — {personal.education.status}</span>
                </div>

                <div className="about-card">
                  <div className="card-icon"><Code2 size={20} /></div>
                  <h4>Focus Areas</h4>
                  <p>Shipping production software</p>
                  <span className="card-detail">Multi-tenant SaaS, Postgres + RLS, on-prem delivery</span>
                </div>

                <div className="about-card">
                  <div className="card-icon"><Heart size={20} /></div>
                  <h4>Driven By</h4>
                  <p>Correctness at the right layer</p>
                  <span className="card-detail">Rules enforced in the database, not hidden in the UI</span>
                </div>

                <div className="about-card">
                  <div className="card-icon"><MapPin size={20} /></div>
                  <h4>Location</h4>
                  <p>{personal.location}</p>
                  <span className="card-detail">{personal.timezone} — {personal.overlap}</span>
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
              { id: 'confident', label: 'Would defend in an interview', icon: <Code size={18} /> },
              { id: 'shipped', label: 'Shipped real things with', icon: <Database size={18} /> },
              { id: 'learning', label: 'Currently learning', icon: <Zap size={18} /> },
              { id: 'all', label: 'Everything', icon: <Sparkles size={18} /> },
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
              <div
                key={skill.name}
                className="skill-card"
                style={{ ['--skill-accent' as string]: skill.accent }}
              >
                <span className="skill-mark" aria-hidden />
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
          <h2 className="section-title">Selected Work</h2>
          <p className="section-subtitle">
            Products running in production, and the engineering behind them
          </p>

          {/* Live products first — a recruiter should hit these before anything else.
              This used to be one 3-at-a-time carousel over every item, which meant
              fourteen clicks to see the whole list. */}
          <h3 className="work-group-title">Live in production</h3>
          <div className="projects-grid">
            {projectData
              .filter((p) => p.kind === 'product')
              .map((project) => (
                <div key={project.id} className="project-card featured">
                  <div className="project-content">
                    <h3 className="project-title">
                      {project.title}
                      {project.note && <span className="project-note"> · {project.note}</span>}
                    </h3>
                    <p className="project-description">{project.description}</p>
                    <div className="project-technologies">
                      {project.technologies.slice(0, 6).map((tech) => (
                        <span key={tech} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                    <div className="project-links">
                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-link"
                        >
                          <ExternalLink size={18} /> Visit
                        </a>
                      ) : (
                        <span className="project-link project-link-muted">In active development</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <h3 className="work-group-title">Selected engineering</h3>
          <div className="projects-grid">
            {projectData
              .filter((p) => p.kind === 'project')
              .map((project) => (
                <div key={project.id} className={`project-card ${project.featured ? 'featured' : ''}`}>
                  <div className="project-content">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                    <div className="project-technologies">
                      {project.technologies.slice(0, 6).map((tech) => (
                        <span key={tech} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                    <div className="project-links">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-link"
                        >
                          <Github size={18} /> Source
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
