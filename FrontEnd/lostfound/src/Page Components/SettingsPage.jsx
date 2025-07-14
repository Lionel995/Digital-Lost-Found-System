// src/Page Components/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { MdSettings, MdPalette, MdNotifications, MdPerson, MdSecurity, MdLanguage, MdRefresh, MdDownload } from 'react-icons/md';
import { Switch } from '@headlessui/react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  // Theme Toggle State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Profile Settings State
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    phoneNumber: '+1234567890',
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailReports: true,
    emailClaims: false,
    smsReports: false,
    smsClaims: true,
    userActivity: true,
  });

  // Dashboard Customization State
  const [dashboardLayout, setDashboardLayout] = useState('grid');
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6');
  const colors = ['#8b5cf6', '#3b82f6', '#22c55e', '#eab308'];

  // Other Settings
  const [language, setLanguage] = useState('English');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Profile Form Handler
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Notification Toggle Handler
  const handleNotificationToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  // Simulated Export Settings
  const handleExportSettings = () => {
    const settings = { theme, profile, notifications, dashboardLayout, primaryColor, language, autoRefresh };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <MdSettings className="text-3xl text-purple-500" />
        <h1 className="text-3xl font-bold text-white dark:text-white">Settings</h1>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Theme Toggle */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white dark:text-white">Appearance</h2>
              <MdPalette className="text-2xl text-purple-500" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 dark:text-gray-300">Theme</span>
              <Switch
                checked={theme === 'dark'}
                onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`${
                  theme === 'dark' ? 'bg-purple-600' : 'bg-gray-600'
                } relative inline-flex h-6 w-11 items-center rounded-full transition`}
              >
                <span
                  className={`${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
              <span className="text-gray-300 dark:text-gray-300">{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white dark:text-white">Profile</h2>
              <MdPerson className="text-2xl text-purple-500" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-gray-300 dark:text-gray-300 text-sm mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
              <div>
                <label className="block text-gray-300 dark:text-gray-300 text-sm mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
              <div>
                <label className="block text-gray-300 dark:text-gray-300 text-sm mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition"
            >
              Save Profile
            </motion.button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white dark:text-white">Notifications</h2>
              <MdNotifications className="text-2xl text-purple-500" />
            </div>
            <div className="space-y-4">
              {[
                { key: 'emailReports', label: 'Email: New Reports' },
                { key: 'emailClaims', label: 'Email: Claim Requests' },
                { key: 'smsReports', label: 'SMS: New Reports' },
                { key: 'smsClaims', label: 'SMS: Claim Requests' },
                { key: 'userActivity', label: 'User Activity Alerts' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-300 dark:text-gray-300">{label}</span>
                  <Switch
                    checked={notifications[key]}
                    onChange={() => handleNotificationToggle(key)}
                    className={`${
                      notifications[key] ? 'bg-purple-600' : 'bg-gray-600'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                  >
                    <span
                      className={`${
                        notifications[key] ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                    />
                  </Switch>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Customization */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white dark:text-white">Dashboard</h2>
              <MdPalette className="text-2xl text-purple-500" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 dark:text-gray-300 text-sm mb-1">Card Layout</label>
                <select
                  value={dashboardLayout}
                  onChange={(e) => setDashboardLayout(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 dark:text-gray-300 text-sm mb-1">Primary Color</label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        primaryColor === color ? 'border-white' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setPrimaryColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white dark:text-white">Security</h2>
              <MdSecurity className="text-2xl text-purple-500" />
            </div>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600 transition">
                Change Password
              </button>
              <button className="w-full px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600 transition">
                Enable Two-Factor Authentication
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white dark:text-white">Advanced</h2>
              <MdLanguage className="text-2xl text-purple-500" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 dark:text-gray-300 text-sm mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 dark:text-gray-300">Auto-Refresh Dashboard</span>
                <Switch
                  checked={autoRefresh}
                  onChange={() => setAutoRefresh(!autoRefresh)}
                  className={`${
                    autoRefresh ? 'bg-purple-600' : 'bg-gray-600'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                  />
                </Switch>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleExportSettings}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition"
              >
                <MdDownload />
                Export Settings
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;