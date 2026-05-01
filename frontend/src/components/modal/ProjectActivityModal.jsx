import { X, Activity } from "lucide-react";

export default function ProjectActivityModal({
  isOpen,
  onClose,
  activity = [],
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-6">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-950 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-sky-400" />
            <div>
              <h2 className="text-xl font-semibold">Project Activity</h2>
              <p className="text-sm text-slate-400">
                Recent updates across this project.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {activity.length === 0 ? (
            <p className="text-sm text-slate-500">No project activity yet.</p>
          ) : (
            <div className="space-y-0">
              {activity.map((entry, index) => (
                <div key={entry._id} className="relative flex gap-4 pb-5">
                  {index !== activity.length - 1 && (
                    <div className="absolute left-[7px] top-5 h-full w-px bg-slate-700" />
                  )}

                  <div className="relative z-10 mt-1 h-3.5 w-3.5 rounded-full border-2 border-sky-400 bg-slate-950" />

                  <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">
                        {entry.actor?.username ||
                          entry.actor?.email ||
                          "Someone"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleString()
                          : "Unknown time"}
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-sky-300">{entry.action}</p>

                    {entry.ticket?.title && (
                      <p className="mt-1 text-sm text-slate-400">
                        Ticket: {entry.ticket.title}
                      </p>
                    )}

                    {entry.details && (
                      <p className="mt-1 text-sm text-slate-500">
                        {entry.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
