// The five core engineering capabilities (Web, Mobile, Backend, AI integration, Cloud): what Axihex
// is focused on. The products it builds can vary; this focus doesn't. Shown in the home page's
// "What we build" (BuildSection.tsx, as a list beside the app's layers) and on the Studio page (as
// a row of tiles). Text: "capabilities" in src/data/identity.ts.

import { capabilities, capabilitiesPrinciple } from '../../data/identity.ts'
import Icon from '../../components/Icon.tsx'
import { useReveal } from '../../utils/useReveal.ts'

// hideTitle: the section gives it its own big title, so the small one is left out.
// variant: "grid", tiles in a row; "list", numbered rows, one under the other.
// lit / onPick (list only): which rows are highlighted, and a row pointed at, focused or tapped
// (BuildSection.tsx ties them to the app's layers beside the list).
interface CapabilitiesProps {
  hideTitle?: boolean
  variant?: 'grid' | 'list'
  lit?: (index: number) => boolean
  onPick?: (index: number) => void
}

function Capabilities({ hideTitle = false, variant = 'grid', lit, onPick }: CapabilitiesProps) {
  const listRef = useReveal<HTMLUListElement>('.caps__item')

  return (
    <div className={variant === 'list' ? 'caps caps--list' : 'studio__block caps'}>
      {!hideTitle && (
        <h3 className="studio__subtitle">
          {capabilitiesPrinciple.title} <span className="studio__subtitle-muted">{capabilitiesPrinciple.accent}</span>
        </h3>
      )}
      <ul className="caps__list" ref={listRef}>
        {capabilities.map((capability, i) => (
          <li
            key={capability.title}
            // Lit as an attribute, not a class: useReveal adds "is-visible" to the class list, and
            // changing className here would wipe it (the rows then vanished for good).
            className="caps__item"
            data-lit={lit?.(i) || undefined}
            {...(onPick && {
              tabIndex: 0,
              onPointerEnter: () => onPick(i),
              onFocus: () => onPick(i),
              onClick: () => onPick(i),
            })}
          >
            <span className="caps__icon" aria-hidden="true">
              <Icon name={capability.icon} size={20} />
            </span>
            <strong>{capability.title}</strong>
            <span>{capability.text}</span>
            {variant === 'list' && (
              <span className="caps__num" aria-hidden="true">
                0{i + 1}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Capabilities
