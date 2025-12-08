// src/pages/BusinessDetailPage.jsx
import { API_URL } from '../apiConfig.js';
import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Rating,
  TextField,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PersonIcon from '@mui/icons-material/Person';
import WifiIcon from '@mui/icons-material/Wifi';
import PowerIcon from '@mui/icons-material/Power';
import PetsIcon from '@mui/icons-material/Pets';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CasinoIcon from '@mui/icons-material/Casino'; // Masa Oyunları için
import FastfoodIcon from '@mui/icons-material/Fastfood'; // Yemek için
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { toast } from 'react-toastify';
import IconButton from '@mui/material/IconButton';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // API_URL sonunda slash varsa ve path başında slash varsa birini temizle
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function BusinessDetailPage() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { businessId } = useParams();
  const { token, user } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
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
  }, [businessId]);

  useEffect(() => {
    if (token && businessId) {
      checkFavoriteStatus();
    }
  }, [token, businessId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/me/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const favorites = response.data;
      const isFav = favorites.some(fav => fav.id === Number(businessId));
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Favori kontrolü hatası:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!token) {
      toast.info('Favorilere eklemek için giriş yapmalısınız.');
      return;
    }

    setFavLoading(true);
    try {
      if (isFavorite) {
        await axios.delete(`${API_URL}/users/me/favorites/${businessId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setIsFavorite(false);
        toast.info('Favorilerden kaldırıldı.');
      } else {
        await axios.post(`${API_URL}/users/me/favorites/${businessId}`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setIsFavorite(true);
        toast.success('Favorilere eklendi! ❤️');
      }
    } catch (error) {
      console.error('Favori işlem hatası:', error);
      toast.error('İşlem sırasında bir hata oluştu.');
    } finally {
      setFavLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleImageSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (!token) {
      setFormError('Yorum yapmak için giriş yapmalısınız.');
      setSubmitting(false);
      return;
    }

    let imageUrl = null;

    // Fotoğraf varsa önce yükle
    if (selectedImage) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedImage);

      try {
        const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        imageUrl = uploadResponse.data.url;
      } catch (uploadErr) {
        console.error('Fotoğraf yükleme hatası:', uploadErr);
        toast.error('Fotoğraf yüklenirken bir hata oluştu.');
        setUploading(false);
        setSubmitting(false);
        return;
      }
      setUploading(false);
    }

    try {
      const response = await axios.post(
        `${API_URL}/businesses/${businessId}/reviews/`,
        {
          rating: newRating,
          comment: newComment,
          image_url: imageUrl
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setBusiness({
        ...business,
        reviews: [...business.reviews, response.data]
      });

      setNewRating(5);
      setNewComment('');
      setSelectedImage(null);
      setImagePreview(null);
      setSubmitting(false);
      toast.success('Yorumunuz başarıyla eklendi!');

    } catch (err) {
      console.error('Yorum gönderme hatası:', err);
      setFormError('Yorumunuz gönderilemedi.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !business) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Mekan bulunamadı.'}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* HERO SECTION */}
      <Box
        sx={{
          height: '400px',
          position: 'relative',
          backgroundImage: `url(${business.image_url ? getImageUrl(business.image_url) : 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end'
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)'
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mb: 4, color: 'white' }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {business.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnIcon sx={{ color: 'secondary.main' }} />
              <Typography variant="h6">{business.address}</Typography>
            </Box>
            <Chip
              label={`${business.average_rating ? business.average_rating.toFixed(1) : 'Yeni'} Puan`}
              color="secondary"
              sx={{ fontWeight: 'bold' }}
            />
            <IconButton
              onClick={handleToggleFavorite}
              disabled={favLoading}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': { backgroundColor: 'white' },
                ml: 2
              }}
            >
              {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* CONTENT SECTION */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          {/* LEFT COLUMN - TABS */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
              >
                <Tab icon={<RestaurantMenuIcon />} label="Menü" />
                <Tab icon={<RateReviewIcon />} label={`Yorumlar (${business.reviews.length})`} />
                <Tab icon={<LocalOfferIcon />} label="Kampanyalar" />
              </Tabs>

              {/* MENU TAB */}
              <TabPanel value={tabValue} index={0}>
                {business.menu_items.length === 0 ? (
                  <Typography color="text.secondary" align="center">Bu mekan henüz menü eklememiş.</Typography>
                ) : (
                  <List>
                    {business.menu_items.map((item, index) => (
                      <div key={item.id}>
                        <ListItem alignItems="flex-start" sx={{ py: 3, borderBottom: '1px solid #f0f0f0' }}>
                          {item.image_url && (
                            <Box
                              component="img"
                              src={getImageUrl(item.image_url)}
                              alt={item.name}
                              onError={(e) => {
                                console.log('Image load error for:', item.name, item.image_url);
                                e.target.src = 'https://via.placeholder.com/140?text=No+Image';
                              }}
                              sx={{
                                width: 140,
                                height: 140,
                                objectFit: 'cover',
                                borderRadius: 3,
                                mr: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                            />
                          )}
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" component="span">{item.name}</Typography>
                                <Typography variant="h6" component="span" color="primary.main">{item.price} TL</Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {item.description}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < business.menu_items.length - 1 && <Divider component="li" />}
                      </div>
                    ))}
                  </List>
                )}
              </TabPanel>

              {/* REVIEWS TAB */}
              <TabPanel value={tabValue} index={1}>
                {/* Review Form */}
                {token ? (
                  <Paper variant="outlined" sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>Deneyimini Paylaş</Typography>
                    <Box component="form" onSubmit={handleReviewSubmit}>
                      <Box sx={{ mb: 2 }}>
                        <Typography component="legend">Puanınız</Typography>
                        <Rating
                          name="simple-controlled"
                          value={newRating}
                          onChange={(event, newValue) => {
                            setNewRating(newValue);
                          }}
                          size="large"
                        />
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Bu mekan hakkında ne düşünüyorsunuz?"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        sx={{ mb: 2, bgcolor: 'white' }}
                      />

                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<PhotoCamera />}
                        >
                          Fotoğraf Ekle
                          <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={handleImageSelect}
                          />
                        </Button>
                        {imagePreview && (
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
                              src={imagePreview}
                              variant="rounded"
                              sx={{ width: 56, height: 56 }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(null);
                              }}
                              sx={{
                                position: 'absolute',
                                top: -10,
                                right: -10,
                                bgcolor: 'background.paper',
                                boxShadow: 1,
                                '&:hover': { bgcolor: 'grey.100' }
                              }}
                            >
                              x
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting || uploading}
                      >
                        {submitting || uploading ? 'Gönderiliyor...' : 'Yorum Yap'}
                      </Button>
                      {formError && <Typography color="error" sx={{ mt: 1 }}>{formError}</Typography>}
                    </Box>
                  </Paper>
                ) : (
                  <Alert severity="info" sx={{ mb: 4 }}>
                    Yorum yapmak için lütfen <RouterLink to="/login">giriş yapın</RouterLink>.
                  </Alert>
                )}

                {/* Reviews List */}
                {business.reviews.length === 0 ? (
                  <Typography color="text.secondary" align="center">Henüz yorum yapılmamış. İlk yorumu siz yapın!</Typography>
                ) : (
                  <List>
                    {business.reviews.map((review) => (
                      <Paper key={review.id} elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #eee', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {review.owner.username}
                            </Typography>
                            <Rating value={review.rating} readOnly size="small" />
                          </Box>
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ ml: 7 }}>
                          {review.comment}
                        </Typography>
                        {review.image_url && (
                          <Box sx={{ ml: 7, mt: 2 }}>
                            <img
                              src={getImageUrl(review.image_url)}
                              alt="Review attachment"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Resim+Silinmis'; }} // Placeholder göster
                              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                            />
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </List>
                )}
              </TabPanel>

              {/* CAMPAIGNS TAB */}
              <TabPanel value={tabValue} index={2}>
                {business.campaigns && business.campaigns.length > 0 ? (
                  <Grid container spacing={2}>
                    {business.campaigns.map(campaign => (
                      <Grid item xs={12} key={campaign.id}>
                        <Card sx={{ border: '2px dashed #c7a17a', bgcolor: '#fffaf0' }} elevation={0}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocalOfferIcon color="secondary" />
                              <Typography variant="h6" color="primary.main">
                                {campaign.title}
                              </Typography>
                            </Box>
                            <Typography variant="body1">
                              {campaign.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary" align="center">Şu an aktif bir kampanya bulunmuyor.</Typography>
                )}
              </TabPanel>
            </Paper>
          </Grid>

          {/* RIGHT COLUMN - INFO CARD */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 100 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Mekan Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <LocationOnIcon color="action" />
                <Typography variant="body2" color="text.secondary">
                  {business.address}
                </Typography>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {business.has_wifi && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <WifiIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Wi-Fi Var</Typography>
                  </Box>
                )}
                {business.has_socket && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <PowerIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Priz Mevcut</Typography>
                  </Box>
                )}
                {business.has_board_games && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <CasinoIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Masa Oyunları</Typography>
                  </Box>
                )}
                {business.serves_food && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FastfoodIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Yemek Servisi</Typography>
                  </Box>
                )}
                {business.is_pet_friendly && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <PetsIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Hayvan Dostu</Typography>
                  </Box>
                )}
                {business.is_quiet && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <VolumeOffIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Sessiz Ortam</Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Çalışma Saatleri
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hergün: 08:00 - 23:00
                </Typography>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 3 }}
                startIcon={<LocationOnIcon />}
              >
                Yol Tarifi Al
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container >
    </Box >
  );
}

export default BusinessDetailPage;