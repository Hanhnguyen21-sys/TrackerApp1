import { Pencil, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TicketCard({
  ticket,
  onDeleteTicket,
  onEditTicket, // new prop
}) {
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
            onClick={() => onEditTicket(ticket)}
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
