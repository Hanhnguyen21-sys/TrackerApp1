import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createProject, getMyProjects } from "../api/projects";

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
              {projects.map((project) => (
                <button
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="text-left bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-sky-300 transition"
                >
                  <div className="h-2 bg-sky-400" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {project.name}
                      </h2>
                      <span className="rounded-full bg-sky-100 text-sky-700 text-xs font-medium px-3 py-1">
                        Project
                      </span>
                    </div>

                    <p className="text-slate-500 text-sm mt-3 line-clamp-3">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
