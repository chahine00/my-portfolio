// Axihex's identity, purpose and vision: the text behind the Studio section (About.tsx, PillarHive.tsx),
// the Direction section (Direction.tsx) and the full Studio page (/studio, StudioPage.tsx).
// Condensed from "Axihex — Identity, Purpose & Vision". Plain data: the build also reads it
// (scripts/prerender.ts), so search engines see the same words.
//
// Keep it honest: what Axihex IS today goes in "today"; ambitions go in "next", never presented as fact.

import type { IconName } from '../components/iconNames.ts'

// The official one-line definition.
export const definition =
  'Axihex is an independent, founder-led software studio and emerging technology brand focused on exploring ideas, engineering digital products, and creating useful technology.'

export const essence = 'Where engineering meets curiosity, creativity, and ambition.'

export const philosophy =
  'The best software is the kind people stop noticing: it simply works, every day.'

export const mission =
  'To transform ideas into useful digital solutions through thoughtful engineering, experimentation, creativity, and practical problem-solving.'

export const vision =
  'To establish Axihex as a sustainable and recognized technology brand that develops, launches, and maintains its own digital products, while remaining open to client projects, partnerships, and professional opportunities.'

// Measured by the work, not the headcount.
export const measure =
  'Success is measured by the quality, usefulness, and integrity of the work, not by the number of products, services, or people behind it.'

// What Axihex is more than (PDF §1: "not limited to"), shown as chips on /studio, then what it is.
export const moreThan = ['A software agency', 'A freelance business', 'A personal portfolio', 'A single-product startup']
export const isRather = 'A software studio rooted in engineering, with the freedom to pursue what comes next.'

// What defines Axihex.
export const traits: { title: string; text: string; icon: IconName }[] = [
  { title: 'Engineering', text: 'Reliable, secure, maintainable, and scalable software.', icon: 'code' },
  { title: 'Experimentation', text: 'Exploring technologies, testing ideas, finding new possibilities.', icon: 'flask' },
  { title: 'Product thinking', text: 'Understanding users and building what delivers genuine value.', icon: 'target' },
  { title: 'Independence', text: 'Free to choose ideas, projects, and partners, and to shape the direction.', icon: 'compass' },
]

// The five pillars, in order around the hexagon (clockwise from the top).
// "link": where that pillar lives on this site.
export interface Pillar {
  word: string
  statement: string
  text: string
  objective: string
  examples: string[]
  icon: IconName
  link: { to: string; label: string }
}

export const pillars: Pillar[] = [
  {
    word: 'Explore',
    statement: 'Discover ideas and new technological opportunities.',
    text: 'Curiosity, research, and experimentation to find where software can add real value: prototyping, testing new frameworks, and investigating better ways to solve existing problems.',
    objective: 'An environment where curiosity can lead to meaningful innovation.',
    examples: ['Experimenting with LLMs', 'Prototyping to validate ideas', 'Researching everyday digital problems'],
    icon: 'compass',
    link: { to: '/blog', label: 'Read the experiments' },
  },
  {
    word: 'Build',
    statement: 'Original products, useful tools, and custom software for clients.',
    text: 'The core of Axihex: turning ideas, experiments, and requirements into working software. Two directions that coexist: products owned by Axihex, and solutions delivered for clients.',
    objective: 'Software that delivers genuine value, for Axihex or for its clients.',
    examples: ['Original products & tools', 'Client web & mobile apps', 'Backends, AI & cloud solutions'],
    icon: 'layers',
    link: { to: '/#projects', label: 'See the work' },
  },
  {
    word: 'Showcase',
    statement: 'Real projects and achievements, from the studio and its founder.',
    text: "Credibility comes from genuine work: studio projects, client work, engineering achievements, and the founder's experience, each attributed accurately.",
    objective: 'Credibility through genuine work and achievements.',
    examples: ['Studio & client projects', 'Engineering milestones', "The founder's experience"],
    icon: 'spark',
    link: { to: '/background', label: 'Meet the founder' },
  },
  {
    word: 'Share',
    statement: 'Technical knowledge, insights, and useful tools for the community.',
    text: 'What is learned while building is worth passing on: articles, case studies, and lessons from real projects, shared without exposing anything confidential.',
    objective: 'Contribute to the community through meaningful technical work.',
    examples: ['Technical articles', 'Engineering case studies', 'Open-source & free tools'],
    icon: 'share',
    link: { to: '/blog', label: 'Read the blog' },
  },
  {
    word: 'Grow',
    statement: 'Innovation, collaboration, and professional opportunities.',
    text: 'Growth through real work and relationships, not an artificial impression of size: new clients, partnerships, collaborators, and a team when the work justifies it.',
    objective: 'A sustainable foundation for technical, professional, and business growth.',
    examples: ['Client & partner relationships', 'Collaborating with makers', 'Reinvesting in new ideas'],
    icon: 'trend',
    link: { to: '/#contact', label: 'Collaborate with us' },
  },
]

