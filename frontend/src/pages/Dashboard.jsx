import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createProject,
  getMyProjects,
  deleteProject,
  updateProject,
} from "../api/projects";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  Pencil,
  X,
  Search,
  Plus,
  LayoutGrid,
  Home,
  FolderKanban,
  LogOut,
} from "lucide-react";

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const searchRef = useRef(null);
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await getMyProjects(token);
      setProjects(data.projects || data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError(error.response?.data?.message || "Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (token) fetchProjects();
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const data = await createProject(formData, token);
      const createdProject = data.project || data;

      setProjects((prev) => [createdProject, ...prev]);
      setFormData({ name: "", description: "" });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      setError(error.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleStartEditProject = (e, project) => {
    e.stopPropagation();
    setEditingProjectId(project._id);
    setEditFormData({
      name: project.name || "",
      description: project.description || "",
    });
  };

  const handleEditChange = (e) => {
    setEditFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveEditProject = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    setSavingEdit(true);
    setError("");

    try {
      const data = await updateProject(projectId, editFormData, token);
      const updatedProject = data.project || data;

      setProjects((prev) =>
        prev.map((project) =>
          project._id === projectId
            ? { ...project, ...updatedProject }
            : project,
        ),
      );

      setEditingProjectId(null);
      setEditFormData({ name: "", description: "" });
    } catch (error) {
      console.error("Failed to update project:", error);
      setError(error.response?.data?.message || "Failed to update project");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteProject = async (e, projectId, projectName) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${projectName}"?`,
    );
    if (!confirmed) return;

    try {
      setError("");
      await deleteProject(projectId, token);
      setProjects((prev) =>
        prev.filter((project) => project._id !== projectId),
      );
    } catch (error) {
      console.error("Failed to delete project:", error);
      setError(error.response?.data?.message || "Failed to delete project");
    }
  };

  const myProjects = useMemo(() => {
    return projects.filter((project) => {
      const ownerId =
        typeof project.owner === "object" ? project.owner?._id : project.owner;

      return ownerId === user?._id;
    });
  }, [projects, user]);

  const sharedProjects = useMemo(() => {
    return projects.filter((project) => {
      const ownerId =
        typeof project.owner === "object" ? project.owner?._id : project.owner;

      const isOwner = ownerId === user?._id;

      const isMember = project.members?.some((member) => {
        const memberId =
          typeof member === "object"
            ? member.user?._id || member._id || member.user
            : member;
        return memberId === user?._id;
      });

      return !isOwner && isMember;
    });
  }, [projects, user]);

  const displayedProjects = useMemo(() => {
    if (activeView === "myspace") return myProjects;
    if (activeView === "shared") return sharedProjects;
    return projects;
  }, [activeView, projects, myProjects, sharedProjects]);

  const searchSuggestions = useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();

    if (!trimmed) return [];

    return displayedProjects
      .filter((project) => project.name?.toLowerCase().startsWith(trimmed))
      .slice(0, 6);
  }, [searchTerm, displayedProjects]);

  const filteredProjects = useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();

    if (!trimmed) return displayedProjects;

    return displayedProjects.filter((project) =>
      project.name?.toLowerCase().startsWith(trimmed),
    );
  }, [searchTerm, displayedProjects]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="min-h-screen bg-[#1d2125] text-white">
      <DashboardLayout
        user={user}
        logout={logout}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchRef={searchRef}
        showSearchDropdown={showSearchDropdown}
        setShowSearchDropdown={setShowSearchDropdown}
        searchSuggestions={searchSuggestions}
        navigate={navigate}
        activeView={activeView}
        setActiveView={setActiveView}
        setShowCreateModal={setShowCreateModal}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">
            {activeView === "home" && "Recent Projects"}
            {activeView === "myspace" && "My Space"}
            {activeView === "shared" && "Shared With Me"}
          </h2>

          <p className="mt-2 text-slate-400">
            {activeView === "home" && "All projects"}
            {activeView === "myspace" && "Projects you created."}
            {activeView === "shared" && "Projects assigned by other users."}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loadingProjects ? (
          <p className="text-slate-400">Loading projects...</p>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#22272b] p-8 text-center">
            <h3 className="text-lg font-semibold text-white">
              {searchTerm ? "No matching projects found" : "No projects yet"}
            </h3>
            <p className="mt-2 text-slate-400">
              {searchTerm
                ? "Try another project name."
                : "Create your first project to start building your board."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const isOwner =
                project.owner?._id === user?._id || project.owner === user?._id;

              const isEditing = editingProjectId === project._id;

              return (
                <div
                  key={project._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (!isEditing) navigate(`/projects/${project._id}`);
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !isEditing) {
                      navigate(`/projects/${project._id}`);
                    }
                  }}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#22272b] shadow-sm transition hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-xl"
                >
                  <div className="h-24 bg-gradient-to-r from-sky-900 to-sky-500" />

                  <div className="p-5">
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveEditProject(e, project._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="space-y-3"
                      >
                        <input
                          name="name"
                          type="text"
                          value={editFormData.name}
                          onChange={handleEditChange}
                          className="w-full rounded-xl border border-white/10 bg-[#2c333a] px-4 py-3 text-white outline-none focus:border-sky-500"
                        />

                        <textarea
                          name="description"
                          value={editFormData.description}
                          onChange={handleEditChange}
                          rows={4}
                          className="w-full rounded-xl border border-white/10 bg-[#2c333a] px-4 py-3 text-white outline-none focus:border-sky-500"
                        />

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={savingEdit}
                            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
                          >
                            {savingEdit ? "Saving..." : "Save"}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProjectId(null);
                              setEditFormData({
                                name: "",
                                description: "",
                              });
                            }}
                            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/15"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-xl font-semibold text-white">
                            {project.name}
                          </h3>

                          {isOwner && (
                            <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleStartEditProject(e, project)
                                }
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-sky-400"
                                title="Edit project"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={(e) =>
                                  handleDeleteProject(
                                    e,
                                    project._id,
                                    project.name,
                                  )
                                }
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                                title="Delete project"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="mt-3 line-clamp-3 text-sm text-slate-400">
                          {project.description || "No description provided."}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardLayout>
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#22272b] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Create New Project
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Add a project name and description to get started.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Project name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-[#2c333a] px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-sky-500"
              />

              <textarea
                name="description"
                placeholder="Project description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-[#2c333a] px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-sky-500"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/15"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-70"
                >
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
