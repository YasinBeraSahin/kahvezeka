import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../services/api';
import { THEME } from '../constants/theme';

const RegisterScreen = ({ navigate, goBack }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        // Validasyonlar
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
            // Kayıt isteği
            await registerUser(email, username, password);

            Alert.alert(
                'Başarılı',
                'Kayıt işlemi başarıyla tamamlandı! Şimdi giriş yapabilirsiniz.',
                [{ text: 'Giriş Yap', onPress: () => navigate('login') }]
            );
        } catch (error) {
            // Hata mesajını göster
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
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={THEME.colors.primaryBrown} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Kayıt Ol</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color={THEME.colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Kullanıcı Adı"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color={THEME.colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="E-posta"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={THEME.colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Şifre"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={THEME.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={THEME.colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Şifre Tekrar"
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
                        <TouchableOpacity onPress={() => navigate('login')}>
                            <Text style={styles.linkText}>Giriş Yap</Text>
                        </TouchableOpacity>
                    </View>
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
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.cardBackground,
        borderRadius: THEME.borderRadius.medium,
        paddingHorizontal: THEME.spacing.md,
        marginBottom: THEME.spacing.md,
        height: 50,
        borderWidth: 1,
        borderColor: THEME.colors.border,
    },
    inputIcon: {
        marginRight: THEME.spacing.sm,
    },
    input: {
        flex: 1,
        height: '100%',
        ...THEME.typography.body,
    },
    registerButton: {
        backgroundColor: THEME.colors.primaryBrown,
        height: 50,
        borderRadius: THEME.borderRadius.medium,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: THEME.spacing.md,
        marginBottom: THEME.spacing.lg,
        ...THEME.shadows.small,
    },
    registerButtonText: {
        ...THEME.typography.body,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: THEME.spacing.md,
    },
    footerText: {
        ...THEME.typography.body,
        color: THEME.colors.textSecondary,
    },
    linkText: {
        ...THEME.typography.body,
        color: THEME.colors.primaryBrown,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
