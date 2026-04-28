import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ArrowLeft, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getProjectById } from "../api/projects";
import {
  createColumn,
  deleteColumn,
  getColumnsByProject,
  updateColumn,
} from "../api/columns";
import {
  createTicket,
  deleteTicket,
  getTicketsByProject,
  moveTicket,
  updateTicket,
} from "../api/tickets";
import Column from "../components/board/Column";
import MemberManagement from "../components/project/MemberManagement";
import Navbar from "../components/layout/NavBar";
import TicketModal from "../components/modal/TicketModal";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [columnTitle, setColumnTitle] = useState("");
  const [creatingColumn, setCreatingColumn] = useState(false);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [savingTicket, setSavingTicket] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectData, columnsData, ticketsData] = await Promise.all([
        getProjectById(projectId, token),
        getColumnsByProject(projectId, token),
        getTicketsByProject(projectId, token),
      ]);

      setProject(projectData.project || projectData);
      setColumns(columnsData.columns || columnsData);
      setTickets(ticketsData.tickets || ticketsData);
    } catch (error) {
      console.error("Failed to fetch board data:", error);
      setError(error.response?.data?.message || "Failed to load project board");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && token) {
      fetchBoardData();
    }
  }, [projectId, token]);

  const ticketsByColumn = useMemo(() => {
    const grouped = {};

    for (const column of columns) {
      grouped[column._id] = [];
    }

    for (const ticket of tickets) {
      const columnId =
        typeof ticket.column === "string" ? ticket.column : ticket.column?._id;

      if (!grouped[columnId]) grouped[columnId] = [];
      grouped[columnId].push(ticket);
    }

    for (const key in grouped) {
      grouped[key].sort((a, b) => a.order - b.order);
    }

    return grouped;
  }, [columns, tickets]);

  const getTicketById = (ticketId) =>
    tickets.find((ticket) => ticket._id === ticketId);

  const getColumnIdOfTicket = (ticketId) => {
    const ticket = getTicketById(ticketId);
    if (!ticket) return null;

    return typeof ticket.column === "string"
      ? ticket.column
      : ticket.column?._id;
  };

  const handleCreateColumn = async (e) => {
    e.preventDefault();
    if (!columnTitle.trim()) return;

    try {
      setCreatingColumn(true);

      const data = await createColumn(projectId, { title: columnTitle }, token);
      const newColumn = data.column || data;

      setColumns((prev) => [...prev, newColumn]);
      setColumnTitle("");
      setShowColumnForm(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create column");
    } finally {
      setCreatingColumn(false);
    }
  };

  const handleRenameColumn = async (columnId, formData) => {
    try {
      const data = await updateColumn(columnId, formData, token);
      const updated = data.column || data;

      setColumns((prev) =>
        prev.map((col) =>
          col._id === columnId ? { ...col, ...updated } : col,
        ),
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to rename column");
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      await deleteColumn(columnId, token);

      setColumns((prev) => prev.filter((col) => col._id !== columnId));
      setTickets((prev) =>
        prev.filter((ticket) => {
          const ticketColumnId =
            typeof ticket.column === "string"
              ? ticket.column
              : ticket.column?._id;

          return ticketColumnId !== columnId;
        }),
      );
    } catch (error) {
      if (error.response?.status === 403) {
        setError("Only project admins can delete columns.");
      } else {
        setError(error.response?.data?.message || "Failed to delete column");
      }
    }
  };

  const handleCreateTicket = async (columnId, ticketData) => {
    const data = await createTicket(
      projectId,
      { columnId, ...ticketData },
      token,
    );

    const newTicket = data.ticket || data;
    setTickets((prev) => [...prev, newTicket]);
  };

  const handleUpdateTicket = async (ticketId, formData) => {
    const data = await updateTicket(ticketId, formData, token);
    const updated = data.ticket || data;

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket._id === ticketId ? { ...ticket, ...updated } : ticket,
      ),
    );
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await deleteTicket(ticketId, token);
      setTickets((prev) => prev.filter((ticket) => ticket._id !== ticketId));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete ticket");
    }
  };

  const openTicketModal = (columnId) => {
    setSelectedColumnId(columnId);
    setEditingTicket(null);
    setShowTicketModal(true);
  };

  const closeTicketModal = () => {
    setShowTicketModal(false);
    setSelectedColumnId(null);
    setEditingTicket(null);
  };

  const handleOpenEditTicket = (ticket) => {
    const ticketColumnId =
      typeof ticket.column === "string" ? ticket.column : ticket.column?._id;

    setSelectedColumnId(ticketColumnId || null);
    setEditingTicket(ticket);
    setShowTicketModal(true);
  };

  const handleSubmitTicketModal = async (formData) => {
    try {
      setSavingTicket(true);
      setError("");

      if (editingTicket) {
        await handleUpdateTicket(editingTicket._id, formData);
      } else {
        if (!selectedColumnId) {
          setError("No column selected for the new ticket.");
          return;
        }
        await handleCreateTicket(selectedColumnId, formData);
      }

      closeTicketModal();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          (editingTicket
            ? "Failed to update ticket"
            : "Failed to create ticket"),
      );
    } finally {
      setSavingTicket(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTicketId = active.id;
    const overId = over.id;
    const sourceColumnId = getColumnIdOfTicket(activeTicketId);
    if (!sourceColumnId) return;

    const overTicket = getTicketById(overId);
    const destinationColumnId = overTicket
      ? typeof overTicket.column === "string"
        ? overTicket.column
        : overTicket.column?._id
      : overId;

    if (!destinationColumnId) return;

    const sourceTickets = tickets
      .filter((t) => {
        const col = typeof t.column === "string" ? t.column : t.column?._id;
        return col === sourceColumnId;
      })
      .sort((a, b) => a.order - b.order);

    const destinationTickets = tickets
      .filter((t) => {
        const col = typeof t.column === "string" ? t.column : t.column?._id;
        return col === destinationColumnId;
      })
      .sort((a, b) => a.order - b.order);

    const activeIndex = sourceTickets.findIndex(
      (t) => t._id === activeTicketId,
    );
    let newTickets = [...tickets];

    let destinationIndex = overTicket
      ? destinationTickets.findIndex((t) => t._id === overId)
      : destinationTickets.length;

    if (sourceColumnId === destinationColumnId) {
      const reordered = arrayMove(
        sourceTickets,
        activeIndex,
        destinationIndex,
      ).map((ticket, index) => ({ ...ticket, order: index }));

      newTickets = tickets.map((ticket) => {
        const found = reordered.find((t) => t._id === ticket._id);
        return found || ticket;
      });

      setTickets(newTickets);

      try {
        const movedTicket = reordered.find((t) => t._id === activeTicketId);

        await moveTicket(
          activeTicketId,
          { destinationColumnId, newOrder: movedTicket.order },
          token,
        );
      } catch {
        fetchBoardData();
      }

      return;
    }

    const movedTicket = sourceTickets[activeIndex];
    const updatedMovedTicket = { ...movedTicket, column: destinationColumnId };

    const newSourceTickets = sourceTickets
      .filter((t) => t._id !== activeTicketId)
      .map((t, i) => ({ ...t, order: i }));

    const destWithMoved = [...destinationTickets];
    destWithMoved.splice(destinationIndex, 0, updatedMovedTicket);

    const newDestinationTickets = destWithMoved.map((t, i) => ({
      ...t,
      column: destinationColumnId,
      order: i,
    }));

    newTickets = tickets
      .filter((t) => t._id !== activeTicketId)
      .map((t) => {
        const s = newSourceTickets.find((x) => x._id === t._id);
        if (s) return s;

        const d = newDestinationTickets.find((x) => x._id === t._id);
        if (d) return d;

        return t;
      });

    const finalMovedTicket = newDestinationTickets.find(
      (t) => t._id === activeTicketId,
    );

    if (finalMovedTicket) {
      newTickets.push(finalMovedTicket);
    }

    setTickets(newTickets);

    try {
      await moveTicket(
        activeTicketId,
        {
          destinationColumnId,
          destinationOrder: finalMovedTicket.order,
        },
        token,
      );
    } catch {
      fetchBoardData();
    }
  };

  const isAdmin = project?.members?.some((member) => {
    const memberUserId =
      typeof member.user === "string" ? member.user : member.user?._id;

    return memberUserId === user?._id && member.role === "admin";
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <p className="text-slate-400 text-lg">Loading project board...</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <Navbar />

      <div className="border-b border-white/10 bg-[#1f51bf] px-6 py-5 shadow-md mt-16">
        <div className="mb-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {project?.name}
            </h1>
            <p className="mt-1 text-sm text-white/65">
              {project?.description || "Manage tasks, sprints, and progress."}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isAdmin && (
              <button
                onClick={() => setShowMemberPanel(true)}
                className="rounded-lg border border-white/25 bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25 transition"
              >
                + Add Member
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-lg p-1 hover:bg-white/10 transition"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

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
                onDeleteTicket={handleDeleteTicket}
                onRenameColumn={handleRenameColumn}
                onDeleteColumn={handleDeleteColumn}
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
                <h2 className="text-lg font-semibold text-white">
                  No columns yet
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Create your first list to start building the board.
                </p>
              </div>
            )}
          </div>
        </DndContext>
      </div>

      {showColumnForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1e293b] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Create New Column
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowColumnForm(false);
                  setColumnTitle("");
                }}
                className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-2 text-sm text-white/50">
              Enter a name for your new column.
            </p>

            <form onSubmit={handleCreateColumn} className="mt-5 space-y-4">
              <input
                type="text"
                placeholder="e.g. To Do, In Progress, Done"
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowColumnForm(false);
                    setColumnTitle("");
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingColumn}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-70"
                >
                  {creatingColumn ? "Creating..." : "Create List"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <TicketModal
        isOpen={showTicketModal}
        onClose={closeTicketModal}
        onSubmit={handleSubmitTicketModal}
        initialData={editingTicket}
        mode={editingTicket ? "edit" : "create"}
        members={project?.members || []}
        isSubmitting={savingTicket}
        canAssign={isAdmin}
      />

      {showMemberPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#1e293b] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Add Members</h2>
              <button
                type="button"
                onClick={() => setShowMemberPanel(false)}
                className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-2 text-sm text-white/50">
              Add members and manage access for this project.
            </p>

            <div className="mt-5 max-h-[70vh] overflow-y-auto pr-1">
              <MemberManagement
                projectId={projectId}
                token={token}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
