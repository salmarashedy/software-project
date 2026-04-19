import { useState, useEffect } from 'react'
import TaskModal from "./components/task/TaskModal";
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from "./components/Layout"
import Planning from './pages/Planning'
import Login from './pages/Login'
import Register from './pages/Register'
import useAppStore from './stores/useAppStore'
import mockTasks from './data/mockTasks.json';
import TaskCard from './components/TaskCard';
import ListView from "./components/ListView";  // ✅ CORRECT - matches your folder structure
import KanbanBoard from './components/KanbanBoard';






function Dashboard() {
  const user = useAppStore((state) => state.user)
  const projects = useAppStore((state) => state.projects)
  const taskSummary = useAppStore((state) => state.taskSummary)
  const [open, setOpen] = useState(false);
  
const [currentView, setCurrentView] = useState<'cards' | 'list' | 'kanban'>('cards')

  return (
    <div>
        <div className="p-8">
          <div className="mb-6 flex justify-start">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-white font-medium shadow-lg shadow-violet-500/20 transition transform hover:brightness-110 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <span className="text-xl leading-none">+</span>
              New Task
            </button>
          </div>
          <TaskModal isOpen={open} onClose={() => setOpen(false)} />
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

          <div className="mt-8 flex gap-2">
            <button
              onClick={() => setCurrentView('cards')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'cards' 
                  ? 'bg-[#6C3BFF] text-white' 
                  : 'bg-[#22223B] text-[#9CA3AF] hover:text-[#E5E7EB]'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'list' 
                  ? 'bg-[#6C3BFF] text-white' 
                  : 'bg-[#22223B] text-[#9CA3AF] hover:text-[#E5E7EB]'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setCurrentView('kanban')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'kanban' 
                  ? 'bg-[#6C3BFF] text-white' 
                  : 'bg-[#22223B] text-[#9CA3AF] hover:text-[#E5E7EB]'
              }`}
            >
              Kanban
            </button>
          </div>

          <div className="mt-8">
            {currentView === 'cards' && (
              <div>
                <h3 className="text-xl font-bold text-dev-text-main mb-4">Recent Tasks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockTasks.map((task: any) => (


                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {currentView === 'list' && (
              <div>
                <h3 className="text-xl font-bold text-dev-text-main mb-4">All Tasks (List View)</h3>
                <ListView />
              </div>
            )}

            {currentView === 'kanban' && (
              <div>
                <h3 className="text-xl font-bold text-dev-text-main mb-4">Project Board (Kanban)</h3>
                <KanbanBoard />
              </div>
            )}
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
      <Route element={<Layout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/planning" element={<Planning />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App
