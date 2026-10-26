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
src/
  main.tsx                  Entry point: puts <App /> inside #root.
  app/App.tsx               Puts all the sections together in order.
  components/               Pieces shared by the whole page (Navbar, Footer).
  features/                 One folder per page section:
    home/Hero.tsx
    about/About.tsx
    projects/Projects.tsx   The list of projects...
    projects/ProjectCard.tsx  ...and the card used for each one.
    skills/Skills.tsx
    contact/Contact.tsx     The contact form (uses state).
  data/projects.ts          Your project list (plain data, no JSX).
  services/api.ts           Code that talks to a server.
  styles/global.css         All the styles.
```

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
3. **Medium:** Add an `image?: string` property to the `Project` interface and show it in `ProjectCard.tsx`
   only when it exists (look at how `githubUrl` is handled).
4. **Medium:** Create a new section, for example `features/experience/Experience.tsx`, add it to `App.tsx`,
   and add a link to it in the `links` array in `Navbar.tsx`.
5. **Medium:** Move the skills array into `data/skills.ts` (like `projects.ts`) and import it in `Skills.tsx`.
6. **Harder:** Make a reusable `<Section id="..." title="...">` component in `components/` that uses the
   `children` prop, then use it in every section to remove the repeated `<section>` + `<h2>` code.
7. **Harder:** In `Projects.tsx`, add buttons for each technology (React, Node.js…) and use `useState` to
   show only the projects that use the selected technology. Hint: `projects.filter(...)`.
8. **Harder:** Add a dark/light mode toggle button in the Navbar using `useState`.
