import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { API_URL } from '../services/api';
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getToken } from '../utils/storage';

const useToken = () => {
    const [token, setToken] = useState(null);
    useEffect(() => {
        getToken().then(setToken);
    }, []);
    return token;
};

const ChatScreen = ({ navigation }) => {
    const token = useToken();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    // Geçmiş Yönetimi
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

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

    // Token geldiğinde geçmişi yükle
    useEffect(() => {
        if (token) {
            fetchSessions();
        } else {
            // Token yoksa (otonom demo modu) varsayılan mesaj
            setMessages([{ id: 'intro', text: 'Merhaba! Bugün nasıl hissediyorsun? Sana mükemmel kahveyi bulmanda yardımcı olabilirim. ☕️', sender: 'bot' }]);
        }
    }, [token]);

    const fetchSessions = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/chat/sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(response.data);
        } catch (error) {
            console.log("Geçmiş getirilemedi:", error);
        }
    };

    const handleNewChat = () => {
        setMessages([{ id: 'intro', text: 'Merhaba! Bugün nasıl hissediyorsun? Sana mükemmel kahveyi bulmanda yardımcı olabilirim. ☕️', sender: 'bot' }]);
        setCurrentSessionId(null);
        setIsHistoryVisible(false);
    };

    const handleSelectSession = async (sessionId) => {
        setLoading(true);
        setCurrentSessionId(sessionId);
        setIsHistoryVisible(false);
        try {
            const response = await axios.get(`${API_URL}/api/chat/sessions/${sessionId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.error("Mesajlar yüklenemedi:", error);
            Alert.alert("Hata", "Sohbet yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userText = input;
        setInput('');

        // Optimistic update
        const tempId = Date.now().toString();
        const userMessage = { id: tempId, text: userText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            let sessionId = currentSessionId;

            // Oturum yoksa oluştur (Sadece login olmuşsa)
            if (!sessionId && token) {
                const sessionRes = await axios.post(`${API_URL}/api/chat/sessions`,
                    { title: userText.substring(0, 30) },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                sessionId = sessionRes.data.id;
                setCurrentSessionId(sessionId);
                fetchSessions(); // Listeyi güncelle
            }

            // API Endpoint (Yeni session yapısı)
            // Eğer token varsa kayıtlı endpoint, yoksa eski endpoint
            let response;
            if (token && sessionId) {
                response = await axios.post(`${API_URL}/api/chat/sessions/${sessionId}/message`, {
                    message: userText,
                    latitude: userLocation?.latitude,
                    longitude: userLocation?.longitude
                }, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                // Fallback (Anonim kullanıcı)
                response = await axios.post(`${API_URL}/api/chat/recommend`, {
                    message: userText,
                    latitude: userLocation?.latitude,
                    longitude: userLocation?.longitude
                });
            }

            const data = response.data;

            if (!data) {
                throw new Error("Sunucudan boş yanıt döndü.");
            }

            // Backend'den dönen yapı standart ise işle
            // (Web ile aynı mantık)
            const emotion = data.emotion_category || "Belirsiz";
            const recs = data.recommendations || [];
            const matchingProducts = data.matching_products || [];

            // Giriş mesajı
            const introText = data.thought_process || `Seni "${emotion}" hissettim.`;
            const botIntroMessage = {
                id: (Date.now() + 1).toString(),
                text: introText,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botIntroMessage]);

            // Öneriler
            if (recs && recs.length > 0) {
                const botRecsMessage = {
                    id: (Date.now() + 2).toString(),
                    sender: 'bot',
                    type: 'recommendation_list', // ChatScreen renderItem'a uyumlu
                    recommendations: recs
                };
                setMessages(prev => [...prev, botRecsMessage]);
            }

            // Ürünler
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
            const errorMessage = { id: (Date.now() + 1).toString(), text: 'Üzgünüm, şu an bağlantı kuramıyorum.', sender: 'bot' };
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

        // ... (Eski renderItem mantığı aynen korunabilir veya iyileştirilebilir)
        // Burada recommendation_list ve product_list tipleri web'den gelen isRecommendation flag'leri ile uyumlu hale getirilmeli
        // Ancak yukarıda manuel construct ettiğimiz için sorun yok.
        // Eğer backend'den gelen "isRecommendation": true datasını direkt kullanıyorsak
        // fetch (GET) yaparken backend'den gelen formatı frontend formatına çevirmemiz lazım handleSelectSession içinde.
        // Web'de çevirdik, mobile'de de backend aynı formatı dönüyor.

        // Backend'deki get_session_messages endpoint'i 
        // "isRecommendation": true ve "recommendations": [...] dönüyor.
        // Bizim buradaki renderItem "type": "recommendation_list" bekliyor.
        // Adaptasyon yapalım:

        const isRecList = item.type === 'recommendation_list' || (item.isRecommendation && item.recommendations);
        const isProdList = item.type === 'product_list' || (item.isProductList && item.products);

        if (isRecList) {
            const recs = item.recommendations || [];
            return (
                <View style={styles.recommendationContainer}>
                    {recs.map((rec, index) => {
                        const isAnalysis = rec.title && rec.title.includes('AI Analizi');
                        return (
                            <View key={index} style={[
                                styles.recommendationCard,
                                isAnalysis && { borderLeftColor: '#9C27B0', backgroundColor: '#F3E5F5' }
                            ]}>
                                <View style={styles.recHeader}>
                                    <Ionicons
                                        name={isAnalysis ? "sparkles" : "cafe"}
                                        size={20}
                                        color={isAnalysis ? "#9C27B0" : COLORS.primary}
                                    />
                                    <Text style={[
                                        styles.recTitle,
                                        isAnalysis && { color: '#9C27B0' }
                                    ]}>{rec.title}</Text>
                                </View>
                                <Text style={styles.recCoffeeName}>{rec.coffee}</Text>
                                <Text style={styles.recDesc}>{rec.description}</Text>
                            </View>
                        );
                    })}
                </View>
            );
        }

        if (isProdList) {
            const prods = item.products || [];
            return (
                <View style={styles.recommendationContainer}>
                    <Text style={styles.sectionTitle}>📍 Size En Yakın Lezzetler</Text>
                    {prods.map((prod, index) => (
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
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // TabBar yüksekliğine göre ayarla
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setIsHistoryVisible(true)} style={styles.historyButton}>
                    <Ionicons name="time-outline" size={28} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kahvelog</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Geçmiş Modalı (Sidebar yerine Modal kullanıyoruz mobilde) */}
            <Modal
                visible={isHistoryVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsHistoryVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sohbet Geçmişi</Text>
                            <TouchableOpacity onPress={() => setIsHistoryVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
                            <Ionicons name="add" size={24} color={COLORS.surface} />
                            <Text style={styles.newChatText}>Yeni Sohbet</Text>
                        </TouchableOpacity>

                        <FlatList
                            data={sessions}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.sessionItem,
                                        currentSessionId === item.id && styles.activeSessionItem
                                    ]}
                                    onPress={() => handleSelectSession(item.id)}
                                >
                                    <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
                                    <View style={{ marginLeft: 10, flex: 1 }}>
                                        <Text numberOfLines={1} style={styles.sessionTitle}>{item.title || "Adsız Sohbet"}</Text>
                                        <Text style={styles.sessionDate}>{new Date(item.created_at).toLocaleDateString('tr-TR')}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Henüz geçmiş sohbet yok.</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()} // Backend int id döndürebilir
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
                    placeholder={currentSessionId ? "Sohbete devam et..." : "Nasıl hissediyorsun?"}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        ...SHADOWS.light,
        zIndex: 1,
    },
    headerTitle: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    historyButton: {
        padding: 5
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
        paddingBottom: Platform.OS === 'ios' ? 30 : SIZES.medium,
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '70%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    newChatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    newChatText: {
        color: COLORS.surface,
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    sessionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        marginBottom: 10,
    },
    activeSessionItem: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(215, 204, 200, 0.3)',
    },
    sessionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    sessionDate: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginTop: 20,
    }
});

export default ChatScreen;

