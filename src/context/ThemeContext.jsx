import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({})

const getSystemTheme = () => 
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const applyThemeToDOM = (themePreference) => {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  
  if (themePreference === 'system') {
    root.classList.add(getSystemTheme())
  } else {
    root.classList.add(themePreference)
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('socialspark-theme') || 'system'
  })

  useEffect(() => {
    applyThemeToDOM(theme)

    if (theme === 'system') {
      const matcher = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyThemeToDOM('system')
      matcher.addEventListener('change', handleChange)
      return () => matcher.removeEventListener('change', handleChange)
    }
  }, [theme])

  const setTheme = (newTheme) => {
    localStorage.setItem('socialspark-theme', newTheme)
    setThemeState(newTheme)
  }
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
