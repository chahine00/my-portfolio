// The text of each page, written into its HTML file when the site is built (seo-plugin.ts), inside
// <div id="root">. Without it, every page's HTML is an empty box until the JavaScript has run:
// Google gets there in the end (it runs the JavaScript, later and less reliably), but other search
// engines, AI crawlers and anything that reads the raw HTML see nothing.
//
// It's plain, meaningful HTML: the same headings, paragraphs and links as the real page, made from
// the same data files (src/data), so it always says the same thing. React replaces it with the real
// page as soon as the app starts (createRoot empties the box first). Until then it stays invisible
// (.prerender in global.css), and only fades in if the app hasn't started after a moment (no
// JavaScript, or a very slow connection), so visitors never see it flash.

import { profile } from '../src/data/profile.ts'
import { studio } from '../src/data/studio.ts'
import {
  capabilities,
  definition,
  horizon,
  isRather,
  measure,
  mission,
  notLimitedTo,
  philosophy,
  pillars,
  process,
  thinking,
  traits,
  umbrella,
  values,
  vision,
} from '../src/data/identity.ts'
import { coreStack, mindset, testimonials } from '../src/data/founder.ts'
import { projectCategories, projects, type Project } from '../src/data/projects.ts'
import { formatDate, type Update } from '../src/data/updates.ts'
import { contacts } from '../src/data/contact.ts'
import { experience } from '../src/data/experience.ts'
import { certificates, degrees, languages } from '../src/data/education.ts'

