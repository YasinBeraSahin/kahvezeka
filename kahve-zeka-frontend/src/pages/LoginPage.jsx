// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Link'i ekle

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth(); // AuthContext'ten login fonksiyonunu al
  const navigate = useNavigate(); // Yönlendirme için

  const handleSubmit = async (e) => {
    e.preventDefault(); // Formun sayfayı yenilemesini engelle
    
    const success = await login(username, password);
    
    if (success) {
      navigate('/'); // Başarılıysa ana sayfaya yönlendir
    }
  };

  return (
    <div className="login-page">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Kullanıcı Adı:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Şifre:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Giriş Yap</button>
        {/* Giriş başarısız olursa context'teki hatayı göster */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      {/* YENİ EKLENEN PARAGRAF */}
        <p>
            Henüz bir hesabınız yok mu? <Link to="/register">Kayıt Olun</Link>
        </p>
    </div>
  );
}

export default LoginPage;