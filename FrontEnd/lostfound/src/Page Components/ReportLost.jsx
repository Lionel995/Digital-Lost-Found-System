import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import {
  MdOutlineReportProblem, MdCategory, MdLocationOn,
  MdDateRange, MdDescription, MdImage
} from 'react-icons/md';
import { FaSignature, FaCalendarAlt } from 'react-icons/fa';
import lostItemImg from '../assets/lostItem.jpeg';
import 'react-toastify/dist/ReactToastify.css';

const ReportLost = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const itemToEdit = state?.itemToEdit;

  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    description: '',
    lostDate: '',
    locationLost: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const categories = ['ELECTRONICS', 'CLOTHING', 'DOCUMENTS', 'ACCESSORIES', 'MISCELLANEOUS'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to report a lost item');
      navigate('/login');
    }

    if (itemToEdit) {
      setFormData({
        itemName: itemToEdit.itemName || '',
        category: itemToEdit.category || '',
        description: itemToEdit.description || '',
        lostDate: itemToEdit.lostDate || '',
        locationLost: itemToEdit.locationLost || '',
      });
      if (itemToEdit.imageUrl) {
        setPreviewUrl(itemToEdit.imageUrl);
      }
    }
  }, [itemToEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');

  const form = new FormData();

  // Wrap all fields into one object and stringify
  const lostItem = {
    itemName: formData.itemName,
    category: formData.category,
    description: formData.description,
    lostDate: formData.lostDate,
    locationLost: formData.locationLost,
  };
  form.append('lostItem', JSON.stringify(lostItem));

  if (imageFile) {
    form.append('imageFile', imageFile);
  }

  try {
    const response = await axios.post(
      'http://localhost:8081/lostItem/saveLostItem',
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(itemToEdit ? 'Lost item updated successfully!' : 'Lost item reported successfully!');
    console.log('Server response:', response.data);

    if (!itemToEdit) {
      setFormData({
        itemName: '',
        category: '',
        description: '',
        lostDate: '',
        locationLost: '',
      });
      setImageFile(null);
      setPreviewUrl('');
    }
  } catch (error) {
    console.error('Upload failed:', error);
    toast.error(error.response?.data?.message || 'Failed to report lost item');
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
        <div className="hidden lg:block">
          <img
            src={lostItemImg}
            alt="Lost and Found"
            className="rounded-2xl shadow-2xl transform hover:scale-105 transition duration-500 object-cover h-[520px] w-full"
          />
        </div>

        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md shadow-xl rounded-2xl p-10">
          <h2 className="text-4xl font-extrabold text-yellow-400 mb-8 flex items-center gap-3">
            <MdOutlineReportProblem className="text-yellow-300 text-5xl" />
            {itemToEdit ? 'Edit Lost Item' : 'Report a Lost Item'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 text-gray-100">
            <div>
              <label className="text-sm font-semibold text-yellow-300 flex items-center gap-2 mb-1">
                <FaSignature /> Item Name
              </label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-yellow-300 flex items-center gap-2 mb-1">
                <MdCategory /> Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-600"
              >
                <option value="">Select Category</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-yellow-300 flex items-center gap-2 mb-1">
                <MdDescription /> Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-yellow-300 flex items-center gap-2 mb-1">
                <MdDateRange /> Date Lost
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="lostDate"
                  value={formData.lostDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-600 appearance-none"
                />
                <FaCalendarAlt className="absolute top-3.5 right-4 text-yellow-300 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-yellow-300 flex items-center gap-2 mb-1">
                <MdLocationOn /> Location Lost
              </label>
              <input
                type="text"
                name="locationLost"
                value={formData.locationLost}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-yellow-300 flex items-center gap-2 mb-1">
                <MdImage /> Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-gray-900 px-2 py-1 rounded-lg"
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mt-4 max-h-48 rounded-lg shadow-lg"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 rounded-lg shadow-md hover:scale-105 transform transition duration-300"
            >
              {itemToEdit ? 'Update Report' : 'Submit Report'}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={4000} />
    </div>
  );
};

export default ReportLost;
