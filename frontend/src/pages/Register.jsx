import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-2">
      {/* LEFT SIDE */}
      <div className="flex items-center justify-center px-6 py-10 md:px-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-slate-800 text-center ">
            Sign up to Tracker App
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-full bg-slate-100 px-6 py-5 text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-full bg-slate-100 px-6 py-5 text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-full bg-slate-100 px-6 py-5 pr-14 text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Eye className="w-6 h-6" />
              </button>
            </div>

            <div className="pt-2 flex justify-center ">
              <button
                type="submit"
                className="rounded-full bg-sky-500 px-12 py-4 text-white font-semibold hover:bg-blue-700 transition"
              >
                Sign up
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-10 text-slate-500 text-sm text-center ">
            Have an account?{" "}
            <Link
              to="/login"
              className="text-blue-500 font-medium hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden md:block relative">
        <img
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"
          alt="Dark workspace"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
