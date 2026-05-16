import { useEffect, useMemo, useState } from 'react'
import { Clock3, Edit3, Inbox, ListChecks, Plus, Trash2 } from 'lucide-react'
import TaskModal from '../components/task/TaskModal'
import useAppStore, { type AppTask, taskMatchesQuery } from '../stores/useAppStore'

type TaskSection = {
  key: string
  title: string
  description: string
  emptyMessage: string
  tasks: AppTask[]
  tone: 'critical' | 'warning' | 'neutral' | 'calm'
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate())

const parseDueDate = (value: string) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const daysUntil = (value: string) => {
  const parsed = parseDueDate(value)
  if (!parsed) return null
  return Math.round((startOfDay(parsed).getTime() - startOfDay(new Date()).getTime()) / MS_PER_DAY)
}

const formatRelativeDate = (value: string) => {
  const remaining = daysUntil(value)
  if (remaining === null) return 'No due date'
  if (remaining < 0) return `${Math.abs(remaining)} day${Math.abs(remaining) === 1 ? '' : 's'} overdue`
  if (remaining === 0) return 'Due today'
  if (remaining === 1) return 'Due tomorrow'
  return `Due in ${remaining} days`
}

const getToneClasses = (tone: TaskSection['tone']) => {
  switch (tone) {
    case 'critical':
      return 'border-red-500/30 bg-red-500/10'
    case 'warning':
      return 'border-amber-500/30 bg-amber-500/10'
    case 'calm':
      return 'border-sky-500/30 bg-sky-500/10'
    default:
      return 'border-dev-border bg-dev-card'
  }
}

