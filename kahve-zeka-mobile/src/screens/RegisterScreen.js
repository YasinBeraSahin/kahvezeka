// src/screens/RegisterScreen.js
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
import { registerUser } from '../services/api';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('customer'); // 'customer' or 'owner'
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Hata', 'Şifreler eşleşmiyor.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
            return;
        }

        setLoading(true);
        try {
            // Web ile uyumlu olması için 'customer' veya 'owner' gönderiyoruz
            await registerUser(email, username, password, role);

            Alert.alert(
                'Başarılı',
                'Kayıt işlemi başarıyla tamamlandı! Şimdi giriş yapabilirsiniz.',
                [{ text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            let errorMessage = 'Kayıt işlemi başarısız oldu.';
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }
            Alert.alert('Hata', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop' }}
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
                        <Text style={styles.welcomeText}>Aramıza Katılın!</Text>
                    </View>

                    {/* Kayıt Kartı */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Kayıt Ol</Text>

                        {/* Rol Seçimi */}
                        <View style={styles.roleContainer}>
                            <Text style={styles.roleLabel}>Hesap Türü</Text>
                            <View style={styles.roleButtons}>
                                <TouchableOpacity
                                    style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
                                    onPress={() => setRole('customer')}
                                >
                                    <Ionicons
                                        name="person"
                                        size={18}
                                        color={role === 'customer' ? COLORS.surface : COLORS.textSecondary}
                                    />
                                    <Text style={[styles.roleButtonText, role === 'customer' && styles.roleButtonTextActive]}>
                                        Müşteri
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.roleButton, role === 'owner' && styles.roleButtonActive]}
                                    onPress={() => setRole('owner')}
                                >
                                    <Ionicons
                                        name="business"
                                        size={18}
                                        color={role === 'owner' ? COLORS.surface : COLORS.textSecondary}
                                    />
                                    <Text style={[styles.roleButtonText, role === 'owner' && styles.roleButtonTextActive]}>
                                        İşletme
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

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
                            <Ionicons name="mail-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="E-posta"
                                placeholderTextColor={COLORS.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
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

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Şifre Tekrar"
                                placeholderTextColor={COLORS.textSecondary}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.registerButtonText}>Kayıt Ol</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.linkText}>Giriş Yap</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    roleContainer: {
        marginBottom: SIZES.medium,
    },
    roleLabel: {
        fontSize: SIZES.small,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginBottom: SIZES.small,
        marginLeft: 4,
    },
    roleButtons: {
        flexDirection: 'row',
        gap: SIZES.small,
    },
    roleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
        gap: 6,
    },
    roleButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    roleButtonText: {
        fontSize: SIZES.font,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    roleButtonTextActive: {
        color: COLORS.surface,
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
    registerButton: {
        backgroundColor: COLORS.primary,
        height: 55,
        borderRadius: SIZES.radius,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SIZES.small,
        marginBottom: SIZES.large,
        ...SHADOWS.light,
    },
    registerButtonText: {
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

export default RegisterScreen;
