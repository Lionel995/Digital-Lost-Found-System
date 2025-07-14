import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-16 w-16',
    xlarge: 'h-32 w-32'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-purple-500 ${sizeClasses[size]}`}></div>
      {text && <p className="text-gray-400 mt-2">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
