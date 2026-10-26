// App is the TOP-LEVEL component. It doesn't show much by itself —
// its job is to put all the other components together in order.

// To use a component from another file, import it first.
import { Route, Routes } from 'react-router'
import Navbar from '../components/Navbar.tsx'
import Footer from '../components/Footer.tsx'
import BackToTop from '../components/BackToTop.tsx'
import HomePage from '../features/home/HomePage.tsx'
import UpdatesPage from '../features/updates/UpdatesPage.tsx'
import UpdatePost from '../features/updates/UpdatePost.tsx'
import ProjectPage from '../features/projects/ProjectPage.tsx'
import NotFound from '../features/not-found/NotFound.tsx'

// A component is just a function that returns JSX (HTML-like code).
// Component names must start with a Capital letter.
function App() {
  return (
    // <> ... </> is a "Fragment": an invisible wrapper.
    // A component must return ONE parent element, and a Fragment lets us
    // group several elements without adding an extra <div> to the page.
    <>
      <Navbar />
      <main>
        {/*
          ROUTES: show a different page depending on the URL.
          "/"        → the one-page home with all the sections
          "/updates" → the Updates page (all posts)
          "/updates/:slug" → one post. ":slug" is a placeholder for any post name,
                             e.g. /updates/example-project
          "/projects/:slug" → one project's page, e.g. /projects/portfolio-website
          To add a new page: create its component, add a <Route> here,
          and add a link to it in Navbar.tsx.
          The last route ("*") catches any unknown URL and shows a "Page not found" page.
        */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/updates/:slug" element={<UpdatePost />} />
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
