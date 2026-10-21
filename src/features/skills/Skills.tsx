
const skillGroups = [
  {
    category: 'Programming Languages',
    skills: [
      'Python',
      'JavaScript',
      'C#',
      'PHP (Familiar)',
    ],
  },
  {
    category: 'Backend Development',
    skills: [
      'Flask',
      'FastAPI',
      'Django',
      'Node.js',
      'Express.js',
      'ASP.NET Core',
      'Laravel (Familiar)',
    ],
  },
  {
    category: 'Frontend Development',
    skills: [
      'React.js',
      'Angular',
      'HTML',
      'CSS',
    ],
  },
  {
    category: 'Mobile Development',
    skills: [
      'React Native',
      'Xamarin',
      'Mobile UI Development',
      'Mobile App Testing',
      'Google Play Deployment',
    ],
  },
  {
    category: 'AI & LLM Engineering',
    skills: [
      'LLMs',
      'vLLM',
      'Prompt Engineering',
      'Embeddings',
      'LangChain',
      'AI Agents',
      'Chains',
      'RAG Pipelines',
    ],
  },
  {
    category: 'AI Automation & Orchestration',
    skills: [
      'n8n',
      'Apache Airflow',
      'AI Workflow Automation',
    ],
  },
  {
    category: 'Databases & Data Storage',
    skills: [
      'MySQL',
      'MongoDB',
      'DynamoDB',
      'Couchbase',
      'Vector Databases',
      'Milvus',
      'Database Modeling',
      'Query Optimization',
    ],
  },
  {
    category: 'Cloud & DevOps',
    skills: [
      'AWS Lambda',
      'Amazon API Gateway',
      'Amazon EC2',
      'Docker',
      'Linux',
      'Nginx',
      'Apache',
      'CI/CD',
      'Deployment & Monitoring',
    ],
  },
  {
    category: 'API Development & Security',
    skills: [
      'REST APIs',
      'JWT',
      'OAuth2',
      'RBAC',
      'Rate Limiting',
      'XSS/CSRF Protection',
      'Authentication & Authorization',
    ],
  },
  {
    category: 'Real-Time Systems',
    skills: [
      'WebSockets',
      'Socket.IO',
    ],
  },
  {
    category: 'Developer Tools & Collaboration',
    skills: [
      'Git',
      'GitHub',
      'Jira',
      'ClickUp',
      'Agile/Scrum',
    ],
  },
];

function Skills() {
  return (
    <section id="skills" className="section">
      <h1>Technical Skills</h1>

      <div className="skill-groups">
        {skillGroups.map((group) => (
          <div
            className="skill-group"
            key={group.category}
          >
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
  );
}

export default Skills;
