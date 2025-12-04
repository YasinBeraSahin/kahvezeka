import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

const SearchBar = ({ value, onChangeText, onFilterPress, placeholder = 'Kahve ara...' }) => {
    return (
        <View style={styles.container}>
            <View style={styles.searchBox}>
                {/* Search Icon */}
                <Ionicons name="search" size={20} color={THEME.colors.textLight} style={styles.searchIcon} />

                {/* Input */}
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={THEME.colors.textLight}
                    value={value}
                    onChangeText={onChangeText}
                />

                {/* Filter Button */}
                <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
                    <Ionicons name="options" size={20} color={THEME.colors.primaryBrown} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.sm,
        backgroundColor: THEME.colors.background,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.cardBackground,
        borderRadius: THEME.borderRadius.medium,
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.sm,
        ...THEME.shadows.small,
    },
    searchIcon: {
        marginRight: THEME.spacing.sm,
    },
    input: {
        flex: 1,
        ...THEME.typography.body,
        paddingVertical: THEME.spacing.xs,
    },
    filterButton: {
        padding: THEME.spacing.xs,
    },
});

export default SearchBar;
