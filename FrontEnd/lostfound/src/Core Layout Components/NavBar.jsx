import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaTachometerAlt, FaSearch, FaTimes } from 'react-icons/fa';
import { MdOutlineReport, MdOutlineHome, MdEmail, MdInfoOutline, MdLogout } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { BsPersonPlus } from 'react-icons/bs';
import { TbChecklist } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import sample data for search functionality
import BlackWallet from '../assets/BlackWallet.jpeg';
import iPhone12 from '../assets/iPhone 12.jpeg';
import StudentIDCard from '../assets/Student Id Card.jpeg';
import BlackWalletFound from '../assets/BlackWallet found.jpeg';
import Sunglasses from '../assets/Sunglasses.jpeg';
import Backpack from '../assets/Backpack.jpeg';

const NavBar = ({ isLoggedIn, setIsLoggedIn }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Sample data from Lost and Found components
  const allItems = [
    // Lost items
    { id: 1, name: 'Black Wallet', date: '2025-05-10', location: 'Kigali Convention Center', image: BlackWallet, category: 'Accessories', description: 'Black leather wallet with drivers license inside.', type: 'lost' },
    { id: 2, name: 'iPhone 12', date: '2025-05-08', location: 'Remera Bus Park', image: iPhone12, category: 'Electronics', description: 'Black iPhone with red cover and cracked screen.', type: 'lost' },
    { id: 3, name: 'University ID Card', date: '2025-05-07', location: 'AUCA Library', image: StudentIDCard, category: 'Documents', description: 'AUCA Student ID card, name: Jean Claude.', type: 'lost' },
    
    // Found items
    { id: 101, name: 'Black Wallet', date: '2025-05-11', location: 'Kigali Heights', image: BlackWalletFound, category: 'Accessories', description: 'Looks like a mens wallet with several cards inside.', type: 'found' },
    { id: 104, name: 'Blue Backpack', date: '2025-05-12', location: 'Car Free Zone', image: Backpack, category: 'Bags', description: 'A medium-sized backpack with school books and a USB drive.', type: 'found' },
    { id: 105, name: 'Ray-Ban Sunglasses', date: '2025-05-13', location: 'Kigali Arena Parking Lot', image: Sunglasses, category: 'Accessories', description: 'Stylish black Ray-Ban sunglasses, slightly scratched on the lens.', type: 'found' },
  ];

  // Enhanced scroll function with better targeting and error handling
  const scrollToSection = (sectionId) => {
    // First, navigate to home page if not already there
    if (window.location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        performScroll(sectionId);
      }, 100);
    } else {
      performScroll(sectionId);
    }
  };

  const performScroll = (sectionId) => {
    // Try multiple possible selectors for the section
    const possibleSelectors = [
      `#${sectionId}`,
      `[id="${sectionId}"]`,
      `.${sectionId}`,
      `[data-section="${sectionId}"]`,
      // Common footer section selectors
      sectionId === 'contact' ? '#contact-section' : null,
      sectionId === 'about' ? '#about-section' : null,
      sectionId === 'contact' ? '.contact-section' : null,
      sectionId === 'about' ? '.about-section' : null,
    ].filter(Boolean);

    let element = null;
    
    // Try each selector until we find the element
    for (const selector of possibleSelectors) {
      element = document.querySelector(selector);
      if (element) break;
    }

    if (element) {
      // Scroll with offset to account for fixed navbar
      const navbarHeight = 80; // Adjust based on your navbar height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Show success toast
      toast.success(`Scrolled to ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} section`, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
      });
    } else {
      // If element not found, show helpful message
      console.warn(`Section "${sectionId}" not found. Available elements:`, 
        Array.from(document.querySelectorAll('[id]')).map(el => el.id)
      );
      
      toast.warning(`${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} section not found. Please scroll down manually.`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      // Fallback: scroll to bottom of page for footer sections
      if (sectionId === 'contact' || sectionId === 'about') {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    navigate('/login');
  };

  const name = localStorage.getItem('name');
  const email = localStorage.getItem('email');
  const role = (localStorage.getItem('role') || '').toLowerCase();

  // Check if user is admin
  const isAdmin = role === 'admin';

  const protectedNavigate = (path, message) => {
    if (!isLoggedIn) {
      toast.info(message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
      });
      setTimeout(() => {
        navigate('/login?signIn=true');
      }, 2000);
    } else {
      navigate(path);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const filteredResults = allItems.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.location.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filteredResults);
    setShowSearchResults(true);
  };

  const navigateToItemDetails = (item) => {
    setShowSearchResults(false);
    setSearchQuery('');
    setIsSearchExpanded(false);
    
    if (isAdmin) {
      // For admin, navigate to dashboard items page
      navigate('/dashboard/items', { state: { selectedItemId: item.id, activeTab: item.type } });
    } else {
      // For regular users, navigate to the specific item pages
      if (item.type === 'lost') {
        navigate('/lost', { state: { selectedItemId: item.id } });
      } else {
        navigate('/found', { state: { selectedItemId: item.id } });
      }
    }
  };

  const handleSearchIconClick = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      // Focus the input when expanding
      setTimeout(() => {
        const input = searchRef.current?.querySelector('input');
        if (input) input.focus();
      }, 100);
    } else {
      // Clear search when collapsing
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close search when pressing Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsSearchExpanded(false);
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 text-2xl font-bold text-slate-800 hover:text-indigo-600 transition-all duration-300 group"
          >
            <div className="p-2 bg-gradient-to-br from-green-500 via-yellow-400 to-green-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <MdOutlineHome className="text-xl" />
            </div>
            <span className="bg-gradient-to-r from-green-500 via-yellow-500 to-green-500 bg-clip-text text-transparent font-extrabold tracking-wide">
              Lost & Found
            </span>
          </Link>

          {/* Center Navigation - Only show for regular users (not admin) */}
          {isLoggedIn && !isAdmin && (
            <nav className="hidden lg:flex items-center gap-1 bg-gray-50/80 rounded-full px-2 py-1">
              <button
                onClick={() => navigate('/report-lost')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-white rounded-full transition-all duration-200 font-medium"
              >
                <MdOutlineReport className="text-lg" />
                <span>Lost Items</span>
              </button>

              <button
                onClick={() => navigate('/report-found')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-white rounded-full transition-all duration-200 font-medium"
              >
                <MdOutlineReport className="text-lg" />
                <span>Found Items</span>
              </button>

              <button
                onClick={() => navigate('/claim-request')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-white rounded-full transition-all duration-200 font-medium"
              >
                <TbChecklist className="text-lg" />
                <span>Claims</span>
              </button>
            </nav>
          )}

          {/* Dashboard - Admin only */}
          {isLoggedIn && isAdmin && (
            <nav className="hidden lg:flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
              >
                <FaTachometerAlt className="text-lg" />
                <span>Dashboard</span>
              </button>
            </nav>
          )}

          {/* Right Side Container */}
          <div className="flex items-center gap-4">
            {/* Global Search - Only show for logged in users */}
            {isLoggedIn && (
              <div className="relative flex items-center" ref={searchRef}>
                <AnimatePresence>
                  {isSearchExpanded ? (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="relative overflow-hidden"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          placeholder="Search items..."
                          value={searchQuery}
                          onChange={handleSearch}
                          onFocus={() => setShowSearchResults(searchResults.length > 0)}
                          className="w-80 py-3 pl-12 pr-12 text-sm text-gray-700 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-lg transition-all"
                        />
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        {searchQuery && (
                          <button
                            onClick={clearSearch}
                            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <FaTimes />
                          </button>
                        )}
                                                <button
                          onClick={handleSearchIconClick}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      onClick={handleSearchIconClick}
                      className="p-3 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaSearch className="text-lg" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {showSearchResults && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
                    >
                      <div className="p-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700">
                          Search Results ({searchResults.length})
                        </h3>
                      </div>
                      <div className="py-2">
                        {searchResults.slice(0, 5).map((item) => (
                          <button
                            key={`${item.type}-${item.id}`}
                            onClick={() => navigateToItemDetails(item)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {item.name}
                                  </h4>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    item.type === 'lost' 
                                      ? 'bg-red-100 text-red-700' 
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {item.type.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                  {item.location} • {item.date}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                        {searchResults.length > 5 && (
                          <div className="px-4 py-2 text-center text-sm text-gray-500 border-t border-gray-100">
                            +{searchResults.length - 5} more results
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Navigation Links for non-logged in users */}
            {!isLoggedIn && (
              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => scrollToSection('about')}
                  className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                >
                  <MdInfoOutline className="text-lg" />
                  About
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                >
                  <MdEmail className="text-lg" />
                  Contact
                </button>
              </nav>
            )}

            {/* Authentication Buttons */}
            {!isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login?signIn=true"
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                >
                  <BsPersonPlus className="text-lg" />
                  Sign Up
                </Link>
              </div>
            ) : (
              /* Profile Dropdown */
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {name ? name.charAt(0).toUpperCase() : <FaUserCircle className="text-xl" />}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{role || 'Member'}</p>
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50"
                    >
                      {/* Profile Header */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {name ? name.charAt(0).toUpperCase() : <FaUserCircle className="text-xl" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{name || 'User'}</p>
                            <p className="text-sm text-gray-500">{email || 'No email'}</p>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                              isAdmin 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {isAdmin ? (
                          <button
                            onClick={() => {
                              navigate('/dashboard');
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FaTachometerAlt className="text-lg text-indigo-500" />
                            <span>Admin Dashboard</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                protectedNavigate('/report-lost', 'Please sign in to report lost items');
                                setIsProfileOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <MdOutlineReport className="text-lg text-red-500" />
                              <span>Report Lost Item</span>
                            </button>

                            <button
                              onClick={() => {
                                protectedNavigate('/report-found', 'Please sign in to report found items');
                                setIsProfileOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <MdOutlineReport className="text-lg text-green-500" />
                              <span>Report Found Item</span>
                            </button>

                            <button
                              onClick={() => {
                                protectedNavigate('/claim-request', 'Please sign in to make claim requests');
                                setIsProfileOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <TbChecklist className="text-lg text-blue-500" />
                              <span>My Claims</span>
                            </button>
                          </>
                        )}

                        {/* Navigation Links for logged in users */}
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={() => {
                              scrollToSection('about');
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <MdInfoOutline className="text-lg text-purple-500" />
                            <span>About Us</span>
                          </button>
                          <button
                            onClick={() => {
                              scrollToSection('contact');
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <MdEmail className="text-lg text-blue-500" />
                            <span>Contact Us</span>
                          </button>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <MdLogout className="text-lg" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
