import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { addReview } from '../services/api';

const AddReviewScreen = ({ navigate, goBack, params }) => {
    const { businessId } = params || {};
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    // Auth kontrolü
    const { user } = useAuth();

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Hata', 'Lütfen bir puan seçiniz.');
            return;
        }

        if (!comment.trim()) {
            Alert.alert('Hata', 'Lütfen bir yorum yazınız.');
            return;
        }

        setLoading(true);
        try {
            // API çağrısı
            await addReview(businessId, { rating, comment });

            Alert.alert(
                'Başarılı',
                'Yorumunuz başarıyla eklendi!',
                [{ text: 'Tamam', onPress: () => goBack() }]
            );
        } catch (error) {
            Alert.alert('Hata', 'Yorum eklenirken bir sorun oluştu.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => setRating(i)}
                    style={styles.starButton}
                >
                    <Ionicons
                        name={rating >= i ? "star" : "star-outline"}
                        size={40}
                        color={THEME.colors.warning}
                    />
                </TouchableOpacity>
            );
        }
        return <View style={styles.starsContainer}>{stars}</View>;
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={THEME.colors.primaryBrown} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Yorum Yaz</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.label}>Puanınız</Text>
                    {renderStars()}
                    <Text style={styles.ratingText}>
                        {rating > 0 ? `${rating} Yıldız` : 'Puanlamak için yıldızlara dokunun'}
                    </Text>

                    <Text style={styles.label}>Yorumunuz</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Deneyiminizi paylaşın..."
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        value={comment}
                        onChangeText={setComment}
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, (loading || rating === 0) && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading || rating === 0}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Yorumu Gönder</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: THEME.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: THEME.spacing.xl,
        marginTop: THEME.spacing.lg,
    },
    backButton: {
        padding: THEME.spacing.xs,
        marginRight: THEME.spacing.md,
    },
    title: {
        ...THEME.typography.h2,
    },
    content: {
        flex: 1,
    },
    label: {
        ...THEME.typography.h3,
        marginBottom: THEME.spacing.sm,
        marginTop: THEME.spacing.md,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: THEME.spacing.xs,
    },
    starButton: {
        padding: 4,
    },
    ratingText: {
        ...THEME.typography.caption,
        color: THEME.colors.textSecondary,
        textAlign: 'center',
        marginBottom: THEME.spacing.xl,
    },
    input: {
        backgroundColor: THEME.colors.cardBackground,
        borderRadius: THEME.borderRadius.medium,
        padding: THEME.spacing.md,
        borderWidth: 1,
        borderColor: THEME.colors.border,
        minHeight: 120,
        ...THEME.typography.body,
    },
    submitButton: {
        backgroundColor: THEME.colors.primaryBrown,
        height: 50,
        borderRadius: THEME.borderRadius.medium,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: THEME.spacing.xl,
        ...THEME.shadows.small,
    },
    disabledButton: {
        backgroundColor: THEME.colors.textLight,
        opacity: 0.7,
    },
    submitButtonText: {
        ...THEME.typography.body,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default AddReviewScreen;
