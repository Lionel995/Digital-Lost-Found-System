import React from 'react';
import { MdEmail, MdLocationOn, MdPhone } from 'react-icons/md';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-10 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Column 1: Brand */}
        <div>
          <h2 className="text-2xl font-bold mb-3">Lost & Found</h2>
          <p className="text-sm text-slate-300 mb-3 leading-relaxed">
            Every lost item tells a story. We're here to help write happy endings by connecting the kindness of those who find with the hope of those who've lost.
          </p>
          <p className="text-xs text-slate-400 italic">
            "Building bridges between lost and found, powered by community trust."
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-yellow-300 transition-colors">Home</Link></li>
            <li><Link to="/items" className="hover:text-yellow-300 transition-colors">Browse Items</Link></li>
            <li><Link to="/report-lost" className="hover:text-yellow-300 transition-colors">Report Lost</Link></li>
            <li><Link to="/report-found" className="hover:text-yellow-300 transition-colors">Report Found</Link></li>
            <li><a href="#about-section" className="hover:text-yellow-300 transition-colors">About Us</a></li>
            <li><a href="#contact-section" className="hover:text-yellow-300 transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Contact Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <MdEmail className="text-lg text-yellow-400" />
              <a href="mailto:support@lostfound.rw" className="hover:text-yellow-300 transition-colors">
                support@lostfound.rw
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MdPhone className="text-lg text-yellow-400" />
              <span>+250 784 806 227</span>
            </div>
            <div className="flex items-center gap-2">
              <MdLocationOn className="text-lg text-yellow-400" />
              <span>Kigali, Rwanda</span>
            </div>
          </div>
        </div>

        {/* Column 4: Follow Us */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Follow Us</h3>
          <p className="text-sm mb-4 text-slate-300">Stay connected with our community</p>
          
          {/* Social Icons */}
          <div className="flex gap-3 mb-6">
            <a 
              href="https://www.facebook.com/lostfoundrwanda" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-slate-800 transition-all duration-200"
              title="Follow us on Facebook"
            >
              <FaFacebookF />
            </a>
            <a 
              href="https://www.instagram.com/lostfoundrwanda" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-slate-800 transition-all duration-200"
              title="Follow us on Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://twitter.com/lostfoundrwanda" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-slate-800 transition-all duration-200"
              title="Follow us on Twitter"
            >
              <FaTwitter />
            </a>
            <a 
              href="https://www.linkedin.com/company/lostfoundrwanda" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-slate-800 transition-all duration-200"
              title="Connect with us on LinkedIn"
            >
              <FaLinkedinIn />
            </a>
          </div>

          {/* Quick Newsletter */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Get updates:</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-2 py-1 rounded text-xs bg-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
              <button className="bg-yellow-400 text-slate-800 px-3 py-1 rounded text-xs font-semibold hover:bg-yellow-300 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center text-sm text-slate-300 mt-10 border-t border-slate-600 pt-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} Lost & Found Rwanda. All rights reserved.</p>
          <div className="flex gap-4 text-xs">
            <Link to="/privacy" className="hover:text-yellow-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-yellow-300 transition-colors">Terms of Service</Link>
            <Link to="/help" className="hover:text-yellow-300 transition-colors">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
