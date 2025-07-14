import React, { useState, useEffect } from 'react';
import {
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaUndo,
  FaFilter,
} from "react-icons/fa";
import { MdNavigateNext, MdNavigateBefore, MdReportProblem, MdRefresh } from "react-icons/md";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function ClaimReport() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 claims per page
  const [debugInfo, setDebugInfo] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Check if user is admin
  const isAdmin = () => {
    const role = getUserRole();
    return role === 'ADMIN' || role === 'admin';
  };

  // Fetch claims from backend
  const fetchClaims = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous requests
    
    try {
      setIsRefreshing(true);
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

      console.log('Making request to:', `${BASE_URL}/claimRequests/all`);
      console.log('With config:', getAxiosConfig());
      
      const response = await axios.get(`${BASE_URL}/claimRequests/all`, getAxiosConfig());
      const newClaims = response.data || [];
      
      // Only update state if data has changed
      const hasChanged = JSON.stringify(newClaims) !== JSON.stringify(claims);
      if (hasChanged || claims.length === 0) {
        setClaims(newClaims);
        setLastUpdated(new Date());
        console.log('Claims updated successfully:', newClaims.length);
        
        if (newClaims.length > 0) {
          toast.success(`Successfully loaded ${newClaims.length} claims`);
        } else {
          toast.info('No claims found');
        }
      } else {
        console.log('No changes detected in claims data');
      }
      
    } catch (error) {
      console.error('Error fetching claims:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        setError('Unauthorized access. Please login again.');
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You need admin privileges to view claims.');
        toast.error('Access denied. Admin privileges required.');
      } else if (error.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please check if the backend is running on port 8081.');
        toast.error('Cannot connect to server');
      } else {
        setError(error.response?.data || error.message || 'Failed to fetch claims');
        toast.error('Failed to fetch claims');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Update claim status
  const updateStatus = async (claimId, newStatus) => {
    if (!isAdmin()) {
      toast.error('Access denied. You need admin privileges to update claim status.');
      return;
    }

    try {
      const loadingToast = toast.loading(`Updating claim status to ${newStatus}...`);
      
      await axios.put(
        `${BASE_URL}/claimRequests/ClaimVerification/${claimId}/status?status=${newStatus}`,
        {},
        getAxiosConfig()
      );

      // Update local state
      setClaims(prevClaims =>
        prevClaims.map(claim =>
          claim.id === claimId ? { ...claim, status: newStatus } : claim
        )
      );

      setLastUpdated(new Date());

      toast.update(loadingToast, {
        render: `Claim status updated to ${newStatus} successfully!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

      // Trigger a refresh to sync with dashboard
      setTimeout(() => {
        fetchClaims();
      }, 1000);

    } catch (error) {
      console.error('Error updating claim status:', error);
      
      if (error.response?.status === 403) {
        toast.error('Access denied. You need admin privileges to update claim status.');
      } else {
        toast.error(error.response?.data || 'Failed to update claim status');
      }
    }
  };

  // Rollback claim decision
  const rollbackClaim = async (claimId) => {
    if (!isAdmin()) {
      toast.error('Access denied. You need admin privileges to rollback claims.');
      return;
    }

    try {
      const loadingToast = toast.loading('Rolling back claim decision...');
      
      await axios.put(
        `${BASE_URL}/claimRequests/rollback/${claimId}`,
        {},
        getAxiosConfig()
      );

      // Update local state
      setClaims(prevClaims =>
        prevClaims.map(claim =>
          claim.id === claimId ? { ...claim, status: 'PENDING' } : claim
        )
      );

      setLastUpdated(new Date());

      toast.update(loadingToast, {
        render: 'Claim decision rolled back to PENDING successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

      // Trigger a refresh to sync with dashboard
      setTimeout(() => {
        fetchClaims();
      }, 1000);

    } catch (error) {
      console.error('Error rolling back claim:', error);
      
      if (error.response?.status === 403) {
        toast.error('Access denied. You need admin privileges to rollback claims.');
      } else {
        toast.error(error.response?.data || 'Failed to rollback claim');
      }
    }
  };

  // Auto-refresh data every 30 seconds (same as dashboard)
  useEffect(() => {
    checkAuthStatus();
    fetchClaims();
    
    const interval = setInterval(() => {
      fetchClaims();
    }, 300000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter claims based on status
  const filteredClaims = claims.filter((claim) => {
    if (filter === "ALL") return true;
    return claim.status === filter;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClaims.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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

  const statusStyles = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    APPROVED: "bg-green-500/20 text-green-400",
    REJECTED: "bg-red-500/20 text-red-400",
    REVIEWED: "bg-blue-500/20 text-blue-400",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading claims...</p>
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
              onClick={fetchClaims}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
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
                fetch('http://localhost:8081/claimRequests/all', {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
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

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <MdReportProblem className="text-4xl text-yellow-500" />
            <div>
              <h1 className="text-4xl font-bold text-yellow-300">Claim Reports</h1>
              {filteredClaims.length > 0 && (
                <p className="text-sm text-gray-400">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredClaims.length)} of {filteredClaims.length} claims
                  {filter !== "ALL" && ` (filtered by ${filter})`}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={checkAuthStatus}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Debug
            </button>
            <button
              onClick={fetchClaims}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3 py-2 text-white rounded-lg transition ${
                isRefreshing 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              <MdRefresh className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* User Info Display */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-gray-300 text-sm">
              Logged in as: <span className="text-white font-medium">{getUserInfo().name}</span>
              ({getUserInfo().email}) - Role: <span className="text-yellow-400">{getUserInfo().role}</span>
              {isAdmin() && <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">ADMIN ACCESS</span>}
            </p>
            <div className="text-xs text-gray-400">
              <span className="mr-4">Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">Auto-sync with Dashboard</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-xl text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Total Claims</h3>
            <p className="text-2xl font-bold text-white">{claims.length}</p>
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Live</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Pending</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {claims.filter(claim => claim.status === 'PENDING').length}
            </p>
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Live</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Approved</h3>
            <p className="text-2xl font-bold text-green-400">
              {claims.filter(claim => claim.status === 'APPROVED').length}
            </p>
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Live</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Rejected</h3>
            <p className="text-2xl font-bold text-red-400">
              {claims.filter(claim => claim.status === 'REJECTED').length}
            </p>
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Live</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Reviewed</h3>
            <p className="text-2xl font-bold text-blue-400">
              {claims.filter(claim => claim.status === 'REVIEWED').length}
            </p>
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Live</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <FaFilter className="text-yellow-500" />
            <span className="text-sm font-medium">Filter by Status:</span>
          </div>
          {["ALL", "PENDING", "APPROVED", "REJECTED", "REVIEWED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {status}
              {status !== "ALL" && (
                <span className="ml-1 text-xs">
                  ({claims.filter(claim => claim.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Claims Grid */}
        {currentItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentItems.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-gray-800 p-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-4"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-yellow-300">
                      Claim #{claim.id}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[claim.status]}`}
                    >
                      {claim.status}
                    </span>
                  </div>
                  
                  {/* Brief Info */}
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-semibold">Lost:</span>{" "}
                      {claim.lostItem?.itemName || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Found:</span>{" "}
                      {claim.foundItem?.itemName || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">User:</span>{" "}
                      {claim.user?.name || claim.user?.fullName || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Contact:</span>{" "}
                      {claim.contactInformation || "N/A"}
                    </p>
                    <p className="truncate max-w-full">
                      <span className="font-semibold">Proof:</span>{" "}
                      {claim.proofDescription || "No description provided"}
                    </p>
                    {claim.createdAt && (
                      <p>
                        <span className="font-semibold">Submitted:</span>{" "}
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  {/* Proof Image */}
                  <div className="mt-2">
                    {claim.proofImageUrl ? (
                      <img
                        src={claim.proofImageUrl}
                        alt="Proof"
                        className="w-full h-32 object-cover rounded border border-gray-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <p className="text-gray-400 italic">No image provided</p>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <button
                      onClick={() => setSelectedClaim(claim)}
                      className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                    >
                      <FaEye /> View
                    </button>
                    {isAdmin() && (claim.status === "PENDING" || claim.status === "REVIEWED") && (
                      <>
                        <button
                          className="bg-green-500 hover:bg-green-400 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                          onClick={() => updateStatus(claim.id, "APPROVED")}
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                          onClick={() => updateStatus(claim.id, "REJECTED")}
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </>
                    )}
                    {isAdmin() && ["APPROVED", "REJECTED"].includes(claim.status) && (
                      <button
                        className="bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1 rounded text-xs flex items-center gap-1"
                        onClick={() => rollbackClaim(claim.id)}
                      >
                        <FaUndo /> Rollback
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 text-black hover:bg-yellow-400'
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
                          ? 'bg-yellow-500 text-black font-bold'
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
                      : 'bg-yellow-500 text-black hover:bg-yellow-400'
                  } transition-colors`}
                >
                  Next
                  <MdNavigateNext className="text-xl" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400 col-span-full">
            <MdReportProblem className="text-6xl mx-auto mb-4" />
            <p className="text-xl">No matching claims found.</p>
            {filter !== "ALL" && (
              <button
                onClick={() => setFilter("ALL")}
                className="mt-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg"
              >
                Show All Claims
              </button>
            )}
          </div>
        )}

        {/* Modal */}
        {selectedClaim && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white text-black rounded-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
                onClick={() => setSelectedClaim(null)}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4 text-yellow-600">
                Claim #{selectedClaim.id} Details
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Lost Item:</strong>{" "}
                  {selectedClaim.lostItem?.itemName || "N/A"}
                </p>
                <p>
                  <strong>Found Item:</strong>{" "}
                  {selectedClaim.foundItem?.itemName || "N/A"}
                </p>
                <p>
                  <strong>User:</strong>{" "}
                  {selectedClaim.user?.name || selectedClaim.user?.fullName || "N/A"}
                </p>
                <p>
                  <strong>User Email:</strong>{" "}
                  {selectedClaim.user?.email || "N/A"}
                </p>
                <p>
                  <strong>Contact Information:</strong>{" "}
                  {selectedClaim.contactInformation || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`px-2 py-1 rounded text-xs font-bold ${statusStyles[selectedClaim.status]}`}>
                    {selectedClaim.status}
                  </span>
                </p>
                <p>
                  <strong>Proof Description:</strong>{" "}
                  {selectedClaim.proofDescription || "No description provided"}
                </p>
                {selectedClaim.proofImageUrl ? (
                  <div>
                    <strong>Proof Image:</strong>
                    <img
                      src={selectedClaim.proofImageUrl}
                      alt="Proof"
                      className="w-full mt-3 rounded shadow border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <p className="italic text-gray-500 hidden">Failed to load image.</p>
                  </div>
                ) : (
                  <p className="italic text-gray-500">No image provided.</p>
                )}
                
                {/* Additional claim details */}
                {selectedClaim.createdAt && (
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {new Date(selectedClaim.createdAt).toLocaleString()}
                  </p>
                )}
                {selectedClaim.updatedAt && selectedClaim.updatedAt !== selectedClaim.createdAt && (
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(selectedClaim.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Action buttons in modal */}
              {isAdmin() && (
                <div className="flex gap-2 mt-4 justify-end">
                  {(selectedClaim.status === "PENDING" || selectedClaim.status === "REVIEWED") && (
                    <>
                      <button
                        className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded flex items-center gap-1"
                        onClick={() => {
                          updateStatus(selectedClaim.id, "APPROVED");
                          setSelectedClaim(null);
                        }}
                      >
                        <FaCheckCircle /> Approve
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded flex items-center gap-1"
                        onClick={() => {
                          updateStatus(selectedClaim.id, "REJECTED");
                          setSelectedClaim(null);
                        }}
                      >
                        <FaTimesCircle /> Reject
                      </button>
                    </>
                  )}
                  {["APPROVED", "REJECTED"].includes(selectedClaim.status) && (
                    <button
                      className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded flex items-center gap-1"
                      onClick={() => {
                        rollbackClaim(selectedClaim.id);
                        setSelectedClaim(null);
                      }}
                    >
                      <FaUndo /> Rollback
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Info Panel */}
        {filteredClaims.length > 0 && (
          <div className="mt-6 bg-gray-800 p-4 rounded-lg">
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span>
                <strong className="text-white">Current Page:</strong> {currentPage} of {totalPages}
              </span>
              <span>
                <strong className="text-white">Items per Page:</strong> {itemsPerPage}
              </span>
              <span>
                <strong className="text-white">Total Results:</strong> {filteredClaims.length}
              </span>
              {filter !== "ALL" && (
                <span>
                  <strong className="text-white">Filter:</strong> {filter}
                </span>
              )}
              <span>
                <strong className="text-white">Total Claims:</strong> {claims.length}
              </span>
              <span>
                <strong className="text-white">Auto-refresh:</strong> Every 30 seconds
              </span>
              <span>
                <strong className="text-white">Last Update:</strong> {lastUpdated.toLocaleTimeString()}
              </span>
              <span>
                <strong className="text-white">Sync Status:</strong> 
                <span className="ml-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                  Synced with Dashboard
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClaimReport;
