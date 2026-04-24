import { marked } from 'marked'

const modules = import.meta.glob('../posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!m) continue
    let value = m[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    data[m[1]] = value
  }
  return { data, content: match[2] }
}

function parseBool(value) {
  if (value === undefined || value === '') return false
  return /^(true|yes|1)$/i.test(String(value).trim())
}

function slugFromPath(path) {
  return path.replace(/^.*\//, '').replace(/\.md$/, '')
}

const posts = Object.entries(modules)
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw)
    const slug = data.slug || slugFromPath(path)
    return {
      slug,
      title: data.title || slug,
      date: data.date || '',
      description: data.description || '',
      cover: data.cover || '',
      coverAlt: data.coverAlt || data.cover_alt || '',
      hideTitle: parseBool(data.hideTitle ?? data.hide_title),
      content,
    }
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export function formatPostDate(value) {
  if (!value) return ''
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return value
  const [, year, month, day] = m
  const d = new Date(Number(year), Number(month) - 1, Number(day))
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function getAllPosts() {
  return posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    description: p.description,
    cover: p.cover,
    coverAlt: p.coverAlt,
    hideTitle: p.hideTitle,
  }))
}

export function getPost(slug) {
  const post = posts.find((p) => p.slug === slug)
  if (!post) return null
  return { ...post, html: marked.parse(post.content) }
}

export function getAdjacentPosts(slug) {
  const index = posts.findIndex((p) => p.slug === slug)
  if (index === -1) return { previous: null, next: null }
  const meta = (p) => ({ slug: p.slug, title: p.title, date: p.date })
  return {
    previous: index < posts.length - 1 ? meta(posts[index + 1]) : null,
    next: index > 0 ? meta(posts[index - 1]) : null,
  }
}
