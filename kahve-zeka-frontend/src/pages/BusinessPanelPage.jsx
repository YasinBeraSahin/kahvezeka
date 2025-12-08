// src/pages/BusinessPanelPage.jsx
import { API_URL } from '../apiConfig.js';
import {
  Container, Typography, Button, TextField, Box, Paper,
  CircularProgress, Alert, List, ListItem, ListItemText,
  IconButton, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function BusinessPanelPage() {
  // AuthContext'ten hem 'token'ı hem de 'user' objesini (ID'si için) al
  const { token, user } = useAuth();

  // 'null' = bilinmiyor, 'true' = mekan var, 'false' = mekan yok
  const [hasBusiness, setHasBusiness] = useState(null);

  // API'den dönen tüm business objesini saklar (is_approved dahil)
  const [businessData, setBusinessData] = useState(null);

  // Bu state, hem 'Güncelleme' hem de 'Yeni Oluşturma' formu için kullanılacak
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    latitude: 0.0,
    longitude: 0.0
  });

  // Arkaplan fotoğrafı için state
  const [selectedBgFile, setSelectedBgFile] = useState(null);

  // Menü ve Kampanya listeleri için state'ler
  const [menuItems, setMenuItems] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  // Yeni öğe ekleme formları için state'ler
  const [newMenuItem, setNewMenuItem] = useState({ name: '', description: '', price: '' });
  const [newCampaign, setNewCampaign] = useState({ title: '', description: '' });

  // Menü fotoğrafı için state
  const [selectedMenuFile, setSelectedMenuFile] = useState(null);

  // Yükleme ve durum state'leri
  const [pageLoading, setPageLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Sayfa yüklendiğinde mevcut mekanı çekmeyi dene
  useEffect(() => {
    // Sadece token varsa API isteği yap
    if (token) {
      axios.get(`${API_URL}/businesses/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(response => {
          // BAŞARILI: Mekan bulundu
          const data = response.data;
          setBusinessData(data); // Gelen tüm objeyi sakla
          setFormData({
            name: data.name,
            address: data.address,
            phone: data.phone,
            latitude: data.latitude,
            longitude: data.longitude
          });
          setMenuItems(data.menu_items || []);
          setCampaigns(data.campaigns || []);
          setHasBusiness(true); // Mekanı var
          setPageLoading(false);
        })
        .catch(err => {
          // Hata 404 ise (Mekan bulunamadı), bu "yeni sahip" durumudur.
          if (err.response && err.response.status === 404) {
            setHasBusiness(false); // Mekanı yok, "Oluştur" formu gösterilecek
          } else {
            // Başka bir hata (örn: 500 veya 401)
            console.error("Mekan bilgileri yüklenemedi:", err.response);
            setError("Mekan bilgileri yüklenemedi.");
          }
          setPageLoading(false);
        });
    }
  }, [token]);

  // Form alanı değiştiğinde çalışır (hem yeni hem güncelleme için ortak)
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: (name === 'latitude' || name === 'longitude') ? parseFloat(value) : value
    }));
  };

  // --- FOTOĞRAF YÜKLEME YARDIMCI FONKSİYONU ---
  const handleUploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url;
    } catch (err) {
      console.error("Yükleme hatası:", err);
      throw new Error("Dosya yüklenemedi");
    }
  };

  // --- MEKAN YÖNETİMİ ---

  // YENİ MEKAN OLUŞTURMA (hasBusiness false ise)
  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    setFormLoading(true); setError(null); setSuccess(null);
    try {
      // 'POST /businesses/' endpoint'ine, 'owner_id'mizi de ekleyerek yolla
      // 'is_approved' backend'de otomatik olarak 'False' ayarlanacak
      const response = await axios.post(
        `${API_URL}/businesses/`,
        { ...formData, owner_id: user.id }, // 'user' objesini context'ten aldık
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const data = response.data;
      setBusinessData(data); // Gelen yeni mekanı sakla
      setMenuItems([]); // Yeni mekanın menüsü boştur
      setCampaigns([]); // Yeni mekanın kampanyaları boştur
      setHasBusiness(true); // Artık bir mekanı var
      setSuccess('Mekanınız başarıyla oluşturuldu! Admin onayı bekleniyor.');
      setFormLoading(false);

    } catch (err) {
      setError('Mekan oluşturulamadı. Lütfen tüm alanları kontrol edin.');
      setFormLoading(false);
    }
  };

  // MEVCUT MEKANI GÜNCELLEME (hasBusiness true ise)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true); setError(null); setSuccess(null);

    let chartUrl = businessData.image_url; // Mevcut URL

    try {
      // Eğer yeni bir arkaplan seçildiyse önce onu yükle
      if (selectedBgFile) {
        chartUrl = await handleUploadFile(selectedBgFile);
      }

      const response = await axios.put(
        `${API_URL}/businesses/me`,
        { ...formData, image_url: chartUrl },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = response.data;
      setFormData({ // Sadece form verisini güncelle
        name: data.name, address: data.address, phone: data.phone,
        latitude: data.latitude, longitude: data.longitude
      });
      // 'businessData'yı da güncelle
      setBusinessData(prev => ({ ...prev, ...data }));
      setSelectedBgFile(null); // Dosya seçimini sıfırla
      setSuccess('Mekan bilgileri başarıyla güncellendi!');
      setFormLoading(false);
    } catch (err) {
      setError('Bilgiler güncellenemedi.');
      setFormLoading(false);
    }
  };

  // --- MENÜ YÖNETİMİ ---

  const handleMenuFormChange = (e) => {
    const { name, value } = e.target;
    setNewMenuItem(prevData => ({ ...prevData, [name]: value }));
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);

    let menuImageUrl = null;

    try {
      if (selectedMenuFile) {
        menuImageUrl = await handleUploadFile(selectedMenuFile);
      }

      const response = await axios.post(
        `${API_URL}/businesses/me/menu-items/`,
        { ...newMenuItem, price: parseFloat(newMenuItem.price), image_url: menuImageUrl },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMenuItems([...menuItems, response.data]);
      setNewMenuItem({ name: '', description: '', price: '' });
      setSelectedMenuFile(null);
      setSuccess('Menü öğesi eklendi!');
    } catch (err) {
      console.error("Menü ekleme hatası:", err.response);
      setError('Menü öğesi eklenemedi. (Tüm alanları doldurdunuz mu?)');
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return;
    setError(null); setSuccess(null);
    try {
      await axios.delete(
        `${API_URL}/businesses/me/menu-items/${itemId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMenuItems(menuItems.filter(item => item.id !== itemId));
      setSuccess('Menü öğesi silindi!');
    } catch (err) {
      console.error("Menü silme hatası:", err.response);
      setError('Menü öğesi silinemedi.');
    }
  };

  // --- KAMPANYA YÖNETİMİ ---

  const handleCampaignFormChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign(prevData => ({ ...prevData, [name]: value }));
  };

  const handleAddCampaign = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      const response = await axios.post(
        `${API_URL}/businesses/me/campaigns/`,
        newCampaign,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setCampaigns([...campaigns, response.data]);
      setNewCampaign({ title: '', description: '' });
      setSuccess('Kampanya eklendi!');
    } catch (err) {
      console.error("Kampanya ekleme hatası:", err);
      setError('Kampanya eklenemedi. (Tüm alanları doldurdunuz mu?)');
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm("Bu kampanyayı silmek istediğinizden emin misiniz?")) return;
    setError(null); setSuccess(null);
    try {
      await axios.delete(
        `${API_URL}/businesses/me/campaigns/${campaignId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setCampaigns(campaigns.filter(campaign => campaign.id !== campaignId));
      setSuccess('Kampanya silindi!');
    } catch (err) {
      console.error("Kampanya silme hatası:", err);
      setError('Kampanya silinemedi.');
    }
  };

  // --- YÜKLEME VE HATA DURUMLARI ---
  if (pageLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }
  // 'hasBusiness' null değilse (yani API yanıt verdi) ve bir hata varsa göster
  if (error && hasBusiness !== null) {
    return <Alert severity="error">{error}</Alert>;
  }

  // --- ARAYÜZ ÇİZİMİ ---
  return (
    <Container maxWidth="md">

      {/* Genel Hata/Başarı Mesajları */}
      <Box sx={{ mt: 2, mb: 4, position: 'fixed', bottom: 0, right: 16, zIndex: 9999 }}>
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      </Box>

      {hasBusiness === false && (
        // --- DURUM 1: MEKANI YOK (YENİ OLUŞTURMA MODU) ---
        <Paper sx={{ padding: 4, marginTop: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            İşletme Panelim
          </Typography>
          <Typography variant="h6">Mekanınız Henüz Kayıtlı Değil</Typography>
          <Typography>Lütfen sistemde görünebilmek için mekanınızın bilgilerini girin.</Typography>

          <Box component="form" onSubmit={handleCreateBusiness} noValidate sx={{ mt: 2 }}>
            <TextField fullWidth label="Mekan Adı" name="name" value={formData.name} onChange={handleFormChange} margin="normal" required />
            <TextField fullWidth label="Adres" name="address" value={formData.address} onChange={handleFormChange} margin="normal" required />
            <TextField fullWidth label="Telefon" name="phone" value={formData.phone || ''} onChange={handleFormChange} margin="normal" />
            <TextField fullWidth label="Enlem" name="latitude" type="number" value={formData.latitude} onChange={handleFormChange} margin="normal" required />
            <TextField fullWidth label="Boylam" name="longitude" type="number" value={formData.longitude} onChange={handleFormChange} margin="normal" required />
            <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2 }} disabled={formLoading}>
              {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Mekanımı Oluştur'}
            </Button>
          </Box>
        </Paper>
      )}

      {hasBusiness === true && businessData && (
        // --- DURUM 2: MEKANI VAR ---
        <>
          {businessData.is_approved === false ? (
            // --- DURUM 2a: MEKAN ONAY BEKLİYOR ---
            <Paper sx={{ padding: 4, marginTop: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Başvurunuz Alındı!
              </Typography>
              <Typography>
                Mekanınız ("{businessData.name}") ekibimiz tarafından inceleniyor.
                Onaylandığında, paneliniz otomatik olarak aktif hale gelecektir
                ve mekanınız haritada görünmeye başlayacaktır.
              </Typography>
              <Typography sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                Onay sürecinde mekan bilgilerinizi, menünüzü veya kampanyalarınızı güncelleyebilirsiniz.
              </Typography>
            </Paper>
          ) : (
            // --- DURUM 2b: MEKAN ONAYLANMIŞ ---
            null
          )}

          <Paper sx={{ padding: 4, marginTop: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              İşletme Panelim: {formData.name}
            </Typography>
            <Typography variant="h6">Mekan Bilgilerini Güncelle</Typography>
            <Box component="form" onSubmit={handleUpdate} noValidate sx={{ mt: 2 }}>
              <TextField fullWidth label="Mekan Adı" name="name" value={formData.name} onChange={handleFormChange} margin="normal" required />
              <TextField fullWidth label="Adres" name="address" value={formData.address} onChange={handleFormChange} margin="normal" required />
              <TextField fullWidth label="Telefon" name="phone" value={formData.phone || ''} onChange={handleFormChange} margin="normal" />

              {/* YENİ: Arkaplan Fotoğrafı Yükleme */}
              <Box sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                >
                  Arkaplan Fotoğrafı Seç
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setSelectedBgFile(e.target.files[0])}
                  />
                </Button>
                {selectedBgFile ? (
                  <Typography variant="body2">{selectedBgFile.name}</Typography>
                ) : (
                  businessData.image_url && <Typography variant="caption" color="text.secondary">Mevcut fotoğraf var</Typography>
                )}
              </Box>

              <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2 }} disabled={formLoading}>
                {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Bilgileri ve Fotoğrafı Güncelle'}
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ padding: 4, marginTop: 4 }}>
            <Typography variant="h6">Menü Yönetimi</Typography>
            <Box component="form" onSubmit={handleAddMenuItem} sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <TextField label="Ürün Adı" name="name" value={newMenuItem.name} onChange={handleMenuFormChange} required sx={{ flexBasis: '200px', flexGrow: 1 }} />
              <TextField label="Açıklama" name="description" value={newMenuItem.description} onChange={handleMenuFormChange} sx={{ flexBasis: '250px', flexGrow: 2 }} />
              <TextField label="Fiyat (TL)" name="price" type="number" value={newMenuItem.price} onChange={handleMenuFormChange} required sx={{ flexBasis: '100px', flexGrow: 1 }} />

              {/* YENİ: Menü Fotoğrafı Yükleme */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <IconButton color="primary" aria-label="upload picture" component="label">
                  <input hidden accept="image/*" type="file" onChange={(e) => setSelectedMenuFile(e.target.files[0])} />
                  <PhotoCamera />
                </IconButton>
                {selectedMenuFile && <Typography variant="caption">{selectedMenuFile.name.substring(0, 10)}...</Typography>}
              </Box>

              <Button type="submit" variant="contained" color="secondary" sx={{ height: '56px' }}>Ekle</Button>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1">Mevcut Menü</Typography>
            {menuItems.length === 0 ? (<Typography>Henüz menü öğesi eklenmemiş.</Typography>) : (
              <List>
                {menuItems.map(item => (
                  <ListItem
                    key={item.id}
                    secondaryAction={<IconButton edge="end" onClick={() => handleDeleteMenuItem(item.id)}><DeleteIcon /></IconButton>}
                    sx={{ alignItems: 'flex-start' }}
                  >
                    {/* Varsa resmi göster */}
                    {item.image_url && (
                      <Box
                        component="img"
                        src={`${API_URL}${item.image_url}`}
                        sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                      />
                    )}
                    <ListItemText primary={item.name} secondary={`${item.description || ''} - ${item.price} TL`} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          <Paper sx={{ padding: 4, marginTop: 4 }}>
            <Typography variant="h6">Kampanya Yönetimi</Typography>
            <Box component="form" onSubmit={handleAddCampaign} sx={{ mt: 2 }}>
              <TextField fullWidth label="Kampanya Başlığı" name="title" value={newCampaign.title} onChange={handleCampaignFormChange} required margin="normal" />
              <TextField fullWidth label="Kampanya Açıklaması" name="description" value={newCampaign.description} onChange={handleCampaignFormChange} required multiline rows={3} margin="normal" />
              <Button type="submit" variant="contained" color="secondary" sx={{ mt: 1 }}>Kampanya Ekle</Button>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1">Mevcut Kampanyalar</Typography>
            {campaigns.length === 0 ? (<Typography>Henüz kampanya eklenmemiş.</Typography>) : (
              <List>
                {campaigns.map(campaign => (
                  <ListItem key={campaign.id} secondaryAction={<IconButton edge="end" onClick={() => handleDeleteCampaign(campaign.id)}><DeleteIcon /></IconButton>}>
                    <ListItemText primary={campaign.title} secondary={campaign.description} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </>
      )}
    </Container>
  );
}

export default BusinessPanelPage;