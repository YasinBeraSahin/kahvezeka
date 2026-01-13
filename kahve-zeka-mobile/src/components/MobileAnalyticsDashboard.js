import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { getBusinessStats, getBusinessRatings } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const MobileAnalyticsDashboard = ({ businessId }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [summary, setSummary] = useState({ views: 0, clicks: 0, ai: 0, favorites: 0 });

    useEffect(() => {
        loadData();
    }, [businessId]);

    const loadData = async () => {
        try {
            const [statsData, ratingsData] = await Promise.all([
                getBusinessStats(businessId, 7),
                getBusinessRatings(businessId)
            ]);

            setStats(statsData || []);
            setRatings(ratingsData || []);

            if (statsData) {
                const totalViews = statsData.reduce((acc, curr) => acc + curr.views, 0);
                const totalClicks = statsData.reduce((acc, curr) => acc + curr.clicks, 0);
                const totalAI = statsData.reduce((acc, curr) => acc + curr.ai_recommendations, 0);
                const totalFavs = statsData.reduce((acc, curr) => acc + curr.favorites_gained, 0);
                setSummary({ views: totalViews, clicks: totalClicks, ai: totalAI, favorites: totalFavs });
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color={COLORS.primary} />;
    }

    // Chart.js HTML Content
    const generateHtml = () => {
        const labels = stats.map(d => `"${d.date.split('-')[2]}"`).join(',');
        const views = stats.map(d => d.views).join(',');
        const clicks = stats.map(d => d.clicks).join(',');
        const aiRecs = stats.map(d => d.ai_recommendations).join(',');

        const ratingLabels = ratings.map(r => `"${r.name}"`).join(',');
        const ratingValues = ratings.map(r => r.value).join(',');
        const ratingColors = ratings.map(r => {
            const val = parseInt(r.name[0]);
            return val >= 4 ? "'#4caf50'" : val === 3 ? "'#ffeb3b'" : "'#f44336'";
        }).join(',');

        return `
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 10px; background-color: #f5f5f5; }
                .chart-container { background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
                h2 { font-size: 16px; color: #333; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="chart-container">
                <h2>Trafik (Son 7 Gün)</h2>
                <canvas id="trafficChart"></canvas>
            </div>
            <div class="chart-container">
                <h2>Yapay Zeka Etkileşimi</h2>
                <canvas id="aiChart"></canvas>
            </div>
             <div class="chart-container">
                <h2>Puan Dağılımı</h2>
                <canvas id="ratingChart"></canvas>
            </div>
            <script>
                // Traffic Chart
                new Chart(document.getElementById('trafficChart'), {
                    type: 'line',
                    data: {
                        labels: [${labels}],
                        datasets: [
                            { label: 'Görüntülenme', data: [${views}], borderColor: '#2196f3', tension: 0.4 },
                            { label: 'Tıklama', data: [${clicks}], borderColor: '#ff9800', tension: 0.4 }
                        ]
                    },
                    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
                });

                // AI Chart
                new Chart(document.getElementById('aiChart'), {
                    type: 'bar',
                    data: {
                        labels: [${labels}],
                        datasets: [{ label: 'AI Önerisi', data: [${aiRecs}], backgroundColor: '#9c27b0' }]
                    },
                     options: { responsive: true, plugins: { legend: { display: false } } }
                });
                
                // Rating Chart
                 new Chart(document.getElementById('ratingChart'), {
                    type: 'doughnut',
                    data: {
                        labels: [${ratingLabels}],
                        datasets: [{ data: [${ratingValues}], backgroundColor: [${ratingColors}] }]
                    },
                     options: { responsive: true, plugins: { legend: { position: 'right' } } }
                });
            </script>
        </body>
        </html>
        `;
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
                <SummaryCard icon="eye" value={summary.views} label="Görüntülenme" color="#2196f3" />
                <SummaryCard icon="finger-print" value={summary.clicks} label="Tıklama" color="#ff9800" />
                <SummaryCard icon="sparkles" value={summary.ai} label="AI Önerisi" color="#9c27b0" />
                <SummaryCard icon="heart" value={summary.favorites} label="Yeni Favori" color="#e91e63" />
            </View>

            {/* WebView Charts */}
            <View style={{ height: 900 }}>
                <WebView
                    originWhitelist={['*']}
                    source={{ html: generateHtml() }}
                    style={{ backgroundColor: 'transparent' }}
                    scrollEnabled={false}
                />
            </View>
        </ScrollView>
    );
};

const SummaryCard = ({ icon, value, label, color }) => (
    <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    card: {
        width: (screenWidth - 44) / 2,
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        ...SHADOWS.light,
        alignItems: 'center'
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    cardValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text
    },
    cardLabel: {
        fontSize: 12,
        color: COLORS.textSecondary
    }
});

export default MobileAnalyticsDashboard;
