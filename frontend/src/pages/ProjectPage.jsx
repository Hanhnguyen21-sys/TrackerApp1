import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/NavBar";
import { useProjectBoard } from "../hooks/useProjectBoard";
import ProjectHeader from "../components/project/ProjectHeader";
import ProjectBoard from "../components/project/ProjectBoard";
import ProjectModals from "../components/project/ProjectModals";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const board = useProjectBoard(projectId, token, user);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  if (board.loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <p className="text-slate-400 text-lg">Loading project board...</p>
      </div>
    );
  }

  if (board.error && !board.project) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-red-600 font-medium">{board.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <Navbar />

      <ProjectHeader
        project={board.project}
        projectProgress={board.projectProgress}
        projectMembers={board.projectMembers}
        isAdmin={board.isAdmin}
        loadingActivity={board.loadingActivity}
        showMemberDropdown={board.showMemberDropdown}
        setShowMemberDropdown={board.setShowMemberDropdown}
        setShowMemberPanel={board.setShowMemberPanel}
        setShowProgressModal={board.setShowProgressModal}
        openProjectActivity={board.openProjectActivity}
        getAvatarColor={board.getAvatarColor}
        navigate={navigate}
      />

      <ProjectBoard
        columns={board.columns}
        ticketsByColumn={board.ticketsByColumn}
        sensors={sensors}
        handleDragEnd={board.handleDragEnd}
        openTicketModal={board.openTicketModal}
        handleOpenEditTicket={board.handleOpenEditTicket}
        openTicketDetails={board.openTicketDetails}
        handleDeleteTicket={board.handleDeleteTicket}
        handleRenameColumn={board.handleRenameColumn}
        handleDeleteColumn={board.handleDeleteColumn}
        handleToggleComplete={board.handleToggleComplete}
        setShowColumnForm={board.setShowColumnForm}
      />

      {board.error && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-start justify-between gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 shadow-2xl backdrop-blur-md">
          <p>{board.error}</p>
          <button
            type="button"
            onClick={() => board.setError("")}
            className="shrink-0 rounded-lg p-1 hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <ProjectModals
        showColumnForm={board.showColumnForm}
        setShowColumnForm={board.setShowColumnForm}
        columnTitle={board.columnTitle}
        setColumnTitle={board.setColumnTitle}
        creatingColumn={board.creatingColumn}
        handleCreateColumn={board.handleCreateColumn}
        showTicketModal={board.showTicketModal}
        closeTicketModal={board.closeTicketModal}
        handleSubmitTicketModal={board.handleSubmitTicketModal}
        editingTicket={board.editingTicket}
        assigneeOptions={board.assigneeOptions}
        savingTicket={board.savingTicket}
        showTicketDetails={board.showTicketDetails}
        closeTicketDetails={board.closeTicketDetails}
        setSearchParams={setSearchParams}
        detailTicket={board.detailTicket}
        detailComments={board.detailComments}
        detailActivity={board.detailActivity}
        commentText={board.commentText}
        setCommentText={board.setCommentText}
        handleSubmitComment={board.handleSubmitComment}
        commentSubmitting={board.commentSubmitting}
        project={board.project}
        showProgressModal={board.showProgressModal}
        setShowProgressModal={board.setShowProgressModal}
        projectProgress={board.projectProgress}
        tickets={board.tickets}
        columns={board.columns}
        showActivityModal={board.showActivityModal}
        setShowActivityModal={board.setShowActivityModal}
        projectActivity={board.projectActivity}
        showMemberPanel={board.showMemberPanel}
        setShowMemberPanel={board.setShowMemberPanel}
        projectId={projectId}
        token={token}
        isAdmin={board.isAdmin}
      />
    </div>
  );
}