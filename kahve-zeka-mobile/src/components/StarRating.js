import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

const StarRating = ({ rating, size = 16, color = THEME.colors.warning }) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
        let iconName = 'star-outline';
        if (rating >= i) {
            iconName = 'star';
        } else if (rating >= i - 0.5) {
            iconName = 'star-half';
        }

        stars.push(
            <Ionicons key={i} name={iconName} size={size} color={color} style={{ marginRight: 2 }} />
        );
    }

    return (
        <View style={styles.container}>
            {stars}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default StarRating;
