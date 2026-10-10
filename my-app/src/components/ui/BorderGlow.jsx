import { useCallback, useRef } from 'react'
import './BorderGlow.css'

const gradientPositions = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%']
const gradientKeys = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven']
const colorMap = [0, 1, 2, 0, 1, 2, 1]

function getGlowVariables(glowColor, intensity) {
  const [hue = 95, saturation = 55, lightness = 65] = glowColor.match(/[\d.]+/g)?.map(Number) || []
  const base = `${hue}deg ${saturation}% ${lightness}%`
  const opacityValues = [100, 60, 50, 40, 30, 20, 10]
  const opacityKeys = ['', '-60', '-50', '-40', '-30', '-20', '-10']
  const variables = {}

  opacityValues.forEach((opacity, index) => {
    variables[`--glow-color${opacityKeys[index]}`] = `hsl(${base} / ${Math.min(opacity * intensity, 100)}%)`
  })

  return variables
}

function getGradientVariables(colors) {
  const variables = {}

  gradientKeys.forEach((key, index) => {
    const color = colors[colorMap[index] % colors.length]
    variables[key] = `radial-gradient(at ${gradientPositions[index]}, ${color} 0px, transparent 50%)`
  })
  variables['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`

  return variables
}

function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '95 55 65',
  backgroundColor = '#2C4A3E',
  borderRadius = 28,
  glowRadius = 32,
  glowIntensity = 0.8,
  coneSpread = 25,
  colors = ['#C5F26E', '#83AE40', '#A7C77C'],
  fillOpacity = 0.24,
}) {
  const cardRef = useRef(null)

  const getEdgeProximity = useCallback((width, height, x, y) => {
    const centerX = width / 2
    const centerY = height / 2
    const distanceX = x - centerX
    const distanceY = y - centerY
    const ratioX = distanceX === 0 ? Infinity : centerX / Math.abs(distanceX)
    const ratioY = distanceY === 0 ? Infinity : centerY / Math.abs(distanceY)

    return Math.min(Math.max(1 / Math.min(ratioX, ratioY), 0), 1)
  }, [])

  function handlePointerMove(event) {
    const card = cardRef.current
    if (!card || event.pointerType === 'touch') return

    const bounds = card.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    const centerX = bounds.width / 2
    const centerY = bounds.height / 2
    const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90

    card.style.setProperty('--edge-proximity', `${(getEdgeProximity(bounds.width, bounds.height, x, y) * 100).toFixed(3)}`)
    card.style.setProperty('--cursor-angle', `${((angle + 360) % 360).toFixed(3)}deg`)
  }

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`}
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        ...getGlowVariables(glowColor, glowIntensity),
        ...getGradientVariables(colors),
      }}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  )
}

export default BorderGlow
