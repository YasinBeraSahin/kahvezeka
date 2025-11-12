// src/App.jsx
import './App.css';
// Link'i 'RouterLink' olarak yeniden adlandırarak import ediyoruz
import { Outlet, Link as RouterLink } from 'react-router-dom'; 
import { useAuth } from './context/AuthContext';

// --- YENİ MUI IMPORT'LARI ---
import { Box, Button, Typography, Container, CircularProgress } from '@mui/material';
// MUI Link'ini 'MuiLink' olarak import ediyoruz
import { Link as MuiLink } from '@mui/material';
// ---

function App() {
  // loading state'ini de alıyoruz
  const { token, user, loading, logout } = useAuth(); 

  // AuthContext veriyi doğrularken (sayfa ilk yüklendiğinde)
  // bir "yükleniyor" ekranı gösteriyoruz.
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    // Tüm siteyi MUI Container'ı ile sararak daha düzenli hale getiriyoruz
    <Container maxWidth="lg"> 
      <Box 
        component="header" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingY: 2, // dikey padding
          borderBottom: '1px solid #eee'
        }}
      >
        {/* Sol Taraf: Logo */}
        {/* MUI Link'ini, react-router-dom'un Link'i olarak davranması için ayarlıyoruz */}
        <MuiLink component={RouterLink} to="/" sx={{ textDecoration: 'none' }}>
          <Typography variant="h4" component="h1" color="primary" sx={{ fontWeight: 'bold' }}>
            Kahve Zeka
          </Typography>
        </MuiLink>
        
        {/* Sağ Taraf: Navigasyon */}
        <Box component="nav" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {(!user || user.role === 'customer') && (
            <MuiLink component={RouterLink} to="/isletme" variant="button" sx={{ textDecoration: 'none', color: 'text.primary', mr: 1 }}>
              İşletmenizi Ekleyin
            </MuiLink>
          )}
          {token ? (
            // Kullanıcı giriş yapmışsa
            <>
            {/* --- YENİ ADMİN LİNKİ --- */}
          {user && user.role === 'admin' && (
            <MuiLink component={RouterLink} to="/admin" variant="button" sx={{ textDecoration: 'none', color: 'red', fontWeight: 'bold' }}>
              Admin Paneli
            </MuiLink>
          )}
          {/* --- ADMİN LİNKİ SONU --- */}
              {user && user.role === 'owner' && (
                <MuiLink component={RouterLink} to="/panel" variant="button" sx={{ textDecoration: 'none', color: 'text.primary' }}>
                  İşletme Panelim
                </MuiLink>
              )}
              <MuiLink component={RouterLink} to="/profile" variant="button" sx={{ textDecoration: 'none', color: 'text.primary' }}>
                Profilim
              </MuiLink>
              <Button variant="outlined" color="primary" onClick={logout}>
                Çıkış Yap
              </Button>
            </>
          ) : (
            // Kullanıcı giriş yapmamışsa
            <Button variant="contained" color="primary" component={RouterLink} to="/login">
              Giriş Yap
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Ana içerik (Sayfalar: HomePage, LoginPage, PanelPage vb.) */}
      <Box component="main" sx={{ paddingTop: 4 }}>
        <Outlet />
      </Box>
    </Container>
  );
}

export default App;