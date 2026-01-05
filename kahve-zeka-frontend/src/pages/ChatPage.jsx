import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../apiConfig';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    TextField,
    Button,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Avatar,
    Container,
    CircularProgress,
    IconButton,
    Card,
    CardContent,
    Grid,
    Chip,
    Drawer,
    Divider,
    useMediaQuery,
    useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';

function ChatPage() {
    const { token } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Chat Geçmişi State'leri
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const listRef = useRef(null);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const scrollToBottom = () => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Oturumları Getir
    const fetchSessions = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/chat/sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(response.data);
        } catch (error) {
            console.error("Geçmiş getirilemedi:", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchSessions();
        }
    }, [token]);

    // Yeni Oturum Başlat
    const handleNewChat = () => {
        setMessages([
            { id: 'intro', text: "Merhaba! Bugün nasıl hissediyorsun? Sana mükemmel kahveyi bulmanda yardımcı olabilirim. ☕️", sender: 'bot' }
        ]);
        setCurrentSessionId(null);
        if (isMobile) setDrawerOpen(false);
    };

    // Oturum Seç
    const handleSelectSession = async (sessionId) => {
        setLoading(true);
        setCurrentSessionId(sessionId);
        if (isMobile) setDrawerOpen(false);

        try {
            const response = await axios.get(`${API_URL}/api/chat/sessions/${sessionId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.error("Mesajlar yüklenemedi:", error);
            // Hata durumunda boş liste veya hata mesajı
        } finally {
            setLoading(false);
        }
    };

    // Mesaj Gönder
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input;
        setInput('');

        // Optimistic UI Update (Kullanıcı mesajını hemen göster)
        const tempUserMsg = { id: Date.now(), text: userText, sender: 'user' };
        setMessages(prev => [...prev, tempUserMsg]);
        setLoading(true);

        try {
            // Konum al
            let location = { latitude: null, longitude: null };
            if (navigator.geolocation) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                } catch (geoError) {
                    // Konum alınamazsa devam et
                }
            }

            let sessionId = currentSessionId;

            // Eğer aktif oturum yoksa oluştur
            if (!sessionId) {
                const sessionRes = await axios.post(`${API_URL}/api/chat/sessions`,
                    { title: userText.substring(0, 30) },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                sessionId = sessionRes.data.id;
                setCurrentSessionId(sessionId);
                // Listeyi güncelle ki yeni oturum solda gözüksün
                fetchSessions();
            }

            // Mesajı API'ye gönder (Stateful endpoint)
            const response = await axios.post(`${API_URL}/api/chat/sessions/${sessionId}/message`, {
                message: userText,
                latitude: location.latitude,
                longitude: location.longitude
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Yanıtı işle (Backend'den dönen yapı standart analyze cevabı)
            // Ancak biz kaydettiklerimizi backend'den tekrar çekmek yerine
            // dönen cevabı UI'da gösterebiliriz.
            // Fakat en temizi mesajları tekrar çekmek veya manuel oluşturmak.
            // Manuel oluşturalım (Hız için):

            const data = response.data;
            const emotion = data.emotion_category;
            const recs = data.recommendations;
            const matchingProducts = data.matching_products || [];

            // Bot'un giriş mesajı
            let introText = data.thought_process || `Seni "${emotion}" hissettim.`;

            const botIntroMessage = {
                id: Date.now() + 1,
                text: introText,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botIntroMessage]);

            if (recs && recs.length > 0) {
                const botRecsMessage = {
                    id: Date.now() + 2,
                    sender: 'bot',
                    isRecommendation: true,
                    recommendations: recs
                };
                setMessages(prev => [...prev, botRecsMessage]);
            }

            if (matchingProducts.length > 0) {
                const botProductsMessage = {
                    id: Date.now() + 3,
                    sender: 'bot',
                    isProductList: true,
                    products: matchingProducts
                };
                setMessages(prev => [...prev, botProductsMessage]);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage = { id: Date.now(), text: "Bir hata oluştu. Lütfen tekrar deneyin.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    // Kenar Çubuğu İçeriği
    const drawerContent = (
        <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fa', borderRight: '1px solid #ddd' }}>
            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNewChat}
                    sx={{ borderRadius: 2, height: 48, fontWeight: 'bold' }}
                >
                    Yeni Sohbet
                </Button>
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1, overflow: 'auto', px: 1 }}>
                {sessions.map((session) => (
                    <ListItemButton
                        key={session.id}
                        onClick={() => handleSelectSession(session.id)}
                        selected={currentSessionId === session.id}
                        sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            '&.Mui-selected': { bgcolor: 'rgba(255, 112, 67, 0.1)', color: 'primary.main', borderLeft: '4px solid #ff7043' }
                        }}
                    >
                        <HistoryIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                        <ListItemText
                            primary={session.title || "Adsız Sohbet"}
                            primaryTypographyProps={{ noWrap: true, fontSize: '0.9rem' }}
                            secondary={new Date(session.created_at).toLocaleDateString("tr-TR")}
                            secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                    </ListItemButton>
                ))}
                {sessions.length === 0 && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                        Henüz sohbet geçmişi yok.
                    </Typography>
                )}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            {/* Masaüstü Sidebar */}
            {!isMobile && drawerContent}

            {/* Mobil Drawer */}
            <Drawer
                variant="temporary"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Ana Chat Alanı */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

                {/* Mobil için Menü Butonu */}
                {isMobile && (
                    <Box sx={{ p: 1, display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                        <IconButton onClick={() => setDrawerOpen(true)}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'bold' }}>
                            {currentSessionId ? sessions.find(s => s.id === currentSessionId)?.title : "Yeni Sohbet"}
                        </Typography>
                    </Box>
                )}

                {/* Mesaj Listesi */}
                <Box
                    sx={{
                        flexGrow: 1,
                        bgcolor: '#fff',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <List
                        ref={listRef}
                        sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        {messages.map((msg, index) => (
                            <ListItem
                                key={msg.id || index}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    p: 0,
                                    width: '100%'
                                }}
                            >
                                {/* Standart Mesaj Balonu */}
                                {(!msg.isRecommendation && !msg.isProductList) && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                                            maxWidth: '85%'
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: msg.sender === 'user' ? 'primary.main' : '#f0f0f0',
                                                color: msg.sender === 'user' ? 'white' : 'secondary.main',
                                            }}
                                        >
                                            {msg.sender === 'user' ? <PersonIcon fontSize="small" /> : <LocalCafeIcon fontSize="small" />}
                                        </Avatar>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                bgcolor: msg.sender === 'user' ? 'primary.main' : '#f5f5f5',
                                                color: msg.sender === 'user' ? 'white' : 'text.primary',
                                                borderTopLeftRadius: msg.sender === 'bot' ? 0 : 3,
                                                borderTopRightRadius: msg.sender === 'user' ? 0 : 3
                                            }}
                                        >
                                            <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>{msg.text}</Typography>
                                        </Paper>
                                    </Box>
                                )}

                                {/* Öneri Kartları (Sadece Bot için) */}
                                {msg.isRecommendation && msg.recommendations && msg.recommendations.length > 0 && (
                                    <Box sx={{ width: '100%', pl: 6, mt: 1 }}>
                                        <Grid container spacing={2}>
                                            {msg.recommendations.map((rec, index) => (
                                                <Grid item xs={12} sm={6} md={4} key={index}>
                                                    <Card sx={{
                                                        height: '100%',
                                                        borderRadius: 3,
                                                        borderLeft: '5px solid #ff7043',
                                                        bgcolor: '#fff9f5'
                                                    }}>
                                                        <CardContent>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                                                                <LocalCafeIcon color="error" fontSize="small" />
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                                    {rec.title}
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', fontSize: '1rem' }}>
                                                                {rec.coffee}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {rec.description}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                                {/* Ürün Listesi */}
                                {msg.isProductList && msg.products && msg.products.length > 0 && (
                                    <Box sx={{ width: '100%', pl: 6, mt: 1 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                                            📍 Size En Yakın Lezzetler
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {msg.products.map((prod, index) => (
                                                <Grid item xs={12} sm={6} md={4} key={index}>
                                                    <Card sx={{
                                                        height: '100%',
                                                        borderRadius: 3,
                                                        cursor: 'pointer',
                                                        transition: '0.2s',
                                                        '&:hover': { bgcolor: '#f0f0f0' },
                                                        border: '1px solid #e0e0e0'
                                                    }}
                                                        onClick={() => navigate(`/business/${prod.business_id}`)}
                                                    >
                                                        <CardContent sx={{ p: '16px !important' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                                    {prod.name}
                                                                </Typography>
                                                                <Chip label={`${prod.price} ₺`} size="small" color="primary" variant="outlined" />
                                                            </Box>
                                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                                {prod.business_name} ({prod.distance ? (prod.distance < 1 ? `${Math.round(prod.distance * 1000)}m` : `${prod.distance.toFixed(1)} km`) : ''})
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}
                            </ListItem>
                        ))}
                        {loading && (
                            <ListItem sx={{ justifyContent: 'flex-start', pl: 6 }}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: '#f5f5f5', p: 1, borderRadius: 2 }}>
                                    <CircularProgress size={16} />
                                    <Typography variant="caption" color="text.secondary">Kahve Zeka düşünüyor...</Typography>
                                </Box>
                            </ListItem>
                        )}
                    </List>

                    {/* Mesaj Girdisi */}
                    <Box component="form" onSubmit={handleSend} sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee' }}>
                        <TextField
                            fullWidth
                            placeholder={currentSessionId ? "Sohbete devam et..." : "Yeni bir şeyler sor..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <IconButton type="submit" disabled={!input.trim() || loading} color="primary">
                                        <SendIcon />
                                    </IconButton>
                                ),
                                sx: { borderRadius: 4, bgcolor: '#f8f9fa' }
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default ChatPage;
