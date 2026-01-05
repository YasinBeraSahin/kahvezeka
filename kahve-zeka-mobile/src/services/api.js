import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getToken } from '../utils/storage';

// Backend API URL - geliştirme için local, production için gerçek URL
export const API_URL = __DEV__
    ? 'https://kahve-zeka-api.onrender.com' // Using Production API
    : 'https://kahve-zeka-api.onrender.com';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configure retry strategy
axiosRetry(api, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED';
    }
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

    async (error) => {
        if (error.response && error.response.status === 401) {
            // Token geçersiz veya süresi dolmuş
            // Burada logout işlemi tetiklenebilir veya token silinebilir
            // Ancak circular dependency olmaması için sadece hatayı fırlatıyoruz
            // UI tarafında bu hata yakalanıp kullanıcı login'e yönlendirilmeli
            console.log('Oturum süresi doldu veya yetkisiz erişim (401)');
        }
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

// --- FAVORITES ENDPOINTS (LOCAL STORAGE) ---
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getFavorites = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('@favorites');
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Favoriler alınırken hata:', error);
        return [];
    }
};

export const addFavorite = async (businessId) => {
    try {
        // İşletme detayını al (isim, adres vs. kaydetmek için)
        const business = await getBusinessDetail(businessId);

        const currentFavorites = await getFavorites();
        const exists = currentFavorites.some(f => f.id === businessId);

        if (!exists) {
            const newFavorites = [...currentFavorites, business];
            await AsyncStorage.setItem('@favorites', JSON.stringify(newFavorites));
        }
        return { message: "Favorilere eklendi" };
    } catch (error) {
        console.error('Favori ekleme hatası:', error);
        throw error;
    }
};

export const removeFavorite = async (businessId) => {
    try {
        const currentFavorites = await getFavorites();
        const newFavorites = currentFavorites.filter(f => f.id !== businessId);
        await AsyncStorage.setItem('@favorites', JSON.stringify(newFavorites));
        return { message: "Favorilerden çıkarıldı" };
    } catch (error) {
        console.error('Favori silme hatası:', error);
        throw error;
    }
};

// --- BUSINESS ENDPOINTS (PUBLIC) ---

export const getNearbyBusinesses = async (lat, lon, radiusKm = 5, filters = {}) => {
    try {
        const response = await api.get('/businesses/nearby/', {
            params: {
                lat,
                lon,
                radius_km: radiusKm,
                ...filters
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

// --- BUSINESS MANAGEMENT ENDPOINTS (OWNER) ---

export const getMyBusiness = async () => {
    try {
        const response = await api.get('/businesses/me');
        return response.data;
    } catch (error) {
        // 404 dönerse işletmesi yok demektir, bu normal bir durum olabilir
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error('İşletme bilgisi alma hatası:', error);
        throw error;
    }
};

export const createBusiness = async (businessData) => {
    try {
        const response = await api.post('/businesses/', businessData);
        return response.data;
    } catch (error) {
        console.error('İşletme oluşturma hatası:', error.response?.data || error.message);
        throw error;
    }
};

export const updateBusiness = async (businessData) => {
    try {
        const response = await api.put('/businesses/me', businessData);
        return response.data;
    } catch (error) {
        console.error('İşletme güncelleme hatası:', error.response?.data || error.message);
        throw error;
    }
};

export const addMenuItem = async (itemData) => {
    try {
        const response = await api.post('/businesses/me/menu-items/', itemData);
        return response.data;
    } catch (error) {
        console.error('Menü öğesi ekleme hatası:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteMenuItem = async (itemId) => {
    try {
        await api.delete(`/businesses/me/menu-items/${itemId}`);
    } catch (error) {
        console.error('Menü öğesi silme hatası:', error);
        throw error;
    }
};

export const addCampaign = async (campaignData) => {
    try {
        const response = await api.post('/businesses/me/campaigns/', campaignData);
        return response.data;
    } catch (error) {
        console.error('Kampanya ekleme hatası:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteCampaign = async (campaignId) => {
    try {
        await api.delete(`/businesses/me/campaigns/${campaignId}`);
    } catch (error) {
        console.error('Kampanya silme hatası:', error);
        throw error;
    }
};

// Image upload removed.

// --- ADMIN ENDPOINTS ---

export const getAllBusinessesForAdmin = async () => {
    try {
        const response = await api.get('/admin/all-businesses');
        return response.data;
    } catch (error) {
        console.error('Admin işletme listesi hatası:', error);
        throw error;
    }
};

export const approveBusiness = async (businessId) => {
    try {
        const response = await api.put(`/admin/businesses/${businessId}/approve`);
        return response.data;
    } catch (error) {
        console.error('İşletme onaylama hatası:', error);
        throw error;
    }
};

export const rejectBusiness = async (businessId) => {
    try {
        await api.delete(`/admin/businesses/${businessId}`);
    } catch (error) {
        console.error('İşletme reddetme hatası:', error);
        throw error;
    }
};

// --- ANALYTICS ENDPOINTS ---

export const trackView = async (businessId) => {
    try {
        await api.post(`/analytics/${businessId}/view`);
    } catch (error) {
        console.log('View tracking failed:', error);
        // Tracking errors shouldn't crash the app
    }
};

export const trackClick = async (businessId) => {
    try {
        await api.post(`/analytics/${businessId}/click`);
    } catch (error) {
        console.log('Click tracking failed:', error);
    }
};

export const getBusinessStats = async (businessId, days = 30) => {
    try {
        const response = await api.get(`/analytics/${businessId}/stats?days=${days}`);
        return response.data;
    } catch (error) {
        console.error('Stats fetch failed:', error);
        throw error;
    }
};

export const getBusinessRatings = async (businessId) => {
    try {
        const response = await api.get(`/analytics/${businessId}/ratings`);
        return response.data;
    } catch (error) {
        console.error('Ratings fetch failed:', error);
        throw error;
    }
};

export default api;
