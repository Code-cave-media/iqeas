import React, { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FileSearch,
  Calculator,
  FileCheck2,
  Receipt,
  IndianRupee,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const rfqLinks = [
  { label: "Enquiry", to: "", icon: FileSearch },
  { label: "Estimation", to: "/rfq/estimation", icon: Calculator },
  { label: "PO", to: "/rfq/po", icon: FileCheck2 },
  { label: "Invoice", to: "/rfq/invoice", icon: Receipt },
  { label: "Payment", to: "/rfq/payment", icon: IndianRupee },
];

const RFQLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role.toLowerCase() !== "rfq") {
      navigate("/not-authorized");
    }
  }, [user]);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-blue-700 truncate">
            {user?.name}
          </h2>
          <p className="text-sm text-slate-500 truncate">(RFQ Team)</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {rfqLinks.map(({ label, to, icon: Icon }) => {
            const active = pathname === to;

            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                  active
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} className="mr-3" />
                {label}
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 border-t border-slate-200"
        >
          <LogOut size={18} className="mr-3" />
          Logout
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default RFQLayout;
