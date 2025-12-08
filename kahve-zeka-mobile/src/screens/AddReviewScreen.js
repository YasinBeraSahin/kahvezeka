// src/screens/AddReviewScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
// import * as ImagePicker from 'expo-image-picker'; // TEMPORARILY DISABLED - requires dev build
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { addReview, api } from '../services/api';

const AddReviewScreen = ({ navigation, route }) => {
    const { businessId } = route.params || {};
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        // TEMPORARILY DISABLED - requires development build
        Alert.alert('Yakında', 'Fotoğraf yükleme özelliği development build ile aktif olacak!');
        return;

        /* 
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişimi gerekiyor.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
        */
    };

    const uploadImage = async () => {
        if (!selectedImage) return null;

        const formData = new FormData();
        formData.append('file', {
            uri: selectedImage,
            type: 'image/jpeg',
            name: 'review.jpg',
        });

        try {
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.url;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Hata', 'Lütfen puan veriniz.');
            return;
        }

        setLoading(true);
        try {
            let imageUrl = null;

            // Upload image if selected
            if (selectedImage) {
                setUploading(true);
                imageUrl = await uploadImage();
                setUploading(false);
            }

            await addReview(businessId, {
                rating,
                comment,
                image_url: imageUrl
            });

            Alert.alert('Başarılı', 'Yorumunuz eklendi.', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Yorum eklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
            setUploading(false);
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

                <Text style={styles.label}>Fotoğraf (Opsiyonel)</Text>
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                    {selectedImage ? (
                        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="camera-outline" size={40} color={COLORS.textSecondary} />
                            <Text style={styles.imagePlaceholderText}>Fotoğraf Ekle</Text>
                        </View>
                    )}
                </TouchableOpacity>
                {selectedImage && (
                    <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setSelectedImage(null)}
                    >
                        <Ionicons name="close-circle" size={24} color={COLORS.error} />
                        <Text style={styles.removeImageText}>Fotoğrafı Kaldır</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading || uploading}
                >
                    {loading || uploading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <ActivityIndicator color={COLORS.surface} />
                            <Text style={styles.submitButtonText}>
                                {uploading ? 'Fotoğraf yükleniyor...' : 'Gönderiliyor...'}
                            </Text>
                        </View>
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
    imagePickerButton: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        overflow: 'hidden',
        marginBottom: SIZES.medium,
    },
    imagePlaceholder: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: SIZES.small,
        color: COLORS.textSecondary,
        fontSize: SIZES.medium,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    removeImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SIZES.small,
        marginBottom: SIZES.medium,
    },
    removeImageText: {
        color: COLORS.error,
        fontSize: SIZES.font,
    },
});

export default AddReviewScreen;
