// src/screens/BusinessDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBusinessDetail, addFavorite, removeFavorite, getFavorites } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import StarRating from '../components/StarRating';

// Tabs
import MenuTab from '../components/MenuTab';
import ReviewsTab from '../components/ReviewsTab';
import Campaigns from '../components/Campaigns';

const { width } = Dimensions.get('window');

const BusinessDetailScreen = ({ navigation, route }) => {
    const { businessId } = route.params || {};
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'reviews', 'campaigns'
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        loadBusinessDetails();
        checkFavoriteStatus();
    }, [businessId]);

    const checkFavoriteStatus = async () => {
        try {
            const favorites = await getFavorites();
            const isFav = favorites.some(fav => fav.id === businessId);
            setIsFavorite(isFav);
        } catch (error) {
            console.log('Favori kontrolü hatası:', error);
        }
    };

    const handleToggleFavorite = async () => {
        try {
            if (isFavorite) {
                await removeFavorite(businessId);
                setIsFavorite(false);
            } else {
                await addFavorite(businessId);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Favori işlem hatası:', error);
            // Alert import edilmemişse console.log yeterli, ama kullanıcıya bildirim vermek iyi olur
        }
    };

    const loadBusinessDetails = async () => {
        try {
            const data = await getBusinessDetail(businessId);

            // Backend fix yayında olmadığı için client-side hesaplama yapıyoruz
            if (data.reviews && data.reviews.length > 0) {
                const totalRating = data.reviews.reduce((sum, review) => sum + review.rating, 0);
                data.average_rating = totalRating / data.reviews.length;
                data.review_count = data.reviews.length;
            }

            setBusiness(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!business) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Mekan bilgileri yüklenemedi.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonSimple}>
                    <Text style={styles.backButtonText}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
                {/* Header Image & Info */}
                <View style={styles.headerContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
                        style={styles.coverImage}
                    />
                    <View style={styles.overlay} />

                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.surface} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
                        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? COLORS.error : COLORS.surface} />
                    </TouchableOpacity>

                    <View style={styles.infoContainer}>
                        <Text style={styles.businessName}>{business.name}</Text>
                        <View style={styles.ratingContainer}>
                            <View style={styles.ratingBadge}>
                                <Text style={styles.ratingText}>{business.average_rating?.toFixed(1) || '0.0'}</Text>
                            </View>
                            <StarRating rating={business.average_rating || 0} size={18} />
                            <Text style={styles.reviewCount}>({business.review_count || 0} yorum)</Text>
                        </View>
                        <Text style={styles.address} numberOfLines={2}>
                            <Ionicons name="location-outline" size={16} color={COLORS.secondary} /> {business.address}
                        </Text>
                    </View>
                </View>

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'menu' && styles.activeTabButton]}
                        onPress={() => setActiveTab('menu')}
                    >
                        <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>Menü</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'campaigns' && styles.activeTabButton]}
                        onPress={() => setActiveTab('campaigns')}
                    >
                        <Text style={[styles.tabText, activeTab === 'campaigns' && styles.activeTabText]}>Kampanyalar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'reviews' && styles.activeTabButton]}
                        onPress={() => setActiveTab('reviews')}
                    >
                        <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>Yorumlar</Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <View style={styles.contentContainer}>
                    {activeTab === 'menu' && <MenuTab business={business} />}
                    {activeTab === 'campaigns' && <Campaigns campaigns={business.campaigns} />}
                    {activeTab === 'reviews' && (
                        <ReviewsTab
                            businessId={business.id}
                            reviews={business.reviews}
                            navigation={navigation}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    errorText: {
        color: COLORS.text,
        marginBottom: SIZES.medium,
    },
    headerContainer: {
        position: 'relative',
        height: 300,
        justifyContent: 'flex-end',
    },
    coverImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))', // React Native'de bu çalışmaz, aşağıda alternatif var
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    favoriteButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    backButtonSimple: {
        padding: SIZES.medium,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius,
    },
    backButtonText: {
        color: COLORS.surface,
        fontWeight: 'bold',
    },
    infoContainer: {
        padding: SIZES.padding,
        paddingBottom: SIZES.padding * 2, // Tab bar'ın altına girmemesi için
        backgroundColor: 'rgba(0,0,0,0.6)', // Hafif karartma
        width: '100%',
    },
    businessName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.surface,
        marginBottom: SIZES.base,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.base,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    ratingText: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: SIZES.font,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    address: {
        fontSize: SIZES.font,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        paddingHorizontal: SIZES.medium,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        ...SHADOWS.small,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTabButton: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    activeTabText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    contentContainer: {
        padding: SIZES.padding,
        minHeight: 500,
        backgroundColor: COLORS.background,
    },
});

export default BusinessDetailScreen;
