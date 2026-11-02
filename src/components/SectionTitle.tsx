// The title at the top of each home section, so they all look the same:
// a small accent label (the section's name, same as in the navbar), then a short title
// whose last words are in the accent gradient. "action" is an optional link on the right (like "See all →").
// It's an <h2>: the page has a single <h1>, your name in the hero.

import type { ReactNode } from 'react'
import GradientText from './GradientText.tsx'

interface SectionTitleProps {
  label: string // e.g. 'Projects'
  title: string // the start of the title, e.g. "Things I've"
  accent?: string // the end, in the gradient, e.g. 'built'
  action?: ReactNode
}

function SectionTitle({ label, title, accent, action }: SectionTitleProps) {
  return (
    <header className="section-title">
      <div>
        <p className="eyebrow">{label}</p>
        <h2>
          {title}
          {accent && (
            <>
              {' '}
              <span className="section-title__accent">
                <GradientText text={accent} />
              </span>
            </>
          )}
        </h2>
      </div>
      {action}
    </header>
  )
}

export default SectionTitle
