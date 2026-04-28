import { useEffect, useState } from "react";

const defaultForm = {
  title: "",
  description: "",
  type: "Task",
  priority: "Medium",
  assignees: [],
};

export default function TicketModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = "create",
  members = [],
  isSubmitting = false,
  canAssign = false,
}) {
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "Task",
        priority: initialData.priority || "Medium",
        assignees: Array.isArray(initialData.assignees)
          ? initialData.assignees.map((user) =>
              typeof user === "string" ? user : user._id,
            )
          : [],
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

  const handleToggleAssignee = (userId) => {
    setFormData((prev) => {
      const alreadySelected = prev.assignees.includes(userId);

      return {
        ...prev,
        assignees: alreadySelected
          ? prev.assignees.filter((id) => id !== userId)
          : [...prev.assignees, userId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "edit" ? "Edit ticket" : "Create ticket"}
          </h2>
          <button
            type="button"
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
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400 text-black"
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
              className="w-full text-black rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full text-black rounded-xl border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full text-black rounded-xl border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Feature">Feature</option>
              </select>
            </div>
          </div>

          {canAssign && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Assign members
              </label>

              <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-300 p-3">
                {members.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No project members found.
                  </p>
                ) : (
                  members.map((member) => {
                    const user = member.user;
                    if (!user?._id) return null;

                    return (
                      <label
                        key={user._id}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignees.includes(user._id)}
                          onChange={() => handleToggleAssignee(user._id)}
                        />
                        <span>{user.username}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition disabled:opacity-70"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 transition disabled:opacity-70"
            >
              {isSubmitting
                ? mode === "edit"
                  ? "Saving..."
                  : "Creating..."
                : mode === "edit"
                  ? "Save changes"
                  : "Create ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
