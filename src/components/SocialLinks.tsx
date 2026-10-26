// A row of round icon links (email, LinkedIn, GitHub), used in the hero and the footer.
// It shows every contact in src/data/contact.ts that has an "icon".

import { contacts } from '../data/contact.ts'
import Icon from './Icon.tsx'

function SocialLinks() {
  return (
    <ul className="social-links">
      {contacts.map(
        (contact) =>
          contact.icon && (
            <li key={contact.label}>
              <a
                href={contact.href}
                aria-label={contact.label}
                title={contact.label}
                {...(contact.href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}
              >
                <Icon name={contact.icon} />
              </a>
            </li>
          ),
      )}
    </ul>
  )
}

export default SocialLinks
