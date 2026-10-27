// The "Skills" section: a SHORT core stack, not everything you've ever used.
// Keep it focused (about 4 groups, 15–20 skills). The projects are where you prove them.
// Put the groups in the order that matches the jobs you want: the most important first.

const coreStack = [
  {
    category: 'Backend',
    skills: ['Python', 'FastAPI', 'Flask', 'REST APIs', 'JWT / OAuth2'],
  },
  {
    category: 'AI Integration',
    skills: ['LLMs', 'RAG Pipelines', 'Milvus', 'Prompt Engineering', 'AI Agents'],
  },
  {
    category: 'Data & Cloud',
    skills: ['SQL (MySQL)', 'Docker', 'AWS', 'Nginx', 'CI/CD'],
  },
  {
    category: 'Mobile',
    skills: ['React Native'],
  },
]

function Skills() {
  return (
    <section id="skills" className="section">
      <h1>Core Stack</h1>

      {/* One frame, one row per group: the group name on the left, its skills on the right. */}
      <div className="card stack">
        {coreStack.map((group) => (
          <div className="stack__row" key={group.category}>
            <h3>{group.category}</h3>
            <ul className="tags">
              {group.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills
