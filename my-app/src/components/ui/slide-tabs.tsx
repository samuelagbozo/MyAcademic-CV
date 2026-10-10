import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'

type SlideTab = {
  label: string
  href: string
}

type SlideTabsProps = {
  tabs: readonly SlideTab[]
  ariaLabel: string
  selectedHref?: string
  size?: 'compact' | 'default'
}

export function SlideTabs({ tabs, ariaLabel, selectedHref, size = 'compact' }: SlideTabsProps) {
  const [selected, setSelected] = useState(0)
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 })
  const tabsRef = useRef<(HTMLLIElement | null)[]>([])

  useLayoutEffect(() => {
    if (!selectedHref) return

    const index = tabs.findIndex((tab) => tab.href === selectedHref)
    if (index !== -1) setSelected(index)
  }, [selectedHref, tabs])

  useLayoutEffect(() => {
    function updatePosition(index: number) {
      const tab = tabsRef.current[index]
      if (!tab) return

      setPosition({
        left: tab.offsetLeft,
        width: tab.offsetWidth,
        opacity: 1,
      })
    }

    updatePosition(selected)
    const observer = new ResizeObserver(() => updatePosition(selected))
    tabsRef.current.forEach((tab) => {
      if (tab) observer.observe(tab)
    })

    return () => observer.disconnect()
  }, [selected, tabs])

  function moveCursor(index: number) {
    const tab = tabsRef.current[index]
    if (!tab) return

    setPosition({
      left: tab.offsetLeft,
      width: tab.offsetWidth,
      opacity: 1,
    })
  }

  return (
    <nav aria-label={ariaLabel} className="mx-auto w-fit max-w-full">
      <ul
        onMouseLeave={() => moveCursor(selected)}
        className="relative flex w-fit max-w-full items-center rounded-full border border-[#1B342B]/10 bg-[#FFFEFA] p-1 shadow-sm"
      >
        {tabs.map((tab, index) => (
          <li
            key={tab.href}
            ref={(element) => {
              tabsRef.current[index] = element
            }}
            className="relative z-10"
          >
            {tab.href.startsWith('/') ? (
              <Link
                to={tab.href}
                aria-current={selected === index ? 'page' : undefined}
                onClick={() => setSelected(index)}
                onMouseEnter={() => moveCursor(index)}
                className={size === 'compact'
                  ? 'block whitespace-nowrap rounded-full px-2.5 py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#1B342B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] sm:px-3 sm:tracking-[0.12em] md:px-4'
                  : 'block whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-[#1B342B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] md:px-4'}
              >
                {tab.label}
              </Link>
            ) : (
              <a
                href={tab.href}
                aria-current={selected === index ? 'page' : undefined}
                onClick={() => setSelected(index)}
                onMouseEnter={() => moveCursor(index)}
                className={size === 'compact'
                  ? 'block whitespace-nowrap rounded-full px-2.5 py-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#1B342B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] sm:px-3 sm:tracking-[0.12em] md:px-4'
                  : 'block whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-[#1B342B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83AE40] md:px-4'}
              >
                {tab.label}
              </a>
            )}
          </li>
        ))}
        <motion.li
          aria-hidden="true"
          initial={false}
          animate={position}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="pointer-events-none absolute inset-y-1 z-0 rounded-full bg-[#C5F26E]"
        />
      </ul>
    </nav>
  )
}
