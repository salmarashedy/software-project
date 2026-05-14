import { useState } from 'react';
import type React from 'react';
import mockTasks from '../data/mockTasks.json';
import TaskCard from './TaskCard';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  assignee: { name: string; avatar: string };
  dueDate: string;
  tags: string[];
}

const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks as Task[]);


  const columns = [
    { id: 'To Do', title: 'To Do', color: 'bg-[#6C3BFF]' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-[#F59E0B]' },
    { id: 'Done', title: 'Done', color: 'bg-[#34D399]' },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer!.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    const taskId = e.dataTransfer!.getData('taskId');
    
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, status: status as 'To Do' | 'In Progress' | 'Done' };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80 bg-[#1A1A2E] rounded-xl border border-[#2E2E4D] flex flex-col"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="p-4 border-b border-[#2E2E4D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
              <h3 className="text-[#E5E7EB] font-bold">{column.title}</h3>
            </div>
            <span className="text-[#9CA3AF] text-xs bg-[#22223B] px-2 py-1 rounded-full">
              {tasks.filter((t) => t.status === column.id).length}
            </span>
          </div>

          
          <div className="p-4 flex-1 flex flex-col gap-4 min-h-[200px]">
            {tasks
              .filter((task) => task.status === column.id)
              .map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TaskCard task={task} />
                </div>
              ))}
            
            {tasks.filter((t) => t.status === column.id).length === 0 && (
              <p className="text-[#9CA3AF] text-sm text-center py-4">No tasks</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
