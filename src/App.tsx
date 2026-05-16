import { useState, useEffect } from 'react'
import TaskModal from "./components/task/TaskModal";
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from "./components/Layout"
import Planning from './pages/Planning'
import Tasks from './pages/Tasks'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import useAppStore, { type AppTask } from './stores/useAppStore'
import { taskMatchesQuery } from './stores/useAppStore'
import TaskCard from './components/TaskCard';
import ListView from "./components/ListView";
import KanbanBoard from './components/KanbanBoard';
import Toast from './components/Toast';
import HeaderWidget from './components/HeaderWidget';

function Dashboard() {
  const user = useAppStore((state) => state.user)
  const projects = useAppStore((state) => state.projects)
  const tasks = useAppStore((state) => state.tasks)
  const searchTerm = useAppStore((state) => state.searchTerm)
  const activeProjectId = useAppStore((state) => state.activeProjectId)
  const dashboardView = useAppStore((state) => state.dashboardView)
  const hideCompletedInDashboard = useAppStore((state) => state.hideCompletedInDashboard)
  const setDashboardView = useAppStore((state) => state.setDashboardView)
  const fetchTasks = useAppStore((state) => state.fetchTasks)
  const deleteTask = useAppStore((state) => state.deleteTask)
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AppTask | null>(null);
  const [toast, setToast] = useState<{message: string, visible: boolean}>({message: '', visible: false});

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

const [currentView, setCurrentView] = useState<'cards' | 'list' | 'kanban'>(dashboardView)

  useEffect(() => {
    setCurrentView(dashboardView)
  }, [dashboardView])

  const visibleTasks = tasks.filter((task) => {
    if (activeProjectId !== 'all' && task.projectId !== activeProjectId) return false
    if (hideCompletedInDashboard && task.status === 'Done') return false
    return taskMatchesQuery(task, searchTerm)
  })

  const visibleTaskSummary = visibleTasks.reduce(
    (summary, task) => ({
      total: summary.total + 1,
      completed: summary.completed + (task.status === 'Done' ? 1 : 0),
      pending: summary.pending + (task.status !== 'Done' ? 1 : 0),
    }),
    { total: 0, completed: 0, pending: 0 },
  )

  const handleEditTask = (task: AppTask) => {
    setEditingTask(task);
    setOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setToast({ message: "Task deleted successfully", visible: true });
    } catch {
      setToast({ message: "Failed to delete task", visible: true });
    }
  };

  const handleModalClose = () => {
    setOpen(false);
    setEditingTask(null);
  };

  const handleModalSave = () => {
    setToast({ message: editingTask ? "Task updated successfully" : "Task created successfully", visible: true });
  };

  return (
    <div>
        <div className="p-8">
          <div className="mb-6 flex justify-start">
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-white font-medium shadow-lg shadow-violet-500/20 transition transform hover:brightness-110 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <span className="text-xl leading-none">+</span>
              New Task
            </button>
          </div>
          <div className="mb-8">
            <HeaderWidget />
          </div>
          <TaskModal isOpen={open} onClose={handleModalClose} onSave={handleModalSave} task={editingTask} />
          <div className="rounded-3xl bg-dev-surface border border-dev-border p-8 mb-8">
            <p className="text-sm text-dev-text-muted">Welcome back,</p>
            <h2 className="text-3xl font-bold text-dev-text-main">{user.name || 'there'}</h2>
            {user.email ? <p className="text-sm text-dev-text-muted mt-1">{user.email}</p> : null}
            <p className="text-dev-text-muted mt-2">
              {projects.length} active projects · {visibleTaskSummary.total} tasks in view
            </p>
            {searchTerm ? (
              <p className="text-sm text-dev-text-muted mt-2">
                Showing {visibleTasks.length} of {tasks.length} tasks for “{searchTerm}”
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl bg-dev-card border border-dev-border p-6">
              <p className="text-sm text-dev-text-muted">Projects</p>
              <p className="mt-4 text-4xl font-bold text-dev-text-main">{projects.length}</p>
            </div>
            <div className="rounded-3xl bg-dev-card border border-dev-border p-6">
              <p className="text-sm text-dev-text-muted">Completed</p>
              <p className="mt-4 text-4xl font-bold text-dev-text-main">{visibleTaskSummary.completed}</p>
            </div>
            <div className="rounded-3xl bg-dev-card border border-dev-border p-6">
              <p className="text-sm text-dev-text-muted">Pending</p>
              <p className="mt-4 text-4xl font-bold text-dev-text-main">{visibleTaskSummary.pending}</p>
            </div>
          </div>

          <div className="mt-8 flex gap-2">
            <button
              onClick={() => {
                setCurrentView('cards')
                setDashboardView('cards')
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'cards' 
                  ? 'bg-[#6C3BFF] text-white' 
                  : 'bg-[#22223B] text-[#9CA3AF] hover:text-[#E5E7EB]'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => {
                setCurrentView('list')
                setDashboardView('list')
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'list' 
                  ? 'bg-[#6C3BFF] text-white' 
                  : 'bg-[#22223B] text-[#9CA3AF] hover:text-[#E5E7EB]'
              }`}
            >
              List
            </button>
            <button
              onClick={() => {
                setCurrentView('kanban')
                setDashboardView('kanban')
              }}
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
                  {visibleTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onDelete={handleDeleteTask} onEdit={handleEditTask} />
                  ))}
                </div>
              </div>
            )}

            {currentView === 'list' && (
              <div>
                <h3 className="text-xl font-bold text-dev-text-main mb-4">All Tasks (List View)</h3>
                <ListView tasks={visibleTasks} />
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
      <Toast message={toast.message} isVisible={toast.visible} onClose={() => setToast(prev => ({...prev, visible: false}))} />
    </div>
  )
}

import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
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
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App
