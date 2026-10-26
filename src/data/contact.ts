// Your contact details, shown in the Contact section.
// To add, remove or reorder a contact, just edit this list.

export interface ContactLink {
  label: string // what visitors see, e.g. "Phone (Mobile)"
  value: string // the text shown, e.g. your number or email
  href: string // where clicking goes: "tel:", "mailto:" or a normal https:// link
  flag?: string // optional flag image from public/flags, shown before the value
  icon?: 'email' | 'linkedin' | 'github' // contacts with an icon also show in the hero and footer
}

export const contacts: ContactLink[] = [
  {
    label: 'Email',
    value: 'leb_ach@hotmail.com',
    href: 'mailto:leb_ach@hotmail.com',
    icon: 'email',
  },
  // tel: links open the phone app on mobile. Write the number with the
  // country code and no spaces in href, e.g. 'tel:+96170123456'.
  {
    label: 'Phone 1',
    value: '+961 71 994 614',
    href: 'tel:+96171994614',
    flag: '/flags/lb.svg',
  },
  {
    label: 'Phone 2',
    value: '+39 349 663 0786',
    href: 'tel:+393496630786',
    flag: '/flags/it.svg',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/chahine21',
    href: 'https://www.linkedin.com/in/chahine21/',
    icon: 'linkedin',
  },
  {
    label: 'GitHub',
    value: 'github.com/chahine00',
    href: 'https://github.com/chahine00',
    icon: 'github',
  },
]
