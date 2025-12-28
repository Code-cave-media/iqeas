/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const roleToPath: Record<string, string> = {
  pm: "/pm",
  rfq: "/rfq",
  estimation: "/estimation",
  working: "/working",
  documentation: "/documentation",
  admin: "/admin",
  project_coordinator: "/project-coordinator",
  project_leader: "/project-leader",
};

const Forbidden = () => (
  <div className="flex flex-col items-center justify-center h-full p-8">
    <h1 className="text-3xl font-bold text-red-600 mb-4">403 Forbidden</h1>
    <p className="text-lg text-slate-700">
      You do not have permission to access this page.
    </p>
  </div>
);

const RoleProtectedRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in → login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const expectedPrefix = roleToPath[user.role];

  if (!expectedPrefix) {
    return <Forbidden />;
  }

  // 🔥 Auto redirect from "/"
  if (location.pathname === "/") {
    return <Navigate to={expectedPrefix} replace />;
  }

  // Allow only role-based paths
  if (location.pathname.startsWith(expectedPrefix)) {
    return <Outlet />;
  }

  return <Forbidden />;
};

export default RoleProtectedRoute;
