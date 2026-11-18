// What the avatar says when you scroll to each home section, and where it comes out
// (see AvatarGuide.tsx and avatarGuidePlacement.ts).
//
// section: the id of the <section> (the same as the navbar link, e.g. 'projects' for #projects).
// text: one or two short sentences. They're typed out letter by letter.
// robotText: the same, said by the robot. The guide takes turns: one time your avatar comes out
//   (and says text), the next time the tiny robot from the hero (and says robotText), so your
//   face isn't at every stop. The avatar talks as you ("My…"), the robot ABOUT you ("Ali's…").
// Where it comes out (all optional; without them it uses the free space above the heading):
//   anchor + index: the post it's next to: a CSS selector, and which match (0 = the first).
//   edge: 'top' → it peeks over that post's top edge (the default).
//         'beside' → it stands in the empty space on the post's right, level with its bottom.
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
  edge?: 'top' | 'beside'
  align?: 'left' | 'center' | 'right'
  bubble?: 'left' | 'right' | 'above'
}

export interface GuideTip extends GuideSpot {
  section: string
  text: string
  robotText: string
  // Who says it this time: set by AvatarGuide.tsx when it comes out (it takes turns), not here.
  by?: 'avatar' | 'robot'
  leaveBelow?: number
  phone?: GuideSpot
}

// On phones: over the first post, on the right (next to the short title), bubble above it.
const PHONE_FIRST_POST = (anchor: string): GuideSpot => ({ anchor, index: 0, align: 'right', bubble: 'above' })

export const guideTips: GuideTip[] = [
  {
    // Over the third "mindset" card, on its right (the text above it stops before that).
    section: 'about',
    text: "This is how I think and work.",
    robotText: "Beep! This is how Ali thinks and works.",
    anchor: '.mindset__item',
    index: 2,
    align: 'right',
    bubble: 'above',
    // It leaves once you scroll back up to the home screen (the top of About is past mid-screen).
    leaveBelow: 0.5,
    // Phones: the intro paragraph runs the full width right above the first card, so it stands on
    // that paragraph instead, on the right, next to the short "Think bigger. / Adapt faster." title.
    phone: PHONE_FIRST_POST('.mindset__lead'),
  },
  {
    // Over the second project card, on its left, under the empty right side of the title.
    section: 'projects',
    text: 'Real projects I shipped. Click a card for details.',
    robotText: "Beep! Ali's shipped projects. Open a card for details.",
    anchor: '.project-card',
    index: 1,
    align: 'left',
    bubble: 'right',
    phone: PHONE_FIRST_POST('.project-card'),
  },
  {
    // Standing beside the first job, in the empty column right of the timeline.
    section: 'experience',
    text: 'My jobs and what I delivered at each one.',
    robotText: "Work history loaded: Ali's jobs and results.",
    anchor: '.card.job',
    edge: 'beside',
    bubble: 'above',
    phone: PHONE_FIRST_POST('.card.job'),
  },
  {
    // Over the middle of the stack card.
    section: 'skills',
    text: 'The tools I use every day.',
    robotText: "Scanning… Ali's everyday tools.",
    anchor: '.stack',
    align: 'center',
    bubble: 'right',
    phone: PHONE_FIRST_POST('.stack'),
  },
  {
    // Over the second degree card, on its right.
    section: 'education',
    text: 'My degrees and the languages I speak.',
    robotText: "Ali's degrees and languages, all in one place.",
    anchor: '.edu-degree',
    index: 1,
    align: 'right',
    bubble: 'left',
    phone: PHONE_FIRST_POST('.edu-degree'),
  },
  {
    // Over the post in the right column, on its left (clear of "See all" on the far right).
    section: 'blog',
    text: 'My latest posts and events.',
    robotText: "Fresh data: Ali's latest posts and events.",
    anchor: '.blog-preview__item',
    index: 1,
    align: 'left',
    bubble: 'right',
    phone: PHONE_FIRST_POST('.blog-preview__item'),
  },
  {
    // Standing beside the contact form, in the empty space on its right.
    section: 'contact',
    text: 'Want to work together? Message me here.',
    robotText: 'Want to work with Ali? Send a message here.',
    anchor: '.contact-form',
    edge: 'beside',
    bubble: 'above',
    phone: PHONE_FIRST_POST('.contact-tile'),
  },
]
