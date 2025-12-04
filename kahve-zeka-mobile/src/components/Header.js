import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

const Header = ({ onMenuPress, onProfilePress, location }) => {
    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                {/* Hamburger Menu */}
                <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
                    <Ionicons name="menu" size={28} color={THEME.colors.primaryBrown} />
                </TouchableOpacity>

                {/* Logo */}
                <Text style={styles.logo}>Kahve Zeka</Text>

                {/* Profile Icon */}
                <TouchableOpacity onPress={onProfilePress} style={styles.iconButton}>
                    <Ionicons name="person-circle-outline" size={28} color={THEME.colors.primaryBrown} />
                </TouchableOpacity>
            </View>

            {/* Location */}
            {location && (
                <View style={styles.locationRow}>
                    <Ionicons name="location" size={16} color={THEME.colors.textSecondary} />
                    <Text style={styles.locationText}>{location}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: THEME.colors.cardBackground,
        paddingTop: 50, // Status bar için
        paddingHorizontal: THEME.spacing.md,
        paddingBottom: THEME.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.border,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: THEME.spacing.xs,
    },
    iconButton: {
        padding: THEME.spacing.xs,
    },
    logo: {
        ...THEME.typography.h2,
        fontSize: 24,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: THEME.spacing.xs,
    },
    locationText: {
        ...THEME.typography.caption,
        marginLeft: 4,
    },
});

export default Header;
