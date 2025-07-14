// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdOutlineReport,
  MdInventory,
  MdPeople,
  MdSettings,
} from 'react-icons/md';
import { FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    navigate('/login'); // Simulated logout
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close' : 'Menu'}
      </button>

      {/* Sidebar */}
      <aside
        className={`h-screen w-64 bg-gray-800 text-white fixed top-0 left-0 flex flex-col shadow-lg transform transition-transform md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:w-64 z-40`}
      >
        {/* Logo / Title */}
        <div className="px-6 py-5 text-2xl font-bold border-b border-gray-700">
          Lost & Found
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded-md transition"
            onClick={() => setIsOpen(false)}
          >
            <MdDashboard className="text-xl" />
            Dashboard
          </Link>
          <Link
            to="/dashboard/reports"
            className="flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded-md transition"
            onClick={() => setIsOpen(false)}
          >
            <MdOutlineReport className="text-xl" />
            Reports
          </Link>
          <Link
            to="/dashboard/items"
            className="flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded-md transition"
            onClick={() => setIsOpen(false)}
          >
            <MdInventory className="text-xl" />
            Items
          </Link>
          <Link
            to="/dashboard/users"
            className="flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded-md transition"
            onClick={() => setIsOpen(false)}
          >
            <MdPeople className="text-xl" />
            Users
          </Link>
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded-md transition"
            onClick={() => setIsOpen(false)}
          >
            <MdSettings className="text-xl" />
            Settings
          </Link>
        </nav>

        {/* Bottom Section: Logout */}
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-md hover:from-red-700 hover:to-red-800 transition"
          >
            <FaSignOutAlt className="text-lg" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
