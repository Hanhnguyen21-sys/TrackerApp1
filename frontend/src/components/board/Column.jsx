import { useState } from "react";
import { Pencil, X } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import TicketCard from "./TicketCard";

export default function Column({
  column,
  tickets,
  onOpenTicketModal,
  onEditTicket,
  onDeleteTicket,
  onViewTicket,
  onRenameColumn,
  onDeleteColumn,
}) {
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);

  const { setNodeRef } = useDroppable({
    id: column._id,
    data: {
      type: "column",
      column,
    },
  });

  const handleRenameColumn = async (e) => {
    e.preventDefault();
    if (!columnTitle.trim()) return;

    await onRenameColumn(column._id, { title: columnTitle.trim() });
    setIsEditingColumn(false);
  };

  const handleOpenEditTicket = (ticket) => {
    onEditTicket(ticket);
  };

  return (
    <div className="min-w-[320px] max-w-[320px] bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isEditingColumn ? (
              <form onSubmit={handleRenameColumn} className="space-y-2">
                <input
                  value={columnTitle}
                  onChange={(e) => setColumnTitle(e.target.value)}
                  autoFocus
                  className="w-full rounded-lg border border-sky-300 bg-white px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Column title"
                />

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 transition"
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setColumnTitle(column.title);
                      setIsEditingColumn(false);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="truncate font-semibold text-slate-900">
                  {column.title}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {tickets.length} tickets
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isEditingColumn && (
              <button
                onClick={() => {
                  setColumnTitle(column.title);
                  setIsEditingColumn(true);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-sky-600 transition"
                title="Rename column"
              >
                <Pencil size={16} />
              </button>
            )}

            <button
              onClick={() => {
                const confirmed = window.confirm(
                  `Delete column "${column.title}" and all its tickets?`,
                );
                if (confirmed) {
                  onDeleteColumn(column._id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
              title="Delete column"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      <div ref={setNodeRef} className="min-h-[40px]">
        <SortableContext
          items={tickets.map((ticket) => ticket._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onDeleteTicket={onDeleteTicket}
                onEditTicket={handleOpenEditTicket}
                onViewTicket={onViewTicket}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      <button
        onClick={() => onOpenTicketModal(column._id)}
        className="mt-4 w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 hover:bg-white transition"
      >
        + Add Ticket
      </button>
    </div>
  );
}
