/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
// You may need to adjust the import path for your AuthContext
import { useAuth } from "@/contexts/AuthContext";

const roleToPath: Record<string, string> = {
  pm: "/pm",
  rfq: "/rfq",
  estimation: "/estimation",
  working: "/worker",
  documentation: "/documentation",
  admin: "/admin",
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

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const expectedPrefix = roleToPath[user.role?.toLowerCase?.()] || "";
  const currentPath = location.pathname;

  if (expectedPrefix && currentPath.startsWith(expectedPrefix)) {
    return <Outlet />;
  }

  return <Forbidden />;
};

export default RoleProtectedRoute;
