import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({ children }) => {
  const { role } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="relative flex min-h-screen">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-blue-200/35 blur-3xl" />
          <div className="absolute left-1/3 top-1/3 h-56 w-56 rounded-full bg-sky-100/40 blur-3xl" />
        </div>

        {/* Sidebar */}
        <Sidebar
          role={role}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        {/* Main Area */}
        <div className="relative z-10 flex min-h-screen flex-1 flex-col">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;