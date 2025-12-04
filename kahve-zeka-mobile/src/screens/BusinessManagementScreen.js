// src/screens/BusinessManagementScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import {
    getMyBusiness,
    createBusiness,
    updateBusiness,
    addMenuItem,
    deleteMenuItem,
    addCampaign,
    deleteCampaign
} from '../services/api';

const BusinessManagementScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState(null);
    const [activeTab, setActiveTab] = useState('info'); // 'info', 'menu', 'campaigns'

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        latitude: '',

        longitude: '',
        has_wifi: false,
        has_socket: false,
        is_pet_friendly: false,
        is_quiet: false,
        serves_food: false
    });

    const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });
    const [newCampaign, setNewCampaign] = useState({ title: '', description: '' });

    useEffect(() => {
        loadBusinessData();
    }, []);

    const loadBusinessData = async () => {
        setLoading(true);
        try {
            const data = await getMyBusiness();
            if (data) {
                setBusiness(data);
                setFormData({
                    name: data.name,
                    address: data.address,
                    phone: data.phone || '',
                    latitude: data.latitude.toString(),
                    longitude: data.longitude.toString(),
                    has_wifi: data.has_wifi,
                    has_socket: data.has_socket,
                    is_pet_friendly: data.is_pet_friendly,
                    is_quiet: data.is_quiet,
                    serves_food: data.serves_food
                });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'İşletme bilgileri yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBusiness = async () => {
        if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
            Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
            return;
        }

        try {
            const payload = {
                ...formData,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                owner_id: user.id
            };

            let response;
            if (business) {
                response = await updateBusiness(payload);
                Alert.alert('Başarılı', 'İşletme bilgileri güncellendi.');
            } else {
                response = await createBusiness(payload);
                Alert.alert('Başarılı', 'İşletmeniz oluşturuldu ve onaya gönderildi.');
            }
            setBusiness(response);
        } catch (error) {
            Alert.alert('Hata', 'İşlem başarısız oldu.');
        }
    };

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.price) {
            Alert.alert('Hata', 'Ürün adı ve fiyatı zorunludur.');
            return;
        }

        try {
            const response = await addMenuItem({ ...newItem, price: parseFloat(newItem.price) });
            setBusiness(prev => ({ ...prev, menu_items: [...(prev.menu_items || []), response] }));
            setNewItem({ name: '', description: '', price: '' });
            Alert.alert('Başarılı', 'Ürün eklendi.');
        } catch (error) {
            Alert.alert('Hata', 'Ürün eklenemedi.');
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await deleteMenuItem(id);
            setBusiness(prev => ({
                ...prev,
                menu_items: prev.menu_items.filter(item => item.id !== id)
            }));
        } catch (error) {
            Alert.alert('Hata', 'Silme işlemi başarısız.');
        }
    };

    const handleAddCampaign = async () => {
        if (!newCampaign.title || !newCampaign.description) {
            Alert.alert('Hata', 'Başlık ve açıklama zorunludur.');
            return;
        }

        try {
            const response = await addCampaign(newCampaign);
            setBusiness(prev => ({ ...prev, campaigns: [...(prev.campaigns || []), response] }));
            setNewCampaign({ title: '', description: '' });
            Alert.alert('Başarılı', 'Kampanya eklendi.');
        } catch (error) {
            Alert.alert('Hata', 'Kampanya eklenemedi.');
        }
    };

    const handleDeleteCampaign = async (id) => {
        try {
            await deleteCampaign(id);
            setBusiness(prev => ({
                ...prev,
                campaigns: prev.campaigns.filter(c => c.id !== id)
            }));
        } catch (error) {
            Alert.alert('Hata', 'Silme işlemi başarısız.');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigation.navigate('Login');
    };

    const renderSwitch = (label, key) => (
        <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>{label}</Text>
            <Switch
                value={formData[key]}
                onValueChange={v => setFormData({ ...formData, [key]: v })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.surface}
            />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>İşletme Paneli</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            {!business ? (
                // Create Business Form
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.sectionTitle}>İşletmenizi Oluşturun</Text>
                    <Text style={styles.subtitle}>Sistemde görünmek için bilgilerinizi girin.</Text>

                    <Text style={styles.inputLabel}>Mekan Adı</Text>
                    <TextInput style={styles.input} placeholder="Mekan Adı" placeholderTextColor={COLORS.textSecondary} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} />

                    <Text style={styles.inputLabel}>Adres</Text>
                    <TextInput style={styles.input} placeholder="Adres" placeholderTextColor={COLORS.textSecondary} value={formData.address} onChangeText={t => setFormData({ ...formData, address: t })} />

                    <Text style={styles.inputLabel}>Telefon</Text>
                    <TextInput style={styles.input} placeholder="Telefon" placeholderTextColor={COLORS.textSecondary} value={formData.phone} onChangeText={t => setFormData({ ...formData, phone: t })} keyboardType="phone-pad" />

                    <Text style={styles.inputLabel}>Enlem</Text>
                    <TextInput style={styles.input} placeholder="Enlem (Örn: 41.0082)" placeholderTextColor={COLORS.textSecondary} value={formData.latitude} onChangeText={t => setFormData({ ...formData, latitude: t })} keyboardType="numeric" />

                    <Text style={styles.inputLabel}>Boylam</Text>
                    <TextInput style={styles.input} placeholder="Boylam (Örn: 28.9784)" placeholderTextColor={COLORS.textSecondary} value={formData.longitude} onChangeText={t => setFormData({ ...formData, longitude: t })} keyboardType="numeric" />

                    <View style={styles.attributesContainer}>
                        <Text style={styles.sectionTitleSmall}>Özellikler</Text>
                        {renderSwitch('Wi-Fi Var', 'has_wifi')}
                        {renderSwitch('Priz Var', 'has_socket')}
                        {renderSwitch('Hayvan Dostu', 'is_pet_friendly')}
                        {renderSwitch('Sessiz Ortam', 'is_quiet')}
                        {renderSwitch('Yemek Servisi', 'serves_food')}
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveBusiness}>
                        <Text style={styles.saveButtonText}>Oluştur</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                // Management Tabs
                <>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity style={[styles.tab, activeTab === 'info' && styles.activeTab]} onPress={() => setActiveTab('info')}>
                            <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Bilgiler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tab, activeTab === 'menu' && styles.activeTab]} onPress={() => setActiveTab('menu')}>
                            <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>Menü</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tab, activeTab === 'campaigns' && styles.activeTab]} onPress={() => setActiveTab('campaigns')}>
                            <Text style={[styles.tabText, activeTab === 'campaigns' && styles.activeTabText]}>Kampanya</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        {activeTab === 'info' && (
                            <View>
                                <Text style={styles.statusText}>
                                    Durum: {business.is_approved ? <Text style={{ color: COLORS.success }}>Onaylandı</Text> : <Text style={{ color: COLORS.warning }}>Onay Bekliyor</Text>}
                                </Text>
                                <Text style={styles.inputLabel}>Mekan Adı</Text>
                                <TextInput style={styles.input} placeholder="Mekan Adı" placeholderTextColor={COLORS.textSecondary} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} />

                                <Text style={styles.inputLabel}>Adres</Text>
                                <TextInput style={styles.input} placeholder="Adres" placeholderTextColor={COLORS.textSecondary} value={formData.address} onChangeText={t => setFormData({ ...formData, address: t })} />

                                <Text style={styles.inputLabel}>Telefon</Text>
                                <TextInput style={styles.input} placeholder="Telefon" placeholderTextColor={COLORS.textSecondary} value={formData.phone} onChangeText={t => setFormData({ ...formData, phone: t })} />

                                <View style={styles.attributesContainer}>
                                    <Text style={styles.sectionTitleSmall}>Özellikler</Text>
                                    {renderSwitch('Wi-Fi Var', 'has_wifi')}
                                    {renderSwitch('Priz Var', 'has_socket')}
                                    {renderSwitch('Hayvan Dostu', 'is_pet_friendly')}
                                    {renderSwitch('Sessiz Ortam', 'is_quiet')}
                                    {renderSwitch('Yemek Servisi', 'serves_food')}
                                </View>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSaveBusiness}>
                                    <Text style={styles.saveButtonText}>Güncelle</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {activeTab === 'menu' && (
                            <View>
                                <View style={styles.addItemForm}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>Ürün Adı</Text>
                                        <TextInput style={styles.input} placeholder="Ürün Adı" placeholderTextColor={COLORS.textSecondary} value={newItem.name} onChangeText={t => setNewItem({ ...newItem, name: t })} />
                                    </View>
                                    <View style={{ width: 80, marginLeft: 10 }}>
                                        <Text style={styles.inputLabel}>Fiyat</Text>
                                        <TextInput style={styles.input} placeholder="Fiyat" placeholderTextColor={COLORS.textSecondary} value={newItem.price} onChangeText={t => setNewItem({ ...newItem, price: t })} keyboardType="numeric" />
                                    </View>
                                    <TouchableOpacity style={[styles.addButton, { marginTop: 24 }]} onPress={handleAddItem}>
                                        <Ionicons name="add" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.inputLabel}>Açıklama</Text>
                                <TextInput style={styles.input} placeholder="Açıklama" placeholderTextColor={COLORS.textSecondary} value={newItem.description} onChangeText={t => setNewItem({ ...newItem, description: t })} />

                                {business.menu_items?.map(item => (
                                    <View key={item.id} style={styles.listItem}>
                                        <View>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemPrice}>{item.price} TL</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                                            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {activeTab === 'campaigns' && (
                            <View>
                                <Text style={styles.inputLabel}>Başlık</Text>
                                <TextInput style={styles.input} placeholder="Başlık" placeholderTextColor={COLORS.textSecondary} value={newCampaign.title} onChangeText={t => setNewCampaign({ ...newCampaign, title: t })} />

                                <Text style={styles.inputLabel}>Açıklama</Text>
                                <TextInput style={[styles.input, { height: 80 }]} placeholder="Açıklama" placeholderTextColor={COLORS.textSecondary} multiline value={newCampaign.description} onChangeText={t => setNewCampaign({ ...newCampaign, description: t })} />
                                <TouchableOpacity style={styles.saveButton} onPress={handleAddCampaign}>
                                    <Text style={styles.saveButtonText}>Kampanya Ekle</Text>
                                </TouchableOpacity>

                                {business.campaigns?.map(item => (
                                    <View key={item.id} style={styles.listItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.itemName}>{item.title}</Text>
                                            <Text style={styles.itemDesc}>{item.description}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeleteCampaign(item.id)}>
                                            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.medium,
        paddingTop: 50,
        backgroundColor: COLORS.surface,
        ...SHADOWS.light,
    },
    headerTitle: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    content: {
        padding: SIZES.medium,
    },
    sectionTitle: {
        fontSize: SIZES.extraLarge,
        fontWeight: 'bold',
        marginBottom: SIZES.small,
        color: COLORS.text,
    },
    subtitle: {
        color: COLORS.textSecondary,
        marginBottom: SIZES.large,
    },
    input: {
        backgroundColor: COLORS.surface,
        padding: SIZES.medium,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.medium,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text, // Text color black
    },
    inputLabel: {
        fontSize: SIZES.font,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 6,
        marginLeft: 4,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: SIZES.medium,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginBottom: SIZES.large,
    },
    saveButtonText: {
        color: COLORS.surface,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SIZES.small,
        marginBottom: SIZES.small,
    },
    tab: {
        flex: 1,
        paddingVertical: SIZES.small,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.primary,
    },
    statusText: {
        marginBottom: SIZES.medium,
        fontWeight: 'bold',
    },
    addItemForm: {
        flexDirection: 'row',
        gap: SIZES.small,
    },
    addButton: {
        backgroundColor: COLORS.secondary,
        width: 50,
        height: 50,
        borderRadius: SIZES.radius,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SIZES.medium,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.small,
        ...SHADOWS.light,
    },
    itemName: {
        fontWeight: 'bold',
        color: COLORS.text,
    },
    itemPrice: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    itemDesc: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    attributesContainer: {
        backgroundColor: COLORS.surface,
        padding: SIZES.medium,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.medium,
        ...SHADOWS.light,
    },
    sectionTitleSmall: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.small,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    switchLabel: {
        fontSize: SIZES.font,
        color: COLORS.text,
    },
});

export default BusinessManagementScreen;
