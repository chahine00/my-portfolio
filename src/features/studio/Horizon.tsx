// Where Axihex is today, and where it's heading, one aspect per row: "Today" in solid lines (it's
// real now), "Next" in dashed ones (a direction, not a claim). Each row's arrow draws as it scrolls
// into view. Used by the home page's Direction section (the rows marked "home") and the full
// Studio page (all of them). Text: "horizon" in src/data/identity.ts.

import { horizon } from '../../data/identity.ts'
import { useReveal } from '../../utils/useReveal.ts'

function Horizon({ homeOnly = false }: { homeOnly?: boolean }) {
  const rows = homeOnly ? horizon.filter((row) => row.home) : horizon
  const listRef = useReveal<HTMLDListElement>('.horizon__row')

  return (
    <div className="horizon">
      <div className="horizon__head" aria-hidden="true">
        <span />
        <span className="horizon__label horizon__label--today">
          <span className="horizon__dot" /> Today
        </span>
        <span className="horizon__label horizon__label--next">
          <span className="horizon__dot horizon__dot--next" /> Next
        </span>
      </div>
      <dl className="horizon__rows" ref={listRef}>
        {rows.map((row) => (
          <div key={row.aspect} className="horizon__row">
            <dt>{row.aspect}</dt>
            <dd className="horizon__today">
              <span className="sr-only">Today: </span>
              {row.today}
            </dd>
            <dd className="horizon__next">
              <span className="horizon__arrow" aria-hidden="true" />
              <span className="sr-only">Next: </span>
              {row.next}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default Horizon
