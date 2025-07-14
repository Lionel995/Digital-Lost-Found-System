import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { MdPeople, MdRefresh, MdNavigateNext, MdNavigateBefore } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [debugInfo, setDebugInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // 8 users per page

  // Base URL for your backend
  const BASE_URL = 'http://localhost:8081';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Get user role from localStorage
  const getUserRole = () => {
    return localStorage.getItem('role');
  };

  // Get user info
  const getUserInfo = () => {
    return {
      name: localStorage.getItem('name'),
      email: localStorage.getItem('email'),
      role: localStorage.getItem('role'),
      token: localStorage.getItem('token')
    };
  };

  // Create axios config with auth header
  const getAxiosConfig = () => {
    const token = getAuthToken();
    console.log('Auth token:', token);
    return {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };
  };

  // Debug function to check localStorage and current user
  const checkAuthStatus = () => {
    const userInfo = getUserInfo();
    
    console.log('=== AUTH DEBUG INFO ===');
    console.log('Token:', userInfo.token);
    console.log('User Role:', userInfo.role);
    console.log('User Name:', userInfo.name);
    console.log('User Email:', userInfo.email);
    console.log('LocalStorage keys:', Object.keys(localStorage));
    
    setDebugInfo({
      token: userInfo.token ? 'Present' : 'Missing',
      role: userInfo.role || 'Not found',
      name: userInfo.name || 'Not found',
      email: userInfo.email || 'Not found',
      allKeys: Object.keys(localStorage)
    });
  };

  // Check if user is admin - FIXED: Check for both uppercase and lowercase
  const isAdmin = () => {
    const role = getUserRole();
    return role === 'ADMIN' || role === 'admin'; // Check both cases
  };

  // Fetch users directly from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check auth status first
      checkAuthStatus();
      
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        toast.error('No authentication token found. Please login again.');
        return;
      }

      // Remove the frontend admin check - let the backend handle it
      console.log('Making request to:', `${BASE_URL}/users/all`);
      console.log('With config:', getAxiosConfig());
      
      const response = await axios.get(`${BASE_URL}/users/all`, getAxiosConfig());
      setUsers(response.data || []);
      console.log('Users fetched successfully:', response.data);
      
      if (response.data && response.data.length > 0) {
        toast.success(`Successfully loaded ${response.data.length} users`);
      } else {
        toast.info('No users found');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        setError('Unauthorized access. Please login again.');
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You need admin privileges to view users.');
        toast.error('Access denied. Admin privileges required.');
      } else if (error.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please check if the backend is running on port 8081.');
        toast.error('Cannot connect to server');
      } else {
        setError(error.response?.data || error.message || 'Failed to fetch users');
        toast.error('Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete user directly
  const handleDeleteUser = async (userId) => {
    if (!isAdmin()) {
      toast.error('Access denied. You need admin privileges to delete users.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const loadingToast = toast.loading('Deleting user...');
        
        await axios.delete(`${BASE_URL}/users/delete/${userId}`, getAxiosConfig());
        
        // Remove user from local state instead of refetching
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        
        toast.update(loadingToast, {
          render: 'User deleted successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        
        if (error.response?.status === 403) {
          toast.error('Access denied. You can only delete your own account or need admin privileges.');
        } else {
          toast.error(error.response?.data || 'Failed to delete user');
        }
      }
    }
  };

  // Load users on component mount
  useEffect(() => {
    checkAuthStatus();
    fetchUsers();
  }, []);

  const sortData = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortConfig]);

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
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
          
          {/* Debug Information */}
          {debugInfo && (
            <div className="bg-gray-800 p-4 rounded-lg mb-4 text-left text-sm">
              <h3 className="text-white font-bold mb-2">Debug Info:</h3>
              <p className="text-gray-300">Token: {debugInfo.token}</p>
              <p className="text-gray-300">Role: {debugInfo.role}</p>
              <p className="text-gray-300">Name: {debugInfo.name}</p>
              <p className="text-gray-300">Email: {debugInfo.email}</p>
              <p className="text-gray-300">LocalStorage Keys: {debugInfo.allKeys.join(', ')}</p>
              <p className="text-gray-300">Is Admin: {isAdmin() ? 'Yes' : 'No'}</p>
              <p className="text-gray-300">Role Check: '{getUserRole()}' === 'ADMIN' || '{getUserRole()}' === 'admin'</p>
            </div>
          )}
          
          <div className="flex gap-2 justify-center">
            <button
              onClick={fetchUsers}
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
            <button
              onClick={() => {
                // Test API call directly
                const token = localStorage.getItem('token');
                fetch('http://localhost:8081/users/all', {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  }
                })
                .then(response => {
                  console.log('Direct API test - Status:', response.status);
                  return response.text();
                })
                .then(data => {
                  console.log('Direct API test - Response:', data);
                  toast.success('Check console for API test results');
                })
                .catch(error => {
                  console.error('Direct API test - Error:', error);
                  toast.error('API test failed - check console');
                });
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Test API
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
        <div className="flex items-center gap-3">
          <MdPeople className="text-3xl text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Users</h1>
            {sortedUsers.length > 0 && (
              <p className="text-sm text-gray-400">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedUsers.length)} of {sortedUsers.length} users
                {search && ` (filtered)`}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={checkAuthStatus}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Debug Auth
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <MdRefresh />
            Refresh
          </button>
        </div>
      </div>

      {/* User Info Display */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <p className="text-gray-300 text-sm">
          Logged in as: <span className="text-white font-medium">{getUserInfo().name}</span> 
          ({getUserInfo().email}) - Role: <span className="text-purple-400">{getUserInfo().role}</span>
          {isAdmin() && <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">ADMIN ACCESS</span>}
        </p>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">All Users</h2>
            <input
              type="text"
              placeholder="Search by name or email..."
                            className="w-full max-w-xs px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {currentUsers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 cursor-pointer hover:text-white transition" onClick={() => sortData('id')}>
                        ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="py-3 px-4 cursor-pointer hover:text-white transition" onClick={() => sortData('name')}>
                        Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="py-3 px-4 cursor-pointer hover:text-white transition" onClick={() => sortData('email')}>
                        Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="py-3 px-4 cursor-pointer hover:text-white transition" onClick={() => sortData('phoneNumber')}>
                        Phone {sortConfig.key === 'phoneNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="py-3 px-4 cursor-pointer hover:text-white transition" onClick={() => sortData('role')}>
                        Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-700/50 transition">
                        <td className="py-3 px-4">{user.id}</td>
                        <td className="py-3 px-4 font-medium">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{user.phoneNumber}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                            user.role === 'MODERATOR' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button 
                              className="text-blue-400 hover:text-blue-300 transition"
                              onClick={() => {
                                console.log('Edit user:', user.id);
                                toast.info(`Edit functionality for user: ${user.name}`);
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className="text-red-400 hover:text-red-300 transition"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              {search ? 'No users match your search.' : 'No users found.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardContent className="text-center p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-purple-500">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Admins</h3>
            <p className="text-3xl font-bold text-red-500">
              {users.filter(user => user.role === 'ADMIN').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Moderators</h3>
            <p className="text-3xl font-bold text-blue-500">
              {users.filter(user => user.role === 'MODERATOR').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Regular Users</h3>
            <p className="text-3xl font-bold text-green-500">
              {users.filter(user => user.role === 'USER').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Panel */}
      {sortedUsers.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span>
                <strong className="text-white">Current Page:</strong> {currentPage} of {totalPages}
              </span>
              <span>
                <strong className="text-white">Items per Page:</strong> {itemsPerPage}
              </span>
              <span>
                <strong className="text-white">Total Results:</strong> {sortedUsers.length}
              </span>
              {search && (
                <span>
                  <strong className="text-white">Search:</strong> "{search}"
                </span>
              )}
              <span>
                <strong className="text-white">Sort:</strong> {sortConfig.key} ({sortConfig.direction})
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsersPage;

