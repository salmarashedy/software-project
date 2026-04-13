import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeMode = 'light' | 'dark'

interface UserProfile {
  name: string
  email: string
  avatarInitial: string
}

interface ProjectSummary {
  id: string
  name: string
  status: string
  tasks: number
}

interface TaskSummary {
  total: number
  completed: number
  pending: number
}

interface AppState {
  theme: ThemeMode
  toggleTheme: () => void
  user: UserProfile
  projects: ProjectSummary[]
  taskSummary: TaskSummary
}

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
      user: {
        name: 'Skylar Rose',
        email: 'skylar@devcollab.com',
        avatarInitial: 'S',
      },
      projects: [
        { id: '1', name: 'Sprint Planning', status: 'In Progress', tasks: 12 },
        { id: '2', name: 'Client Review', status: 'Awaiting Feedback', tasks: 5 },
        { id: '3', name: 'Release Prep', status: 'Completed', tasks: 8 },
      ],
      taskSummary: {
        total: 25,
        completed: 17,
        pending: 8,
      },
    }),
    {
      name: 'devcollab-app-store',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)

export default useAppStore
