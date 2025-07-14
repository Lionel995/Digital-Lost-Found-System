import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

function Layout() {
  const location = useLocation();

  // Check if the route starts with "/dashboard" to show Sidebar
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="bg-slate-100 min-h-screen text-gray-900">
      {isDashboard ? (
        <div className="flex">
          <Sidebar />
          <main className="ml-64 p-6 w-full bg-slate-100 min-h-screen">
            <Outlet />
          </main>
        </div>
      ) : (
        <>
          <NavBar />
          <main className="pt-20 px-4 min-h-[calc(100vh-160px)]">
            <Outlet />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}

export default Layout;
