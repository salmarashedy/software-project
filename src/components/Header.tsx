import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, BellOff, CheckCheck, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAppStore from '../stores/useAppStore'
import { buildTaskNotifications } from '../utils/taskNotifications'

function Header() {
  const user = useAppStore((state) => state.user)
  const projects = useAppStore((state) => state.projects)
  const tasks = useAppStore((state) => state.tasks)
  const dismissedNotificationKeys = useAppStore((state) => state.dismissedNotificationKeys)
  const refreshNotifications = useAppStore((state) => state.refreshNotifications)
  const dismissNotification = useAppStore((state) => state.dismissNotification)
  const dismissAllNotifications = useAppStore((state) => state.dismissAllNotifications)
  const activeProjectId = useAppStore((state) => state.activeProjectId)
  const setActiveProjectId = useAppStore((state) => state.setActiveProjectId)
  const searchTerm = useAppStore((state) => state.searchTerm)
  const setSearchTerm = useAppStore((state) => state.setSearchTerm)
  const clearSearchTerm = useAppStore((state) => state.clearSearchTerm)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [nowTick, setNowTick] = useState(() => Date.now())
  const trayRef = useRef<HTMLDivElement | null>(null)
  const announcedNotificationKeys = useRef<Set<string>>(new Set())

  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications, tasks, dismissedNotificationKeys])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTick(Date.now())
      refreshNotifications()
    }, 60000)

    return () => window.clearInterval(interval)
  }, [refreshNotifications])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const notificationItems = useMemo(
    () => buildTaskNotifications(tasks, dismissedNotificationKeys, new Date(nowTick)),
    [tasks, dismissedNotificationKeys, nowTick],
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const previousKeys = announcedNotificationKeys.current
    const nextKeys = new Set(notificationItems.map((notification) => notification.key))
    const latestNotifications = notificationItems.slice(0, 3)

    for (const notification of latestNotifications) {
      if (previousKeys.has(notification.key)) continue
      if (notification.severity === 'info') continue
      new Notification('Task reminder', {
        body: `${notification.title} · ${notification.message}`,
      })
    }

    announcedNotificationKeys.current = nextKeys
  }, [notificationItems])

  const unreadCount = notificationItems.length
  const topNotifications = notificationItems.slice(0, 6)

  const requestBrowserNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const activeProjectName =
    activeProjectId === 'all'
      ? 'All Projects'
      : projects.find((project) => project.id === activeProjectId)?.name || 'All Projects'

  return (
    <div className="h-20 bg-dev-surface border-b border-dev-border flex items-center justify-between px-8">
      {/* Left: Title */}
      <div>
        <h1 className="text-2xl font-bold text-dev-text-main">Projects</h1>
        <p className="text-sm text-dev-text-muted">Active project: {activeProjectName}</p>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        <select
          value={activeProjectId}
          onChange={(e) => setActiveProjectId(e.target.value)}
          className="min-w-44 bg-dev-card border border-dev-border rounded-lg px-3 py-2 text-sm text-dev-text-main focus:outline-none focus:border-dev-primary"
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dev-text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-dev-card border border-dev-border rounded-lg px-10 py-2 text-dev-text-main placeholder-dev-text-muted focus:outline-none focus:border-dev-primary"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={clearSearchTerm}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dev-text-muted hover:text-dev-text-main"
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : null}
        </div>
        <div className="relative" ref={trayRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((value) => !value)}
            className="relative p-2 bg-dev-card rounded-lg hover:bg-dev-border transition-colors"
            aria-haspopup="dialog"
            aria-expanded={isNotificationsOpen}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="w-5 h-5 text-dev-text-muted" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-dev-accent text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>

          {isNotificationsOpen ? (
            <div className="absolute right-0 mt-3 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-dev-border bg-dev-surface shadow-2xl shadow-black/30 overflow-hidden z-50">
              <div className="flex items-start justify-between gap-3 p-4 border-b border-dev-border">
                <div>
                  <p className="text-sm font-semibold text-dev-text-main">Task reminders</p>
                  <p className="text-xs text-dev-text-muted mt-1">
                    {notificationItems.length > 0
                      ? `${notificationItems.length} active reminder${notificationItems.length === 1 ? '' : 's'}`
                      : 'No active reminders right now'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' ? (
                    <button
                      type="button"
                      onClick={requestBrowserNotifications}
                      className="inline-flex items-center gap-1 rounded-lg border border-dev-border bg-dev-card px-2.5 py-1.5 text-xs text-dev-text-main hover:bg-dev-border transition-colors"
                    >
                      <BellOff className="w-3.5 h-3.5" />
                      Enable alerts
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => dismissAllNotifications()}
                    className="inline-flex items-center gap-1 rounded-lg bg-dev-primary px-2.5 py-1.5 text-xs text-white hover:opacity-90 transition-opacity"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark read
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="rounded-lg p-1.5 text-dev-text-muted hover:text-dev-text-main hover:bg-dev-card transition-colors"
                    aria-label="Close notifications"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[24rem] overflow-y-auto">
                {topNotifications.length > 0 ? (
                  topNotifications.map((notification) => (
                    <div
                      key={notification.key}
                      className="flex gap-3 px-4 py-3 border-b border-dev-border last:border-b-0 hover:bg-dev-card/60 transition-colors"
                    >
                      <div className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.severity === 'critical' ? 'bg-red-400' : notification.severity === 'warning' ? 'bg-amber-400' : 'bg-sky-400'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-dev-text-main truncate">{notification.title}</p>
                            <p className="text-xs text-dev-text-muted mt-1">{notification.message}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => dismissNotification(notification.key)}
                            className="text-[11px] text-dev-text-muted hover:text-dev-text-main"
                          >
                            Dismiss
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-dev-text-muted">
                          <span className="rounded-full bg-dev-card px-2 py-1">{notification.dueDateLabel}</span>
                          {notification.projectName ? (
                            <span className="rounded-full bg-dev-card px-2 py-1">{notification.projectName}</span>
                          ) : null}
                          <span className="rounded-full bg-dev-card px-2 py-1">Priority: {notification.priority}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-5 text-sm text-dev-text-muted">
                    No tasks are currently close enough to trigger a reminder.
                    <p className="mt-2 text-xs text-dev-text-muted/80">
                      Alerts appear for overdue tasks, tasks due today, tasks due within 2 days, and high-priority tasks due this week.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <Link to="/profile" className="w-10 h-10 bg-dev-primary rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer">
          <span className="text-white font-bold">{user.avatarInitial || 'U'}</span>
        </Link>
      </div>
    </div>
  )
}

export default Header
