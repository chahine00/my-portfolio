// The home page's "What we build" (id="build", where the Build pillar leads): the anatomy of an app
// (HeroMark.tsx, the saucer that used to be in the hero: interface, backend, infrastructure, each
// clickable) beside the five core engineering capabilities, as a list. The layers are how an app is
// put together; the capabilities are what we build them with. Text: src/data/identity.ts.

import SectionTitle from '../../components/SectionTitle.tsx'
import { capabilitiesPrinciple } from '../../data/identity.ts'
import HeroMark from '../home/HeroMark.tsx'
import Capabilities from './Capabilities.tsx'

function BuildSection() {
  return (
    <section id="build" className="section build">
      <SectionTitle label="What we build" title={capabilitiesPrinciple.title} accent={capabilitiesPrinciple.accent} />
      <div className="build__layout">
        <HeroMark />
        <Capabilities hideTitle variant="list" />
      </div>
    </section>
  )
}

export default BuildSection
