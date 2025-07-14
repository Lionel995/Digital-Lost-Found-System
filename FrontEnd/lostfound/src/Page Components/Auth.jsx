import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff } from 'lucide-react';

function Auth({ setIsLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [showResetTokenForm, setShowResetTokenForm] = useState(false); // New state for token form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    otp: '',
    resetEmail: '',
    newPassword: '',
    resetToken: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('signUp')) setIsSignUp(true);
    else if (params.get('signIn')) setIsSignUp(false);
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // SIGN UP handler
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:8081/users/save', {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });
      toast.success('Sign Up Successful! Please Sign In.');
      setIsSignUp(false);
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        otp: '',
        resetEmail: '',
        newPassword: '',
        resetToken: ''
      });
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(error.response?.data || 'Sign Up Failed!');
    } finally {
      setLoading(false);
    }
  };

  // SIGN IN initial handler (email + password)
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Attempting sign in for:', formData.email);
      await axios.post('http://localhost:8081/auth/verify-credentials', {
        email: formData.email,
        password: formData.password,
      });
      toast.info('OTP sent to your email. Please enter the OTP.');
      setShowOtpInput(true);
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(error.response?.data || 'Sign In Failed!');
    } finally {
      setLoading(false);
    }
  };

  // OTP confirmation handler
  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Confirming OTP for:', formData.email);
      const response = await axios.post('http://localhost:8081/auth/confirm-otp', {
        email: formData.email,
        otp: formData.otp,
      });
      
      const { token, name, email, role } = response.data;
      
      console.log('=== LOGIN SUCCESS ===');
      console.log('Token received:', !!token);
      console.log('Token length:', token?.length);
      console.log('Token preview:', token?.substring(0, 50) + '...');
      console.log('Role received:', role);
      console.log('Email:', email);
      console.log('Name:', name);
      console.log('====================');
      
      // Store auth data - KEEP ROLE IN ORIGINAL FORMAT (don't convert to lowercase)
      localStorage.setItem('token', token);
      localStorage.setItem('name', name);
      localStorage.setItem('email', email);
      localStorage.setItem('role', role); // This was the issue - was converting to lowercase
      
      setIsLoggedIn(true);
      toast.success(`Sign In Successful! Welcome ${name}`);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        otp: '',
        resetEmail: '',
        newPassword: '',
        resetToken: ''
      });
      setShowOtpInput(false);
      
      navigate('/');
    } catch (error) {
      console.error('OTP confirmation error:', error);
      toast.error(error.response?.data || 'OTP verification failed!');
    } finally {
      setLoading(false);
    }
  };

  // Password Reset request handler - UPDATED
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8081/auth/request-reset', { 
        email: formData.resetEmail 
      });
      
      console.log('Reset request response:', response.data);
      toast.success('Password reset email sent successfully! Please check your inbox for the reset token.');
      
      // Show the token input form after successful email request
      setShowResetTokenForm(true);
      
    } catch (error) {
      console.error('Reset request error:', error);
      toast.error(error.response?.data || 'Reset request failed!');
    } finally {
      setLoading(false);
    }
  };

  // Password Reset handler - UPDATED
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.resetToken || !formData.newPassword) {
      toast.error('Please enter both reset token and new password');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:8081/auth/reset-password`, null, {
        params: {
          token: formData.resetToken,
          newPassword: formData.newPassword,
        }
      });
      
      console.log('Password reset response:', response.data);
      toast.success('Password reset successful! Please sign in with your new password.');
      
      // Reset all password reset related states and form data
      setShowResetPasswordForm(false);
      setShowResetTokenForm(false);
      setFormData({ 
        ...formData, 
        resetEmail: '', 
        resetToken: '', 
        newPassword: '' 
      });
      
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data || 'Reset password failed!');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to go back to sign in
  const handleBackToSignIn = () => {
    setShowResetPasswordForm(false);
    setShowResetTokenForm(false);
    setFormData({ 
      ...formData, 
      resetEmail: '', 
      resetToken: '', 
      newPassword: '' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col justify-center items-center px-4">
      <ToastContainer position="top-center" autoClose={4000} />
      
      {/* Main Auth Box */}
      <div className="relative w-full max-w-5xl h-[650px] bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sign In & OTP */}
        <div className={`flex-1 p-10 transition-all duration-700 ${isSignUp ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
          <h2 className="text-3xl font-bold mb-6 text-center">Sign In</h2>
          
          {!showOtpInput && !showResetPasswordForm && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2 right-3 cursor-pointer text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-400 text-gray-900 font-semibold py-2 rounded transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => setShowResetPasswordForm(true)}
                className="w-full mt-2 text-center underline text-sm hover:text-yellow-400 transition duration-300"
              >
                Forgot Password?
              </button>
            </form>
          )}

          {/* OTP Input Form */}
          {showOtpInput && (
            <form onSubmit={handleConfirmOtp} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-300">Enter the OTP sent to your email</p>
                <p className="text-sm text-yellow-400">{formData.email}</p>
              </div>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
                required
                maxLength={6}
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOtpInput(false);
                  setFormData({ ...formData, otp: '' });
                }}
                className="w-full mt-2 text-center underline text-sm hover:text-yellow-400 transition duration-300"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* Password Reset Forms */}
          {showResetPasswordForm && (
            <div className="space-y-6">
              {/* Step 1: Request Reset Email */}
              {!showResetTokenForm && (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-yellow-300 mb-2">Reset Password</h3>
                    <p className="text-gray-300 text-sm">Enter your email to receive a reset token</p>
                  </div>
                  <input
                    type="email"
                    name="resetEmail"
                    value={formData.resetEmail}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 rounded transition duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Token'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToSignIn}
                    className="w-full mt-2 text-center underline text-sm hover:text-green-400 transition duration-300"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
              
              {/* Step 2: Enter Token and New Password */}
              {showResetTokenForm && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-green-300 mb-2">Enter Reset Details</h3>
                    <p className="text-gray-300 text-sm">Check your email for the reset token</p>
                    <p className="text-yellow-400 text-xs mt-1">Email sent to: {formData.resetEmail}</p>
                  </div>
                  
                  <input
                    type="text"
                    name="resetToken"
                    value={formData.resetToken}
                    onChange={handleChange}
                    placeholder="Enter the reset token from your email"
                    required
                    className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter your new password"
                      required
                                            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <div
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-2 right-3 cursor-pointer text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-2 rounded transition duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetTokenForm(false);
                        setFormData({ ...formData, resetToken: '', newPassword: '' });
                      }}
                      className="flex-1 text-center underline text-sm hover:text-yellow-400 transition duration-300"
                    >
                      Back to Email
                    </button>
                    <button
                      type="button"
                      onClick={handleBackToSignIn}
                      className="flex-1 text-center underline text-sm hover:text-green-400 transition duration-300"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Sign Up */}
        <div className={`flex-1 p-10 transition-all duration-700 ${isSignUp ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
          <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2 right-3 cursor-pointer text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-2 right-3 cursor-pointer text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Toggle Panel */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full bg-gradient-to-r from-green-400 to-blue-500 text-white transition-transform duration-700 z-10 ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>
          <div className="flex flex-col justify-center items-center h-full p-10 text-center">
            {!isSignUp ? (
              <>
                <h1 className="text-4xl font-bold mb-4">Hello, Friend!</h1>
                <p className="mb-6">Register with your personal details to use all site features</p>
                <button
                  onClick={() => setIsSignUp(true)}
                  className="border border-white text-white px-8 py-2 rounded-full hover:bg-white hover:text-green-500 transition duration-300"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
                <p className="mb-6">Enter your personal details to use all site features</p>
                <button
                  onClick={() => setIsSignUp(false)}
                  className="border border-white text-white px-8 py-2 rounded-full hover:bg-white hover:text-blue-500 transition duration-300"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-400">
        <p>&copy; 2025 Lost & Found System. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Auth;
