// The rubber duck drawing, shared by the duck that walks around (RubberDuck.tsx) and the one that
// waits on the "<Welcome />" box after being sent home (Hero.tsx). It faces right.
// An <svg> works both in normal HTML and inside another SVG (there x, y, width and height place it).
// The colors and little animations (blinking, waddling…) are in global.css under "rubber duck".

import type { SVGProps } from 'react'

// facing="left" mirrors the whole drawing as one piece.
function DuckSprite({ facing = 'right', ...props }: SVGProps<SVGSVGElement> & { facing?: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...props}>
      <g transform={facing === 'left' ? 'translate(40 0) scale(-1 1)' : undefined}>
        <ellipse className="duck__shadow" cx="20" cy="38.5" rx="13" ry="1.5" />
        {/* Body, with a raised tail on the left */}
        <path className="duck__body" d="M5 22c-1-4 1-7 3-6 2 1 3 3 5 3h10c6 0 11 3 11 9 0 6-6 9-14 9S6 34 5 22z" />
        {/* Wing */}
        <path className="duck__wing" d="M12 26c3-2 9-2 12 1-2 4-9 5-12-1z" />
        {/* Head (it moves on its own when pecking) */}
        <g className="duck__head">
          <circle className="duck__body" cx="26" cy="13" r="8" />
          <path className="duck__beak" d="M32.5 13.5c3-1.5 6-1 6.5.5s-3 3-6.5 2.5z" />
          <circle className="duck__eye" cx="28.5" cy="11" r="1.4" />
        </g>
      </g>
    </svg>
  )
}

export default DuckSprite
