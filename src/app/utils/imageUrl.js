/**
 * Utility function to correctly format image URLs
 * Handles both S3 signed URLs (full URLs) and relative paths
 */
export const getImageUrl = (path) => {
  if (!path) {
    return ''; // Return empty string or a placeholder image URL
  }
  // Check if the path is already a full URL (e.g., S3 signed URL)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Otherwise, prepend the API URL
  return `${process.env.REACT_APP_API_URL_PRODUCTION}${path}`;
};

