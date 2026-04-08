import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TicketCard({ ticket, onUpdateTicket, onDeleteTicket }) {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: ticket.title || "",
    description: ticket.description || "",
    type: ticket.type || "Task",
    priority: ticket.priority || "Medium",
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket._id,
    data: {
      type: "ticket",
      ticket,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await onUpdateTicket(ticket._id, formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3"
      >
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Title"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Description"
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 px-3 py-2 bg-white"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 px-3 py-2 bg-white"
          >
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Feature">Feature</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl bg-sky-500 text-white px-4 py-2 text-sm font-medium hover:bg-sky-600 transition"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex-1 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <h3 className="font-medium text-slate-900 pr-2">{ticket.title}</h3>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-sky-600 transition"
            title="Edit ticket"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure you want to delete this ticket?",
              );
              if (confirmed) {
                onDeleteTicket(ticket._id);
              }
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
            title="Delete ticket"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="rounded-full bg-sky-100 text-sky-700 text-xs font-medium px-2 py-1">
          {ticket.priority || "Medium"}
        </span>
        <span className="text-xs text-slate-400">{ticket.type || "Task"}</span>
      </div>

      {ticket.description && (
        <p className="text-sm text-slate-500 mt-3 line-clamp-3">
          {ticket.description}
        </p>
      )}

      <div className="mt-3 text-xs text-slate-400">
        {ticket.assignee?.name || "Unassigned"}
      </div>
    </div>
  );
}
