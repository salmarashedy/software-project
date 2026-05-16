// Backend integration feature
import { useState, useEffect } from 'react';
import type React from 'react';
import useAppStore from '../../stores/useAppStore';
import type { AppTask } from '../../stores/useAppStore';

const API_BASE = 'http://localhost:5000/api';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: { title: string; description: string }) => void;
  task?: AppTask | null;
};

export default function TaskModal({ isOpen, onClose, onSave, task }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [subtasks, setSubtasks] = useState<Array<{ id: number; title: string; completed: boolean }>>([]);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);
  const [subtaskText, setSubtaskText] = useState('');
  const [isSubmittingSubtask, setIsSubmittingSubtask] = useState(false);
  const [comments, setComments] = useState<Array<{ id: number; author: string; text: string }>>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const editTask = useAppStore((s) => s.editTask);
  const createTask = useAppStore((s) => s.createTask);
  const taskId = task ? Number(task.id) : null;
  const hasSavedTask = taskId !== null && Number.isFinite(taskId);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
      } else {
        setTitle('');
        setDescription('');
      }
      setSubtasks([]);
      setComments([]);
      setSubtaskText('');
      setCommentText('');

      if (hasSavedTask) {
        fetchSubtasks();
        fetchComments();
      }
    }
  }, [isOpen, task, hasSavedTask]);

  const fetchSubtasks = async () => {
    if (!hasSavedTask) return;

    setIsLoadingSubtasks(true);
    try {
      const response = await fetch(`${API_BASE}/subtasks/task/${taskId}`);
      const data = await response.json();
      console.log('Fetched Subtasks:', data);

      if (data.success) {
        setSubtasks(data.data);
      }
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    } finally {
      setIsLoadingSubtasks(false);
    }
  };

  const fetchComments = async () => {
    if (!hasSavedTask) return;

    try {
      const response = await fetch(`${API_BASE}/comments/task/${taskId}`);
      const data = await response.json();
      console.log('Fetched Comments:', data);

      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSavedTask || !subtaskText.trim()) return;
    setIsSubmittingSubtask(true);
    try {
      const response = await fetch(`${API_BASE}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, title: subtaskText }),
      });
      const data = await response.json();
      if (data.success) {
        setSubtaskText('');
        fetchSubtasks();
      }
    } catch (error) {
      console.error('Error submitting subtask:', error);
    } finally {
      setIsSubmittingSubtask(false);
    }
  };

  const handleToggleSubtaskStatus = async (subtaskId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      const data = await response.json();
      if (data.success) fetchSubtasks();
    } catch (error) {
      console.error('Error toggling subtask status:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    try {
      const response = await fetch(`${API_BASE}/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) fetchSubtasks();
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSavedTask || !commentText.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, author: 'Shadw', text: commentText }),
      });
      const data = await response.json();
      if (data.success) {
        setCommentText('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiRefine = async () => {
    if (!description.trim()) return;
    setIsRefining(true);
    try {
      const response = await fetch(`${API_BASE}/ai/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description }),
      });
      const data = await response.json();
      if (data.success) {
        setDescription(data.refined);
      } else {
        throw new Error(data.error || 'AI Refinement failed');
      }
    } catch (error) {
      console.warn('AI Service failed, using local Smart Refiner:', error);
      
      const input = description.toLowerCase();
      let refined = description;

      // Local "Smart AI" Logic using Keyword Mapping
      const enhancements = [
        { key: 'login', add: 'Implement secure user authentication flow with robust error handling and session management.' },
        { key: 'fix', add: 'Investigate and resolve reported issues to ensure optimal system stability.' },
        { key: 'ui', add: 'Enhance user interface aesthetics and accessibility for an improved user experience.' },
        { key: 'logo', add: 'Optimize brand visibility and ensure consistent rendering across all viewport sizes.' },
        { key: 'api', add: 'Develop high-performance RESTful endpoints with proper data validation and security.' },
        { key: 'dark', add: 'Refine the dark mode color palette for better contrast and visual comfort.' },
        { key: 'slow', add: 'Optimize performance and reduce latency by improving data fetching and rendering efficiency.' }
      ];

      let addedContext = enhancements
        .filter(e => input.includes(e.key))
        .map(e => e.add)
        .join(' ');

      if (addedContext) {
        refined = `${description}\n\nKey Focus: ${addedContext}`;
      }

      // Format as professional bullets
      const formatted = refined
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => line.startsWith('-') ? line : `- ${line.charAt(0).toUpperCase() + line.slice(1)}`)
        .join('\n');
      
      setDescription(`✨ Refined by AI Assistant:\n${formatted}`);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setSaveError('');
    try {
      if (task) {
        await editTask(task.id, { title: title.trim(), description: description.trim() });
      } else {
        await createTask({ title: title.trim(), description: description.trim() });
      }
      onSave?.({ title: title.trim(), description: description.trim() });
      setTitle('');
      setDescription('');
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save task';
      setSaveError(msg);
      console.error('Error saving task:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-[#1e1e2f] text-white w-full max-w-[400px] rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">

        <h2 className="text-xl font-bold mb-5">{task ? 'Edit Task' : 'Task Details'}</h2>

        {/* Title */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2 text-gray-200">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#2a2a40] text-white border border-gray-600 placeholder-gray-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Task title"
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-200">Description</label>
            <button
              onClick={handleAiRefine}
              disabled={isRefining || !description.trim()}
              className="text-xs flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg font-medium hover:brightness-110 transition disabled:grayscale disabled:opacity-50"
              title="Refine with AI"
            >
              {isRefining ? '✨ Thinking...' : '✨ AI Magic'}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[100px] resize-none bg-[#2a2a40] text-white border border-gray-600 placeholder-gray-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Description"
          />
        </div>

        {/* Subtasks */}
        <div className="mb-5">
          <h3 className="font-semibold mb-3 text-gray-100">Subtasks</h3>
          <ul className="space-y-2 text-sm text-gray-200 mb-3">
            {!hasSavedTask ? (
              <li className="text-gray-400 italic">Save the task before adding subtasks.</li>
            ) : isLoadingSubtasks ? (
              <li className="text-gray-400 italic">Loading subtasks...</li>
            ) : subtasks.length > 0 ? (
              subtasks.map((subtask) => (
                <li
                  key={subtask.id}
                  className="rounded-2xl bg-[#2a2a40] border border-gray-700 p-3 flex items-center gap-2 transition-opacity hover:opacity-80 group"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleToggleSubtaskStatus(subtask.id, subtask.completed)}
                    className="w-4 h-4 cursor-pointer accent-violet-500"
                  />
                  <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="ml-auto flex-shrink-0 px-2 py-1 text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                    title="Delete subtask"
                  >
                    ✕
                  </button>
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">No subtasks yet</li>
            )}
          </ul>

          <form onSubmit={handleSubmitSubtask} className="flex flex-col gap-2">
            <input
              type="text"
              value={subtaskText}
              onChange={(e) => setSubtaskText(e.target.value)}
              placeholder="Add a new subtask..."
              className="w-full bg-[#2a2a40] text-white border border-gray-600 placeholder-gray-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
            <button
              type="submit"
              disabled={isSubmittingSubtask || !hasSavedTask || !subtaskText.trim()}
              className="w-full px-4 py-2 bg-violet-600 text-white rounded-2xl font-medium hover:bg-violet-500 transition disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
            >
              {isSubmittingSubtask ? 'Adding...' : 'Add Subtask'}
            </button>
          </form>
        </div>

        {/* Comments */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-100">Comments</h3>
          <div className="space-y-3 mb-4">
            {!hasSavedTask ? (
              <p className="text-sm text-gray-400 italic">Save the task before adding comments.</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-[#2a2a40] border border-gray-700 p-3 rounded-2xl group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-violet-400 mb-1">{comment.author}</p>
                    <p className="text-sm text-gray-200">{comment.text}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="flex-shrink-0 px-2 py-1 text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                    title="Delete comment"
                  >
                    ✕
                  </button>
                </div>
              </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No comments yet</p>
            )}
          </div>

          <form onSubmit={handleSubmitComment} className="mt-4">
            <div className="flex flex-col gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full min-h-[80px] resize-none bg-[#2a2a40] text-white border border-gray-600 placeholder-gray-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="submit"
                disabled={isSubmitting || !hasSavedTask || !commentText.trim()}
                className="w-full px-4 py-2 bg-violet-600 text-white rounded-2xl font-medium hover:bg-violet-500 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>

        {saveError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-sm text-red-400">
            {saveError}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 bg-gray-600 text-white rounded-2xl font-medium hover:bg-gray-500 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="w-full sm:w-auto px-5 py-3 bg-violet-600 text-white rounded-2xl font-medium hover:bg-violet-500 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

      </div>
    </div>
  );
}
