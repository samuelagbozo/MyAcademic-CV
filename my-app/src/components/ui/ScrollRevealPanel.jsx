import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

function ScrollRevealPanel({ eyebrow, title, description, children }) {
  const panelRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ['start end', 'end start'],
  })
  const rotateX = useTransform(scrollYProgress, [0, 0.18, 0.5, 0.82, 1], [12, 4, 0, -2, -7])
  const titleY = useTransform(scrollYProgress, [0, 0.2, 0.42], [54, 0, 0])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4], [0.25, 1, 1])

  return (
    <motion.section
      ref={panelRef}
      style={{
        rotateX: prefersReducedMotion ? 0 : rotateX,
        transformPerspective: 1400,
        transformOrigin: 'center top',
      }}
      className="relative mt-8 rounded-[2rem] border border-[#1B342B]/30 bg-[#1B342B] p-2 shadow-[0_28px_70px_-38px_rgba(27,52,43,0.6)] sm:p-3"
    >
      <div className="overflow-hidden rounded-[1.5rem] border border-[#1B342B]/10 bg-[#FFFEFA] p-5 sm:p-8">
        <div className="overflow-hidden pb-1">
          <motion.div
            style={{
              y: prefersReducedMotion ? 0 : titleY,
              opacity: prefersReducedMotion ? 1 : titleOpacity,
            }}
          >
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#567B42]">{eyebrow}</p>
            <h2 className="mt-1 text-xl font-semibold text-[#1B342B]">{title}</h2>
          </motion.div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#647168]">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
    </motion.section>
  )
}

export default ScrollRevealPanel
