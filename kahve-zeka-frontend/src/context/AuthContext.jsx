// src/context/AuthContext.jsx
import { API_URL } from '../apiConfig.js';
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';


const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // <-- YENİ STATE: Kullanıcı objesini tutar
  const [loading, setLoading] = useState(true); // <-- YENİ STATE: Sayfa yüklenişini kontrol eder
  const [error, setError] = useState(null);

  // Sayfa ilk yüklendiğinde (veya yenilendiğinde) çalışır
  useEffect(() => {
    const fetchUserOnLoad = async () => {
      if (token) {
        try {
          // Token'ımız var, backend'e "ben kimim?" diye soralım
          const response = await axios.get(`${API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUser(response.data); // Kullanıcıyı (rolüyle birlikte) state'e at
        } catch (err) {
          // Token geçersiz veya süresi dolmuş olabilir
          console.error("Token doğrulama hatası:", err);
          logout(); // Hatalı token'ı temizle
        }
      }
      setLoading(false); // Kontrol bitti, yüklemeyi durdur
    };
    fetchUserOnLoad();
  }, [token]);

  // login fonksiyonu
  const login = async (username, password) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await axios.post(`${API_URL}/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      setError(null);

      // --- LOGIN'E YENİ EK ---
      // Token'ı aldık, şimdi bu token ile profilimizi çekelim
      const userResponse = await axios.get(`${API_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${newToken}` }
      });
      setUser(userResponse.data); // Kullanıcıyı state'e at
      // --- YENİ EK SONU ---

      setLoading(false);
      return true;
    } catch (err) {
      console.error('Giriş hatası:', err);
      setError('Kullanıcı adı veya şifre hatalı.');
      setLoading(false);
      return false;
    }
  };

  // register fonksiyonu (Bu aynı kalabilir, çünkü 'register' zaten 'login'i çağırıyor)
  const register = async (email, username, password, role) => { // 'role' parametresini geri ekle
  try {
    setLoading(true);
    await axios.post(`${API_URL}/users/`, {
      email: email, username: username, password: password, role: role // 'role'ü değişkenden al
    });
      // Not: İşletme sahibi kaydını da buraya ekleyebiliriz ama şimdilik kalsın.

      const loginSuccess = await login(username, password);
      setLoading(false);
      return loginSuccess;
    } catch (err) {
      console.error('Kayıt hatası:', err);
      //... (hata yönetimi aynı)
      setError('Kayıt işlemi başarısız oldu.');
      setLoading(false);
      return false;
    }
  };

  // logout fonksiyonu
  const logout = () => {
    setToken(null);
    setUser(null); // <-- YENİ: Kullanıcıyı da temizle
    localStorage.removeItem('token');
  };

  // 'loading' durumunu da paylaşıyoruz, böylece App.jsx "bekle" diyebilir
  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, register, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};