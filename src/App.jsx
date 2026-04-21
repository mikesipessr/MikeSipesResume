import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import './App.css'
import Resume from './pages/Resume'
import BlogIndex from './pages/BlogIndex'
import BlogPost from './pages/BlogPost'
import { DownloadIcon, ArrowUpIcon } from './components/Icons'

const sections = [
  { id: 'summary', label: 'Summary' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'innovation', label: 'Innovation' },
  { id: 'strengths', label: 'Strengths' },
]

function StickyNav() {
  const [active, setActive] = useState('')
  const [visible, setVisible] = useState(false)
  const location = useLocation()
  const onResume = location.pathname === '/'

  useEffect(() => {
    if (!onResume) {
      setVisible(true)
      return
    }

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

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onResume])

  return (
    <nav className={`sticky-nav ${visible ? 'sticky-nav--visible' : ''}`} role="navigation" aria-label="Section navigation">
      <div className="sticky-nav-inner">
        <Link to="/" className="sticky-nav-name">Mike Sipes</Link>
        <div className="sticky-nav-links">
          {onResume ? (
            <>
              {sections.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`sticky-nav-link ${active === id ? 'sticky-nav-link--active' : ''}`}
                >
                  {label}
                </a>
              ))}
              <NavLink to="/blog" className="sticky-nav-link">Blog</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className="sticky-nav-link">Resume</NavLink>
              <NavLink to="/blog" className={({ isActive }) => `sticky-nav-link ${isActive ? 'sticky-nav-link--active' : ''}`}>Blog</NavLink>
            </>
          )}
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

function ScrollToTopOnNav() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <p>
          <a href="mailto:mike@sipes.com">mike@sipes.com</a>
          {' · '}
          <a href="tel:760-532-2362">760-532-2362</a>
          {' · '}
          <a href="https://www.linkedin.com/in/mikesipessr/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          {' · '}
          <a href="https://github.com/mikesipessr" target="_blank" rel="noopener noreferrer">GitHub</a>
          {' · Winchester, CA'}
        </p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTopOnNav />
      <a href="#main" className="skip-link">Skip to main content</a>
      <StickyNav />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Resume />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </div>
      <Footer />
      <BackToTop />
    </BrowserRouter>
  )
}
