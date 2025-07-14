import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdOutlineReportProblem, MdNavigateNext, MdNavigateBefore, MdRefresh } from 'react-icons/md';
import { FaHandsHelping } from 'react-icons/fa';
import { BiSearchAlt } from 'react-icons/bi';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ItemDetailsModal from './ItemDetailsModal';

// Import fallback image
import BlackWallet from '../assets/BlackWallet.jpeg';

function Lost() {
  const [lostItems, setLostItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const currentItems = lostItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(lostItems.length / itemsPerPage);

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

  // Function to fetch lost items from API
  const fetchLostItems = async (showToast = true) => {
    try {
      if (showToast) setLoading(true);
      setIsRefreshing(true);

      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please login to view lost items.');
        setLostItems([]);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      const response = await axios.get(
        'http://localhost:8081/lostItem/getAllLostItems',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Transform API data to match our component's expected format
      const apiItems = (response.data || []).map(item => {
        const imageUrl = constructImageUrl(item.imageUrl);

        return {
          id: item.id,
          name: item.itemName || 'Unnamed Item',
          date: formatDate(item.lostDate) || 'Unknown Date',
          location: item.locationLost || 'Unknown Location',
          image: imageUrl,
          category: item.category || 'Uncategorized',
          description: item.description || 'No description provided',
          status: item.status || 'LOST',
          user: item.user || {},
          // Keep original data for edit functionality
          itemName: item.itemName,
          lostDate: item.lostDate,
          locationLost: item.locationLost,
          imageUrl: item.imageUrl,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          ...item
        };
      });

      setLostItems(apiItems);
      setLastUpdated(new Date());
      setError(null);

      if (showToast && apiItems.length > 0) {
        toast.success(`Loaded ${apiItems.length} lost items`);
      }

      // Check if we have a selectedItemId from navigation
      if (location.state && location.state.selectedItemId) {
        const itemId = location.state.selectedItemId;
        const item = apiItems.find(item => item.id === itemId);
        if (item) {
          setSelectedItem(item);
        }
      }

    } catch (err) {
      console.error('Error fetching lost items:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('Access denied. Please login to view items.');
        toast.error('Access denied. Please login to view items.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to load lost items. Please try again.');
        if (showToast) {
          toast.error('Failed to load lost items. Please try again.');
        }
      }
      setLostItems([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    fetchLostItems(true);
  };

  // Fetch lost items on component mount and when location changes
  useEffect(() => {
    fetchLostItems();

    // Set up polling to refresh data every 30 seconds (silent refresh)
    const intervalId = setInterval(() => {
      fetchLostItems(false); // Silent refresh without toast
    }, 300000);

    // Clean up interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [location.state]);

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [lostItems]);

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
    // Check permissions
    if (!canModifyItem(item)) {
      toast.error("You can only edit your own lost items.");
      return;
    }

    navigate('/report-lost/form', { state: { itemToEdit: item } });
  };

  const handleDelete = async (id) => {
    // Find the item to check permissions
    const item = lostItems.find(item => item.id === id);

    if (!item) {
      toast.error("Item not found.");
      return;
    }

    // Check permissions
    if (!canModifyItem(item)) {
      toast.error("You can only delete your own lost items.");
      return;
    }

    // Show confirmation dialog
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Authentication required to delete items');
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading('Deleting item...');

      await axios.delete(
        `http://localhost:8081/lostItem/deleteLostItem/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Remove the deleted item from state
      setLostItems(prevItems => prevItems.filter(item => item.id !== id));
      setSelectedItem(null);

      // Update toast to success
      toast.update(loadingToast, {
        render: 'Item deleted successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

    } catch (err) {
      console.error('Error deleting item:', err);

      if (err.response?.status === 403) {
        toast.error('Access denied: You can only delete your own lost items');
      } else if (err.response?.status === 404) {
        toast.error('Item not found or already deleted');
      } else {
        toast.error('Failed to delete item. Please try again later.');
      }
    }
  };

  // Handle image loading errors with fallback
  const handleImageError = (e) => {
    if (!e.target.src.includes('BlackWallet')) {
      e.target.src = BlackWallet;
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
          <h1 className="text-5xl font-extrabold text-yellow-400 flex items-center gap-3">
            <MdOutlineReportProblem className="text-yellow-300 text-6xl" />
            Lost Items
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isRefreshing
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-400 text-black'
            }`}
          >
            <MdRefresh className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Every item has a story. If something looks familiar, let us know. You might be the reason someone smiles today.
        </p>
        {lostItems.length > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, lostItems.length)} of {lostItems.length} items
          </p>
        )}
      </div>

      {/* Login Required Message */}
      {!localStorage.getItem('token') && (
        <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 p-6 rounded-lg mb-8 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-3">🔐 Login Required</h3>
          <p className="mb-4">Please login to view all lost items from the database.</p>
          <Link 
            to="/login"
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold transition"
          >
            Login Now
          </Link>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <FaSpinner className="animate-spin text-yellow-400 text-4xl" />
          <span className="ml-3 text-xl text-yellow-400">Loading lost items...</span>
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

      {/* Lost Items Grid */}
      {!loading && !error && (
        <>
          {lostItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-400 mb-4">No lost items found at the moment.</p>
              <Link 
                to="/report-lost/form" 
                className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold"
              >
                Report a Lost Item
              </Link>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-800 rounded-xl shadow-lg hover:shadow-yellow-400/40 transition duration-300 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={item.image || BlackWallet}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                        onError={handleImageError}
                      />
                      {item.status && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                          {item.status}
                        </div>
                      )}
                      {/* Badge for user's own items */}
                      {item.user && item.user.email === currentUserEmail && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                          YOUR ITEM
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-yellow-300 mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-400"><strong>Date Lost:</strong> {item.date}</p>
                      <p className="text-sm text-gray-400"><strong>Location:</strong> {item.location}</p>
                      <p className="text-sm text-gray-400"><strong>Category:</strong> {item.category}</p>
                      {item.user && item.user.name && (
                        <p className="text-sm text-gray-400"><strong>Reported by:</strong> {item.user.name}</p>
                      )}
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2 italic">"{item.description}"</p>
                      {item.createdAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Reported: {formatDate(item.createdAt)}
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
          )}
        </>
      )}

      {/* Banner */}
      <div className="bg-yellow-100 text-gray-900 rounded-lg shadow-lg px-8 py-6 text-center mb-10 max-w-4xl mx-auto">
        <FaHandsHelping className="text-4xl text-yellow-500 mx-auto mb-3" />
        <h3 className="text-xl font-semibold">Seen Something Familiar?</h3>
        <p className="text-sm">Your help can bring relief and joy to someone searching for their belongings.</p>
      </div>

      {/* Report Button */}
      <div className="text-center">
        <Link 
          to="/report-lost/form" 
          className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-lg px-8 py-3 rounded-full shadow-md transform hover:scale-105 transition"
        >
          <BiSearchAlt className="text-2xl" /> 
          REPORT YOURS
        </Link>
      </div>

      {/* Data Status Footer */}
      {lostItems.length > 0 && (
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
          <p>Auto-refresh every 30 seconds</p>
        </div>
      )}

      {/* Modal */}
      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          type="lost"
          onClose={() => setSelectedItem(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canModify={canModifyItem(selectedItem)}
          isAdmin={isAdmin}
          currentUserEmail={currentUserEmail}
        />
      )}
    </div>
  );
}

export default Lost;
