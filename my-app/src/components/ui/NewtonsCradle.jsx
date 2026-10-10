import './NewtonsCradle.css'

function NewtonsCradle({ label = 'Loading', size = 50, className = '' }) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`newtons-cradle-status ${className}`}
      style={{ '--uib-size': `${size}px` }}
    >
      <span className="sr-only">{label}</span>
      <span className="newtons-cradle" aria-hidden="true">
        <span className="newtons-cradle__dot" />
        <span className="newtons-cradle__dot" />
        <span className="newtons-cradle__dot" />
        <span className="newtons-cradle__dot" />
      </span>
    </div>
  )
}

export default NewtonsCradle
