import { Moon, Sun } from 'lucide-react'
import { cn } from '../lib/utils.js'
import LiquidToggle from './ui/liquid-toggle.jsx'
import useTheme from '../theme/useTheme.js'

function ThemeToggle({ className = '', showLabel = false }) {
  const { isDark, toggleTheme } = useTheme()
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <div
      title={label}
      className={cn(
        'liquid-theme-toggle inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-[#1B342B]/20 px-3 text-[#1B342B] transition-colors hover:bg-[#C5F26E]/30 dark:border-white/20 dark:text-[#F2EFE6] dark:hover:bg-white/10',
        className,
      )}
    >
      <span aria-hidden="true" className="text-[#2C4A3E] dark:text-[#C5F26E]">
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </span>
      <LiquidToggle
        checked={isDark}
        onCheckedChange={toggleTheme}
        ariaLabel={label}
      />
      {showLabel && <span className="whitespace-nowrap text-sm font-semibold">{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </div>
  )
}

export default ThemeToggle
