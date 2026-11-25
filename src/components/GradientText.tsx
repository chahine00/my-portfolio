// Text in the accent gradient (accent → cyan), drawn as one solid color PER LETTER instead of a
// gradient background clipped to the text.
//
// Why: phones that force their own dark mode on websites (some Android phones do this even when the
// site has a dark theme) darken anything they think is a background, and a gradient clipped to text
// counts as one. The words then turn dark on the dark page. A normal text color is left alone, so
// coloring each letter keeps the words bright everywhere.
//
// Each letter gets --p: its place in the text, from 0 (first) to 1 (last). The CSS (".grad__l" in
// global.css) turns that into a color between the accent and the cyan.
// The text is there only once (no hidden copy): Google and copy-paste see "what's next.", not the
// words twice. Inline letter spans with no gaps between them are read by screen readers as one word.

interface GradientTextProps {
  text: string
}

function GradientText({ text }: GradientTextProps) {
  const letters = [...text]
  const last = Math.max(letters.length - 1, 1)

  return (
    <span className="grad">
      {letters.map((letter, i) =>
        letter === ' ' ? (
          ' '
        ) : (
          <span key={i} className="grad__l" style={{ '--p': i / last } as React.CSSProperties}>
            {letter}
          </span>
        ),
      )}
    </span>
  )
}

export default GradientText
