// Shared image utility functions
export const constructImageUrl = (imageUrl, baseUrl = 'http://localhost:8081') => {
  if (!imageUrl) {
    console.log('🖼️ No image URL provided, using fallback');
    return null; // Return null instead of fallback here
  }
  
  // If it's already a complete URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('🖼️ Complete URL found:', imageUrl);
    return imageUrl;
  }
  
  // If it starts with /uploads, construct the full URL
  if (imageUrl.startsWith('/uploads')) {
    const fullUrl = `${baseUrl}${imageUrl}`;
    console.log('🖼️ Constructed URL from /uploads:', fullUrl);
    return fullUrl;
  }
  
  // If it starts with uploads (without leading slash), add the slash
  if (imageUrl.startsWith('uploads')) {
    const fullUrl = `${baseUrl}/${imageUrl}`;
    console.log('🖼️ Constructed URL from uploads:', fullUrl);
    return fullUrl;
  }
  
  // If it's just a filename or path, assume it's in uploads
  const fullUrl = `${baseUrl}/uploads/${imageUrl}`;
  console.log('🖼️ Constructed URL assuming uploads folder:', fullUrl);
  return fullUrl;
};

// Function to get preview URL (for ReportLost editing)
export const getPreviewUrl = (imageUrl, baseUrl = 'http://localhost:8081') => {
  if (!imageUrl) return '';
  
  // If it's a blob URL (from file input), return as is
  if (imageUrl.startsWith('blob:')) {
    return imageUrl;
  }
  
  // Otherwise use the same construction logic
  return constructImageUrl(imageUrl, baseUrl);
};

// Function to handle image loading errors with multiple fallback attempts
export const handleImageError = (e, item, fallbackImage) => {
  console.log('🖼️ Image failed to load for item:', item.name || item.itemName);
  console.log('🖼️ Failed URL:', e.target.src);
  console.log('🖼️ Original imageUrl from DB:', item.imageUrl);
  
  const originalSrc = e.target.src;
  
  // If this is the first error, try alternative URL constructions
  if (!e.target.dataset.retryCount) {
    e.target.dataset.retryCount = '1';
    
    // Try with different path construction
    if (item.imageUrl && !originalSrc.includes(fallbackImage)) {
      // Try direct path without /uploads prefix
      const directPath = `http://localhost:8081/${item.imageUrl}`;
      console.log('🖼️ Trying direct path:', directPath);
      e.target.src = directPath;
      return;
    }
  } else if (e.target.dataset.retryCount === '1') {
    e.target.dataset.retryCount = '2';
    
    // Try with uploads prefix if not already there
    if (item.imageUrl && !item.imageUrl.startsWith('/uploads') && !item.imageUrl.startsWith('uploads')) {
      const uploadsPath = `http://localhost:8081/uploads/${item.imageUrl}`;
      console.log('🖼️ Trying uploads path:', uploadsPath);
      e.target.src = uploadsPath;
      return;
    }
  }
  
  // Final fallback to default image
  console.log('🖼️ All attempts failed, using fallback image');
  e.target.src = fallbackImage;
};

// Additional utility to test if an image URL is accessible
export const testImageUrl = async (url, itemName) => {
  try {
    console.log(`🖼️ Testing image URL for ${itemName}:`, url);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'cors'
    });
    
    console.log(`🖼️ Response status for ${itemName}:`, response.status);
    
    if (response.status === 200) {
      console.log(`✅ Image accessible: ${itemName}`);
      return true;
    } else {
      console.log(`❌ Image not accessible (${response.status}): ${itemName}`);
      return false;
    }
  } catch (error) {
    console.log(`🖼️ Network error for ${itemName}:`, error.message);
    return false;
  }
};

// Function to extract filename from full path
export const extractFilename = (imagePath) => {
  if (!imagePath) return '';
  
  // Remove any leading slashes and path separators
  const cleaned = imagePath.replace(/^\/+/, '');
  
  // If it contains path separators, get the last part
  if (cleaned.includes('/')) {
    return cleaned.split('/').pop();
  }
  
  return cleaned;
};

// Function to construct upload path for saving
export const constructUploadPath = (filename) => {
  if (!filename) return '';
  
  // Ensure we have just the filename without path
  const cleanFilename = extractFilename(filename);
  
  // Return the path as stored in database (without leading slash)
  return `uploads/images/${cleanFilename}`;
};
