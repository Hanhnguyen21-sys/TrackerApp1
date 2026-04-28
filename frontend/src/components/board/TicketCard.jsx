import { Pencil, X, Eye } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TicketCard({ ticket, onDeleteTicket, onEditTicket }) {
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

  const assigneeNames =
    Array.isArray(ticket.assignees) && ticket.assignees.length > 0
      ? ticket.assignees
          .map((user) => (typeof user === "string" ? user : user.username))
          .join(", ")
      : "Unassigned";

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
          <h3 className="pr-2 font-medium text-slate-900">{ticket.title}</h3>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onViewTicket?.(ticket)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-sky-600 transition"
            title="View ticket details"
          >
            <Eye size={16} />
          </button>

          <button
            onClick={() => onEditTicket(ticket)}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-sky-600"
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
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            title="Delete ticket"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">
          {ticket.priority || "Medium"}
        </span>
        <span className="text-xs text-slate-400">{ticket.type || "Task"}</span>
      </div>

      {ticket.description && (
        <p className="mt-3 line-clamp-3 text-sm text-slate-500">
          {ticket.description}
        </p>
      )}

      <div className="mt-3 text-xs text-slate-400">{assigneeNames}</div>
    </div>
  );
}
