// What the guide says when you scroll to each section, and where it comes out
// (see AvatarGuide.tsx and avatarGuidePlacement.ts). Two sets of stops:
// - guideTips: the home page, where the tiny robot speaks for the studio (robotText).
// - founderGuideTips: the founder's page (/background), where your avatar speaks as you (text),
//   waving at one stop and standing at the next.
//
// section: the id of the <section> (the same as the navbar link, e.g. 'projects' for #projects).
// text: one or two short sentences. They're typed out letter by letter.
// robotText: the same, said by the robot. The guide takes turns: the tiny robot from the hero
//   (says robotText), then your avatar waving, then your main avatar standing (both say text). The avatar talks as you ("My…"), the robot ABOUT you ("Ali's…").
// Where it comes out (all optional; without them it uses the free space above the heading):
//   anchor + index: the post it's next to: a CSS selector, and which match (0 = the first).
//   edge: 'top' → it peeks over that post's top edge (the default).
//         'beside' → it stands in the empty space on the post's right, level with its bottom.
//         'beside-left' → the same, in the empty space on the post's left (the page's margin).
//   align: for 'top', where along the edge: 'left', 'center' or 'right' (the default).
//   bubble: where its speech bubble goes first: 'left', 'right' or 'above' of it.
//   phone: the same settings for phones (screens up to 720px wide), where posts are stacked in one
//     column. There the free space is usually on the right of the short section title, just
//     above the first post. Without it, phones try the desktop spot.
// leaveBelow: the guide normally stays until its whole section is off screen. With this (a share
//   of the screen's height, e.g. 0.5) it leaves once the section's top is lower than that, so
//   scrolling back up to the section above sends it away (About sits right under the home screen).
// If that spot would cover any text or part of a post, the nearest free spot is used instead (the
// space above the section's heading), so you can change these without checking every screen size.

export interface GuideSpot {
  anchor?: string
  index?: number
  edge?: 'top' | 'beside' | 'beside-left'
  align?: 'left' | 'center' | 'right'
  bubble?: 'left' | 'right' | 'above'
}

export interface GuideTip extends GuideSpot {
  section: string
  text: string
  robotText: string
  // Who says it this time: set by AvatarGuide.tsx when it comes out (it takes turns), not here.
  by?: 'avatar' | 'robot'
  // Which avatar picture, when by is 'avatar': waving or standing (also set by AvatarGuide.tsx).
  pose?: 'wave' | 'stand'
  leaveBelow?: number
  // Only once you've scrolled down a little: for a section already on screen when the page opens.
  afterScroll?: boolean
  phone?: GuideSpot
  desktopOnly?: boolean // never on phones (they get as few appearances as possible)
}

// On phones: over the first post, on the right (next to the short title), bubble above it.
const PHONE_FIRST_POST = (anchor: string): GuideSpot => ({ anchor, index: 0, align: 'right', bubble: 'above' })

// Kept to a few stops on purpose: the guide is a small, distinctive detail, not a narrator.
// No tip for Work or Experience, where it took room beside the cards and the timeline.
// The hexagon is Axihex's brand symbol; the avatar is the founder, the robot a small assistant.
export const guideTips: GuideTip[] = [
  {
    // Over the second post of the short list, on its left (clear of "All posts" on the far right).
    section: 'blog',
    desktopOnly: true,
    text: 'The latest posts and events.',
    robotText: 'Fresh data: the latest posts and events.',
    anchor: '.notes-list li',
    index: 1,
    align: 'left',
    bubble: 'right',
    phone: PHONE_FIRST_POST('.notes-list li'),
  },
  {
    // Standing beside the contact form, in the empty space on its right.
    section: 'contact',
    text: 'Want to reach out? Message me here.',
    robotText: 'Want to connect with Axihex? Send a message here.',
    anchor: '.contact-form',
    edge: 'beside',
    bubble: 'above',
    phone: PHONE_FIRST_POST('.contact-tile'),
  },
]

// The founder's page: your avatar, as you. More stops than the home page: this page is about you.
// No set spot: each comes out in the free space by its section's heading (see the top of this file).
const founderTip = (section: string, text: string, spot: Partial<GuideTip> = {}): GuideTip => ({
  section,
  text,
  robotText: text,
  ...spot,
})

export const founderGuideTips: GuideTip[] = [
  // Right under the hero, so on screen as the page opens: it waits until you scroll. It stands in
  // the empty space on the left of the "how I work" cards, its bubble above it.
  founderTip('mindset', 'This is how I think about building software.', {
    afterScroll: true,
    anchor: '.mindset__item',
    index: 0,
    edge: 'beside-left',
    bubble: 'above',
  }),
  founderTip('experience', 'Where I worked, and what I built there.'),
  founderTip('selected-work', 'Want to see it in practice? Have a look at the projects.'),
  founderTip('skills', 'The tools I work with every day.'),
  founderTip('education', 'Where I learned, and I keep learning.'),
  founderTip('founder-contact', 'Looking for an engineer? Let’s talk.'),
]
