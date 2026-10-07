function FontWeightText({
  text,
  minWeight = 100,
  maxWeight = 900,
  animationDuration = 0.6,
  delayMultiplier = 0.035,
}) {
  return (
    <span className="font-weight-text" aria-hidden="true">
      {Array.from(text).map((character, index) => (
        <span
          key={`${character}-${index}`}
          className="font-weight-text-character"
          style={{
            '--font-weight-min': minWeight,
            '--font-weight-max': maxWeight,
            '--font-weight-duration': `${animationDuration}s`,
            '--font-weight-delay': `${index * delayMultiplier}s`,
          }}
        >
          {character === ' ' ? '\u00a0' : character}
        </span>
      ))}
    </span>
  )
}

export default FontWeightText
