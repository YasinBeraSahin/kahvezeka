// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../apiConfig.js';
import {
  Container, Typography, Box, Paper, CircularProgress,
  Alert, List, ListItem, ListItemText, IconButton, Chip,
  Divider, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';

function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsBusiness, setDetailsBusiness] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const fetchBusinesses = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/all-businesses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBusinesses(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Mekanlar çekilemedi:", err);
      setError("Mekanları yükleme yetkiniz yok veya bir hata oluştu.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchBusinesses();
    } else if (!authLoading) {
      setError("Bu sayfaya erişim yetkiniz yok.");
      setLoading(false);
    }
  }, [token, user, authLoading]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/businesses/${id}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBusinesses(businesses.map(b =>
        b.id === id ? { ...b, is_approved: true } : b
      ));
    } catch (err) {
      setError("Onaylama işlemi başarısız oldu.");
    }
  };

  const handleRejectClick = (business) => {
    setSelectedBusiness(business);
    setOpenDialog(true);
  };

  const handleDetailsClick = (business) => {
    setDetailsBusiness(business);
    setDetailsOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedBusiness) return;
    try {
      await axios.delete(`${API_URL}/admin/businesses/${selectedBusiness.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBusinesses(businesses.filter(b => b.id !== selectedBusiness.id));
      setOpenDialog(false);
      setSelectedBusiness(null);
    } catch (err) {
      setError("Reddetme işlemi başarısız oldu.");
      setOpenDialog(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const pendingBusinesses = businesses.filter(b => !b.is_approved);
  const approvedBusinesses = businesses.filter(b => b.is_approved);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 4 }}>
        Yönetici Paneli
      </Typography>

      {/* PENDING APPROVALS */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #ffeebb', bgcolor: '#fffdf5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.dark' }}>
          <BusinessIcon /> Onay Bekleyen İşletmeler ({pendingBusinesses.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {pendingBusinesses.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>Şu an onay bekleyen başvuru yok.</Typography>
        ) : (
          <List>
            {pendingBusinesses.map(business => (
              <ListItem
                key={business.id}
                sx={{
                  bgcolor: 'white',
                  mb: 1,
                  borderRadius: 1,
                  border: '1px solid #eee',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                secondaryAction={
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleDetailsClick(business)}
                      sx={{ mr: 1 }}
                    >
                      Detaylar
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleApprove(business.id)}
                      sx={{ mr: 1 }}
                    >
                      Onayla
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={() => handleRejectClick(business)}
                    >
                      Reddet
                    </Button>
                  </Box>
                }
              >
                <ListItemText
                  primary={<Typography variant="subtitle1" fontWeight="bold">{business.name}</Typography>}
                  secondary={
                    <>
                      <Typography variant="body2" component="span" display="block">{business.address}</Typography>
                      <Typography variant="caption" color="text.secondary">Tel: {business.phone || 'Belirtilmemiş'}</Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* APPROVED BUSINESSES */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.dark' }}>
          <CheckCircleIcon /> Onaylı İşletmeler ({approvedBusinesses.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          {approvedBusinesses.map(business => (
            <ListItem
              key={business.id}
              divider
              secondaryAction={
                <Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleDetailsClick(business)}
                    sx={{ mr: 1 }}
                  >
                    Detaylar
                  </Button>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRejectClick(business)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={business.name}
                secondary={business.address}
              />
              <Chip label="Aktif" color="success" size="small" variant="outlined" sx={{ mr: 2 }} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* CONFIRMATION DIALOG */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>İşletmeyi Sil?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{selectedBusiness?.name}</strong> adlı işletmeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button onClick={handleConfirmReject} color="error" autoFocus>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAILS DIALOG */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {detailsBusiness?.name}
        </DialogTitle>
        <DialogContent dividers>
          {detailsBusiness && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Adres</Typography>
              <Typography paragraph>{detailsBusiness.address}</Typography>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>İletişim</Typography>
              <Typography paragraph>{detailsBusiness.phone || 'Belirtilmemiş'}</Typography>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Özellikler</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {detailsBusiness.has_wifi && <Chip label="Wi-Fi" color="primary" variant="outlined" size="small" />}
                {detailsBusiness.has_socket && <Chip label="Priz" color="primary" variant="outlined" size="small" />}
                {detailsBusiness.is_pet_friendly && <Chip label="Hayvan Dostu" color="primary" variant="outlined" size="small" />}
                {detailsBusiness.is_quiet && <Chip label="Sessiz" color="primary" variant="outlined" size="small" />}
                {detailsBusiness.serves_food && <Chip label="Yemek" color="primary" variant="outlined" size="small" />}
                {detailsBusiness.has_board_games && <Chip label="Oyun" color="primary" variant="outlined" size="small" />}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Kapat</Button>
          {!detailsBusiness?.is_approved && (
            <Button
              onClick={() => {
                handleApprove(detailsBusiness.id);
                setDetailsOpen(false);
              }}
              variant="contained"
              color="success"
            >
              Onayla
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default AdminPage;