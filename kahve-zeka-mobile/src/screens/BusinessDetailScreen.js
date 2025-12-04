import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBusinessDetail } from '../services/api';
import { THEME } from '../constants/theme';

// Tabs
import MenuTab from '../components/MenuTab';
import ReviewsTab from '../components/ReviewsTab';
import Campaigns from '../components/Campaigns';

const { width } = Dimensions.get('window');

const BusinessDetailScreen = ({ navigate, goBack, params }) => {
    const { businessId } = params || {};
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'reviews'

    useEffect(() => {
        loadBusinessDetails();
    }, [businessId]);

    const loadBusinessDetails = async () => {
        try {
            const data = await getBusinessDetail(businessId);
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
                <ActivityIndicator size="large" color={THEME.colors.primaryBrown} />
            </View>
        );
    }

    if (!business) {
        return (
            <View style={styles.errorContainer}>
                <Text>Mekan bilgileri yüklenemedi.</Text>
                <TouchableOpacity onPress={goBack} style={styles.backButtonSimple}>
                    <Text style={styles.backButtonText}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
                {/* Header Image & Info */}
                <View style={styles.headerContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
                        style={styles.coverImage}
                    />
                    <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.infoContainer}>
                        <Text style={styles.businessName}>{business.name}</Text>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color={THEME.colors.warning} />
                            <Text style={styles.ratingText}>{business.average_rating?.toFixed(1) || '0.0'}</Text>
                            <Text style={styles.reviewCount}>({business.review_count || 0} yorum)</Text>
                        </View>
                        <Text style={styles.address} numberOfLines={2}>
                            <Ionicons name="location-outline" size={14} /> {business.address}
                        </Text>
                    </View>
                </View>

                {/* Campaigns */}
                <View style={{ marginTop: 20 }}>
                    <Campaigns campaigns={business.campaigns} />
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
                        style={[styles.tabButton, activeTab === 'reviews' && styles.activeTabButton]}
                        onPress={() => setActiveTab('reviews')}
                    >
                        <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>Yorumlar</Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <View style={styles.contentContainer}>
                    {activeTab === 'menu' ? (
                        <MenuTab business={business} />
                    ) : (
                        <ReviewsTab
                            businessId={business.id}
                            reviews={business.reviews}
                            navigate={navigate}
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
        backgroundColor: THEME.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: 250,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonSimple: {
        marginTop: 20,
        padding: 10,
        backgroundColor: THEME.colors.primaryBrown,
        borderRadius: 5,
    },
    backButtonText: {
        color: '#fff',
    },
    infoContainer: {
        padding: THEME.spacing.lg,
        backgroundColor: THEME.colors.cardBackground,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
        ...THEME.shadows.medium,
    },
    businessName: {
        ...THEME.typography.h1,
        marginBottom: THEME.spacing.xs,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: THEME.spacing.sm,
    },
    ratingText: {
        ...THEME.typography.h3,
        marginLeft: 4,
        marginRight: 4,
    },
    reviewCount: {
        ...THEME.typography.caption,
        color: THEME.colors.textSecondary,
    },
    address: {
        ...THEME.typography.body,
        color: THEME.colors.textSecondary,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.cardBackground,
        paddingHorizontal: THEME.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.border,
        ...THEME.shadows.small,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabButton: {
        borderBottomColor: THEME.colors.primaryBrown,
    },
    tabText: {
        ...THEME.typography.h3,
        color: THEME.colors.textSecondary,
    },
    activeTabText: {
        color: THEME.colors.primaryBrown,
    },
    contentContainer: {
        padding: THEME.spacing.lg,
        minHeight: 400,
    },
});

export default BusinessDetailScreen;
