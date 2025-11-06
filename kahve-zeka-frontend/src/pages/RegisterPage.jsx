// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// --- YENİ MUI IMPORT'LARI ---
import { 
  Container, Paper, Box, TextField, Button, 
  Typography, Link, Radio, RadioGroup, 
  FormControlLabel, FormLabel, FormControl 
} from '@mui/material';
// ---

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // --- YENİ STATE: Rolü tutar, varsayılan 'customer' ---
  const [role, setRole] = useState('customer'); 
  
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 'register' fonksiyonuna 'role'ü de gönder
    const success = await register(email, username, password, role);
    
    if (success) {
      // Eğer 'owner' olarak kayıt olduysa, panele yönlendir
      if (role === 'owner') {
        navigate('/panel');
      } else {
        navigate('/'); // Müşteri ise ana sayfaya
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom textAlign="center">
          Kayıt Ol
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          
          {/* --- YENİ ROL SEÇİMİ BÖLÜMÜ --- */}
          <FormControl component="fieldset" margin="normal" fullWidth>
            <FormLabel component="legend">Hesap Türü:</FormLabel>
            <RadioGroup
              row
              aria-label="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <FormControlLabel value="customer" control={<Radio />} label="Müşteriyim" />
              <FormControlLabel value="owner" control={<Radio />} label="İşletme Sahibiyim" />
            </RadioGroup>
          </FormControl>
          {/* --- YENİ BÖLÜM SONU --- */}

          <TextField
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Kullanıcı Adı"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          >
            Kayıt Ol
          </Button>
          
          {error && <Typography color="error" textAlign="center" sx={{ mb: 2 }}>{error}</Typography>}
          
          <Typography textAlign="center">
            Zaten bir hesabınız var mı?{' '}
            <Link component={RouterLink} to="/login">
              Giriş Yapın
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default RegisterPage;