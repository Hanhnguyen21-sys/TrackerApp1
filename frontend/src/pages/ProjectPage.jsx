import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  getTicketDetails,
  addTicketComment,
  toggleTicketComplete,
} from "../api/tickets";
import Column from "../components/board/Column";
import MemberManagement from "../components/project/MemberManagement";
import Navbar from "../components/layout/NavBar";
import TicketModal from "../components/modal/TicketModal";
import TicketDetailsModal from "../components/modal/TicketDetailsModal";
import ProgressModal from "../components/modal/ProgressModal";
import getProjectActivity from "../api/activity";
import ProjectActivityModal from "../components/modal/ProjectActivityModal";
import { Activity, UserPlus } from "lucide-react";
export default function ProjectPage() {
  const { projectId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [detailTicket, setDetailTicket] = useState(null);
  const [detailComments, setDetailComments] = useState([]);
  const [detailActivity, setDetailActivity] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [projectActivity, setProjectActivity] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const fetchBoardData = async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoading(true);
      }
      setError("");

      const [projectData, columnsData, ticketsData] = await Promise.all([
        getProjectById(projectId, token),
        getColumnsByProject(projectId, token),
        getTicketsByProject(projectId, token),
      ]);

      const fetchedProject = projectData.project || projectData;
      const fetchedColumns = columnsData.columns || columnsData;
      const fetchedTickets = ticketsData.tickets || ticketsData;

      // Automatically sort columns/sprints by startDate
      const sortedColumns = [...fetchedColumns].sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(a.startDate) - new Date(b.startDate);
      });

      setProject(fetchedProject);
      setColumns(sortedColumns);
      setTickets(fetchedTickets);
    } catch (error) {
      console.error("Failed to fetch board data:", error);
      if (!isBackground || !project) {
        setError(error.response?.data?.message || "Failed to load project board");
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (projectId && token) {
      fetchBoardData();

      const intervalId = setInterval(() => fetchBoardData(true), 30000);
      return () => clearInterval(intervalId);
    }
  }, [projectId, token]);

  useEffect(() => {
    const ticketId = searchParams.get("ticketId");
    if (ticketId && token) {
      loadTicketDetails(ticketId);
    }
  }, [searchParams, token]);
  const projectMembers = useMemo(() => {
    return (
      project?.members
        ?.filter((member) => member.status === "active")
        .map((member) => {
          const memberUser = member.user || member;

          return {
            id: memberUser._id || memberUser.id,
            name: memberUser.username || memberUser.email || "Unknown",
            email: memberUser.email,
          };
        }) || []
    );
  }, [project]);
  const visibleTickets = useMemo(() => {
    const columnIds = new Set(columns.map((column) => String(column._id)));

    return tickets.filter((ticket) => {
      const columnId =
        typeof ticket.column === "string" ? ticket.column : ticket.column?._id;

      return columnIds.has(String(columnId));
    });
  }, [tickets, columns]);
  const projectProgress = useMemo(() => {
    const totalTasks = visibleTickets.length;
    const completedTasks = visibleTickets.filter(
      (ticket) => ticket.completed,
    ).length;

    const incompleteTasks = totalTasks - completedTasks;

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    const overdueTasks = visibleTickets.filter((ticket) => {
      if (!ticket.dueDate || ticket.completed) return false;
      return new Date(ticket.dueDate) < now;
    }).length;

    const dueSoonTasks = visibleTickets.filter((ticket) => {
      if (!ticket.dueDate || ticket.completed) return false;
      const diffMs = new Date(ticket.dueDate) - now;
      return diffMs >= 0 && diffMs <= oneDay;
    }).length;

    const progress =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return {
      totalTasks,
      completedTasks,
      incompleteTasks,
      overdueTasks,
      dueSoonTasks,
      progress,
    };
  }, [visibleTickets]);
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

  const assigneeOptions = useMemo(() => {
    return (
      project?.members
        ?.filter((member) => member.status === "active")
        .map((member) => {
          const user = member.user;
          const id = typeof user === "string" ? user : user?._id;
          const name =
            typeof user === "string"
              ? user
              : user?.username || user?.email || "Unknown";
          return { id, name };
        }) || []
    );
  }, [project]);

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
      setError("");

      await deleteTicket(ticketId, token);

      setTickets((prev) =>
        prev.filter((ticket) => String(ticket._id) !== String(ticketId)),
      );
    } catch (error) {
      console.error("Delete ticket failed:", error);
      setError(error.response?.data?.message || "Failed to delete ticket");
    }
  };

  const handleToggleComplete = async (ticketId) => {
    try {
      const data = await toggleTicketComplete(ticketId, token);
      const updatedTicket = data.ticket || data;

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, ...updatedTicket } : ticket,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle ticket complete:", error);
      setError(error.response?.data?.message || "Failed to update task status");
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

  const openTicketDetails = async (ticket) => {
    if (!ticket?._id) return;
    await loadTicketDetails(ticket._id);
  };

  const closeTicketDetails = () => {
    setShowTicketDetails(false);
    setDetailTicket(null);
    setDetailComments([]);
    setDetailActivity([]);
    setCommentText("");
  };
  const openProjectActivity = async () => {
    try {
      setLoadingActivity(true);
      setError("");

      const data = await getProjectActivity(projectId, token);

      setProjectActivity(data.activity || data.data?.activity || []);
      setShowActivityModal(true);
    } catch (error) {
      console.error("Failed to load project activity:", error);
      setError(
        error.response?.data?.message || "Failed to load project activity",
      );
    } finally {
      setLoadingActivity(false);
    }
  };
  const loadTicketDetails = async (ticketId) => {
    try {
      const data = await getTicketDetails(ticketId, token);
      setDetailTicket(data.ticket || data);
      setDetailComments(data.comments || []);
      setDetailActivity(data.activity || []);
      setShowTicketDetails(true);
    } catch (error) {
      console.error("Failed to load ticket details:", error);
      setError(
        error.response?.data?.message || "Failed to load ticket details",
      );
    }
  };

  const handleSubmitComment = async () => {
    if (!detailTicket || !commentText.trim()) return;
    try {
      setCommentSubmitting(true);
      setError("");
      const data = await addTicketComment(detailTicket._id, commentText, token);
      const newComment = data.comment || data;
      setDetailComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentSubmitting(false);
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

  const isAdmin = useMemo(() => {
    const currentUserId = user?._id || user?.id;

    if (!currentUserId || !project?.members) return false;

    return project.members.some((member) => {
      const memberUserId =
        typeof member.user === "string"
          ? member.user
          : member.user?._id || member.user?.id;

      return (
        String(memberUserId) === String(currentUserId) &&
        member.role?.toLowerCase() === "admin"
      );
    });
  }, [project, user]);

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
  const avatarColors = [
    "bg-gradient-to-br from-sky-400 to-blue-600",
    "bg-gradient-to-br from-purple-400 to-indigo-600",
    "bg-gradient-to-br from-emerald-400 to-green-600",
    "bg-gradient-to-br from-rose-400 to-red-600",
    "bg-gradient-to-br from-amber-400 to-orange-600",
  ];
  const getAvatarColor = (member) => {
    const text = member.id || member.email || member.name;
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

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
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {project?.name}
            </h1>

            <p className="mt-1 text-sm text-white/80 font-medium">
              {project?.description || "Manage tasks, sprints, and progress."}
            </p>
            <div className="mt-4 w-full max-w-md">
              <div className="mb-1 flex items-center justify-between text-sm font-semibold text-white/90">
                <span>Project Progress</span>
                <span>{projectProgress.progress}%</span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
                  style={{ width: `${projectProgress.progress}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-white/55">
                  {projectProgress.completedTasks} of{" "}
                  {projectProgress.totalTasks} tasks completed
                </p>

                <button
                  type="button"
                  onClick={() => setShowProgressModal(true)}
                  className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition"
                >
                  View Progress
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* View Activity */}
              <button
                type="button"
                onClick={openProjectActivity}
                disabled={loadingActivity}
                className="inline-flex items-center gap-2 rounded-xl border bg-white/10 text-white border border-white/20 hover:bg-white/20 px-3 py-2 text-sm font-medium text-sky-200 hover:bg-sky-500/20 transition disabled:opacity-60"
              >
                <Activity size={16} />
                {loadingActivity ? "Loading..." : "Activity"}
              </button>

              {/* Add Member */}
              {isAdmin && (
                <button
                  onClick={() => setShowMemberPanel(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 transition"
                >
                  <UserPlus size={16} />
                  Add Member
                </button>
              )}
            </div>
            {/* Avatars BELOW buttons */}
            {projectMembers.length > 0 && (
              <div className="mt-2 flex items-center justify-end gap-3 overflow-visible">
                {/* avatars + +N */}
                <div className="flex items-center -space-x-3">
                  {projectMembers.slice(0, 3).map((member, index) => {
                    const initial = member.name.charAt(0).toUpperCase();
                    const avatarColor = getAvatarColor(member);
                    return (
                      <div
                        key={member.id}
                        className="relative group hover:z-50"
                      >
                        <button
                          type="button"
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 ${avatarColor} text-sm font-bold text-white shadow-md transition hover:-translate-y-1 ${
                            index === 0 ? "z-30" : "z-20"
                          }`}
                        >
                          {initial}
                        </button>

                        {/* TOOLTIP */}
                        <div className="pointer-events-none absolute left-1/2 top-12 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-xl group-hover:block">
                          {member.name}
                        </div>
                      </div>
                    );
                  })}

                  {projectMembers.length > 3 && (
                    <div className="relative hover:z-50">
                      <button
                        onClick={() => setShowMemberDropdown((prev) => !prev)}
                        className="z-40 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1f51bf] bg-indigo-500 text-sm font-bold text-white shadow-md transition hover:-translate-y-1"
                      >
                        +{projectMembers.length - 3}
                      </button>

                      {/* DROPDOWN */}
                      {showMemberDropdown && (
                        <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-xl">
                          {projectMembers.slice(3).map((member) => (
                            <div
                              key={member.id}
                              className="rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10"
                            >
                              <p className="font-medium">{member.name}</p>
                              {member.email && (
                                <p className="text-xs text-slate-400">
                                  {member.email}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* TEXT */}
                <p className="text-xs text-white/60 whitespace-nowrap">
                  {projectMembers.length} member
                  {projectMembers.length > 1 ? "s" : ""}
                </p>
              </div>
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
                  {creatingColumn ? "Creating..." : "Create Column"}
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
        assigneeOptions={assigneeOptions}
        isSubmitting={savingTicket}
      />

      <TicketDetailsModal
        isOpen={showTicketDetails}
        onClose={() => {
          closeTicketDetails();
          setSearchParams({});
        }}
        ticket={detailTicket}
        comments={detailComments}
        activity={detailActivity}
        commentText={commentText}
        setCommentText={setCommentText}
        onSubmitComment={handleSubmitComment}
        isCommentSubmitting={commentSubmitting}
        members={project?.members || []}
      />
      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        progress={projectProgress}
        tickets={tickets}
        columns={columns}
      />
      <ProjectActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        activity={projectActivity}
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
