import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const Header = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // 🔴 IMPORTANT: backend logout call
  const handleLogout = async () => {
    try {
      await logout();              // calls backend logout API
      navigate('/login');
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const staffMenuItems = [
    { path: '/staff/dashboard', label: 'Dashboard' },
    { path: '/staff/applications', label: 'Applications' },
    { path: '/staff/students', label: 'Students' },
    { path: '/staff/reports', label: 'Reports' },
    { path: '/staff/settings', label: 'Settings' },
    { path: '/staff/audit', label: 'Audit Logs'}
  ];

  return (
    <header className="relative z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Railway Concession System
              </h1>
            </Link>
          </div>

          {/* RIGHT SIDE */}
          {isAuthenticated && (
            <div className="flex items-center space-x-4">

              {/* STAFF DROPDOWN */}
              {role === 'staff' && (
                <div className="relative">
                  <Button
                    onClick={toggleDropdown}
                    variant="outline"
                    className="flex items-center space-x-2 border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    <span>Dashboard</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                      {staffMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* USER INFO */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email || user?.id}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {role}
                </p>
              </div>

              {/* 🔴 LOGOUT BUTTON */}
              <Button
                onClick={handleLogout}
                className="px-4 py-2 text-sm"
                variant="danger"
              >
                Logout
              </Button>

            </div>
          )}

        </div>
      </div>

      {/* overlay to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
