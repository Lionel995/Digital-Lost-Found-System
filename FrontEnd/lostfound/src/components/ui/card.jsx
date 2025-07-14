// src/components/ui/card.jsx
import React from 'react';

export const Card = ({ children, className }) => (
  <div className={`bg-gray-800/80 backdrop-blur-lg shadow-xl rounded-2xl ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);