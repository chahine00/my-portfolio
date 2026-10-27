// The "Skills" section: a SHORT core stack, not everything you've ever used.
// Keep it focused (about 4 groups, 15–20 skills). The projects are where you prove them.
// Put the groups in the order that matches the jobs you want: the most important first.

const coreStack = [
  {
    category: 'Backend',
    skills: ['Python', 'FastAPI', 'Flask', 'Django', 'C# / ASP.NET Core'],
  },
  {
    category: 'Frontend & Mobile',
    skills: ['JavaScript', 'React', 'React Native', 'Angular'],
  },
  {
    category: 'Data & Cloud',
    skills: ['SQL (MySQL)', 'NoSQL (MongoDB, DynamoDB, Couchbase)', 'AWS', 'Docker', 'CI/CD'],
  },
  {
    category: 'AI Integration',
    skills: ['LLMs', 'Prompt Engineering', 'RAG Pipelines', 'Milvus', 'LangChain', 'AI Agents'],
  },
]

// Shown as one quiet line under the core stack. Things you've used, but aren't your main pitch.
const alsoWorkedWith = [
  'Node.js',
  'Express.js',
  'Embeddings',
  'vLLM',
  'WebSockets / Socket.IO',
  'n8n',
  'Apache Airflow',
  'Nginx',
  'Linux',
  'JWT / OAuth2',
  'Xamarin',
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

      {/* .join(' · ') turns the array into one string with dots between the items. */}
      <p className="stack__also">
        <span>Also worked with:</span> {alsoWorkedWith.join(' · ')}
      </p>
    </section>
  )
}

export default Skills
