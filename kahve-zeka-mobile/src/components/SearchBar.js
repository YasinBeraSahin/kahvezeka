// src/components/SearchBar.js
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const SearchBar = ({ value, onChangeText, onFilterPress, placeholder = 'Kahve ara...' }) => {
    return (
        <View style={styles.container}>
            <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChangeText}
                />
                <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
                    <Ionicons name="options-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.base,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.medium,
        height: 50,
        ...SHADOWS.light,
    },
    searchIcon: {
        marginRight: SIZES.small,
    },
    input: {
        flex: 1,
        height: '100%',
        color: COLORS.text,
        fontSize: SIZES.font,
    },
    filterButton: {
        padding: SIZES.base,
    },
});

export default SearchBar;
