import { useRef } from 'react'
import './SpotlightCard.css'

function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(131, 174, 64, 0.22)',
  ...props
}) {
  const cardRef = useRef(null)

  function handlePointerMove(event) {
    const card = cardRef.current
    if (!card) return

    const bounds = card.getBoundingClientRect()
    card.style.setProperty('--mouse-x', `${event.clientX - bounds.left}px`)
    card.style.setProperty('--mouse-y', `${event.clientY - bounds.top}px`)
    card.style.setProperty('--spotlight-color', spotlightColor)
  }

  return (
    <div
      {...props}
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`card-spotlight ${className}`}
    >
      {children}
    </div>
  )
}

export default SpotlightCard
