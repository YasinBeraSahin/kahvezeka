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
  CardContent,
  IconButton
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

  // ...

  return (
    <Box sx={{ pb: 8 }}>
      {/* HERO SECTION */}
      <Box
        sx={{
          height: '300px',
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          display: 'flex',
          alignItems: 'flex-end'
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mb: 4, color: 'white' }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {business.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnIcon sx={{ color: 'white' }} />
              <Typography variant="h6">{business.address}</Typography>
            </Box>
// ...
            <List>
              {business.menu_items.map((item, index) => (
                <div key={item.id}>
                  <ListItem alignItems="flex-start" sx={{ py: 3, borderBottom: '1px solid #f0f0f0' }}>
                    {/* Image Removed */}
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6" component="span">{item.name}</Typography>
                          <Typography variant="h6" component="span" color="primary.main">{item.price} TL</Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          {item.category && (
                            <Chip label={item.category} size="small" color="secondary" variant="outlined" sx={{ mr: 1, mb: 0.5 }} />
                          )}
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {item.description}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < business.menu_items.length - 1 && <Divider component="li" />}
                </div>
              ))}
            </List>
// ...
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
              </Paper>
            ))}

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


          </Paper>
        </Grid>
      </Grid>
    </Container >
    </Box >
  );
}

export default BusinessDetailPage;