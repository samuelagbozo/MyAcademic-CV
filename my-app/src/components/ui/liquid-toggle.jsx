import { useId } from 'react'
import { cn } from '../../lib/utils.js'
import './liquid-toggle.css'

const variants = {
  default: 'default',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
}

export function Toggle({ checked = false, onCheckedChange, className, variant = 'default', ariaLabel, children }) {
  const filterId = `liquid-toggle-goo-${useId().replaceAll(':', '')}`

  return (
    <label className={cn('liquid-toggle', `liquid-toggle--${variants[variant] || variants.default}`, className)}>
      <input
        type="checkbox"
        role="switch"
        aria-label={ariaLabel}
        aria-checked={checked}
        checked={checked}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        data-checked={checked}
        className="liquid-toggle__input"
      />
      <svg viewBox="0 0 52 32" aria-hidden="true" className="liquid-toggle__art">
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
        <g filter={`url(#${filterId})`}>
          <circle
            className="liquid-toggle__circle"
            cx="16"
            cy="16"
            r="10"
            style={{ transform: `translateX(${checked ? '12px' : '0px'}) scale(${checked ? 0 : 1})` }}
          />
          <circle
            className="liquid-toggle__circle"
            cx="36"
            cy="16"
            r="10"
            style={{ transform: `translateX(${checked ? '0px' : '-12px'}) scale(${checked ? 1 : 0})` }}
          />
          {checked && <circle className="liquid-toggle__drop" cx="35" cy="-1" r="2.5" />}
        </g>
      </svg>
      {children}
    </label>
  )
}

export default Toggle
