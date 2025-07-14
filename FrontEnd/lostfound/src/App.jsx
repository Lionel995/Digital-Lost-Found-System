import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from './Core Layout Components/NavBar';
import Footer from './Core Layout Components/Footer';
import Home from './Page Components/Home';
import ReportLost from './Page Components/ReportLost';
import Lost from './Page Components/Lost';
import Found from './Page Components/Found';
import ReportFound from './Page Components/ReportFound';
import ClaimRequested from './Page Components/ClaimRequested';
import Auth from './Page Components/Auth';
import ScrollToTop from './ScrollToTop Component/ScrollToTop';
import DashboardPage from './Page Components/DashboardPage';
import DashboardLayout from './components/DashboardLayout';
import UsersPage from './Page Components/UsersPage';
import SettingsPage from './Page Components/SettingsPage';
import ClaimReport from './Page Components/ClaimReport';
import ItemsPage from './Page Components/ItemsPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report-lost" element={<Lost />} />
        <Route path="/report-lost/form" element={<ReportLost />} />
        <Route path="/report-found" element={<Found />} />
        <Route path="/report-found/form" element={<ReportFound />} />
        <Route path="/claim-request" element={<ClaimRequested />} />
        <Route path="/login" element={<Auth setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/lost-reports" element={<div>Lost Reports Page</div>} />
        <Route path="/found-reports" element={<div>Found Reports Page</div>} />
        <Route path="/claim-requests" element={<div>Claim Requests Page</div>} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/activity/:id" element={<div>Activity Detail Page</div>} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/reports" element={<ClaimReport />} />
          <Route path="/dashboard/items" element={<ItemsPage/>} />
          <Route path="/dashboard/users" element={<UsersPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
