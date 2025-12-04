// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { THEME, COLORS, SIZES, SHADOWS } from '../constants/theme';
import { getUserReviews, getFavorites } from '../services/api';

const ProfileScreen = ({ navigation }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);
    const [activeTab, setActiveTab] = useState('reviews'); // 'reviews', 'favorites', 'settings'

    useEffect(() => {
        if (isAuthenticated) {
            loadUserReviews();
            loadFavorites();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (activeTab === 'favorites' && isAuthenticated) {
            loadFavorites();
        }
    }, [activeTab]);

    const loadUserReviews = async () => {
        setLoadingReviews(true);
        try {
            const data = await getUserReviews();
            setReviews(data);
        } catch (error) {
            console.error('Kullanıcı yorumları yüklenemedi:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const loadFavorites = async () => {
        setLoadingFavorites(true);
        try {
            const data = await getFavorites();
            // API returns List[Business], we wrap it for consistency if needed, or just use as is
            setFavorites(data);
        } catch (error) {
            console.error('Favoriler yüklenemedi:', error);
        } finally {
            setLoadingFavorites(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        // Navigation stack'i sıfırlayıp login'e atabiliriz veya AuthContext zaten handle eder.
                        // Genellikle AuthContext state değişince App.js navigator'ı günceller.
                    }
                }
            ]
        );
    };

    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                <View style={styles.notLoggedIn}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="person" size={60} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Profil</Text>
                    <Text style={styles.subtitle}>
                        Yorumlarınızı yönetmek ve profilinizi düzenlemek için giriş yapın.
                    </Text>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginButtonText}>Giriş Yap</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.registerButtonText}>Hesap Oluştur</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const renderReviewItem = (review) => (
        <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.businessInfo}>
                    <View style={styles.businessIcon}>
                        <Ionicons name="cafe" size={20} color={COLORS.surface} />
                    </View>
                    <View>
                        <Text style={styles.businessName}>{review.business?.name || 'Bilinmeyen Mekan'}</Text>
                        <Text style={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString('tr-TR')}</Text>
                    </View>
                </View>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color={COLORS.secondary} />
                    <Text style={styles.ratingText}>{review.rating}</Text>
                </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <Text style={styles.username}>{user?.username || 'Kullanıcı'}</Text>
                        <Text style={styles.email}>{user?.email || ''}</Text>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{reviews.length}</Text>
                                <Text style={styles.statLabel}>Yorum</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{favorites.length}</Text>
                                <Text style={styles.statLabel}>Favori</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'reviews' && styles.activeTabButton]}
                        onPress={() => setActiveTab('reviews')}
                    >
                        <Ionicons name="chatbubbles-outline" size={20} color={activeTab === 'reviews' ? COLORS.primary : COLORS.textSecondary} />
                        <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>Yorumlarım</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'favorites' && styles.activeTabButton]}
                        onPress={() => setActiveTab('favorites')}
                    >
                        <Ionicons name="heart-outline" size={20} color={activeTab === 'favorites' ? COLORS.primary : COLORS.textSecondary} />
                        <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>Favorilerim</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'settings' && styles.activeTabButton]}
                        onPress={() => setActiveTab('settings')}
                    >
                        <Ionicons name="settings-outline" size={20} color={activeTab === 'settings' ? COLORS.primary : COLORS.textSecondary} />
                        <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Ayarlar</Text>
                    </TouchableOpacity>
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    {activeTab === 'reviews' ? (
                        <View>
                            {loadingReviews ? (
                                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                            ) : reviews.length > 0 ? (
                                reviews.map(renderReviewItem)
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="chatbubble-outline" size={48} color={COLORS.textSecondary} />
                                    <Text style={styles.emptyText}>Henüz hiç yorum yapmadınız.</Text>
                                </View>
                            )}
                        </View>
                    ) : activeTab === 'favorites' ? (
                        <View>
                            {loadingFavorites ? (
                                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                            ) : favorites.length > 0 ? (
                                favorites.map((biz) => (
                                    <TouchableOpacity
                                        key={biz.id}
                                        style={styles.favoriteCard}
                                        onPress={() => navigation.navigate('businessDetail', { businessId: biz.id })}
                                    >
                                        <View style={styles.favoriteIcon}>
                                            <Ionicons name="cafe" size={24} color={COLORS.surface} />
                                        </View>
                                        <View style={styles.favoriteInfo}>
                                            <Text style={styles.favoriteName}>{biz.name}</Text>
                                            <Text style={styles.favoriteAddress}>{biz.address}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="heart-outline" size={48} color={COLORS.textSecondary} />
                                    <Text style={styles.emptyText}>Henüz favori mekanınız yok.</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.settingsContainer}>
                            <TouchableOpacity style={styles.settingItem}>
                                <View style={styles.settingIcon}>
                                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.text} />
                                </View>
                                <Text style={styles.settingText}>Şifre Değiştir</Text>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.settingItem}>
                                <View style={styles.settingIcon}>
                                    <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
                                </View>
                                <Text style={styles.settingText}>Bildirim Ayarları</Text>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
                                <View style={[styles.settingIcon, { backgroundColor: '#FFEBEE' }]}>
                                    <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                                </View>
                                <Text style={[styles.settingText, { color: COLORS.error }]}>Çıkış Yap</Text>
                            </TouchableOpacity>
                        </View>
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
    notLoggedIn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.extraLarge,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.large,
        ...SHADOWS.medium,
    },
    title: {
        fontSize: SIZES.extraLarge,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SIZES.small,
    },
    subtitle: {
        fontSize: SIZES.font,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SIZES.extraLarge,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: SIZES.radius,
        width: '100%',
        alignItems: 'center',
        marginBottom: SIZES.medium,
        ...SHADOWS.light,
    },
    loginButtonText: {
        color: COLORS.surface,
        fontSize: SIZES.medium,
        fontWeight: 'bold',
    },
    registerButton: {
        paddingVertical: 15,
        borderRadius: SIZES.radius,
        width: '100%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    registerButtonText: {
        color: COLORS.primary,
        fontSize: SIZES.medium,
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: COLORS.surface,
        paddingTop: 60,
        paddingBottom: SIZES.extraLarge,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...SHADOWS.medium,
        zIndex: 1,
    },
    headerContent: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.medium,
        borderWidth: 4,
        borderColor: COLORS.background,
        ...SHADOWS.light,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    username: {
        fontSize: SIZES.extraLarge,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    email: {
        fontSize: SIZES.font,
        color: COLORS.textSecondary,
        marginBottom: SIZES.large,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingVertical: SIZES.medium,
        paddingHorizontal: SIZES.extraLarge,
        borderRadius: SIZES.radius,
    },
    statItem: {
        alignItems: 'center',
        minWidth: 60,
    },
    statNumber: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
        marginHorizontal: SIZES.large,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: SIZES.medium,
        marginTop: SIZES.medium,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: 4,
        ...SHADOWS.light,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: SIZES.radius - 4,
        gap: 8,
    },
    activeTabButton: {
        backgroundColor: COLORS.background,
    },
    tabText: {
        fontSize: SIZES.font,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    activeTabText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    content: {
        padding: SIZES.medium,
    },
    reviewCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.medium,
        marginBottom: SIZES.medium,
        ...SHADOWS.light,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SIZES.small,
    },
    businessInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    businessIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.small,
    },
    businessName: {
        fontSize: SIZES.font,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    reviewDate: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        fontSize: SIZES.small,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    reviewComment: {
        fontSize: SIZES.font,
        color: COLORS.text,
        lineHeight: 20,
    },
    emptyState: {
        alignItems: 'center',
        padding: SIZES.extraLarge,
        marginTop: SIZES.large,
    },
    emptyText: {
        color: COLORS.textSecondary,
        marginTop: SIZES.medium,
    },
    settingsContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.small,
        ...SHADOWS.light,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.medium,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.background,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.medium,
    },
    settingText: {
        flex: 1,
        fontSize: SIZES.font,
        color: COLORS.text,
    },
    logoutItem: {
        borderBottomWidth: 0,
    },
    favoriteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SIZES.medium,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.medium,
        ...SHADOWS.light,
    },
    favoriteIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.medium,
    },
    favoriteInfo: {
        flex: 1,
    },
    favoriteName: {
        fontSize: SIZES.font,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    favoriteAddress: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
});

export default ProfileScreen;
