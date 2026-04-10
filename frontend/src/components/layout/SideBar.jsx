import { Home, LayoutGrid, FolderKanban } from "lucide-react";

export default function SideBar({ activeView, setActiveView }) {
  return (
    <aside className="hidden md:flex w-72 min-h-[calc(100vh-64px)] flex-col border-r border-white/10 bg-[#1d2125] px-4 py-6">
      <nav className="space-y-2">
        <button
          onClick={() => setActiveView("home")}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
            activeView === "home"
              ? "bg-[#0f3b6d] text-sky-200"
              : "text-slate-300 hover:bg-white/5"
          }`}
        >
          <Home size={18} />
          <span className="font-medium">Home</span>
        </button>

        <button
          onClick={() => setActiveView("myspace")}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
            activeView === "myspace"
              ? "bg-[#0f3b6d] text-sky-200"
              : "text-slate-300 hover:bg-white/5"
          }`}
        >
          <LayoutGrid size={18} />
          <span className="font-medium">My Space</span>
        </button>

        <button
          onClick={() => setActiveView("shared")}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
            activeView === "shared"
              ? "bg-[#0f3b6d] text-sky-200"
              : "text-slate-300 hover:bg-white/5"
          }`}
        >
          <FolderKanban size={18} />
          <span className="font-medium">Shared With Me</span>
        </button>
      </nav>
    </aside>
  );
}
