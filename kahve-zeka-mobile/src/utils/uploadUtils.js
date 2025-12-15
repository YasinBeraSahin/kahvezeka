// src/utils/uploadUtils.js
import { API_URL } from '../services/api';
import { getToken } from './storage';

/**
 * Upload an image to the server
 * @param {string} imageUri - Local URI of the image to upload
 * @returns {Promise<string>} - URL of the uploaded image on the server
 */
export const uploadImage = async (imageUri) => {
    try {
        // Get auth token
        const token = await getToken();

        // Create FormData
        const formData = new FormData();

        // Extract filename from URI
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // Append file to FormData
        formData.append('file', {
            uri: imageUri,
            name: filename,
            type: type,
        });

        // Send upload request
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload error response:', errorText);
            throw new Error('Fotoğraf yüklenemedi');
        }

        const data = await response.json();

        if (!data.url) {
            throw new Error('Sunucudan geçersiz yanıt');
        }

        return data.url;

    } catch (error) {
        console.error('Image upload error:', error);
        throw new Error('Fotoğraf yüklenirken bir hata oluştu: ' + error.message);
    }
};
