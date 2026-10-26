// Your posts / news. The newest ones appear in the "Latest Updates" section
// of the home page, and all of them on the Updates page (/updates).
// Each post also gets its own page at /updates/<slug>.
//
// To add a post:
// 1. Put its photos in a new folder, e.g. public/updates/my-new-post/1.jpg, 2.jpg …
// 2. Add a new object to the list below. Newest posts are shown first automatically.

export interface Update {
  slug: string // the post's address: 'my-new-post' → /updates/my-new-post (lowercase, dashes, no spaces)
  title: string
  date: string // written as 'YYYY-MM-DD', e.g. '2026-10-26'
  summary: string // one or two sentences, shown on the cards
  content: string // the full post. Leave an empty line between paragraphs.
  images: string[] // photos from /public, in order. The first one is the main photo. Can be empty: []
  tags?: string[]
}

// These are EXAMPLES — replace them with your real posts.
// The backticks ` ` let the text span several lines, so you can paste a whole post.
export const updates: Update[] = [
  {
    slug: 'example-project',
    title: 'Example post: a project I just shipped',
    date: '2026-10-20',
    summary: 'A short summary of what the post is about, so visitors know why it is worth reading.',
    content: `This is where the full post goes. You can paste the text of your LinkedIn post here.

Leave an empty line to start a new paragraph.
A single line break stays a line break, just like on LinkedIn.

This example has 5 photos, so the card shows 3 small ones and "+2".`,
    images: [
      '/updates/example-project/1.svg',
      '/updates/example-project/2.svg',
      '/updates/example-project/3.svg',
      '/updates/example-project/4.svg',
      '/updates/example-project/5.svg',
    ],
    tags: ['Project', 'AI'],
  },
  {
    slug: 'example-learning',
    title: 'Example post: something I learned',
    date: '2026-09-02',
    summary: 'Another short summary. Keep it to one or two sentences.',
    content: `A post with a single photo. The gallery hides the arrows when there's only one.`,
    images: ['/updates/example-learning/1.svg'],
  },
]

// Everything below is worked out from the list above — you don't need to edit it.

// Newest first. [...updates] makes a copy, because .sort() changes the array it's called on.
// Comparing 'YYYY-MM-DD' strings works because they sort in date order.
export const sortedUpdates = [...updates].sort((a, b) => b.date.localeCompare(a.date))

// A post counts as "new" for 30 days. Used for the "New" badge and the dot in the navbar.
const NEW_FOR_DAYS = 30

export function isRecent(date: string) {
  const ageInDays = (Date.now() - new Date(`${date}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24)
  return ageInDays <= NEW_FOR_DAYS
}

export const hasRecentUpdate = sortedUpdates.length > 0 && isRecent(sortedUpdates[0].date)

// Turns '2026-10-26' into something readable like 'October 26, 2026'.
export function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
