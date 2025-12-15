import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { API_URL } from '../services/api';
import axios from 'axios';

const ChatScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        { id: '1', text: 'Merhaba! Bugün nasıl hissediyorsun? Sana en uygun kahveyi önerebilirim. ☕️', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef();

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // API Çağrısı
            const response = await axios.post(`${API_URL}/api/chat/recommend`, {
                message: userMessage.text
            });

            const data = response.data;
            const botResponseText = `${data.recommendation} öneriyorum!\n\nÇünkü: ${data.reason}`;
            // İsterseniz mood bilgisini de gösterebilirsiniz: data.mood_detected

            const botMessage = {
                id: (Date.now() + 1).toString(),
                text: botResponseText,
                sender: 'bot',
                recommendation: data.recommendation
            };

            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error(error);
            const errorMessage = { id: (Date.now() + 1).toString(), text: 'Üzgünüm, şu an bağlantı kuramıyorum. Biraz sonra tekrar dener misin?', sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, [messages, loading]);

    const renderItem = ({ item }) => {
        const isBot = item.sender === 'bot';
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
            keyboardVerticalOffset={90}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Kahve Zeka Asistanı</Text>
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
                        <Text style={styles.loadingText}>Yazıyor...</Text>
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
        maxWidth: '75%',
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
