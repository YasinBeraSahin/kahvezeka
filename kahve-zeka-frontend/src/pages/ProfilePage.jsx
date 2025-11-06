// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:8000';

function ProfilePage() {
  const { token } = useAuth(); // Giriş jetonumuzu al
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa, API isteği gönderme
    if (!token) {
      setLoading(false);
      setError("Bu sayfayı görmek için giriş yapmalısınız.");
      return;
    }

    // Giriş yapılmışsa, API'den 'benim' yorumlarımı çek
    const fetchMyReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/me/reviews`, {
          headers: {
            // Güvenli endpoint'e jetonu gönder
            'Authorization': `Bearer ${token}` 
          }
        });
        setReviews(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Yorumlar alınamadı:", err);
        setError("Yorumlarınızı yüklerken bir hata oluştu.");
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, [token]); // 'token' değiştiğinde (örn: çıkış yapıldığında) yeniden çalış

  if (loading) return <p>Yorumlarınız yükleniyor...</p>;
  
  if (error) {
    return (
      <p style={{ color: 'red' }}>
        {error} 
        {/* Giriş yapılmadıysa login linki göster */}
        {!token && <Link to="/login"> Giriş yap</Link>}
      </p>
    );
  }

  return (
    <div className="profile-page">
      <h2>Yaptığım Yorumlar</h2>
      {reviews.length === 0 ? (
        <p>Henüz hiç yorum yapmamışsınız. Hadi, bir mekanı keşfedin!</p>
      ) : (
        <ul>
          {/* Gelen yorumları listele */}
          {reviews.map(review => (
            <li key={review.id} className="review-card">
              <strong>
                {/* Mekanın adını tıklanabilir bir link yap */}
                <Link to={`/business/${review.business.id}`}>
                  {review.business.name}
                </Link>
              </strong>
              <p>Verdiğim Puan: {review.rating} / 5</p>
              {review.comment && <p>"{review.comment}"</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProfilePage;