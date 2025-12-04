// src/components/Header.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const Header = ({ title, onBackPress, rightIcon, onRightPress }) => {
    return (
        <View style={styles.container}>
            {onBackPress ? (
                <TouchableOpacity onPress={onBackPress} style={styles.button}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
            )}

            <Text style={styles.title}>{title}</Text>

            {rightIcon ? (
                <TouchableOpacity onPress={onRightPress} style={styles.button}>
                    <Ionicons name={rightIcon} size={24} color={COLORS.primary} />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.medium,
        backgroundColor: COLORS.surface,
        ...SHADOWS.light,
    },
    title: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    button: {
        padding: SIZES.small,
    },
    placeholder: {
        width: 40,
    },
});

export default Header;