const esc = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Tags with escaped text: el('p', 'Hello') → <p>Hello</p>. "html" is already-built HTML.
const el = (tag: string, text: string) => `<${tag}>${esc(text)}</${tag}>`
const link = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`
const list = (items: string[]) => (items.length ? `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>` : '')
// A long text with empty lines between its paragraphs, as <p>s.
const paragraphs = (text?: string) =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => el('p', part.replace(/\s*\n\s*/g, ' ')))
    .join('')

// The site's menu, on every page.
const nav = `<nav>${[
  link('/', profile.brand),
  link('/#studio', 'Studio'),
  link('/studio', 'Identity & vision'),
  link('/#projects', 'Work'),
  link('/background', 'Founder'),
  link('/blog', 'Blog'),
  link('/#contact', 'Contact'),
].join(' ')}</nav>`

// The contact links (email, LinkedIn, GitHub), without phone numbers, like the Contact section.
const contactLinks = list(contacts.filter((c) => !c.href.startsWith('tel:')).map((c) => `${esc(c.label)}: ${link(c.href, c.value)}`))

const wrap = (body: string) => `<div class="prerender">${nav}<main>${body}</main></div>`

const cv = link('/Ali_Chahine_CV.pdf', 'Download CV')

// --- The pages ---

export function homeBody(posts: Update[]) {
  const work = projectCategories
    .map((group) => ({ ...group, items: projects.filter((p) => p.category === group.id) }))
    .filter((group) => group.items.length)
    .map(
      (group) =>
        el('h3', group.title) +
        el('p', group.intro) +
        list(group.items.map((p) => `${link(`/projects/${p.slug}`, p.title)}${p.summary ? ` ${esc(p.summary)}` : ''}`)),
    )
    .join('')

  return wrap(
    `<header>${el('p', profile.role)}${el('h1', `${profile.headline} ${profile.headlineAccent}`)}${el('p', profile.intro)}</header>` +
      `<section id="studio">${el('h2', `${studio.title} ${studio.titleAccent}`)}${el('p', studio.text)}` +
      `<p>${link('/studio', 'Identity, purpose & vision')}</p>` +
      el('h3', `${studio.pillarsTitle} ${studio.pillarsAccent}`) +
      list(pillars.map((p) => `<strong>${esc(p.word)}</strong>: ${esc(p.statement)}`)) +
      el('h3', 'Core engineering capabilities') +
      list(capabilities.map((c) => `<strong>${esc(c.title)}</strong>: ${esc(c.text)}`)) +
      el('h3', studio.behindTitle) +
      studio.behind.map((p) => el('p', p)).join('') +
      `<p>${link('/background', studio.founderCard.title)} ${esc(studio.founderCard.text)} ${esc(studio.founderCard.availability)}.</p></section>` +
      `<section id="projects">${el('h2', 'Selected Work: engineering in practice')}${work}</section>` +
      `<section id="blog">${el('h2', 'Blog: notes, ideas & milestones')}` +
      list(posts.slice(0, 3).map((post) => `${link(`/blog/${post.slug}`, post.title)} ${esc(post.summary)}`)) +
      `<p>${link('/blog', 'All posts')}</p></section>` +
      `<section id="direction">${el('h2', 'Direction: where we’re going')}` +
      el('h3', 'Mission') + el('p', mission) + el('h3', 'Vision') + el('p', vision) +
      list(horizon.filter((h) => h.home).map((h) => `<strong>${esc(h.aspect)}</strong>: today ${esc(h.today)}; next ${esc(h.next)}`)) +
      `<p>${link('/studio', 'Identity, purpose & vision')}</p></section>` +
      `<section id="contact">${el('h2', 'Let’s talk.')}` +
      el('p', 'A project in mind, an idea to build together, or a role for the founder? Reach out by email, on LinkedIn, or with the form.') +
      `${contactLinks}</section>`,
  )
}

export function founderBody() {
  const jobs = experience
    .map(
      (job) =>
        el('h3', job.company) +
        job.roles.map((role) => el('h4', `${role.title} (${role.period})`) + list(role.points.map(esc))).join('') +
        (job.tech?.length ? el('p', job.tech.join(', ')) : ''),
    )
    .join('')
  const education = [...degrees, ...certificates].map((item) => esc(`${item.title}, ${item.place} (${item.year})`))

  return wrap(
    `<header>${el('p', `${profile.founderTitle} · Founder of ${profile.brand}`)}${el('h1', `Meet ${profile.name}`)}` +
      el('p', `${profile.location} · ${profile.founderAvailability}`) +
      `<p>${cv}</p></header>` +
      `<section id="mindset">${el('h2', `${mindset.title} ${mindset.titleAccent}`)}${el('p', mindset.lead)}` +
      list(mindset.principles.map((p) => `<strong>${esc(p.title)}</strong>: ${esc(p.text)}`)) +
      '</section>' +
      `<section id="experience">${el('h2', 'Work history')}${jobs}</section>` +
      `<section id="selected-work">${el('h2', 'Experience in practice')}` +
      el('p', 'Explore the projects I’ve built and contributed to throughout my engineering journey.') +
      list(projects.map((p) => link(`/projects/${p.slug}`, p.title))) +
      '</section>' +
      (testimonials.length
        ? `<section id="testimonials">${el('h2', 'What people say')}` +
          list(testimonials.map((t) => `<blockquote>${el('p', t.quote)}</blockquote>${esc(`${t.name}, ${t.role}`)}`)) +
          '</section>'
        : '') +
      `<section id="skills">${el('h2', 'Core capabilities')}` +
      list(coreStack.map((group) => `<strong>${esc(group.category)}</strong>: ${esc(group.skills.join(', '))}`)) +
      '</section>' +
      `<section id="education">${el('h2', 'Education & languages')}${list(education)}` +
      el('p', languages.map((l) => `${l.name} (${l.label})`).join(', ')) +
      '</section>' +
      `<section id="founder-contact">${el('h2', 'Let’s talk.')}${contactLinks}<p>${cv}</p></section>`,
  )
}

export function studioBody() {
  return wrap(
    `<header>${el('p', 'Identity, purpose & vision')}${el('h1', 'Where engineering meets curiosity.')}${el('p', definition)}` +
      el('p', `Not limited to: ${notLimitedTo.join(', ')}. ${isRather}`) +
      '</header>' +
      `<section id="defines">${el('h2', 'What defines Axihex')}` +
      list(traits.map((t) => `<strong>${esc(t.title)}</strong>: ${esc(t.text)}`)) +
      '</section>' +
      `<section id="pillars">${el('h2', 'Five pillars. One studio.')}` +
      pillars
        .map((p, i) => el('h3', `0${i + 1} ${p.word}: ${p.statement}`) + el('p', p.text) + el('p', `Objective: ${p.objective}`))
        .join('') +
      '</section>' +
      `<section id="capabilities">${el('h2', 'Core engineering capabilities')}` +
      list(capabilities.map((c) => `<strong>${esc(c.title)}</strong>: ${esc(c.text)}`)) +
      '</section>' +
      `<section id="approach">${el('h2', 'Product thinking, in practice')}` +
      el('p', `Engineering asks: ${thinking.how.join(' ')}`) +
      el('p', `Product thinking asks: ${thinking.why.join(' ')}`) +
      el('p', thinking.principle) +
      `<ol>${process.map((s) => `<li><strong>${esc(s.title)}</strong>: ${esc(s.text)}</li>`).join('')}</ol>` +
      '</section>' +
      `<section id="brand">${el('h2', 'One brand, many forms')}` +
      list(umbrella.map((u) => `<strong>${esc(u.title)}</strong>: ${esc(u.text)}`)) +
      '</section>' +
      `<section id="direction">${el('h2', 'Today, and what’s next')}` +
      list(horizon.map((h) => `<strong>${esc(h.aspect)}</strong>: today ${esc(h.today)}; next ${esc(h.next)}`)) +
      el('p', measure) +
      '</section>' +
      `<section id="values">${el('h2', 'What we stand for')}` +
      el('h3', 'Mission') + el('p', mission) + el('h3', 'Long-term vision') + el('p', vision) +
      list(values.map((v) => `<strong>${esc(v.title)}</strong>: ${esc(v.text)}`)) +
      el('p', philosophy) +
      `<p>${link('/#contact', 'Start a project')} · ${link('/background', 'Meet the founder')}</p>` +
      '</section>',
  )
}

export function blogBody(posts: Update[], description: string) {
  return wrap(
    `<header>${el('h1', 'Blog')}${el('p', description)}</header>` +
      list(
        posts.map(
          (post) => `${link(`/blog/${post.slug}`, post.title)} <time datetime="${post.date}">${esc(formatDate(post.date))}</time> ${esc(post.summary)}`,
        ),
      ),
  )
}

export function postBody(post: Update) {
  return wrap(
    `<article><header>${el('p', post.category)}${el('h1', post.title)}` +
      `<p><time datetime="${post.date}">${esc(formatDate(post.date))}</time> · ${esc(profile.name)}</p></header>` +
      paragraphs(post.content) +
      (post.tags?.length ? el('p', post.tags.join(', ')) : '') +
      `<p>${link('/blog', 'All posts')}</p></article>`,
  )
}

export function projectBody(project: Project) {
  const section = (title: string, html: string) => (html ? el('h2', title) + html : '')
  return wrap(
    `<article><header>${project.context ? el('p', project.context) : ''}${el('h1', project.title)}` +
      `${project.summary ? el('p', project.summary) : ''}</header>` +
      section('The problem', el('p', project.problem)) +
      section('Overview', paragraphs(project.overview)) +
      section('What was built', list((project.built ?? []).map(esc))) +
      section('Features', list((project.features ?? []).map(esc))) +
      section('Result', project.result ? el('p', project.result) : '') +
      section('Tech', el('p', project.tech.join(', '))) +
      `<p>${link('/#projects', 'All projects')}</p></article>`,
  )
}
