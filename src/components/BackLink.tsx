// "← Back to <the page you came from>": the back link used at the top of the inner pages.
// It goes back to the page you were really on before (src/utils/pageHistory.ts).

import type { Back } from '../utils/pageHistory.ts'

function BackLink({ back, onClick, className = '' }: { back: Back; onClick?: () => void; className?: string }) {
  return (
    <button type="button" className={`back-link back-button ${className}`.trim()} onClick={onClick ?? (() => back.go())}>
      <span aria-hidden="true">←</span> <span className="back-link__label">Back to {back.label}</span>
    </button>
  )
}

export default BackLink
