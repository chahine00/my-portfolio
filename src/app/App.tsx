// App is the TOP-LEVEL component. It doesn't show much by itself —
// its job is to put all the other components together in order.

// To use a component from another file, import it first.
import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router'
import { recordVisit, rememberHomeSection } from '../utils/pageHistory.ts'
import Navbar from '../components/Navbar.tsx'
import BackgroundGlow from '../components/BackgroundGlow.tsx'
import Footer from '../components/Footer.tsx'
import BackToTop from '../components/BackToTop.tsx'
import ScrollProgress from '../components/ScrollProgress.tsx'
import Spotlight from '../components/Spotlight.tsx'
import HomePage from '../features/home/HomePage.tsx'
// The home page loads with the app; every other page is its own small file, downloaded only when
// it's opened (React.lazy), so the first visit to the home page downloads less.
const UpdatesPage = lazy(() => import('../features/updates/UpdatesPage.tsx'))
const UpdatePost = lazy(() => import('../features/updates/UpdatePost.tsx'))
const ProjectPage = lazy(() => import('../features/projects/ProjectPage.tsx'))
const BackgroundPage = lazy(() => import('../features/background/BackgroundPage.tsx'))
const StudioPage = lazy(() => import('../features/studio/StudioPage.tsx'))
const NotFound = lazy(() => import('../features/not-found/NotFound.tsx'))

// Sends an old post link (/updates/<slug>) to the same post at its new address (/blog/<slug>).
function OldPostRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/blog/${slug}`} replace />
}

// A component is just a function that returns JSX (HTML-like code).
// Component names must start with a Capital letter.
function App() {
  // Each page gets a short fade-in when you move to it (the wrapper below is rebuilt per address;
  // a #section or ?search change on the same page doesn't count).
  const { pathname, search } = useLocation()
  // Every "Back to …" link returns to the page you were really on before (src/utils/pageHistory.ts):
  // record each page, and on the home page, which section was on screen when a link took you away.
  useEffect(() => recordVisit(pathname, search), [pathname, search])
  useEffect(() => {
    if (pathname !== '/') return
    function onClick(event: MouseEvent) {
      if (event.target instanceof Element && event.target.closest('a[href]')) rememberHomeSection()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [pathname])

  return (
    // <> ... </> is a "Fragment": an invisible wrapper.
    // A component must return ONE parent element, and a Fragment lets us
    // group several elements without adding an extra <div> to the page.
    <>
      <BackgroundGlow />
      <ScrollProgress />
      <Spotlight />
      <Navbar />
      <main>
        {/*
          ROUTES: show a different page depending on the URL.
          "/"        → the one-page home with all the sections
          "/blog"    → the Blog page (all posts)
          "/blog/:slug" → one post. ":slug" is a placeholder for any post name,
                          e.g. /blog/postman-isnt-a-browser
          "/updates…" → the blog's old address. Old shared links are sent on to /blog.
          "/projects/:slug" → one project's page, e.g. /projects/cinetwork
          "/background" → the founder's full background: experience, capabilities, education
          "/studio" → Axihex's identity, purpose and vision in full ("Studio" in the navbar)
          To add a new page: create its component, add a <Route> here,
          and add a link to it in Navbar.tsx.
          The last route ("*") catches any unknown URL and shows a "Page not found" page.
        */}
        <div key={pathname} className="page-transition">
          {/* While a page's file downloads (a moment, the first time): an empty space of the page's height. */}
          <Suspense fallback={<div className="page-loading" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<UpdatesPage />} />
            <Route path="/blog/:slug" element={<UpdatePost />} />
            <Route path="/updates" element={<Navigate to="/blog" replace />} />
            <Route path="/updates/:slug" element={<OldPostRedirect />} />
            <Route path="/projects/:slug" element={<ProjectPage />} />
            <Route path="/background" element={<BackgroundPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </div>
      </main>
      <Footer />
      {/* Outside <Routes>, so it shows on every page. */}
      <BackToTop />
    </>
  )
}

// "export default" makes this component available to other files (main.tsx imports it).
export default App
