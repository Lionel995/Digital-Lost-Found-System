import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MdOutlineReport, MdInventory2, MdChecklist, MdPeople, MdRefresh, MdNavigateNext, MdNavigateBefore } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const COLORS = ['#eab308', '#22c55e', '#3b82f6', '#ef4444'];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Pagination state for Recent Activity table
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 5 activities per page
  
  // Real data states
  const [dashboardData, setDashboardData] = useState({
    users: [],
    lostReports: [],
    foundReports: [],
    claimRequests: [],
    recentActivities: []
  });

  // Base URL for your backend
  const BASE_URL = 'http://localhost:8081';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Create axios config with auth header
  const getAxiosConfig = () => {
    const token = getAuthToken();
    return {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };
  };

  // Convert real lost items to activities format
  const convertLostItemsToActivities = (lostItems) => {
    return lostItems.slice(0, 2).map(item => ({
      id: `lost-${item.id}`,
      type: 'Lost',
      item: item.itemName || item.name || 'Unknown Item',
      date: item.lostDate ? item.lostDate.split('T')[0] : item.date || new Date().toISOString().split('T')[0],
      status: item.status || 'LOST',
      location: item.locationLost || item.location || 'Unknown Location'
    }));
  };

  // Convert real found items to activities format
  const convertFoundItemsToActivities = (foundItems) => {
    return foundItems.slice(0, 2).map(item => ({
      id: `found-${item.id}`,
      type: 'Found',
      item: item.itemName || item.name || 'Unknown Item',
      date: item.foundDate ? item.foundDate.split('T')[0] : item.date || new Date().toISOString().split('T')[0],
      status: item.status || 'FOUND',
      location: item.locationFound || item.location || 'Unknown Location'
    }));
  };

  // Convert real claims to activities format
  const convertClaimsToActivities = (claims) => {
    return claims.slice(0, 3).map(claim => ({
      id: `claim-${claim.id}`,
      type: 'Claim',
      item: claim.lostItem?.itemName || claim.foundItem?.itemName || 'Unknown Item',
      date: claim.createdAt ? claim.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      status: claim.status || 'PENDING',
      location: claim.lostItem?.locationLost || claim.foundItem?.locationFound || 'Unknown Location'
    }));
  };

  // Generate recent activities from all real data
  const generateRecentActivities = (data) => {
    const activities = [];
    
    // Add recent lost reports (real data)
    if (data.lostReports && data.lostReports.length > 0) {
      const lostActivities = convertLostItemsToActivities(data.lostReports);
      activities.push(...lostActivities);
    }

    // Add recent found reports (real data)
    if (data.foundReports && data.foundReports.length > 0) {
      const foundActivities = convertFoundItemsToActivities(data.foundReports);
      activities.push(...foundActivities);
    }

    // Add recent claims (real data)
    if (data.claimRequests && data.claimRequests.length > 0) {
      const claimActivities = convertClaimsToActivities(data.claimRequests);
      activities.push(...claimActivities);
    }

    // Sort by date (newest first) and return all (pagination will handle limiting)
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Fetch all dashboard data from real endpoints
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found. Please login again.');
        toast.error('No authentication token found. Please login again.');
        return;
      }

      console.log('Fetching dashboard data from real endpoints...');
      
      // Start with empty data structure
      const newData = {
        users: [],
        lostReports: [],
        foundReports: [],
        claimRequests: [],
        recentActivities: []
      };

      // Fetch real data from all available endpoints
      const fetchPromises = [];

      // 1. Fetch users data
      fetchPromises.push(
        axios.get(`${BASE_URL}/users/all`, getAxiosConfig())
          .then(response => {
            newData.users = response.data || [];
            console.log('Users fetched successfully:', response.data?.length || 0);
          })
          .catch(error => {
            console.error('Error fetching users:', error);
            if (error.response?.status === 401) {
              throw new Error('Unauthorized access. Please login again.');
            } else if (error.response?.status === 403) {
              console.log('Access denied for users endpoint, continuing with empty array');
            }
            // For other errors, continue with empty users array
            console.log('Using empty users array due to fetch error');
          })
      );

      // 2. Fetch lost items data (same endpoint as Lost page)
      fetchPromises.push(
        axios.get(`${BASE_URL}/lostItem/getAllLostItems`, getAxiosConfig())
          .then(response => {
            newData.lostReports = response.data || [];
            console.log('Lost items fetched successfully:', response.data?.length || 0);
          })
          .catch(error => {
            console.error('Error fetching lost items:', error);
            if (error.response?.status === 401) {
              throw new Error('Unauthorized access. Please login again.');
            } else if (error.response?.status === 403) {
              console.log('Access denied for lost items endpoint, continuing with empty array');
            }
            // For other errors, continue with empty array
            console.log('Using empty lost items array due to fetch error');
          })
      );

      // 3. Fetch found items data (same endpoint as Found page)
      fetchPromises.push(
        axios.get(`${BASE_URL}/foundItems/getAll`, getAxiosConfig())
          .then(response => {
            newData.foundReports = response.data || [];
            console.log('Found items fetched successfully:', response.data?.length || 0);
          })
          .catch(error => {
            console.error('Error fetching found items:', error);
            if (error.response?.status === 401) {
              throw new Error('Unauthorized access. Please login again.');
            } else if (error.response?.status === 403) {
              console.log('Access denied for found items endpoint, continuing with empty array');
            }
            // For other errors, continue with empty array
            console.log('Using empty found items array due to fetch error');
          })
      );

      // 4. Fetch claims data (same endpoint as ClaimReport)
      fetchPromises.push(
        axios.get(`${BASE_URL}/claimRequests/all`, getAxiosConfig())
          .then(response => {
            newData.claimRequests = response.data || [];
            console.log('Claims fetched successfully:', response.data?.length || 0);
          })
          .catch(error => {
            console.error('Error fetching claims:', error);
            if (error.response?.status === 401) {
              throw new Error('Unauthorized access. Please login again.');
            } else if (error.response?.status === 403) {
              console.log('Access denied for claims endpoint, continuing with empty array');
            }
            // For other errors, continue with empty claims array
            console.log('Using empty claims array due to fetch error');
          })
      );

      // Wait for all API calls to complete
      await Promise.all(fetchPromises);

      // Generate recent activities from available real data
      newData.recentActivities = generateRecentActivities(newData);

      setDashboardData(newData);
      setLastUpdated(new Date());
      
      console.log('Dashboard data updated successfully:', {
        users: newData.users.length,
        lostReports: newData.lostReports.length,
        foundReports: newData.foundReports.length,
        claims: newData.claimRequests.length,
        activities: newData.recentActivities.length
      });
      
      toast.success(`Dashboard updated: ${newData.users.length} users, ${newData.lostReports.length} lost, ${newData.foundReports.length} found, ${newData.claimRequests.length} claims`);
      
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      
      if (error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
        setError(error.message);
        if (error.message.includes('Unauthorized')) {
          localStorage.removeItem('token');
        }
        toast.error(error.message);
      } else {
        setError(error.message || 'Failed to fetch dashboard data');
        toast.error('Failed to fetch some dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 300000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate summary data from real data
  const summaryData = [
    { 
      name: 'Lost Reports', 
      value: dashboardData.lostReports?.length || 0, 
      icon: <MdOutlineReport />, 
      color: 'text-purple-500', 
      link: '/dashboard/reports',
      dataSource: 'Live'
    },
    { 
      name: 'Found Reports', 
      value: dashboardData.foundReports?.length || 0, 
      icon: <MdInventory2 />, 
      color: 'text-green-500', 
      link: '/dashboard/items',
      dataSource: 'Live'
    },
    { 
      name: 'Claim Requests', 
      value: dashboardData.claimRequests?.length || 0, 
      icon: <MdChecklist />, 
      color: 'text-yellow-500', 
      link: '/dashboard/claims',
      dataSource: 'Live'
    },
    { 
      name: 'Users', 
      value: dashboardData.users?.length || 0, 
      icon: <MdPeople />, 
      color: 'text-blue-500', 
      link: '/dashboard/users',
      dataSource: 'Live'
    },
  ];

  // Calculate bar chart data from real data
  const barChartData = [
    { name: 'Lost', items: dashboardData.lostReports?.length || 0 },
    { name: 'Found', items: dashboardData.foundReports?.length || 0 },
    { name: 'Claims', items: dashboardData.claimRequests?.length || 0 },
    { name: 'Users', items: dashboardData.users?.length || 0 },
  ];

  // Calculate pie chart data from real claims data (matching ClaimReport statuses)
  const pieChartData = [
    { 
      name: 'Pending', 
      value: dashboardData.claimRequests?.filter(claim => claim.status === 'PENDING').length || 0
    },
    { 
      name: 'Approved', 
      value: dashboardData.claimRequests?.filter(claim => claim.status === 'APPROVED').length || 0
    },
    { 
      name: 'Rejected', 
      value: dashboardData.claimRequests?.filter(claim => claim.status === 'REJECTED').length || 0
    },
    { 
      name: 'Reviewed', 
      value: dashboardData.claimRequests?.filter(claim => claim.status === 'REVIEWED').length || 0
    },
  ];

  // Calculate additional statistics from real data
  const pendingClaims = dashboardData.claimRequests?.filter(claim => claim.status === 'PENDING').length || 0;
  const approvedClaims = dashboardData.claimRequests?.filter(claim => claim.status === 'APPROVED').length || 0;
  const rejectedClaims = dashboardData.claimRequests?.filter(claim => claim.status === 'REJECTED').length || 0;
  const reviewedClaims = dashboardData.claimRequests?.filter(claim => claim.status === 'REVIEWED').length || 0;
  const totalClaims = dashboardData.claimRequests?.length || 0;
  const successRate = totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0;
  const matchRate = (dashboardData.lostReports?.length || 0) > 0 ? 
    Math.round(((dashboardData.foundReports?.length || 0) / (dashboardData.lostReports?.length || 1)) * 100) : 0;

  // Calculate lost and found item statistics
  const lostItemsWithStatus = dashboardData.lostReports?.filter(item => item.status) || [];
  const foundItemsWithStatus = dashboardData.foundReports?.filter(item => item.status) || [];
  
  const lostItemStatuses = {
    pending: lostItemsWithStatus.filter(item => item.status === 'LOST' || item.status === 'PENDING').length,
    found: lostItemsWithStatus.filter(item => item.status === 'FOUND').length,
    closed: lostItemsWithStatus.filter(item => item.status === 'CLOSED').length
  };

  const foundItemStatuses = {
    available: foundItemsWithStatus.filter(item => item.status === 'FOUND' || item.status === 'AVAILABLE').length,
    claimed: foundItemsWithStatus.filter(item => item.status === 'CLAIMED').length,
    returned: foundItemsWithStatus.filter(item => item.status === 'RETURNED').length
  };

  const handleCardClick = (link) => {
    navigate(link);
  };

  const sortData = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  const filteredActivities = (dashboardData.recentActivities || []).filter((activity) =>
    activity.item?.toLowerCase().includes(search.toLowerCase())
  );

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic for Recent Activity table
  const indexOfLastActivity = currentPage * itemsPerPage;
  const indexOfFirstActivity = indexOfLastActivity - itemsPerPage;
  const currentActivities = sortedActivities.slice(indexOfFirstActivity, indexOfLastActivity);
  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ToastContainer />
        <div className="text-center max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <MdRefresh />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryData.map((item) => (
          <Card
            key={item.name}
            className="cursor-pointer hover:shadow-purple-500/20 transition-shadow group"
            onClick={() => handleCardClick(item.link)}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <span className={`text-3xl ${item.color} group-hover:scale-110 transition-transform`}>
                {item.icon}
              </span>
              <div>
                <h4 className="text-gray-400 text-sm">{item.name}</h4>
                <p className="text-xl font-bold text-white">{item.value}</p>
                <span className="text-xs text-green-400">{item.dataSource}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Reports Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <XAxis dataKey="name" stroke="#a1a1aa" />
                <YAxis allowDecimals={false} stroke="#a1a1aa" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                />
                <Bar dataKey="items" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Claim Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <div className="flex items-center gap-4">
              {sortedActivities.length > 0 && (
                <span className="text-sm text-gray-400">
                  Showing {indexOfFirstActivity + 1}-{Math.min(indexOfLastActivity, sortedActivities.length)} of {sortedActivities.length} activities
                </span>
              )}
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Search activities..."
            className="w-full px-4 py-2 mb-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead>
                <tr className="border-b border-gray-700">
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition" 
                    onClick={() => sortData('type')}
                  >
                    Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition" 
                    onClick={() => sortData('item')}
                  >
                    Item {sortConfig.key === 'item' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition" 
                    onClick={() => sortData('date')}
                  >
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition" 
                    onClick={() => sortData('status')}
                  >
                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-4">Location</th>
                </tr>
              </thead>
              <tbody>
                {currentActivities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b border-gray-800 hover:bg-gray-700/50 cursor-pointer transition"
                    onClick={() => {
                      if (activity.type === 'Lost') {
                        navigate('/dashboard/reports');
                      } else if (activity.type === 'Found') {
                        navigate('/dashboard/items');
                      } else if (activity.type === 'Claim') {
                        navigate('/dashboard/claims');
                      }
                    }}
                  >
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.type === 'Lost' 
                          ? 'bg-purple-500/20 text-purple-400'
                          : activity.type === 'Found'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {activity.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{activity.item}</td>
                    <td className="py-3 px-4">{new Date(activity.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'PENDING' || activity.status === 'LOST'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : activity.status === 'APPROVED' || activity.status === 'FOUND'
                            ? 'bg-green-500/20 text-green-400'
                            : activity.status === 'AVAILABLE'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {activity.location || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination for Recent Activity */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-2 rounded-lg ${
                  currentPage === 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } transition-colors`}
              >
                <MdNavigateBefore className="text-xl" />
                Previous
              </button>

              <div className="flex space-x-1">
                {getPageNumbers().map((pageNumber, index) => (
                  <button
                    key={index}
                    onClick={() => typeof pageNumber === 'number' && handlePageChange(pageNumber)}
                    disabled={pageNumber === '...'}
                    className={`px-3 py-2 rounded-lg ${
                      pageNumber === currentPage
                                                ? 'bg-purple-600 text-white font-bold'
                        : pageNumber === '...'
                        ? 'bg-transparent text-gray-400 cursor-default'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    } transition-colors`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center px-3 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } transition-colors`}
              >
                Next
                <MdNavigateNext className="text-xl" />
              </button>
            </div>
          )}

          {currentActivities.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {search ? 'No activities match your search.' : 'No recent activities found.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardContent className="text-center p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Pending Claims</h3>
            <p className="text-3xl font-bold text-yellow-500">{pendingClaims}</p>
            <p className="text-sm text-gray-400 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Approved Claims</h3>
            <p className="text-3xl font-bold text-green-500">{approvedClaims}</p>
            <p className="text-sm text-gray-400 mt-1">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Success Rate</h3>
            <p className="text-3xl font-bold text-blue-500">{successRate}%</p>
            <p className="text-sm text-gray-400 mt-1">Claims approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Match Rate</h3>
            <p className="text-3xl font-bold text-purple-500">{matchRate}%</p>
            <p className="text-sm text-gray-400 mt-1">Items found vs lost</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Data Status */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span>
              <strong className="text-white">Data Status:</strong> 
              <span className="ml-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                Live
              </span>
            </span>
            <span>
              <strong className="text-white">Auto-refresh:</strong> Every 30 seconds
            </span>
            <span>
              <strong className="text-white">Last Update:</strong> {lastUpdated.toLocaleTimeString()}
            </span>
            <span>
              <strong className="text-white">Total Records:</strong> 
              {(dashboardData.users?.length || 0) + (dashboardData.lostReports?.length || 0) + 
               (dashboardData.foundReports?.length || 0) + (dashboardData.claimRequests?.length || 0)}
            </span>
            <span>
              <strong className="text-white">Activities:</strong> 
              <span className="text-purple-400">{sortedActivities.length}</span>
            </span>
            {totalPages > 1 && (
              <span>
                <strong className="text-white">Page:</strong> 
                <span className="text-purple-400">{currentPage} of {totalPages}</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Lost Items Statistics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Lost Items Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Still Lost:</span>
                <span className="text-yellow-400 font-bold">{lostItemStatuses.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Found:</span>
                <span className="text-green-400 font-bold">{lostItemStatuses.found}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Closed:</span>
                <span className="text-gray-400 font-bold">{lostItemStatuses.closed}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-purple-400 font-bold">{dashboardData.lostReports?.length || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Found Items Statistics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Found Items Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Available:</span>
                <span className="text-blue-400 font-bold">{foundItemStatuses.available}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Claimed:</span>
                <span className="text-yellow-400 font-bold">{foundItemStatuses.claimed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Returned:</span>
                <span className="text-green-400 font-bold">{foundItemStatuses.returned}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-green-400 font-bold">{dashboardData.foundReports?.length || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims Statistics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Claims Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Pending:</span>
                <span className="text-yellow-400 font-bold">{pendingClaims}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reviewed:</span>
                <span className="text-blue-400 font-bold">{reviewedClaims}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Approved:</span>
                <span className="text-green-400 font-bold">{approvedClaims}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rejected:</span>
                <span className="text-red-400 font-bold">{rejectedClaims}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-yellow-400 font-bold">{totalClaims}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
