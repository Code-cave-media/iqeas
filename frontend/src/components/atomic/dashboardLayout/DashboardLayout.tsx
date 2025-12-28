import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  ChevronDown,
  User,
} from "lucide-react";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import toast from "react-hot-toast";

const menuConfig = {
  pm: [
    { label: "Projects", to: "/pm", icon: Folder, match: ["/pm/project/"] },
    {
      label: "Document Center",
      to: "/pm/documents",
      icon: BookOpen,
      match: ["/pm/documents/"],
    },
  ],
  rfq: [
    { label: "Dashboard", to: "/rfq", icon: Home },
    {
      label: "Document Center",
      to: "/rfq/documents",
      icon: BookOpen,
      match: ["/rfq/documents/"],
    },
  ],
  estimation: [
    { label: "Estimation Tracker", to: "/estimation", icon: BarChart3 },
    {
      label: "Document Center",
      to: "/estimation/documents",
      icon: BookOpen,
      match: ["/estimation/documents/"],
    },
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
  ],
};

const roleLabels: Record<string, string> = {
  pm: "Project Manager",
  rfq: "RFQ Team",
  estimation: "Estimation Department",
  documentation: "Documentation Team",
  working: "Working Team",
  admin: "Admin",
  project_coordinator: "project_coordinator",
  project_leader: "/project-leader",
};

type UserType = { id: string; name: string; role: string; email: string };

// Added optional onUserSwitch prop so parent can react when a user is switched
const DashboardLayout = ({
  children,
  onUserSwitch,
}: {
  children: React.ReactNode;
  onUserSwitch?: (user: UserType) => void;
}) => {
  const { user, logout, login, authToken } = useAuth();
  const role = user?.role?.toLowerCase() || "";
  const links = menuConfig[role] || [];
  const roleLabel = roleLabels[role] || role;
  const { pathname } = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { makeApiCall, fetching, isFetched } = useAPICall();
  const navigate = useNavigate();
  // refs for detecting outside clicks
  const desktopDropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpenMenu(false);
  }, [pathname]);

  // Disable background scroll on mobile menu open
  useEffect(() => {
    document.body.style.overflow = openMenu ? "hidden" : "";
  }, [openMenu]);
  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    if (!userDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(target) &&
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(target)
      ) {
        setUserDropdownOpen(false);
      }

      // if only one ref exists, also handle that case
      if (desktopDropdownRef.current && !mobileDropdownRef.current) {
        if (!desktopDropdownRef.current.contains(target))
          setUserDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !desktopDropdownRef.current) {
        if (!mobileDropdownRef.current.contains(target))
          setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownOpen]);

  // ------------------
  // Quick user switching helpers
  // ------------------
  const fetchUsers = async () => {
    const response = await makeApiCall(
      "GET",
      API_ENDPOINT.GET_ALL_SWITCH_USER,
      {},
      "application/json",
      authToken,
      "verifying"
    );
    console.log(response);
    if (response.status == 200) {
      console.log(response);
      setUsers(response.data.users);
      console.log("set");
    }
    console.log("done");
  };

  const switchUser = async (u: UserType) => {
    const response = await makeApiCall(
      "post",
      API_ENDPOINT.SWITCH_USER,
      {
        email: u.email,
      },
      "application/json",
      authToken,
      "login"
    );
    console.log(response);
    if (response.status == 200) {
      console.log(response.data, response.data);
      login(response.data.user, response.data.token);
      toast.success(`User switched to ${response.data.user.name} successfully`);
      navigate("/");
    } else {
      toast.error("Credentials invalid, try again");
    }
  };

  const toggleUserDropdown = () => {
    const willOpen = !userDropdownOpen;
    setUserDropdownOpen(willOpen);
  };

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
        <div className="flex h-full flex-col flex-1 justify-between relative">
          <div>
            <div className="md:hidden flex justify-between p-3 relative">
              {/* Mobile header: name with role in brackets (smaller, responsive) */}
              <div className="flex-1 pr-2">
                <h2 className="text-lg font-bold text-blue-700 mb-1 truncate">
                  <span className="block truncate">{user.name}</span>
                  <span className="block text-xs sm:text-sm text-slate-500">
                    ({roleLabel})
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile: user switch button visible on small screens */}
                <div className="relative" ref={mobileDropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center gap-2 rounded-md px-2 py-1 border border-slate-200 hover:bg-slate-50"
                    aria-expanded={userDropdownOpen}
                  >
                    <User size={16} />
                    <ChevronDown size={16} />
                  </button>

                  {/* Mobile dropdown — align to right side of the sidebar / screen */}
                  {userDropdownOpen && (
                    <div className="absolute -right-8 top-12 mt-2 w-56 bg-white border rounded shadow-lg z-50 md:hidden">
                      <div className="p-2">
                        <div className="text-xs text-slate-500 mb-2">
                          Available users
                        </div>
                        <div className="max-h-48 overflow-auto">
                          {users.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => switchUser(u)}
                              className="w-full text-left px-3 py-2 rounded hover:bg-slate-100"
                            >
                              <div className="font-medium">{u.name}</div>
                              <div className="text-xs text-slate-500">
                                {u.role}
                              </div>
                            </button>
                          ))}
                          {users.length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500">
                              No users
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setOpenMenu(false)}
                  aria-label="Close menu"
                  className="text-slate-500 hover:text-red-500"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Sidebar content */}
            <div>
              <div className="max-md:hidden flex-col p-2 pb-2 border-b border-slate-100 flex justify-between">
                <div className="flex-1">
                  {/* Desktop header: name with role in brackets (smaller, responsive) */}
                  <h2 className="text-2xl md:text-2xl sm:text-xl font-bold text-blue-700 mb-1 truncate">
                    <span className="block truncate">{user.name}</span>
                    <span className="block text-sm md:text-xs text-slate-500">
                      ({roleLabel})
                    </span>
                  </h2>
                </div>

                {/* Quick User Switch Dropdown (desktop) — hidden on small screens */}
                <div className="relative" ref={desktopDropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center gap-2 rounded-md px-2 py-1 border border-slate-200 hover:bg-slate-50"
                    aria-expanded={userDropdownOpen}
                  >
                    <User size={16} />
                    <span className="text-sm">Switch user</span>
                    <ChevronDown size={16} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-50">
                      <div className="p-2">
                        <div className="text-xs text-slate-500 mb-2">
                          Available users
                        </div>
                        <div className="max-h-48 overflow-auto">
                          {users.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => switchUser(u)}
                              className="w-full text-left px-3 py-2 rounded hover:bg-slate-100"
                            >
                              <div className="font-medium">{u.name}</div>
                              <div className="text-xs text-slate-500">
                                {u.role}
                              </div>
                            </button>
                          ))}
                          {users.length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500">
                              No users
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <nav className="flex flex-col space-y-1 p-3">
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
