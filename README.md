# My Portfolio

A personal portfolio website built with **React**, **TypeScript** and **Vite**.
It's also a learning project: every file has comments that explain the basics it uses.

## Running the project

```bash
npm install      # install dependencies (only needed once)
npm run dev      # start the dev server, then open the link it prints
npm run build    # check types and build the site for production
npm run lint     # check the code for common mistakes
```

While `npm run dev` is running, saving a file updates the browser right away.

## How the project is organized

```
index.html                  The single HTML page. It has an empty <div id="root">.
public/                     Files served as they are: photos, logos, the CV, icons.
scripts/make-thumbs.sh      Makes the small card photos (run it after adding photos).
apps-script/contact-form.gs The Google Apps Script that emails contact-form messages.
src/
  main.tsx                  Entry point: puts <App /> inside #root.
  app/App.tsx               The pages and their addresses (routes).
  components/               Pieces shared by the whole site (Navbar, Footer, Icon,
                            the avatar guide, the robots, the photo gallery…).
  features/                 One folder per section or page:
    home/                   The home page and its top part (Hero).
    about/, experience/, skills/, education/, contact/
    studio/                 The /studio page: Axihex's identity, purpose and vision.
    projects/               The project list, its cards, and each project's page.
    updates/                The blog: preview on the home page, list page, post page.
    not-found/              The "page not found" page.
  data/                     The content (projects, jobs, posts, guide tips…): plain data, no JSX.
  services/api.ts           Code that talks to a server (sends the contact form).
  utils/                    Small helpers (public file paths, reveal-on-scroll).
  styles/global.css         All the styles.
```

## Hosting (axihex.com on EC2, nginx)

`npm run build` makes the `dist` folder: copy its contents to the server's web root.
Besides `index.html`, it has one HTML file per page (`blog.html`, `blog/<slug>.html`,
`projects/<slug>.html`, `background.html`), each with that page's title, description, link preview
and text (see `scripts/seo-plugin.ts` and `scripts/prerender.ts`), plus `404.html`, `sitemap.xml`
and `robots.txt`.

nginx needs to try those files before falling back to the app:

```nginx
location / {
    try_files $uri $uri.html /index.html;
}

# Files with a hash in their name never change: let browsers keep them for a year.
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

Don't add `$uri/` to `try_files`: project photos live in `projects/<slug>/`, a folder with the
same name as the project's page, and nginx would send the page there instead.
After changing the config: `sudo nginx -t && sudo systemctl reload nginx`.

## Which file teaches what

Read them roughly in this order, from simplest to most advanced:

| File | Concepts |
| --- | --- |
| `Hero.tsx`, `About.tsx` | A component is a function that returns JSX. `className`, `export default`. |
| `Footer.tsx` | Using a JavaScript variable inside JSX with `{ }`. |
| `App.tsx` | Importing components and using them like HTML tags. Fragments `<> </>`. |
| `Navbar.tsx`, `Skills.tsx` | Rendering a list with `.map()` and the `key` prop. |
| `data/projects.ts` | TypeScript `interface`, optional properties `?`, array types `Project[]`. |
| `Projects.tsx`, `ProjectCard.tsx` | **Props**: passing data from a parent to a child component. Conditional rendering with `&&`. |
| `Contact.tsx` | **State** with `useState`, controlled inputs, form events, `async`/`await`, `try`/`catch`, union types. |
| `services/api.ts` | `fetch()`, Promises, `async`/`await`, error handling. |

## Practice exercises

Try these yourself, using the existing files as examples:

1. **Easy:** Write your real introduction in `About.tsx` and add your own skills in `Skills.tsx`.
2. **Easy:** Add a real project to `data/projects.ts` with a `liveUrl`. Check that the "Live demo" link shows up.
3. **Medium:** Move the skills array into `data/skills.ts` (like `projects.ts`) and import it in `Skills.tsx`.
4. **Harder:** Make a reusable `<Section id="..." title="...">` component in `components/` that uses the
   `children` prop, then use it in every section to remove the repeated `<section>` + `<h2>` code.
5. **Harder:** In `Projects.tsx`, add buttons for each technology (React, Node.js…) and use `useState` to
   show only the projects that use the selected technology. Hint: `projects.filter(...)`.
