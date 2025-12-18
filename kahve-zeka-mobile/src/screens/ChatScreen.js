import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { API_URL } from '../services/api';
import axios from 'axios';
import * as Location from 'expo-location';

const ChatScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        { id: '1', text: 'Merhaba! Bugün nasıl hissediyorsun? Sana mükemmel kahveyi bulmanda yardımcı olabilirim. ☕️', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const flatListRef = useRef();

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
        })();
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // API Çağrısı (Konum bilgisiyle)
            const payload = {
                message: userMessage.text,
                ...(userLocation && { latitude: userLocation.latitude, longitude: userLocation.longitude })
            };

            const response = await axios.post(`${API_URL}/api/chat/recommend`, payload);

            const data = response.data;
            const emotion = data.emotion_category;
            const recs = data.recommendations;
            const matchingProducts = data.matching_products || [];

            // Bot'un giriş mesajı
            const botIntroMessage = {
                id: (Date.now() + 1).toString(),
                text: `Seni "${emotion}" hissettim. İşte sana özel önerilerim: 👇`,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botIntroMessage]);

            // Önerileri göstermek için özel bir mesaj yapısı kullanıyoruz
            const botRecsMessage = {
                id: (Date.now() + 2).toString(),
                sender: 'bot',
                type: 'recommendation_list',
                recommendations: recs
            };
            setMessages(prev => [...prev, botRecsMessage]);

            // Eğer veritabanından eşleşen ürün bulunduysa onları da göster
            if (matchingProducts.length > 0) {
                const botProductsMessage = {
                    id: (Date.now() + 3).toString(),
                    sender: 'bot',
                    type: 'product_list',
                    products: matchingProducts
                };
                setMessages(prev => [...prev, botProductsMessage]);
            }

        } catch (error) {
            console.error(error);
            const errorMessage = { id: (Date.now() + 1).toString(), text: 'Üzgünüm, şu an bağlantı kuramıyorum. Biraz sonra tekrar dener misin?', sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, loading]);

    const renderItem = ({ item }) => {
        const isBot = item.sender === 'bot';

        if (item.type === 'recommendation_list') {
            return (
                <View style={styles.recommendationContainer}>
                    {item.recommendations.map((rec, index) => (
                        <View key={index} style={styles.recommendationCard}>
                            <View style={styles.recHeader}>
                                <Ionicons name="cafe" size={20} color={COLORS.primary} />
                                <Text style={styles.recTitle}>{rec.title}</Text>
                            </View>
                            <Text style={styles.recCoffeeName}>{rec.coffee}</Text>
                            <Text style={styles.recDesc}>{rec.description}</Text>
                        </View>
                    ))}
                </View>
            );
        }

        if (item.type === 'product_list') {
            return (
                <View style={styles.recommendationContainer}>
                    <Text style={styles.sectionTitle}>📍 Size En Yakın Lezzetler</Text>
                    {item.products.map((prod, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.productCard}
                            onPress={() => navigation.navigate('businessDetail', { businessId: prod.business_id })}
                        >
                            <View style={styles.productInfo}>
                                <Text style={styles.prodName}>{prod.name}</Text>
                                <Text style={styles.prodBusiness}>{prod.business_name}</Text>
                                <Text style={styles.prodPrice}>{prod.price} ₺</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        return (
            <View style={[
                styles.messageContainer,
                isBot ? styles.botMessage : styles.userMessage
            ]}>
                {isBot && (
                    <View style={styles.botAvatar}>
                        <Ionicons name="cafe" size={20} color={COLORS.surface} />
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    isBot ? styles.botBubble : styles.userBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isBot ? styles.botText : styles.userText
                    ]}>{item.text}</Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Kahvelog</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={COLORS.primary} size="small" />
                        <Text style={styles.loadingText}>Analiz ediliyor...</Text>
                    </View>
                ) : null}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Nasıl hissediyorsun?"
                    placeholderTextColor={COLORS.textSecondary}
                    returnKeyType="send"
                    onSubmitEditing={sendMessage}
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={loading}>
                    <Ionicons name="send" size={24} color={COLORS.surface} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        ...SHADOWS.light,
        zIndex: 1,
    },
    headerTitle: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    listContent: {
        padding: SIZES.medium,
        paddingBottom: 20,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: SIZES.medium,
        alignItems: 'flex-end',
    },
    botMessage: {
        alignSelf: 'flex-start',
    },
    userMessage: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
    },
    botAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        ...SHADOWS.light,
    },
    botBubble: {
        backgroundColor: COLORS.surface,
        borderBottomLeftRadius: 4,
    },
    userBubble: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: SIZES.font,
        lineHeight: 20,
    },
    botText: {
        color: COLORS.text,
    },
    userText: {
        color: COLORS.surface,
    },
    recommendationContainer: {
        marginLeft: 44, // Avatar hizası
        marginBottom: 15,
        width: '85%',
    },
    recommendationCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        ...SHADOWS.medium,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.secondary,
    },
    recHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    recTitle: {
        fontWeight: 'bold',
        color: COLORS.primary,
        marginLeft: 8,
        fontSize: 14,
    },
    recCoffeeName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.text,
        marginBottom: 4,
    },
    recDesc: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 10,
        marginTop: 5
    },
    productCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: COLORS.secondary
    },
    productInfo: {
        flex: 1,
    },
    prodName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.text,
    },
    prodBusiness: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2
    },
    prodPrice: {
        marginTop: 4,
        fontWeight: 'bold',
        color: COLORS.primary
    },
    inputContainer: {
        flexDirection: 'row',
        padding: SIZES.medium,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 25,
        paddingHorizontal: 20,
        height: 50,
        marginRight: 10,
        color: COLORS.text,
    },
    sendButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 45,
        marginBottom: 10,
    },
    loadingText: {
        marginLeft: 10,
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
});

export default ChatScreen;
