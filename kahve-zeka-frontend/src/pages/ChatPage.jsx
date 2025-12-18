import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../apiConfig';
import axios from 'axios';
import {
    Box,
    TextField,
    Button,
    Paper,
    Typography,
    List,
    ListItem,
    Avatar,
    Container,
    CircularProgress,
    IconButton,
    Card,
    CardContent,
    Grid,
    Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import PersonIcon from '@mui/icons-material/Person';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';

function ChatPage() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Merhaba! Bugün nasıl hissediyorsun? Sana mükemmel kahveyi bulmanda yardımcı olabilirim. ☕️", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const listRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/chat/recommend`, {
                message: userMessage.text
            });

            const data = response.data;
            const emotion = data.emotion_category;
            const recs = data.recommendations;
            const matchingProducts = data.matching_products || [];

            // Bot'un giriş mesajı (Duygu tespiti)
            let introText = `Seni "${emotion}" hissettim. İşte sana özel önerilerim:`;

            if (emotion === "Belirsiz") {
                introText = "Yazdıklarınızdan belirli bir duygu çıkaramadım. Alakasız veya nötr bir durum gibi görünüyor. Lütfen hislerinizi daha açık ifade eder misiniz?";
            }

            const botIntroMessage = {
                id: Date.now() + 1,
                text: introText,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botIntroMessage]);

            // Önerileri kart olarak göstermek için özel mesaj tipi
            if (recs && recs.length > 0) {
                const botRecsMessage = {
                    id: Date.now() + 2,
                    sender: 'bot',
                    isRecommendation: true,
                    recommendations: recs
                };
                setMessages(prev => [...prev, botRecsMessage]);
            }

            // Gerçek ürünleri göster
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
            const errorMessage = { id: Date.now() + 1, text: "Üzgünüm, şu an bağlantı kuramıyorum. Biraz sonra tekrar dener misin?", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4, height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: '#f5f5f5'
                }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <LocalCafeIcon />
                    </Avatar>
                    <Typography variant="h6" color="primary">Kahvelog</Typography>
                </Box>

                <List
                    ref={listRef}
                    sx={{ flexGrow: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    {messages.map((msg) => (
                        <ListItem
                            key={msg.id}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                p: 0,
                                width: '100%'
                            }}
                        >
                            {/* Standart Mesaj Balonu */}
                            {(!msg.isRecommendation) && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 1,
                                        flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                                        maxWidth: '80%'
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
                                            color: msg.sender === 'user' ? 'white' : 'secondary.main',
                                            boxShadow: 1
                                        }}
                                    >
                                        {msg.sender === 'user' ? <PersonIcon fontSize="small" /> : <LocalCafeIcon fontSize="small" />}
                                    </Avatar>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
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
                                                    transition: '0.3s',
                                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                                                    borderLeft: '5px solid #ff7043' // Secondary Color accent
                                                }}>
                                                    <CardContent>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                                                            <LocalCafeIcon color="primary" />
                                                            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                                                {rec.title}
                                                            </Typography>
                                                        </Box>

                                                        <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
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

                            {/* Ürün Listesi (Sadece Bot için) */}
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
                                                    transition: '0.3s',
                                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                                                    border: '1px solid #e0e0e0'
                                                }}
                                                    onClick={() => navigate(`/business/${prod.business_id}`)}
                                                >
                                                    <CardContent>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                                                {prod.name}
                                                            </Typography>
                                                            <Chip label={`${prod.price} ₺`} color="primary" size="small" variant="outlined" />
                                                        </Box>

                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <LocalCafeIcon fontSize="inherit" />
                                                            {prod.business_name}
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
                        <ListItem sx={{ justifyContent: 'flex-start' }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 5 }}>
                                <CircularProgress size={16} />
                                <Typography variant="caption" color="text.secondary">Yazıyor...</Typography>
                            </Box>
                        </ListItem>
                    )}
                </List>

                <Box
                    component="form"
                    onSubmit={handleSend}
                    sx={{
                        p: 2,
                        borderTop: '1px solid #e0e0e0',
                        bgcolor: 'white',
                        display: 'flex',
                        gap: 1
                    }}
                >
                    <TextField
                        fullWidth
                        placeholder="Bugün nasıl hissediyorsun?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        variant="outlined"
                        size="medium"
                        InputProps={{ sx: { borderRadius: 3 } }}
                        disabled={loading}
                    />
                    <IconButton
                        type="submit"
                        color="primary"
                        size="large"
                        disabled={loading || !input.trim()}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                            width: 50,
                            height: 50
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Paper>
        </Container >
    );
}

export default ChatPage;
