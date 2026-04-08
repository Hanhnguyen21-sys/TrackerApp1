import { useEffect, useState, useMemos } from "react";
import {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from "../../api/projects";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
export default function MemberManagement({ projectId, token, isAdmin }) {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getProjectMembers(projectId, token);
      setMembers(data.members || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setError(error.response?.data?.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && token) {
      fetchMembers();
    }
  }, [projectId, token]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    try {
      setAdding(true);
      setError("");

      await addProjectMember(projectId, { email: memberEmail.trim() }, token);

      setMemberEmail("");
      fetchMembers();
    } catch (error) {
      console.error("Failed to add member:", error);
      setError(error.response?.data?.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId, username) => {
    const confirmed = window.confirm(
      `Remove ${username || "this member"} from the project?`,
    );
    if (!confirmed) return;

    try {
      setError("");
      await removeProjectMember(projectId, userId, token);
      fetchMembers();
    } catch (error) {
      console.error("Failed to remove member:", error);
      setError(error.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Members</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage who can access this project.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {isAdmin && (
        <form onSubmit={handleAddMember} className="mt-4 flex gap-2">
          <input
            type="email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            placeholder="Enter member email"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          />
          <button
            type="submit"
            disabled={adding}
            className="rounded-xl bg-sky-500 text-white px-4 py-2 font-medium hover:bg-sky-600 transition disabled:opacity-70"
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </form>
      )}

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading members...</p>
        ) : members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400 text-center">
            No members found.
          </div>
        ) : (
          members.map((member) => {
            const memberUser = member.user;
            const memberUserId = member.user?._id;

            return (
              <div
                key={memberUserId}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {memberUser?.username || "Unknown user"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {memberUser?.email || ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 capitalize">
                    {member.role}
                  </span>

                  {isAdmin && member.role !== "admin" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveMember(memberUserId, memberUser?.username)
                      }
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
