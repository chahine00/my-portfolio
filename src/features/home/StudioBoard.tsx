// The studio board: what the home hero shows instead of the Axihex mark every few seconds (it
// changes by itself, see useAutoSwap in Hero.tsx). The founder's page has the night desk instead.
//
// A small board on a stand, drawn in SVG, with three columns: Idea, Build and Live. Cards move
// across it by themselves, one column at a time, then leave the Live column and start again as a
// new idea: the studio's work, from an idea to something live. A light next to "Live" pulses.
// The tiny robot (HeroRobot.tsx) has its home on top of the board while it shows (RobotPerch), like
// on the mark's "status: live" pill: it patrols there a moment, then comes out into the hero.
// Apart from the robot it's decoration, so screen readers skip it. The looks and moves are in
// global.css under "studio board". Visitors who turn off animations get the board still.

import type { CSSProperties } from 'react'
import RobotPerch from './RobotPerch.tsx'

// The board, in a 260 × 220 box (the same box as the night desk).
const BOARD = { x: 14, y: 34, width: 232, height: 142 }
const COLUMN_W = BOARD.width / 3
const COLUMNS = ['Idea', 'Build', 'Live']
const CARD = { width: 58, height: 18 }
// The cards' rows, and how far back in their loop each one starts (so they're spread out).
const CARDS = [
  { y: 74, delay: 0 },
  { y: 102, delay: -2.4 },
  { y: 130, delay: -4.8 },
]
const columnX = (i: number) => BOARD.x + COLUMN_W * i + (COLUMN_W - CARD.width) / 2

function StudioBoard({ robotHome }: { robotHome: boolean }) {
  return (
    <div className="lab board">
      <svg className="desk" viewBox="0 0 260 220" aria-hidden={robotHome ? undefined : true}>
        {/* The stand: two legs and the floor. */}
        <path className="board__stand" d={`M70 ${BOARD.y + BOARD.height} L58 212 M190 ${BOARD.y + BOARD.height} L202 212`} />
        <path className="board__floor" d="M30 212 H230" />

        {/* The board, its header, and the lines between the columns. */}
        <rect className="board__frame" x={BOARD.x} y={BOARD.y} width={BOARD.width} height={BOARD.height} rx={10} />
        <path className="board__rule" d={`M${BOARD.x} ${BOARD.y + 24} H${BOARD.x + BOARD.width}`} />
        {[1, 2].map((i) => (
          <path key={i} className="board__rule" d={`M${BOARD.x + COLUMN_W * i} ${BOARD.y + 8} V${BOARD.y + BOARD.height - 8}`} />
        ))}
        {COLUMNS.map((title, i) => (
          <text key={title} className="board__title" x={BOARD.x + COLUMN_W * i + COLUMN_W / 2} y={BOARD.y + 16}>
            {title}
          </text>
        ))}
        {/* The light next to "Live". */}
        <circle className="board__live" cx={BOARD.x + COLUMN_W * 2 + COLUMN_W / 2 + 20} cy={BOARD.y + 12} r={3} />

        {/* The cards, each moving Idea → Build → Live on its own beat (--step: one column). */}
        {CARDS.map((card) => (
          <g
            key={card.y}
            className="board__card"
            style={{ '--step': `${COLUMN_W}px`, animationDelay: `${card.delay}s` } as CSSProperties}
          >
            <rect x={columnX(0)} y={card.y} width={CARD.width} height={CARD.height} rx={5} />
            <path className="board__card-line" d={`M${columnX(0) + 8} ${card.y + 7} h28 M${columnX(0) + 8} ${card.y + 12} h18`} />
          </g>
        ))}

        {/* The tiny robot's home while the board shows: on its top edge. */}
        {robotHome && <RobotPerch box={BOARD} />}
      </svg>
    </div>
  )
}

export default StudioBoard
