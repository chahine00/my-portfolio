// Degrees, bootcamps/certificates and languages. Shown in the Education section.

export interface EducationItem {
  title: string
  place: string
  year: string
  // The school's or organizer's logo in /public, e.g. '/logos/aou.png'.
  // Without one, the initials of "place" are shown in a badge instead.
  logo?: string
}

export const degrees: EducationItem[] = [
  { title: 'BSc Computer Science', place: 'Arab Open University', year: '2018 – 2022', logo: '/logos/aou.png' },
  { title: 'Bachelor of Business Management', place: 'Arab Open University', year: '2010 – 2016', logo: '/logos/aou.png' },
]

// Add certificates here too, e.g. { title: 'AWS Cloud Practitioner', place: 'Amazon', year: '2026' }
export const certificates: EducationItem[] = [
  { title: 'MERN Stack Bootcamp', place: 'Techlarious', year: '2023' },
  { title: 'Foundations of Computer Science', place: 'SE Factory', year: '2022' },
]

// level: 3 = native, 2 = fluent, 1 = basic. It fills that many of the three small bars.
export interface Language {
  name: string
  level: 1 | 2 | 3
  label: string
}

export const languages: Language[] = [
  { name: 'Arabic', level: 3, label: 'Native' },
  { name: 'English', level: 2, label: 'Conversational' },
  { name: 'French', level: 1, label: 'Basic' },
]
