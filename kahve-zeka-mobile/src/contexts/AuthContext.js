import React, { createContext, useState, useEffect, useContext } from 'react';
import { getToken, getUser, saveToken, saveUser, clearAuth } from '../utils/storage';
import { api } from '../services/api'; // We'll update api.js to export 'api' instance

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Uygulama açıldığında kayıtlı oturumu kontrol et
    useEffect(() => {
        const loadAuth = async () => {
            try {
                const token = await getToken();
                const savedUser = await getUser();

                if (token && savedUser) {
                    setUser(savedUser);
                    setIsAuthenticated(true);
                    // API header'ına token ekle (api.js güncellendiğinde bu çalışacak)
                    // api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Auth loading error:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAuth();
    }, []);

    const login = async (userData, token) => {
        try {
            await saveToken(token);
            await saveUser(userData);
            setUser(userData);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await clearAuth();
            setUser(null);
            setIsAuthenticated(false);
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return false;
        }
    };

    const updateUser = async (newUserData) => {
        try {
            const updatedUser = { ...user, ...newUserData };
            await saveUser(updatedUser);
            setUser(updatedUser);
        } catch (error) {
            console.error('Update user error:', error);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