// The five core engineering capabilities: the focus. Products may vary; this doesn't.
export const capabilities: { title: string; text: string; icon: IconName }[] = [
  { title: 'Web', text: 'Web apps, dashboards & interactive platforms', icon: 'globe' },
  { title: 'Mobile', text: 'Cross-platform apps for iOS & Android', icon: 'smartphone' },
  { title: 'Backend', text: 'APIs, databases & system architecture', icon: 'server' },
  { title: 'AI integration', text: 'LLM features, RAG & intelligent tools', icon: 'bulb' },
  { title: 'Cloud', text: 'Deployment, hosting & reliability', icon: 'cloud' },
]

export const capabilitiesPrinciple = { title: 'Focused in engineering.', accent: 'Flexible in what we build.' }

// Product thinking: the questions on each side, then the process.
export const thinking = {
  how: ['How should we build it?', 'Which technologies?', 'How should it scale?', 'How do we maintain it?'],
  why: ['Why should we build it?', 'Who will use it?', 'Which features are necessary?', 'What value does it provide?'],
  principle: 'Engineering decides how to build something. Product thinking decides what to build, why, and for whom.',
}

export const process: { title: string; text: string }[] = [
  { title: 'Identify', text: 'Understand the problem or opportunity.' },
  { title: 'Explore', text: 'Research users, alternatives, feasibility.' },
  { title: 'Validate', text: 'Confirm it provides genuine value.' },
  { title: 'Engineer', text: 'Reliable, secure, maintainable software.' },
  { title: 'Launch', text: 'Put it in front of its audience.' },
  { title: 'Improve', text: 'Learn from usage and feedback.' },
]

// One brand, many forms: what can live under Axihex, and where it ships.
export const umbrella: { title: string; text: string; icon: IconName }[] = [
  { title: 'Original products', text: 'Owned applications, platforms, and digital tools.', icon: 'box' },
  { title: 'Client solutions', text: 'Custom web and mobile software, built for clients.', icon: 'briefcase' },
  { title: 'Research & innovation', text: 'Experiments, prototypes, and emerging technologies.', icon: 'flask' },
  { title: 'Knowledge & resources', text: 'Technical articles, insights, and community contributions.', icon: 'book' },
]

export const channels: { title: string; text: string; icon: IconName }[] = [
  { title: 'axihex.com', text: 'Small utilities, experiments, and product discovery.', icon: 'globe' },
  { title: 'Product websites', text: 'Larger products with their own name and identity, “Built by Axihex”.', icon: 'external' },
  { title: 'App Store & Google Play', text: 'Mobile apps and games under the right product identity.', icon: 'smartphone' },
  { title: 'GitHub', text: 'Open-source projects, libraries, and technical resources.', icon: 'github' },
]

// Today, and where it's heading. "home": also shown in the home page's Direction section.
export const horizon: { aspect: string; today: string; next: string; home?: boolean }[] = [
  { aspect: 'Brand', today: 'Emerging software studio', next: 'Established technology brand', home: true },
  { aspect: 'Products', today: 'Ideas in development', next: 'Published, maintained products', home: true },
  { aspect: 'Client work', today: 'Open to independent projects', next: 'Lasting client relationships', home: true },
  { aspect: 'Engineering', today: 'Founder-led expertise', next: 'Expanded capabilities' },
  { aspect: 'Knowledge', today: 'Technical insights & articles', next: 'Wider community contributions', home: true },
  { aspect: 'Collaboration', today: 'Professional relationships', next: 'Partnerships & a team', home: true },
  { aspect: 'Distribution', today: 'axihex.com', next: 'Product sites & app stores' },
]

// The core values.
export const values: { title: string; text: string; icon: IconName }[] = [
  { title: 'Curiosity', text: 'Explore ideas and keep learning.', icon: 'bulb' },
  { title: 'Engineering excellence', text: 'Reliable, maintainable software.', icon: 'code' },
  { title: 'Usefulness', text: 'Technology with genuine value.', icon: 'target' },
  { title: 'Integrity', text: 'Trust, privacy, and transparency.', icon: 'shield' },
  { title: 'Creativity', text: 'New approaches and possibilities.', icon: 'spark' },
  { title: 'Sustainable growth', text: 'Evolve through meaningful work.', icon: 'trend' },
]

// Why people write: the Contact section's choices. Each adds a short tag to the message, so the
// email says what it's about. "role" is for recruiters: Axihex being independent doesn't mean the
// founder isn't open to employment.
export type Topic = 'project' | 'collab' | 'role' | 'hello'
export const topics: { id: Topic; label: string; tag: string; placeholder: string }[] = [
  { id: 'project', label: 'A project', tag: 'Project inquiry', placeholder: 'What would you like to build? A few lines on the idea, the users, and the timeline help.' },
  { id: 'collab', label: 'A collaboration', tag: 'Collaboration', placeholder: 'Tell me about the partnership or idea you have in mind.' },
  { id: 'role', label: 'A role for the founder', tag: 'Engineering opportunity', placeholder: 'Tell me about the role and the team.' },
  { id: 'hello', label: 'Just saying hi', tag: 'Hello', placeholder: 'Your message' },
]
