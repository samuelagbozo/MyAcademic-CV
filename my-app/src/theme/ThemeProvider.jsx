import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext.js'

const STORAGE_KEY = 'resumeai-theme'

function getInitialTheme() {
  const savedTheme = window.localStorage.getItem(STORAGE_KEY)
  return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light'
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)
  const isDark = theme === 'dark'

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [isDark, theme])

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark')
  }, [])

  const value = useMemo(() => ({ theme, isDark, toggleTheme }), [theme, isDark, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export { ThemeProvider }
