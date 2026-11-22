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

// Your name first, the brand after it: people search for you by name.
export const SITE_TITLE = `${profile.name} | Software Engineer & Founder of ${profile.brand}`

export const HOME_DESCRIPTION =
  `${profile.name} is a software engineer in Beirut and the founder of ${profile.brand}. ` +
  'He builds secure APIs and databases, cross-platform mobile apps, LLM & RAG features and web apps, end to end.'

export const BLOG_DESCRIPTION =
  `Notes from ${profile.name} on backend engineering, mobile apps, AI and building software: ` +
  'lessons from real projects, ideas, milestones and events.'

// The picture shown when the home page (or a page without photos) is shared.
export const DEFAULT_IMAGE = { path: '/og-image.png', width: 1440, height: 740 }

// A page's title in the browser tab and in Google: "Cinetwork | Ali Chahine".
export function pageTitle(title?: string) {
  return title ? `${title} | ${profile.name}` : SITE_TITLE
}

// Shortens a text to about `max` characters, cutting at a space and adding "…".
export function clip(text: string, max = 160) {
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
