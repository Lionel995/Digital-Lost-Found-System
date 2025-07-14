// ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Smooth scroll to top when location changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  return null;
};

export default ScrollToTop;
