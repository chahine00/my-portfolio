// The big welcome section at the top of the page.
// This is the simplest kind of component: no data and no state, it just returns JSX.

function Hero() {
  return (
    // id="home" lets the navbar link href="#home" scroll here.
    // You can give an element several CSS classes by separating them with a space.
    <section id="home" className="section hero">
      <h1>Hi, I'm Ali Chahine</h1>
      <p>I build modern, responsive web applications.</p>
      <a href="#projects" className="button">
        View my work
      </a>
    </section>
  )
}

export default Hero
