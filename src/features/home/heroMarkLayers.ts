// The hero mark's layers (HeroMark.tsx), shared with the hover drawing that lines up with them
// (MarkArt in Hero.tsx). In the mark's own coordinates: center 0,0.

// A layer's radius: from the center to its left and right corners.
export const LAYER_R = 120

// Where each layer's center sits, top first: at rest (the CSS uses the same numbers, see
// .hero-mark__layer in global.css), and opened up while the hero is hovered.
export const LAYER_Y = [-70, 0, 70]
export const LAYER_Y_OPEN = [-105, 0, 105]
