import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const postsDir = path.join(root, 'src', 'posts')

// Update SITE_URL to your canonical domain (or set the SITE_URL env var at build time).
const SITE_URL = (process.env.SITE_URL || 'https://mikesipes.me').replace(/\/$/, '')
const SITE_NAME = 'Mike Sipes'
const AUTHOR = 'Michael Sipes Sr.'
const RESUME_TITLE = 'Mike Sipes - Principal Software Engineer | AI Systems | Healthcare Technology'
const RESUME_DESCRIPTION = 'Michael (Mike) Sipes Sr. - Principal Software Engineer with 25+ years of experience architecting scalable SaaS platforms, AI-powered healthcare applications, LLM-driven architectures, and intelligent automation.'
const BLOG_TITLE = 'Blog.md — Mike Sipes'
const BLOG_DESCRIPTION = 'Writing on AI systems, LLM-driven architectures, healthcare technology, and software engineering by Mike Sipes.'
const DEFAULT_OG_IMAGE = '/Files/Sipes-Headshot.jpg'

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

function parseBool(v) {
  if (!v) return false
  return /^(true|yes|1)$/i.test(String(v).trim())
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function absoluteUrl(p) {
  if (!p) return ''
  if (/^https?:\/\//i.test(p)) return p
  return `${SITE_URL}${p.startsWith('/') ? '' : '/'}${p}`
}

async function loadPosts() {
  let files
  try {
    files = await fs.readdir(postsDir)
  } catch {
    return []
  }
  const mdFiles = files.filter((f) => f.endsWith('.md'))
  const posts = []
  for (const f of mdFiles) {
    const raw = await fs.readFile(path.join(postsDir, f), 'utf8')
    const { data } = parseFrontmatter(raw)
    const slug = data.slug || f.replace(/\.md$/, '')
    posts.push({
      slug,
      title: data.title || slug,
      date: data.date || '',
      description: data.description || '',
      cover: data.cover || '',
      coverAlt: data.coverAlt || data.cover_alt || '',
      hideTitle: parseBool(data.hideTitle ?? data.hide_title),
    })
  }
  posts.sort((a, b) => (a.date < b.date ? 1 : -1))
  return posts
}

function buildMetaTags({
  title,
  description,
  url,
  image,
  imageAlt,
  type = 'website',
  publishedTime,
  author,
}) {
  const tags = []
  tags.push(`<title>${escapeHtml(title)}</title>`)
  tags.push(`<meta name="description" content="${escapeHtml(description)}" />`)
  tags.push(`<link rel="canonical" href="${escapeHtml(url)}" />`)
  tags.push(`<meta property="og:type" content="${type}" />`)
  tags.push(`<meta property="og:title" content="${escapeHtml(title)}" />`)
  tags.push(`<meta property="og:description" content="${escapeHtml(description)}" />`)
  tags.push(`<meta property="og:url" content="${escapeHtml(url)}" />`)
  tags.push(`<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`)
  if (image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(image)}" />`)
    if (imageAlt) tags.push(`<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`)
  }
  tags.push(`<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`)
  tags.push(`<meta name="twitter:title" content="${escapeHtml(title)}" />`)
  tags.push(`<meta name="twitter:description" content="${escapeHtml(description)}" />`)
  if (image) tags.push(`<meta name="twitter:image" content="${escapeHtml(image)}" />`)
  if (publishedTime) {
    tags.push(`<meta property="article:published_time" content="${escapeHtml(publishedTime)}" />`)
  }
  if (author) tags.push(`<meta property="article:author" content="${escapeHtml(author)}" />`)
  return tags.join('\n    ')
}

function buildPostJsonLd(post, url, image) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description || post.title,
    datePublished: post.date,
    author: { '@type': 'Person', name: AUTHOR, url: SITE_URL + '/' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    publisher: { '@type': 'Person', name: AUTHOR },
  }
  if (image) ld.image = image
  return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`
}

function buildPersonJsonLd() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR,
    alternateName: 'Mike Sipes',
    url: SITE_URL + '/',
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    jobTitle: 'Principal Software Engineer',
    worksFor: { '@type': 'Organization', name: 'Invene, LLC' },
    sameAs: [
      'https://www.linkedin.com/in/mikesipessr/',
      'https://github.com/mikesipessr',
    ],
  }
  return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`
}

function injectMeta(template, metaHtml, jsonLd = '') {
  let html = template

  // Remove tags we're going to replace.
  const tagsToRemove = [
    /<title>[^<]*<\/title>/,
    /<meta\s+name="description"[^>]*\/?>/g,
    /<meta\s+property="og:[^"]*"[^>]*\/?>/g,
    /<meta\s+name="twitter:[^"]*"[^>]*\/?>/g,
    /<link\s+rel="canonical"[^>]*\/?>/g,
    /<meta\s+property="article:[^"]*"[^>]*\/?>/g,
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/g,
  ]
  for (const re of tagsToRemove) html = html.replace(re, '')

  const inject = `${metaHtml}${jsonLd ? '\n    ' + jsonLd : ''}`
  html = html.replace(/<\/head>/, `    ${inject}\n  </head>`)
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n')
  return html
}

async function writeRoute(routePath, html) {
  const outPath = routePath === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, routePath, 'index.html')
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, html, 'utf8')
}

async function main() {
  let template
  try {
    template = await fs.readFile(path.join(distDir, 'index.html'), 'utf8')
  } catch {
    console.error('dist/index.html not found — run vite build first')
    process.exit(1)
  }

  const posts = await loadPosts()

  // Resume (homepage)
  const resumeMeta = buildMetaTags({
    title: RESUME_TITLE,
    description: RESUME_DESCRIPTION,
    url: SITE_URL + '/',
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    imageAlt: 'Mike Sipes headshot',
    type: 'website',
  })
  await writeRoute('/', injectMeta(template, resumeMeta, buildPersonJsonLd()))

  // Blog index
  const blogIndexMeta = buildMetaTags({
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: SITE_URL + '/blog',
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    type: 'website',
  })
  await writeRoute('/blog', injectMeta(template, blogIndexMeta))

  // Each post
  for (const post of posts) {
    const url = `${SITE_URL}/blog/${post.slug}`
    const image = post.cover ? absoluteUrl(post.cover) : absoluteUrl(DEFAULT_OG_IMAGE)
    const meta = buildMetaTags({
      title: `${post.title} — Mike Sipes`,
      description: post.description || `${post.title} — a post by ${AUTHOR}`,
      url,
      image,
      imageAlt: post.coverAlt || post.title,
      type: 'article',
      publishedTime: post.date,
      author: AUTHOR,
    })
    const jsonLd = buildPostJsonLd(post, url, image)
    await writeRoute(`/blog/${post.slug}`, injectMeta(template, meta, jsonLd))
  }

  // sitemap.xml
  const urls = [
    { loc: '/', changefreq: 'monthly', priority: '1.0' },
    { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
    ...posts.map((p) => ({
      loc: `/blog/${p.slug}`,
      lastmod: p.date,
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map((u) => {
      const parts = [`    <loc>${escapeXml(SITE_URL + u.loc)}</loc>`]
      if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`)
      if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`)
      if (u.priority) parts.push(`    <priority>${u.priority}</priority>`)
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')}
</urlset>
`
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8')

  // robots.txt
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
  await fs.writeFile(path.join(distDir, 'robots.txt'), robots, 'utf8')

  console.log(`✓ Prerendered ${posts.length} post${posts.length === 1 ? '' : 's'} + 2 routes`)
  console.log(`✓ Wrote sitemap.xml and robots.txt`)
  console.log(`  Site URL: ${SITE_URL}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
