// src/components/StarRating.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const StarRating = ({ rating, size = 14 }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        let name = 'star';
        if (i > rating) {
            name = 'star-outline';
        } else if (i - 0.5 === rating) {
            name = 'star-half';
        }
        stars.push(
            <Ionicons
                key={i}
                name={name}
                size={size}
                color={COLORS.warning}
                style={{ marginRight: 2 }}
            />
        );
    }

    return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
});

export default StarRating;
