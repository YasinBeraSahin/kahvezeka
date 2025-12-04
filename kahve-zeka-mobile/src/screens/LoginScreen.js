// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ImageBackground,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../services/api';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';


const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Hata', 'Lütfen kullanıcı adı ve şifre giriniz.');
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser(username, password);
            const token = data.access_token;

            // Login fonksiyonu artık user objesini döndürüyor
            const user = await login(token);

            if (user) {
                // Başarılı giriş
                if (user.role === 'admin') {
                    navigation.navigate('admin');
                } else if (user.role === 'owner') {
                    navigation.navigate('businessManagement');
                } else {
                    navigation.navigate('home');
                }
            } else {
                Alert.alert('Hata', 'Giriş yapılamadı. Profil bilgileri alınamadı.');
            }
        } catch (error) {
            Alert.alert('Hata', 'Kullanıcı adı veya şifre hatalı.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop' }} // Kahve temalı arka plan
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.overlay} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Logo ve Başlık */}
                    <View style={styles.headerContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="cafe" size={40} color={COLORS.secondary} />
                        </View>
                        <Text style={styles.appName}>Kahve<Text style={{ color: COLORS.secondary }}>Zeka</Text></Text>
                        <Text style={styles.welcomeText}>Tekrar Hoşgeldiniz!</Text>
                    </View>

                    {/* Giriş Kartı */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Giriş Yap</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Kullanıcı Adı"
                                placeholderTextColor={COLORS.textSecondary}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Şifre"
                                placeholderTextColor={COLORS.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Giriş Yap</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Hesabınız yok mu? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.linkText}>Kayıt Ol</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: width,
        height: height,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Karartma
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SIZES.padding * 2,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: SIZES.extraLarge * 1.5,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.base,
        borderWidth: 1,
        borderColor: 'rgba(255, 179, 0, 0.3)',
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.surface,
        marginBottom: SIZES.base,
    },
    welcomeText: {
        fontSize: SIZES.medium,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: SIZES.radius * 1.5,
        padding: SIZES.padding * 1.5,
        ...SHADOWS.medium,
    },
    cardTitle: {
        fontSize: SIZES.extraLarge,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SIZES.large,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.medium,
        marginBottom: SIZES.medium,
        height: 55,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputIcon: {
        marginRight: SIZES.small,
    },
    input: {
        flex: 1,
        height: '100%',
        color: COLORS.text,
        fontSize: SIZES.font,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        height: 55,
        borderRadius: SIZES.radius,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SIZES.small,
        marginBottom: SIZES.large,
        ...SHADOWS.light,
    },
    loginButtonText: {
        color: COLORS.surface,
        fontWeight: 'bold',
        fontSize: SIZES.medium,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.font,
    },
    linkText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: SIZES.font,
    },
});

export default LoginScreen;
