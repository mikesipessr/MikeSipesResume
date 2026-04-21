import { Link } from 'react-router-dom'
import { getAllPosts, formatPostDate } from '../lib/posts'

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <main className="resume-body blog-body" role="main">
      <section className="section">
        <h1 className="section-title">Blog</h1>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <ul className="blog-list">
            {posts.map((post) => (
              <li key={post.slug} className="blog-list-item">
                <Link to={`/blog/${post.slug}`} className="blog-list-link">
                  <h2>{post.title}</h2>
                  {post.date && <span className="blog-list-date">{formatPostDate(post.date)}</span>}
                  {post.description && <p>{post.description}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
