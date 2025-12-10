// src/components/ReviewCard.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import StarRating from './StarRating';
import { getImageUrl } from '../utils/image';


const ReviewCard = ({ review }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={20} color={COLORS.surface} />
                    </View>
                    <View>
                        <Text style={styles.username}>{review.owner?.username || 'Anonim'}</Text>
                        <Text style={styles.date}>{formatDate(review.created_at)}</Text>
                    </View>
                </View>
                <StarRating rating={review.rating} size={14} />
            </View>

            <Text style={styles.comment}>{review.comment}</Text>

            {review.image_url && (
                <Image
                    source={{ uri: getImageUrl(review.image_url) }}
                    style={styles.reviewImage}
                    resizeMode="cover"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        padding: SIZES.medium,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.medium,
        ...SHADOWS.light,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SIZES.small,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.small,
    },
    username: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    date: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    comment: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
    },
    reviewImage: {
        width: '100%',
        height: 200,
        marginTop: SIZES.small,
        borderRadius: SIZES.radius,
    },
});

export default ReviewCard;
