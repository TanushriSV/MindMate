export const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return 'http://10.0.2.2:3000';
  }
  return '';
};
export const API_BASE_URL = getBaseUrl();
