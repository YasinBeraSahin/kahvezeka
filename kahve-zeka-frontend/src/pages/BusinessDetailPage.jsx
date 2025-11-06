// src/pages/BusinessDetailPage.jsx
import { API_URL } from '../apiConfig.js';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Link'i de ekleyin
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // YENİ EKLENEN SATIR



function BusinessDetailPage() {
  const [business, setBusiness] = useState(null); // Tek bir mekanı saklayacak
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useParams, URL'deki :businessId parametresini yakalamamızı sağlar
  const { businessId } = useParams();
  // --- YENİ EKLENENLER ---
  const { token } = useAuth(); // Giriş durumunu ve jetonu al
  const [newRating, setNewRating] = useState(5); // Yeni yorumun puanı
  const [newComment, setNewComment] = useState(''); // Yeni yorumun metni
  const [formError, setFormError] = useState(null); // Form hataları
  // --- YENİ EKLENENLER SONU ---

  useEffect(() => {
    // Backend'den tek bir mekanın detayını çekiyoruz
    axios.get(`${API_URL}/businesses/${businessId}`)
      .then(response => {
        setBusiness(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Mekan detayı çekerken hata:', error);
        setError('Mekan detayı yüklenemedi.');
        setLoading(false);
      });
  }, [businessId]); // 'businessId' değiştiğinde bu isteği tekrar yap

  // --- YENİ FORM GÖNDERME FONKSİYONU ---
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!token) {
      setFormError('Yorum yapmak için giriş yapmalısınız.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/businesses/${businessId}/reviews/`,
        {
          rating: newRating,
          comment: newComment
        },
        {
          headers: {
            // Jetonu (bileti) API isteğinin başına ekliyoruz
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // BAŞARILI! Backend'den dönen yeni yorumu (owner bilgisiyle)
      // mevcut yorum listesine ekliyoruz.
      setBusiness({
        ...business,
        reviews: [...business.reviews, response.data]
      });

      // Formu temizle
      setNewRating(5);
      setNewComment('');

    } catch (err) {
      console.error('Yorum gönderme hatası:', err);
      setFormError('Yorumunuz gönderilemedi. (Puan 1-5 arası olmalı mı?)');
    }
  };
  // --- YENİ FONKSİYON SONU ---

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p>{error}</p>;
  if (!business) return <p>Mekan bulunamadı.</p>;

  return (
    <div className="business-detail">
      <h2>{business.name}</h2>
      <p>{business.address}</p>
      <p>
        <strong>Ortalama Puan: </strong>
        {business.average_rating ? business.average_rating.toFixed(1) : 'Henüz Puanlanmamış'}
      </p>

      <hr />

      {/* Sadece kampanya varsa bu bölümü göster */}
      {business.campaigns && business.campaigns.length > 0 && (
        <div className="campaign-section">
          <hr />
          <h3>✨ Aktif Kampanyalar</h3>
          <ul className="campaign-list">
            {business.campaigns.map(campaign => (
              <li key={campaign.id} className="campaign-card">
                <strong>{campaign.title}</strong>
                <p>{campaign.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
        <hr />
      <h3>Menü</h3>
      {business.menu_items.length === 0 ? (
        <p>Bu mekan henüz menü eklememiş.</p>
      ) : (
        <ul className="menu-list">
          {business.menu_items.map(item => (
            <li key={item.id} className="menu-item">
              <div className="menu-item-header">
                <strong>{item.name}</strong>
                <span>{item.price} TL</span>
              </div>
              {item.description && <p className="menu-item-description">{item.description}</p>}
            </li>
          ))}
        </ul>
      )}
      <h3>Yorumlar</h3>
      {/* --- YENİ EKLENEN FORM BÖLÜMÜ --- */}
  {token ? (
    <form onSubmit={handleReviewSubmit} className="review-form">
      <h4>Yeni Yorum Ekle</h4>
      <div>
        <label>Puan:</label>
        <select 
          value={newRating} 
          onChange={(e) => setNewRating(Number(e.target.value))}
        >
          <option value={5}>5 Yıldız</option>
          <option value={4}>4 Yıldız</option>
          <option value={3}>3 Yıldız</option>
          <option value={2}>2 Yıldız</option>
          <option value={1}>1 Yıldız</option>
        </select>
      </div>
      <div>
        <label>Yorum:</label>
        <textarea 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Düşünceleriniz..."
        />
      </div>
      <button type="submit">Gönder</button>
      {formError && <p style={{ color: 'red' }}>{formError}</p>}
    </form>
  ) : (
    <p>
      Yorum yapmak için lütfen <Link to="/login">giriş yapın</Link>.
    </p>
  )}
  {/* --- YENİ BÖLÜM SONU --- */}


  {/* Mevcut Yorum Listesi */}
  {business.reviews.length === 0 ? (
    <p>Bu mekan için henüz yorum yapılmamış.</p>
  ) : (
    <ul>
      {business.reviews.map(review => (
        <li key={review.id} className="review-card">
          <strong>{review.owner.username}</strong>
          <p>Puan: {review.rating} / 5</p>
          <p>"{review.comment}"</p>
        </li>
      ))}
    </ul>
  )}
</div>
    
    );
}
export default BusinessDetailPage ;