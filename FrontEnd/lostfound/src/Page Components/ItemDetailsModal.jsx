import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BiX, BiCategoryAlt, BiCalendar, BiMap, BiCommentDetail, BiEditAlt, BiTrashAlt, BiCheckCircle
} from 'react-icons/bi';

function ItemDetailsModal({ item, type, onClose, onDelete }) {
  const navigate = useNavigate();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimData, setClaimData] = useState({
    proofDescription: '',
    contactInformation: '',
    additionalDetails: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!item) return null;

  const titleColor = type === 'lost' ? 'text-yellow-400' : 'text-green-400';

  const handleEdit = () => {
    const route = type === 'lost' ? '/report-lost/form' : '/report-found/form';
    navigate(route, { state: { itemToEdit: item } });
    onClose();
  };

  const handleClaimChange = (e) => {
    const { name, value } = e.target;
    setClaimData({
      ...claimData,
      [name]: value,
    });
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('You must be logged in to submit a claim');
        setTimeout(() => {
          onClose();
          navigate('/login');
        }, 2000);
        return;
      }

      // Prepare request data
      const requestData = {
        proofDescription: claimData.proofDescription,
        contactInformation: claimData.contactInformation,
        additionalDetails: claimData.additionalDetails
      };

      // Determine which ID parameter to use based on item type
      const params = {};
      if (type === 'found') {
        params.foundItemId = item.id;
      } else {
        params.lostItemId = item.id;
      }

      // Make API call to create claim request
      const response = await axios.post(
        'http://localhost:8081/claimRequests/create',
        requestData,
        {
          headers: {
            'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: params
        }
      );

      console.log('Claim response:', response.data);
      setSuccessMessage('Your claim has been submitted successfully!');
      setIsClaiming(false);
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
        // Navigate to my claims page
        navigate('/my-claims');
      }, 3000);
    } catch (err) {
      console.error('Error submitting claim:', err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        setErrorMessage('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        setTimeout(() => {
          onClose();
          navigate('/login');
        }, 2000);
      } else if (err.response?.status === 400) {
        setErrorMessage(err.response.data || 'Invalid claim request. Please check your information.');
      } else {
        setErrorMessage(err.response?.data || 'Failed to submit claim. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('You must be logged in to delete items');
        setTimeout(() => {
          onClose();
          navigate('/login');
        }, 2000);
        return;
      }

      // Call the appropriate delete endpoint based on item type
      if (onDelete) {
        await onDelete(item.id);
        setSuccessMessage('Item deleted successfully!');
        
        // Close modal after a delay
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setErrorMessage('Failed to delete item. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="relative w-full max-w-3xl bg-gray-900 text-white rounded-xl p-6 shadow-2xl animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-400"
        >
          <BiX size={28} />
        </button>
        
        {/* Image + Info */}
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={item.image || item.imageUrl || 'https://via.placeholder.com/400'}
            alt={item.name || item.itemName}
            className="w-full md:w-1/2 h-auto object-cover rounded-lg shadow-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400?text=No+Image';
            }}
          />
          <div className="flex-1 space-y-2">
            <h2 className={`text-3xl font-bold ${titleColor}`}>
              {item.name || item.itemName}
            </h2>
            <p className="flex items-center gap-2 text-gray-300 text-sm">
              <BiCategoryAlt /> {item.category || 'N/A'}
            </p>
            <p className="flex items-center gap-2 text-gray-300 text-sm">
              <BiCalendar /> {type === 'found' ? (item.foundDate || 'N/A') : (item.lostDate || 'N/A')}
            </p>
            <p className="flex items-center gap-2 text-gray-300 text-sm">
              <BiMap /> {type === 'found' ? (item.locationFound || 'N/A') : (item.locationLost || 'N/A')}
            </p>
            {(item.description || item.desc) && (
              <p className="flex items-start gap-2 text-gray-300 text-sm mt-2">
                <BiCommentDetail className="mt-1" /> {item.description || item.desc}
              </p>
            )}
            {item.status && (
              <p className="mt-2 inline-block px-2 py-1 bg-blue-400/20 text-blue-300 rounded text-xs">
                Status: {item.status}
              </p>
            )}
          </div>
        </div>
        
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mt-4 bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded text-center">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mt-4 bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded text-center">
            {errorMessage}
          </div>
        )}
        
        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded shadow"
          >
            <BiEditAlt /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded shadow"
          >
            <BiTrashAlt /> Delete
          </button>
          <button
            onClick={() => setIsClaiming(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded shadow"
          >
            <BiCheckCircle /> Claim
          </button>
        </div>
        
        {/* Claim Form Modal */}
        {isClaiming && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-900 text-white p-8 rounded-xl shadow-2xl max-w-lg w-full">
              <h2 className="text-3xl font-bold text-green-400 mb-4">Claim this Item</h2>
              
              <form onSubmit={handleClaimSubmit} className="space-y-6">
                <div>
                  <label className="block font-semibold text-sm mb-2">Proof Description</label>
                  <textarea
                    name="proofDescription"
                    value={claimData.proofDescription}
                    onChange={handleClaimChange}
                    className="w-full px-4 py-3 rounded bg-gray-700 text-white border border-gray-600"
                    rows="4"
                    placeholder="Describe specific details about the item that only the owner would know..."
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block font-semibold text-sm mb-2">Contact Information</label>
                  <input
                    type="text"
                    name="contactInformation"
                    value={claimData.contactInformation}
                    onChange={handleClaimChange}
                    className="w-full px-4 py-3 rounded bg-gray-700 text-white border border-gray-600"
                    placeholder="Phone number or alternative contact method"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-sm mb-2">Additional Details (Optional)</label>
                  <textarea
                    name="additionalDetails"
                    value={claimData.additionalDetails}
                    onChange={handleClaimChange}
                    className="w-full px-4 py-3 rounded bg-gray-700 text-white border border-gray-600"
                    rows="3"
                    placeholder="Any other information that might help verify your claim..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsClaiming(false)}
                    className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-3 rounded shadow"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${
                      isSubmitting ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-400'
                    } text-white px-4 py-3 rounded shadow flex items-center gap-2`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Submit Claim'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemDetailsModal;
