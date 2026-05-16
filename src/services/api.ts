const API_BASE = 'http://localhost:5000/api';

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export type TaskData = {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee_user_id?: number | null;
  assignee_name?: string;
  assignee_avatar?: string;
  due_date?: string;
  tags?: string[];
  project_id?: number;
  assignee?: {
    name?: string;
    avatar?: string;
  };
  dueDate?: string;
};

export type Project = {
  id: number;
  owner_id: number | null;
  owner_username: string | null;
  name: string;
  description: string;
  color: string;
  task_count: number;
  member_count: number;
  is_owner: boolean;
  is_member: boolean;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: number;
  project_id: number | null;
  project_name: string | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee_user_id: number | null;
  assignee_name: string;
  assignee_email: string | null;
  assignee_avatar: string;
  due_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type ProjectData = {
  name: string;
  description?: string;
  color?: string;
};

export type ProjectMember = {
  id: number;
  project_id: number;
  user_id: number;
  username: string | null;
  email: string | null;
  role: string;
  created_at: string | null;
};

export type ProjectInvite = {
  id: number;
  project_id: number;
  project_name: string | null;
  email: string;
  role: string;
  status: string;
  invited_by_id: number | null;
  invited_by_username: string | null;
  created_at: string | null;
  responded_at: string | null;
};

export const fetchTasks = async (): Promise<Task[]> => {
  const res = await fetch(`${API_BASE}/tasks`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const fetchTask = async (id: number): Promise<Task> => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createTask = async (data: TaskData): Promise<Task> => {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const updateTask = async (id: number, data: Partial<TaskData>): Promise<Task> => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
};

export const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch(`${API_BASE}/projects`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createProject = async (data: ProjectData): Promise<Project> => {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deleteProject = async (projectId: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
};

export const fetchProjectMembers = async (projectId: number): Promise<ProjectMember[]> => {
  const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const inviteProjectMember = async (projectId: number, email: string): Promise<ProjectInvite> => {
  const res = await fetch(`${API_BASE}/projects/${projectId}/invites`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const fetchProjectInvites = async (projectId: number): Promise<ProjectInvite[]> => {
  const res = await fetch(`${API_BASE}/projects/${projectId}/invites`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const fetchMyProjectInvites = async (): Promise<ProjectInvite[]> => {
  const res = await fetch(`${API_BASE}/projects/invites`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const respondToProjectInvite = async (inviteId: number, action: 'accept' | 'decline'): Promise<ProjectInvite> => {
  const res = await fetch(`${API_BASE}/projects/invites/${inviteId}/${action}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};
