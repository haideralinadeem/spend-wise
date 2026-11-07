import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-ghost p-2"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
