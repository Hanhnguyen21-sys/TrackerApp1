import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
//block access to routes if not authenticated, redirect to login page

export default function ProtectedRoute({ children }) {
  // get auth state from context
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
