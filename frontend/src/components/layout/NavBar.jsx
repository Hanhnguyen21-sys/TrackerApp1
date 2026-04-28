import { useEffect, useState } from "react";
import { Search, Plus, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../../api/invitations";
import { getNotifications, markNotificationRead } from "../../api/notifications";
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
  const [notifications, setNotifications] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const hasSearch =
    typeof setSearchTerm === "function" &&
    typeof setShowSearchDropdown === "function";

  const hasCreateButton = typeof setShowCreateModal === "function";
  const hasLogout = typeof logout === "function";

  const unreadNotificationsCount = notifications.filter((notification) => !notification.read).length;
  const pendingInvitesCount = invitations.length;
  const unreadCount = pendingInvitesCount + unreadNotificationsCount;

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;

      try {
        setLoadingInvitations(true);
        const invitationsData = await getMyInvitations(token);
        setInvitations(invitationsData.invitations || []);
      } catch (error) {
        console.error("Failed to fetch invitations:", error);
      } finally {
        setLoadingInvitations(false);
      }
    };

    const fetchMentionNotifications = async () => {
      if (!token) return;

      try {
        setLoadingNotifications(true);
        const data = await getNotifications(token);
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
    fetchMentionNotifications();
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

  const handleNotificationClick = async (notification) => {
    if (!notification) return;

    try {
      if (!notification.read) {
        await markNotificationRead(notification._id, token);
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id ? { ...item, read: true } : item,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to mark notification read:", error);
    }

    if (notification.type === 'mention') {
      const projectId = notification.targetProject?._id || notification.targetProject;
      const ticketId = notification.targetTicket?._id || notification.targetTicket;
      if (projectId && ticketId) {
        navigate(`/projects/${projectId}?ticketId=${ticketId}`);
      }
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
            Z
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white">
            ZenTask
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
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 z-50 w-80 overflow-hidden rounded-xl border border-white/10 bg-[#22272b] shadow-xl">
                <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
                  Notifications
                </div>

                <div className="px-4 py-3 text-sm text-slate-300">
                  {loadingInvitations || loadingNotifications ? (
                    "Loading..."
                  ) : (
                    <span>
                      {pendingInvitesCount} pending invite(s), {unreadNotificationsCount} mention(s)
                    </span>
                  )}
                </div>

                <div className="border-t border-white/10 px-4 py-3">
                  <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                    Invites
                  </div>
                  {invitations.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-slate-400">
                      No pending invitations
                    </div>
                  ) : (
                    invitations.map((invite) => (
                      <div
                        key={invite._id}
                        className="border-b border-white/10 py-3 text-sm text-slate-200"
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

                <div className="border-t border-white/10 px-4 py-3">
                  <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                    Mentions
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-slate-400">
                      No mentions yet
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification._id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left py-3 text-sm transition ${notification.read ? 'text-slate-300' : 'text-white hover:bg-white/5'}`}
                      >
                        <div className="font-medium">
                          {notification.sender?.username || 'Someone'} mentioned you
                        </div>
                        <div className="text-slate-400">
                          {notification.message}
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          {notification.targetProject?.name || 'Project'} • {notification.targetTicket?.title || 'Ticket'}
                        </div>
                      </button>
                    ))
                  )}
                </div>
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
