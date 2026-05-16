export type TaskNotificationSeverity = 'critical' | 'warning' | 'info'

export interface TaskNotificationSource {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  projectName: string | null
}

export interface TaskNotification {
  key: string
  taskId: string
  type: 'overdue' | 'due-today' | 'due-soon' | 'due-this-week' | 'high-priority'
  severity: TaskNotificationSeverity
  title: string
  message: string
  dueDate: string
  dueDateLabel: string
  projectName: string | null
  priority: string
  daysRemaining: number
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

const parseDueDate = (value: string) => {
  if (!value) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const startOfLocalDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const formatDueDateLabel = (daysRemaining: number) => {
  if (daysRemaining < 0) {
    const lateBy = Math.abs(daysRemaining)
    return lateBy === 1 ? '1 day overdue' : `${lateBy} days overdue`
  }

  if (daysRemaining === 0) return 'Due today'
  if (daysRemaining === 1) return 'Due tomorrow'
  return `Due in ${daysRemaining} days`
}

const buildNotification = (
  task: TaskNotificationSource,
  type: TaskNotification['type'],
  severity: TaskNotificationSeverity,
  daysRemaining: number,
  message: string,
): TaskNotification => ({
  key: `${type}:${task.id}:${task.dueDate}:${task.status}`,
  taskId: task.id,
  type,
  severity,
  title: task.title,
  message,
  dueDate: task.dueDate,
  dueDateLabel: formatDueDateLabel(daysRemaining),
  projectName: task.projectName,
  priority: task.priority,
  daysRemaining,
})

export const buildTaskNotifications = (
  tasks: TaskNotificationSource[],
  dismissedKeys: string[],
  now = new Date(),
): TaskNotification[] => {
  const seen = new Set(dismissedKeys)
  const today = startOfLocalDay(now)
  const notifications: TaskNotification[] = []

  for (const task of tasks) {
    if (task.status === 'Done' || !task.dueDate) continue

    const dueDate = parseDueDate(task.dueDate)
    if (!dueDate) continue

    const daysRemaining = Math.round((startOfLocalDay(dueDate).getTime() - today.getTime()) / MS_PER_DAY)

    const overdue = daysRemaining < 0
    const dueToday = daysRemaining === 0
    const dueSoon = daysRemaining > 0 && daysRemaining <= 2
    const dueThisWeek = daysRemaining > 2 && daysRemaining <= 7
    const highPrioritySoon = task.priority === 'High' && daysRemaining > 2 && daysRemaining <= 7

    if (overdue) {
      const notification = buildNotification(
        task,
        'overdue',
        'critical',
        daysRemaining,
        `This task is overdue and needs attention immediately.`,
      )
      if (!seen.has(notification.key)) notifications.push(notification)
      continue
    }

    if (dueToday) {
      const notification = buildNotification(
        task,
        'due-today',
        'critical',
        daysRemaining,
        `This task is due today.`,
      )
      if (!seen.has(notification.key)) notifications.push(notification)
      continue
    }

    if (dueSoon) {
      const label = daysRemaining === 1 ? 'tomorrow' : 'within 2 days'
      const notification = buildNotification(
        task,
        'due-soon',
        'warning',
        daysRemaining,
        `This task is due ${label}.`,
      )
      if (!seen.has(notification.key)) notifications.push(notification)
      continue
    }

    if (highPrioritySoon) {
      const notification = buildNotification(
        task,
        'high-priority',
        'warning',
        daysRemaining,
        `High-priority work is due this week.`,
      )
      if (!seen.has(notification.key)) notifications.push(notification)
      continue
    }

    if (dueThisWeek) {
      const notification = buildNotification(
        task,
        'due-this-week',
        'info',
        daysRemaining,
        `This task is due this week.`,
      )
      if (!seen.has(notification.key)) notifications.push(notification)
    }
  }

  return notifications.sort((left, right) => {
    const severityOrder: Record<TaskNotificationSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
    }

    const severityDelta = severityOrder[left.severity] - severityOrder[right.severity]
    if (severityDelta !== 0) return severityDelta

    return left.daysRemaining - right.daysRemaining
  })
}
