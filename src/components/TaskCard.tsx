import React from 'react';


interface Assignee {
  name: string;
  avatar: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  assignee: Assignee;
  dueDate: string;
  tags: string[];
}

interface TaskCardProps {
  task: Task;
  onDelete?: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete }) => {
  
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-[#F59E0B] text-white'; // Accent Orange
      case 'Medium': return 'bg-[#6C3BFF] text-white'; // Deep Purple
      case 'Low': return 'bg-[#34D399] text-white'; // Accent Green
      default: return 'bg-gray-500 text-white';
    }
  };

  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'text-[#34D399]'; // Green
      case 'In Progress': return 'text-[#F59E0B]'; // Orange
      case 'To Do': return 'text-[#9CA3AF]'; // Muted
      default: return 'text-gray-500';
    }
  };

  return (
   
    <div className="bg-[#22223B] border border-[#2E2E4D] rounded-lg p-4 hover:shadow-lg hover:border-[#6C3BFF] transition-all cursor-pointer group">
      
      {/* Header: Priority & Tags */}
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-bold px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
          {task.priority.toUpperCase()}
        </span>
        <div className="flex gap-1 items-center">
          {task.tags.map((tag, index) => (
            <span key={index} className="text-xs text-[#9CA3AF] bg-[#0F0F1A] px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="text-xs text-red-400 hover:text-red-300 ml-2"
              title="Delete task"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-[#E5E7EB] font-semibold text-lg mb-1 group-hover:text-[#6C3BFF] transition-colors">
        {task.title}
      </h3>
      <p className="text-[#9CA3AF] text-sm mb-4 line-clamp-2">
        {task.description}
      </p>

      {/* Footer: Assignee, Date, Status */}
      <div className="flex justify-between items-center border-t border-[#2E2E4D] pt-3">
        <div className="flex items-center gap-2">
          <img 
            src={task.assignee.avatar} 
            alt={task.assignee.name} 
            className="w-6 h-6 rounded-full border border-[#2E2E4D]"
          />
          <span className="text-xs text-[#9CA3AF]">{task.assignee.name}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
            📅 {task.dueDate}
          </span>
          <span className={`text-xs font-bold ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