export default function Tasks() {
  const tasks = useAppStore((state) => state.tasks)
  const projects = useAppStore((state) => state.projects)
  const searchTerm = useAppStore((state) => state.searchTerm)
  const activeProjectId = useAppStore((state) => state.activeProjectId)
  const hideCompletedInDashboard = useAppStore((state) => state.hideCompletedInDashboard)
  const fetchTasks = useAppStore((state) => state.fetchTasks)
  const deleteTask = useAppStore((state) => state.deleteTask)
  const [isOpen, setIsOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<AppTask | null>(null)

  useEffect(() => {
    void fetchTasks()
  }, [fetchTasks])

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (activeProjectId !== 'all' && task.projectId !== activeProjectId) return false
      if (hideCompletedInDashboard && task.status === 'Done') return false
      return taskMatchesQuery(task, searchTerm)
    })
  }, [activeProjectId, hideCompletedInDashboard, searchTerm, tasks])

  const sections = useMemo<TaskSection[]>(() => {
    const overdue = visibleTasks.filter((task) => {
      const remaining = task.dueDate ? daysUntil(task.dueDate) : null
      return remaining !== null && remaining < 0
    })

    const dueSoon = visibleTasks.filter((task) => {
      const remaining = task.dueDate ? daysUntil(task.dueDate) : null
      return remaining !== null && remaining >= 0 && remaining <= 2
    })

    const thisWeek = visibleTasks.filter((task) => {
      const remaining = task.dueDate ? daysUntil(task.dueDate) : null
      return remaining !== null && remaining > 2 && remaining <= 7
    })

    const noDueDate = visibleTasks.filter((task) => !task.dueDate)

    const backlog = visibleTasks.filter((task) => {
      const remaining = task.dueDate ? daysUntil(task.dueDate) : null
      return remaining !== null && remaining > 7
    })

    const sectionList: TaskSection[] = [
      {
        key: 'overdue',
        title: 'Overdue',
        description: 'Work that is already late and should be handled first.',
        emptyMessage: 'Nothing is overdue right now.',
        tasks: overdue,
        tone: 'critical',
      },
      {
        key: 'due-soon',
        title: 'Due Soon',
        description: 'Tasks with two days or less remaining.',
        emptyMessage: 'No tasks are due within the next two days.',
        tasks: dueSoon,
        tone: 'warning',
      },
      {
        key: 'week',
        title: 'This Week',
        description: 'Tasks due later this week.',
        emptyMessage: 'Nothing else is due this week.',
        tasks: thisWeek,
        tone: 'calm',
      },
      {
        key: 'no-date',
        title: 'No Due Date',
        description: 'Tasks that need a timeline assigned.',
        emptyMessage: 'Every visible task has a due date.',
        tasks: noDueDate,
        tone: 'neutral',
      },
      {
        key: 'backlog',
        title: 'Backlog',
        description: 'Tasks with more breathing room.',
        emptyMessage: 'No long-range tasks found.',
        tasks: backlog,
        tone: 'neutral',
      },
    ]

    return sectionList.filter((section) => section.tasks.length > 0 || section.key === 'no-date')
  }, [visibleTasks])

  const projectName =
    activeProjectId === 'all'
      ? 'All Projects'
      : projects.find((project) => project.id === activeProjectId)?.name || 'All Projects'

  const handleEdit = (task: AppTask) => {
    setEditingTask(task)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setEditingTask(null)
  }

  const handleSave = () => {
    setIsOpen(false)
    setEditingTask(null)
  }

  const handleDelete = async (id: string) => {
    await deleteTask(id)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-dev-border bg-dev-surface p-6 shadow-lg shadow-black/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-dev-border bg-dev-card px-3 py-1 text-xs text-dev-text-muted">
              <Inbox className="h-3.5 w-3.5" />
              Task queue
            </div>
            <h1 className="mt-3 text-3xl font-bold text-dev-text-main">Task Queue</h1>
            <p className="mt-2 max-w-2xl text-sm text-dev-text-muted">
              A prioritized queue that surfaces overdue work, due-soon items, and tasks without timelines so you can decide what needs attention next.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-dev-border bg-dev-card p-4">
            <p className="text-xs uppercase tracking-wide text-dev-text-muted">Visible tasks</p>
            <p className="mt-2 text-3xl font-bold text-dev-text-main">{visibleTasks.length}</p>
          </div>
          <div className="rounded-2xl border border-dev-border bg-dev-card p-4">
            <p className="text-xs uppercase tracking-wide text-dev-text-muted">Overdue</p>
            <p className="mt-2 text-3xl font-bold text-red-300">
              {sections.find((section) => section.key === 'overdue')?.tasks.length || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-dev-border bg-dev-card p-4">
            <p className="text-xs uppercase tracking-wide text-dev-text-muted">Due soon</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">
              {sections.find((section) => section.key === 'due-soon')?.tasks.length || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-dev-border bg-dev-card p-4">
            <p className="text-xs uppercase tracking-wide text-dev-text-muted">Project scope</p>
            <p className="mt-2 text-lg font-semibold text-dev-text-main">{projectName}</p>
          </div>
        </div>
      </div>

      {sections.length > 0 ? (
        sections.map((section) => (
          <section key={section.key} className={`rounded-3xl border p-5 ${getToneClasses(section.tone)}`}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-dev-text-main">{section.title}</h2>
                <p className="mt-1 text-sm text-dev-text-muted">{section.description}</p>
              </div>
              <span className="rounded-full bg-dev-card px-3 py-1 text-xs font-semibold text-dev-text-main">
                {section.tasks.length}
              </span>
            </div>

            {section.tasks.length > 0 ? (
              <div className="space-y-3">
                {section.tasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-2xl border border-dev-border/80 bg-dev-surface/70 p-4 transition hover:border-violet-500/40 hover:bg-dev-card/80"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-dev-card px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-dev-text-main">
                            {task.priority}
                          </span>
                          <span className="rounded-full bg-dev-card px-2.5 py-1 text-[11px] text-dev-text-muted">
                            {task.status}
                          </span>
                          {task.projectName ? (
                            <span className="rounded-full bg-dev-card px-2.5 py-1 text-[11px] text-dev-text-muted">
                              {task.projectName}
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-3 truncate text-lg font-semibold text-dev-text-main">{task.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-dev-text-muted">{task.description || 'No description provided.'}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-dev-text-muted">
                          <span className="inline-flex items-center gap-1 rounded-full bg-dev-card px-2.5 py-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatRelativeDate(task.dueDate)}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-dev-card px-2.5 py-1">
                            <ListChecks className="h-3.5 w-3.5" />
                            {task.tags.length > 0 ? task.tags.join(', ') : 'No tags'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start lg:self-center">
                        <button
                          type="button"
                          onClick={() => handleEdit(task)}
                          className="inline-flex items-center gap-2 rounded-lg border border-dev-border bg-dev-card px-3 py-2 text-sm text-dev-text-main transition hover:bg-dev-border"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(task.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-dev-border/70 bg-dev-surface/50 p-5 text-sm text-dev-text-muted">
                {section.emptyMessage}
              </div>
            )}
          </section>
        ))
      ) : (
        <div className="rounded-3xl border border-dashed border-dev-border bg-dev-surface p-8 text-center text-dev-text-muted">
          No visible tasks match the current filters.
        </div>
      )}

      <TaskModal isOpen={isOpen} onClose={handleClose} onSave={handleSave} task={editingTask} />
    </div>
  )
}