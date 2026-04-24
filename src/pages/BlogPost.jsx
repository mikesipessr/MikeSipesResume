import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPost, getAdjacentPosts, formatPostDate } from '../lib/posts'

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPost(slug)
  const { previous, next } = getAdjacentPosts(slug)
  const progressRef = useRef(null)

  useEffect(() => {
    if (post) document.title = `${post.title} — Mike Sipes`
    return () => {
      document.title = 'Mike Sipes - Principal Software Engineer | AI Systems | Healthcare Technology'
    }
  }, [post])

  useEffect(() => {
    if (!post) return
    const update = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (progressRef.current) {
        progressRef.current.style.setProperty('--progress', ratio.toString())
      }
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [post])

  if (!post) {
    return (
      <main className="resume-body blog-body" role="main">
        <section className="section">
          <h1 className="section-title">Post not found</h1>
          <p>
            <Link to="/blog">← Back to blog</Link>
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="resume-body blog-body" role="main">
      <div ref={progressRef} className="blog-progress" aria-hidden="true" />
      <article className="section blog-post">
        <Link to="/blog" className="blog-back-link">← Back to blog</Link>
        {post.cover && (
          <figure className="blog-post-cover">
            <img src={post.cover} alt={post.coverAlt || post.title} loading="eager" />
          </figure>
        )}
        <h1 className={`blog-post-title ${post.hideTitle ? 'sr-only' : ''}`}>{post.title}</h1>
        {post.date && <p className="blog-post-date">{formatPostDate(post.date)}</p>}
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        {(previous || next) && (
          <nav className="blog-post-nav" aria-label="Blog post navigation">
            {previous ? (
              <Link to={`/blog/${previous.slug}`} className="blog-post-nav-link blog-post-nav-prev">
                <span className="blog-post-nav-label">← Previous</span>
                <span className="blog-post-nav-title">{previous.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link to={`/blog/${next.slug}`} className="blog-post-nav-link blog-post-nav-next">
                <span className="blog-post-nav-label">Next →</span>
                <span className="blog-post-nav-title">{next.title}</span>
              </Link>
            ) : <span />}
          </nav>
        )}
      </article>
    </main>
  )
}
