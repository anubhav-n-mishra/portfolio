import { GoogleGenerativeAI } from '@google/generative-ai';
import { portfolioData } from '@/data/portfolio';

// Context for the AI about Anubhav
const portfolioContext = `
You are an AI assistant embedded in Anubhav Mishra's portfolio website. Your role is to help visitors learn about Anubhav.

Here's information about Anubhav:

PERSONAL INFO:
- Name: Anubhav Mishra
- Title: ${portfolioData.personal.title}
- Education: ${portfolioData.personal.education.degree} at ${portfolioData.personal.education.university} (${portfolioData.personal.education.status})
- Bio: ${portfolioData.personal.bio}

WHAT DRIVES HIM:
${portfolioData.personal.whatDrivesMe.join('\n')}

CURRENTLY EXPLORING:
${portfolioData.personal.currentlyExploring.join(', ')}

SKILLS:
- Languages: ${portfolioData.skills.languages.map(s => s.name).join(', ')}
- Frameworks: ${portfolioData.skills.frameworks.map(s => s.name).join(', ')}
- Databases: ${portfolioData.skills.databases.map(s => s.name).join(', ')}
- Tools: ${portfolioData.skills.tools.map(s => s.name).join(', ')}
- Other: ${portfolioData.skills.other.join(', ')}

FEATURED PROJECTS:
${portfolioData.projects.filter(p => p.featured).map(p => 
  `- ${p.name}: ${p.description} (Tech: ${p.tech.join(', ')})`
).join('\n')}

GITHUB STATS:
- ${portfolioData.github.contributions} contributions in the last year
- ${portfolioData.github.repositories} repositories
- Achievements: ${portfolioData.achievements.map(a => a.name).join(', ')}

CONTACT:
- Email: ${portfolioData.contact.email}
- GitHub: ${portfolioData.contact.github}
- LinkedIn: ${portfolioData.contact.linkedin}
- Twitter: ${portfolioData.contact.twitter}

Be helpful, friendly, and provide accurate information about Anubhav. If asked about something not in this context, politely redirect to what you know about Anubhav's portfolio.
`;

export async function getGeminiResponse(
  prompt: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    return "Please set your Gemini API key in the settings to use the AI assistant.";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: portfolioContext }],
        },
        {
          role: 'model',
          parts: [{ text: "I understand. I'm now an AI assistant for Anubhav Mishra's portfolio. I'll help visitors learn about his skills, projects, and experience. How can I help you today?" }],
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return "Sorry, I encountered an error. Please check your API key or try again later.";
  }
}

// Fallback responses when API key is not available
export function getFallbackResponse(prompt: string): string {
  const lowercasePrompt = prompt.toLowerCase();

  if (lowercasePrompt.includes('skill') || lowercasePrompt.includes('technology')) {
    return `Anubhav is skilled in:

**Languages:** ${portfolioData.skills.languages.map(s => s.name).join(', ')}

**Frameworks:** ${portfolioData.skills.frameworks.map(s => s.name).join(', ')}

**Databases:** ${portfolioData.skills.databases.map(s => s.name).join(', ')}

**Tools:** ${portfolioData.skills.tools.map(s => s.name).join(', ')}

His strongest areas include Systems Programming (OS, Compilers) and Full-Stack Development.`;
  }

  if (lowercasePrompt.includes('project') || lowercasePrompt.includes('work')) {
    const featured = portfolioData.projects.filter(p => p.featured);
    return `Here are Anubhav's featured projects:

${featured.map(p => `**${p.icon} ${p.name}**
${p.description}
Tech: ${p.tech.join(', ')}`).join('\n\n')}

He has ${portfolioData.github.repositories} repositories on GitHub!`;
  }

  if (lowercasePrompt.includes('argon') || lowercasePrompt.includes('os') || lowercasePrompt.includes('operating system')) {
    const argon = portfolioData.projects.find(p => p.name === 'ARGON OS');
    return `**ARGON OS** is one of Anubhav's most impressive projects!

${argon?.longDescription || argon?.description}

It demonstrates his deep understanding of low-level systems programming, including bootloader development, memory management, and process scheduling.`;
  }

  if (lowercasePrompt.includes('gran') || lowercasePrompt.includes('compiler') || lowercasePrompt.includes('language')) {
    const gran = portfolioData.projects.find(p => p.name === 'GRAN Compiler');
    return `**GRAN** is Anubhav's custom programming language!

${gran?.longDescription || gran?.description}

This project showcases his expertise in compiler design and language implementation.`;
  }

  if (lowercasePrompt.includes('contact') || lowercasePrompt.includes('reach') || lowercasePrompt.includes('email')) {
    return `You can reach Anubhav through:

📧 **Email:** ${portfolioData.contact.email}
💻 **GitHub:** github.com/anubhav-n-mishra
💼 **LinkedIn:** linkedin.com/in/anubhav-mishra0
🐦 **Twitter:** @anubhav_writes

He's currently available for internships and full-time opportunities starting 2025!`;
  }

  if (lowercasePrompt.includes('about') || lowercasePrompt.includes('who')) {
    return `**Anubhav Mishra** is a Final-Year B.Tech CSE student at Graphic Era Hill University.

${portfolioData.personal.tagline}

He's passionate about:
${portfolioData.personal.whatDrivesMe.join('\n')}

He's built impressive projects including an operating system (ARGON OS), a programming language (GRAN), and a streaming platform (CineWave).`;
  }

  if (lowercasePrompt.includes('education') || lowercasePrompt.includes('study') || lowercasePrompt.includes('university')) {
    return `Anubhav is pursuing his **${portfolioData.personal.education.degree}** at **${portfolioData.personal.education.university}**.

Status: ${portfolioData.personal.education.status}
Expected Graduation: 2025

His academic focus includes Systems Programming, Compiler Design, and Full-Stack Development.`;
  }

  // Default response
  return `Hi! I can tell you about Anubhav Mishra's:

• **Skills** - Programming languages, frameworks, tools
• **Projects** - ARGON OS, GRAN Compiler, CineWave, and more
• **Education** - B.Tech CSE at Graphic Era Hill University
• **Contact** - Email, GitHub, LinkedIn, Twitter

What would you like to know?`;
}
