import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import './TiltedCard.css'

const captionSpring = { damping: 30, stiffness: 350, mass: 1 }

function TiltedCard({ children, title, className = '', style }) {
  const cardRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const pointerX = useSpring(useMotionValue(0), captionSpring)
  const pointerY = useSpring(useMotionValue(0), captionSpring)
  const captionOpacity = useSpring(0, captionSpring)
  const captionRotate = useSpring(useMotionValue(0), captionSpring)
  const previousOffsetY = useRef(0)

  function handlePointerMove(event) {
    const card = cardRef.current
    if (!card || event.pointerType !== 'mouse') return

    const bounds = card.getBoundingClientRect()
    const offsetX = event.clientX - bounds.left - bounds.width / 2
    const offsetY = event.clientY - bounds.top - bounds.height / 2
    const rotationX = prefersReducedMotion ? 0 : (offsetY / (bounds.height / 2)) * -12
    const rotationY = prefersReducedMotion ? 0 : (offsetX / (bounds.width / 2)) * 12

    card.style.setProperty('--tilt-x', `${rotationX}deg`)
    card.style.setProperty('--tilt-y', `${rotationY}deg`)
    pointerX.set(event.clientX - bounds.left)
    pointerY.set(event.clientY - bounds.top)
    captionRotate.set(-(offsetY - previousOffsetY.current) * 0.35)
    previousOffsetY.current = offsetY
  }

  function handlePointerEnter() {
    captionOpacity.set(1)
    if (!prefersReducedMotion) {
      cardRef.current?.style.setProperty('--card-hover-transform', 'translateY(-8px) scale(1.04)')
    }
  }

  function handlePointerLeave() {
    cardRef.current?.style.setProperty('--tilt-x', '0deg')
    cardRef.current?.style.setProperty('--tilt-y', '0deg')
    cardRef.current?.style.setProperty('--card-hover-transform', 'translateY(0) scale(1)')
    captionOpacity.set(0)
    captionRotate.set(0)
  }

  return (
    <motion.article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={style}
      className={`tilted-review-card ${className}`}
    >
      {children}
      <motion.span
        aria-hidden="true"
        className="tilted-review-card__caption"
        style={{
          x: pointerX,
          y: pointerY,
          z: 28,
          opacity: captionOpacity,
          rotate: captionRotate,
        }}
        transformTemplate={({ x, y, z, rotate }) => (
          `translate3d(${x}, ${y}, ${z}) rotate(${rotate}) translate(-50%, -135%)`
        )}
      >
        {title}
      </motion.span>
    </motion.article>
  )
}

export default TiltedCard
