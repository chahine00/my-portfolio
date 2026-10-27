// Your blog posts. The newest ones appear in the "Blog" section
// of the home page, and all of them on the Blog page (/blog).
// Each post also gets its own page at /blog/<slug>.
//
// To add a post:
// 1. Put its photos in a new folder, e.g. public/updates/my-new-post/1.jpg, 2.jpg …
// 2. Add a new object to the list below. Newest posts are shown first automatically.
// 3. Run  sh scripts/make-thumbs.sh  to make the small copies used on the cards (faster scrolling).

export interface Update {
  slug: string // the post's address: 'my-new-post' → /blog/my-new-post (lowercase, dashes, no spaces)
  title: string
  date: string // written as 'YYYY-MM-DD', e.g. '2026-10-26'
  summary: string // one or two sentences, shown on the cards
  content: string // the full post. Leave an empty line between paragraphs.
  images: string[] // photos from /public, in order. The first one is the main photo. Can be empty: []
  tags?: string[]
}

// The backticks ` ` let the text span several lines, so you can paste a whole post.
// These posts come from my LinkedIn (linkedin.com/in/chahine21).
export const updates: Update[] = [
  {
    slug: 'first-ios-app-submission',
    title: 'Submitting my first iOS app to the App Store',
    date: '2026-10-13',
    summary:
      'Cross-platform code gets you far, but iOS handles permissions and signing very differently from Android. Lessons from my first App Store submission.',
    content: `This submission literally forced me to buy a MacBook just to push my app to the App Store!

While cross-platform development allows code reuse, iOS requires different approaches to permissions, signing, and configuration compared to Android.

Submitting my first iOS app was a great learning experience:

- Permissions: Android uses plain declarations (AndroidManifest.xml), whereas iOS mandates clear, user-facing text justifications in Info.plist (like explicitly explaining why camera or photo library access is needed), which definitely surprised me the first time!

- Signing & Build: Android relies on local keystores, while iOS requires online identity management through Apple Developer accounts, provisioning profiles, and App Store Connect, where we can create the build package.

I have always preferred Android. At least it doesn't force me to buy a MacBook just to submit an app to the App Store! Hahah`,
    images: [
      '/updates/first-ios-app-submission/1.jpg',
    ],
    tags: ['Mobile', 'iOS', 'React Native'],
  },
  {
    slug: 'cinetwork-byblos-film-festival',
    title: 'Cinetwork gets a sneak peek at the Byblos International Film Festival',
    date: '2026-09-01',
    summary:
      'Cinetwork, the app I built for the film and cinema community, was presented at the Byblos International Film Festival ahead of its official launch.',
    content: `I'm beyond happy to share that Cinetwork, the app I built for the film and cinema community, got an exclusive sneak peek last weekend at the Byblos International Film Festival, ahead of its official launch! 🎬

A huge thank you to the festival organizers for this invitation and for trusting our project enough to give it this stage, in such a beautiful city.

As developers, this is exactly how our work should live: solving real problems, helping real people, and becoming real projects, not just ideas that stay on a screen.

More to come soon. 🍿✨`,
    images: [
      '/updates/cinetwork-byblos-film-festival/1.jpg',
    ],
    tags: ['Project', 'Launch', 'Mobile'],
  },
  {
    slug: 'flamex-intelligence-hackathon',
    title: 'FlameX Intelligence at the AOU AI Product Hackathon',
    date: '2026-08-03',
    summary:
      'At the Entrepreneurship & AI Product Development Hackathon, our team built FlameX Intelligence, an AI-powered fire detection and emergency response platform.',
    content: `Glad to present our work from the Entrepreneurship & AI Product Development Hackathon at Arab Open University - Lebanon, organized by Techlarious.

Through hands-on workshops covering design thinking, user journey mapping, rapid prototyping, and specification engineering, our team built FlameX Intelligence: an AI-powered smart fire detection and emergency response platform designed to help prevent disasters before they happen.

Built during the hackathon with no-code platforms, it combines AI-powered fire risk analysis, live camera monitoring, smoke, heat, gas, and electricity sensors, real-time emergency alerts, an analytics dashboard, and a mobile app, for faster detection and rapid emergency response.

Grateful for the experience and the collaboration with my teammates!`,
    images: [
      '/updates/flamex-intelligence-hackathon/1.jpg',
      '/updates/flamex-intelligence-hackathon/2.jpg',
      '/updates/flamex-intelligence-hackathon/3.jpg',
      '/updates/flamex-intelligence-hackathon/4.jpg',
    ],
    tags: ['Hackathon', 'AI', 'Product'],
  },
  {
    slug: 'react-native-to-web-on-aws',
    title: 'From a React Native app to a production web platform on AWS',
    date: '2026-06-12',
    summary:
      'A client wanted their mobile app on the web too. Turning a React Native app into a deployed, HTTPS-secured web platform on AWS meant rethinking how it runs, builds, and ships.',
    content: `A few months ago, I built a React Native app with a focus on delivering a solid mobile experience. At that time, it felt like a complete product.

Later, the direction changed: the client specifically wanted the app to be available on the web as well.

That request turned into a full technical challenge: taking a mobile-first React Native app and transforming it into a production-ready web application. It wasn't just a "conversion". It meant rethinking how the app runs, builds, and deploys in a web environment.

Bringing React Native to the web
- AWS EC2 (Ubuntu server) for hosting
- Nginx reverse proxy for routing and SPA handling
- GoDaddy domain + DNS configuration
- HTTPS using Let's Encrypt (Certbot)
- S3 + CloudFront for static assets

🔥 Challenges I faced
This part was the most time-consuming and rewarding:
- EC2 setup and SSH configuration
- Nginx SPA routing issues
- HTTP vs HTTPS mixed content errors
- SSL setup and renewal troubleshooting
- AWS security group configuration (ports 80/443/5000)
- API routing between frontend, backend, and CloudFront
- CORS issues across services
- Deployment syncing using rsync and dist management

Each issue required a different layer of the system to be adjusted, not just a quick fix.

💡 Key takeaway
Being a developer is not just about writing code. It's about being able to take a working application and make it production-ready: stable, secure, deployed, and usable in a real-world environment. That includes architecture, deployment, networking, and understanding how all parts of the system connect.

Final result: a fully deployed, HTTPS-secured web application with a custom domain, backend integration, and cloud asset delivery, now live for the client on the web as well.

Stack: React Native (converted to web) for the frontend, Flask (Python) for the backend, and MySQL as the database.`,
    images: [
      '/updates/react-native-to-web-on-aws/1.jpg',
    ],
    tags: ['AWS', 'DevOps', 'React Native', 'Flask'],
  },
  {
    slug: 'red-alert-2-engineering',
    title: 'How Command & Conquer: Red Alert 2 tricked computers',
    date: '2026-04-22',
    summary:
      "Red Alert 2 didn't rely on powerful hardware, it relied on smart engineering: object-oriented design and deterministic lockstep networking.",
    content: `Red Alert 2 didn't rely on powerful hardware, it relied on smart engineering. The game made computers feel like they were running something complex, while actually using highly efficient design techniques.

⚙️ Object-Oriented Programming (OOP)
The game was built in C++ using OOP. Instead of coding everything from scratch, developers organized the game into reusable classes:
- Unit → soldiers, tanks
- Building → factories, power plants
- Weapon → guns, missiles

Each class has attributes (health, speed, damage) and functions (move, attack, defend).

OOP also enables inheritance, which reduces duplication: a base class Vehicle, a child class Tank, and an extended class HeavyTank. A HeavyTank inherits everything from Tank, with added enhancements like increased health.

Why this matters: less repeated code, lower memory usage, and easier updates. Instead of storing everything separately, the game reuses structures, saving both RAM and processing power.

🧠 Deterministic simulation (lockstep networking)
One of the smartest tricks behind Red Alert 2. Instead of constantly sending full game data over the network, the game only sends player inputs.

Every computer runs the exact same simulation. Players send simple commands like "Move tank to X" or "Attack enemy". Because the system is deterministic, the same inputs always produce the same results.

Example: Player A clicks "Move tank forward" → the command is sent to Player B → both computers simulate the action locally. Both players see the same outcome, without heavy data transfer.

Why this is powerful: extremely low network usage, it works even on slow connections, and it avoids the CPU cost of syncing full game states.

Great performance isn't always about stronger hardware. It's about smarter design.`,
    images: [
      '/updates/red-alert-2-engineering/1.jpg',
    ],
    tags: ['Software Design', 'Networking', 'C++'],
  },
  {
    slug: 'think-before-you-code',
    title: 'Think → Discuss → Model → Then code',
    date: '2026-04-07',
    summary:
      "Projects rarely fail because of bad code. They fail because of unclear thinking: the wrong persona, an undefined problem, and misunderstood use cases.",
    content: `From my past working experience, I've seen projects fail or completely lose their identity not because of bad code, but because of unclear thinking.

The biggest issues:
- Not choosing the right persona
- Not clearly defining the problem
- Not understanding the real use cases

When these are missing, everything that follows becomes unstable. The product becomes confusing. Marketing doesn't know who to target. Sales struggles to convert. The system grows without direction.

As software engineers, our responsibility is not just to write code or design architecture. It's to fully understand the problem, the users, the business rules, and the complete solution.

In my Software Engineering Specialization bootcamp at Techlarious, we are learning that before writing a single line of code, we must:
- Understand the problem deeply and identify who we are building for (personas)
- Define what they actually need (use cases)
- Structure the system through domain modeling (subdomains, entities, relationships)

It's not just about building features, it's about building the right system for the right people.

✨ Clarity at the beginning saves everything later.`,
    images: [],
    tags: ['System Design', 'Product Thinking', 'Learning'],
  },
  {
    slug: 'closing-the-boxmind-chapter',
    title: 'Closing my chapter at boxMind.ai',
    date: '2026-03-30',
    summary:
      "After three years as the first employee at boxMind.ai, where I built the backend from the ground up, I'm looking ahead to what's next.",
    content: `After three years as the first employee at boxMind.ai, I'm closing this chapter and looking ahead to what's next.

I joined the company in its early days and worked closely with the AI team. As the primary backend engineer, I built the backend from the ground up, including the initial database design, the first API, and the project structure and model patterns that helped shape the product's foundation.

I'm proud of what I built, the challenges I took on, and the growth that came with the journey.

Due to the current situation in the region, the company underwent changes that affected my role, along with those of other team members.

I'm grateful for the experience and fully focused on new opportunities where I can continue building meaningful systems and contributing at a high level.`,
    images: [],
    tags: ['Career', 'Backend'],
  },
  {
    slug: 'postman-isnt-a-browser',
    title: "Postman isn't a browser",
    date: '2025-12-12',
    summary:
      'Your API works perfectly in Postman, then breaks the moment the frontend calls it. Here is why, and why you should always test with a real frontend.',
    content: `Backend devs, be honest… this has happened to you at least once:

You spend hours building an API. Everything's clean, well-structured, documented. You fire up Postman, run through all the endpoints, and it works perfectly.

Then you hand it to the frontend team and… nothing works. Complete disaster.

So you go back and triple-check everything: headers, request body, auth tokens, endpoints. Everything SHOULD work. But it doesn't.

Here's what most people don't realize: Postman isn't a browser. What runs flawlessly in Postman can completely break in production because:
- Browsers actually enforce CORS (Postman just ignores it)
- Security policies block certain headers that Postman happily sends
- The JSON structure from a real frontend might not match your test exactly
- Middleware acts differently when hit by actual client requests
- Cookies, sessions, caching… browsers have their own rules

The takeaway: testing only in Postman means you're missing half the picture. Always validate your API with a real frontend environment before calling it done.

Your frontend devs will actually like you for it.`,
    images: [
      '/updates/postman-isnt-a-browser/1.jpg',
    ],
    tags: ['Backend', 'APIs', 'Debugging'],
  },
  {
    slug: 'layered-security-middleware',
    title: 'Building layered security with middleware',
    date: '2025-11-05',
    summary:
      'Two projects, two access-control challenges: fixed roles in one, dynamic custom roles in the other. Both solved with purpose-built middleware guards.',
    content: `I once faced two very different access control challenges.

One system was structured: fixed roles, clear boundaries.
Another was dynamic: custom roles with flexible, predefined permissions.

Two projects, two approaches, both solved with purpose-built middleware.

I put together a short presentation on how each guard was designed and why.`,
    images: [
      '/updates/layered-security-middleware/1.png',
      '/updates/layered-security-middleware/2.png',
      '/updates/layered-security-middleware/3.png',
      '/updates/layered-security-middleware/4.png',
      '/updates/layered-security-middleware/5.png',
    ],
    tags: ['Security', 'Backend', 'Architecture'],
  },
  {
    slug: 'devfest-2025-with-techlarious',
    title: 'DevFest 2025 with Techlarious and GDG Coast Lebanon',
    date: '2025-10-29',
    summary:
      'Proud to be part of Techlarious at DevFest 2025, organized by Google Developer Groups Coast Lebanon at the Lebanese American University.',
    content: `Proud to be part of Techlarious at DevFest with Google Developer Groups - GDG Coast Lebanon, hosted at the Lebanese American University.

It's always a pleasure to see familiar faces (friends, past colleagues, and inspiring people who have had an impact on my career) all gathered in one place, on a day full of tech talks, learning, and meaningful discussions.

Grateful for the connections and the opportunity to contribute to the community, and thanks to Nisrine Bou Ghannam for an inspiring collaboration!`,
    images: [
      '/updates/devfest-2025-with-techlarious/1.jpg',
      '/updates/devfest-2025-with-techlarious/2.jpg',
      '/updates/devfest-2025-with-techlarious/3.jpg',
      '/updates/devfest-2025-with-techlarious/4.jpg',
    ],
    tags: ['Event', 'Community'],
  },
  {
    slug: 'next-gen-ai-summit-naples',
    title: 'Stumbling upon the Next Gen AI Summit in Naples',
    date: '2025-10-20',
    summary:
      'During a visit to Naples, I found the Next Gen AI Summit: futuristic domes across Piazza San Carlo where students explored hands-on AI in education.',
    content: `During my recent visit to Naples, Italy, I stumbled upon the Next Gen AI Summit (Oct 2025), an international event reimagining how artificial intelligence transforms education.

Across Piazza San Carlo, small futuristic domes served as AI labs, where students explored hands-on use cases:
🎨 AI in Imagination: turning ideas into visuals and sounds through generative models
⚙️ AI in Motion: translating movement into art and data for STEM learning
📚 AI in Class: interactive lessons where teachers used AI to personalize learning
🎮 AI in Action: robotics and gamified learning powered by intelligent feedback loops

Each installation showcased how generative AI can inspire creativity, inclusivity, and critical thinking in schools, not as a distant concept, but as a lived experience.

At boxMind.ai, we share the same vision. The boxMind Academy platform teaches students how to use and create with generative AI. Through hands-on projects, they learn how AI can generate art, music, stories, and designs, gaining both creative and technical skills.

Seeing the Naples summit firsthand reminded me that education's future is already here, and it's beautifully interactive, imaginative, and human-centered.`,
    images: [
      '/updates/next-gen-ai-summit-naples/1.jpg',
      '/updates/next-gen-ai-summit-naples/2.jpg',
      '/updates/next-gen-ai-summit-naples/3.jpg',
    ],
    tags: ['AI', 'Education', 'Event'],
  },
  {
    slug: 'the-healthy-commit',
    title: 'The Healthy Commit at AOU with Techlarious',
    date: '2025-07-20',
    summary:
      'A day on the SDLC, CI/CD, web security, AI, and the path from junior to senior, with an inspiring panel of experts at Arab Open University.',
    content: `It was a great event today at AOU with Techlarious academy.

We discussed a lot of concepts related to the Software Development Life Cycle (SDLC), the importance of automated CI/CD, web vulnerabilities and security, the role of AI, and the roadmap from junior to mid-level, senior, and team leadership.

We heard many inspiring stories and experiences from the experts: Sam Shouman, MongoDB Champion Elie Hannouch, Mhamad El-Itawi, Mustafa Almheimid, and the amazing Nisrine Bou Ghannam, who always brings us together.

As always, if you want to be among the best, you must learn from the best.

Special thanks to our university, the AOU Tech Fusion Club, Dr. Eng. Ahmad B. Mikati, and to the academy that shaped my career, Techlarious, for organizing this great event.`,
    images: [
      '/updates/the-healthy-commit/1.jpg',
      '/updates/the-healthy-commit/2.jpg',
      '/updates/the-healthy-commit/3.jpg',
      '/updates/the-healthy-commit/4.jpg',
      '/updates/the-healthy-commit/5.jpg',
      '/updates/the-healthy-commit/6.jpg',
      '/updates/the-healthy-commit/7.jpg',
      '/updates/the-healthy-commit/8.jpg',
    ],
    tags: ['Event', 'Community', 'Learning'],
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
