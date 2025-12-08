// src/components/BusinessCardSkeleton.js
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const BusinessCardSkeleton = () => {
    const shimmerAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.imagePlaceholder, { opacity }]} />
            <View style={styles.content}>
                <Animated.View style={[styles.titlePlaceholder, { opacity }]} />
                <Animated.View style={[styles.textPlaceholder, { opacity }]} />
                <Animated.View style={[styles.smallTextPlaceholder, { opacity }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 300,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        marginRight: SIZES.medium,
        padding: SIZES.medium,
        flexDirection: 'row',
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.border,
    },
    content: {
        flex: 1,
        marginLeft: SIZES.medium,
        justifyContent: 'space-around',
    },
    titlePlaceholder: {
        height: 20,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        marginBottom: 8,
    },
    textPlaceholder: {
        height: 14,
        width: '80%',
        backgroundColor: COLORS.border,
        borderRadius: 4,
        marginBottom: 8,
    },
    smallTextPlaceholder: {
        height: 14,
        width: '60%',
        backgroundColor: COLORS.border,
        borderRadius: 4,
    },
});

export default BusinessCardSkeleton;
