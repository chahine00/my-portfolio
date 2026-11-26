// The five core engineering capabilities (Web, Mobile, Backend, AI integration, Cloud): what Axihex
// is focused on. The products it builds can vary; this focus doesn't. Shown in the home page's
// Studio section and on the Studio page. Text: "capabilities" in src/data/identity.ts.

import { capabilities, capabilitiesPrinciple } from '../../data/identity.ts'
import Icon from '../../components/Icon.tsx'
import { useReveal } from '../../utils/useReveal.ts'

// hideTitle: the Studio page gives the section its own big title, so the small one is left out.
function Capabilities({ hideTitle = false }: { hideTitle?: boolean }) {
  const listRef = useReveal<HTMLUListElement>('.caps__item')

  return (
    <div className="studio__block caps">
      {!hideTitle && (
        <h3 className="studio__subtitle">
          {capabilitiesPrinciple.title} <span className="studio__subtitle-muted">{capabilitiesPrinciple.accent}</span>
        </h3>
      )}
      <ul className="caps__list" ref={listRef}>
        {capabilities.map((capability) => (
          <li key={capability.title} className="caps__item">
            <span className="caps__icon" aria-hidden="true">
              <Icon name={capability.icon} size={20} />
            </span>
            <strong>{capability.title}</strong>
            <span>{capability.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Capabilities
