import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import './TiltCard.css'

const springConfig = { damping: 15, stiffness: 150 }

function TiltCard({ children, className = '', maxTilt = 8, lift = 0 }) {
  const [hasFineHover, setHasFineHover] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)
  const tiltX = useTransform(springY, [-0.5, 0.5], [`${maxTilt}deg`, `${-maxTilt}deg`])
  const tiltY = useTransform(springX, [-0.5, 0.5], [`${-maxTilt}deg`, `${maxTilt}deg`])

  useEffect(() => {
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const updateHoverSupport = () => setHasFineHover(hoverQuery.matches)
    updateHoverSupport()
    hoverQuery.addEventListener('change', updateHoverSupport)
    return () => hoverQuery.removeEventListener('change', updateHoverSupport)
  }, [])

  const isTiltEnabled = hasFineHover && !prefersReducedMotion

  function handleMouseMove(event) {
    if (!isTiltEnabled) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    mouseX.set((event.clientX - bounds.left) / bounds.width - 0.5)
    mouseY.set((event.clientY - bounds.top) / bounds.height - 0.5)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div className="resume-tilt-perspective w-full min-w-0" style={{ perspective: '1000px' }}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={isTiltEnabled ? { rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' } : { transformStyle: 'preserve-3d' }}
        className={`resume-tilt-card ${className}`}
      >
        {lift > 0 ? <div style={{ transform: `translateZ(${Math.min(lift, 20)}px)`, transformStyle: 'preserve-3d' }}>{children}</div> : children}
      </motion.div>
    </div>
  )
}

export default TiltCard
