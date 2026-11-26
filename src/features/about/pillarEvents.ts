// "Open this pillar": sent by the hero's engine when one of its five pillar nodes is clicked
// (AxihexEngine.tsx), heard by the honeycomb (PillarHive.tsx), which then shows that pillar.
export const OPEN_PILLAR_EVENT = 'axihex:open-pillar'

export function openPillar(index: number) {
  window.dispatchEvent(new CustomEvent<number>(OPEN_PILLAR_EVENT, { detail: index }))
}
