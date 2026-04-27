import { useEffect, useState } from "react";

const defaultForm = {
  title: "",
  description: "",
  type: "Task",
  priority: "Medium",
  assignee: "",
};

export default function TicketModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = "create",
  assigneeOptions = [],
}) {
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "Task",
        priority: initialData.priority || "Medium",
        assignee:
          typeof initialData.assignee === "string"
            ? initialData.assignee
            : initialData.assignee?._id || "",
      });
    } else {
      setFormData(defaultForm);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "edit" ? "Edit ticket" : "Create ticket"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter ticket title"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Add ticket details"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                >
                  <option value="Task">Task</option>
                  <option value="Bug">Bug</option>
                  <option value="Feature">Feature</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Assignee
              </label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
              >
                <option value="">Unassigned</option>
                {assigneeOptions.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 transition"
            >
              {mode === "edit" ? "Save changes" : "Create ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
