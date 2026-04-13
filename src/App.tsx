import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import useAppStore from './stores/useAppStore'

function Dashboard() {
  const user = useAppStore((state) => state.user)
  const projects = useAppStore((state) => state.projects)
  const taskSummary = useAppStore((state) => state.taskSummary)

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-dev-bg min-h-screen">
        <Header />
        <div className="p-8">
          <div className="rounded-3xl bg-dev-surface border border-dev-border p-8 mb-8">
            <p className="text-sm text-dev-text-muted">Welcome back,</p>
            <h2 className="text-3xl font-bold text-dev-text-main">{user.name}</h2>
            <p className="text-dev-text-muted mt-2">
              {projects.length} active projects · {taskSummary.total} tasks
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl bg-dev-card border border-dev-border p-6">
              <p className="text-sm text-dev-text-muted">Projects</p>
              <p className="mt-4 text-4xl font-bold text-dev-text-main">{projects.length}</p>
            </div>
            <div className="rounded-3xl bg-dev-card border border-dev-border p-6">
              <p className="text-sm text-dev-text-muted">Completed</p>
              <p className="mt-4 text-4xl font-bold text-dev-text-main">{taskSummary.completed}</p>
            </div>
            <div className="rounded-3xl bg-dev-card border border-dev-border p-6">
              <p className="text-sm text-dev-text-muted">Pending</p>
              <p className="mt-4 text-4xl font-bold text-dev-text-main">{taskSummary.pending}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.classList.toggle('light', theme === 'light')
  }, [theme])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App
