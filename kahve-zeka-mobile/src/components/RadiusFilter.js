// src/components/RadiusFilter.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

const RadiusFilter = ({ selectedRadius, onSelectRadius }) => {
    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {RADIUS_OPTIONS.map((radius) => (
                    <TouchableOpacity
                        key={radius}
                        style={[
                            styles.chip,
                            selectedRadius === radius && styles.selectedChip
                        ]}
                        onPress={() => onSelectRadius(radius)}
                    >
                        <Text style={[
                            styles.chipText,
                            selectedRadius === radius && styles.selectedChipText
                        ]}>
                            {radius} km
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SIZES.base,
    },
    scrollContent: {
        paddingHorizontal: SIZES.padding,
        gap: SIZES.base,
    },
    chip: {
        paddingHorizontal: SIZES.medium,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    selectedChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        color: COLORS.text,
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    selectedChipText: {
        color: COLORS.surface,
    },
});

export default RadiusFilter;
