/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FileSearch,
  Calculator,
  FileCheck2,
  Receipt,
  IndianRupee,
  LogOut,
  ArrowLeft,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const RFQLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { project_id } = useParams();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role.toLowerCase() !== "rfq") {
      navigate("/not-authorized");
    }
  }, [user]);

  const rfqLinks = [
    { label: "Enquiry", to: `/rfq/${project_id}/enquiry`, icon: FileSearch },
    {
      label: "Create Deliverables",
      to: `/rfq/${project_id}/deliverables`,
      icon: Calculator,
    },
    {
      label: "Estimation",
      to: `/rfq/${project_id}/estimation`,
      icon: Calculator,
    },
    { label: "PO", to: `/rfq/${project_id}/po`, icon: FileCheck2 },
    { label: "Invoice", to: `/rfq/${project_id}/invoice`, icon: Receipt },
    { label: "Payment", to: `/rfq/${project_id}/payment`, icon: IndianRupee },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans antialiased text-slate-900">
      {/* SIDEBAR - Consistent with main dashboard expandability */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          bg-white border-r border-slate-200/80
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group
          md:w-[72px] md:hover:w-64
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Back Button & User Profile */}
          <div className="p-4 mb-2 flex flex-col gap-4">
            {/* Back to RFQ List */}
            <button
              onClick={() => navigate("/rfq")}
              className="flex items-center h-10 w-full rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all overflow-hidden"
            >
              <div className="w-10 flex-shrink-0 flex justify-center">
                <ArrowLeft size={18} />
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-semibold text-sm">
                Back to RFQ List
              </span>
            </button>

            <div className="flex items-center gap-3 h-12">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                <User size={18} strokeWidth={2.5} />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                <p className="font-semibold text-sm text-slate-900 truncate tracking-tight">
                  {user?.name}
                </p>
                <p className="text-[11px] font-medium text-slate-400 truncate uppercase">
                  RFQ Project Context
                </p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
            <div className="mb-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Management
              </p>
            </div>
            {rfqLinks.map(({ label, to, icon: Icon }) => {
              const isActive = pathname === to;
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
                  <div className="w-[48px] flex-shrink-0 flex justify-center">
                    <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-medium text-sm tracking-tight">
                    {label}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Logout */}
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

      <main className="flex-1 overflow-y-auto relative flex flex-col bg-white">
        <header className="px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase">
              Project ID: {project_id}
            </span>
          </div>
        </header>

        <div className="p-8 md:p-10 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default RFQLayout;
