import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createProject,
  getMyProjects,
  deleteProject,
  updateProject,
} from "../api/projects";
import { Pencil, X } from "lucide-react";
export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
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
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await getMyProjects(token);
      console.log("Fetched projects:", data);
      setProjects(data.projects || data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError(error.response?.data?.message || "Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
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

      setFormData({
        name: "",
        description: "",
      });
      setShowCreateForm(false);
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
      setEditFormData({
        name: "",
        description: "",
      });
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
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-slate-500">
              Welcome{user?.username ? `, ${user.username}` : ""}
            </p>
            <h1 className="text-3xl font-bold text-slate-900">App Tracker</h1>
            <p className="text-slate-500 mt-1">Manage your boards and teams.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="rounded-xl bg-sky-500 text-white px-5 py-3 font-medium hover:bg-sky-600 transition"
            >
              {showCreateForm ? "Close" : "New Project"}
            </button>

            <button
              onClick={logout}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Create New Project
            </h2>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Project name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
              />

              <textarea
                name="description"
                placeholder="Project description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
              />

              <button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-sky-500 text-white px-5 py-3 font-medium hover:bg-sky-600 transition disabled:opacity-70"
              >
                {creating ? "Creating..." : "Create Project"}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8">
          {loadingProjects ? (
            <p className="text-slate-500">Loading projects...</p>
          ) : projects.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                No projects yet
              </h3>
              <p className="text-slate-500 mt-2">
                Create your first project to start building your board.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const isOwner =
                  project.owner?._id === user?._id ||
                  project.owner === user?._id;

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
                    className="group text-left bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-sky-300 transition cursor-pointer"
                  >
                    <div className="h-2 bg-sky-400" />
                    <div className="p-5">
                      {isEditing ? (
                        <form
                          onSubmit={(e) =>
                            handleSaveEditProject(e, project._id)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h2 className="text-lg font-semibold text-slate-900">
                              Edit Project
                            </h2>
                            <span className="rounded-full bg-sky-100 text-sky-700 text-xs font-medium px-3 py-1">
                              Project
                            </span>
                          </div>

                          <input
                            name="name"
                            type="text"
                            value={editFormData.name}
                            onChange={handleEditChange}
                            placeholder="Project name"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
                          />

                          <textarea
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditChange}
                            rows={4}
                            placeholder="Project description"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
                          />

                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={savingEdit}
                              className="rounded-xl bg-sky-500 text-white px-4 py-2 text-sm font-medium hover:bg-sky-600 transition disabled:opacity-70"
                            >
                              {savingEdit ? "Saving..." : "Save"}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProjectId(null);
                                setEditFormData({ name: "", description: "" });
                              }}
                              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <h2 className="text-lg font-semibold text-slate-900">
                              {project.name}
                            </h2>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="rounded-full bg-sky-100 text-sky-700 text-xs font-medium px-3 py-1">
                                Project
                              </span>

                              {isOwner && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button
                                    type="button"
                                    onClick={(e) =>
                                      handleStartEditProject(e, project)
                                    }
                                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-sky-600 transition"
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
                                    className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                                    title="Delete project"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="text-slate-500 text-sm mt-3 line-clamp-3">
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
        </div>
      </div>
    </div>
  );
}
