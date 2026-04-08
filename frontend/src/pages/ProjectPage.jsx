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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
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

      if (!grouped[columnId]) {
        grouped[columnId] = [];
      }

      grouped[columnId].push(ticket);
    }

    for (const key in grouped) {
      grouped[key].sort((a, b) => a.order - b.order);
    }

    return grouped;
  }, [columns, tickets]);

  const getTicketById = (ticketId) => {
    return tickets.find((ticket) => ticket._id === ticketId);
  };

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
      console.error("Failed to create column:", error);
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
      console.error("Failed to rename column:", error);
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
      console.error("Failed to delete column:", error);

      if (error.response?.status === 403) {
        setError("Only project admins can delete columns.");
      } else {
        setError(error.response?.data?.message || "Failed to delete column");
      }
    }
  };

  const handleCreateTicket = async (columnId, ticketData) => {
    try {
      const data = await createTicket(
        projectId,
        { columnId, ...ticketData },
        token,
      );
      const newTicket = data.ticket || data;

      setTickets((prev) => [...prev, newTicket]);
    } catch (error) {
      console.error("Failed to create ticket:", error);
      setError(error.response?.data?.message || "Failed to create ticket");
    }
  };

  const handleUpdateTicket = async (ticketId, formData) => {
    try {
      const data = await updateTicket(ticketId, formData, token);
      const updated = data.ticket || data;

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, ...updated } : ticket,
        ),
      );
    } catch (error) {
      console.error("Failed to update ticket:", error);
      setError(error.response?.data?.message || "Failed to update ticket");
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await deleteTicket(ticketId, token);
      setTickets((prev) => prev.filter((ticket) => ticket._id !== ticketId));
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      setError(error.response?.data?.message || "Failed to delete ticket");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

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
      .filter((ticket) => {
        const ticketColumnId =
          typeof ticket.column === "string"
            ? ticket.column
            : ticket.column?._id;
        return ticketColumnId === sourceColumnId;
      })
      .sort((a, b) => a.order - b.order);

    const destinationTickets = tickets
      .filter((ticket) => {
        const ticketColumnId =
          typeof ticket.column === "string"
            ? ticket.column
            : ticket.column?._id;
        return ticketColumnId === destinationColumnId;
      })
      .sort((a, b) => a.order - b.order);

    const activeIndex = sourceTickets.findIndex(
      (ticket) => ticket._id === activeTicketId,
    );

    let newTickets = [...tickets];
    let destinationIndex = 0;

    if (overTicket) {
      destinationIndex = destinationTickets.findIndex(
        (ticket) => ticket._id === overId,
      );
    } else {
      destinationIndex = destinationTickets.length;
    }

    if (sourceColumnId === destinationColumnId) {
      const reordered = arrayMove(
        sourceTickets,
        activeIndex,
        destinationIndex,
      ).map((ticket, index) => ({
        ...ticket,
        order: index,
      }));

      newTickets = tickets.map((ticket) => {
        const found = reordered.find((t) => t._id === ticket._id);
        return found || ticket;
      });

      setTickets(newTickets);

      try {
        const movedTicket = reordered.find((t) => t._id === activeTicketId);
        await moveTicket(
          activeTicketId,
          {
            destinationColumnId,
            newOrder: movedTicket.order,
          },
          token,
        );
      } catch (error) {
        console.error("Failed to move ticket:", error);
        setError(error.response?.data?.message || "Failed to move ticket");
        fetchBoardData();
      }

      return;
    }

    const movedTicket = sourceTickets[activeIndex];
    const updatedMovedTicket = {
      ...movedTicket,
      column: destinationColumnId,
    };

    const newSourceTickets = sourceTickets
      .filter((ticket) => ticket._id !== activeTicketId)
      .map((ticket, index) => ({
        ...ticket,
        order: index,
      }));

    const destinationWithoutMoved = [...destinationTickets];
    destinationWithoutMoved.splice(destinationIndex, 0, updatedMovedTicket);

    const newDestinationTickets = destinationWithoutMoved.map(
      (ticket, index) => ({
        ...ticket,
        column: destinationColumnId,
        order: index,
      }),
    );

    newTickets = tickets
      .filter((ticket) => ticket._id !== activeTicketId)
      .map((ticket) => {
        const sourceUpdated = newSourceTickets.find(
          (t) => t._id === ticket._id,
        );
        if (sourceUpdated) return sourceUpdated;

        const destUpdated = newDestinationTickets.find(
          (t) => t._id === ticket._id,
        );
        if (destUpdated) return destUpdated;

        return ticket;
      });

    newTickets.push(
      newDestinationTickets.find((t) => t._id === activeTicketId),
    );

    setTickets(newTickets);

    try {
      const finalMovedTicket = newDestinationTickets.find(
        (ticket) => ticket._id === activeTicketId,
      );

      await moveTicket(
        activeTicketId,
        {
          destinationColumnId,
          destinationOrder: finalMovedTicket.order,
        },
        token,
      );
    } catch (error) {
      console.error("Failed to move ticket:", error);
      setError(error.response?.data?.message || "Failed to move ticket");
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500 text-lg">Loading project board...</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="px-6 py-6 max-w-[1400px] mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>
        </div>
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {project?.name}
              </h1>
              <p className="text-slate-500 mt-2">
                {project?.description || "No description available."}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {isAdmin && (
                <button
                  onClick={() => setShowMemberPanel((prev) => !prev)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  {showMemberPanel ? "Close Members" : "Add Member"}
                </button>
              )}

              <button
                onClick={() => setShowColumnForm((prev) => !prev)}
                className="rounded-xl bg-sky-500 text-white px-5 py-3 font-medium hover:bg-sky-600 transition"
              >
                {showColumnForm ? "Close" : "Add Column"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start justify-between gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 rounded-lg p-1 text-red-500 hover:bg-red-100 hover:text-red-700 transition"
                title="Close error message"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {showColumnForm && (
            <form
              onSubmit={handleCreateColumn}
              className="mt-4 flex gap-3 flex-wrap"
            >
              <input
                type="text"
                placeholder="Column title"
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                className="flex-1 min-w-[260px] rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button
                type="submit"
                disabled={creatingColumn}
                className="rounded-xl bg-sky-500 text-white px-5 py-3 font-medium hover:bg-sky-600 transition disabled:opacity-70"
              >
                {creatingColumn ? "Creating..." : "Create"}
              </button>
            </form>
          )}
        </div>
        {showMemberPanel && (
          <div className="mt-4 mb-6">
            <MemberManagement
              projectId={projectId}
              token={token}
              isAdmin={isAdmin}
            />
          </div>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-5 overflow-x-auto pb-4">
            {columns.map((column) => (
              <Column
                key={column._id}
                column={column}
                tickets={ticketsByColumn[column._id] || []}
                onCreateTicket={handleCreateTicket}
                onUpdateTicket={handleUpdateTicket}
                onDeleteTicket={handleDeleteTicket}
                onRenameColumn={handleRenameColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}

            {columns.length === 0 && (
              <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">
                  No columns yet
                </h2>
                <p className="text-slate-500 mt-2">
                  Create your first column to start building the board.
                </p>
              </div>
            )}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
