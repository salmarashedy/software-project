import { LayoutGrid, List, Calendar, Sun, Moon, Settings } from 'lucide-react'
import useAppStore from '../stores/useAppStore'
import { NavLink } from 'react-router-dom'
function Sidebar() {
  const theme = useAppStore((state) => state.theme)
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <div className="w-20 bg-dev-surface border-r border-dev-border h-screen flex flex-col items-center py-6">
      {/* Logo */}
      <div className="w-12 h-12 bg-dev-accent rounded-xl flex items-center justify-center mb-8">
        <span className="text-white font-bold text-xl">T</span>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-4">
        <NavLink 
          to="/dashboard"
          className={({ isActive }) =>
            `w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isActive 
                ? "bg-dev-accent text-white" 
                : "bg-dev-card text-dev-text-muted hover:bg-dev-border"
            }`
          }
        >
          <LayoutGrid className="w-6 h-6" />
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isActive
                ? 'bg-dev-accent text-white'
                : 'bg-dev-card text-dev-text-muted hover:bg-dev-border'
            }`
          }
          title="Task queue"
          aria-label="Task queue"
        >
          <List className="w-6 h-6" />
        </NavLink>
        <NavLink 
          to="/planning"
          className={({ isActive }) =>
            `w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isActive 
                ? "bg-dev-accent text-white" 
                : "bg-dev-card text-dev-text-muted hover:bg-dev-border"
            }`
          }
        >
          <Calendar className="w-6 h-6" />
        </NavLink>
      </div>
      {/* Bottom Icons */}
      <div className="mt-auto flex flex-col gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-12 h-12 bg-dev-card rounded-xl flex items-center justify-center hover:bg-dev-border"
          title="Toggle theme"
        >
          {isDark ? <Sun className="text-dev-text-muted w-6 h-6" /> : <Moon className="text-dev-text-muted w-6 h-6" />}
        </button>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isActive
                ? 'bg-dev-accent text-white'
                : 'bg-dev-card text-dev-text-muted hover:bg-dev-border'
            }`
          }
        >
          <Settings className="w-6 h-6" />
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
