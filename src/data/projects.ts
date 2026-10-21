// This file holds only DATA (no components), which is why it ends in .ts and not .tsx.
// .tsx is only needed when a file contains JSX.

// An "interface" is a TypeScript feature that describes the SHAPE of an object:
// which properties it has, and what type each one is.
// If you forget a property or use the wrong type, TypeScript shows an error.
export interface Project {
  id: number
  title: string
  description: string
  tech: string[] // string[] means "an array of strings"
  githubUrl?: string // the ? means this property is OPTIONAL (you can leave it out)
  liveUrl?: string
}

// "Project[]" means "an array of Project objects".
// To show a new project on the website, just add a new object to this list.
export const projects: Project[] = [
  {
    id: 1,
    title: 'Portfolio Website',
    description: 'My personal portfolio built with React, TypeScript and Vite.',
    tech: ['React', 'TypeScript', 'Vite'],
    githubUrl: 'https://github.com/',
  },
  {
    id: 2,
    title: 'Project Two',
    description: 'A short description of another project.',
    tech: ['React', 'Node.js'],
    // No githubUrl or liveUrl here. That's allowed because they are optional (?).
  },
]
