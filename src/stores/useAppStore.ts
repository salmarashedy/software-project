import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as api from '../services/api'
import { connectSocket } from '../services/socket'
import { buildTaskNotifications } from '../utils/taskNotifications'

type ThemeMode = 'light' | 'dark'
type DashboardView = 'cards' | 'list' | 'kanban'

interface UserProfile {
  name: string
  email: string
  avatarInitial: string
}

interface ProjectSummary {
  id: string
  name: string
  description: string
  color: string
  taskCount: number
  memberCount: number
  isOwner: boolean
}

interface TaskSummary {
  total: number
  completed: number
  pending: number
}

interface AppNotification {
  key: string
  taskId: string
  type: 'overdue' | 'due-today' | 'due-soon' | 'due-this-week' | 'high-priority'
  severity: 'critical' | 'warning' | 'info'
  title: string
  message: string
  dueDate: string
  dueDateLabel: string
  projectName: string | null
  priority: string
  daysRemaining: number
}

const normalizeQuery = (value: string) => value.trim().toLowerCase()

export const taskMatchesQuery = (task: AppTask, query: string) => {
  const normalized = normalizeQuery(query)
  if (!normalized) return true

  const haystack = [
    task.title,
    task.description,
    task.status,
    task.priority,
    task.assignee.name,
    task.assignee.avatar,
    task.dueDate,
    task.tags.join(' '),
    task.projectName,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(normalized)
}

export interface AppTask {
  id: string
  projectId: string | null
  projectName: string | null
  title: string
  description: string
  status: 'To Do' | 'In Progress' | 'Done'
  priority: 'High' | 'Medium' | 'Low'
  assignee: { name: string; avatar: string }
  assigneeUserId: string
  dueDate: string
  tags: string[]
}

export interface TaskFormData {
  title: string
  description: string
  projectId: string
  status: AppTask['status']
  priority: AppTask['priority']
  assignee: { name: string; avatar: string }
  assigneeUserId: string
  dueDate: string
  tags: string[]
}

const taskToAppTask = (t: api.Task): AppTask => ({
  id: String(t.id),
  projectId: t.project_id !== null ? String(t.project_id) : null,
  projectName: t.project_name || null,
  title: t.title,
  description: t.description,
  status: (t.status as AppTask['status']) || 'To Do',
  priority: (t.priority as AppTask['priority']) || 'Medium',
  assignee: {
    name: t.assignee_name || '',
    avatar: t.assignee_avatar || '',
  },
  assigneeUserId: t.assignee_user_id !== null ? String(t.assignee_user_id) : '',
  dueDate: t.due_date || '',
  tags: t.tags || [],
});

const taskFormDataToApiData = (data: Partial<TaskFormData>): Partial<api.TaskData> => ({
  ...(data.title !== undefined ? { title: data.title } : {}),
  ...(data.description !== undefined ? { description: data.description } : {}),
  ...(data.projectId !== undefined && data.projectId !== ''
    ? { project_id: Number(data.projectId) }
    : {}),
  ...(data.status !== undefined ? { status: data.status } : {}),
  ...(data.priority !== undefined ? { priority: data.priority } : {}),
  ...(data.assigneeUserId !== undefined
    ? { assignee_user_id: data.assigneeUserId ? Number(data.assigneeUserId) : null }
    : {}),
  ...(data.assignee?.avatar !== undefined ? { assignee_avatar: data.assignee.avatar } : {}),
  ...(data.dueDate !== undefined ? { due_date: data.dueDate || undefined } : {}),
  ...(data.tags !== undefined ? { tags: data.tags } : {}),
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
  notifications: AppNotification[]
  dismissedNotificationKeys: string[]
  searchTerm: string
  activeProjectId: string
  dashboardView: DashboardView
  hideCompletedInDashboard: boolean
  loading: boolean
  addTask: (task: AppTask) => void
  updateTask: (id: string, data: Partial<AppTask>) => void
  removeTask: (id: string) => void
  fetchTasks: () => Promise<void>
  fetchProjects: () => Promise<void>
  createTask: (data: TaskFormData) => Promise<void>
  editTask: (id: string, data: Partial<TaskFormData>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  createProject: (data: { name: string; description?: string; color?: string }) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setUser: (user: Partial<UserProfile>) => void
  clearUser: () => void
  refreshNotifications: () => void
  dismissNotification: (key: string) => void
  dismissAllNotifications: () => void
  setSearchTerm: (term: string) => void
  clearSearchTerm: () => void
  setDashboardView: (view: DashboardView) => void
  toggleHideCompletedInDashboard: () => void
  setActiveProjectId: (projectId: string) => void
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

      socket.on('task:created', (created: api.Task) => {
        const appTask = taskToAppTask(created)
        set((state) => {
          if (state.tasks.some(t => t.id === appTask.id)) return state;
          const tasks = [appTask, ...state.tasks]
          return { tasks, taskSummary: computeSummary(tasks) }
        })
      })

      return {
        theme: 'dark',
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === 'dark' ? 'light' : 'dark',
          })),
        user: {
          name: '',
          email: '',
          avatarInitial: '',
        },
        projects: [],
        taskSummary: { total: 0, completed: 0, pending: 0 },
        tasks: [],
        notifications: [],
        dismissedNotificationKeys: [],
        searchTerm: '',
        activeProjectId: 'all',
        dashboardView: 'cards',
        hideCompletedInDashboard: false,
        loading: false,

        refreshNotifications: () =>
          set((state) => ({
            notifications: buildTaskNotifications(
              state.tasks,
              state.dismissedNotificationKeys,
              new Date(),
            ),
          })),

        dismissNotification: (key) =>
          set((state) => {
            const dismissedNotificationKeys = state.dismissedNotificationKeys.includes(key)
              ? state.dismissedNotificationKeys
              : [...state.dismissedNotificationKeys, key]

            return {
              dismissedNotificationKeys,
              notifications: buildTaskNotifications(state.tasks, dismissedNotificationKeys, new Date()),
            }
          }),

        dismissAllNotifications: () =>
          set((state) => {
            const dismissedNotificationKeys = [
              ...new Set([
                ...state.dismissedNotificationKeys,
                ...buildTaskNotifications(state.tasks, state.dismissedNotificationKeys, new Date()).map((notification) => notification.key),
              ]),
            ]

            return {
              dismissedNotificationKeys,
              notifications: [],
            }
          }),

        addTask: (task) =>
          set((state) => {
            if (state.tasks.some(t => t.id === task.id)) return state;
            const tasks = [task, ...state.tasks];
            return {
              tasks,
              taskSummary: computeSummary(tasks),
              notifications: buildTaskNotifications(tasks, state.dismissedNotificationKeys, new Date()),
            };
          }),

        updateTask: (id, data) =>
          set((state) => {
            const tasks = state.tasks.map((t) =>
              t.id === id ? { ...t, ...data } : t
            );
            return {
              tasks,
              taskSummary: computeSummary(tasks),
              notifications: buildTaskNotifications(tasks, state.dismissedNotificationKeys, new Date()),
            };
          }),

        removeTask: (id) =>
          set((state) => {
            const tasks = state.tasks.filter((t) => t.id !== id);
            return {
              tasks,
              taskSummary: computeSummary(tasks),
              notifications: buildTaskNotifications(tasks, state.dismissedNotificationKeys, new Date()),
            };
          }),

        fetchTasks: async () => {
          set({ loading: true });
          try {
            const data = await api.fetchTasks();
            const tasks = data.map(taskToAppTask);
            set((state) => ({
              tasks,
              taskSummary: computeSummary(tasks),
              notifications: buildTaskNotifications(tasks, state.dismissedNotificationKeys, new Date()),
              loading: false,
            }));
          } catch {
            set({ loading: false });
          }
        },

        fetchProjects: async () => {
          try {
            const data = await api.fetchProjects();
            const projects = data.map((project) => ({
              id: String(project.id),
              name: project.name,
              description: project.description,
              color: project.color,
              taskCount: project.task_count,
              memberCount: project.member_count,
              isOwner: project.is_owner,
            }));
            set((state) => ({
              projects,
              activeProjectId:
                state.activeProjectId === 'all' && projects.length > 0
                  ? projects[0].id
                  : state.activeProjectId,
            }));
          } catch {
            set({ projects: [] });
          }
        },

        createTask: async (data) => {
          const created = await api.createTask(taskFormDataToApiData(data) as api.TaskData);
          const appTask = taskToAppTask(created);
          get().addTask(appTask);
        },

        editTask: async (id, data) => {
          const updated = await api.updateTask(Number(id), taskFormDataToApiData(data));
          const appTask = taskToAppTask(updated);
          get().updateTask(id, appTask);
        },

        deleteTask: async (id) => {
          await api.deleteTask(Number(id));
          get().removeTask(id);
        },
        createProject: async (data) => {
          const created = await api.createProject(data);
          const project = {
            id: String(created.id),
            name: created.name,
            description: created.description,
            color: created.color,
            taskCount: created.task_count,
            memberCount: created.member_count,
            isOwner: created.is_owner,
          };
          set((state) => ({
            projects: [...state.projects, project],
            activeProjectId: project.id,
          }));
        },
        deleteProject: async (id) => {
          await api.deleteProject(Number(id));
          set((state) => {
            const projects = state.projects.filter((p) => p.id !== id);
            return {
              projects,
              activeProjectId: state.activeProjectId === id ? 'all' : state.activeProjectId,
            };
          });
        },
        setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
        clearUser: () => set({ user: { name: '', email: '', avatarInitial: '' }, dismissedNotificationKeys: [], notifications: [] }),
        setSearchTerm: (term) => set({ searchTerm: term }),
        clearSearchTerm: () => set({ searchTerm: '' }),
        setDashboardView: (view) => set({ dashboardView: view }),
        toggleHideCompletedInDashboard: () =>
          set((state) => ({ hideCompletedInDashboard: !state.hideCompletedInDashboard })),
        setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
      };
    },
    {
      name: 'devcollab-app-store',
      partialize: (state) => ({
        theme: state.theme,
        dashboardView: state.dashboardView,
        hideCompletedInDashboard: state.hideCompletedInDashboard,
        dismissedNotificationKeys: state.dismissedNotificationKeys,
      }),
    },
  ),
)

export default useAppStore
