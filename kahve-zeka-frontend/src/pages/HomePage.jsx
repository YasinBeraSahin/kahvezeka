// src/pages/HomePage.jsx
import { API_URL } from '../apiConfig.js';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent.jsx';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Chip,
  Rating,
  CircularProgress,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function HomePage() {
  const [businesses, setBusinesses] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [radius, setRadius] = useState(5);
  const [filters, setFilters] = useState({
    has_wifi: false,
    has_socket: false,
    is_pet_friendly: false,
    is_quiet: false,
    serves_food: false,
    has_board_games: false
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 1. ADIM: Konum alma
  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (err) => {
          console.error('Konum alınamadı, varsayılan konum (İstanbul) kullanılıyor:', err);
          setUserLocation([40.9882, 29.0223]); // Kadıköy
          setError(null);
          setLoading(false);
        }
      );
    } else {
      console.error('Tarayıcı konum desteklemiyor.');
      setUserLocation([40.9882, 29.0223]);
      setLoading(false);
    }
  }, []);

  // 2. ADIM: Veri çekme
  useEffect(() => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);

    axios.get(`${API_URL}/businesses/nearby/`, {
      params: {
        lat: userLocation[0],
        lon: userLocation[1],
        radius_km: radius,
        ...filters
      }
    })
      .then(response => {
        setBusinesses(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Hata:', err);
        setError('Mekanlar yüklenemedi.');
        setLoading(false);
      });

  }, [userLocation, radius, filters]);

  // 3. ADIM: Filtreleme
  const filteredBusinesses = useMemo(() => {
    if (!searchTerm) return businesses;
    return businesses.filter(b =>
      b.business.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [businesses, searchTerm]);

  if (!userLocation && loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: 'calc(100vh - 64px)', width: '100%', overflow: 'hidden' }}>

      {/* SOL TARAF: LİSTE (Masaüstünde) / ALT TARAF (Mobilde) */}
      <Box
        sx={{
          width: isMobile ? '100%' : '450px',
          minWidth: isMobile ? '100%' : '450px',
          height: isMobile ? '50%' : '100%',
          overflowY: 'auto',
          borderRight: '1px solid #eee',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Arama ve Filtreler */}
        <Box sx={{ p: 2, borderBottom: '1px solid #eee', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            Yakındaki Mekanlar
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Mekan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            <FormControl sx={{ minWidth: 100 }} size="small">
              <InputLabel>Mesafe</InputLabel>
              <Select
                value={radius}
                label="Mesafe"
                onChange={(e) => setRadius(Number(e.target.value))}
              >
                <MenuItem value={1}>1 km</MenuItem>
                <MenuItem value={3}>3 km</MenuItem>
                <MenuItem value={5}>5 km</MenuItem>
                <MenuItem value={10}>10 km</MenuItem>
                <MenuItem value={20}>20 km</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            <Chip
              icon={<LocationOnIcon />}
              label="Masa Oyunları"
              clickable
              color={filters.has_board_games ? "primary" : "default"}
              variant={filters.has_board_games ? "filled" : "outlined"}
              onClick={() => setFilters({ ...filters, has_board_games: !filters.has_board_games })}
            />
            <Chip
              label="Wi-Fi"
              clickable
              color={filters.has_wifi ? "primary" : "default"}
              variant={filters.has_wifi ? "filled" : "outlined"}
              onClick={() => setFilters({ ...filters, has_wifi: !filters.has_wifi })}
            />
            <Chip
              label="Priz"
              clickable
              color={filters.has_socket ? "primary" : "default"}
              variant={filters.has_socket ? "filled" : "outlined"}
              onClick={() => setFilters({ ...filters, has_socket: !filters.has_socket })}
            />
            <Chip
              label="Hayvan Dostu"
              clickable
              color={filters.is_pet_friendly ? "primary" : "default"}
              variant={filters.is_pet_friendly ? "filled" : "outlined"}
              onClick={() => setFilters({ ...filters, is_pet_friendly: !filters.is_pet_friendly })}
            />
            <Chip
              label="Sessiz"
              clickable
              color={filters.is_quiet ? "primary" : "default"}
              variant={filters.is_quiet ? "filled" : "outlined"}
              onClick={() => setFilters({ ...filters, is_quiet: !filters.is_quiet })}
            />
            <Chip
              label="Yemek"
              clickable
              color={filters.serves_food ? "primary" : "default"}
              variant={filters.serves_food ? "filled" : "outlined"}
              onClick={() => setFilters({ ...filters, serves_food: !filters.serves_food })}
            />
          </Box>
        </Box>

        {/* Liste İçeriği */}
        <Box sx={{ p: 2, flexGrow: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredBusinesses.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
              Bu alanda mekan bulunamadı.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredBusinesses.map(b => (
                <Card key={b.business.id} elevation={0} sx={{ border: '1px solid #eee', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                  <CardActionArea component={RouterLink} to={`/business/${b.business.id}`} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {b.business.name}
                      </Typography>
                      <Chip
                        label={`${b.distance_km.toFixed(1)} km`}
                        size="small"
                        color="primary"
                        variant="soft"
                        sx={{ fontWeight: 'bold', height: 24 }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon fontSize="inherit" />
                      {b.business.address}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={b.business.average_rating || 0} readOnly size="small" precision={0.5} />
                      <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'bold', color: 'text.primary' }}>
                        {b.business.average_rating ? b.business.average_rating.toFixed(1) : '0.0'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({b.business.review_count} yorum)
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* SAĞ TARAF: HARİTA (Masaüstünde) / ÜST TARAF (Mobilde) */}
      <Box sx={{ flexGrow: 1, height: isMobile ? '50%' : '100%', position: 'relative' }}>
        {userLocation && (
          <MapComponent
            businesses={filteredBusinesses}
            center={userLocation}
            radius={radius}
          />
        )}
      </Box>

    </Box>
  );
}

export default HomePage;