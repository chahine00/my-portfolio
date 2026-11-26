// Axihex's identity and purpose: the text behind the Studio section (About.tsx, PillarHive.tsx) and
// the full Studio page (/studio, StudioPage.tsx).
// Condensed from "Axihex — Identity, Purpose & Vision". Plain data: the build also reads it
// (scripts/prerender.ts), so search engines see the same words.
//
// Keep it honest: what Axihex IS today goes in "today"; ambitions go in "next", never presented as fact.

import type { IconName } from '../components/iconNames.ts'

// The Studio page's opening (under "Smart about what to build. Precise about how."): what Axihex does,
// opportunity first. Our own products lead; client work is welcome alongside them.
// Writing rule for this page: plain words a visitor uses, no slogans ("transforming ideas",
// "cutting-edge", "solutions"), and nothing presented as launched before it is.
export const studioLead =
  'We explore ideas fast and build the ones worth building. The work we ship is our proof, what we learn we share, and every product helps the studio grow. We’re independent, so our own products come first, and clients and founders get the same approach.'

// What we do: the three things you'll find from Axihex. Our own products first.
export const offerings: { title: string; text: string; icon: IconName }[] = [
  { title: 'Our own products', text: 'Apps, online tools, games and services we build, launch and keep improving.', icon: 'box' },
  { title: 'Software for clients', text: 'Web, mobile, backend, AI and cloud, built with you from plan to launch.', icon: 'briefcase' },
  { title: 'What we learn, shared', text: 'Notes, experiments and lessons from every build, on the blog.', icon: 'book' },
]

// The Axihex philosophy: the three lenses in one line (opportunity: see them early; product thinking:
// think them through; engineering: build them to last).
export const philosophy =
  'Opportunities don’t wait for anyone. So we see them early, think them through, and build them to last.'

// The five pillars, in order around the hexagon (clockwise from the top).
// "link": where that pillar lives on this site. Each pillar has its own place, so the five don't
// blur together (Showcase → the work, Share → the blog). "state" goes with the link: { topic } picks
// the Contact form's topic for the visitor.
export interface Pillar {
  word: string
  statement: string
  text: string
  examples: string[]
  icon: IconName
  link: { to: string; label: string; state?: { topic: Topic } }
}

export const pillars: Pillar[] = [
  {
    word: 'Explore',
    statement: 'Discover ideas and new technological opportunities.',
    // Where Axihex sees an opportunity, it tries it: not limited to one kind of product.
    text: 'Where we see an opportunity, we move on it. Quick research and prototypes tell us if the demand is real and the timing is right, before we invest more.',
    examples: ['Watching trends & demand', 'Prototyping to test ideas', 'Experimenting with AI'],
    icon: 'compass',
    // The blog's Ideas posts, not the whole blog (that's Share's link).
    link: { to: '/blog?category=Ideas', label: 'Read our ideas' },
  },
  {
    word: 'Build',
    statement: 'Our own apps, tools, games and services, and software for clients.',
    text: 'The heart of Axihex: turning an opportunity into working software. Two directions side by side: products we own and run, and software we build for clients.',
    examples: ['Our own apps, tools & games', 'Client web & mobile apps', 'Backends, AI & cloud'],
    icon: 'layers',
    // Build is the doing: the action is to build something together. (The work is Showcase's link.)
    link: { to: '/#contact', label: 'Start a project', state: { topic: 'project' } },
  },
  {
    // Showcase shows the work (proof); Share gives the knowledge away. Different links make it clear.
    word: 'Showcase',
    statement: 'Proof through real, shipped work.',
    // About the work only: the founder's own experience lives on the Founder page (/background).
    text: 'Trust comes from real work: shipped projects, client products and engineering milestones, each credited honestly.',
    examples: ['Studio & client projects', 'Shipped products', 'Engineering milestones'],
    icon: 'spark',
    link: { to: '/#projects', label: 'See the work' },
  },
  {
    word: 'Share',
    statement: 'What we learn, given back: articles, tutorials, and free tools.',
    text: 'What we learn while building is worth passing on: articles, case studies and lessons from real projects, never anything confidential.',
    examples: ['Technical articles', 'Engineering case studies', 'Open-source & free tools'],
    icon: 'share',
    link: { to: '/blog', label: 'Read the blog' },
  },
  {
    word: 'Grow',
    statement: 'More products, partners and opportunities, earned through the work.',
    text: 'Growth through real work and relationships, not by looking bigger than we are: new clients, partners, collaborators, and a team when the work calls for it.',
    examples: ['Client & partner relationships', 'Collaborating with makers', 'Reinvesting in new ideas'],
    icon: 'trend',
    link: { to: '/#contact', label: 'Collaborate with us', state: { topic: 'collab' } },
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

// How we think: three lenses, each a short line and the questions it asks. Opportunity is for our own
// products; product thinking and engineering are for every build, ours or a founder's.
export const thinking: {
  lenses: { title: string; line: string; icon: IconName; questions: string[] }[]
  principle: string
  clients: string
} = {
  lenses: [
    {
      title: 'Opportunity',
      line: 'We watch for rising demand and move when the timing is right.',
      icon: 'trend',
      questions: ['Is there real demand?', 'Is the timing right?', 'Can it pay off?', 'How do we reach people?'],
    },
    {
      title: 'Product thinking',
      line: 'Who it’s for, what they need, and what it’s worth.',
      icon: 'target',
      questions: ['Why should we build it?', 'Who will use it?', 'Which features are necessary?', 'What value does it provide?'],
    },
    {
      title: 'Engineering',
      line: 'Reliable, secure software, built fast and built to last.',
      icon: 'code',
      questions: ['How should we build it?', 'Which technologies?', 'How should it scale?', 'How do we maintain it?'],
    },
  ],
  principle: 'Opportunity decides when. Product thinking decides what, why and for whom. Engineering decides how.',
  // For clients and founders: the same thinking, applied to their idea, before any code.
  clients:
    'We think it through with you before writing any code: who it’s for, which features matter first, and a clear plan from first version to launch.',
}

// Where Axihex products live. Not everything carries the Axihex name.
export const channels: { title: string; text: string; icon: IconName }[] = [
  { title: 'axihex.com', text: 'Small online tools and experiments you can use right away.', icon: 'globe' },
  { title: 'Their own websites', text: 'Bigger apps and services, with their own name.', icon: 'external' },
  { title: 'App Store & Google Play', text: 'Mobile apps and games.', icon: 'smartphone' },
  { title: 'GitHub', text: 'Open-source code and resources.', icon: 'github' },
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
