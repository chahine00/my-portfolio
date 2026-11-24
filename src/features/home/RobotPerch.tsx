import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import RobotSprite from '../../components/RobotSprite.tsx'
import { callRobotOut, isRobotDismissed, useRobotDismissed } from '../../components/robotStore.ts'

// It pops up on its box (~2.2s, see .hero__art-robot in global.css), then comes out by itself this
// long after the drawing starts, times the drawing's --art-time (so it follows the drawing's pace).
const OUT_AFTER_MS = 2900

// The tiny robot's home in a drawing: it stands on the top edge of a box (the founder's
// "<Welcome />" bubble, the home page's "status: live" pill, or the top of the studio board), near
// its right end, patrols it for a moment, then comes out into the hero by itself (HeroRobot.tsx)
// and plays there. Clicked on its box, it comes out right away. Sent home with its "×", it stays on
// the box with a "click me!" tag ("tap me!" on touch screens) until clicked.
export default function RobotPerch({ box }: { box: { x: number; y: number; width: number; height: number } }) {
  const robotRef = useRef<SVGGElement>(null)
  const dismissed = useRobotDismissed()

  // Comes out by itself (unless it was sent home with its "×"). If the drawing goes away first
  // (the mouse left the hero, or the picture changed), this is cancelled and tried again next time.
  useEffect(() => {
    if (dismissed) return
    const robot = robotRef.current
    const pace = (robot && parseFloat(getComputedStyle(robot).getPropertyValue('--art-time'))) || 1
    const timer = window.setTimeout(() => {
      if (robotRef.current && !isRobotDismissed()) callRobotOut(robotRef.current.getBoundingClientRect())
    }, OUT_AFTER_MS * pace)
    return () => window.clearTimeout(timer)
  }, [dismissed])

  // Pointer down (not click): on phones a touch also restarts the drawing, which would rebuild
  // the box before a click could land. The robot comes out from where it stands.
  function letRobotOut(event: PointerEvent<SVGGElement> | KeyboardEvent<SVGGElement>) {
    event.stopPropagation()
    const robot = event.currentTarget.querySelector('.hero__art-robot-body') ?? event.currentTarget
    callRobotOut(robot.getBoundingClientRect())
  }

  return (
    <g
      className="hero__art-robot"
      role="button"
      tabIndex={0}
      aria-label="Tiny robot. Click to let it out."
      data-waiting={dismissed ? 'true' : undefined}
      onPointerDown={letRobotOut}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && letRobotOut(event)}
    >
      {/* Touch screens: a bigger, invisible tap area around the robot (fingers are less precise
          than a mouse): the robot, the tag and the space above them, and the box. */}
      <rect className="hero__art-robot-hitbox" x={box.x - 80} y={box.y - 92} width={box.width + 94} height={box.height + 92} />
      {/* A small tag above the box that invites a click. Clicking it lets the robot out too. */}
      <g className="hero__art-robot-hint">
        <rect x={box.x + box.width / 2 - 34} y={box.y - 56} width={68} height={20} rx={10} />
        <text className="hero__art-robot-hint--mouse" x={box.x + box.width / 2} y={box.y - 42}>
          click me!
        </text>
        <text className="hero__art-robot-hint--touch" x={box.x + box.width / 2} y={box.y - 42}>
          tap me!
        </text>
      </g>
      {/* The inner group patrols along the box and back in robot steps (.hero__art-robot-patrol). */}
      <g className="hero__art-robot-patrol">
        {/* A soft ring pulsing out from under the robot: "you can tap this". */}
        <circle className="hero__art-robot-pulse" cx={box.x + box.width - 28} cy={box.y - 13} r={16} />
        {/* data-robot="walk": its legs and arms step while it patrols (same CSS as HeroRobot). */}
        <g ref={robotRef} className="hero__art-robot-body" data-robot="walk">
          <RobotSprite x={box.x + box.width - 44} y={box.y - 31} width={32} height={32} />
        </g>
      </g>
    </g>
  )
}
