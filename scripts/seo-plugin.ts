// A small Vite plugin that makes the site easy for search engines and link previews to read.
//
// The site is one React app: without this, every address (/blog, /projects/cinetwork…) would get
// the same index.html, with the home page's title and description. Google can run the JavaScript
// and see the right ones, but slowly, and LinkedIn, WhatsApp and X never do.
//
// So, when the site is built (npm run build), this:
//   - puts the right <title>, description, canonical link, preview tags and structured data
//     (JSON-LD, which tells Google who you are and what each page is) in the home page
//   - writes a copy of index.html for every other page with ITS tags:
//       dist/blog.html, dist/blog/<slug>.html, dist/projects/<slug>.html
//     (and dist/projects/<slug>/index.html: see "Project pages" below)
//   - writes dist/404.html (not indexed) and dist/sitemap.xml (the list of pages for Google)
// The page content is still drawn by React: only the <head> differs.
//
// The web server has to serve those files: see "nginx" in README.md.
// While developing (npm run dev), only the home page's tags are added.

import type { Plugin } from 'vite'
import { contacts } from '../src/data/contact.ts'
import { profile } from '../src/data/profile.ts'
import { projects } from '../src/data/projects.ts'
import { updates } from '../src/data/updates.ts'
import {
  BLOG_DESCRIPTION,
  DEFAULT_IMAGE,
  HOME_DESCRIPTION,
  SITE_URL,
  absoluteUrl,
  pageTitle,
  postDescription,
  projectDescription,
  shareImage,
} from '../src/data/seo.ts'

interface Page {
  path: string // the address, e.g. '/blog/my-post'
  title: string
  description: string
  image?: string // a photo in /public; the default preview image if left out
  imageAlt?: string
  type?: 'website' | 'article'
  published?: string // posts: 'YYYY-MM-DD'
  noindex?: boolean // keep this page out of Google (the 404 page)
  jsonLd?: object[] // structured data
}

// The tags go between these two comments in index.html, so they can be swapped for each page.
const START = '<!-- seo:start -->'
const END = '<!-- seo:end -->'

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// --- Structured data (https://schema.org): who you are, what Axihex is, what each page is ---

const PERSON_ID = `${SITE_URL}/#person`
const BRAND_ID = `${SITE_URL}/#brand`
const WEBSITE_ID = `${SITE_URL}/#website`
const [city, country] = profile.location.split(', ')
// Your profiles elsewhere (LinkedIn, GitHub): tells Google they're all the same person.
const sameAs = contacts.filter((contact) => contact.icon === 'linkedin' || contact.icon === 'github').map((c) => c.href)

const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: profile.name,
  url: absoluteUrl('/'),
  image: absoluteUrl(profile.photo),
  jobTitle: 'Software Engineer',
  description: HOME_DESCRIPTION,
  address: { '@type': 'PostalAddress', addressLocality: city, addressCountry: country },
  knowsAbout: ['Backend development', 'APIs', 'Databases', 'Mobile apps', 'React Native', 'LLMs', 'RAG', 'Web development', 'AWS'],
  sameAs,
}

const brand = {
  '@type': 'Organization',
  '@id': BRAND_ID,
  name: profile.brand,
  url: absoluteUrl('/'),
  logo: absoluteUrl('/favicon-192.png'),
  founder: { '@id': PERSON_ID },
  description: `${profile.brand} is the software engineering identity of ${profile.name}: dependable applications, platforms and software products.`,
}

const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: absoluteUrl('/'),
  name: profile.brand,
  alternateName: profile.name,
  inLanguage: 'en',
  publisher: { '@id': PERSON_ID },
}

// "Home > Blog > Post": shown under the result in Google instead of the bare address.
function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: absoluteUrl(item.path) })),
  }
}

// --- The pages ---

const sortedPosts = [...updates].sort((a, b) => b.date.localeCompare(a.date))

const home: Page = {
  path: '/',
  title: pageTitle(),
  description: HOME_DESCRIPTION,
  imageAlt: `${profile.name}, Software Engineer & Founder of ${profile.brand}`,
  // ProfilePage: a page about one person, the kind Google shows for "who is …" searches.
  jsonLd: [{ '@type': 'ProfilePage', url: absoluteUrl('/'), mainEntity: person }, brand, website],
}

const blog: Page = {
  path: '/blog',
  title: pageTitle('Blog'),
  description: BLOG_DESCRIPTION,
  jsonLd: [
    {
      '@type': 'Blog',
      url: absoluteUrl('/blog'),
      name: `${profile.name}'s blog`,
      description: BLOG_DESCRIPTION,
      author: { '@id': PERSON_ID },
      blogPost: sortedPosts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: absoluteUrl(`/blog/${post.slug}`),
        datePublished: post.date,
      })),
    },
    breadcrumbs([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
    ]),
    person,
  ],
}

const posts: Page[] = sortedPosts.map((post) => {
  const path = `/blog/${post.slug}`
  const image = shareImage(post.images)
  return {
    path,
    title: pageTitle(post.title),
    description: postDescription(post),
    image,
    imageAlt: post.title,
    type: 'article',
    published: post.date,
    jsonLd: [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: postDescription(post),
        datePublished: post.date,
        dateModified: post.date,
        url: absoluteUrl(path),
        mainEntityOfPage: absoluteUrl(path),
        image: image ? [absoluteUrl(image)] : undefined,
        articleSection: post.category,
        keywords: post.tags?.join(', '),
        inLanguage: 'en',
        author: { '@id': PERSON_ID },
        publisher: { '@id': PERSON_ID },
      },
      breadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.title, path },
      ]),
      person,
    ],
  }
})

