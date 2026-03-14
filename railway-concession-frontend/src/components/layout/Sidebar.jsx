import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ role, isOpen, onClose }) => {
  const location = useLocation();

  const navItems = {
    student: [
      { to: "/student/dashboard", key: "dashboard", label: "Dashboard" },
      { to: "/student/applications", key: "applications", label: "My Applications" }
    ],
    staff: [
      { to: "/staff/dashboard", key: "dashboard", label: "Dashboard" },
      { to: "/staff/applications", key: "applications", label: "Applications" },
      { to: "/staff/students", key: "students", label: "Students" },
      { to: "/staff/reports", key: "reports", label: "Reports" },
      { to: "/staff/audit", key: "audit", label: "Audit Logs" }
    ]
  };

  const items = navItems[role] || [];

  const linkClass = (path) => {
    const isActive = location.pathname.startsWith(path);
    return [
      "group flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition",
      isActive
        ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-sm"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    ].join(" ");
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] transition md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/70",
          "bg-white/95 shadow-xl backdrop-blur-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:z-20 md:w-72 md:translate-x-0 md:shadow-none"
        ].join(" ")}
      >
        <div className="border-b border-slate-200 px-6 py-6">
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            Railway Concession
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            Management Portal
          </p>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={linkClass(item.key === "dashboard" ? item.to : item.to)}
              onClick={onClose}
            >
              <span className="h-2 w-2 rounded-full bg-current opacity-70" />
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-200">
            Keep your records updated to speed up concession approvals.
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;