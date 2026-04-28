import { useMemo, useRef, useState } from "react";
import { X, MessageCircle, Activity } from "lucide-react";

export default function TicketDetailsModal({
  isOpen,
  onClose,
  ticket,
  comments,
  activity,
  commentText,
  setCommentText,
  onSubmitComment,
  isCommentSubmitting,
  members = [],
}) {
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const textareaRef = useRef(null);

  const normalizedMembers = useMemo(
    () =>
      (members || [])
        .map((member) => {
          const user = member.user || member;
          return {
            _id: user._id,
            username: user.username,
            email: user.email,
          };
        })
        .filter((user) => !!user.username),
    [members],
  );

  const updateMentionSuggestions = (value, cursorPosition) => {
    const prefix = value.slice(0, cursorPosition);
    const match = prefix.match(/@([a-zA-Z0-9_.-]*)$/);
    if (!match) {
      setMentionSuggestions([]);
      return;
    }

    const query = match[1].toLowerCase();
    if (query.length === 0) {
      setMentionSuggestions(normalizedMembers.slice(0, 6));
      return;
    }

    setMentionSuggestions(
      normalizedMembers
        .filter((user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
        )
        .slice(0, 6),
    );
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setCommentText(value);
    updateMentionSuggestions(value, e.target.selectionStart);
  };

  const handleMentionSelect = (username) => {
    const newText = commentText.replace(/@([a-zA-Z0-9_.-]*)$/, `@${username} `);
    setCommentText(newText);
    setMentionSuggestions([]);
    textareaRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-6">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-700 bg-slate-950 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold">Task details</h2>
            <p className="text-sm text-slate-400">All ticket information, comments, mentions, and activity.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800"
            title="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{ticket?.title || 'No title'}</h3>
                  <p className="text-sm text-slate-400">{ticket?.project?.name || 'Project unknown'}</p>
                </div>
                <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sm text-sky-200">
                  {ticket?.type || 'Task'} • {ticket?.priority || 'Medium'}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <h4 className="text-sm uppercase tracking-wide text-slate-500">Assignee</h4>
                  <p className="mt-2 text-sm text-white">
                    {ticket?.assignee?.username || ticket?.assignee?.email || 'Unassigned'}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <h4 className="text-sm uppercase tracking-wide text-slate-500">Reporter</h4>
                  <p className="mt-2 text-sm text-white">
                    {ticket?.reporter?.username || ticket?.reporter?.email || 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <h4 className="text-sm uppercase tracking-wide text-slate-500">Description</h4>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-200">
                  {ticket?.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Due date</p>
                  <p className="mt-2 text-sm text-white">
                    {ticket?.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Created</p>
                  <p className="mt-2 text-sm text-white">
                    {ticket?.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Updated</p>
                  <p className="mt-2 text-sm text-white">
                    {ticket?.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-2 text-slate-200">
                <MessageCircle size={18} />
                <h3 className="text-lg font-semibold">Comments</h3>
              </div>

              <div className="mt-4 space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-500">No comments yet. Add the first note.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex items-center justify-between gap-2 text-sm text-slate-400">
                        <span>{comment.author?.username || comment.author?.email}</span>
                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-200 whitespace-pre-line">
                        {comment.body}
                      </p>
                      {comment.mentions?.length > 0 && (
                        <div className="mt-3 text-xs text-slate-400">
                          Mentioned: {comment.mentions.map((mention) => `@${mention.username || mention.email}`).join(', ')}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 space-y-3">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={commentText}
                    onChange={handleCommentChange}
                    rows={4}
                    placeholder="Write a comment. Use @username to mention someone."
                    className="w-full resize-none rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                  />

                  {mentionSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-3xl border border-slate-700 bg-slate-950 p-2 shadow-xl">
                      {mentionSuggestions.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => handleMentionSelect(user.username)}
                          className="w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-900"
                        >
                          <div className="font-medium">@{user.username}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={onSubmitComment}
                  disabled={isCommentSubmitting}
                  className="inline-flex items-center justify-center rounded-3xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-500 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCommentSubmitting ? 'Posting...' : 'Post comment'}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-2 text-slate-200">
                <Activity size={18} />
                <h3 className="text-lg font-semibold">Activity</h3>
              </div>

              <div className="mt-4 space-y-4">
                {activity.length === 0 ? (
                  <p className="text-sm text-slate-500">No activity yet.</p>
                ) : (
                  activity.map((entry) => (
                    <div key={entry._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex items-center justify-between gap-2 text-sm text-slate-400">
                        <span>{entry.actor?.username || entry.actor?.email}</span>
                        <span>{new Date(entry.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-200">{entry.action}</p>
                      {entry.details && (
                        <p className="mt-1 text-sm text-slate-400">{entry.details}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
