import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  DownloadIcon,
  MailIcon,
  PhoneIcon,
  LocationIcon,
  LinkedInIcon,
  GitHubIcon,
  BlogIcon,
} from '../components/Icons'

const skills = [
  {
    category: 'AI / LLM Systems',
    items: ['LLM Integrations (OpenAI, Claude)', 'Prompt Engineering', 'Structured Outputs', 'RAG Pipelines', 'Semantic Search', 'AI Agent Orchestration', 'Workflow Automation', 'Task Chaining', 'Evaluation Frameworks', 'Guardrails', 'Hallucination Mitigation', 'Clinical AI Systems'],
  },
  {
    category: 'Architecture & Platforms',
    items: ['Distributed Systems', 'Microservices', 'Event-Driven Architecture', 'Multi-Tenant SaaS', 'High-Scale System Design', 'API-First Architecture', 'System Integration', 'Data Pipelines'],
  },
  {
    category: 'Cloud & Engineering',
    items: ['Microsoft Azure', 'Azure Functions', 'Service Bus', 'WebJobs', 'Blob Storage', 'CI/CD', 'DevOps', '.NET / .NET Core', 'ASP.NET', 'REST APIs'],
  },
  {
    category: 'Frontend & Cross-Platform',
    items: ['Angular', 'React', 'Blazor', '.NET MAUI', 'Swift (iOS)', 'Device Integrations (LiDAR)'],
  },
  {
    category: 'Data',
    items: ['SQL Server', 'T-SQL', 'Data Modeling', 'Transformation Pipelines', 'API Integrations'],
  },
]

const experience = [
  {
    title: 'Lead Software Engineer',
    company: 'Invene, LLC',
    date: 'July 2023 – Present',
    industries: ['Healthcare', 'AI'],
    bullets: [
      'Led architecture and development of an AI-powered clinical automation platform, leveraging LLMs, structured data pipelines, and agent-based orchestration to streamline healthcare workflows and decision-making',
      'Architected an enterprise AI agent platform enabling automated clinical workflows including lab interpretation, pre-visit summaries, and order generation',
      'Designed modular AI orchestration framework (agent-based / MCP-style) supporting structured outputs, task chaining, and multi-step reasoning',
      'Built production-grade LLM workflows using OpenAI and Claude APIs with domain-specific prompt engineering and validation layers',
      'Developed RAG-based clinical data pipelines for ingestion, normalization, and AI-driven insights',
      'Implemented AI guardrails and evaluation frameworks to improve reliability, reduce hallucinations, and enforce structured outputs in clinical contexts',
      'Delivered cross-platform applications using .NET MAUI and Blazor, enabling shared web/mobile codebases',
      'Contributed to Angular-based frontends for modern healthcare applications',
      'Built native iOS components using Swift, integrating LiDAR for advanced device capabilities',
      'Led development of a computer vision + LiDAR prototype for automated eyeglass prescription generation (Hello Eyes) — named contributor on patent-pending optical measurement technology',
      'Mentored engineers and set architectural direction across multiple projects',
      'Owned technical hiring and evaluation for engineering roles, defining interview standards and conducting coding assessments',
    ],
  },
  {
    title: 'Lead Software Engineer',
    company: 'Fusion Media / Reachya / Close the Gap',
    date: 'Feb 2014 – June 2023',
    industries: ['SaaS', 'Messaging', 'Ecommerce'],
    bullets: [
      'Led architecture and delivery of enterprise-scale SaaS platforms and high-throughput messaging systems for major clients including Intel and PriceSmart',
      'Architected and built Reachya, a multi-tenant messaging platform on Azure supporting real-time SMS/MMS at scale',
      'Designed event-driven, high-throughput systems using Azure Service Bus and distributed processing patterns',
      'Modernized legacy platforms into scalable ASP.NET Core applications, significantly improving performance and maintainability',
      'Directed cross-functional engineering teams, establishing architecture standards and delivery processes',
    ],
  },
  {
    title: 'Lead Software Engineer',
    company: 'EOS International (SirsiDynix)',
    date: 'Jan 2012 – Feb 2014',
    industries: ['Library Automation', 'SaaS'],
    bullets: [
      'Led transition from legacy desktop systems to web-based SaaS architecture',
      'Delivered scalable ASP.NET solutions for global library systems',
      'Contributed to product improvements supporting successful acquisition',
    ],
  },
  {
    title: 'Development Manager / Team Lead',
    company: 'Fat Cat, Inc. (NewHomesDirectory.com)',
    date: 'June 2006 – Jan 2012',
    industries: ['Real Estate', 'PropTech'],
    bullets: [
      'Re-architected legacy platform into a scalable cloud-based system (AWS)',
      'Enabled significant business growth through improved scalability and performance',
      'Led engineering team and technical strategy',
    ],
  },
  {
    title: 'Lead Software Engineer | Co-Founder | Software Engineer',
    company: 'Earlier Experience',
    date: '1997 – 2006',
    industries: ['Healthcare'],
    bullets: [
      'Co-founded Physician.com, building a web platform for physician communication and tools',
      'Led full lifecycle development across multiple platforms and technologies',
      'Established strong foundation in scalable web architecture and data systems',
    ],
  },
]

const innovations = [
  {
    title: 'AI Clinical Automation Platform',
    description: 'LLM-driven system for healthcare workflow automation and decision support',
  },
  {
    title: 'RAG-Based Clinical Data System',
    description: 'Retrieval-driven architecture for structured medical insights',
  },
  {
    title: 'LiDAR Computer Vision System',
    description: 'Prototype for optical measurement and prescription generation (patent-pending)',
  },
]

