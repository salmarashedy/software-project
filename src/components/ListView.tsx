import mockTasks from '../data/mockTasks.json';

const ListView = () => {
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-[#F59E0B] text-white';
      case 'Medium': return 'bg-[#6C3BFF] text-white';
      case 'Low': return 'bg-[#34D399] text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'text-[#34D399]';
      case 'In Progress': return 'text-[#F59E0B]';
      case 'To Do': return 'text-[#9CA3AF]';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#2E2E4D] bg-[#22223B]">
      <table className="w-full text-left">
        <thead className="bg-[#1A1A2E] text-[#9CA3AF] text-xs uppercase">
          <tr>
            <th className="px-6 py-4 font-semibold">Task</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Priority</th>
            <th className="px-6 py-4 font-semibold">Assignee</th>
            <th className="px-6 py-4 font-semibold">Due Date</th>
            <th className="px-6 py-4 font-semibold">Tags</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2E2E4D]">
          {mockTasks.map((task) => (
            <tr key={task.id} className="hover:bg-[#2E2E4D] transition-colors">
              <td className="px-6 py-4">
                <p className="text-[#E5E7EB] font-medium">{task.title}</p>
                <p className="text-[#9CA3AF] text-sm truncate max-w-xs">{task.description}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`text-xs font-bold ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`text-xs font-bold px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <img src={task.assignee.avatar} alt={task.assignee.name} className="w-6 h-6 rounded-full" />
                  <span className="text-[#9CA3AF] text-sm">{task.assignee.name}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-[#9CA3AF] text-sm">📅 {task.dueDate}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-1">
                  {task.tags.map((tag, i) => (
                    <span key={i} className="text-xs text-[#9CA3AF] bg-[#0F0F1A] px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListView;
