// src/components/Campaigns.js
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const Campaigns = ({ campaigns = [] }) => {
    if (!campaigns || campaigns.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aktif kampanya bulunmuyor.</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <Ionicons name="pricetag" size={24} color={COLORS.surface} />
            </View>
            <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.date}>Son Gün: {new Date(item.end_date).toLocaleDateString('tr-TR')}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={campaigns}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false} // Dikey scroll parent'ta
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SIZES.medium,
    },
    emptyContainer: {
        padding: SIZES.large,
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        ...SHADOWS.light,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.font,
    },
    listContent: {
        gap: SIZES.medium,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary, // Koyu kahve arka plan
        borderRadius: SIZES.radius,
        padding: SIZES.medium,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.medium,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.secondary, // Altın sarısı başlık
        marginBottom: 4,
    },
    description: {
        fontSize: SIZES.small,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 6,
    },
    date: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        fontStyle: 'italic',
    },
});

export default Campaigns;
