import axios from 'axios';
import { getToken } from '../utils/storage';

// Backend API URL - geliştirme için local, production için gerçek URL
const API_URL = __DEV__
    ? 'https://kahve-zeka-api.onrender.com'  // Geliştirme - Render backend
    : 'https://kahve-zeka-api.onrender.com';  // Production - Render backend

export const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Her isteğe token ekle
api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- AUTH ENDPOINTS ---

export const loginUser = async (username, password) => {
    try {
        // OAuth2PasswordRequestForm formatında veri gönderilmeli (form-data)
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post('/token', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Login hatası:', error.response?.data || error.message);
        throw error;
    }
};

export const registerUser = async (email, username, password, role = 'user') => {
    try {
        const response = await api.post('/users/', {
            email,
            username,
            password,
            role
        });
        return response.data;
    } catch (error) {
        console.error('Kayıt hatası:', error.response?.data || error.message);
        throw error;
    }
};

export const getUserProfile = async () => {
    try {
        const response = await api.get('/users/me');
        return response.data;
    } catch (error) {
        console.error('Profil alma hatası:', error);
        throw error;
    }
};

export const getUserReviews = async () => {
    try {
        const response = await api.get('/users/me/reviews');
        return response.data;
    } catch (error) {
        console.error('Kullanıcı yorumları hatası:', error);
        throw error;
    }
};

// --- BUSINESS ENDPOINTS ---

export const getNearbyBusinesses = async (lat, lon, radiusKm = 5) => {
    try {
        const response = await api.get('/businesses/nearby/', {
            params: {
                lat,
                lon,
                radius_km: radiusKm,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Yakındaki işletmeler alınırken hata:', error);
        throw error;
    }
};

export const getBusinessDetail = async (businessId) => {
    try {
        const response = await api.get(`/businesses/${businessId}`);
        return response.data;
    } catch (error) {
        console.error('İşletme detayı hatası:', error);
        throw error;
    }
};

export const addReview = async (businessId, reviewData) => {
    try {
        const response = await api.post(`/businesses/${businessId}/reviews/`, reviewData);
        return response.data;
    } catch (error) {
        console.error('Yorum ekleme hatası:', error.response?.data || error.message);
        throw error;
    }
};

export default api;
