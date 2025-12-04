// src/components/NearbyList.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const NearbyList = ({ businesses = [], onBusinessPress }) => {
    if (businesses.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Yakında mekan bulunamadı.</Text>
            </View>
        );
    }

    return (
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
                    {/* Görsel Alanı (Şimdilik İkon) */}
                    <View style={styles.imageContainer}>
                        <Ionicons name="cafe" size={40} color={COLORS.secondary} />
                    </View>

                    {/* Bilgi Alanı */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.businessName} numberOfLines={1}>
                            {item.business.name}
                        </Text>

                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color={COLORS.secondary} />
                            <Text style={styles.ratingText}>
                                {item.business.average_rating ? item.business.average_rating.toFixed(1) : '0.0'}
                            </Text>
                            <Text style={styles.distanceText}>
                                • {(item.distance_km || item.distance || 0).toFixed(1)} km
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
    },
    scrollContent: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.base,
        gap: SIZES.medium,
    },
    card: {
        width: 180,
        height: 160,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        ...SHADOWS.medium,
        justifyContent: 'space-between',
    },
    imageContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: SIZES.small,
    },
    infoContainer: {
        alignItems: 'center',
    },
    businessName: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: SIZES.small,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    distanceText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
});

export default NearbyList;
