import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHandsHelping, FaSearch, FaPlus } from 'react-icons/fa';
import { MdOutlineFindInPage, MdOutlineReportProblem, MdNavigateNext, MdNavigateBefore, MdRefresh, MdFilterList } from 'react-icons/md';
import { BiSearch, BiSearchAlt } from 'react-icons/bi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ItemDetailsModal from './ItemDetailsModal';
import axios from 'axios';

// Import fallback image
import BlackWallet from '../assets/BlackWallet.jpeg';

function ItemsPage() {
  // State management
  const [activeTab, setActiveTab] = useState('found'); // 'found' or 'lost'
  const [selectedItem, setSelectedItem] = useState(null);
  const [foundItems, setFoundItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const navigate = useNavigate();

  // Get current user info
  const currentUserEmail = localStorage.getItem('email');
  const currentUserRole = localStorage.getItem('role');
  const isAdmin = currentUserRole?.toLowerCase() === 'admin';

  // Get current items based on active tab
  const getCurrentItems = () => {
    return activeTab === 'found' ? foundItems : lostItems;
  };

  // Filter items based on search and category
  const getFilteredItems = () => {
    const items = getCurrentItems();
    return items.filter(item => {
      const matchesSearch = !searchTerm || 
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.locationFound || item.locationLost)?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || 
        item.category?.toLowerCase() === categoryFilter.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  };

  const filteredItems = getFilteredItems();

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Get unique categories for filter
  const getCategories = () => {
    const allItems = [...foundItems, ...lostItems];
    const categories = [...new Set(allItems.map(item => item.category).filter(Boolean))];
    return categories.sort();
  };

  // Helper function to construct proper image URL
  const constructImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    if (imageUrl.startsWith('/uploads')) return `http://localhost:8081${imageUrl}`;
    if (imageUrl.startsWith('uploads')) return `http://localhost:8081/${imageUrl}`;
    return `http://localhost:8081/uploads/${imageUrl}`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Fetch found items from the backend
  const fetchFoundItems = async (showToast = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:8081/foundItems/getAll', {
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
        }
      });

      if (response.data && response.data.length > 0) {
        const processedItems = response.data.map(item => ({
          ...item,
          imageUrl: constructImageUrl(item.imageUrl)
        }));
        setFoundItems(processedItems);
        if (showToast) {
          toast.success(`Loaded ${processedItems.length} found items`);
        }
      } else {
        setFoundItems([]);
      }
    } catch (err) {
      console.error('Error fetching found items:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  // Fetch lost items from the backend
  const fetchLostItems = async (showToast = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:8081/lostItem/getAllLostItems', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.length > 0) {
        const processedItems = response.data.map(item => ({
          ...item,
          image: constructImageUrl(item.imageUrl),
          name: item.itemName || 'Unnamed Item',
          date: formatDate(item.lostDate) || 'Unknown Date',
          location: item.locationLost || 'Unknown Location'
        }));
        setLostItems(processedItems);
        if (showToast) {
          toast.success(`Loaded ${processedItems.length} lost items`);
        }
      } else {
        setLostItems([]);
      }
    } catch (err) {
      console.error('Error fetching lost items:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  // Fetch all items
  const fetchAllItems = async (showToast = true) => {
    try {
      setIsRefreshing(true);
      if (showToast) setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view items.');
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      await Promise.all([
        fetchFoundItems(showToast),
        fetchLostItems(showToast)
      ]);

      setLastUpdated(new Date());
      setError('');
      
      if (showToast) {
        toast.success('Items updated successfully');
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again.');
      if (showToast) {
        toast.error('Failed to load items. Please try again.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    fetchAllItems(true);
  };

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    fetchAllItems();
    
    const intervalId = setInterval(() => {
      fetchAllItems(false); // Silent refresh
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [navigate]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, categoryFilter]);

  // Check if user can edit/delete an item
  const canModifyItem = (item) => {
    if (isAdmin) return true;
    return item.user && item.user.email === currentUserEmail;
  };

  const handleEdit = (item) => {
    if (!canModifyItem(item)) {
      toast.error(`You can only edit your own ${activeTab} items.`);
      return;
    }

    const editPath = activeTab === 'found' ? '/report-found/form' : '/report-lost/form';
    navigate(editPath, { state: { itemToEdit: item } });
  };

  const handleDelete = async (id) => {
    const item = getCurrentItems().find(item => item.id === id);
    
    if (!item) {
      toast.error("Item not found.");
      return;
    }

    if (!canModifyItem(item)) {
      toast.error(`You can only delete your own ${activeTab} items.`);
      return;
    }

    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to delete items');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const loadingToast = toast.loading('Deleting item...');
      const deleteUrl = activeTab === 'found' 
        ? `http://localhost:8081/foundItems/deleteFoundItem/${id}`
        : `http://localhost:8081/lostItem/deleteLostItem/${id}`;

      await axios.delete(deleteUrl, {
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
        }
      });

      // Remove the deleted item from state
      if (activeTab === 'found') {
        setFoundItems(foundItems.filter(item => item.id !== id));
      } else {
        setLostItems(lostItems.filter(item => item.id !== id));
      }
      setSelectedItem(null);
      
      toast.update(loadingToast, {
        render: 'Item deleted successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      console.error('Error deleting item:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Your session has expired or you don\'t have permission to delete this item');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        toast.error(`Failed to delete item: ${err.response?.data || 'Unknown error'}`);
      }
    }
  };

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

  // Handle image loading errors
  const handleImageError = (e) => {
    if (!e.target.src.includes('BlackWallet')) {
      e.target.src = BlackWallet;
    }
  };

  // Tab configuration
  const tabs = [
    {
      id: 'found',
      label: 'Found Items',
      icon: <MdOutlineFindInPage className="text-xl" />,
      color: 'green',
      count: foundItems.length
    },
    {
      id: 'lost',
      label: 'Lost Items',
      icon: <MdOutlineReportProblem className="text-xl" />,
      color: 'yellow',
      count: lostItems.length
    }
  ];

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);
  const themeColors = {
    green: {
      primary: 'green-400',
      secondary: 'green-500',
      light: 'green-300',
      bg: 'green-500/20',
      border: 'green-500'
    },
    yellow: {
      primary: 'yellow-400',
      secondary: 'yellow-500',
      light: 'yellow-300',
      bg: 'yellow-500/20',
      border: 'yellow-500'
    }
  };

  const colors = themeColors[activeTabConfig?.color] || themeColors.green;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-6 py-12">
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
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <h1 className="text-5xl font-extrabold text-white flex items-center gap-3">
            <FaSearch className="text-gray-300 text-5xl" />
            Lost & Found Items
          </h1>
        </div>
        <p className="text-lg text-gray-300 max-w-4xl mx-auto mb-6">
          Browse through lost and found items. Help reunite belongings with their owners or find your missing items.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link 
            to="/report-lost/form" 
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition"
          >
            <BiSearchAlt className="text-xl" />
            Report Lost Item
          </Link>
          <Link 
            to="/report-found/form" 
            className="inline-flex items-center gap-2 bg-green-400 hover:bg-green-300 text-gray-900 font-bold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition"
          >
            <BiSearch className="text-xl" />
            Report Found Item
          </Link>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdRefresh className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Total Items</h3>
          <p className="text-3xl font-bold text-white">{foundItems.length + lostItems.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 text-center border border-green-500/30">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Found Items</h3>
          <p className="text-3xl font-bold text-green-400">{foundItems.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 text-center border border-yellow-500/30">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Lost Items</h3>
          <p className="text-3xl font-bold text-yellow-400">{lostItems.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 text-center border border-purple-500/30">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Categories</h3>
          <p className="text-3xl font-bold text-purple-400">{getCategories().length}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Tabs */}
        <div className="flex bg-gray-800 rounded-xl p-2 border border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? `bg-${tab.color}-500 text-black shadow-lg`
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === tab.id 
                  ? 'bg-black/20 text-black' 
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-1 gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab} items...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <MdFilterList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {filteredItems.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} {activeTab} items
            {(searchTerm || categoryFilter !== 'all') && ' (filtered)'}
          </p>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-xl text-purple-400">Loading {activeTab} items...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-10">
          <div className="bg-red-900/30 text-red-200 p-6 rounded-lg max-w-2xl mx-auto">
            <p className="text-xl mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg transition"
              >
                Try Again
              </button>
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && (
        <>
          {currentItems.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-gray-800 rounded-xl shadow-lg hover:shadow-${colors.primary}/40 transition duration-300 overflow-hidden cursor-pointer border border-gray-700 hover:border-${colors.primary}/50`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={activeTab === 'found' ? item.imageUrl : item.image}
                        alt={activeTab === 'found' ? item.itemName : item.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                        onError={handleImageError}
                      />
                      
                      {/* Status Badge */}
                      <div className={`absolute top-2 right-2 bg-${colors.primary} text-black text-xs font-bold px-2 py-1 rounded`}>
                        {item.status || (activeTab === 'found' ? 'FOUND' : 'LOST')}
                      </div>
                      
                      {/* User's Item Badge */}
                      {item.user && item.user.email === currentUserEmail && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                          YOUR ITEM
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className={`text-xl font-bold text-${colors.primary} mb-2`}>
                        {activeTab === 'found' ? item.itemName : item.name}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>
                          <strong>Category:</strong> {item.category || 'Uncategorized'}
                        </p>
                        <p>
                          <strong>Date {activeTab === 'found' ? 'Found' : 'Lost'}:</strong>{' '}
                          {activeTab === 'found' ? item.foundDate : item.date}
                        </p>
                        <p>
                          <strong>Location:</strong>{' '}
                          {activeTab === 'found' ? item.locationFound : item.location}
                        </p>
                        {item.user && item.user.name && (
                          <p>
                            <strong>Reported by:</strong> {item.user.name}
                          </p>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400 mt-3 italic line-clamp-2">
                        "{item.description || 'No description provided'}"
                      </p>
                      
                      {item.createdAt && (
                        <p className="text-xs text-gray-500 mt-3">
                          Reported: {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mb-12">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : `bg-${colors.primary} text-black hover:bg-${colors.light}`
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
                            ? `bg-${colors.primary} text-black font-bold`
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
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : `bg-${colors.primary} text-black hover:bg-${colors.light}`
                    } transition-colors`}
                  >
                    Next
                    <MdNavigateNext className="text-xl" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className={`text-6xl text-${colors.primary} mb-4`}>
                {activeTabConfig?.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No {activeTab} items found
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || categoryFilter !== 'all' 
                  ? `No ${activeTab} items match your current filters.`
                  : `No ${activeTab} items have been reported yet.`
                }
              </p>
              
              {(searchTerm || categoryFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                  }}
                  className={`mb-4 px-6 py-2 bg-${colors.primary} text-black rounded-lg hover:bg-${colors.light} transition`}
                >
                  Clear Filters
                </button>
              )}
              
              <div className="flex justify-center gap-4">
                <Link
                  to={activeTab === 'found' ? '/report-found/form' : '/report-lost/form'}
                  className={`inline-flex items-center gap-2 bg-${colors.primary} hover:bg-${colors.light} text-black font-bold px-6 py-3 rounded-full shadow-lg transition`}
                >
                  <FaPlus />
                  Report {activeTab === 'found' ? 'Found' : 'Lost'} Item
                </Link>
                {activeTab === 'found' && (
                  <Link
                    to="/lost"
                    className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded-full shadow-lg transition"
                  >
                    <BiSearchAlt />
                    Browse Lost Items
                  </Link>
                )}
                {activeTab === 'lost' && (
                  <Link
                    to="/found"
                    className="inline-flex items-center gap-2 bg-green-400 hover:bg-green-300 text-black font-bold px-6 py-3 rounded-full shadow-lg transition"
                  >
                    <BiSearch />
                    Browse Found Items
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Help Banner */}
      <div className={`bg-gradient-to-r from-${colors.primary}/20 to-${colors.primary}/10 border border-${colors.primary}/30 rounded-xl shadow-lg px-8 py-6 text-center mb-10 max-w-4xl mx-auto`}>
        <FaHandsHelping className={`text-4xl text-${colors.primary} mx-auto mb-3`} />
        <h3 className="text-xl font-semibold text-white mb-2">
          {activeTab === 'found' ? 'Recognize Any of These?' : 'Seen Something Familiar?'}
        </h3>
        <p className="text-gray-300 mb-4">
          {activeTab === 'found' 
            ? 'Help us reunite found items with their owners — your honesty matters.'
            : 'Your help can bring relief and joy to someone searching for their belongings.'
          }
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/claim"
            className={`inline-flex items-center gap-2 bg-${colors.primary} hover:bg-${colors.light} text-black font-bold px-6 py-2 rounded-full transition`}
          >
            <FaHandsHelping />
            Submit a Claim
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-full transition"
          >
            Contact Support
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-6">Quick Actions</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            to="/report-lost/form" 
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-lg px-8 py-3 rounded-full shadow-md transform hover:scale-105 transition"
          >
            <BiSearchAlt className="text-2xl" />
            REPORT LOST ITEM
          </Link>
          <Link 
            to="/report-found/form" 
            className="inline-flex items-center gap-2 bg-green-400 hover:bg-green-300 text-gray-900 font-bold text-lg px-8 py-3 rounded-full shadow-md transform hover:scale-105 transition"
          >
            <BiSearch className="text-2xl" />
            REPORT FOUND ITEM
          </Link>
          <Link 
            to="/claim" 
            className="inline-flex items-center gap-2 bg-blue-400 hover:bg-blue-300 text-gray-900 font-bold text-lg px-8 py-3 rounded-full shadow-md transform hover:scale-105 transition"
          >
            <FaHandsHelping className="text-2xl" />
            CLAIM AN ITEM
          </Link>
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          type={activeTab}
          onClose={() => setSelectedItem(null)}
          onEdit={() => handleEdit(selectedItem)}
          onDelete={() => handleDelete(selectedItem.id)}
          canModify={canModifyItem(selectedItem)}
          isAdmin={isAdmin}
          currentUserEmail={currentUserEmail}
        />
      )}

      {/* Footer Statistics */}
      <div className="mt-16 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{foundItems.length + lostItems.length}</p>
            <p className="text-sm text-gray-400">Total Items</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{foundItems.length}</p>
            <p className="text-sm text-gray-400">Found Items</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">{lostItems.length}</p>
            <p className="text-sm text-gray-400">Lost Items</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">{getCategories().length}</p>
            <p className="text-sm text-gray-400">Categories</p>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span>
              <strong className="text-white">Current View:</strong> {activeTabConfig?.label}
            </span>
            <span>
              <strong className="text-white">Showing:</strong> {currentItems.length} of {filteredItems.length} items
            </span>
            {totalPages > 1 && (
              <span>
                <strong className="text-white">Page:</strong> {currentPage} of {totalPages}
              </span>
            )}
            <span>
              <strong className="text-white">Last Updated:</strong> {lastUpdated.toLocaleTimeString()}
            </span>
            {(searchTerm || categoryFilter !== 'all') && (
              <span>
                <strong className="text-white">Filters Active:</strong> 
                {searchTerm && ` Search: "${searchTerm}"`}
                {categoryFilter !== 'all' && ` Category: ${categoryFilter}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Data Status Indicator */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className={`bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-lg ${isRefreshing ? 'animate-pulse' : ''}`}>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} ${isRefreshing ? 'animate-ping' : ''}`}></div>
            <span className="text-gray-300">
              {isRefreshing ? 'Updating...' : error ? 'Offline' : 'Live'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemsPage;
