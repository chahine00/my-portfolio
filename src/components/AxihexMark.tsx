// The Axihex mark: a hexagon outline with a dot in the middle, in the accent color.
// Used in the navbar (next to the name) and in the About section. Its size and colors are set
// by the className passed in (see .brand__mark and .axihex__mark in global.css).

function AxihexMark({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 20.2 7.25v9.5L12 21.5 3.8 16.75v-9.5Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  )
}

export default AxihexMark