const projectPages: Page[] = projects.map((project) => {
  const path = `/projects/${project.slug}`
  const image = shareImage(project.images)
  return {
    path,
    title: pageTitle(project.title),
    description: projectDescription(project),
    image,
    imageAlt: project.title,
    jsonLd: [
      {
        '@type': 'CreativeWork',
        name: project.title,
        description: projectDescription(project),
        url: absoluteUrl(path),
        image: image ? absoluteUrl(image) : undefined,
        keywords: project.tech.join(', '),
        creator: { '@id': PERSON_ID },
      },
      breadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Projects', path: '/#projects' },
        { name: project.title, path },
      ]),
      person,
    ],
  }
})

const notFound: Page = {
  path: '/404',
  title: pageTitle('Page not found'),
  description: "This page doesn't exist.",
  noindex: true,
}

// --- The tags for one page ---

function headTags(page: Page) {
  const url = absoluteUrl(page.path)
  const image = page.image ? absoluteUrl(page.image) : absoluteUrl(DEFAULT_IMAGE.path)
  const title = escapeHtml(page.title)
  const description = escapeHtml(page.description)
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    page.noindex
      ? '<meta name="robots" content="noindex" />'
      : // max-image-preview:large lets Google show big pictures from the site in results.
        '<meta name="robots" content="index, follow, max-image-preview:large" />',
    page.noindex ? '' : `<link rel="canonical" href="${url}" />`,
    // Link previews (LinkedIn, WhatsApp, Facebook…)
    `<meta property="og:type" content="${page.type ?? 'website'}" />`,
    `<meta property="og:site_name" content="${escapeHtml(profile.brand)}" />`,
    '<meta property="og:locale" content="en_US" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    page.noindex ? '' : `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    page.image ? '' : `<meta property="og:image:width" content="${DEFAULT_IMAGE.width}" />`,
    page.image ? '' : `<meta property="og:image:height" content="${DEFAULT_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(page.imageAlt ?? page.title)}" />`,
    page.published ? `<meta property="article:published_time" content="${page.published}" />` : '',
    page.published ? `<meta property="article:author" content="${escapeHtml(profile.name)}" />` : '',
    // X (Twitter) reads the og: tags above, plus these.
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ]
  if (page.jsonLd) {
    // "<" is written as < so a "</script>" inside a text can't end the script early.
    const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': page.jsonLd }).replace(/</g, '\\u003c')
    tags.push(`<script type="application/ld+json">${json}</script>`)
  }
  return [START, ...tags.filter(Boolean), END].map((tag) => `    ${tag}`).join('\n').trimStart()
}

function withPage(html: string, page: Page) {
  const start = html.indexOf(START)
  const end = html.indexOf(END)
  if (start === -1 || end === -1) throw new Error(`seo-plugin: ${START} … ${END} not found in index.html`)
  return html.slice(0, start) + headTags(page) + html.slice(end + END.length)
}

// The list of pages for Google (https://axihex.com/sitemap.xml), with when each last changed
// where we know it. The 404 page isn't in it.
function sitemap() {
  const latestPost = sortedPosts[0]?.date
  const entries = [
    { path: '/', lastmod: latestPost },
    { path: '/blog', lastmod: latestPost },
    ...projects.map((project) => ({ path: `/projects/${project.slug}`, lastmod: undefined })),
    ...sortedPosts.map((post) => ({ path: `/blog/${post.slug}`, lastmod: post.date })),
  ]
  const urls = entries
    .map(({ path, lastmod }) => `  <url>\n    <loc>${absoluteUrl(path)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export default function seoPlugin(): Plugin {
  return {
    name: 'axihex-seo',
    // After Vite's own plugins, so the built index.html exists when generateBundle runs.
    enforce: 'post',
    // The home page's tags, in development and in the build.
    transformIndexHtml(html) {
      return withPage(html, home)
    },
    // After the build has made index.html: the copies for every other page, the 404 page and the sitemap.
    generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (!index || index.type !== 'asset') return
      const html = String(index.source)

      const emit = (fileName: string, source: string) => this.emitFile({ type: 'asset', fileName, source })
      const blogHtml = withPage(html, blog)
      emit('blog.html', blogHtml)
      // The posts' files make a blog/ folder: same as the project pages below.
      emit('blog/index.html', blogHtml)
      for (const page of posts) emit(`${page.path.slice(1)}.html`, withPage(html, page))
      for (const page of projectPages) {
        const pageHtml = withPage(html, page)
        emit(`${page.path.slice(1)}.html`, pageHtml)
        // Project pages: their photos live in a folder with the same name (public/projects/<slug>/).
        // A server that tries folders before falling back to the app (nginx "$uri/") sends
        // /projects/<slug> to that folder; this index.html makes the page open there too.
        emit(`${page.path.slice(1)}/index.html`, pageHtml)
      }
      emit('404.html', withPage(html, notFound))
      emit('sitemap.xml', sitemap())
    },
  }
}
