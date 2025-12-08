import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const FilterModal = ({ visible, onClose, filters, setFilters, onApply }) => {

    const toggleFilter = (key) => {
        setFilters(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const setSort = (key) => {
        setFilters(prev => ({
            ...prev,
            sortBy: key
        }));
    };

    const renderChip = (label, key, icon) => {
        const isActive = filters[key];
        return (
            <TouchableOpacity
                style={[styles.chip, isActive && styles.activeChip]}
                onPress={() => toggleFilter(key)}
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color={isActive ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[styles.chipText, isActive && styles.activeChipText]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    const renderSortOption = (label, key) => {
        const isSelected = (filters.sortBy || 'distance') === key;
        return (
            <TouchableOpacity
                style={[styles.sortOption, isSelected && styles.activeSortOption]}
                onPress={() => setSort(key)}
            >
                <View style={styles.radioButton}>
                    {isSelected && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={[styles.sortText, isSelected && styles.activeSortText]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Filtrele & Sırala</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                        {/* Özellikler Bölümü */}
                        <Text style={styles.sectionTitle}>Mekan Özellikleri</Text>
                        <View style={styles.chipContainer}>
                            {renderChip('Wi-Fi', 'has_wifi', 'wifi')}
                            {renderChip('Priz', 'has_socket', 'battery-charging')}
                            {renderChip('Hayvan', 'is_pet_friendly', 'paw')}
                            {renderChip('Sessiz', 'is_quiet', 'library')}
                            {renderChip('Yemek', 'serves_food', 'restaurant')}
                        </View>

                        <View style={styles.divider} />

                        {/* Sıralama Bölümü */}
                        <Text style={styles.sectionTitle}>Sıralama</Text>
                        <View style={styles.sortContainer}>
                            {renderSortOption('En Yakın', 'distance')}
                            {renderSortOption('En Yüksek Puan', 'rating')}
                            {renderSortOption('En Çok Yorum', 'reviews')}
                        </View>

                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => setFilters({
                                has_wifi: false,
                                has_socket: false,
                                is_pet_friendly: false,
                                is_quiet: false,
                                serves_food: false,
                                sortBy: 'distance'
                            })}
                        >
                            <Text style={styles.resetButtonText}>Sıfırla</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => {
                                onApply();
                                onClose();
                            }}
                        >
                            <Text style={styles.applyButtonText}>Uygula</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SIZES.large,
        maxHeight: '85%',
        ...SHADOWS.medium,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.large,
    },
    title: {
        fontSize: SIZES.extraLarge,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        padding: 4,
    },
    scrollView: {
        marginBottom: SIZES.large,
    },
    sectionTitle: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.medium,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SIZES.small,
        marginBottom: SIZES.small,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        gap: 6,
    },
    activeChip: {
        borderColor: COLORS.primary,
        backgroundColor: '#FFF0E0', // Light orange
    },
    chipText: {
        fontSize: SIZES.font,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    activeChipText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SIZES.large,
    },
    sortContainer: {
        gap: SIZES.medium,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    activeSortOption: {

    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.textSecondary,
        marginRight: SIZES.small,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    activeSortText: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    sortText: {
        fontSize: SIZES.font,
        color: COLORS.text,
    },
    footer: {
        flexDirection: 'row',
        gap: SIZES.medium,
        marginTop: SIZES.small,
    },
    resetButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    resetButtonText: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        fontSize: SIZES.medium,
    },
    applyButton: {
        flex: 2,
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        ...SHADOWS.light,
    },
    applyButtonText: {
        color: COLORS.surface,
        fontWeight: 'bold',
        fontSize: SIZES.medium,
    },
});

export default FilterModal;
