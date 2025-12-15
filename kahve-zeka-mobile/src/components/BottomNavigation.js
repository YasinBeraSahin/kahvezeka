// src/components/BottomNavigation.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const BottomNavigation = ({ activeTab = 'home', onTabPress, isAdmin, isOwner }) => {
    const tabs = [
        { id: 'home', icon: 'home', iconOutline: 'home-outline', label: 'Ana Sayfa' },
        { id: 'chat', icon: 'chatbubbles', iconOutline: 'chatbubbles-outline', label: 'Asistan' },
        { id: 'profile', icon: 'person', iconOutline: 'person-outline', label: 'Profil' },
    ];

    // Admin ise Admin sekmesini ekle
    if (isAdmin) {
        tabs.splice(1, 0, { id: 'admin', icon: 'shield-checkmark', iconOutline: 'shield-checkmark-outline', label: 'Yönetici' });
    }

    // İşletme sahibi ise Panel sekmesini ekle
    if (isOwner) {
        tabs.splice(1, 0, { id: 'businessManagement', icon: 'briefcase', iconOutline: 'briefcase-outline', label: 'Panelim' });
    }

    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <TouchableOpacity
                        key={tab.id}
                        style={styles.tab}
                        onPress={() => onTabPress && onTabPress(tab.id)}
                    >
                        <Ionicons
                            name={isActive ? tab.icon : tab.iconOutline}
                            size={24}
                            color={isActive ? COLORS.primary : COLORS.textSecondary}
                        />
                        <Text style={[
                            styles.label,
                            { color: isActive ? COLORS.primary : COLORS.textSecondary }
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingBottom: 20, // Safe area
        paddingTop: 10,
        ...SHADOWS.medium,
        justifyContent: 'space-around', // Tabları yay
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        minWidth: 60,
    },
    label: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '600',
    }
});

export default BottomNavigation;
