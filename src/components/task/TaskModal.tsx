

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TaskModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
   
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white w-[400px] rounded-2xl p-6 shadow-xl">

      <h2 className="text-xl font-bold mb-4">Task Details</h2>

      {/* Title */}
      <input
        className="w-full border p-2 rounded-lg mb-3"
        placeholder="Task title"
      />

      {/* Description */}
      <textarea
        className="w-full border p-2 rounded-lg mb-4"
        placeholder="Description"
      />

      {/* Subtasks */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Subtasks</h3>
        <ul className="space-y-1 text-sm">
          <li> Design UI</li>
          <li> Implement logic</li>
        </ul>
      </div>

      {/* Comments */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Comments</h3>
        <div className="text-sm bg-gray-100 p-2 rounded">
          This is a comment
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Cancel
        </button>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Save
        </button>
      </div>

    </div>
  </div>
);
}