/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
// You may need to adjust the import path for your AuthContext
import { useAuth } from "@/contexts/AuthContext";

const roleToPath: Record<string, string> = {
  pm: "/pm",
  rfq: "/rfq",
  estimation: "/estimation",
  working: "/working",
  documentation: "/documentation",
  Admin: "/admin",
};

const Home = ({ children }: any) => {
  const { user } = useAuth();
  const location = useLocation();
  console.log(user);
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const expectedPrefix = roleToPath[user.role];
  console.log(expectedPrefix);
  return <Navigate to={expectedPrefix} replace />;
};

export default Home;
