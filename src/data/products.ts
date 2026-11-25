// Axihex's own products: the apps, tools and services the studio makes and runs itself.
// They're the studio's main highlight: when there's at least one to show, they get
//   1. a Products section on the home page, right under the hero (Products.tsx)
//   2. their own page each, at /products/<slug> (ProductPage.tsx), with its own link preview, so a
//      link shared on social media opens straight on that product
//   3. "Products" in the menu, and the hero's main button ("See our products")
//
// HIDDEN UNTIL READY: a product only shows on the live site once it has  published: true.
// While the list has no published product, the section, the pages, the menu link and the hero
// button don't exist at all. To preview a draft (published: false) while working on it, run
// npm run dev: drafts show there, never on the built site.
//
// Be honest about where each product is (the brand guidelines: never present a future product as
// launched): use the right "status", and only add a "url" once there's something to open.
//
// Pictures go in public/products/<slug>/, e.g. public/products/my-tool/1.png.

import type { IconName } from '../components/iconNames.ts'

export type ProductStatus = 'live' | 'beta' | 'in-development' | 'coming-soon'

// What each status says on the badge.
export const statusLabel: Record<ProductStatus, string> = {
  live: 'Live',
  beta: 'Beta',
  'in-development': 'In development',
  'coming-soon': 'Coming soon',
}

export interface Product {
  slug: string // the page's address: 'my-tool' → /products/my-tool (lowercase, dashes, no spaces)
  name: string
  published: boolean // false: a draft, only shown while developing (npm run dev)
  status: ProductStatus
  tagline: string // one line: what it does, for whom. On the card and under the name.
  // A few paragraphs about it, with an empty line between paragraphs. On its page.
  description?: string
  // What it is, shown on the card and the page. A "Service" is something people come back to use,
  // like a streaming service; a "Game" can be played online or installed.
  kind: 'Online tool' | 'Game' | 'Service' | 'Web app' | 'Mobile app'
  icon?: IconName // a small icon on the card when there's no picture yet (a box if left out)
  platforms?: string[] // where it's available, e.g. ['Web', 'App Store', 'Google Play']
  features?: string[] // what it does, in short points
  url?: string // where to open or download it (its own site, the store page…); leave out until it exists
  urlLabel?: string // the button's text, e.g. 'Play now', 'Start watching', 'Use the tool' ('Open <name>' if left out)
  images?: string[] // pictures: the first is the card's cover and the link preview
  imageAlt?: string // what the first picture shows
  imageDescriptions?: string[] // what each picture shows, in the same order
  // --- For Google and link previews ---
  seoTitle?: string // a more descriptive title for search results (the name otherwise)
  seoDescription?: string // 140–155 characters, a full sentence (the tagline otherwise)
}

export const products: Product[] = [
  // An example to copy (keep it published: false until the product is ready to be shown):
  // {
  //   slug: 'my-tool',
  //   name: 'My Tool',
  //   published: false,
  //   status: 'in-development',
  //   tagline: 'One line on what it does and for whom.',
  //   description: 'A first paragraph.\n\nA second paragraph.',
  //   kind: 'Online tool',
  //   icon: 'spark',
  //   platforms: ['Web'],
  //   features: ['What it does', 'Another thing it does'],
  // },
]

// The products the live site shows.
export const publishedProducts = products.filter((product) => product.published)
