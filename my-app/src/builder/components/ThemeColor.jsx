import { useState } from 'react'
import { LayoutGrid } from 'lucide-react'

const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFA1', '#FF7133', '#71FF33', '#7133FF', '#FF3371', '#33FF71', '#3371FF', '#A1FF33', '#33A1FF', '#FF5733', '#5733FF', '#33FF5A', '#5A33FF', '#FF335A', '#335AFF']

function ThemeColor({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        <LayoutGrid className="h-4 w-4" /> Theme
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          <h2 className="mb-3 text-sm font-bold">Select Theme Color</h2>
          <div className="grid grid-cols-5 gap-3">
            {colors.map((color, index) => <button key={`${color}-${index}`} type="button" aria-label={`Select ${color} theme`} aria-pressed={value === color} onClick={() => { onChange(color); setIsOpen(false) }} className={`h-6 w-6 cursor-pointer rounded-full border hover:border-black ${value === color ? 'border-black ring-2 ring-slate-300' : 'border-slate-200'}`} style={{ backgroundColor: color }} />)}
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeColor
