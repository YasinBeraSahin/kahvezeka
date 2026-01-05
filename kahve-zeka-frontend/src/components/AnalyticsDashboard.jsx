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
    Area
} from 'recharts';
import axios from 'axios';
import { API_URL } from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import VisibilityIcon from '@mui/icons-material/Visibility';

const AnalyticsDashboard = ({ businessId }) => {
    const { token } = useAuth();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/analytics/${businessId}/stats?days=30`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
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

    if (stats.length === 0) {
        return <Typography align="center" sx={{ p: 4, color: 'text.secondary' }}>Henüz veri bulunmuyor.</Typography>;
    }

    // Toplamları hesapla
    const totalViews = stats.reduce((acc, curr) => acc + curr.views, 0);
    const totalClicks = stats.reduce((acc, curr) => acc + curr.clicks, 0);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                📊 İşletme İstatistikleri (Son 30 Gün)
            </Typography>

            {/* Özet Kartları */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                    <Card sx={{ bgcolor: '#e3f2fd', borderRadius: 3, boxShadow: 0 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Box sx={{ p: 1.5, bgcolor: '#bbdefb', borderRadius: 2, mr: 2 }}>
                                <VisibilityIcon color="primary" sx={{ fontSize: 32 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {totalViews}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Görüntülenme
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Card sx={{ bgcolor: '#fff3e0', borderRadius: 3, boxShadow: 0 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Box sx={{ p: 1.5, bgcolor: '#ffe0b2', borderRadius: 2, mr: 2 }}>
                                <TouchAppIcon color="warning" sx={{ fontSize: 32 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                                    {totalClicks}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Aksiyon Tıklamaları
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Grafik */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Görüntülenme & Etkileşim Grafiği
                </Typography>
                <Box sx={{ width: '100%', height: 400 }}>
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
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="views"
                                stroke="#2196f3"
                                fillOpacity={1}
                                fill="url(#colorViews)"
                                name="Görüntülenme"
                            />
                            <Area
                                type="monotone"
                                dataKey="clicks"
                                stroke="#ff9800"
                                fillOpacity={1}
                                fill="url(#colorClicks)"
                                name="Tıklamalar"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
        </Box>
    );
};

export default AnalyticsDashboard;
