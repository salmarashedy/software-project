import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import useAppStore from '../stores/useAppStore'

// --- 1. MODULAR TYPES & MOCK DATA ---
type Task = {
  id: string | number
  projectId: string | null
  name: string
  start_date: string // ISO string
  end_date: string   // ISO string
  color: string      // Tailwind color class
}

type ApiTask = {
  id: number
  project_id?: number | null
  project_name?: string | null
  title?: string
  description?: string
  status?: 'To Do' | 'In Progress' | 'Done' | string
  priority?: 'Low' | 'Medium' | 'High' | string
  assignee_name?: string
  assignee_avatar?: string
  due_date?: string | null
  tags?: string[]
  created_at?: string
  updated_at?: string
}

type AnalyticsItem = {
  label: string
  value: number
}

type AnalyticsOverview = {
  summary: {
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    totalSubtasks: number
    completedSubtasks: number
    taskCompletionRate: number
    subtaskCompletionRate: number
    productivityRate: number
  }
  tasksPerUser: AnalyticsItem[]
  tasksPerStatus: AnalyticsItem[]
  completedVsPending: AnalyticsItem[]
}

const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-[#22D3EE]',
  'in-progress': 'bg-[#F59E0B]',
  completed: 'bg-[#34D399]',
  'to do': 'bg-[#22D3EE]',
  'in progress': 'bg-[#F59E0B]',
  done: 'bg-[#34D399]',
}

const CHART_COLORS = [
  'bg-[#6C3BFF]',
  'bg-[#22D3EE]',
  'bg-[#F472B6]',
  'bg-[#34D399]',
  'bg-[#F59E0B]',
  'bg-[#8B5CF6]',
]

// --- 2. DATE MATH UTILITIES ---
const MS_PER_DAY = 1000 * 60 * 60 * 24

