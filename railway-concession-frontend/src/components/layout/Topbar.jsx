import React from "react";
import { useAuth } from "../../contexts/AuthContext";

const Topbar = ({ onMenuClick }) => {
  const { user, role, logout } = useAuth();

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short"
  });

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 md:hidden"
            aria-label="Open sidebar"
          >
            <span className="text-lg leading-none">≡</span>
          </button>

          <div>
            <p className="text-sm text-slate-500">{today}</p>
            <p className="text-base font-bold text-slate-900">
              Welcome, {user?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800 md:inline-flex">
            {role}
          </span>

          <span className="hidden text-sm text-slate-600 lg:inline">
            {user?.email || user?.id}
          </span>

          <button
            onClick={logout}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;