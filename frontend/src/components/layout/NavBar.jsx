import { useEffect, useState } from "react";
import { Search, Plus, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../../api/invitations";
export default function NavBar({
  logout,
  searchTerm = "",
  setSearchTerm,
  searchRef = null,
  showSearchDropdown = false,
  setShowSearchDropdown,
  searchSuggestions = [],
  activeView,
  setShowCreateModal,
}) {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  const hasSearch =
    typeof setSearchTerm === "function" &&
    typeof setShowSearchDropdown === "function";

  const hasCreateButton = typeof setShowCreateModal === "function";
  const hasLogout = typeof logout === "function";

  const pendingInvitesCount = invitations.length;

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!token) return;

      try {
        setLoadingInvitations(true);
        const data = await getMyInvitations(token);
        setInvitations(data.invitations || []);
      } catch (error) {
        console.error("Failed to fetch invitations:", error);
      } finally {
        setLoadingInvitations(false);
      }
    };

    fetchInvitations();
  }, [token]);

  const handleAcceptInvite = async (invitationId) => {
    try {
      await acceptInvitation(invitationId, token);
      setInvitations((prev) =>
        prev.filter((invite) => invite._id !== invitationId),
      );
    } catch (error) {
      console.error("Failed to accept invitation:", error);
    }
  };

  const handleRejectInvite = async (invitationId) => {
    try {
      await rejectInvitation(invitationId, token);
      setInvitations((prev) =>
        prev.filter((invite) => invite._id !== invitationId),
      );
    } catch (error) {
      console.error("Failed to reject invitation:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-[#1d2125]">
      <div className="flex h-full items-center justify-between px-4">
        <div
          onClick={() => navigate("/")}
          className="flex min-w-[220px] cursor-pointer items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 font-bold text-white">
            T
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white">
            Tracker App
          </h1>
        </div>

        <div className="flex flex-1 items-center justify-center gap-3 px-6">
          {hasSearch && (
            <div ref={searchRef} className="relative w-full max-w-2xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search project by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full rounded-lg border border-white/10 bg-[#2c333a] py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-sky-500"
              />

              {showSearchDropdown && searchTerm.trim() && (
                <div className="absolute left-0 right-0 top-[110%] z-50 overflow-hidden rounded-xl border border-white/10 bg-[#22272b] shadow-xl">
                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map((project) => (
                      <button
                        key={project._id}
                        type="button"
                        onClick={() => {
                          setSearchTerm(project.name);
                          setShowSearchDropdown(false);
                          navigate(`/projects/${project._id}`);
                        }}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/5"
                      >
                        <span>{project.name}</span>
                        <span className="text-xs text-slate-400">
                          {activeView === "shared"
                            ? "Shared"
                            : activeView === "myspace"
                              ? "My Space"
                              : "Project"}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-400">
                      No matching projects found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {hasCreateButton && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600"
            >
              <Plus size={16} />
              Create New Project
            </button>
          )}
        </div>

        <div className="flex min-w-[220px] items-center justify-end gap-3">
          <div className="relative">
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative inline-flex items-center justify-center rounded-lg bg-[#2c333a] p-2.5 text-slate-200 transition hover:bg-[#38414a]"
              title="Notifications"
            >
              <Bell size={18} />
              {pendingInvitesCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {pendingInvitesCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 z-50 w-80 overflow-hidden rounded-xl border border-white/10 bg-[#22272b] shadow-xl">
                <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
                  Invitations
                </div>

                {loadingInvitations ? (
                  <div className="px-4 py-3 text-sm text-slate-400">
                    Loading...
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-400">
                    No new invitations
                  </div>
                ) : (
                  invitations.map((invite) => (
                    <div
                      key={invite._id}
                      className="border-b border-white/10 px-4 py-3 text-sm text-slate-200"
                    >
                      <p>
                        <span className="font-medium">
                          {invite.sender?.username || "Someone"}
                        </span>{" "}
                        invited you to join{" "}
                        <span className="font-medium">
                          {invite.project?.name || "a project"}
                        </span>
                      </p>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleAcceptInvite(invite._id)}
                          className="rounded-lg bg-sky-500 px-3 py-1.5 text-white hover:bg-sky-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectInvite(invite._id)}
                          className="rounded-lg border border-slate-500 px-3 py-1.5 text-slate-200 hover:bg-white/5"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {hasLogout && (
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2c333a] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-[#38414a]"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
