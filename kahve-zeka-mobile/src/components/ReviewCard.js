import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import StarRating from './StarRating';

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
                        <Ionicons name="person" size={20} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.username}>{review.owner?.username || 'Anonim'}</Text>
                        <Text style={styles.date}>{formatDate(review.created_at)}</Text>
                    </View>
                </View>
                <StarRating rating={review.rating} size={14} />
            </View>

            <Text style={styles.comment}>{review.comment}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: THEME.colors.cardBackground,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.medium,
        marginBottom: THEME.spacing.md,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: THEME.spacing.sm,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: THEME.colors.primaryBrown,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: THEME.spacing.sm,
    },
    username: {
        ...THEME.typography.h3,
        fontSize: 14,
    },
    date: {
        ...THEME.typography.caption,
        color: THEME.colors.textSecondary,
    },
    comment: {
        ...THEME.typography.body,
        lineHeight: 20,
    },
});

export default ReviewCard;
