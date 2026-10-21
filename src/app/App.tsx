// App is the TOP-LEVEL component. It doesn't show much by itself —
// its job is to put all the other components together in order.

// To use a component from another file, import it first.
import Navbar from '../components/Navbar.tsx'
import Footer from '../components/Footer.tsx'
import Hero from '../features/home/Hero.tsx'
import About from '../features/about/About.tsx'
import Projects from '../features/projects/Projects.tsx'
import Skills from '../features/skills/Skills.tsx'
import Contact from '../features/contact/Contact.tsx'

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
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

// "export default" makes this component available to other files (main.tsx imports it).
export default App
