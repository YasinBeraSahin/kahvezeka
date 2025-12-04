import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const FilterModal = ({ visible, onClose, filters, setFilters, onApply }) => {

    const toggleFilter = (key) => {
        setFilters(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const renderFilterItem = (label, key, icon) => (
        <View style={styles.filterItem}>
            <View style={styles.filterLabelContainer}>
                <Ionicons name={icon} size={24} color={COLORS.text} style={styles.filterIcon} />
                <Text style={styles.filterLabel}>{label}</Text>
            </View>
            <Switch
                value={filters[key]}
                onValueChange={() => toggleFilter(key)}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.surface}
            />
        </View>
    );

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
                        <Text style={styles.title}>Filtrele</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView}>
                        {renderFilterItem('Wi-Fi Var', 'has_wifi', 'wifi')}
                        {renderFilterItem('Priz Var', 'has_socket', 'battery-charging')}
                        {renderFilterItem('Hayvan Dostu', 'is_pet_friendly', 'paw')}
                        {renderFilterItem('Sessiz Ortam', 'is_quiet', 'library')}
                        {renderFilterItem('Yemek Servisi', 'serves_food', 'restaurant')}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => setFilters({
                                has_wifi: false,
                                has_socket: false,
                                is_pet_friendly: false,
                                is_quiet: false,
                                serves_food: false
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
        borderTopLeftRadius: SIZES.large,
        borderTopRightRadius: SIZES.large,
        padding: SIZES.large,
        maxHeight: '70%',
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
    scrollView: {
        marginBottom: SIZES.large,
    },
    filterItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SIZES.medium,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    filterLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterIcon: {
        marginRight: SIZES.medium,
        width: 30,
        textAlign: 'center'
    },
    filterLabel: {
        fontSize: SIZES.medium,
        color: COLORS.text,
    },
    footer: {
        flexDirection: 'row',
        gap: SIZES.medium,
        paddingTop: SIZES.medium,
    },
    resetButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: 'center',
    },
    resetButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: SIZES.medium,
    },
    applyButton: {
        flex: 2,
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
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
