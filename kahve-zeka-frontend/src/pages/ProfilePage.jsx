// src/pages/ProfilePage.jsx
import { API_URL } from '../apiConfig.js';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Button,
  Rating,
  CircularProgress,
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Chip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

function ProfilePage() {
  const { token, user, logout } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]); // Favoriler için state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchMyReviews = async () => {
      try {
        // src/pages/ProfilePage.jsx
        import { API_URL } from '../apiConfig.js';
        import { useState, useEffect } from 'react';
        import { useAuth } from '../context/AuthContext';
        import axios from 'axios';
        import { Link as RouterLink } from 'react-router-dom';
        import {
          Box,
          Container,
          Grid,
          Paper,
          Typography,
          Avatar,
          Tabs,
          Tab,
          Divider,
          Button,
          Rating,
          CircularProgress,
          Alert,
          Card,
          CardActionArea,
          CardContent,
          Chip
        } from '@mui/material';
        import FavoriteIcon from '@mui/icons-material/Favorite';
        import PersonIcon from '@mui/icons-material/Person';
        import RateReviewIcon from '@mui/icons-material/RateReview';
        import SettingsIcon from '@mui/icons-material/Settings';
        import ExitToAppIcon from '@mui/icons-material/ExitToApp';
        import LocationOnIcon from '@mui/icons-material/LocationOn';

        function TabPanel(props) {
          const { children, value, index, ...other } = props;

          return (
            <div
              role="tabpanel"
              hidden={value !== index}
              id={`profile-tabpanel-${index}`}
              aria-labelledby={`profile-tab-${index}`}
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

        function ProfilePage() {
          const { token, user, logout } = useAuth();
          const [reviews, setReviews] = useState([]);
          const [favorites, setFavorites] = useState([]); // Favoriler için state
          const [loading, setLoading] = useState(true);
          const [error, setError] = useState(null);
          const [tabValue, setTabValue] = useState(0);

          useEffect(() => {
            if (!token) {
              setLoading(false);
              return;
            }

            const fetchMyReviews = async () => {
              try {
                const response = await axios.get(`${API_URL}/users/me/reviews`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                setReviews(response.data);
              } catch (err) {
                console.error("Yorumlar alınamadı:", err);
                setError("Yorumlarınızı yüklerken bir hata oluştu.");
              }
            };

            const fetchMyFavorites = async () => {
              try {
                const response = await axios.get(`${API_URL}/users/favorites`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                setFavorites(response.data);
              } catch (err) {
                console.error("Favoriler alınamadı:", err);
              }
            };

            Promise.all([fetchMyReviews(), fetchMyFavorites()])
              .finally(() => setLoading(false));

          }, [token]);

          const handleTabChange = (event, newValue) => {
            setTabValue(newValue);
          };

          if (!token) {
            return (
              <Container sx={{ mt: 10, textAlign: 'center' }}>
                <Alert severity="warning" sx={{ mb: 2 }}>Bu sayfayı görmek için giriş yapmalısınız.</Alert>
                <Button component={RouterLink} to="/login" variant="contained">Giriş Yap</Button>
              </Container>
            );
          }

          if (loading) {
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
              </Box>
            );
          }

          return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
              <Grid container spacing={4}>
                {/* LEFT COLUMN - USER PROFILE */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center', position: 'sticky', top: 100 }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: 'primary.main',
                        fontSize: '3rem',
                        margin: '0 auto',
                        mb: 2,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }}
                    >
                      {user?.username?.charAt(0).toUpperCase() || <PersonIcon fontSize="inherit" />}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {user?.username}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {user?.email}
                    </Typography>
                    <Chip
                      label={user?.role === 'admin' ? 'Yönetici' : user?.role === 'owner' ? 'İşletme Sahibi' : 'Kahve Sever'}
                      color="secondary"
                      size="small"
                      sx={{ mt: 1, mb: 3, fontWeight: 'bold' }}
                    />

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">{reviews.length}</Typography>
                        <Typography variant="caption" color="text.secondary">Yorum</Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">{favorites.length}</Typography>
                        <Typography variant="caption" color="text.secondary">Favori</Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<ExitToAppIcon />}
                      onClick={logout}
                      sx={{ mt: 2 }}
                    >
                      Çıkış Yap
                    </Button>
                  </Paper>
                </Grid>

                {/* RIGHT COLUMN - CONTENT */}
                <Grid item xs={12} md={8}>
                  <Paper sx={{ borderRadius: 2, overflow: 'hidden', minHeight: '500px' }}>
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      variant="fullWidth"
                      indicatorColor="primary"
                      textColor="primary"
                      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
                    >
                      <Tab icon={<RateReviewIcon />} label="Yorumlarım" />
                      <Tab icon={<FavoriteIcon />} label="Favorilerim" />
                      <Tab icon={<SettingsIcon />} label="Ayarlar" />
                    </Tabs>

                    {/* REVIEWS TAB */}
                    <TabPanel value={tabValue} index={0}>
                      {reviews.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <RateReviewIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            Henüz hiç yorum yapmamışsınız.
                          </Typography>
                          <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
                            Mekanları Keşfet
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {reviews.map((review) => (
                            <Card key={review.id} elevation={0} sx={{ border: '1px solid #eee', transition: '0.3s', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                              <CardActionArea component={RouterLink} to={`/business/${review.business.id}`}>
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                      {review.business.name}
                                    </Typography>
                                    <Rating value={review.rating} readOnly size="small" />
                                  </Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationOnIcon fontSize="inherit" /> {review.business.address}
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#555' }}>
                                    "{review.comment}"
                                  </Typography>
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          ))}
                        </Box>
                      )}
                    </TabPanel>

                    {/* FAVORITES TAB */}
                    <TabPanel value={tabValue} index={1}>
                      {favorites.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <FavoriteIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            Henüz favori mekanınız yok.
                          </Typography>
                          <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
                            Mekanları Keşfet
                          </Button>
                        </Box>
                      ) : (
                        <Grid container spacing={2}>
                          {favorites.map((business) => (
                            <Grid item xs={12} sm={6} key={business.id}>
                              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardActionArea component={RouterLink} to={`/business/${business.id}`} sx={{ flexGrow: 1 }}>
                                  <CardContent>
                                    <Typography variant="h6" component="div" gutterBottom>
                                      {business.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <Rating value={business.average_rating || 0} readOnly size="small" precision={0.1} />
                                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                        ({business.total_reviews || 0})
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <LocationOnIcon fontSize="inherit" /> {business.address}
                                    </Typography>
                                  </CardContent>
                                </CardActionArea>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </TabPanel>

                    {/* SETTINGS TAB */}
                    <TabPanel value={tabValue} index={2}>
                      <Typography variant="h6" gutterBottom>Hesap Ayarları</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Şu an için değiştirilebilecek bir ayar bulunmuyor.
                      </Typography>
                    </TabPanel>

                  </Paper>
                </Grid>
              </Grid>
            </Container>
          );
        }

        export default ProfilePage;