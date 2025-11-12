// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../apiConfig.js';
import { 
  Container, Typography, Box, Paper, CircularProgress, 
  Alert, List, ListItem, ListItemText, IconButton, Chip 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Onay ikonu
import CancelIcon from '@mui/icons-material/Cancel'; // Reddet ikonu

function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Veri çekme fonksiyonu
  const fetchBusinesses = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/all-businesses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBusinesses(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Mekanlar çekilemedi:", err);
      setError("Mekanları yükleme yetkiniz yok veya bir hata oluştu.");
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde mekanları çek
  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchBusinesses();
    } else if (!authLoading) {
      setError("Bu sayfaya erişim yetkiniz yok.");
      setLoading(false);
    }
  }, [token, user, authLoading]);

  // Onaylama fonksiyonu
  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/businesses/${id}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Listeyi anında güncelle
      setBusinesses(businesses.map(b => 
        b.id === id ? { ...b, is_approved: true } : b
      ));
    } catch (err) {
      setError("Onaylama işlemi başarısız oldu.");
    }
  };

  // Reddetme/Silme fonksiyonu
  const handleReject = async (id) => {
    if (!window.confirm("Bu mekanı SİLMEK istediğinizden emin misiniz? (İşletme sahibi tekrar başvurmalı)")) return;
    try {
      await axios.delete(`${API_URL}/admin/businesses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Listeyi anında güncelle
      setBusinesses(businesses.filter(b => b.id !== id));
    } catch (err) {
      setError("Reddetme işlemi başarısız oldu.");
    }
  };

  if (loading || authLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }
  
  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Paneli - İşletme Başvuruları
        </Typography>

        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

        <List>
          {businesses.length === 0 && <Typography>Gösterilecek işletme başvurusu yok.</Typography>}
          
          {businesses.map(business => (
            <ListItem 
              key={business.id} 
              divider
              sx={{ 
                backgroundColor: business.is_approved ? '#f1f8e9' : '#fffde7', // Onaylı/Onaysız rengi
                mb: 1, 
                borderRadius: '8px' 
              }}
            >
              <ListItemText 
                primary={`${business.name} (ID: ${business.id})`}
                secondary={`Adres: ${business.address} | Lat: ${business.latitude}, Lon: ${business.longitude}`}
              />
              
              {business.is_approved ? (
                // Zaten onaylıysa
                <Chip icon={<CheckCircleIcon />} label="Onaylandı" color="success" />
              ) : (
                // Onay bekliyorsa
                <Box>
                  <IconButton 
                    color="success" 
                    onClick={() => handleApprove(business.id)}
                    title="Onayla"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleReject(business.id)}
                    title="Reddet/Sil"
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default AdminPage;