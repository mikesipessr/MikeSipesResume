import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPost, formatPostDate } from '../lib/posts'

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPost(slug)

  useEffect(() => {
    if (post) document.title = `${post.title} — Mike Sipes`
    return () => {
      document.title = 'Mike Sipes - Principal Software Engineer | AI Systems | Healthcare Technology'
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
      </article>
    </main>
  )
}
