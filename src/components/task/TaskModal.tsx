// Backend integration feature
import { useState, useEffect } from 'react';
import type React from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: { title: string; description: string }) => void;
};

export default function TaskModal({ isOpen, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<Array<{ id: number; title: string; completed: boolean }>>([]);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);
  const [subtaskText, setSubtaskText] = useState('');
  const [isSubmittingSubtask, setIsSubmittingSubtask] = useState(false);
  const [comments, setComments] = useState<Array<{ id: number; author: string; text: string }>>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch subtasks from the Flask backend
  const fetchSubtasks = async () => {
    setIsLoadingSubtasks(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/subtasks/task/1');
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

  // Fetch comments from the Flask backend
  const fetchComments = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/comments/task/1');
      const data = await response.json();
      console.log('Fetched Comments:', data);

      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Fetch subtasks and comments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSubtasks();
      fetchComments();
    }
  }, [isOpen]);

  const handleSubmitSubtask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subtaskText.trim()) {
      return;
    }

    setIsSubmittingSubtask(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/subtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: 1,
          title: subtaskText,
        }),
      });

      const data = await response.json();
      console.log('Subtask API Response:', data);

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
      const response = await fetch(`http://127.0.0.1:5000/api/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !currentStatus,
        }),
      });

      const data = await response.json();
      console.log('Toggle Subtask Response:', data);

      if (data.success) {
        // Refresh the subtasks list to get updated data
        fetchSubtasks();
      }
    } catch (error) {
      console.error('Error toggling subtask status:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Delete Comment Response:', data);

      if (data.success) {
        // Refresh the comments list after deletion
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Delete Subtask Response:', data);

      if (data.success) {
        // Refresh the subtasks list after deletion
        fetchSubtasks();
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!commentText.trim()) {
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await fetch('http://127.0.0.1:5000/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId: 1,
        author: 'Shadw',
        text: commentText,
      }),
    });

    const data = await response.json();
    console.log('Comment API Response:', data);

    if (data.success) {
      setComments([...comments, data.data]);
      setCommentText('');
      fetchComments();
    }
  } catch (error) {
    console.error('Error submitting comment:', error);
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-[#1e1e2f] text-white w-full max-w-[400px] rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">

        <h2 className="text-xl font-bold mb-5">Task Details</h2>

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
          <label className="block text-sm font-medium mb-2 text-gray-200">Description</label>
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
            {isLoadingSubtasks ? (
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

          {/* Add Subtask Form */}
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
              disabled={isSubmittingSubtask || !subtaskText.trim()}
              className="w-full px-4 py-2 bg-violet-600 text-white rounded-2xl font-medium hover:bg-violet-500 transition disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
            >
              {isSubmittingSubtask ? 'Adding...' : 'Add Subtask'}
            </button>
          </form>
        </div>

        {/* Comments */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-100">Comments</h3>
          
          {/* Comments List */}
          <div className="space-y-3 mb-4">
            {comments.map((comment) => (
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
            ))}
          </div>

          {/* Comment Form */}
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
                disabled={isSubmitting || !commentText.trim()}
                className="w-full px-4 py-2 bg-violet-600 text-white rounded-2xl font-medium hover:bg-violet-500 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 bg-gray-600 text-white rounded-2xl font-medium hover:bg-gray-500 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (!title.trim()) return;
              onSave?.({ title: title.trim(), description: description.trim() });
              setTitle('');
              setDescription('');
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-3 bg-violet-600 text-white rounded-2xl font-medium hover:bg-violet-500 transition"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}


