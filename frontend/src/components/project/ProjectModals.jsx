import { X } from "lucide-react";
import TicketModal from "../modal/TicketModal";
import TicketDetailsModal from "../modal/TicketDetailsModal";
import ProgressModal from "../modal/ProgressModal";
import ProjectActivityModal from "../modal/ProjectActivityModal";
import MemberManagement from "./MemberManagement";

export default function ProjectModals({
  showColumnForm, setShowColumnForm,
  columnTitle, setColumnTitle,
  creatingColumn, handleCreateColumn,
  showTicketModal, closeTicketModal,
  handleSubmitTicketModal, editingTicket,
  assigneeOptions, savingTicket,
  showTicketDetails, closeTicketDetails,
  setSearchParams, detailTicket,
  detailComments, detailActivity,
  commentText, setCommentText,
  handleSubmitComment, commentSubmitting,
  project, showProgressModal,
  setShowProgressModal, projectProgress,
  tickets, columns,
  showActivityModal, setShowActivityModal,
  projectActivity, showMemberPanel,
  setShowMemberPanel, projectId,
  token, isAdmin,
}) {
  return (
    <>
      {showColumnForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1e293b] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Create New Column</h2>
              <button
                type="button"
                onClick={() => { setShowColumnForm(false); setColumnTitle(""); }}
                className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-white/50">Enter a name for your new column.</p>
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
                  onClick={() => { setShowColumnForm(false); setColumnTitle(""); }}
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
        onClose={() => { closeTicketDetails(); setSearchParams({}); }}
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
            <p className="mt-2 text-sm text-white/50">Add members and manage access for this project.</p>
            <div className="mt-5 max-h-[70vh] overflow-y-auto pr-1">
              <MemberManagement projectId={projectId} token={token} isAdmin={isAdmin} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
