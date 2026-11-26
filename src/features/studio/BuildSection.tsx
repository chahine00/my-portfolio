// The home page's "What we build" (id="build", where the Build pillar leads): the anatomy of an app
// (HeroMark.tsx, the saucer that used to be in the hero: interface, backend, infrastructure, each
// clickable) beside the five core engineering capabilities, as a list. The layers are how an app is
// put together; the capabilities are what we build them with, so the two are tied: pointing at a
// capability lifts its layer in the drawing, and picking a layer lights its capabilities.
// Text: src/data/identity.ts.

import { useState } from 'react'
import SectionTitle from '../../components/SectionTitle.tsx'
import { capabilities, capabilitiesPrinciple } from '../../data/identity.ts'
import HeroMark from '../home/HeroMark.tsx'
import Capabilities from './Capabilities.tsx'

// Which layer each capability lives in (0 interface, 1 backend, 2 infrastructure), by its title.
const LAYER_OF: Record<string, number> = { Web: 0, Mobile: 0, Backend: 1, 'AI integration': 1, Cloud: 2 }
const layerOf = (index: number) => LAYER_OF[capabilities[index].title] ?? 0

function BuildSection() {
  const [layer, setLayer] = useState(0)

  return (
    <section id="build" className="section build">
      <SectionTitle label="What we build" title={capabilitiesPrinciple.title} accent={capabilitiesPrinciple.accent} />
      <div className="build__layout">
        <HeroMark layer={layer} onLayer={setLayer} />
        <Capabilities
          hideTitle
          variant="list"
          lit={(index) => layerOf(index) === layer}
          onPick={(index) => setLayer(layerOf(index))}
        />
      </div>
    </section>
  )
}

export default BuildSection
