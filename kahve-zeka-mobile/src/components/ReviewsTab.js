import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import ReviewCard from './ReviewCard';
import { useAuth } from '../contexts/AuthContext';

const ReviewsTab = ({ businessId, reviews = [], navigate }) => {
    const { isAuthenticated } = useAuth();

    const handleAddReview = () => {
        if (isAuthenticated) {
            navigate('addReview', { businessId });
        } else {
            // Giriş yapmamışsa login sayfasına yönlendir
            navigate('login');
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.title}>Yorumlar ({reviews.length})</Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddReview}
            >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Yorum Yaz</Text>
            </TouchableOpacity>
        </View>
    );

    if (reviews.length === 0) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubble-outline" size={48} color={THEME.colors.textLight} />
                    <Text style={styles.emptyText}>Henüz yorum yapılmamış.</Text>
                    <Text style={styles.emptySubText}>İlk yorumu sen yap!</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}
            <FlatList
                data={reviews}
                renderItem={({ item }) => <ReviewCard review={item} />}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false} // Parent ScrollView handles scrolling
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: THEME.spacing.md,
    },
    title: {
        ...THEME.typography.h2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.primaryBrown,
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.xs,
        borderRadius: THEME.borderRadius.medium,
    },
    addButtonText: {
        ...THEME.typography.caption,
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 4,
    },
    emptyContainer: {
        padding: THEME.spacing.xl,
        alignItems: 'center',
        marginTop: THEME.spacing.lg,
    },
    emptyText: {
        ...THEME.typography.h3,
        color: THEME.colors.textSecondary,
        marginTop: THEME.spacing.md,
    },
    emptySubText: {
        ...THEME.typography.body,
        color: THEME.colors.textLight,
        marginTop: 4,
    },
});

export default ReviewsTab;
