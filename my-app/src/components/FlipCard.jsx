import { useRef, useState } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'

function FlipCard({
  children,
  back,
  ariaLabel = 'Flip resume preview',
  className = '',
  tiltMax = 8,
  perspective = 1100,
  stiffness = 170,
  damping = 20,
  glareOpacity = 0.16,
}) {
  const reduceMotion = useReducedMotion()
  const [flipped, setFlipped] = useState(false)
  const [dragging, setDragging] = useState(false)
  const pointer = useRef(null)
  const suppressClick = useRef(false)
  const rotationTarget = useMotionValue(0)
  const rotationSpring = useSpring(rotationTarget, { stiffness, damping })
  const tiltX = useSpring(0, { stiffness: 240, damping: 24 })
  const tiltY = useSpring(0, { stiffness: 240, damping: 24 })
  const lift = useSpring(1, { stiffness: 320, damping: 26 })
  const sheen = useSpring(0, { stiffness: 320, damping: 26 })
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)
  const displayedRotation = reduceMotion ? rotationTarget : rotationSpring
  const rotateY = useTransform([displayedRotation, tiltY], ([rotation, tilt]) => rotation + tilt)
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${glareOpacity}) 0%, rgba(255,255,255,0) 60%)`

  function setRotation(nextRotation) {
    rotationTarget.set(nextRotation)
    setFlipped(Math.abs(Math.round(nextRotation / 180)) % 2 === 1)
  }

  function flip() {
    const current = Math.round(rotationTarget.get() / 180) * 180
    setRotation(current + 180)
  }

  function handlePointerDown(event) {
    if (event.button !== 0 || pointer.current) return
    pointer.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startRotation: rotationTarget.get(),
      moved: false,
    }
    suppressClick.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event) {
    const activePointer = pointer.current
    const bounds = event.currentTarget.getBoundingClientRect()

    if (activePointer && activePointer.id === event.pointerId) {
      const distance = event.clientX - activePointer.startX
      if (!activePointer.moved && Math.abs(distance) < 5) return
      activePointer.moved = true
      setDragging(true)
      tiltX.set(0)
      tiltY.set(0)
      sheen.set(0)
      const delta = (distance / bounds.width) * 180
      rotationTarget.set(activePointer.startRotation + Math.max(-180, Math.min(180, delta)))
      return
    }

    if (reduceMotion || event.pointerType === 'touch') return
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
    tiltX.set((0.5 - y) * 2 * tiltMax)
    tiltY.set((x - 0.5) * 2 * tiltMax)
    glareX.set(x * 100)
    glareY.set(y * 100)
    sheen.set(1)
  }

  function handlePointerUp(event, cancelled = false) {
    const activePointer = pointer.current
    if (!activePointer || activePointer.id !== event.pointerId) return
    pointer.current = null
    setDragging(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (activePointer.moved) {
      suppressClick.current = true
      const currentRotation = rotationTarget.get()
      const snappedRotation = Math.round(currentRotation / 180) * 180
      const finalRotation = cancelled ? activePointer.startRotation : snappedRotation
      setRotation(finalRotation)
    }
  }

  function handlePointerLeave() {
    if (pointer.current || reduceMotion) return
    tiltX.set(0)
    tiltY.set(0)
    sheen.set(0)
    lift.set(1)
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    if (!event.repeat) flip()
  }

  function handleClick(event) {
    if (event.detail === 0) return
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    flip()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${ariaLabel}. Activate to flip.`}
      aria-pressed={flipped}
      className={`resume-flip-card${dragging ? ' is-dragging' : ''}${className ? ` ${className}` : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => handlePointerUp(event)}
      onPointerCancel={(event) => handlePointerUp(event, true)}
      onLostPointerCapture={(event) => handlePointerUp(event, true)}
      onPointerEnter={(event) => {
        if (!reduceMotion && event.pointerType !== 'touch') lift.set(1.015)
      }}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onDragStart={(event) => event.preventDefault()}
    >
      <motion.div
        className="resume-flip-card__rotor"
        style={{
          rotateY,
          rotateX: reduceMotion ? 0 : tiltX,
          scale: reduceMotion ? 1 : lift,
          transformPerspective: perspective,
        }}
      >
        <div
          className="resume-flip-card__face resume-flip-card__face--front"
          aria-hidden={flipped}
          inert={flipped}
        >
          {children}
          <motion.span className="resume-flip-card__glare" style={{ background: glare, opacity: sheen }} aria-hidden="true" />
        </div>
        <div
          className="resume-flip-card__face resume-flip-card__face--back"
          aria-hidden={!flipped}
          inert={!flipped}
        >
          {back}
          <motion.span className="resume-flip-card__glare" style={{ background: glare, opacity: sheen }} aria-hidden="true" />
        </div>
      </motion.div>
      <span className="resume-flip-card__hint" aria-hidden="true">{flipped ? 'Drag or click to see resume preview' : 'Drag or click to see AI review'}</span>
    </div>
  )
}

export default FlipCard
