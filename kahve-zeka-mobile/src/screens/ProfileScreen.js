import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { THEME } from '../constants/theme';
import { getUserReviews } from '../services/api';
import ReviewCard from '../components/ReviewCard';

const ProfileScreen = ({ navigate, goBack }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            loadUserReviews();
        }
    }, [isAuthenticated]);

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

    const handleLogout = async () => {
        await logout();
    };

    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                <View style={styles.notLoggedIn}>
                    <Ionicons name="person-circle-outline" size={100} color={THEME.colors.textSecondary} />
                    <Text style={styles.title}>Profil</Text>
                    <Text style={styles.subtitle}>
                        Yorumlarınızı görmek ve yeni yorumlar eklemek için giriş yapın
                    </Text>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigate('login')}
                    >
                        <Text style={styles.loginButtonText}>Giriş Yap</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => navigate('register')}
                    >
                        <Text style={styles.registerButtonText}>Kayıt Ol</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={40} color="#fff" />
                    </View>
                    <Text style={styles.username}>{user?.username || 'Kullanıcı'}</Text>
                    <Text style={styles.email}>{user?.email || ''}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Yorumlarım ({reviews.length})</Text>

                    {loadingReviews ? (
                        <ActivityIndicator color={THEME.colors.primaryBrown} />
                    ) : reviews.length > 0 ? (
                        reviews.map(review => (
                            <ReviewCard key={review.id} review={review} />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Henüz yorum yapmadınız.</Text>
                    )}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={THEME.colors.error} />
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    notLoggedIn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: THEME.spacing.xl,
    },
    title: {
        ...THEME.typography.h1,
        marginTop: THEME.spacing.lg,
        marginBottom: THEME.spacing.sm,
    },
    subtitle: {
        ...THEME.typography.body,
        color: THEME.colors.textSecondary,
        textAlign: 'center',
        marginBottom: THEME.spacing.xl,
    },
    loginButton: {
        backgroundColor: THEME.colors.primaryBrown,
        paddingHorizontal: THEME.spacing.xl,
        paddingVertical: THEME.spacing.md,
        borderRadius: THEME.borderRadius.medium,
        width: '100%',
        marginBottom: THEME.spacing.md,
    },
    loginButtonText: {
        ...THEME.typography.body,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    registerButton: {
        backgroundColor: 'transparent',
        paddingHorizontal: THEME.spacing.xl,
        paddingVertical: THEME.spacing.md,
        borderRadius: THEME.borderRadius.medium,
        borderWidth: 2,
        borderColor: THEME.colors.primaryBrown,
        width: '100%',
    },
    registerButtonText: {
        ...THEME.typography.body,
        color: THEME.colors.primaryBrown,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    header: {
        alignItems: 'center',
        padding: THEME.spacing.xl,
        backgroundColor: THEME.colors.cardBackground,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: THEME.colors.primaryBrown,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: THEME.spacing.md,
    },
    username: {
        ...THEME.typography.h2,
        marginBottom: THEME.spacing.xs,
    },
    email: {
        ...THEME.typography.body,
        color: THEME.colors.textSecondary,
    },
    section: {
        padding: THEME.spacing.lg,
    },
    sectionTitle: {
        ...THEME.typography.h3,
        marginBottom: THEME.spacing.md,
    },
    emptyText: {
        ...THEME.typography.body,
        color: THEME.colors.textSecondary,
        textAlign: 'center',
        padding: THEME.spacing.lg,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: THEME.spacing.md,
        marginHorizontal: THEME.spacing.lg,
        marginVertical: THEME.spacing.xl,
        borderWidth: 1,
        borderColor: THEME.colors.error,
        borderRadius: THEME.borderRadius.medium,
    },
    logoutText: {
        ...THEME.typography.body,
        color: THEME.colors.error,
        marginLeft: THEME.spacing.sm,
        fontWeight: '600',
    },
});

export default ProfileScreen;
