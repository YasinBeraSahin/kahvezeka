// src/pages/BusinessPanelPage.jsx
import { API_URL } from '../apiConfig.js';
import {
  Container, Typography, Button, TextField, Box, Paper,
  CircularProgress, Alert, List, ListItem, ListItemText,
  IconButton, Divider, Checkbox, FormControlLabel, FormGroup,
  FormControl, FormLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function BusinessPanelPage() {
  const { token, user } = useAuth();
  const [hasBusiness, setHasBusiness] = useState(null);
  const [businessData, setBusinessData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    latitude: 0.0,
    longitude: 0.0,
    has_wifi: false,
    has_socket: false,
    is_pet_friendly: false,
    is_quiet: false,
    serves_food: false,
    has_board_games: false
  });

  const [menuItems, setMenuItems] = useState([]);
  // Initial state with default category
  const [newMenuItem, setNewMenuItem] = useState({ name: '', description: '', price: '', category: 'Sıcak' });

  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({ title: '', description: '' });

  const [pageLoading, setPageLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/businesses/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(response => {
          const data = response.data;
          setBusinessData(data);
          setFormData({
            name: data.name,
            address: data.address,
            phone: data.phone,
            latitude: data.latitude,
            longitude: data.longitude,
            has_wifi: data.has_wifi,
            has_socket: data.has_socket,
            is_pet_friendly: data.is_pet_friendly,
            is_quiet: data.is_quiet,
            serves_food: data.serves_food,
            has_board_games: data.has_board_games
          });
          setMenuItems(data.menu_items || []);
          setCampaigns(data.campaigns || []);
          setHasBusiness(true);
          setPageLoading(false);
        })
        .catch(err => {
          console.error("Mekan detayı hatası:", err);
          if ((err.response && err.response.status === 404) || (err.message && err.message.includes('404'))) {
            setHasBusiness(false);
          } else if (err.response && err.response.status === 403) {
            setError("Bu sayfaya erişim yetkiniz yok. Lütfen 'İşletme Sahibi' olarak giriş yaptığınızdan emin olun.");
          } else {
            console.error("Mekan bilgileri yüklenemedi:", err.response);
            setError("Mekan bilgileri yüklenemedi. (Sunucu bağlantısı veya yetki hatası)");
          }
          setPageLoading(false);
        });
    }
  }, [token]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : ((name === 'latitude' || name === 'longitude') ? parseFloat(value) : value)
    }));
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    setFormLoading(true); setError(null); setSuccess(null);
    try {
      const response = await axios.post(
        `${API_URL}/businesses/`,
        { ...formData, owner_id: user.id },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = response.data;
      setBusinessData(data);
      setMenuItems([]);
      setCampaigns([]);
      setHasBusiness(true);
      setSuccess('Mekanınız başarıyla oluşturuldu! Admin onayı bekleniyor.');
      setFormLoading(false);
    } catch (err) {
      setError('Mekan oluşturulamadı. Lütfen tüm alanları kontrol edin.');
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true); setError(null); setSuccess(null);
    try {
      const response = await axios.put(
        `${API_URL}/businesses/me`,
        formData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = response.data;
      setFormData({
        name: data.name, address: data.address, phone: data.phone,
        latitude: data.latitude, longitude: data.longitude
      });
      setBusinessData(prev => ({ ...prev, ...data }));
      setSuccess('Mekan bilgileri başarıyla güncellendi!');
      setFormLoading(false);
    } catch (err) {
      setError('Bilgiler güncellenemedi.');
      setFormLoading(false);
    }
  };

  const handleMenuFormChange = (e) => {
    const { name, value } = e.target;
    setNewMenuItem(prevData => ({ ...prevData, [name]: value }));
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      const response = await axios.post(
        `${API_URL}/businesses/me/menu-items/`,
        { ...newMenuItem, price: parseFloat(newMenuItem.price) },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMenuItems([...menuItems, response.data]);
      setNewMenuItem({ name: '', description: '', price: '', category: 'Sıcak' });
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

  if (pageLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }
  if (error && hasBusiness !== null) {
    return <Alert severity="error">{error}</Alert>;
  }

  // --- MENU RENDERING LOGIC ---
  const renderedMenuItems = menuItems.length === 0 ? (
    <Typography color="text.secondary">Henüz menü öğesi eklenmemiş.</Typography>
  ) : (
    <Box>
      {['Sıcak', 'Soğuk', 'Tatlı', 'Atıştırmalık', 'Diğer'].map(category => {
        const itemsInCat = menuItems.filter(item => {
          if (category === 'Diğer') {
            return !item.category || !['Sıcak', 'Soğuk', 'Tatlı', 'Atıştırmalık'].includes(item.category);
          }
          return item.category === category;
        });

        if (itemsInCat.length === 0) return null;

        return (
          <Box key={category} sx={{ mb: 3 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 1, borderBottom: '1px solid #eee', pb: 1 }}>
              {category === 'Sıcak' ? '☕ Sıcak Kahveler' :
                category === 'Soğuk' ? '❄️ Soğuk Kahveler' :
                  category === 'Tatlı' ? '🍰 Tatlılar' :
                    category === 'Atıştırmalık' ? '🥪 Atıştırmalıklar' : '📦 Diğer'}
            </Typography>
            <List>
              {itemsInCat.map(item => (
                <ListItem
                  key={item.id}
                  secondaryAction={<IconButton edge="end" onClick={() => handleDeleteMenuItem(item.id)}><DeleteIcon /></IconButton>}
                  sx={{ alignItems: 'flex-start', bgcolor: '#fafafa', mb: 1, borderRadius: 1 }}
                >
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ fontWeight: 'bold' }}>
                        {item.name} <Box component="span" sx={{ color: 'secondary.main', ml: 1 }}>{item.price} TL</Box>
                      </Box>
                    }
                    secondary={item.description}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 2, mb: 4, position: 'fixed', bottom: 0, right: 16, zIndex: 9999 }}>
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      </Box>

      {hasBusiness === false && (
        <Paper sx={{ padding: 4, marginTop: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>İşletme Panelim</Typography>
          <Typography variant="h6">Mekanınız Henüz Kayıtlı Değil</Typography>
          <Typography>Lütfen sistemde görünebilmek için mekanınızın bilgilerini girin.</Typography>
          <Box component="form" onSubmit={handleCreateBusiness} noValidate sx={{ mt: 2 }}>
            <TextField fullWidth label="Mekan Adı" name="name" value={formData.name} onChange={handleFormChange} margin="normal" required />
            <TextField fullWidth label="Adres" name="address" value={formData.address} onChange={handleFormChange} margin="normal" required />
            <TextField fullWidth label="Telefon" name="phone" value={formData.phone || ''} onChange={handleFormChange} margin="normal" />
            <TextField fullWidth label="Enlem" name="latitude" type="number" value={formData.latitude} onChange={handleFormChange} margin="normal" required />
            <TextField fullWidth label="Boylam" name="longitude" type="number" value={formData.longitude} onChange={handleFormChange} margin="normal" required />
            <FormControl component="fieldset" sx={{ mt: 2, mb: 1, width: '100%', border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
              <FormLabel component="legend">Mekan Özellikleri</FormLabel>
              <FormGroup row>
                <FormControlLabel control={<Checkbox checked={formData.has_wifi} onChange={handleFormChange} name="has_wifi" />} label="Wifi Var" />
                <FormControlLabel control={<Checkbox checked={formData.has_socket} onChange={handleFormChange} name="has_socket" />} label="Priz Var" />
                <FormControlLabel control={<Checkbox checked={formData.is_quiet} onChange={handleFormChange} name="is_quiet" />} label="Sessiz Ortam" />
                <FormControlLabel control={<Checkbox checked={formData.is_pet_friendly} onChange={handleFormChange} name="is_pet_friendly" />} label="Hayvan Dostu" />
                <FormControlLabel control={<Checkbox checked={formData.serves_food} onChange={handleFormChange} name="serves_food" />} label="Yemek Servisi" />
                <FormControlLabel control={<Checkbox checked={formData.has_board_games} onChange={handleFormChange} name="has_board_games" />} label="Masa Oyunları" />
              </FormGroup>
            </FormControl>
            <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2 }} disabled={formLoading}>
              {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Mekanımı Oluştur'}
            </Button>
          </Box>
        </Paper>
      )}

      {hasBusiness === true && businessData && (
        <>
          {businessData.is_approved === false && (
            <Paper sx={{ padding: 4, marginTop: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>Başvurunuz Alındı!</Typography>
              <Typography>Mekanınız ("{businessData.name}") inceleniyor.</Typography>
              <Typography sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>Bilgilerinizi güncelleyebilirsiniz.</Typography>
            </Paper>
          )}

          <Paper sx={{ padding: 4, marginTop: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>İşletme Panelim: {formData.name}</Typography>
            <Typography variant="h6">Mekan Bilgilerini Güncelle</Typography>
            <Box component="form" onSubmit={handleUpdate} noValidate sx={{ mt: 2 }}>
              <TextField fullWidth label="Mekan Adı" name="name" value={formData.name} onChange={handleFormChange} margin="normal" required />
              <TextField fullWidth label="Adres" name="address" value={formData.address} onChange={handleFormChange} margin="normal" required />
              <TextField fullWidth label="Telefon" name="phone" value={formData.phone || ''} onChange={handleFormChange} margin="normal" />
              <FormControl component="fieldset" sx={{ mt: 2, mb: 1, width: '100%', border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                <FormLabel component="legend">Mekan Özellikleri</FormLabel>
                <FormGroup row>
                  <FormControlLabel control={<Checkbox checked={formData.has_wifi} onChange={handleFormChange} name="has_wifi" />} label="Wifi Var" />
                  <FormControlLabel control={<Checkbox checked={formData.has_socket} onChange={handleFormChange} name="has_socket" />} label="Priz Var" />
                  <FormControlLabel control={<Checkbox checked={formData.is_quiet} onChange={handleFormChange} name="is_quiet" />} label="Sessiz Ortam" />
                  <FormControlLabel control={<Checkbox checked={formData.is_pet_friendly} onChange={handleFormChange} name="is_pet_friendly" />} label="Hayvan Dostu" />
                  <FormControlLabel control={<Checkbox checked={formData.serves_food} onChange={handleFormChange} name="serves_food" />} label="Yemek Servisi" />
                  <FormControlLabel control={<Checkbox checked={formData.has_board_games} onChange={handleFormChange} name="has_board_games" />} label="Masa Oyunları" />
                </FormGroup>
              </FormControl>
              <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2 }} disabled={formLoading}>
                {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Bilgilerini Güncelle'}
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ padding: 4, marginTop: 4 }}>
            <Typography variant="h6">Menü Yönetimi</Typography>
            <Box component="form" onSubmit={handleAddMenuItem} sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <TextField label="Ürün Adı" name="name" value={newMenuItem.name} onChange={handleMenuFormChange} required sx={{ flexBasis: '200px', flexGrow: 1 }} />
              <TextField label="Açıklama" name="description" value={newMenuItem.description} onChange={handleMenuFormChange} sx={{ flexBasis: '250px', flexGrow: 2 }} />
              <TextField label="Fiyat (TL)" name="price" type="number" value={newMenuItem.price} onChange={handleMenuFormChange} required sx={{ flexBasis: '100px', flexGrow: 1 }} />
              <TextField select label="Kategori" name="category" value={newMenuItem.category || ''} onChange={handleMenuFormChange} required SelectProps={{ native: true }} sx={{ flexBasis: '150px', flexGrow: 1 }}>
                <option value="">Seçiniz</option>
                <option value="Sıcak">Sıcak Kahve</option>
                <option value="Soğuk">Soğuk Kahve</option>
                <option value="Tatlı">Tatlı</option>
                <option value="Atıştırmalık">Atıştırmalık</option>
                <option value="Diğer">Diğer</option>
              </TextField>
              <Button type="submit" variant="contained" color="secondary" sx={{ height: '56px' }}>Ekle</Button>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" gutterBottom>Mevcut Menü</Typography>
            {renderedMenuItems}
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