const strengths = [
  'Deep expertise in healthcare systems, clinical workflows, and regulated environments',
  'Strong background in startup and high-growth environments',
  'Ability to operate across architecture, execution, and technical leadership',
  'Skilled at translating complex technical systems into business value',
]

function useScrollReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const elements = node.querySelectorAll('.reveal')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return ref
}

export default function Resume() {
  const mainRef = useScrollReveal()

  return (
    <>
      <header className="hero" role="banner">
        <div className="hero-inner">
          <div className="headshot-wrapper">
            <div className="headshot-frame">
              <picture>
                <source srcSet="/Files/Sipes-Headshot.avif" type="image/avif" />
                <source srcSet="/Files/Sipes-Headshot.webp" type="image/webp" />
                <img
                  src="/Files/Sipes-Headshot.jpg"
                  alt="Mike Sipes headshot"
                  className="headshot"
                  width="220"
                  height="280"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
            </div>
          </div>
          <div className="hero-text">
            <h1>Michael (Mike) Sipes Sr.</h1>
            <p className="subtitle">Principal Software Engineer</p>
            <p className="tagline">AI Systems | Healthcare Technology</p>
            <p className="hero-status" aria-label="Current status">
              <span className="hero-status-dot" aria-hidden="true" />
              Currently: Lead Engineer @ Invene, LLC
            </p>
            <div className="contact-row" role="list" aria-label="Contact information">
              <span className="contact-item" role="listitem">
                <LocationIcon />
                Winchester, CA
              </span>
              <span className="contact-item" role="listitem">
                <PhoneIcon />
                <a href="tel:760-532-2362">760-532-2362</a>
              </span>
              <span className="contact-item" role="listitem">
                <MailIcon />
                <a href="mailto:mike@sipes.com">mike@sipes.com</a>
              </span>
              <span className="contact-item" role="listitem">
                <LinkedInIcon />
                <a href="https://www.linkedin.com/in/mikesipessr/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </span>
              <span className="contact-item" role="listitem">
                <GitHubIcon />
                <a href="https://github.com/mikesipessr" target="_blank" rel="noopener noreferrer">GitHub</a>
              </span>
            </div>
            <div className="hero-actions">
              <a href="/Files/Mike Sipes Resume.pdf" download className="btn btn-primary" aria-label="Download resume as PDF">
                <DownloadIcon />
                Download Resume
              </a>
              <a href="mailto:mike@sipes.com" className="btn btn-secondary" aria-label="Send email to Mike Sipes">
                <MailIcon />
                Contact Me
              </a>
              <Link to="/blog" className="btn btn-secondary" aria-label="Read the blog.md">
                <BlogIcon />
                Blog.md
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="stats-bar" aria-label="Career highlights">
        <div className="stats-inner">
          <div className="stat">
            <div className="stat-value">25+</div>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat">
            <div className="stat-value">AI/ML</div>
            <div className="stat-label">Specialization</div>
          </div>
          <div className="stat">
            <div className="stat-value">Healthcare</div>
            <div className="stat-label">Domain Focus</div>
          </div>
          <a href="#experience" className="stat stat-link">
            <div className="stat-value">5+</div>
            <div className="stat-label">Industries</div>
          </a>
        </div>
      </div>

      <main className="resume-body" role="main" ref={mainRef}>
        <section className="section reveal" id="summary" aria-labelledby="summary-title">
          <h2 className="section-title" id="summary-title">Professional Summary</h2>
          <div className="summary">
            <p>
              Principal-level engineer with 25+ years of experience architecting scalable SaaS platforms
              and distributed systems, with deep specialization in AI-powered healthcare applications,
              LLM-driven architectures, and intelligent automation.
            </p>
            <p>
              Expert in designing and delivering production-grade AI systems, including agent-based
              workflows, RAG pipelines, and clinical decision-support tools that improve operational
              efficiency and enable data-driven outcomes.
            </p>
            <p>
              Proven leader in modernizing legacy systems, defining technical strategy, and delivering
              high-impact solutions across startups and enterprise environments. Equally effective as a
              hands-on architect and technical leader driving execution.
            </p>
          </div>
        </section>

        <section className="section reveal" id="skills" aria-labelledby="skills-title">
          <h2 className="section-title" id="skills-title">Core Expertise</h2>
          <div className="skills-grid">
            {skills.map((group) => (
              <div key={group.category} className="skill-category">
                <h3>{group.category}</h3>
                <div className="skill-tags" role="list" aria-label={`${group.category} skills`}>
                  {group.items.map((item) => (
                    <span key={item} className="skill-tag" role="listitem">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="experience" aria-labelledby="experience-title">
          <h2 className="section-title reveal" id="experience-title">Experience</h2>
          {experience.map((job, i) => (
            <article key={i} className="experience-item reveal">
              <div className="experience-header">
                <h3>
                  {job.title}
                  {job.industries.length > 0 && (
                    <span className="industry-tags">
                      {job.industries.map((ind) => (
                        <span key={ind} className="industry-tag">{ind}</span>
                      ))}
                    </span>
                  )}
                </h3>
                <span className="experience-date">{job.date}</span>
              </div>
              <p className="experience-company">{job.company}</p>
              <ul className="experience-bullets">
                {job.bullets.map((bullet, j) => (
                  <li key={j}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="section reveal" id="innovation" aria-labelledby="innovation-title">
          <h2 className="section-title" id="innovation-title">Selected AI & Innovation Work</h2>
          <div className="innovation-grid">
            {innovations.map((item, i) => (
              <div key={i} className="innovation-item">
                <span className="card-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section reveal" id="strengths" aria-labelledby="strengths-title">
          <h2 className="section-title" id="strengths-title">Additional Strengths</h2>
          <ul className="strengths-list">
            {strengths.map((strength, i) => (
              <li key={i}>
                <span className="card-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="strength-text">{strength}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
