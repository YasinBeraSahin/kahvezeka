import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

const Campaigns = ({ campaigns = [] }) => {
    if (!campaigns || campaigns.length === 0) {
        return null;
    }

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <Ionicons name="pricetag" size={24} color="#fff" />
            </View>
            <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.date}>Son Gün: {new Date(item.end_date).toLocaleDateString('tr-TR')}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Kampanyalar</Text>
            <FlatList
                data={campaigns}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: THEME.spacing.lg,
    },
    headerTitle: {
        ...THEME.typography.h3,
        marginBottom: THEME.spacing.sm,
        paddingHorizontal: THEME.spacing.lg,
    },
    listContent: {
        paddingHorizontal: THEME.spacing.lg,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.primaryBrown,
        borderRadius: THEME.borderRadius.medium,
        padding: THEME.spacing.md,
        marginRight: THEME.spacing.md,
        width: 280,
        alignItems: 'center',
        ...THEME.shadows.small,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: THEME.spacing.md,
    },
    info: {
        flex: 1,
    },
    title: {
        ...THEME.typography.h3,
        color: '#fff',
        marginBottom: 2,
    },
    description: {
        ...THEME.typography.caption,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
    },
    date: {
        ...THEME.typography.caption,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
    },
});

export default Campaigns;
