// src/App.jsx
import './App.css';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Box, Button, Typography, Container, CircularProgress, Link as MuiLink } from '@mui/material';

function App() {
  const { token, user, loading, logout } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          paddingY: 2,
        }}
      >
        <Container maxWidth={false} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3 }}>
          {/* Logo */}
          <MuiLink component={RouterLink} to="/" sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" component="div" color="primary" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              Kahve<Box component="span" sx={{ color: 'secondary.main' }}>Zeka</Box>
            </Typography>
          </MuiLink>

          {/* Navigation */}
          <Box component="nav" sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {(!user || user.role === 'customer') && (
              <Button component={RouterLink} to="/isletme" color="inherit" sx={{ fontWeight: 500 }}>
                İşletme Ekle
              </Button>
            )}

            {token ? (
              <>
                {user?.role === 'admin' && (
                  <Button component={RouterLink} to="/admin" color="error" sx={{ fontWeight: 700 }}>
                    Admin
                  </Button>
                )}
                {user?.role === 'owner' && (
                  <Button component={RouterLink} to="/panel" color="inherit">
                    Panel
                  </Button>
                )}
                <Button component={RouterLink} to="/profile" color="inherit">
                  Profil
                </Button>
                <Button variant="outlined" color="primary" onClick={logout} size="small">
                  Çıkış
                </Button>
              </>
            ) : (
              <>
                <Button component={RouterLink} to="/login" color="inherit">
                  Giriş Yap
                </Button>
                <Button component={RouterLink} to="/register" variant="contained" color="primary">
                  Kayıt Ol
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Content - FULL WIDTH (No Container wrapper) */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ backgroundColor: '#2D2D2D', color: '#fff', py: 6, mt: 'auto' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                KahveZeka
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa', maxWidth: 300 }}>
                Kahve severler için en iyi mekanları keşfetme platformu.
                Kendi zevkine uygun kahveyi bul, yorumla ve paylaş.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'secondary.main' }}>
                Keşfet
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <MuiLink component={RouterLink} to="/" color="inherit" underline="hover">Ana Sayfa</MuiLink>
                <MuiLink component={RouterLink} to="/isletme" color="inherit" underline="hover">İşletmeler İçin</MuiLink>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'secondary.main' }}>
                Hesap
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <MuiLink component={RouterLink} to="/login" color="inherit" underline="hover">Giriş Yap</MuiLink>
                <MuiLink component={RouterLink} to="/register" color="inherit" underline="hover">Kayıt Ol</MuiLink>
              </Box>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 6, color: '#666' }}>
            © {new Date().getFullYear()} KahveZeka. Tüm hakları saklıdır.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default App;