function getDaysBetween(date1: Date, date2: Date) {
  return Math.round((date2.getTime() - date1.getTime()) / MS_PER_DAY)
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function formatDateToDayMonth(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function parseTaskId(task: ApiTask, index: number) {
  if (typeof task.id === 'number') return task.id
  return `task-${index + 1}`
}

function normalizeTaskDates(task: ApiTask) {
  const start = task.created_at || task.due_date || new Date().toISOString()
  let end = task.due_date || task.created_at || addDays(new Date(start), 3).toISOString()

  if (new Date(end).getTime() < new Date(start).getTime()) {
    end = addDays(new Date(start), 1).toISOString()
  }

  return { start, end }
}

function mapApiTasksToGantt(apiTasks: ApiTask[]): Task[] {
  return apiTasks
    .filter((task) => {
      const status = (task.status || 'To Do').toLowerCase()
      return status !== 'done' && status !== 'completed'
    })
    .map((task, index) => {
    const { start, end } = normalizeTaskDates(task)
    const status = (task.status || 'To Do').toLowerCase()

    return {
      id: parseTaskId(task, index),
      projectId: task.project_id !== null && task.project_id !== undefined ? String(task.project_id) : null,
      name: task.title || `Task ${index + 1}`,
      start_date: start,
      end_date: end,
      color: STATUS_COLORS[status] || CHART_COLORS[index % CHART_COLORS.length],
    }
  })
}

// --- 3. CONSTANTS ---
const ROW_HEIGHT = 48
const DAY_WIDTH = 40 // Fixed pixels per day — the key to proper scaling
const API_BASE = 'http://localhost:5000/api'

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// --- 4. MODULAR COMPONENTS ---

function GanttTaskRow({ task }: { task: Task }) {
  return (
    <div
      className="text-sm font-medium text-dev-text-main truncate pr-4 flex items-center border-b border-dev-border/20"
      style={{ height: `${ROW_HEIGHT}px` }}
    >
      {task.name}
    </div>
  )
}

function GanttBar({
  task,
  index,
  timelineStart,
}: {
  task: Task
  index: number
  timelineStart: Date
}) {
  const taskStart = new Date(task.start_date)
  const taskEnd = new Date(task.end_date)

  const daysFromStart = getDaysBetween(timelineStart, taskStart)
  const duration = getDaysBetween(taskStart, taskEnd)

  const leftPx = daysFromStart * DAY_WIDTH
  const widthPx = Math.max(duration * DAY_WIDTH, DAY_WIDTH) // minimum 1 day wide
  const topOffset = index * ROW_HEIGHT

  return (
    <div
      className={`absolute rounded-full shadow-md flex items-center px-3 ${task.color} hover:opacity-80 transition-all cursor-pointer backdrop-blur-sm bg-opacity-90`}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
        top: `${topOffset + 8}px`,
        height: `${ROW_HEIGHT - 16}px`,
      }}
    >
      <span className="text-xs text-white font-semibold truncate leading-none">
        {duration}d
      </span>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-dev-bg/60 border border-dev-border/60 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-dev-text-main">{title}</h3>
          {subtitle ? <p className="text-xs text-dev-text-muted mt-1">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </div>
  )
}

function BarList({ items }: { items: { label: string; value: number; color: string }[] }) {
  const maxValue = Math.max(1, ...items.map(item => item.value))

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-dev-text-muted">
            <span className="truncate pr-2">{item.label}</span>
            <span className="text-dev-text-main font-semibold">{item.value}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-dev-border/30 overflow-hidden">
            <div
              className={`h-full ${item.color}`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// --- 5. MAIN CONTAINER ---
export default function Planning() {
  const searchTerm = useAppStore((state) => state.searchTerm)
  const activeProjectId = useAppStore((state) => state.activeProjectId)
  const [tasks, setTasks] = useState<Task[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const headerScrollRef = useRef<HTMLDivElement>(null)
  const bodyScrollRef = useRef<HTMLDivElement>(null)
  const sidebarScrollRef = useRef<HTMLDivElement>(null)

  const loadPlanningData = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const [tasksRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/tasks`, { headers: authHeaders() }),
        fetch(`${API_BASE}/analytics/overview`, { headers: authHeaders() }),
      ])

      if (!tasksRes.ok) throw new Error('Failed to load tasks')
      if (!analyticsRes.ok) throw new Error('Failed to load analytics')

      const tasksJson = await tasksRes.json()
      const analyticsJson = await analyticsRes.json()

      if (!tasksJson.success) throw new Error(tasksJson.message || 'Failed to load tasks')
      if (!analyticsJson.success) throw new Error(analyticsJson.message || 'Failed to load analytics')

      const items: ApiTask[] = tasksJson.data ?? []

      setTasks(mapApiTasksToGantt(items))
      setAnalytics(analyticsJson.data)
      setLastUpdated(new Date())
    } catch (error) {
      setTasks([])
      setAnalytics(null)
      setLoadError(error instanceof Error ? error.message : 'Failed to load planning data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlanningData()
    const interval = setInterval(loadPlanningData, 15000)
    return () => clearInterval(interval)
  }, [loadPlanningData])

  const colorizeItems = (items: AnalyticsItem[], colorForLabel?: (label: string, index: number) => string) =>
    items.map((item, index) => ({
      ...item,
      color: colorForLabel?.(item.label, index) || CHART_COLORS[index % CHART_COLORS.length],
    }))

  const tasksPerUser = useMemo(
    () => colorizeItems(analytics?.tasksPerUser ?? []),
    [analytics]
  )

  const tasksPerStatus = useMemo(
    () =>
      colorizeItems(
        analytics?.tasksPerStatus ?? [],
        (label, index) => STATUS_COLORS[label.toLowerCase()] || CHART_COLORS[index % CHART_COLORS.length]
      ),
    [analytics]
  )

  const completedVsPending = useMemo(
    () =>
      colorizeItems(analytics?.completedVsPending ?? [], (label) =>
        label.toLowerCase() === 'completed' ? STATUS_COLORS.done : STATUS_COLORS['in progress']
      ),
    [analytics]
  )

  const summary = analytics?.summary
  const completedCount = summary?.completedTasks ?? 0
  const totalCount = summary?.totalTasks ?? 0
  const completionRate = summary?.productivityRate ?? 0

  const timelineData = useMemo(() => {
    const filteredTasks = tasks.filter((task) => {
      if (activeProjectId !== 'all' && task.projectId !== activeProjectId) return false
      if (!searchTerm.trim()) return true
      const haystack = task.name.toLowerCase()
      return haystack.includes(searchTerm.trim().toLowerCase())
    })

    if (filteredTasks.length === 0) return { start: new Date(), end: new Date(), days: [] as Date[], totalDays: 0, filteredTasks }

    const startDates = filteredTasks.map(t => new Date(t.start_date).getTime())
    const endDates = filteredTasks.map(t => new Date(t.end_date).getTime())

    const minTime = Math.min(...startDates)
    const maxTime = Math.max(...endDates)

    // Pad by 3 days on each side for breathing room
    const timelineStart = addDays(new Date(minTime), -3)
    const timelineEnd = addDays(new Date(maxTime), 3)
    const totalDays = getDaysBetween(timelineStart, timelineEnd)

    const days = Array.from({ length: totalDays }, (_, i) => addDays(timelineStart, i))

    return { timelineStart, timelineEnd, days, totalDays, filteredTasks }
  }, [tasks, searchTerm, activeProjectId])

  const { timelineStart, days, totalDays, filteredTasks } = timelineData
  const safeTimelineStart: Date = timelineStart ?? new Date()
  const timelineWidth = totalDays * DAY_WIDTH

  // Sync horizontal scroll between header and body, and vertical scroll between sidebar and body
  const handleBodyScroll = () => {
    if (headerScrollRef.current && bodyScrollRef.current) {
      headerScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft
    }
    if (sidebarScrollRef.current && bodyScrollRef.current) {
      sidebarScrollRef.current.scrollTop = bodyScrollRef.current.scrollTop
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dev-text-main">Project Timeline</h1>
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-dev-border text-dev-text-main hover:bg-dev-bg/60 transition"
            onClick={loadPlanningData}
          >
            {isLoading ? 'Refreshing...' : 'Refresh data'}
          </button>
          {lastUpdated ? (
            <span className="text-xs text-dev-text-muted">
              Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : null}
          {loadError ? (
            <span className="text-xs text-red-400">{loadError}</span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2 xl:grid-cols-4">
        <ChartCard title="Tasks per user" subtitle="Assigned ownership">
          {tasksPerUser.length === 0 ? (
            <p className="text-sm text-dev-text-muted">No task assignments yet.</p>
          ) : (
            <BarList items={tasksPerUser} />
          )}
        </ChartCard>

        <ChartCard title="Tasks per status" subtitle="Pipeline mix">
          <BarList items={tasksPerStatus} />
        </ChartCard>

        <ChartCard title="Completed vs pending" subtitle="Progress split">
          <BarList items={completedVsPending} />
        </ChartCard>

        <ChartCard title="Productivity" subtitle="Tasks + subtasks completion">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-dev-text-main">{completionRate}%</p>
              <p className="text-xs text-dev-text-muted mt-1">
                {completedCount} of {totalCount} tasks done
                {summary ? ` · ${summary.completedSubtasks} of ${summary.totalSubtasks} subtasks done` : ''}
              </p>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-dev-border/30 overflow-hidden mt-3">
            <div
              className="h-full bg-[#34D399]"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </ChartCard>
      </div>

      <div className="bg-dev-surface border border-dev-border rounded-3xl p-6 shadow-sm flex flex-col min-h-0 flex-1">

        {/* Top Header Row */}
        <div className="flex border-b border-dev-border pb-2 mb-2">
          {/* Sidebar header */}
          <div className="w-56 font-semibold text-dev-text-muted text-sm shrink-0 border-r border-dev-border">
            Task Name
          </div>

          {/* Timeline header — scrolls with body */}
          <div
            ref={headerScrollRef}
            className="flex-1 min-w-0 overflow-hidden ml-2"
          >
            <div className="relative" style={{ width: `${timelineWidth}px`, height: '20px' }}>
              {days.map((day, i) => {
                const showLabel = i % 3 === 0
                return showLabel ? (
                  <span
                    key={i}
                    className="absolute text-[10px] font-medium text-dev-text-muted whitespace-nowrap"
                    style={{ left: `${i * DAY_WIDTH}px`, top: 0 }}
                  >
                    {formatDateToDayMonth(day)}
                  </span>
                ) : null
              })}
            </div>
          </div>
        </div>

        {/* Main Dual-Panel Area */}
        <div className="flex min-h-0 min-w-0 flex-1">

          {/* PANEL 1: Fixed Sidebar */}
          <div ref={sidebarScrollRef} className="w-56 shrink-0 border-r border-dev-border z-10 bg-dev-surface overflow-y-hidden">
            {filteredTasks.map((task) => (
              <GanttTaskRow key={task.id} task={task} />
            ))}
          </div>

          {/* PANEL 2: Scrollable Timeline */}
          <div
            ref={bodyScrollRef}
            className="flex-1 min-w-0 overflow-x-auto overflow-y-auto ml-2"
            onScroll={handleBodyScroll}
          >
            <div
              className="relative"
              style={{
                width: `${timelineWidth}px`,
                height: `${tasks.length * ROW_HEIGHT}px`,
              }}
            >
              {/* Background grid columns */}
              {days.map((_, i) => (
                <div
                  key={i}
                  className={`absolute top-0 bottom-0 border-r border-dev-border/20 ${i % 3 === 0 ? 'bg-dev-bg/10' : ''}`}
                  style={{ left: `${i * DAY_WIDTH}px`, width: `${DAY_WIDTH}px` }}
                />
              ))}

              {/* Task bars */}
              {filteredTasks.map((task, index) => (
                <GanttBar
                  key={task.id}
                  task={task}
                  index={index}
                  timelineStart={safeTimelineStart}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
