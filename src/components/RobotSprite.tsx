// The tiny robot drawing, shared by the robot out in the hero (HeroRobot.tsx) and the one patrolling
// the "<Welcome />" box (Hero.tsx). It faces right; its eyes sit toward the front of its visor.
// An <svg> works both in normal HTML and inside another SVG (there x, y, width and height place it).
// The colors (light and dark theme) and the robot moves are in global.css under "tiny robot":
// the parts below have classes so the CSS can move them (legs step, arms swing, eyes scan…).

import type { SVGProps } from 'react'

function RobotSprite(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...props}>
      <ellipse className="robot__shadow" cx="20" cy="38.6" rx="10" ry="1.4" />
      {/* The jet flame under it, only seen while it flies (and the scan beam from its eyes). */}
      <path className="robot__flame" d="M16.5 35 h7 l-1.6 4.5 l-1.9 -2 l-1.9 2 z" />
      <path className="robot__beam" d="M28 16 L40 30 L40 6 Z" />
      <g className="robot__legs">
        <rect className="robot__leg robot__leg--back" x="14" y="33" width="4" height="5" rx="1" />
        <rect className="robot__leg robot__leg--front" x="22" y="33" width="4" height="5" rx="1" />
      </g>
      <g className="robot__body">
        <rect className="robot__arm robot__arm--back" x="7.5" y="24.5" width="3" height="7.5" rx="1.5" />
        <rect className="robot__shell" x="11" y="23.5" width="18" height="10.5" rx="3.5" />
        <circle className="robot__core" cx="20" cy="28.7" r="1.9" />
        <rect className="robot__arm robot__arm--front" x="29.5" y="24.5" width="3" height="7.5" rx="1.5" />
        <rect className="robot__neck" x="18" y="21.5" width="4" height="2.5" />
        <g className="robot__head">
          <line className="robot__antenna" x1="20" y1="8" x2="20" y2="3.6" />
          <circle className="robot__led" cx="20" cy="2.8" r="1.8" />
          <rect className="robot__trim" x="7" y="12.5" width="2.5" height="5" rx="1" />
          <rect className="robot__trim" x="30.5" y="12.5" width="2.5" height="5" rx="1" />
          <rect className="robot__shell" x="9" y="8" width="22" height="14" rx="4.5" />
          <rect className="robot__visor" x="11.5" y="10.8" width="17" height="8.4" rx="3.2" />
          <g className="robot__eyes">
            <rect className="robot__eye" x="17.2" y="13.2" width="3" height="3.6" rx="1.2" />
            <rect className="robot__eye" x="23.2" y="13.2" width="3" height="3.6" rx="1.2" />
          </g>
        </g>
      </g>
    </svg>
  )
}

export default RobotSprite
