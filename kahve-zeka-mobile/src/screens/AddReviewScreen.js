// src/screens/AddReviewScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// TEMPORARILY DISABLED - Native module issue
// import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { addReview } from '../services/api';
// import { uploadImage } from '../utils/uploadUtils';
import Toast from 'react-native-toast-message';

const AddReviewScreen = ({ navigation, route }) => {
    const { businessId } = route.params || {};
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    // PHOTO UPLOAD TEMPORARILY DISABLED
    // const [imageUri, setImageUri] = useState(null);
    // const [uploading, setUploading] = useState(false);

    // PHOTO UPLOAD TEMPORARILY DISABLED
    /*
    const pickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: 'İzin Gerekli',
                    text2: 'Galeri erişimi için izin vermeniz gerekiyor.'
                });
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Toast.show({
                type: 'error',
                text1: 'Hata',
                text2: 'Fotoğraf seçilirken bir hata oluştu.'
            });
        }
    };

    const removeImage = () => {
        setImageUri(null);
    };
    */

    const handleSubmit = async () => {
        if (rating === 0) {
            Toast.show({
                type: 'error',
                text1: 'Hata',
                text2: 'Lütfen puan veriniz.'
            });
            return;
        }

        setLoading(true);

        try {
            // Submit review without photo for now
            await addReview(businessId, {
                rating,
                comment
                // image_url: null // Photo upload disabled
            });

            Toast.show({
                type: 'success',
                text1: 'Başarılı',
                text2: 'Yorumunuz eklendi.'
            });
            setTimeout(() => {
                navigation.goBack();
            }, 1000);

        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Hata',
                text2: 'Yorum eklenirken bir hata oluştu.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Yorum Yaz</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.label}>Puanınız</Text>
                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Ionicons
                                name={star <= rating ? "star" : "star-outline"}
                                size={40}
                                color={COLORS.warning}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Yorumunuz</Text>
                <TextInput
                    style={styles.input}
                    multiline
                    numberOfLines={4}
                    placeholder="Deneyiminizi paylaşın..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={comment}
                    onChangeText={setComment}
                />

                {/* PHOTO UPLOAD TEMPORARILY DISABLED */}

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.surface} />
                    ) : (
                        <Text style={styles.submitButtonText}>Gönder</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.medium,
        paddingTop: 50,
        paddingBottom: SIZES.medium,
        backgroundColor: COLORS.surface,
        ...SHADOWS.light,
    },
    backButton: {
        padding: SIZES.small,
    },
    title: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    content: {
        padding: SIZES.large,
    },
    label: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.small,
        marginTop: SIZES.medium,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: SIZES.small,
        marginBottom: SIZES.large,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.medium,
        height: 120,
        textAlignVertical: 'top',
        fontSize: SIZES.font,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    addPhotoButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        borderRadius: SIZES.radius,
        padding: SIZES.extraLarge,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SIZES.medium,
    },
    addPhotoText: {
        color: COLORS.primary,
        fontSize: SIZES.font,
        fontWeight: '600',
        marginTop: SIZES.small,
    },
    imagePreviewContainer: {
        position: 'relative',
        marginBottom: SIZES.medium,
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: SIZES.radius,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: COLORS.surface,
        borderRadius: 15,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.medium,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: SIZES.extraLarge,
        ...SHADOWS.medium,
    },
    submitButtonText: {
        color: COLORS.surface,
        fontSize: SIZES.medium,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.small,
    },
    uploadingText: {
        color: COLORS.surface,
        fontSize: SIZES.font,
    },
});

export default AddReviewScreen;
