import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as api from '../services/api'
import { connectSocket } from '../services/socket'

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

export interface AppTask {
  id: string
  title: string
  description: string
  status: 'To Do' | 'In Progress' | 'Done'
  priority: 'High' | 'Medium' | 'Low'
  assignee: { name: string; avatar: string }
  dueDate: string
  tags: string[]
}

const taskToAppTask = (t: api.Task): AppTask => ({
  id: String(t.id),
  title: t.title,
  description: t.description,
  status: (t.status as AppTask['status']) || 'To Do',
  priority: (t.priority as AppTask['priority']) || 'Medium',
  assignee: {
    name: t.assignee_name || '',
    avatar: t.assignee_avatar || '',
  },
  dueDate: t.due_date || '',
  tags: t.tags || [],
});

const computeSummary = (tasks: AppTask[]): TaskSummary => ({
  total: tasks.length,
  completed: tasks.filter((t) => t.status === 'Done').length,
  pending: tasks.filter((t) => t.status !== 'Done').length,
});

interface AppState {
  theme: ThemeMode
  toggleTheme: () => void
  user: UserProfile
  projects: ProjectSummary[]
  taskSummary: TaskSummary
  tasks: AppTask[]
  loading: boolean
  addTask: (task: AppTask) => void
  updateTask: (id: string, data: Partial<AppTask>) => void
  removeTask: (id: string) => void
  fetchTasks: () => Promise<void>
  createTask: (data: { title: string; description: string }) => Promise<void>
  editTask: (id: string, data: { title: string; description: string }) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const socket = connectSocket();

      socket.on('task:updated', (updated: api.Task) => {
        const appTask = taskToAppTask(updated);
        set((state) => {
          const tasks = state.tasks.map((t) =>
            t.id === appTask.id ? appTask : t
          );
          return { tasks, taskSummary: computeSummary(tasks) };
        });
      });

      socket.on('task:deleted', ({ id }: { id: number }) => {
        const idStr = String(id);
        set((state) => {
          const tasks = state.tasks.filter((t) => t.id !== idStr);
          return { tasks, taskSummary: computeSummary(tasks) };
        });
      });

      return {
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
        taskSummary: { total: 0, completed: 0, pending: 0 },
        tasks: [],
        loading: false,

        addTask: (task) =>
          set((state) => {
            const tasks = [task, ...state.tasks];
            return { tasks, taskSummary: computeSummary(tasks) };
          }),

        updateTask: (id, data) =>
          set((state) => {
            const tasks = state.tasks.map((t) =>
              t.id === id ? { ...t, ...data } : t
            );
            return { tasks, taskSummary: computeSummary(tasks) };
          }),

        removeTask: (id) =>
          set((state) => {
            const tasks = state.tasks.filter((t) => t.id !== id);
            return { tasks, taskSummary: computeSummary(tasks) };
          }),

        fetchTasks: async () => {
          set({ loading: true });
          try {
            const data = await api.fetchTasks();
            const tasks = data.map(taskToAppTask);
            set({ tasks, taskSummary: computeSummary(tasks), loading: false });
          } catch {
            set({ loading: false });
          }
        },

        createTask: async ({ title, description }) => {
          const data = await api.createTask({ title, description });
          const appTask = taskToAppTask(data);
          get().addTask(appTask);
        },

        editTask: async (id, { title, description }) => {
          const data = await api.updateTask(Number(id), { title, description });
          const appTask = taskToAppTask(data);
          get().updateTask(id, appTask);
        },

        deleteTask: async (id) => {
          await api.deleteTask(Number(id));
          get().removeTask(id);
        },
      };
    },
    {
      name: 'devcollab-app-store',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)

export default useAppStore
