import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

const RadiusFilter = ({ selectedRadius, onSelectRadius }) => {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {RADIUS_OPTIONS.map((radius) => (
                    <TouchableOpacity
                        key={radius}
                        style={[
                            styles.chip,
                            selectedRadius === radius && styles.chipSelected,
                        ]}
                        onPress={() => onSelectRadius(radius)}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                selectedRadius === radius && styles.chipTextSelected,
                            ]}
                        >
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
        backgroundColor: THEME.colors.background,
        paddingVertical: THEME.spacing.xs,
    },
    scrollContent: {
        paddingHorizontal: THEME.spacing.md,
        gap: THEME.spacing.sm,
    },
    chip: {
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.large,
        borderWidth: 1.5,
        borderColor: THEME.colors.primaryBrown,
        backgroundColor: THEME.colors.cardBackground,
    },
    chipSelected: {
        backgroundColor: THEME.colors.primaryBrown,
    },
    chipText: {
        ...THEME.typography.caption,
        color: THEME.colors.primaryBrown,
        fontWeight: '600',
    },
    chipTextSelected: {
        color: THEME.colors.cardBackground,
    },
});

export default RadiusFilter;
