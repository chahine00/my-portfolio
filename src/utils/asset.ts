// Turns a path to a file in /public (like '/photo.jpg') into a path that works wherever
// the site is hosted. On GitHub Pages the site lives in a sub-folder
// (chahine00.github.io/my-portfolio/), so '/photo.jpg' alone would point to the wrong place.
// import.meta.env.BASE_URL is that sub-folder ('/my-portfolio/'), set by "base" in vite.config.ts.

export function asset(path: string) {
  // Links to other websites (https://…) are left as they are.
  if (/^https?:\/\//.test(path)) return path
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}

// The small copy of a photo for cards, made by scripts/make-thumbs.sh:
// '/updates/my-post/1.jpg' → '/updates/my-post/thumbs/1.jpg'.
// SVGs are already small, so they're used as they are.
export function thumb(path: string) {
  if (path.endsWith('.svg') || /^https?:\/\//.test(path)) return asset(path)
  return asset(path.replace(/\/([^/]+)$/, '/thumbs/$1'))
}

// If a thumbnail doesn't exist yet (the script wasn't run after adding a photo),
// the <img> falls back to the full-size photo instead of showing a broken image.
export function fallbackTo(path: string) {
  return (event: { currentTarget: HTMLImageElement }) => {
    const full = asset(path)
    if (!event.currentTarget.src.endsWith(full)) event.currentTarget.src = full
  }
}
