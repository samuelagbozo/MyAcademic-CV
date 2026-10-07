import { useState } from 'react'
import { FolderOpen } from 'lucide-react'

function FolderFloat({ items, label = 'Career toolkit', sublabel = '3 highlights' }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="folder-float"
      data-open={isOpen || undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse' || event.pointerType === 'pen') setIsOpen(true)
      }}
      onPointerLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
      }}
    >
      <div className="folder-float__items" aria-label={label}>
        {items.map((item, index) => (
          <div
            className="folder-float__item"
            key={item.title}
            data-index={index}
            style={{
              '--i': index,
              '--x': `${(index - (items.length - 1) / 2) * 210}px`,
              '--y': `${index === Math.floor(items.length / 2) ? -145 : -108}px`,
              '--r': `${(index - (items.length - 1) / 2) * 7}deg`,
            }}
            aria-hidden={!isOpen}
          >
            <span className="folder-float__item-icon"><item.icon className="h-4 w-4" aria-hidden="true" /></span>
            <span>
              <span className="folder-float__item-title">{item.title}</span>
              <span className="folder-float__item-detail">{item.detail}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="folder-float__shape" aria-hidden="true">
        <div className="folder-float__back" />
        <div className="folder-float__paper" />
        <div className="folder-float__front">
          <span className="folder-float__label"><FolderOpen className="h-4 w-4" aria-hidden="true" />{label}</span>
          <span className="folder-float__sub">{sublabel}</span>
        </div>
      </div>
      <button
        type="button"
        className="folder-float__trigger"
        aria-label={`${isOpen ? 'Close' : 'Open'} ${label}: ${items.map((item) => item.title).join(', ')}`}
        aria-expanded={isOpen}
        onClick={() => {
          if (window.matchMedia('(hover: hover)').matches) setIsOpen(true)
          else setIsOpen((open) => !open)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false)
            event.currentTarget.blur()
          }
        }}
      />
    </div>
  )
}

export default FolderFloat
