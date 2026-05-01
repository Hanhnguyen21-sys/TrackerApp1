import { useState, useEffect, useMemo, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
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
import getProjectActivity from "../api/activity";

export function useProjectBoard(projectId, token, user) {
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
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [projectActivity, setProjectActivity] = useState([]);

  const fetchBoardData = useCallback(async (isBackground = false) => {
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
  }, [projectId, token]);

  useEffect(() => {
    if (projectId && token) {
      fetchBoardData();
      const intervalId = setInterval(() => fetchBoardData(true), 30000);
      return () => clearInterval(intervalId);
    }
  }, [projectId, token, fetchBoardData]);

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
      const columnId = typeof ticket.column === "string" ? ticket.column : ticket.column?._id;
      return columnIds.has(String(columnId));
    });
  }, [tickets, columns]);

  const projectProgress = useMemo(() => {
    const totalTasks = visibleTickets.length;
    const completedTasks = visibleTickets.filter((ticket) => ticket.completed).length;
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

    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return { totalTasks, completedTasks, incompleteTasks, overdueTasks, dueSoonTasks, progress };
  }, [visibleTickets]);

  const ticketsByColumn = useMemo(() => {
    const grouped = {};
    for (const column of columns) {
      grouped[column._id] = [];
    }
    for (const ticket of tickets) {
      const columnId = typeof ticket.column === "string" ? ticket.column : ticket.column?._id;
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
          const u = member.user;
          const id = typeof u === "string" ? u : u?._id;
          const name = typeof u === "string" ? u : u?.username || u?.email || "Unknown";
          return { id, name };
        }) || []
    );
  }, [project]);

  const getTicketById = (ticketId) => tickets.find((ticket) => ticket._id === ticketId);

  const getColumnIdOfTicket = (ticketId) => {
    const ticket = getTicketById(ticketId);
    if (!ticket) return null;
    return typeof ticket.column === "string" ? ticket.column : ticket.column?._id;
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
      setColumns((prev) => prev.map((col) => (col._id === columnId ? { ...col, ...updated } : col)));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to rename column");
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      await deleteColumn(columnId, token);
      setColumns((prev) => prev.filter((col) => col._id !== columnId));
      setTickets((prev) => prev.filter((ticket) => {
        const ticketColumnId = typeof ticket.column === "string" ? ticket.column : ticket.column?._id;
        return ticketColumnId !== columnId;
      }));
    } catch (error) {
      if (error.response?.status === 403) {
        setError("Only project admins can delete columns.");
      } else {
        setError(error.response?.data?.message || "Failed to delete column");
      }
    }
  };

  const handleCreateTicket = async (columnId, ticketData) => {
    const data = await createTicket(projectId, { columnId, ...ticketData }, token);
    const newTicket = data.ticket || data;
    setTickets((prev) => [...prev, newTicket]);
  };

  const handleUpdateTicket = async (ticketId, formData) => {
    const data = await updateTicket(ticketId, formData, token);
    const updated = data.ticket || data;
    setTickets((prev) => prev.map((ticket) => (ticket._id === ticketId ? { ...ticket, ...updated } : ticket)));
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      setError("");
      await deleteTicket(ticketId, token);
      setTickets((prev) => prev.filter((ticket) => String(ticket._id) !== String(ticketId)));
    } catch (error) {
      console.error("Delete ticket failed:", error);
      setError(error.response?.data?.message || "Failed to delete ticket");
    }
  };

  const handleToggleComplete = async (ticketId) => {
    try {
      const data = await toggleTicketComplete(ticketId, token);
      const updatedTicket = data.ticket || data;
      setTickets((prevTickets) => prevTickets.map((ticket) => (ticket._id === ticketId ? { ...ticket, ...updatedTicket } : ticket)));
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
    const ticketColumnId = typeof ticket.column === "string" ? ticket.column : ticket.column?._id;
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
      setError(error.response?.data?.message || (editingTicket ? "Failed to update ticket" : "Failed to create ticket"));
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
      setError(error.response?.data?.message || "Failed to load project activity");
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
      setError(error.response?.data?.message || "Failed to load ticket details");
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
      ? typeof overTicket.column === "string" ? overTicket.column : overTicket.column?._id
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

    const activeIndex = sourceTickets.findIndex((t) => t._id === activeTicketId);
    let newTickets = [...tickets];
    let destinationIndex = overTicket ? destinationTickets.findIndex((t) => t._id === overId) : destinationTickets.length;

    if (sourceColumnId === destinationColumnId) {
      const reordered = arrayMove(sourceTickets, activeIndex, destinationIndex).map((ticket, index) => ({ ...ticket, order: index }));
      newTickets = tickets.map((ticket) => {
        const found = reordered.find((t) => t._id === ticket._id);
        return found || ticket;
      });
      setTickets(newTickets);
      try {
        const movedTicket = reordered.find((t) => t._id === activeTicketId);
        await moveTicket(activeTicketId, { destinationColumnId, newOrder: movedTicket.order }, token);
      } catch {
        fetchBoardData();
      }
      return;
    }

    const movedTicket = sourceTickets[activeIndex];
    const updatedMovedTicket = { ...movedTicket, column: destinationColumnId };
    const newSourceTickets = sourceTickets.filter((t) => t._id !== activeTicketId).map((t, i) => ({ ...t, order: i }));
    const destWithMoved = [...destinationTickets];
    destWithMoved.splice(destinationIndex, 0, updatedMovedTicket);
    const newDestinationTickets = destWithMoved.map((t, i) => ({ ...t, column: destinationColumnId, order: i }));

    newTickets = tickets.filter((t) => t._id !== activeTicketId).map((t) => {
      const s = newSourceTickets.find((x) => x._id === t._id);
      if (s) return s;
      const d = newDestinationTickets.find((x) => x._id === t._id);
      if (d) return d;
      return t;
    });

    const finalMovedTicket = newDestinationTickets.find((t) => t._id === activeTicketId);
    if (finalMovedTicket) newTickets.push(finalMovedTicket);
    setTickets(newTickets);

    try {
      await moveTicket(activeTicketId, { destinationColumnId, destinationOrder: finalMovedTicket.order }, token);
    } catch {
      fetchBoardData();
    }
  };

  const isAdmin = useMemo(() => {
    const currentUserId = user?._id || user?.id;
    if (!currentUserId || !project?.members) return false;
    return project.members.some((member) => {
      const memberUserId = typeof member.user === "string" ? member.user : member.user?._id || member.user?.id;
      return String(memberUserId) === String(currentUserId) && member.role?.toLowerCase() === "admin";
    });
  }, [project, user]);

  const avatarColors = [
    "bg-gradient-to-br from-sky-400 to-blue-600",
    "bg-gradient-to-br from-purple-400 to-indigo-600",
    "bg-gradient-to-br from-emerald-400 to-green-600",
    "bg-gradient-to-br from-rose-400 to-red-600",
    "bg-gradient-to-br from-amber-400 to-orange-600",
  ];

  const getAvatarColor = useCallback((member) => {
    const text = member.id || member.email || member.name;
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  }, []);

  return {
    project, columns, tickets, loading, error, setError,
    showMemberPanel, setShowMemberPanel,
    showColumnForm, setShowColumnForm,
    columnTitle, setColumnTitle,
    creatingColumn,
    showTicketModal, setShowTicketModal,
    editingTicket,
    selectedColumnId,
    savingTicket,
    showTicketDetails, setShowTicketDetails,
    detailTicket, setDetailTicket,
    detailComments, setDetailComments,
    detailActivity, setDetailActivity,
    commentText, setCommentText,
    commentSubmitting,
    showProgressModal, setShowProgressModal,
    showActivityModal, setShowActivityModal,
    showMemberDropdown, setShowMemberDropdown,
    loadingActivity,
    projectActivity,
    projectMembers,
    projectProgress,
    ticketsByColumn,
    assigneeOptions,
    isAdmin,
    handleCreateColumn,
    handleRenameColumn,
    handleDeleteColumn,
    handleToggleComplete,
    handleDeleteTicket,
    openTicketModal,
    closeTicketModal,
    handleOpenEditTicket,
    handleSubmitTicketModal,
    openTicketDetails,
    closeTicketDetails,
    openProjectActivity,
    handleSubmitComment,
    handleDragEnd,
    getAvatarColor,
  };
}
