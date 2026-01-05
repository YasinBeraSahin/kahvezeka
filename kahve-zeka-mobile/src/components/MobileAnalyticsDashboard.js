import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
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
                getBusinessStats(businessId, 7), // Son 7 gün mobilde daha iyi görünür
                getBusinessRatings(businessId)
            ]);

            setStats(statsData);
            setRatings(ratingsData);

            // Calculate totals
            const totalViews = statsData.reduce((acc, curr) => acc + curr.views, 0);
            const totalClicks = statsData.reduce((acc, curr) => acc + curr.clicks, 0);
            const totalAI = statsData.reduce((acc, curr) => acc + curr.ai_recommendations, 0);
            const totalFavs = statsData.reduce((acc, curr) => acc + curr.favorites_gained, 0);

            setSummary({ views: totalViews, clicks: totalClicks, ai: totalAI, favorites: totalFavs });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color={COLORS.primary} />;
    }

    // Chart Config
    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        color: (opacity = 1) => `rgba(106, 76, 51, ${opacity})`, // Primary Color
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false
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

            {/* Traffic Chart */}
            <Text style={styles.chartTitle}>Trafik (Son 7 Gün)</Text>
            <LineChart
                data={{
                    labels: stats.map(d => d.date.split('-')[2]), // Sadece gün
                    datasets: [
                        { data: stats.map(d => d.views), color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, strokeWidth: 2 },
                        { data: stats.map(d => d.clicks), color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`, strokeWidth: 2 }
                    ],
                    legend: ["Görüntülenme", "Tıklama"]
                }}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
            />

            {/* AI & Favorites Chart */}
            <Text style={styles.chartTitle}>Etkileşimler</Text>
            <BarChart
                data={{
                    labels: stats.map(d => d.date.split('-')[2]),
                    datasets: [
                        { data: stats.map(d => d.ai_recommendations) }
                    ]
                }}
                width={screenWidth - 32}
                height={220}
                yAxisLabel=""
                chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`
                }}
                style={styles.chart}
                showValuesOnTopOfBars
            />

            {/* Ratings Pie Chart */}
            <Text style={styles.chartTitle}>Puan Dağılımı</Text>
            <PieChart
                data={ratings.map((r, i) => ({
                    name: r.name,
                    population: r.value,
                    color: ['#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#f44336'][5 - parseInt(r.name[0])], // 5->Green, 1->Red logic sort of
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12
                }))}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
                style={styles.chart}
            />

            <View style={{ height: 50 }} />
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
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
        marginTop: 8
    },
    chart: {
        borderRadius: 16,
        paddingRight: 40, // fix for chart kit cut off
        marginVertical: 8,
        ...SHADOWS.light,
        backgroundColor: COLORS.surface
    }
});

export default MobileAnalyticsDashboard;
