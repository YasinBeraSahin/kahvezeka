// src/pages/BusinessLandingPage.jsx
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function BusinessLandingPage() {
  return (
    <Container maxWidth="md">
      <Paper sx={{ padding: { xs: 2, md: 5 }, marginTop: 4, textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          color="primary" 
          sx={{ fontWeight: 'bold' }}
        >
          İşletmenizi Kahve Zeka'ya Taşıyın
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Binlerce kahve severin sizi keşfetmesini sağlayın, menünüzü
          dijitalleştirin ve müşteri sadakatini artırın.
        </Typography>

        <Box sx={{ my: 4, textAlign: 'left', display: 'inline-block' }}>
          <Typography variant="h6" gutterBottom>Neler Sunuyoruz?</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CheckCircleIcon color="secondary" sx={{ mr: 1 }} />
            <Typography>Haritada görünürlük ve kolay keşfedilme</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CheckCircleIcon color="secondary" sx={{ mr: 1 }} />
            <Typography>Dijital menü ve kampanya yönetimi</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CheckCircleIcon color="secondary" sx={{ mr: 1 }} />
            <Typography>Müşteri yorumlarına yanıt verme ve analiz</Typography>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Başlamaya Hazır mısınız?
        </Typography>
        <Typography paragraph>
          Başvuru yapmak ve ekibimizin sizi incelemesi için lütfen aşağıdaki
          link üzerinden bize e-posta gönderin.
        </Typography>
        
        {/* 'mailto:' linki, kullanıcının varsayılan e-posta programını açar */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          href="mailto:basvuru@kahvezeka.com?subject=Kahve Zeka İşletme Başvurusu"
          sx={{ fontSize: '1.1rem' }}
        >
          Hemen Başvur
        </Button>
      </Paper>
    </Container>
  );
}

export default BusinessLandingPage;