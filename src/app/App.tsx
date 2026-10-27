// App is the TOP-LEVEL component. It doesn't show much by itself —
// its job is to put all the other components together in order.

// To use a component from another file, import it first.
import { Navigate, Route, Routes, useParams } from 'react-router'
import Navbar from '../components/Navbar.tsx'
import BackgroundGlow from '../components/BackgroundGlow.tsx'
import Footer from '../components/Footer.tsx'
import BackToTop from '../components/BackToTop.tsx'
import HomePage from '../features/home/HomePage.tsx'
import UpdatesPage from '../features/updates/UpdatesPage.tsx'
import UpdatePost from '../features/updates/UpdatePost.tsx'
import ProjectPage from '../features/projects/ProjectPage.tsx'
import NotFound from '../features/not-found/NotFound.tsx'

// Sends an old post link (/updates/<slug>) to the same post at its new address (/blog/<slug>).
function OldPostRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/blog/${slug}`} replace />
}

// A component is just a function that returns JSX (HTML-like code).
// Component names must start with a Capital letter.
function App() {
  return (
    // <> ... </> is a "Fragment": an invisible wrapper.
    // A component must return ONE parent element, and a Fragment lets us
    // group several elements without adding an extra <div> to the page.
    <>
      <BackgroundGlow />
      <Navbar />
      <main>
        {/*
          ROUTES: show a different page depending on the URL.
          "/"        → the one-page home with all the sections
          "/blog"    → the Blog page (all posts)
          "/blog/:slug" → one post. ":slug" is a placeholder for any post name,
                          e.g. /blog/postman-isnt-a-browser
          "/updates…" → the blog's old address. Old shared links are sent on to /blog.
          "/projects/:slug" → one project's page, e.g. /projects/portfolio-website
          To add a new page: create its component, add a <Route> here,
          and add a link to it in Navbar.tsx.
          The last route ("*") catches any unknown URL and shows a "Page not found" page.
        */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<UpdatesPage />} />
          <Route path="/blog/:slug" element={<UpdatePost />} />
          <Route path="/updates" element={<Navigate to="/blog" replace />} />
          <Route path="/updates/:slug" element={<OldPostRedirect />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {/* Outside <Routes>, so it shows on every page. */}
      <BackToTop />
    </>
  )
}

// "export default" makes this component available to other files (main.tsx imports it).
export default App
