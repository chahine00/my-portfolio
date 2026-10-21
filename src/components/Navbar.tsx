// The navigation bar at the top of the page.

// Instead of writing four <li> elements by hand, we keep the links in an array.
// To add a new link, you only need to add one line here.
// Each "href" starts with # and matches the id="" of a <section> on the page,
// so clicking it scrolls to that section.
const links = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]

function Navbar() {
  return (
    // In JSX we write "className" instead of "class" (class is a reserved word in JavaScript).
    <header className="navbar">
      <a href="#home" className="navbar__brand">
        Ali Chahine
      </a>
      <nav>
        <ul className="navbar__links">
          {/*
            Curly braces { } let you write JavaScript inside JSX.
            .map() goes through each item in the array and returns an <li> for it.
            React needs a unique "key" on each item in a list so it can keep track of them.
          */}
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
