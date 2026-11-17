// What the avatar says when you scroll to each home section, and where it comes out
// (see AvatarGuide.tsx and avatarGuidePlacement.ts).
//
// section: the id of the <section> (the same as the navbar link, e.g. 'projects' for #projects).
// text: one or two short sentences. They're typed out letter by letter.
// Where it comes out (all optional; without them it uses the free space above the heading):
//   anchor + index: the post it's next to: a CSS selector, and which match (0 = the first).
//   edge: 'top' → it peeks over that post's top edge (the default).
//         'beside' → it stands in the empty space on the post's right, level with its bottom.
//   align: for 'top', where along the edge: 'left', 'center' or 'right' (the default).
//   bubble: where its speech bubble goes first: 'left', 'right' or 'above' of it.
//   phone: the same settings for phones (screens up to 720px wide), where posts are stacked in one
//     column. There the free space is usually on the right of the short section title, just
//     above the first post. Without it, phones try the desktop spot.
// If that spot would cover any text or part of a post, the nearest free spot is used instead (the
// space above the section's heading), so you can change these without checking every screen size.

export interface GuideSpot {
  anchor?: string
  index?: number
  edge?: 'top' | 'beside'
  align?: 'left' | 'center' | 'right'
  bubble?: 'left' | 'right' | 'above'
}

export interface GuideTip extends GuideSpot {
  section: string
  text: string
  phone?: GuideSpot
}

// On phones: over the first post, on the right (next to the short title), bubble above it.
const PHONE_FIRST_POST = (anchor: string): GuideSpot => ({ anchor, index: 0, align: 'right', bubble: 'above' })

export const guideTips: GuideTip[] = [
  {
    // Over the third "mindset" card, on its right (the text above it stops before that).
    section: 'about',
    text: "Hi, I'm Ali! This is the short version of me: how I think, and a few numbers.",
    anchor: '.mindset__item',
    index: 2,
    align: 'right',
    bubble: 'above',
    phone: PHONE_FIRST_POST('.mindset__item'),
  },
  {
    // Over the second project card, on its left, under the empty right side of the title.
    section: 'projects',
    text: 'Things I actually shipped. Open any card for the full story and screenshots.',
    anchor: '.project-card',
    index: 1,
    align: 'left',
    bubble: 'right',
    phone: PHONE_FIRST_POST('.project-card'),
  },
  {
    // Standing beside the first job, in the empty column right of the timeline.
    section: 'experience',
    text: "Where I've worked, newest first, with what I did at each place.",
    anchor: '.card.job',
    edge: 'beside',
    bubble: 'above',
    phone: PHONE_FIRST_POST('.card.job'),
  },
  {
    // Over the middle of the stack card.
    section: 'skills',
    text: 'My everyday stack: the tools I reach for first.',
    anchor: '.stack',
    align: 'center',
    bubble: 'right',
    phone: PHONE_FIRST_POST('.stack'),
  },
  {
    // Over the second degree card, on its right.
    section: 'education',
    text: 'Where I studied, plus the languages I speak.',
    anchor: '.edu-degree',
    index: 1,
    align: 'right',
    bubble: 'left',
    phone: PHONE_FIRST_POST('.edu-degree'),
  },
  {
    section: 'testimonials',
    text: "Don't just take my word for it: here's what people I've worked with say.",
    anchor: '.card.quote',
    index: 1,
    align: 'left',
  },
  {
    // Over the post in the right column, on its left (clear of "See all" on the far right).
    section: 'blog',
    text: 'My latest posts: hackathons, events and things I learned along the way.',
    anchor: '.blog-preview__item',
    index: 1,
    align: 'left',
    bubble: 'right',
    phone: PHONE_FIRST_POST('.blog-preview__item'),
  },
  {
    // Standing beside the contact form, in the empty space on its right.
    section: 'contact',
    text: 'Got a project or a role in mind? Drop me a message here.',
    anchor: '.contact-form',
    edge: 'beside',
    bubble: 'above',
    phone: PHONE_FIRST_POST('.contact-tile'),
  },
]
