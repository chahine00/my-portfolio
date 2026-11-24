// The home page's "Direction" section, just before Contact: the mission, the long-term vision, and
// an honest look at where Axihex is today and where it's heading (Horizon.tsx). The full story is
// on the Studio page (/studio). Text: src/data/identity.ts.

import { Link } from 'react-router'
import SectionTitle from '../../components/SectionTitle.tsx'
import { measure, mission, vision } from '../../data/identity.ts'
import Horizon from '../studio/Horizon.tsx'

function Direction() {
  return (
    <section id="direction" className="section direction">
      <SectionTitle label="Direction" title="Where we're" accent="going." />
      <div className="direction__layout">
        <div className="direction__statements">
          <div className="direction__statement">
            <p className="direction__kicker">Mission</p>
            <p className="direction__mission">{mission}</p>
          </div>
          <div className="direction__statement">
            <p className="direction__kicker">Vision</p>
            <p>{vision}</p>
          </div>
          <Link to="/studio" className="forward-link direction__more">
            Identity, purpose &amp; vision <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div>
          <Horizon homeOnly />
          <p className="direction__measure">{measure}</p>
        </div>
      </div>
    </section>
  )
}

export default Direction
