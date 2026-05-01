import { ArrowLeft, Activity, UserPlus } from "lucide-react";

export default function ProjectHeader({
  project,
  projectProgress,
  projectMembers,
  isAdmin,
  loadingActivity,
  showMemberDropdown,
  setShowMemberDropdown,
  setShowMemberPanel,
  setShowProgressModal,
  openProjectActivity,
  getAvatarColor,
  navigate,
}) {
  return (
    <div className="border-b border-white/10 bg-[#1f51bf] px-6 py-5 shadow-md mt-16">
      <div className="mb-4">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-6">
          {project?.thumbnail && (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 shadow-lg transition hover:scale-105">
              <img
                src={project.thumbnail}
                alt={project.name}
                className="h-full w-full object-cover"
              />
              {project.tagline && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/60 px-2 py-0.5 text-[8px] font-bold uppercase tracking-tighter text-white backdrop-blur-sm ring-1 ring-white/10">
                  {project.tagline}
                </div>
              )}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {project?.name}
            </h1>

            <p className="mt-1 text-sm text-white/80 font-medium">
              {project?.description || "Manage tasks, sprints, and progress."}
            </p>
            <div className="mt-4 w-full max-w-md">
              <div className="mb-1 flex items-center justify-between text-sm font-semibold text-white/90">
                <span>Project Progress</span>
                <span>{projectProgress.progress}%</span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
                  style={{ width: `${projectProgress.progress}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-white/55">
                  {projectProgress.completedTasks} of{" "}
                  {projectProgress.totalTasks} tasks completed
                </p>

                <button
                  type="button"
                  onClick={() => setShowProgressModal(true)}
                  className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition"
                >
                  View Progress
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={openProjectActivity}
              disabled={loadingActivity}
              className="inline-flex items-center gap-2 rounded-xl border bg-white/10 text-white border border-white/20 hover:bg-white/20 px-3 py-2 text-sm font-medium text-sky-200 hover:bg-sky-500/20 transition disabled:opacity-60"
            >
              <Activity size={16} />
              {loadingActivity ? "Loading..." : "Activity"}
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowMemberPanel(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 transition"
              >
                <UserPlus size={16} />
                Add Member
              </button>
            )}
          </div>

          {projectMembers.length > 0 && (
            <div className="mt-2 flex items-center justify-end gap-3 overflow-visible">
              <div className="flex items-center -space-x-3">
                {projectMembers.slice(0, 3).map((member, index) => {
                  const initial = member.name.charAt(0).toUpperCase();
                  const avatarColor = getAvatarColor(member);
                  return (
                    <div key={member.id} className="relative group hover:z-50">
                      <button
                        type="button"
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 ${avatarColor} text-sm font-bold text-white shadow-md transition hover:-translate-y-1 ${
                          index === 0 ? "z-30" : "z-20"
                        }`}
                      >
                        {initial}
                      </button>
                      <div className="pointer-events-none absolute left-1/2 top-12 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-xl group-hover:block">
                        {member.name}
                      </div>
                    </div>
                  );
                })}

                {projectMembers.length > 3 && (
                  <div className="relative hover:z-50">
                    <button
                      onClick={() => setShowMemberDropdown((prev) => !prev)}
                      className="z-40 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1f51bf] bg-indigo-500 text-sm font-bold text-white shadow-md transition hover:-translate-y-1"
                    >
                      +{projectMembers.length - 3}
                    </button>
                    {showMemberDropdown && (
                      <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-xl">
                        {projectMembers.slice(3).map((member) => (
                          <div
                            key={member.id}
                            className="rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10"
                          >
                            <p className="font-medium">{member.name}</p>
                            {member.email && (
                              <p className="text-xs text-slate-400">
                                {member.email}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-white/60 whitespace-nowrap">
                {projectMembers.length} member
                {projectMembers.length > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
