import { useState, useMemo, useRef } from 'react'

// --- 1. MODULAR TYPES & MOCK DATA ---
type Task = {
  id: number
  name: string
  start_date: string // ISO string
  end_date: string   // ISO string
  color: string      // Tailwind color class
}

const MOCK_TASKS: Task[] = [
  { id: 1, name: "Foundation & Routing", start_date: '2026-04-02', end_date: '2026-04-06', color: "bg-[#6C3BFF]" }, // Deep Purple
  { id: 2, name: "Mock Data Setup", start_date: '2026-04-04', end_date: '2026-04-07', color: "bg-[#22D3EE]" },    // Accent Blue
  { id: 3, name: "Dashboard Charts", start_date: '2026-04-08', end_date: '2026-04-15', color: "bg-[#F472B6]" },   // Accent Pink
  { id: 4, name: "Gantt Scalability", start_date: '2026-04-12', end_date: '2026-04-18', color: "bg-[#34D399]" },  // Accent Green
  { id: 5, name: "Date Math Logic", start_date: '2026-04-16', end_date: '2026-04-22', color: "bg-[#F59E0B]" },    // Accent Orange
  { id: 6, name: "Final Polish", start_date: '2026-04-20', end_date: '2026-08-25', color: "bg-[#8B5CF6]" },       // Vivid Purple
  { id: 7, name: "API Integration", start_date: '2026-05-01', end_date: '2026-05-20', color: "bg-[#6C3BFF]" },
  { id: 8, name: "Auth System", start_date: '2026-05-10', end_date: '2026-06-05', color: "bg-[#22D3EE]" },
  { id: 9, name: "Testing Suite", start_date: '2026-06-01', end_date: '2026-06-15', color: "bg-[#F472B6]" },
  { id: 10, name: "Documentation", start_date: '2026-06-10', end_date: '2026-07-01', color: "bg-[#34D399]" },
  { id: 11, name: "Performance Tuning", start_date: '2026-07-01', end_date: '2026-07-20', color: "bg-[#F59E0B]" },
  { id: 12, name: "Deployment Pipeline", start_date: '2026-07-15', end_date: '2026-08-10', color: "bg-[#8B5CF6]" },
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

// --- 3. CONSTANTS ---
const ROW_HEIGHT = 48
const DAY_WIDTH = 40 // Fixed pixels per day — the key to proper scaling

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

// --- 5. MAIN CONTAINER ---
export default function Planning() {
  const [tasks] = useState<Task[]>(MOCK_TASKS)
  const headerScrollRef = useRef<HTMLDivElement>(null)
  const bodyScrollRef = useRef<HTMLDivElement>(null)
  const sidebarScrollRef = useRef<HTMLDivElement>(null)

  const timelineData = useMemo(() => {
    if (tasks.length === 0) return { start: new Date(), end: new Date(), days: [] as Date[], totalDays: 0 }

    const startDates = tasks.map(t => new Date(t.start_date).getTime())
    const endDates = tasks.map(t => new Date(t.end_date).getTime())

    const minTime = Math.min(...startDates)
    const maxTime = Math.max(...endDates)

    // Pad by 3 days on each side for breathing room
    const timelineStart = addDays(new Date(minTime), -3)
    const timelineEnd = addDays(new Date(maxTime), 3)
    const totalDays = getDaysBetween(timelineStart, timelineEnd)

    const days = Array.from({ length: totalDays }, (_, i) => addDays(timelineStart, i))

    return { timelineStart, timelineEnd, days, totalDays }
  }, [tasks])

  const { timelineStart, days, totalDays } = timelineData
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
        <p className="text-dev-text-muted mt-2">Group 4: Precision Date Math Scaling</p>
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
            {tasks.map((task) => (
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
              {tasks.map((task, index) => (
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
