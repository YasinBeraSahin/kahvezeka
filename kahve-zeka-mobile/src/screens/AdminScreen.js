import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Modal,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { getAllBusinessesForAdmin, approveBusiness, rejectBusiness } from '../services/api';

const AdminScreen = ({ navigation }) => {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [businesses, setBusinesses] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved'

    // Details Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState(null);

    const fetchBusinesses = async () => {
        try {
            const data = await getAllBusinessesForAdmin();
            setBusinesses(data);
        } catch (error) {
            Alert.alert('Hata', 'İşletmeler yüklenemedi.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBusinesses();
    };

    const handleApprove = async (id) => {
        try {
            await approveBusiness(id);
            Alert.alert('Başarılı', 'İşletme onaylandı.');
            // Listeyi güncelle
            setBusinesses(prev => prev.map(b => b.id === id ? { ...b, is_approved: true } : b));
            if (modalVisible) setModalVisible(false);
        } catch (error) {
            Alert.alert('Hata', 'Onaylama işlemi başarısız.');
        }
    };

    const handleReject = async (id) => {
        Alert.alert(
            'Reddet / Sil',
            'Bu işletmeyi silmek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await rejectBusiness(id);
                            // Listeden çıkar
                            setBusinesses(prev => prev.filter(b => b.id !== id));
                            if (modalVisible) setModalVisible(false);
                        } catch (error) {
                            Alert.alert('Hata', 'Silme işlemi başarısız.');
                        }
                    }
                }
            ]
        );
    };

    const openDetails = (business) => {
        setSelectedBusiness(business);
        setModalVisible(true);
    };

    const handleLogout = async () => {
        await logout();
        navigation.navigate('Login');
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.businessName}>{item.name}</Text>
                {item.is_approved ? (
                    <View style={[styles.badge, { backgroundColor: COLORS.success }]}>
                        <Text style={styles.badgeText}>Onaylı</Text>
                    </View>
                ) : (
                    <View style={[styles.badge, { backgroundColor: COLORS.warning }]}>
                        <Text style={styles.badgeText}>Bekliyor</Text>
                    </View>
                )}
            </View>

            <Text style={styles.address}>{item.address}</Text>
            <Text style={styles.phone}>{item.phone || 'Telefon yok'}</Text>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.button, styles.detailsButton]}
                    onPress={() => openDetails(item)}
                >
                    <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                    <Text style={[styles.buttonText, { color: COLORS.primary }]}>Detaylar</Text>
                </TouchableOpacity>

                {!item.is_approved && (
                    <>
                        <TouchableOpacity
                            style={[styles.button, styles.approveButton]}
                            onPress={() => handleApprove(item.id)}
                        >
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Onayla</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.rejectButton]}
                            onPress={() => handleReject(item.id)}
                        >
                            <Ionicons name="close-circle" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Reddet</Text>
                        </TouchableOpacity>
                    </>
                )}
                {item.is_approved && (
                    <TouchableOpacity
                        style={[styles.button, styles.rejectButton]}
                        onPress={() => handleReject(item.id)}
                    >
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Sil</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const filteredBusinesses = businesses.filter(b =>
        activeTab === 'pending' ? !b.is_approved : b.is_approved
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
                <Text style={styles.headerTitle}>Yönetici Paneli</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                        Onay Bekleyen ({businesses.filter(b => !b.is_approved).length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'approved' && styles.activeTab]}
                    onPress={() => setActiveTab('approved')}
                >
                    <Text style={[styles.tabText, activeTab === 'approved' && styles.activeTabText]}>
                        Onaylı ({businesses.filter(b => b.is_approved).length})
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredBusinesses}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {activeTab === 'pending' ? 'Onay bekleyen işletme yok.' : 'Onaylı işletme yok.'}
                    </Text>
                }
            />

            {/* DETAILS MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedBusiness?.name}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.detailRow}>
                                <Ionicons name="location" size={20} color={COLORS.secondary} />
                                <Text style={styles.detailText}>{selectedBusiness?.address}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="call" size={20} color={COLORS.secondary} />
                                <Text style={styles.detailText}>{selectedBusiness?.phone || 'Telefon belirtilmemiş'}</Text>
                            </View>

                            <Text style={styles.sectionHeader}>Özellikler</Text>
                            <View style={styles.amenitiesContainer}>
                                {selectedBusiness?.has_wifi && <View style={styles.amenityChip}><Text style={styles.amenityText}>Wi-Fi</Text></View>}
                                {selectedBusiness?.has_socket && <View style={styles.amenityChip}><Text style={styles.amenityText}>Priz</Text></View>}
                                {selectedBusiness?.is_pet_friendly && <View style={styles.amenityChip}><Text style={styles.amenityText}>Hayvan Dostu</Text></View>}
                                {selectedBusiness?.is_quiet && <View style={styles.amenityChip}><Text style={styles.amenityText}>Sessiz</Text></View>}
                                {selectedBusiness?.serves_food && <View style={styles.amenityChip}><Text style={styles.amenityText}>Yemek</Text></View>}
                                {selectedBusiness?.has_board_games && <View style={styles.amenityChip}><Text style={styles.amenityText}>Oyun</Text></View>}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.button, styles.closeButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.buttonText, { color: COLORS.text }]}>Kapat</Text>
                            </TouchableOpacity>

                            {!selectedBusiness?.is_approved && (
                                <TouchableOpacity
                                    style={[styles.button, styles.approveButton]}
                                    onPress={() => handleApprove(selectedBusiness.id)}
                                >
                                    <Text style={styles.buttonText}>Onayla</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
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
    listContent: {
        padding: SIZES.medium,
        paddingBottom: 100
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.medium,
        marginBottom: SIZES.medium,
        ...SHADOWS.light,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.small,
    },
    businessName: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    address: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginBottom: 4,
    },
    phone: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginBottom: SIZES.medium,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: SIZES.small,
        flexWrap: 'wrap'
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SIZES.small,
        borderRadius: SIZES.radius,
        gap: 6,
        minWidth: 80
    },
    approveButton: {
        backgroundColor: COLORS.success,
    },
    rejectButton: {
        backgroundColor: COLORS.error,
    },
    detailsButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.primary
    },
    closeButton: {
        backgroundColor: COLORS.border,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: SIZES.small,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginTop: SIZES.extraLarge,
    },
    // MODAL STYLES
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '70%',
        padding: SIZES.medium,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.medium,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: SIZES.small
    },
    modalTitle: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    modalBody: {
        flex: 1,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: SIZES.medium,
        paddingTop: SIZES.medium,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.medium,
        gap: 10
    },
    detailText: {
        fontSize: SIZES.medium,
        color: COLORS.text,
        flex: 1
    },
    sectionHeader: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        marginTop: SIZES.medium,
        marginBottom: SIZES.small,
        color: COLORS.text
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    amenityChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: COLORS.primary + '20', // %20 opacity
        borderWidth: 1,
        borderColor: COLORS.primary
    },
    amenityText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold'
    }
});

export default AdminScreen;
