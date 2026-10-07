import { motion, useReducedMotion } from 'motion/react'

const DURATION = 0.25
const STAGGER = 0.025

function FlipText({ text }) {
  const shouldReduceMotion = useReducedMotion()
  const characters = Array.from(text)

  return (
    <motion.span
      initial="initial"
      whileHover={shouldReduceMotion ? undefined : 'hovered'}
      aria-hidden="true"
      className="relative inline-block overflow-hidden align-bottom"
      style={{ lineHeight: 1.15 }}
    >
      <span className="inline-block">
        {characters.map((character, index) => (
          <motion.span
            key={`initial-${index}`}
            variants={{
              initial: { y: 0 },
              hovered: { y: '-100%' },
            }}
            transition={{
              duration: DURATION,
              ease: 'easeInOut',
              delay: STAGGER * index,
            }}
            className="inline-block"
          >
            {character === ' ' ? '\u00a0' : character}
          </motion.span>
        ))}
      </span>
      <span className="absolute inset-0 inline-block">
        {characters.map((character, index) => (
          <motion.span
            key={`hovered-${index}`}
            variants={{
              initial: { y: '100%' },
              hovered: { y: 0 },
            }}
            transition={{
              duration: DURATION,
              ease: 'easeInOut',
              delay: STAGGER * index,
            }}
            className="inline-block"
          >
            {character === ' ' ? '\u00a0' : character}
          </motion.span>
        ))}
      </span>
    </motion.span>
  )
}

export default FlipText
