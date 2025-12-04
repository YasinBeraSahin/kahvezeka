// src/components/ReviewsTab.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import ReviewCard from './ReviewCard';
import { useAuth } from '../contexts/AuthContext';

const ReviewsTab = ({ businessId, reviews = [], navigation }) => {
    const { isAuthenticated } = useAuth();

    const handleAddReview = () => {
        if (isAuthenticated) {
            navigation.navigate('addReview', { businessId });
        } else {
            navigation.navigate('Login');
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.title}>Yorumlar ({reviews.length})</Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddReview}
            >
                <Ionicons name="add" size={20} color={COLORS.surface} />
                <Text style={styles.addButtonText}>Yorum Yaz</Text>
            </TouchableOpacity>
        </View>
    );

    if (reviews.length === 0) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubble-outline" size={48} color={COLORS.textSecondary} />
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
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
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
        marginBottom: SIZES.medium,
    },
    title: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.medium,
        paddingVertical: 8,
        borderRadius: SIZES.radius,
        ...SHADOWS.light,
    },
    addButtonText: {
        fontSize: SIZES.small,
        color: COLORS.surface,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    emptyContainer: {
        padding: SIZES.extraLarge,
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        marginTop: SIZES.small,
        ...SHADOWS.light,
    },
    emptyText: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SIZES.medium,
    },
    emptySubText: {
        fontSize: SIZES.font,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    listContent: {
        gap: SIZES.medium,
    },
});

export default ReviewsTab;
