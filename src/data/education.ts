// Degrees, bootcamps/certificates and languages. Shown in the Education section.

export interface EducationItem {
  title: string
  place: string
  year: string
}

export const degrees: EducationItem[] = [
  { title: 'BSc Computer Science', place: 'Arab Open University', year: '2018 – 2022' },
  { title: 'Bachelor of Business Management', place: 'Arab Open University', year: '2010 – 2016' },
]

// Add certificates here too, e.g. { title: 'AWS Cloud Practitioner', place: 'Amazon', year: '2026' }
export const certificates: EducationItem[] = [
  { title: 'MERN Stack Bootcamp', place: 'Techlarious', year: '2023' },
  { title: 'Foundations of Computer Science', place: 'SE Factory', year: '2022' },
]

export const languages = ['Arabic (native)', 'English', 'French (basic)']
