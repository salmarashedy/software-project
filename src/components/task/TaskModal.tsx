

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TaskModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-[#1e1e2f] text-white w-full max-w-[400px] rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">

        <h2 className="text-xl font-bold mb-5">Task Details</h2>

        {/* Title */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2 text-gray-200">Title</label>
          <input
            className="w-full bg-[#2a2a40] text-white border border-gray-600 placeholder-gray-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Task title"
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2 text-gray-200">Description</label>
          <textarea
            className="w-full min-h-[100px] resize-none bg-[#2a2a40] text-white border border-gray-600 placeholder-gray-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Description"
          />
        </div>

        {/* Subtasks */}
        <div className="mb-5">
          <h3 className="font-semibold mb-3 text-gray-100">Subtasks</h3>
          <ul className="space-y-2 text-sm text-gray-200">
            <li className="rounded-2xl bg-[#2a2a40] border border-gray-700 p-3">Design UI</li>
            <li className="rounded-2xl bg-[#2a2a40] border border-gray-700 p-3">Implement logic</li>
          </ul>
        </div>

        {/* Comments */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-100">Comments</h3>
          <div className="text-sm bg-[#2a2a40] border border-gray-700 p-3 rounded-2xl text-gray-200">
            This is a comment
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 bg-gray-600 text-white rounded-2xl font-medium hover:bg-gray-500 transition"
          >
            Cancel
          </button>

          <button className="w-full sm:w-auto px-5 py-3 bg-violet-600 text-white rounded-2xl font-medium hover:bg-violet-500 transition">
            Save
          </button>
        </div>

      </div>
    </div>
  );
}


