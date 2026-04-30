import { Home, LayoutGrid, FolderKanban, User } from "lucide-react";

export default function SideBar({ activeView, setActiveView, user }) {
  const username = user?.username || "User";
  const firstLetter = username.charAt(0).toUpperCase();

  const navButtonClass = (view) =>
    `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
      activeView === view
        ? "bg-[#0f3b6d] text-sky-200"
        : "text-slate-300 hover:bg-white/5"
    }`;

  return (
    <aside className="hidden md:flex w-72 min-h-[calc(100vh-64px)] flex-col border-r border-white/10 bg-[#1d2125] px-4 py-6">
      {/* USER PROFILE ROW */}

      <button
        onClick={() => setActiveView("profile")}
        className={navButtonClass("profile")}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-500 text-sm font-bold text-white">
          {username !== "User" ? firstLetter : <User size={18} />}
        </div>

        <div className="flex flex-col">
          <span className="font-medium">{username}</span>
          <span className="text-xs text-slate-400">View profile</span>
        </div>
      </button>

      <div className="my-4 border-t border-white/10" />

      {/* NAV */}
      <nav className="space-y-2">
        <button
          onClick={() => setActiveView("home")}
          className={navButtonClass("home")}
        >
          <Home size={18} />
          <span className="font-medium">Home</span>
        </button>

        <button
          onClick={() => setActiveView("myspace")}
          className={navButtonClass("myspace")}
        >
          <LayoutGrid size={18} />
          <span className="font-medium">My Space</span>
        </button>

        <button
          onClick={() => setActiveView("shared")}
          className={navButtonClass("shared")}
        >
          <FolderKanban size={18} />
          <span className="font-medium">Shared With Me</span>
        </button>
      </nav>
    </aside>
  );
}
