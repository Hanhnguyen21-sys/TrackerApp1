import { Search, Plus, LogOut } from "lucide-react";

export default function NavBar({
  logout,
  searchTerm,
  setSearchTerm,
  searchRef,
  showSearchDropdown,
  setShowSearchDropdown,
  searchSuggestions,
  navigate,
  activeView,
  setShowCreateModal,
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-[#1d2125]">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 font-bold text-white">
            T
          </div>
          <h1 className="text-xl font-bold tracking-wide">Tracker App</h1>
        </div>

        <div className="flex flex-1 items-center justify-center gap-3 px-6">
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

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600"
          >
            <Plus size={16} />
            Create New Project
          </button>
        </div>

        <div className="flex min-w-[160px] justify-end">
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2c333a] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-[#38414a]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
