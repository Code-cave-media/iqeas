import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Folder,
  Calendar,
  Users,
  Clock,
  FileText,
  Blocks,
  LogOut,
  Menu,
  ChevronDown,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Archive,
} from "lucide-react";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import toast from "react-hot-toast";

interface MenuItem {
  label: string;
  to: string;
  icon: React.ElementType;
  match?: string[];
}

const menuConfig: Record<string, MenuItem[]> = {
  pm: [{ label: "Projects", to: "/pm", icon: Folder, match: ["/pm/project/"] }],
  rfq: [{ label: "Dashboard", to: "/rfq", icon: Blocks }],
  project_leader: [{ label: "Dashboard", to: "/project-leader", icon: Blocks }],
  project_coordinator: [
    { label: "Dashboard", to: "/project-coordinator", icon: Blocks },
    { label: "Archive", to: "/project-coordinator/archived", icon: Archive },
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
    { label: "Leave", to: "/admin/leave", icon: Calendar },
  ],
};

const roleLabels: Record<string, string> = {
  pm: "Project Manager",
  admin: "Admin",
  rfq: "RFQ Team",
  project_leader: "Project Leader",
  project_coordinator: "Project Coordinator",
};

const rolePathMap: Record<string, string> = {
  pm: "/pm",
  rfq: "/rfq",
  admin: "/admin",
  project_leader: "/project-leader",
  project_coordinator: "/project-coordinator",
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, login, authToken } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { makeApiCall } = useAPICall();

  const [openMenu, setOpenMenu] = useState(false);
  const role = user?.role?.toLowerCase() || "";
  const links = menuConfig[role] || [];
  const roleLabel = roleLabels[role] || role.toUpperCase();

  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpenMenu(false), [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchUsers = async (page: number) => {
    setIsLoadingUsers(true);
    try {
      const response = await makeApiCall(
        "GET",
        `${API_ENDPOINT.GET_ALL_SWITCH_USER}?page=${page}`,
        {},
        "application/json",
        authToken
      );
      if (response.status === 200) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.total_pages || 1);
        setCurrentPage(page);
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (authToken) fetchUsers(1);
  }, [authToken]);

  const handleSwitch = async (u: any) => {
    const response = await makeApiCall(
      "POST",
      API_ENDPOINT.SWITCH_USER,
      { email: u.email },
      "application/json",
      authToken
    );
    if (response.status === 200) {
      const newUser = response.data.user;
      const newToken = response.data.token;
      login(newUser, newToken);
      const targetRole = newUser.role?.toLowerCase();
      const destination = rolePathMap[targetRole] || "/";
      toast.success(`Access granted: ${newUser.name}`);
      setUserDropdownOpen(false);
      navigate(destination);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans antialiased text-slate-900">
      {/* Mobile Overlay */}
      {openMenu && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpenMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          bg-white border-r border-slate-200/80
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group
          ${
            openMenu
              ? "translate-x-0 w-64"
              : "-translate-x-full md:translate-x-0 md:w-[80px] md:hover:w-64"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className="p-4 mb-2 flex flex-col items-center group-hover:items-stretch transition-all duration-300">
            <div className="flex flex-col group-hover:flex-row items-center gap-3 transition-all duration-300 min-h-[80px] group-hover:min-h-0">
              {/* Avatar Icon */}
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                <User size={18} strokeWidth={2.5} />
              </div>

              {/* Text Info: Below icon when collapsed, Right side when expanded */}
              <div className="flex flex-col items-center group-hover:items-start text-center group-hover:text-left transition-all duration-300 overflow-hidden">
                <p className="font-bold text-[10px] group-hover:text-sm text-slate-900 truncate tracking-tight w-full max-w-[60px] group-hover:max-w-none">
                  {user?.name || "User"}
                </p>

                <p className="text-[9px] group-hover:text-[11px] font-medium text-slate-400 uppercase truncate w-full">
                  {roleLabel?.toLowerCase() === "project coordinator"
                    ? "PC"
                    : roleLabel?.toLowerCase() === "project manager"
                    ? "PM"
                    : roleLabel}
                </p>
              </div>
            </div>

            {/* Switch Account Button (Visible only on expand) */}
            <div
              className="mt-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200"
              ref={dropdownRef}
            >
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-full flex items-center justify-between text-[11px] font-semibold tracking-wide uppercase text-slate-500 bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-all"
              >
                <span className="truncate">Switch Account</span>
                {isLoadingUsers ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ChevronDown size={12} />
                )}
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute left-[240px] top-16 w-64 bg-white border border-slate-200 shadow-2xl rounded-xl z-50 overflow-hidden flex flex-col ml-2">
                  <div className="max-h-[280px] overflow-y-auto py-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSwitch(u)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex flex-col gap-0.5"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {u.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">
                          {roleLabels[u.role?.toLowerCase()] || u.role}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                    <button
                      disabled={currentPage === 1 || isLoadingUsers}
                      onClick={() => fetchUsers(currentPage - 1)}
                      className="p-1.5 rounded-md hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-20 transition"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages || isLoadingUsers}
                      onClick={() => fetchUsers(currentPage + 1)}
                      className="p-1.5 rounded-md hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-20 transition"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
            {links.map(({ label, to, icon: Icon, match }) => {
              const isActive =
                pathname === to || match?.some((m) => pathname.startsWith(m));
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`
                    flex items-center h-[44px] rounded-lg transition-all duration-200 group/link
                    ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }
                  `}
                >
                  <div className="w-[48px] flex-shrink-0 flex items-center justify-center">
                    <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-medium text-sm tracking-tight">
                    {label}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="p-4 mt-auto border-t border-slate-100">
            <button
              onClick={logout}
              className="flex items-center h-[44px] w-full rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group/logout"
            >
              <div className="w-[48px] flex-shrink-0 flex justify-center">
                <LogOut size={19} />
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium text-sm tracking-tight">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative flex flex-col transition-all duration-300">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
              Portal
            </span>
          </div>
          <button
            onClick={() => setOpenMenu(true)}
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-10 max-w-10xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
