import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

const NearbyList = ({ businesses = [], onBusinessPress }) => {
    if (businesses.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Yakındakiler ({businesses.length})</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {businesses.map((item) => (
                    <TouchableOpacity
                        key={item.business.id}
                        style={styles.card}
                        onPress={() => onBusinessPress && onBusinessPress(item.business)}
                    >
                        {/* Coffee Icon */}
                        <View style={styles.iconContainer}>
                            <Ionicons name="cafe" size={32} color={THEME.colors.primaryBrown} />
                        </View>

                        {/* Business Name */}
                        <Text style={styles.businessName} numberOfLines={1}>
                            {item.business.name}
                        </Text>

                        {/* Rating & Distance */}
                        <View style={styles.infoRow}>
                            <View style={styles.rating}>
                                <Ionicons name="star" size={14} color={THEME.colors.lightCoffee} />
                                <Text style={styles.ratingText}>
                                    {item.business.average_rating ? item.business.average_rating.toFixed(1) : '0.0'}
                                </Text>
                            </View>
                            <Text style={styles.distance}>• {(item.distance_km || item.distance || 0).toFixed(2)} km</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: THEME.colors.background,
        paddingVertical: THEME.spacing.md,
    },
    header: {
        paddingHorizontal: THEME.spacing.md,
        marginBottom: THEME.spacing.sm,
    },
    title: {
        ...THEME.typography.h3,
    },
    scrollContent: {
        paddingHorizontal: THEME.spacing.md,
        gap: THEME.spacing.md,
    },
    card: {
        width: 160,
        backgroundColor: THEME.colors.cardBackground,
        borderRadius: THEME.borderRadius.medium,
        padding: THEME.spacing.md,
        ...THEME.shadows.small,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: THEME.spacing.sm,
    },
    businessName: {
        ...THEME.typography.body,
        fontWeight: '600',
        color: THEME.colors.lightCoffee,
        marginBottom: THEME.spacing.xs,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        ...THEME.typography.small,
        fontWeight: '600',
    },
    distance: {
        ...THEME.typography.small,
        marginLeft: 4,
    },
});

export default NearbyList;
