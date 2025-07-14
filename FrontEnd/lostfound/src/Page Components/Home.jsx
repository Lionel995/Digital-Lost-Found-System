import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdSearch, MdReportGmailerrorred, MdCheckCircle, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FaHandsHelping, FaShieldAlt, FaClock, FaUsers } from 'react-icons/fa';
import { Typewriter } from 'react-simple-typewriter';
import heroImage from '../assets/lost-and-found-hero.jpeg';

const Home = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="container mx-auto flex flex-col-reverse md:flex-row items-center gap-12">

          {/* Text Content */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              <span className="text-yellow-400">Lost</span> Something? <br />
              <span className="text-green-400">Found</span> Something? <br />
              <span className="text-white text-2xl md:text-3xl font-light">
                <Typewriter
                  words={[
                    'Lets reconnect people!',
                    'Find what you lost.',
                    'Return what you found.'
                  ]}
                  loop={false}
                  cursor
                  cursorStyle="|"
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={1500}
                />
              </span>
            </h1>

            <p className="text-lg text-gray-300">
              Help us reconnect people with their belongings.
            </p>
            <p className="text-lg text-gray-300">
              Whether you've lost or found something, take action today and make someone's day better.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/report-lost"
                className="flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-full hover:bg-yellow-300 transition duration-300"
              >
                <MdReportGmailerrorred className="text-xl" />
                Report Lost
              </Link>
              <Link
                to="/items"
                className="flex items-center justify-center gap-2 border border-white px-6 py-3 rounded-full hover:bg-white hover:text-gray-900 transition duration-300"
              >
                <MdSearch className="text-xl" />
                View Items
              </Link>
            </div>
          </div>

          {/* Image with Egg-like Shape */}
          <div className="flex-1 relative">
            <div className="rounded-[50%_50%_40%_60%/60%_40%_60%_40%] overflow-hidden shadow-2xl transform hover:scale-105 transition duration-500">
              <img
                src={heroImage}
                alt="Lost and Found"
                className="object-cover w-full h-full max-h-[400px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gray-800">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">500+</div>
              <div className="text-sm md:text-base text-gray-300">Items Reunited</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-green-400">1,200+</div>
              <div className="text-sm md:text-base text-gray-300">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-blue-400">85%</div>
              <div className="text-sm md:text-base text-gray-300">Success Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-purple-400">24/7</div>
              <div className="text-sm md:text-base text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-yellow-400">Lost & Found</span>?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              We've built the most trusted platform for reuniting people with their belongings
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-2xl hover:bg-gray-750 transition duration-300 text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShieldAlt className="text-2xl text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-yellow-400">Secure & Safe</h3>
              <p className="text-gray-300">
                Advanced verification system ensures safe exchanges between finders and owners.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl hover:bg-gray-750 transition duration-300 text-center">
              <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaClock className="text-2xl text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-green-400">Fast Matching</h3>
              <p className="text-gray-300">
                Smart algorithms instantly match lost and found items for quick reunions.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl hover:bg-gray-750 transition duration-300 text-center">
              <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUsers className="text-2xl text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-blue-400">Community Driven</h3>
                           <p className="text-gray-300">
                Join thousands of honest community members working together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-gray-800" id="about-section">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                About <span className="text-yellow-400">Lost & Found Rwanda</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Every lost item tells a story. We're here to help write happy endings by connecting the kindness of those who find with the hope of those who've lost.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-left space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed">
                  Founded on the simple principle that community care creates powerful change, Lost & Found transforms the frustrating experience of losing something into an opportunity for human connection.
                </p>
                
                <p className="text-gray-300 leading-relaxed">
                  We believe that Rwanda's spirit of unity and helping one another extends to the smallest acts of kindness - like returning a lost phone or helping someone find their missing keys.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-green-400 text-xl flex-shrink-0" />
                    <span className="text-gray-300">100% Free platform for everyone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-green-400 text-xl flex-shrink-0" />
                    <span className="text-gray-300">Secure verification system</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-green-400 text-xl flex-shrink-0" />
                    <span className="text-gray-300">Community-driven approach</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-green-400 text-xl flex-shrink-0" />
                    <span className="text-gray-300">24/7 support available</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-900 p-6 rounded-xl border-l-4 border-yellow-400">
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">Our Mission</h3>
                  <p className="text-gray-300">
                    To create a trusted community where lost items find their way home through the power of human kindness and technology, making Rwanda a place where losing something is temporary, not permanent.
                  </p>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-xl border-l-4 border-green-400">
                  <h3 className="text-xl font-bold text-green-400 mb-3">Our Vision</h3>
                  <p className="text-gray-300">
                    A Rwanda where every lost item has a chance to be reunited with its owner, fostering a culture of honesty, trust, and community support.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-xl border-l-4 border-blue-400">
                  <h3 className="text-xl font-bold text-blue-400 mb-3">Our Values</h3>
                  <p className="text-gray-300">
                    Trust, transparency, community care, and the belief that small acts of kindness can make a big difference in someone's day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800" id="contact-section">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Get in <span className="text-blue-400">Touch</span>
              </h2>
              <p className="text-lg text-gray-300">
                Have questions? Need help? Want to share feedback? We're here for you 24/7
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h3 className="text-2xl font-bold mb-8 text-blue-400">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <MdEmail className="text-xl text-gray-900" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Email Support</h4>
                      <p className="text-gray-300 mb-2">Get help with your lost or found items</p>
                      <a href="mailto:support@lostfound.rw" className="text-blue-400 hover:text-blue-300 transition-colors">
                        support@lostfound.rw
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <MdPhone className="text-xl text-gray-900" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Phone Support</h4>
                      <p className="text-gray-300 mb-2">Call us for urgent assistance</p>
                      <a href="tel:+250788123456" className="text-green-400 hover:text-green-300 transition-colors">
                        +250 784 806 227
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <MdLocationOn className="text-xl text-gray-900" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Office Location</h4>
                      <p className="text-gray-300 mb-2">Visit us during business hours</p>
                      <p className="text-yellow-400">
                        KG 9 Ave, Kigali<br />
                        Rwanda, East Africa
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaClock className="text-xl text-gray-900" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Response Time</h4>
                      <p className="text-gray-300 mb-2">We're committed to quick responses</p>
                      <p className="text-purple-400">
                        Email: Within 2 hours<br />
                        Phone: Immediate
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h3 className="text-2xl font-bold mb-8 text-blue-400">Send us a Message</h3>
                
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-600 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-600 transition-colors"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      rows="5"
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-600 resize-none transition-colors"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-400 text-gray-900 py-3 rounded-lg font-semibold hover:bg-blue-300 transition duration-300 flex items-center justify-center gap-2"
                  >
                    <MdEmail className="text-xl" />
                    Send Message
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    We typically respond within 2 hours during business hours
                  </p>
                </form>
              </div>
            </div>

            {/* Additional Contact Options */}
            <div className="mt-16 text-center">
              <div className="bg-gray-800 p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Need Immediate Help?</h3>
                <p className="text-gray-300 mb-6">
                  For urgent matters related to lost or found items, you can reach us directly
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="tel:+250788123456"
                    className="bg-green-400 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-green-300 transition duration-300 flex items-center justify-center gap-2"
                  >
                    <MdPhone className="text-xl" />
                    Call Now
                  </a>
                  <a
                    href="mailto:support@lostfound.rw"
                    className="border border-blue-400 text-blue-400 px-6 py-3 rounded-full font-semibold hover:bg-blue-400 hover:text-gray-900 transition duration-300 flex items-center justify-center gap-2"
                  >
                    <MdEmail className="text-xl" />
                    Email Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
