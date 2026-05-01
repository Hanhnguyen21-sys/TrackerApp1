import { DndContext, closestCorners } from "@dnd-kit/core";
import Column from "../board/Column";

export default function ProjectBoard({
  columns,
  ticketsByColumn,
  sensors,
  handleDragEnd,
  openTicketModal,
  handleOpenEditTicket,
  openTicketDetails,
  handleDeleteTicket,
  handleRenameColumn,
  handleDeleteColumn,
  handleToggleComplete,
  setShowColumnForm,
}) {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-5 bg-[#0f172a]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full items-start gap-4">
          {columns.map((column) => (
            <Column
              key={column._id}
              column={column}
              tickets={ticketsByColumn[column._id] || []}
              onOpenTicketModal={openTicketModal}
              onEditTicket={handleOpenEditTicket}
              onViewTicket={openTicketDetails}
              onDeleteTicket={handleDeleteTicket}
              onRenameColumn={handleRenameColumn}
              onDeleteColumn={handleDeleteColumn}
              onToggleComplete={handleToggleComplete}
            />
          ))}

          <div className="w-[280px] shrink-0">
            <button
              onClick={() => setShowColumnForm(true)}
              className="flex w-full items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-left font-medium text-white/60 hover:bg-white/10 hover:text-white/90 transition"
            >
              <span className="text-xl leading-none">+</span>
              Add another column
            </button>
          </div>

          {columns.length === 0 && (
            <div className="w-[320px] rounded-2xl border border-white/10 bg-[#1e293b] p-6 text-white/80">
              <h2 className="text-lg font-semibold text-white">No columns yet</h2>
              <p className="mt-2 text-sm text-white/50">
                Create your first list to start building the board.
              </p>
            </div>
          )}
        </div>
      </DndContext>
    </div>
  );
}
