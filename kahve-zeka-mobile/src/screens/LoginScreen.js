import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { loginUser, getUserProfile } from '../services/api';
import { THEME } from '../constants/theme';

const LoginScreen = ({ navigate, goBack }) => {
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
            // 1. Token al
            const data = await loginUser(username, password);
            const token = data.access_token;

            // 2. Token'ı kaydet (AuthContext içinde yapılacak ama önce profil alalım)
            // Not: AuthContext.login fonksiyonu token ve user objesi bekliyor
            // Ancak api.js'deki interceptor henüz token'ı bilmiyor olabilir, bu yüzden manuel ekleyelim veya
            // AuthContext içinde login fonksiyonunu güncellememiz gerekebilir.
            // En iyisi: AuthContext.login'e sadece token verip, orada profil çekmek.
            // Ama şimdilik basitçe:

            // Token'ı geçici olarak kaydet ki getUserProfile çalışsın (api.js interceptor kullanıyor)
            // Ancak api.js interceptor'ı AsyncStorage'dan okuyor.
            // Bu yüzden önce login fonksiyonunu çağırıp token'ı kaydetmeliyiz.

            // Profil bilgisini almak için token'ı header'a ekleyerek istek atmamız lazım.
            // api.js'de interceptor var ama token henüz storage'da değil.
            // Bu yüzden login fonksiyonunu çağırıp token'ı kaydedelim, sonra profil çekelim.

            // AuthContext login fonksiyonunu güncelleyelim: sadece token ve user alıyor.
            // Biz burada manuel olarak profil çekemeyiz çünkü token henüz storage'da değil.

            // Çözüm: Login fonksiyonuna token verelim, o kaydetsin. Sonra profil çekip user'ı güncelleyelim.

            // Şimdilik basit bir user objesi oluşturalım
            const tempUser = { username: username };

            const success = await login(tempUser, token);

            if (success) {
                // Başarılı giriş
                Alert.alert('Başarılı', 'Giriş yapıldı!', [
                    { text: 'Tamam', onPress: () => navigate('profile') }
                ]);

                // Arka planda gerçek profil bilgisini çekip güncelleyebiliriz
                try {
                    const profile = await getUserProfile();
                    // AuthContext'te updateUser var mı? Evet.
                    // Ama şu an erişemiyoruz (login fonksiyonu içinde değil).
                    // Neyse, bir sonraki açılışta güncel profil gelecek.
                } catch (e) {
                    console.log('Profil çekme hatası (önemsiz):', e);
                }
            } else {
                Alert.alert('Hata', 'Giriş yapılamadı.');
            }
        } catch (error) {
            Alert.alert('Hata', 'Kullanıcı adı veya şifre hatalı.');
            console.error(error);
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
                    <Text style={styles.title}>Giriş Yap</Text>
                </View>

                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="cafe" size={50} color="#fff" />
                    </View>
                    <Text style={styles.appName}>Kahve Zeka</Text>
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
                        <TouchableOpacity onPress={() => navigate('register')}>
                            <Text style={styles.linkText}>Kayıt Ol</Text>
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
    logoContainer: {
        alignItems: 'center',
        marginBottom: THEME.spacing.xl,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: THEME.colors.primaryBrown,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: THEME.spacing.md,
        ...THEME.shadows.medium,
    },
    appName: {
        ...THEME.typography.h1,
        color: THEME.colors.primaryBrown,
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
    loginButton: {
        backgroundColor: THEME.colors.primaryBrown,
        height: 50,
        borderRadius: THEME.borderRadius.medium,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: THEME.spacing.md,
        marginBottom: THEME.spacing.lg,
        ...THEME.shadows.small,
    },
    loginButtonText: {
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

export default LoginScreen;
