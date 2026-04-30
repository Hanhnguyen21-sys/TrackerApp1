import { useState } from "react";
import { Camera, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    avatar: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Updated profile:", formData);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-start justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#22272b] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-3xl font-bold text-white">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              formData.username?.charAt(0).toUpperCase() || "U"
            )}

            <button
              type="button"
              className="absolute bottom-0 right-0 rounded-full bg-sky-500 p-2 text-white shadow-lg hover:bg-sky-600"
            >
              <Camera size={16} />
            </button>
          </div>

          <h1 className="text-2xl font-bold text-white">
            {formData.username || "Your Profile"}
          </h1>
          <p className="mt-1 text-sm text-sky-400">Edit your account details</p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Username
            </label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full rounded-xl border border-white/10 bg-[#2c333a] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full rounded-xl border border-white/10 bg-[#2c333a] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Avatar URL
            </label>
            <input
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="Paste image URL"
              className="w-full rounded-xl border border-white/10 bg-[#2c333a] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              New Password
            </label>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-white/10 bg-[#2c333a] px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-500 focus:border-sky-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-600"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
