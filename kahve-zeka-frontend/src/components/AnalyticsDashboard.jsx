import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    useTheme,
    Paper
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import axios from 'axios';
import { API_URL } from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FavoriteIcon from '@mui/icons-material/Favorite';

const AnalyticsDashboard = ({ businessId }) => {
    const { token } = useAuth();
    const [stats, setStats] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // İki veriyi paralel çekelim
                const [statsRes, ratingsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/analytics/${businessId}/stats?days=30`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_URL}/api/analytics/${businessId}/ratings`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setStats(statsRes.data);
                setRatings(ratingsRes.data);
            } catch (error) {
                console.error("Analiz verileri alınamadı:", error);
            } finally {
                setLoading(false);
            }
        };

        if (businessId) {
            fetchStats();
        }
    }, [businessId, token]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    // if (stats.length === 0) {
    //     return <Typography align="center" sx={{ p: 4, color: 'text.secondary' }}>Henüz veri bulunmuyor.</Typography>;
    // }

    // Toplamları hesapla
    const totalViews = stats.reduce((acc, curr) => acc + curr.views, 0);
    const totalClicks = stats.reduce((acc, curr) => acc + curr.clicks, 0);
    const totalAiRecs = stats.reduce((acc, curr) => acc + (curr.ai_recommendations || 0), 0);
    const totalFavs = stats.reduce((acc, curr) => acc + (curr.favorites_gained || 0), 0);

    const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884d8']; // 1 to 5 stars colors

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                📊 İşletme İstatistikleri (Son 30 Gün)
            </Typography>

            {/* Özet Kartları */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {/* Views */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#e3f2fd', borderRadius: 3, boxShadow: 0 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            <Box sx={{ p: 1, bgcolor: '#bbdefb', borderRadius: 2, mr: 2 }}>
                                <VisibilityIcon color="primary" />
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight="bold" color="primary.main">{totalViews}</Typography>
                                <Typography variant="caption" color="text.secondary">Görüntülenme</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Clicks */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#fff3e0', borderRadius: 3, boxShadow: 0 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            <Box sx={{ p: 1, bgcolor: '#ffe0b2', borderRadius: 2, mr: 2 }}>
                                <TouchAppIcon color="warning" />
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight="bold" color="#e65100">{totalClicks}</Typography>
                                <Typography variant="caption" color="text.secondary">Tıklanma</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                {/* AI Recs */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#f3e5f5', borderRadius: 3, boxShadow: 0 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            <Box sx={{ p: 1, bgcolor: '#e1bee7', borderRadius: 2, mr: 2 }}>
                                <SmartToyIcon color="secondary" />
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight="bold" color="secondary.main">{totalAiRecs}</Typography>
                                <Typography variant="caption" color="text.secondary">AI Önerisi</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Favorites */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#ffebee', borderRadius: 3, boxShadow: 0 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            <Box sx={{ p: 1, bgcolor: '#ffcdd2', borderRadius: 2, mr: 2 }}>
                                <FavoriteIcon color="error" />
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight="bold" color="error.main">{totalFavs}</Typography>
                                <Typography variant="caption" color="text.secondary">Yeni Favori</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Grafikler Row 1 */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            📈 Genel Trafik (Görüntülenme & Tıklanma)
                        </Typography>
                        <Box sx={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <AreaChart data={stats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#2196f3" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#bdbdbd" />
                                    <YAxis stroke="#bdbdbd" />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                                    <Area type="monotone" dataKey="views" stroke="#2196f3" fillOpacity={1} fill="url(#colorViews)" name="Görüntülenme" />
                                    <Area type="monotone" dataKey="clicks" stroke="#ff9800" fillOpacity={1} fill="url(#colorClicks)" name="Tıklamalar" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Grafikler Row 2 */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            🤖 AI ve Favori Etkileşimleri
                        </Typography>
                        <Box sx={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={stats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="date" stroke="#bdbdbd" />
                                    <YAxis stroke="#bdbdbd" />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8 }} />
                                    <Legend />
                                    <Bar dataKey="ai_recommendations" name="AI Önerisi" fill="#9c27b0" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="favorites_gained" name="Yeni Favori" fill="#e91e63" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            ⭐ Puan Dağılımı
                        </Typography>
                        <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
                            {ratings.length > 0 && ratings.some(r => r.value > 0) ? (
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={ratings}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label
                                        >
                                            {ratings.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Typography color="text.secondary">Henüz puanlama yok</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AnalyticsDashboard;
