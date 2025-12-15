import { useState, useEffect, useRef } from 'react';
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
    ListItemText,
    Avatar,
    Container,
    CircularProgress,
    IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

function ChatPage() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Merhaba! Bugün nasıl hissediyorsun? Sana mükemmel kahveyi bulmanda yardımcı olabilirim. ☕️", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
            const botResponseText = `${data.recommendation} öneriyorum!\n\n${data.reason}`;
            const botMessage = { id: Date.now() + 1, text: botResponseText, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage = { id: Date.now() + 1, text: "Üzgünüm, şu an bir hata oluştu.", sender: 'bot' };
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
                        <SmartToyIcon />
                    </Avatar>
                    <Typography variant="h6" color="primary">Kahve Zeka Asistanı</Typography>
                </Box>

                <List sx={{ flexGrow: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {messages.map((msg) => (
                        <ListItem
                            key={msg.id}
                            sx={{
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                p: 0
                            }}
                        >
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
                                    {msg.sender === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
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
                    <div ref={messagesEndRef} />
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
        </Container>
    );
}

export default ChatPage;
