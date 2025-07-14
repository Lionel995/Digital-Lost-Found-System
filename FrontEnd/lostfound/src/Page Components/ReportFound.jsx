import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BiBox, BiCategoryAlt, BiMap, BiCalendar, BiCommentDetail } from 'react-icons/bi';
import { MdOutlineFindInPage } from 'react-icons/md';
import { BsImage } from 'react-icons/bs';
import axios from 'axios';
import FoundIllustration from '../assets/reportFoundIllustration.jpeg';

function ReportFound() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const itemToEdit = state?.itemToEdit;
  
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    foundDate: '',
    locationFound: '',
    description: '',
    image: null,
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to report a found item');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        itemName: itemToEdit.itemName || '',
        category: itemToEdit.category || '',
        foundDate: itemToEdit.foundDate || '',
        locationFound: itemToEdit.locationFound || '',
        description: itemToEdit.description || '',
        image: null, // Can't pre-populate file input
      });
      
      // Set preview image if item has an image URL
      if (itemToEdit.imageUrl) {
        const imageUrl = itemToEdit.imageUrl.startsWith('http')
          ? itemToEdit.imageUrl
          : `http://localhost:8081${itemToEdit.imageUrl}`;
        setPreviewImage(imageUrl);
      }
    }
  }, [itemToEdit]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      // Create a preview URL for the selected image
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      fileReader.readAsDataURL(files[0]);
      
      setFormData({
        ...formData,
        image: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to report a found item');
        setIsSubmitting(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData();
      
      // Create a JSON object with the form data (excluding the image)
      const foundItemData = {
        itemName: formData.itemName,
        category: formData.category,
        foundDate: formData.foundDate,
        locationFound: formData.locationFound,
        description: formData.description
      };
      
      // Add the JSON as a string parameter
      formDataToSend.append('foundItem', JSON.stringify(foundItemData));
      
      // Add the image file if it exists
      if (formData.image) {
        formDataToSend.append('imageFile', formData.image);
        console.log('Adding image file:', formData.image.name, 'size:', formData.image.size);
      } else {
        console.log('No image file to upload');
      }
      
      // Log the token (first few characters for debugging)
      console.log('Using token (first 20 chars):', token.substring(0, 20) + '...');
      
      let response;
      
      if (itemToEdit) {
        // Update existing found item
        console.log(`Updating found item with ID: ${itemToEdit.id}`);
        response = await axios.put(
          `http://localhost:8081/foundItems/updateFoundItem/${itemToEdit.id}`,
          formDataToSend,
          {
            headers: {
              'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setSuccess('Found item updated successfully!');
      } else {
        // Create new found item
        console.log('Creating new found item');
        response = await axios.post(
          'http://localhost:8081/foundItems/saveFoundItem',
          formDataToSend,
          {
            headers: {
              'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setSuccess('Found item reported successfully!');
      }
      
      console.log('Response:', response.data);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/Found');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting found item:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Your session has expired. Please log in again.');
        // Clear the invalid token
        localStorage.removeItem('token');
        setTimeout(() => navigate('/Lost'), 2000);
      } else if (err.response?.status === 413) {
        setError('The image file is too large. Please use a smaller image (max 10MB).');
      } else {
        setError(err.response?.data || 'Failed to submit found item. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-6 py-12">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 items-center">
        <div className="hidden lg:flex flex-1">
          <img src={FoundIllustration} alt="Report Found" className="rounded-xl w-full shadow-xl" />
        </div>
        <div className="flex-1 bg-gray-800 rounded-xl shadow-xl p-8 w-full">
          <h2 className="text-4xl font-bold text-green-400 mb-6 flex items-center justify-center gap-3">
            <MdOutlineFindInPage className="text-5xl" />
            {itemToEdit ? 'Edit Found Item' : 'Report Found Item'}
          </h2>
          
          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="flex items-center gap-2 font-semibold mb-1">
                <BiBox /> Item Name
              </label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g., Wallet"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 font-semibold mb-1">
                <BiCategoryAlt /> Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
              >
                <option value="">-- Select Category --</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="CLOTHING">Clothing</option>
                <option value="PERSONAL_ITEMS">Personal Items</option>
                <option value="DOCUMENTS">Documents</option>
                <option value="ACCESSORIES">Accessories</option>
                <option value="MISCELLANEOUS">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 font-semibold mb-1">
                <BiCalendar /> Date Found
              </label>
              <input
                type="date"
                name="foundDate"
                value={formData.foundDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 font-semibold mb-1">
                <BiMap /> Location Found
              </label>
              <input
                type="text"
                name="locationFound"
                value={formData.locationFound}
                onChange={handleChange}
                required
                placeholder="e.g., Remera Taxi Park"
                className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 font-semibold mb-1">
                <BiCommentDetail /> Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
                rows="4"
                placeholder="Describe the color, brand, size, or unique features..."
              ></textarea>
            </div>
            <div>
              <label className="flex items-center gap-2 font-semibold mb-1">
                <BsImage /> Upload Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-400 file:text-gray-900 hover:file:bg-green-300 bg-gray-700"
              />
              
              {/* Image Preview */}
              {previewImage && (
                <div className="mt-3">
                  <p className="text-sm text-gray-400 mb-2">Image Preview:</p>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-h-40 rounded border border-gray-600" 
                  />
                </div>
              )}
            </div>
            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  isSubmitting ? 'bg-gray-500' : 'bg-green-400 hover:bg-green-300'
                } text-gray-900 font-bold text-lg px-8 py-3 rounded-full shadow-md transform hover:scale-105 transition duration-300 flex items-center justify-center gap-2 mx-auto`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : itemToEdit ? (
                  'Update Report'
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReportFound;
