// The home page's "What we build" (id="build", where the Build pillar leads): the anatomy of an app
// (HeroMark.tsx, the saucer that used to be in the hero: interface, backend, infrastructure, each
// clickable) beside the five core engineering capabilities, as a list. The layers are how an app is
// put together; the capabilities are what we build them with, so the two are tied: pointing at a
// capability lifts its layer in the drawing, and picking a layer lights its capabilities.
// On phones the drawing sits above the capabilities (compact tiles there, so both fit on one
// screen); a tap on a tile while the drawing is out of view brings it back into view, so the layer's
// spin can be seen. Text: src/data/identity.ts.

import { useRef, useState } from 'react'
import SectionTitle from '../../components/SectionTitle.tsx'
import { capabilities, capabilitiesPrinciple } from '../../data/identity.ts'
import HeroMark from '../home/HeroMark.tsx'
import Capabilities from './Capabilities.tsx'

// Which layer each capability lives in (0 interface, 1 backend, 2 infrastructure), by its title.
const LAYER_OF: Record<string, number> = { Web: 0, Mobile: 0, Backend: 1, 'AI integration': 1, Cloud: 2 }
const layerOf = (index: number) => LAYER_OF[capabilities[index].title] ?? 0

function BuildSection() {
  const [layer, setLayer] = useState(0)
  const drawingRef = useRef<HTMLDivElement>(null)

  function pick(index: number) {
    setLayer(layerOf(index))
    // Stacked (phones, small tablets): if the drawing isn't fully in view, bring it there.
    const drawing = drawingRef.current
    if (!drawing || !window.matchMedia('(max-width: 860px)').matches) return
    const box = drawing.getBoundingClientRect()
    const navbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 64
    if (box.top < navbar || box.bottom > window.innerHeight) drawing.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <section id="build" className="section build">
      <SectionTitle label="What we build" title={capabilitiesPrinciple.title} accent={capabilitiesPrinciple.accent} />
      <div className="build__layout">
        <div ref={drawingRef} className="build__drawing">
          <HeroMark layer={layer} onLayer={setLayer} />
        </div>
        <Capabilities hideTitle variant="list" lit={(index) => layerOf(index) === layer} onPick={pick} />
      </div>
    </section>
  )
}

export default BuildSection
