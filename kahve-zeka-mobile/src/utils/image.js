import { API_URL } from '../services/api';

/**
 * Constructs a full image URL from a partial path or returns the original if already absolute.
 * @param {string} url - The image path or URL.
 * @returns {string|null} - Full accessible URL or null if input is empty.
 */
export const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    // Remove leading slash if exists to avoid double slashes if API_URL ends with slash
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    // Ensure API_URL doesn't end with slash if we are appending
    const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

    return `${cleanApiUrl}/${cleanUrl}`;
};
