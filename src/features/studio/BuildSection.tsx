// The home page's "What we build" (id="build", where the Build pillar leads): the anatomy of an app
// (HeroMark.tsx, the saucer that used to be in the hero: interface, backend, infrastructure, each
// clickable) beside the five core engineering capabilities, as a list. The layers are how an app is
// put together; the capabilities are what we build them with, so the two are tied: pointing at a
// capability lifts its layer in the drawing, and picking a layer lights its capabilities.
// On phones the drawing sits above the capabilities (compact tiles there, so both fit on one
// screen); a tap on a tile while the plates are out of view scrolls just enough to show them, so
// the layer's spin can be seen. The capabilities of one layer (Web and Mobile: Interface; Backend
// and AI integration: Backend) light up joined as one block, so they read as one layer, not two
// separate buttons. Text: src/data/identity.ts.

import { useEffect, useRef, useState } from 'react'
import SectionTitle from '../../components/SectionTitle.tsx'
import { capabilities, capabilitiesPrinciple } from '../../data/identity.ts'
import HeroMark from '../home/HeroMark.tsx'
import Capabilities from './Capabilities.tsx'

// Which layer each capability lives in (0 interface, 1 backend, 2 infrastructure), by its title.
const LAYER_OF: Record<string, number> = { Web: 0, Mobile: 0, Backend: 1, 'AI integration': 1, Cloud: 2 }
const layerOf = (index: number) => LAYER_OF[capabilities[index].title] ?? 0

function BuildSection() {
  const [layer, setLayer] = useState(0)
  // The capability the visitor picked: the only row shown fully selected. Its layer partner (Web
  // with Mobile, Backend with AI integration) stays joined to it but quiet, so it never looks
  // pressed too. Null when the layer was chosen in the drawing: then the layer's rows light equally.
  const [picked, setPicked] = useState<number | null>(null)
  const drawingRef = useRef<HTMLDivElement>(null)

  // A short "you can click these" hint: when the section scrolls up into view (scrolling down,
  // not back up), a light sweeps once across each capability row and each layer button. It's
  // reset only when the section has left through the bottom, so the next scroll down shows it again.
  const sectionRef = useRef<HTMLElement>(null)
  const [hint, setHint] = useState(false)
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (entry.boundingClientRect.top > 0) setHint(true)
        } else if (entry.boundingClientRect.top > 0) {
          setHint(false)
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  function pick(index: number) {
    setPicked(index)
    setLayer(layerOf(index))
    // Stacked (phones, small tablets): if the spinning plates aren't in view, scroll just enough to
    // show them (not up to the section's top): "nearest" moves the page the least it can.
    const plates = drawingRef.current?.querySelector<HTMLElement>('.layer-drawing')
    if (!plates || !window.matchMedia('(max-width: 860px)').matches) return
    const box = plates.getBoundingClientRect()
    const navbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 64
    if (box.top < navbar || box.bottom > window.innerHeight) plates.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <section ref={sectionRef} id="build" className={hint ? 'section build build--hint' : 'section build'}>
      <SectionTitle label="What we build" title={capabilitiesPrinciple.title} accent={capabilitiesPrinciple.accent} />
      <div className="build__layout">
        <div ref={drawingRef} className="build__drawing">
          <HeroMark
            layer={layer}
            onLayer={(next) => {
              // The drawing echoes a row's pick back with the same layer: keep that row picked.
              if (picked === null || layerOf(picked) !== next) setPicked(null)
              setLayer(next)
            }}
          />
        </div>
        <Capabilities
          hideTitle
          variant="list"
          lit={(index) => layerOf(index) === layer}
          picked={picked}
          onPick={pick}
        />
      </div>
    </section>
  )
}

export default BuildSection
