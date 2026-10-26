// Turns a path to a file in /public (like '/photo.jpg') into a path that works wherever
// the site is hosted. On GitHub Pages the site lives in a sub-folder
// (chahine00.github.io/my-portfolio/), so '/photo.jpg' alone would point to the wrong place.
// import.meta.env.BASE_URL is that sub-folder ('/my-portfolio/'), set by "base" in vite.config.ts.

export function asset(path: string) {
  // Links to other websites (https://…) are left as they are.
  if (/^https?:\/\//.test(path)) return path
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
