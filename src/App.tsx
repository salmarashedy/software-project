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
import Toast from './components/Toast';
import HeaderWidget from './components/HeaderWidget';




function Dashboard() {
  const user = useAppStore((state) => state.user)
  const projects = useAppStore((state) => state.projects)
  const taskSummary = useAppStore((state) => state.taskSummary)
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, visible: boolean}>({message: '', visible: false});
  const [tasks, setTasks] = useState(mockTasks);
  
const [currentView, setCurrentView] = useState<'cards' | 'list' | 'kanban'>('cards')

  const handleSaveTask = (data: { title: string; description: string }) => {
    const newTask = {
      id: String(Date.now()),
      title: data.title,
      description: data.description,
      status: 'To Do' as const,
      priority: 'Medium' as const,
      assignee: { name: user.name, avatar: '' },
      dueDate: new Date().toISOString().split('T')[0],
      tags: [],
    };
    setTasks([newTask, ...tasks]);
    setToast({ message: "Task created successfully", visible: true });
  }

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
          <div className="mb-8">
            <HeaderWidget />
          </div>
          <TaskModal isOpen={open} onClose={() => setOpen(false)} onSave={handleSaveTask} />
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
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {tasks.map((task: any, idx: number) => (
                    <TaskCard key={idx} task={task} onDelete={() => setToast({message: "Task deleted successfully", visible: true})} />
                  ))}
                </div>
              </div>
            )}

            {currentView === 'list' && (
              <div>
                <h3 className="text-xl font-bold text-dev-text-main mb-4">All Tasks (List View)</h3>
                <ListView tasks={tasks} />
              </div>
            )}

            {currentView === 'kanban' && (
              <div>
                <h3 className="text-xl font-bold text-dev-text-main mb-4">Project Board (Kanban)</h3>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <KanbanBoard tasks={tasks as any} />
              </div>
            )}
          </div>
          
      </div>
      <Toast message={toast.message} isVisible={toast.visible} onClose={() => setToast(prev => ({...prev, visible: false}))} />
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
