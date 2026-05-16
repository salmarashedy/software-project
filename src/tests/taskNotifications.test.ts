import { describe, it, expect } from 'vitest'
import { buildTaskNotifications, TaskNotificationSource } from '../utils/taskNotifications'

describe('buildTaskNotifications', () => {
  const createMockTask = (id: string, daysOffset: number, status = 'To Do', priority = 'Medium'): TaskNotificationSource => {
    const date = new Date()
    date.setDate(date.getDate() + daysOffset)
    return {
      id,
      title: `Task ${id}`,
      description: 'Desc',
      status,
      priority,
      dueDate: date.toISOString().split('T')[0],
      projectName: 'Project A',
    }
  }

  it('should return empty array if no tasks', () => {
    const notifications = buildTaskNotifications([], [])
    expect(notifications).toHaveLength(0)
  })

  it('should ignore Done tasks', () => {
    const task = createMockTask('1', -1, 'Done')
    const notifications = buildTaskNotifications([task], [])
    expect(notifications).toHaveLength(0)
  })

  it('should flag overdue tasks as critical', () => {
    const task = createMockTask('1', -2)
    const notifications = buildTaskNotifications([task], [])
    expect(notifications).toHaveLength(1)
    expect(notifications[0].severity).toBe('critical')
    expect(notifications[0].type).toBe('overdue')
  })

  it('should flag due today tasks as critical', () => {
    const task = createMockTask('1', 0)
    const notifications = buildTaskNotifications([task], [])
    expect(notifications).toHaveLength(1)
    expect(notifications[0].severity).toBe('critical')
    expect(notifications[0].type).toBe('due-today')
  })

  it('should ignore dismissed notifications', () => {
    const task = createMockTask('1', 0)
    // The key format is type:taskId:dueDate:status
    const expectedKey = `due-today:1:${task.dueDate}:To Do`
    const notifications = buildTaskNotifications([task], [expectedKey])
    expect(notifications).toHaveLength(0)
  })
})
