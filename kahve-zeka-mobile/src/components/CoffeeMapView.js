import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

const CoffeeMapView = ({
    userLocation,
    businesses = [],
    radius = 5,
    onBusinessPress
}) => {
    if (!userLocation) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.placeholder}>
                <Ionicons name="map-outline" size={80} color={THEME.colors.primaryBrown} />
                <Text style={styles.title}>Harita Görünümü</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Ionicons name="cafe" size={24} color={THEME.colors.lightCoffee} />
                        <Text style={styles.statNumber}>{businesses.length}</Text>
                        <Text style={styles.statLabel}>Mekan</Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statBox}>
                        <Ionicons name="location" size={24} color={THEME.colors.lightCoffee} />
                        <Text style={styles.statNumber}>{radius} km</Text>
                        <Text style={styles.statLabel}>Yarıçap</Text>
                    </View>
                </View>

                {businesses.length > 0 && (
                    <ScrollView
                        style={styles.businessList}
                        showsVerticalScrollIndicator={false}
                    >
                        {businesses.slice(0, 3).map((item, index) => {
                            const distance = item.distance_km || item.distance || 0;
                            return (
                                <View key={item.business.id} style={styles.businessItem}>
                                    <View style={styles.businessIcon}>
                                        <Ionicons name="cafe" size={16} color="#fff" />
                                    </View>
                                    <View style={styles.businessInfo}>
                                        <Text style={styles.businessName} numberOfLines={1}>
                                            {item.business.name}
                                        </Text>
                                        <Text style={styles.businessDistance}>
                                            {distance.toFixed(2)} km uzaklıkta
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                        {businesses.length > 3 && (
                            <Text style={styles.moreText}>
                                +{businesses.length - 3} mekan daha
                            </Text>
                        )}
                    </ScrollView>
                )}

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color={THEME.colors.textLight} />
                    <Text style={styles.infoText}>
                        Harita özelliği için yeni build gereklidir
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 400,
        backgroundColor: THEME.colors.background,
        marginHorizontal: THEME.spacing.md,
        marginVertical: THEME.spacing.sm,
    },
    placeholder: {
        flex: 1,
        backgroundColor: THEME.colors.cardBackground,
        borderRadius: THEME.borderRadius.medium,
        padding: THEME.spacing.lg,
        ...THEME.shadows.small,
        alignItems: 'center',
    },
    title: {
        ...THEME.typography.h2,
        marginTop: THEME.spacing.md,
        marginBottom: THEME.spacing.lg,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: THEME.spacing.lg,
        paddingHorizontal: THEME.spacing.lg,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 50,
        backgroundColor: THEME.colors.textLight,
        opacity: 0.2,
        marginHorizontal: THEME.spacing.md,
    },
    statNumber: {
        ...THEME.typography.h2,
        color: THEME.colors.primaryBrown,
        marginTop: THEME.spacing.xs,
    },
    statLabel: {
        ...THEME.typography.caption,
        color: THEME.colors.textSecondary,
        marginTop: THEME.spacing.xs,
    },
    businessList: {
        width: '100%',
        maxHeight: 150,
    },
    businessItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.background,
        padding: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.small,
        marginBottom: THEME.spacing.xs,
    },
    businessIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: THEME.colors.primaryBrown,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: THEME.spacing.sm,
    },
    businessInfo: {
        flex: 1,
    },
    businessName: {
        ...THEME.typography.body,
        fontWeight: '600',
        marginBottom: 2,
    },
    businessDistance: {
        ...THEME.typography.caption,
        color: THEME.colors.textSecondary,
    },
    moreText: {
        ...THEME.typography.caption,
        color: THEME.colors.textSecondary,
        textAlign: 'center',
        marginTop: THEME.spacing.xs,
        fontStyle: 'italic',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.background,
        padding: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.small,
        marginTop: THEME.spacing.md,
    },
    infoText: {
        ...THEME.typography.caption,
        color: THEME.colors.textLight,
        marginLeft: THEME.spacing.xs,
        flex: 1,
    },
});

export default CoffeeMapView;
