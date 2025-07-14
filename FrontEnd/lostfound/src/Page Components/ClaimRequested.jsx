import React, { useState, useEffect } from 'react';
import { BiEditAlt, BiTrashAlt } from 'react-icons/bi';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ClaimRequested() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's claims on component mount
  useEffect(() => {
    fetchMyClaims();
  }, []);

  const fetchMyClaims = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view your claims');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8081/claimRequests/my-claims', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setClaims(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setError(error.response?.data || 'Failed to fetch your claims');
      toast.error('Failed to load your claims');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (claim) => {
    // You can implement edit functionality here
    // For now, just show an alert
    toast.info(`Edit functionality for claim ID: ${claim.id} - ${getItemName(claim)}`);
    // You can navigate to an edit form or open a modal here
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this claim request?')) {
      try {
        const token = localStorage.getItem('token');
        
        await axios.delete(`http://localhost:8081/claimRequests/delete/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Remove the deleted claim from the state
        setClaims(claims.filter(claim => claim.id !== id));
        toast.success('Claim request deleted successfully');
      } catch (error) {
        console.error('Error deleting claim:', error);
        toast.error(error.response?.data || 'Failed to delete claim request');
      }
    }
  };

  // Helper function to get item name from either lost or found item
  const getItemName = (claim) => {
    if (claim.lostItem) {
      return claim.lostItem.itemName;
    } else if (claim.foundItem) {
      return claim.foundItem.itemName;
    }
    return 'Unknown Item';
  };

  // Helper function to get item category
  const getItemCategory = (claim) => {
    if (claim.lostItem) {
      return claim.lostItem.category;
    } else if (claim.foundItem) {
      return claim.foundItem.category;
    }
    return 'Unknown Category';
  };

  // Helper function to get item image
  const getItemImage = (claim) => {
    if (claim.lostItem && claim.lostItem.imageUrl) {
      return claim.lostItem.imageUrl;
    } else if (claim.foundItem && claim.foundItem.imageUrl) {
      return claim.foundItem.imageUrl;
    }
    return 'https://via.placeholder.com/150?text=No+Image';
  };

  // Helper function to get claim type
  const getClaimType = (claim) => {
    return claim.lostItem ? 'Lost Item Claim' : 'Found Item Claim';
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-400';
      case 'REJECTED':
        return 'text-red-400';
      case 'PENDING':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          <span className="ml-3 text-white">Loading your claims...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <ToastContainer />
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-white mb-6">Your Claim Requests</h1>
      
      {claims.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-300 text-lg">You haven't made any claim requests yet.</p>
          <p className="text-gray-400 text-sm mt-2">
            Browse lost or found items and submit a claim to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {claims.map(claim => (
            <div key={claim.id} className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
              <img
                src={getItemImage(claim)}
                alt={getItemName(claim)}
                className="w-full h-48 object-cover rounded mb-4"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                }}
              />
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-green-400">{getItemName(claim)}</h2>
                
                <p className="text-sm text-gray-300">
                  <strong>Category:</strong> {getItemCategory(claim)}
                </p>
                
                <p className="text-sm text-gray-300">
                  <strong>Type:</strong> {getClaimType(claim)}
                </p>
                
                <p className="text-sm text-gray-300">
                  <strong>Status:</strong>
                  <span className={`ml-2 font-semibold ${getStatusColor(claim.status)}`}>
                    {claim.status}
                  </span>
                </p>
                
                <p className="text-sm text-gray-300">
                  <strong>Contact Info:</strong> {claim.contactInformation}
                </p>
                
                {claim.proofDescription && (
                  <p className="text-sm text-gray-300">
                    <strong>Proof Description:</strong> {claim.proofDescription}
                  </p>
                )}
                
                {claim.submissionDate && (
                  <p className="text-sm text-gray-400">
                    <strong>Submitted:</strong> {new Date(claim.submissionDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={() => handleEdit(claim)}
                  className="flex items-center gap-2 px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded transition-colors"
                  disabled={claim.status === 'APPROVED' || claim.status === 'REJECTED'}
                >
                  <BiEditAlt /> Edit
                </button>
                <button
                  onClick={() => handleDelete(claim.id)}
                  className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                >
                  <BiTrashAlt /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClaimRequested;
