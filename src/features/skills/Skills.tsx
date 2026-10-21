// The "Skills" section: shows each skill as a small tag.

// An array of strings. Add or remove skills here and the page updates automatically.
const skills = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Git']

function Skills() {
  return (
    <section id="skills" className="section">
      <h2>Skills</h2>
      <ul className="tags">
        {/* Same pattern as in Navbar: .map() turns each array item into an <li>.
            Each skill name is unique, so we can use it as the key. */}
        {skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </section>
  )
}

export default Skills
