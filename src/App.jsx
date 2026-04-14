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
  { id: 'strengths', label: 'Strengths' },
]

const skills = [
  {
    category: 'Languages & Frameworks',
    items: ['C#', '.NET / .NET Core', 'ASP.NET MVC', 'Web API', 'Entity Framework', 'EF Core', 'LINQ', 'Blazor', '.NET MAUI'],
  },
  {
    category: 'Frontend & Mobile',
    items: ['React', 'Angular', 'JavaScript', 'jQuery', 'HTML5', 'CSS3', 'Bootstrap', 'Swift (iOS)', 'MAUI'],
  },
  {
    category: 'Cloud & DevOps',
    items: ['Microsoft Azure', 'Azure Functions', 'Service Bus', 'WebJobs', 'Blob Storage', 'CI/CD', 'Git', 'TFS'],
  },
  {
    category: 'Data & APIs',
    items: ['SQL Server', 'T-SQL', 'RESTful APIs', 'Distributed Systems'],
  },
]

const experience = [
  {
    title: 'Lead Software Engineer',
    company: 'Invene, LLC',
    date: 'July 2023 \u2013 Present',
    industries: ['Healthcare', 'AI'],
    bullets: [
      'Architected enterprise AI agent platform for OnPoint Healthcare Partners, leveraging OpenAI to automate clinical workflows',
      'Designed and implemented AI-driven processes for lab result interpretation and summarization, pre-visit clinical summaries, and automated order generation (labs, prescriptions, medication refills, referrals)',
      'Built a modular AI orchestration system (MCP-style architecture) enabling coordinated agent workflows, structured outputs, and task chaining',
      'Developed LLM-driven workflows using OpenAI and Claude APIs, including prompt engineering, validation, and domain-specific reasoning for healthcare',
      'Designed backend services and APIs for healthcare data ingestion, normalization, and integration with AI pipelines',
      'Developed cross-platform applications using .NET MAUI and Blazor, enabling shared codebases across web and mobile platforms',
      'Contributed to frontend development using Angular, supporting production systems',
    ],
  },
  {
    title: 'Lead Software Engineer',
    company: 'Fusion Media / Reachya / Close the Gap',
    date: 'Feb 2014 \u2013 June 2023',
    industries: ['SaaS', 'Messaging', 'Ecommerce'],
    bullets: [
      'Led architecture and delivery of enterprise-scale web applications for clients including Intel, PriceSmart, Sports Authority, and Long Beach Transit Authority',
      'Architected and built Reachya, a multi-tenant SaaS messaging platform leveraging Azure (Functions, Service Bus, Blob Storage)',
      'Designed and optimized systems for high-throughput, real-time messaging (SMS/MMS) with external integrations (Twilio)',
      'Modernized legacy systems into scalable ASP.NET Core applications, improving performance, reliability, and maintainability',
      'Directed a cross-functional team of developers and designers, establishing technical direction, coding standards, and delivery processes',
      'Partnered with stakeholders to align technical solutions with business goals, scalability requirements, and user experience improvements',
      'Delivered ecommerce platforms supporting multi-country operations, complex business rules, and high transaction volumes',
    ],
  },
  {
    title: 'Lead Software Engineer',
    company: 'EOS International (SirsiDynix)',
    date: 'Jan 2012 \u2013 Feb 2014',
    industries: ['Library Automation', 'SaaS'],
    bullets: [
      'Led strategic transition from legacy desktop applications to web-based SaaS platform architecture',
      'Designed and implemented scalable ASP.NET solutions for library automation systems serving global clients',
      'Improved system performance and usability, directly contributing to successful acquisition by SirsiDynix',
      'Mentored engineers',
    ],
  },
  {
    title: 'Development Manager / Team Lead',
    company: 'Fat Cat, Inc. (NewHomesDirectory.com)',
    date: 'June 2006 \u2013 Jan 2012',
    industries: ['Real Estate', 'PropTech'],
    bullets: [
      'Re-architected and scaled a legacy platform into a cloud-based enterprise system (AWS) supporting North American operations',
      'Enabled significant business growth by delivering a platform capable of supporting increased traffic, users, and operational complexity',
      'Led engineering team and contributed to technical strategy, hiring, and long-term platform direction',
      'Designed systems supporting search, content management, and high-availability web experiences',
    ],
  },
  {
    title: 'Lead Software Engineer',
    company: 'EOS International',
    date: 'Oct 2001 \u2013 June 2006',
    industries: ['Library Automation'],
    bullets: [
      'Led re-architecture of underperforming PHP application into a high-performance ASP.NET platform',
      'Reduced query execution times from minutes to milliseconds through database and application optimization',
      'Played a key role in transitioning the company to modern web technologies',
    ],
  },
  {
    title: 'Co-Founder / Development Manager',
    company: 'Physician.com',
    date: 'Aug 1999 \u2013 Oct 2001',
    industries: ['Healthcare'],
    bullets: [
      'Co-founded and led development of a web platform delivering tools and communication services for physicians',
      'Owned full product lifecycle including architecture, development, deployment, and operations',
      'Built and led a cross-functional team supporting rapid product growth',
    ],
  },
  {
    title: 'Software Engineer',
    company: 'Early Career',
    date: '1997 \u2013 1999',
    industries: [],
    bullets: [
      'Developed web and database-driven applications using early Microsoft web technologies',
      'Built foundational expertise in application architecture, database design, and full lifecycle development',
    ],
  },
]

const strengths = [
  'Deep expertise in healthcare software, clinical workflows, and AI-driven decision systems',
  'Strong experience in startup and high-growth environments, including product ideation and delivery',
  'Proven ability to operate at both hands-on engineering and strategic leadership levels',
  'Effective at translating complex technical concepts into business-aligned solutions',
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
            <p className="subtitle">Lead Software Engineer</p>
            <p className="tagline">Engineering Leadership | Technical Strategy | Team Building</p>
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
            <div className="stat-value">7</div>
            <div className="stat-label">Companies</div>
          </div>
          <div className="stat">
            <div className="stat-value">AI / LLM</div>
            <div className="stat-label">Current Focus</div>
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
              Lead Software Engineer with 25+ years of experience architecting and delivering
              scalable, cloud-native applications, specializing in healthcare technology, AI-driven
              systems, and enterprise SaaS platforms.
            </p>
            <p>
              Deep expertise in .NET (C#), Azure, distributed systems, and RESTful APIs, with recent
              focus on AI/LLM-enabled products, clinical data pipelines, and intelligent automation.
              Proven track record of leading engineering initiatives, modernizing legacy platforms, and
              driving technical strategy aligned with business outcomes.
            </p>
          </div>
        </section>

        <section className="section reveal" id="skills" aria-labelledby="skills-title">
          <h2 className="section-title" id="skills-title">Core Skills</h2>
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
