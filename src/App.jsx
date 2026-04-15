import { useState, useEffect, useRef } from 'react'
import './App.css'

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
  </svg>
)

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
  </svg>
)

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
  </svg>
)

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433a19.695 19.695 0 002.683-2.006c1.9-1.7 3.945-4.293 3.945-7.843a7.5 7.5 0 00-15 0c0 3.55 2.045 6.143 3.945 7.843a19.695 19.695 0 002.683 2.006 12.23 12.23 0 00.757.433l.281.14.018.008.006.003zM10 11.25a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5z" clipRule="evenodd" />
  </svg>
)

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M4.477 3A1.477 1.477 0 113 4.477 1.477 1.477 0 014.477 3zM3.12 6.5h2.714v8.733H3.12V6.5zm4.853 0h2.6v1.193h.038c.362-.686 1.247-1.41 2.567-1.41 2.745 0 3.252 1.806 3.252 4.155v4.795h-2.712V10.88c0-1.026-.018-2.347-1.43-2.347-1.432 0-1.651 1.12-1.651 2.274v4.426H7.973V6.5z" />
  </svg>
)

const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 1.667a8.333 8.333 0 00-2.634 16.24c.417.076.569-.18.569-.401 0-.198-.007-.722-.011-1.418-2.314.503-2.802-1.115-2.802-1.115-.378-.962-.924-1.218-.924-1.218-.755-.516.057-.506.057-.506.835.059 1.275.858 1.275.858.742 1.272 1.947.904 2.421.691.076-.538.29-.905.528-1.113-1.848-.21-3.791-.924-3.791-4.114 0-.909.325-1.652.858-2.234-.086-.21-.372-1.057.082-2.203 0 0 .699-.224 2.29.853a7.978 7.978 0 012.086-.281c.708.003 1.421.096 2.086.281 1.59-1.077 2.288-.853 2.288-.853.455 1.146.169 1.993.083 2.203.534.582.857 1.325.857 2.234 0 3.198-1.946 3.901-3.8 4.107.299.258.565.766.565 1.544 0 1.115-.01 2.014-.01 2.288 0 .223.15.482.573.4A8.336 8.336 0 0010 1.667z" clipRule="evenodd" />
  </svg>
)

const ArrowUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M9.47 6.47a.75.75 0 011.06 0l4.25 4.25a.75.75 0 11-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 01-1.06-1.06l4.25-4.25z" clipRule="evenodd" />
  </svg>
)

const sections = [
  { id: 'summary', label: 'Summary' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'innovation', label: 'Innovation' },
  { id: 'strengths', label: 'Strengths' },
]

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
    date: 'July 2023 \u2013 Present',
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
      'Led development of a computer vision + LiDAR prototype for automated eyeglass prescription generation (Hello Eyes) \u2014 named contributor on patent-pending optical measurement technology',
      'Mentored engineers and set architectural direction across multiple projects',
      'Owned technical hiring and evaluation for engineering roles, defining interview standards and conducting coding assessments',
    ],
  },
  {
    title: 'Lead Software Engineer',
    company: 'Fusion Media / Reachya / Close the Gap',
    date: 'Feb 2014 \u2013 June 2023',
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
    date: 'Jan 2012 \u2013 Feb 2014',
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
    date: 'June 2006 \u2013 Jan 2012',
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
    date: '1997 \u2013 2006',
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

function StickyNav() {
  const [active, setActive] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300)

      const offsets = sections.map(({ id }) => {
        const el = document.getElementById(id)
        if (!el) return { id, top: Infinity }
        return { id, top: el.getBoundingClientRect().top }
      })
      const current = offsets.reduce((closest, item) =>
        item.top <= 120 && item.top > closest.top ? item : closest,
        { id: '', top: -Infinity }
      )
      setActive(current.id)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`sticky-nav ${visible ? 'sticky-nav--visible' : ''}`} role="navigation" aria-label="Section navigation">
      <div className="sticky-nav-inner">
        <span className="sticky-nav-name">Mike Sipes</span>
        <div className="sticky-nav-links">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`sticky-nav-link ${active === id ? 'sticky-nav-link--active' : ''}`}
            >
              {label}
            </a>
          ))}
        </div>
        <a href="/Files/Mike Sipes Resume.pdf" download className="btn btn-primary btn-sm sticky-nav-download">
          <DownloadIcon />
          <span className="btn-sm-label">Resume</span>
        </a>
      </div>
    </nav>
  )
}

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      className={`back-to-top ${visible ? 'back-to-top--visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <ArrowUpIcon />
    </button>
  )
}

function App() {
  const mainRef = useScrollReveal()

  return (
    <>
      <a href="#summary" className="skip-link">Skip to main content</a>
      <StickyNav />

      <header className="hero" role="banner">
        <div className="hero-inner">
          <div className="headshot-wrapper">
            <picture>
              <source srcSet="/Files/Mike Sipes Headshot.webp" type="image/webp" />
              <img
                src="/Files/Mike Sipes Headshot-400.png"
                alt="Mike Sipes headshot"
                className="headshot"
                width="160"
                height="160"
                loading="eager"
              />
            </picture>
          </div>
          <div className="hero-text">
            <h1>Michael (Mike) Sipes Sr.</h1>
            <p className="subtitle">Principal Software Engineer</p>
            <p className="tagline">AI Systems | Healthcare Technology</p>
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
              <li key={i}>{strength}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer" role="contentinfo">
        <div className="footer-inner">
          <p>
            <a href="mailto:mike@sipes.com">mike@sipes.com</a>
            {' \u00b7 '}
            <a href="tel:760-532-2362">760-532-2362</a>
            {' \u00b7 '}
            <a href="https://www.linkedin.com/in/mikesipessr/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            {' \u00b7 '}
            <a href="https://github.com/mikesipessr" target="_blank" rel="noopener noreferrer">GitHub</a>
            {' \u00b7 Winchester, CA'}
          </p>
        </div>
      </footer>

      <BackToTop />
    </>
  )
}

export default App
