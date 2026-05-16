import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import useAppStore from '../stores/useAppStore'
import { authService } from '../services/authService'
import * as api from '../services/api'
import { Trash2 } from 'lucide-react'

export default function Settings() {
  const theme = useAppStore((state) => state.theme)
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const user = useAppStore((state) => state.user)
  const searchTerm = useAppStore((state) => state.searchTerm)
  const clearSearchTerm = useAppStore((state) => state.clearSearchTerm)
  const dashboardView = useAppStore((state) => state.dashboardView)
  const setDashboardView = useAppStore((state) => state.setDashboardView)
  const hideCompletedInDashboard = useAppStore((state) => state.hideCompletedInDashboard)
  const toggleHideCompletedInDashboard = useAppStore((state) => state.toggleHideCompletedInDashboard)
  const projects = useAppStore((state) => state.projects)
  const activeProjectId = useAppStore((state) => state.activeProjectId)
  const setActiveProjectId = useAppStore((state) => state.setActiveProjectId)
  const createProject = useAppStore((state) => state.createProject)
  const deleteProject = useAppStore((state) => state.deleteProject)
  const fetchProjects = useAppStore((state) => state.fetchProjects)
  const clearUser = useAppStore((state) => state.clearUser)

  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectColor, setProjectColor] = useState('#6C3BFF')
  const [projectError, setProjectError] = useState('')
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [members, setMembers] = useState<api.ProjectMember[]>([])
  const [projectInvites, setProjectInvites] = useState<api.ProjectInvite[]>([])
  const [myInvites, setMyInvites] = useState<api.ProjectInvite[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')

  const selectedProject = projects.find((project) => project.id === activeProjectId) || projects[0]
  const selectedProjectId = selectedProject ? Number(selectedProject.id) : null

  const loadCollaboration = useCallback(async () => {
    try {
      const incomingInvites = await api.fetchMyProjectInvites()
      setMyInvites(incomingInvites)

      if (!selectedProjectId) {
        setMembers([])
        setProjectInvites([])
        return
      }

      const projectMembers = await api.fetchProjectMembers(selectedProjectId)
      setMembers(projectMembers)

      if (selectedProject?.isOwner) {
        const invites = await api.fetchProjectInvites(selectedProjectId)
        setProjectInvites(invites)
      } else {
        setProjectInvites([])
      }
    } catch {
      setMembers([])
      setProjectInvites([])
    }
  }, [selectedProjectId, selectedProject?.isOwner])

  useEffect(() => {
    void loadCollaboration()
  }, [loadCollaboration])

  const handleLogout = () => {
    clearUser()
    clearSearchTerm()
    setActiveProjectId('all')
    authService.logout()
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? All associated tasks will be permanently deleted.')) return;
    try {
      await deleteProject(projectId);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete project');
    }
  }

  const handleCreateProject = async (event: FormEvent) => {
    event.preventDefault()
    if (!projectName.trim()) return

    setIsCreatingProject(true)
    setProjectError('')
    try {
      await createProject({
        name: projectName.trim(),
        description: projectDescription.trim(),
        color: projectColor,
      })
      setProjectName('')
      setProjectDescription('')
      setProjectColor('#6C3BFF')
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsCreatingProject(false)
    }
  }

  const handleInviteMember = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedProjectId || !inviteEmail.trim()) return

    setInviteStatus('')
    try {
      await api.inviteProjectMember(selectedProjectId, inviteEmail.trim())
      setInviteEmail('')
      setInviteStatus('Invite sent')
      await loadCollaboration()
    } catch (error) {
      setInviteStatus(error instanceof Error ? error.message : 'Failed to send invite')
    }
  }

  const handleInviteResponse = async (inviteId: number, action: 'accept' | 'decline') => {
    await api.respondToProjectInvite(inviteId, action)
    await fetchProjects()
    await loadCollaboration()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dev-text-main">Settings</h1>
        <p className="text-dev-text-muted mt-2">Adjust the app behavior and appearance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl bg-dev-surface border border-dev-border p-6">
          <h2 className="text-xl font-semibold text-dev-text-main mb-2">Appearance</h2>
          <p className="text-sm text-dev-text-muted mb-4">
            Current theme: <span className="text-dev-text-main font-medium">{theme}</span>
          </p>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center rounded-xl bg-dev-accent px-4 py-2 font-medium text-white hover:opacity-90"
          >
            Toggle theme
          </button>
        </section>

        <section className="rounded-3xl bg-dev-surface border border-dev-border p-6">
          <h2 className="text-xl font-semibold text-dev-text-main mb-2">Dashboard behavior</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dev-text-main mb-2">Default dashboard view</label>
              <select
                value={dashboardView}
                onChange={(e) => setDashboardView(e.target.value as 'cards' | 'list' | 'kanban')}
                className="w-full rounded-xl border border-dev-border bg-dev-card px-4 py-2 text-dev-text-main focus:outline-none focus:border-dev-primary"
              >
                <option value="cards">Cards</option>
                <option value="list">List</option>
                <option value="kanban">Kanban</option>
              </select>
            </div>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-dev-border bg-dev-card px-4 py-3">
              <div>
                <div className="text-sm font-medium text-dev-text-main">Hide completed tasks</div>
                <div className="text-xs text-dev-text-muted">Applies to dashboard cards, list, and Kanban.</div>
              </div>
              <input
                type="checkbox"
                checked={hideCompletedInDashboard}
                onChange={toggleHideCompletedInDashboard}
                className="h-5 w-5 accent-dev-primary"
              />
            </label>
          </div>
        </section>
      </div>

      <section className="rounded-3xl bg-dev-surface border border-dev-border p-6">
        <h2 className="text-xl font-semibold text-dev-text-main mb-2">Projects</h2>
        <p className="text-sm text-dev-text-muted mb-4">Create and switch between project spaces.</p>
        <form onSubmit={handleCreateProject} className="space-y-3 mb-5">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
              className="w-full rounded-xl border border-dev-border bg-dev-card px-4 py-2 text-dev-text-main placeholder-dev-text-muted focus:outline-none focus:border-dev-primary"
            />
            <input
              type="text"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Project description"
              className="w-full rounded-xl border border-dev-border bg-dev-card px-4 py-2 text-dev-text-main placeholder-dev-text-muted focus:outline-none focus:border-dev-primary"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={projectColor}
              onChange={(e) => setProjectColor(e.target.value)}
              className="h-10 w-16 rounded-lg border border-dev-border bg-dev-card"
            />
            <button
              type="submit"
              disabled={isCreatingProject}
              className="rounded-xl bg-dev-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {isCreatingProject ? 'Creating...' : 'Create project'}
            </button>
            {projectError ? <span className="text-sm text-red-400">{projectError}</span> : null}
          </div>
        </form>

        <div className="space-y-2">
          {projects.length === 0 ? (
            <p className="text-sm text-dev-text-muted">No projects loaded yet.</p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className={`w-full rounded-2xl border px-4 py-3 flex items-center justify-between transition ${
                  activeProjectId === project.id
                    ? 'border-dev-primary bg-dev-card'
                    : 'border-dev-border bg-dev-card/60 hover:bg-dev-card'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveProjectId(project.id)}
                  className="flex items-center justify-between gap-3 w-full text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-dev-text-main truncate">{project.name}</div>
                      <div className="text-xs text-dev-text-muted truncate">{project.description || 'No description'}</div>
                    </div>
                  </div>
                  <div className="text-xs text-dev-text-muted whitespace-nowrap">{project.taskCount} tasks</div>
                </button>
                {project.isOwner && (
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="ml-4 text-red-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition-colors shrink-0"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-dev-surface border border-dev-border p-6">
        <h2 className="text-xl font-semibold text-dev-text-main mb-2">Collaboration</h2>
        <p className="text-sm text-dev-text-muted mb-4">
          Invite people by email and manage the members of the selected project.
        </p>

        {myInvites.length > 0 ? (
          <div className="mb-5 rounded-2xl border border-dev-border bg-dev-card/60 p-4">
            <h3 className="text-sm font-semibold text-dev-text-main mb-3">Incoming invites</h3>
            <div className="space-y-2">
              {myInvites.map((invite) => (
                <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-dev-bg/60 px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-dev-text-main">{invite.project_name}</div>
                    <div className="text-xs text-dev-text-muted">Invited by {invite.invited_by_username || 'project owner'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleInviteResponse(invite.id, 'accept')}
                      className="rounded-lg bg-dev-accent px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInviteResponse(invite.id, 'decline')}
                      className="rounded-lg border border-dev-border px-3 py-1.5 text-xs font-medium text-dev-text-main"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!selectedProject ? (
          <p className="text-sm text-dev-text-muted">Select or create a project to manage collaboration.</p>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-dev-text-main mb-2">{selectedProject.name} members</h3>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-xl bg-dev-card px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-dev-text-main">{member.username || 'Unnamed user'}</div>
                      <div className="text-xs text-dev-text-muted">{member.email}</div>
                    </div>
                    <span className="rounded-full bg-dev-bg px-2 py-1 text-xs text-dev-text-muted">{member.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedProject.isOwner ? (
              <div className="rounded-2xl border border-dev-border bg-dev-card/60 p-4">
                <form onSubmit={handleInviteMember} className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="teammate@example.com"
                    className="w-full rounded-xl border border-dev-border bg-dev-card px-4 py-2 text-dev-text-main placeholder-dev-text-muted focus:outline-none focus:border-dev-primary"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-dev-accent px-4 py-2 font-medium text-white hover:opacity-90"
                  >
                    Send invite
                  </button>
                </form>
                {inviteStatus ? <p className="mt-2 text-sm text-dev-text-muted">{inviteStatus}</p> : null}

                {projectInvites.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-dev-text-muted">Project invites</h4>
                    {projectInvites.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between rounded-xl bg-dev-bg/60 px-3 py-2">
                        <span className="text-sm text-dev-text-main">{invite.email}</span>
                        <span className="text-xs text-dev-text-muted">{invite.status}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-dev-text-muted">Only the project owner can invite new members.</p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-dev-surface border border-dev-border p-6">
        <h2 className="text-xl font-semibold text-dev-text-main mb-2">Search</h2>
        <p className="text-sm text-dev-text-muted mb-4">
          Active search: <span className="text-dev-text-main font-medium">{searchTerm || 'None'}</span>
        </p>
        <button
          type="button"
          onClick={clearSearchTerm}
          disabled={!searchTerm}
          className="inline-flex items-center rounded-xl bg-dev-card px-4 py-2 font-medium text-dev-text-main border border-dev-border hover:bg-dev-border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear search
        </button>
      </section>

      <section className="rounded-3xl bg-dev-surface border border-dev-border p-6">
        <h2 className="text-xl font-semibold text-dev-text-main mb-2">Session</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm text-dev-text-muted">Signed in as</p>
            <p className="text-base font-medium text-dev-text-main">{user.name || 'Unknown user'}</p>
            <p className="text-sm text-dev-text-muted">{user.email || 'No email on file'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-red-500/10 px-4 py-2 font-medium text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white"
          >
            Log out
          </button>
        </div>
      </section>

      <section className="rounded-3xl bg-dev-surface border border-dev-border p-6">
        <h2 className="text-xl font-semibold text-dev-text-main mb-2">Navigation</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/dashboard"
            className="rounded-xl bg-dev-card px-4 py-2 font-medium text-dev-text-main border border-dev-border hover:bg-dev-border"
          >
            Back to dashboard
          </Link>
          <Link
            to="/planning"
            className="rounded-xl bg-dev-card px-4 py-2 font-medium text-dev-text-main border border-dev-border hover:bg-dev-border"
          >
            Open planning view
          </Link>
          <Link
            to="/profile"
            className="rounded-xl bg-dev-card px-4 py-2 font-medium text-dev-text-main border border-dev-border hover:bg-dev-border"
          >
            Profile
          </Link>
        </div>
      </section>
    </div>
  )
}
