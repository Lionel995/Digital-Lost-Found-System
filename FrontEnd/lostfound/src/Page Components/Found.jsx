import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHandsHelping } from 'react-icons/fa';
import { MdOutlineFindInPage, MdNavigateNext, MdNavigateBefore, MdRefresh } from 'react-icons/md';
import { BiSearch } from 'react-icons/bi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ItemDetailsModal from './ItemDetailsModal';
import axios from 'axios';

function Found() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Get current user info
  const currentUserEmail = localStorage.getItem('email');
  const currentUserRole = localStorage.getItem('role');
  const isAdmin = currentUserRole?.toLowerCase() === 'admin';

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = foundItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(foundItems.length / itemsPerPage);

  // Helper function to construct proper image URL
  const constructImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return null;
    }

    // If it's already a complete URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If it starts with /uploads, construct the full URL
    if (imageUrl.startsWith('/uploads')) {
      return `http://localhost:8081${imageUrl}`;
    }

    // If it starts with uploads (without leading slash), add the slash
    if (imageUrl.startsWith('uploads')) {
      return `http://localhost:8081/${imageUrl}`;
    }

    // If it's just a filename or path, assume it's in uploads
    return `http://localhost:8081/uploads/${imageUrl}`;
  };

  // Fetch found items from the backend
  const fetchFoundItems = async (showToast = true) => {
    try {
      if (showToast) setLoading(true);
      setIsRefreshing(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view found items.');
        setFoundItems([]);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      const response = await axios.get('http://localhost:8081/foundItems/getAll', {
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
        }
      });

      console.log('Found items fetched:', response.data);
      
      if (response.data && response.data.length > 0) {
        // Process the data to ensure image URLs are complete
        const processedItems = response.data.map(item => ({
          ...item,
          imageUrl: constructImageUrl(item.imageUrl)
        }));
        
        setFoundItems(processedItems);
        setLastUpdated(new Date());
        setError('');
        
        if (showToast) {
          toast.success(`Loaded ${processedItems.length} found items`);
        }
      } else {
        console.log('No found items returned from API');
        setFoundItems([]);
        setError('');
        
        if (showToast) {
          toast.info('No found items available at the moment.');
        }
      }
    } catch (err) {
      console.error('Error fetching found items:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        if (showToast) {
          toast.error('Session expired. Please login again.');
        }
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to load found items. Please try again.');
        setFoundItems([]);
        if (showToast) {
          toast.error('Failed to load found items. Please try again.');
        }
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    fetchFoundItems(true);
  };

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    fetchFoundItems();
    
    // Set up polling to refresh data every 30 seconds (silent refresh)
    const intervalId = setInterval(() => {
      fetchFoundItems(false); // Silent refresh without toast
    }, 300000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate]);

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [foundItems]);

  // Check for selected item from navigation
  useEffect(() => {
    if (location.state && location.state.selectedItemId) {
      const itemId = location.state.selectedItemId;
      const item = foundItems.find(item => item.id === itemId);
      
      if (item) {
        setSelectedItem(item);
      }
    }
  }, [location.state, foundItems]);

  // Check if user can edit/delete an item
  const canModifyItem = (item) => {
    // Admin can modify everything
    if (isAdmin) {
      return true;
    }
    
    // User can only modify their own items
    return item.user && item.user.email === currentUserEmail;
  };

  const handleEdit = (item) => {
    if (!canModifyItem(item)) {
      toast.error("You can only edit your own found items.");
      return;
    }

    navigate('/report-found/form', { state: { itemToEdit: item } });
  };

  const handleDelete = async (id) => {
    const item = foundItems.find(item => item.id === id);
    
    if (!item) {
      toast.error("Item not found.");
      return;
    }

    if (!canModifyItem(item)) {
      toast.error("You can only delete your own found items.");
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

      await axios.delete(`http://localhost:8081/foundItems/deleteFoundItem/${id}`, {
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
        }
      });

      // Remove the deleted item from state
      setFoundItems(foundItems.filter(item => item.id !== id));
      setSelectedItem(null);
      
      // Update toast to success
      toast.update(loadingToast, {
        render: 'Item deleted successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      console.error('Error deleting found item:', err);
      
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
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-5xl font-extrabold text-green-400 flex items-center gap-3">
            <MdOutlineFindInPage className="text-green-300 text-6xl" />
            Found Items
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isRefreshing 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-400 text-black'
            }`}
          >
            <MdRefresh className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Someone found these items and wants them returned to their owners.
        </p>
        
        {foundItems.length > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, foundItems.length)} of {foundItems.length} items
          </p>
        )}
      </div>

      {/* Login Required Message */}
      {!localStorage.getItem('token') && (
        <div className="bg-green-500/20 border border-green-500 text-green-300 p-6 rounded-lg mb-8 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-3">🔐 Login Required</h3>
          <p className="mb-4">Please login to view all found items from the database.</p>
          <Link 
            to="/login"
            className="inline-block bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-full font-semibold transition"
          >
            Login Now
          </Link>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-10">
          <div className="bg-red-900/30 text-red-200 p-6 rounded-lg max-w-2xl mx-auto">
            <p className="text-xl mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRefresh}
                className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-full"
              >
                Try Again
              </button>
              <Link 
                to="/login" 
                className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-400"></div>
          <span className="ml-3 text-xl text-green-400">Loading found items...</span>
        </div>
      ) : (
        <>
          {/* Found Grid */}
          {foundItems.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-800 rounded-xl shadow-lg hover:shadow-green-400/40 transition duration-300 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="h-48 overflow-hidden relative">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.itemName} 
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x150?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                                    <span className="text-gray-400">No Image Available</span>
                        </div>
                      )}
                      
                      {/* Badge for user's own items */}
                      {item.user && item.user.email === currentUserEmail && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                          YOUR ITEM
                        </div>
                      )}
                      
                      {/* Status badge */}
                      {item.status && (
                        <div className="absolute top-2 right-2 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded">
                          {item.status}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-green-300 mb-1">{item.itemName}</h3>
                      <p className="text-sm text-gray-400"><strong>Category:</strong> {item.category}</p>
                      <p className="text-sm text-gray-400"><strong>Date Found:</strong> {item.foundDate}</p>
                      <p className="text-sm text-gray-400"><strong>Location:</strong> {item.locationFound}</p>
                      <p className="text-sm text-gray-400 italic mt-2">"{item.description}"</p>
                      {item.user && item.user.name && (
                        <p className="text-sm text-gray-400 mt-1"><strong>Reported by:</strong> {item.user.name}</p>
                      )}
                      {item.createdAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Reported: {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mb-16">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center px-3 py-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-black hover:bg-green-400'
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
                            ? 'bg-green-500 text-black font-bold'
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
                        : 'bg-green-500 text-black hover:bg-green-400'
                    } transition-colors`}
                  >
                    Next
                    <MdNavigateNext className="text-xl" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400 text-lg mb-4">No found items available at the moment.</p>
              <Link 
                to="/report-found/form" 
                className="inline-block bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-full font-semibold"
              >
                Report a Found Item
              </Link>
            </div>
          )}
        </>
      )}

      {/* Banner */}
      <div className="bg-green-100 text-gray-900 rounded-lg shadow-lg px-8 py-6 text-center mb-10 max-w-4xl mx-auto">
        <FaHandsHelping className="text-4xl text-green-500 mx-auto mb-3" />
        <h3 className="text-xl font-semibold">Recognize Any of These?</h3>
        <p className="text-sm">Help us reunite found items with their owners — your honesty matters.</p>
      </div>

      {/* Report Button */}
      <div className="text-center">
        <Link 
          to="/report-found/form" 
          className="inline-flex items-center gap-2 bg-green-400 hover:bg-green-300 text-gray-900 font-bold text-lg px-8 py-3 rounded-full shadow-md transform hover:scale-105 transition"
        >
          <BiSearch className="text-2xl" /> 
          REPORT A FOUND ITEM
        </Link>
      </div>

      {/* Data Status Footer */}
      {foundItems.length > 0 && (
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
          <p>Auto-refresh every 30 seconds</p>
        </div>
      )}

      {/* Modal */}
      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          type="found"
          onClose={() => setSelectedItem(null)}
          onEdit={() => handleEdit(selectedItem)}
          onDelete={() => handleDelete(selectedItem.id)}
          canModify={canModifyItem(selectedItem)}
          isAdmin={isAdmin}
          currentUserEmail={currentUserEmail}
        />
      )}
    </div>
  );
}

export default Found;
