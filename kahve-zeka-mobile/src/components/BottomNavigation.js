import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

const BottomNavigation = ({ activeTab = 'home', onTabPress }) => {
    const tabs = [
        { id: 'home', icon: 'home', iconOutline: 'home-outline' },
        { id: 'search', icon: 'search', iconOutline: 'search-outline' },
        { id: 'favorites', icon: 'star', iconOutline: 'star-outline' },
        { id: 'profile', icon: 'person', iconOutline: 'person-outline' },
        { id: 'settings', icon: 'settings', iconOutline: 'settings-outline' },
    ];

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
                            color={isActive ? THEME.colors.primaryBrown : THEME.colors.textLight}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.cardBackground,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.border,
        paddingBottom: 20, // Safe area için
        paddingTop: THEME.spacing.sm,
        ...THEME.shadows.medium,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: THEME.spacing.sm,
    },
});

export default BottomNavigation;
