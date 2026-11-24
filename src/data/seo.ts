// What search engines and link previews (Google, LinkedIn, WhatsApp, X…) see for each page:
// its title, its description, and its address.
//
// Used in two places, so they always agree:
//   1. at build time (scripts/seo-plugin.ts): every page gets its own HTML file with these tags,
//      so Google and link previews see the right title without running any JavaScript
//   2. in the browser (src/utils/useDocumentTitle.ts): the tags follow you as you move between pages
//
// Descriptions: one or two plain sentences, about 150 characters. Longer ones get cut in Google.

import { profile } from './profile.ts'
import type { Project } from './projects.ts'
import type { Update } from './updates.ts'

export const SITE_URL = profile.site // 'https://axihex.com', no slash at the end

// The brand first, its founder after it (people also search for the founder by name).
export const SITE_TITLE = `${profile.brand} | Building what's next · Founded by ${profile.name}`

export const HOME_DESCRIPTION =
  `${profile.brand} is an independent software studio founded by ${profile.name}: ` +
  'exploring ideas, engineering digital products, and creating useful technology.'

// Who the founder is: used for the person in the structured data (scripts/seo-plugin.ts).
export const FOUNDER_DESCRIPTION =
  `${profile.name} is a software engineer in Beirut and the founder of ${profile.brand}. ` +
  'He builds secure APIs and databases, cross-platform mobile apps, LLM & RAG features and web apps, end to end.'

export const BACKGROUND_DESCRIPTION =
  `${profile.name}, software engineer and founder of ${profile.brand}: backend systems, AI integration, ` +
  'mobile and cloud. Work history, skills, education and CV.'

export const BLOG_DESCRIPTION =
  `The ${profile.brand} blog on backend engineering, mobile apps, AI and building software: ` +
  'lessons from real projects, ideas, milestones and events.'

// The picture shown when the home page (or a page without photos) is shared.
export const DEFAULT_IMAGE = { path: '/og-image.png', width: 1440, height: 740 }

// Google shows about this many characters of a title, and about DESCRIPTION_MAX of a description.
const TITLE_MAX = 60
const DESCRIPTION_MAX = 155

// A page's title in the browser tab and in Google: "The CI Network | Axihex". A long title keeps
// its own words and drops "| Axihex", so Google doesn't cut it off in the middle.
export function pageTitle(title?: string) {
  if (!title) return SITE_TITLE
  const withBrand = `${title} | ${profile.brand}`
  return withBrand.length <= TITLE_MAX ? withBrand : title
}

// Shortens a text to about `max` characters, cutting at a space and adding "…".
export function clip(text: string, max = DESCRIPTION_MAX) {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

// The full address of a page or file: '/blog' → 'https://axihex.com/blog'.
export function absoluteUrl(path: string) {
  return path === '/' ? `${SITE_URL}/` : SITE_URL + path
}

// Link previews can't show SVGs, so the first photo that isn't one.
export function shareImage(images?: string[]) {
  return images?.find((image) => !image.endsWith('.svg'))
}

export function projectDescription(project: Project) {
  return clip(project.problem)
}

export function postDescription(post: Update) {
  return clip(post.summary)
}
