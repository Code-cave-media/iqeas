import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Folder,
  BookOpen,
  Calendar,
  Home,
  LogOut,
  Menu,
  X,
  Users,
  Clock,
  FileText,
  ListChecks,
  FilePlus2,
  BarChart3,
} from "lucide-react";

const menuConfig = {
  pm: [
    { label: "Projects", to: "/pm", icon: Folder, match: ["/pm/project/"] },
    {
      label: "Document Center",
      to: "/pm/documents",
      icon: BookOpen,
      match: ["/pm/documents/"],
    },
    // { label: "Calendar", to: "/pm/calendar", icon: Calendar },
  ],
  rfq: [
    { label: "Dashboard", to: "/rfq", icon: Home },
    {
      label: "Document Center",
      to: "/rfq/documents",
      icon: BookOpen,
      match: ["/rfq/documents/"],
    },
    // { label: "Calendar", to: "/rfq/calendar", icon: Calendar },
  ],
  estimation: [
    { label: "Estimation Tracker", to: "/estimation", icon: BarChart3 },
    {
      label: "Document Center",
      to: "/estimation/documents",
      icon: BookOpen,
      match: ["/estimation/documents/"],
    },
    // { label: "Calendar", to: "/estimation/calendar", icon: Calendar },
  ],
  documentation: [
    {
      label: "Document submission",
      to: "/documentation",
      icon: FilePlus2,
      match: ["/documentation/project/"],
    },
    {
      label: "Document Center",
      to: "/documentation/documents",
      icon: BookOpen,
      match: ["/documentation/documents/"],
    },
    // { label: "Calendar", to: "/documentation/calendar", icon: Calendar },
  ],
  working: [
    {
      label: "My Task",
      to: "/working",
      icon: ListChecks,
      match: ["/working/project/"],
    },
    {
      label: "Document Center",
      to: "/working/documents",
      icon: BookOpen,
      match: ["/working/documents/"],
    },
    // { label: "Calendar", to: "/working/calendar", icon: Calendar },
  ],
  admin: [
    {
      label: "Projects",
      to: "/admin",
      icon: Folder,
      match: ["/admin/project/"],
    },
    { label: "Members", to: "/admin/members", icon: Users },
    { label: "Attendance", to: "/admin/attendance", icon: Clock },
    { label: "Salary", to: "/admin/salary", icon: FileText },
    { label: "Leave ", to: "/admin/leave", icon: Calendar },
    {
      label: "Document Center",
      to: "/admin/documents",
      icon: BookOpen,
      match: ["/admin/documents/"],
    },
    // { label: "Calendar", to: "/admin/calendar", icon: Calendar },
  ],
};

const roleLabels: Record<string, string> = {
  pm: "Project Manager",
  rfq: "RFQ Team",
  estimation: "Estimation Department",
  documentation: "Documentation Team",
  working: "Working Team",
  admin: "Admin",
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const role = user?.role?.toLowerCase() || "";
  const links = menuConfig[role] || [];
  const roleLabel = roleLabels[role] || role;
  const { pathname } = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  console.log(pathname);
  useEffect(() => {
    setOpenMenu(false);
  }, [pathname]);

  // Disable background scroll on mobile menu open
  useEffect(() => {
    document.body.style.overflow = openMenu ? "hidden" : "";
  }, [openMenu]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile menu overlay */}
      {openMenu && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-30 md:hidden"
          onClick={() => setOpenMenu(false)}
        />
      )}

      {/* Mobile menu button */}
      {!openMenu && (
        <button
          className="md:hidden fixed top-3 right-3 z-50 bg-white rounded-full p-2 shadow border border-slate-200"
          onClick={() => setOpenMenu(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
    fixed top-0 left-0 h-screen pt-5 z-40 bg-white border-r border-slate-200 flex flex-col overflow-y-auto
    w-64 transition-transform duration-200
    ${openMenu ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0 md:static md:block
  `}
        style={{ minWidth: "16rem" }}
      >
        <div className="flex h-full flex-col flex-1 justify-between">
          <div>
            <div className="md:hidden flex justify-between p-3">
              <h2 className="text-lg font-bold text-blue-700 mb-1">
                {roleLabel}
              </h2>
              <button
                onClick={() => setOpenMenu(false)}
                aria-label="Close menu"
                className="text-slate-500 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>

            {/* Sidebar content */}
            <div>
              <div className="max-md:hidden p-2 pb-2 border-b border-slate-100">
                <h2 className="text-2xl max-sm:text-lg font-bold text-blue-700 mb-1">
                  {roleLabel}
                </h2>
              </div>
              <nav className="flex flex-col space-y-1">
                {links.map(({ label, match, to, icon: Icon }) => {
                  const isMatch =
                    (Array.isArray(match) &&
                      match.some((m) => pathname.startsWith(m))) ||
                    pathname === to;

                  return (
                    <NavLink
                      key={to}
                      to={to}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                        isMatch
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => setOpenMenu(false)}
                    >
                      {Icon && <Icon size={18} className="mr-3" />}
                      {label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Logout button */}
          <div>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 rounded-lg font-medium transition text-red-600 hover:bg-red-50"
              style={{ border: 0, background: "none" }}
            >
              <LogOut size={18} className="mr-3 text-red-600" />
              Logout
            </button>
          </div>
        </div>
        {/* Close button for mobile */}
      </aside>

      {/* Main content */}
      <main className="flex-1 max-md:pt-12 overflow-y-auto ">{children}</main>
    </div>
  );
};

export default DashboardLayout;
