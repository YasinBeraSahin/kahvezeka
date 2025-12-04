import { COLORS } from './colors';

export const THEME = {
    colors: COLORS,

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },

    // Border radius
    borderRadius: {
        small: 4,
        medium: 8,
        large: 12,
        round: 50,
    },

    // Typography
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: 'bold',
            color: COLORS.primaryBrown,
        },
        h2: {
            fontSize: 24,
            fontWeight: 'bold',
            color: COLORS.primaryBrown,
        },
        h3: {
            fontSize: 18,
            fontWeight: '600',
            color: COLORS.primaryBrown,
        },
        body: {
            fontSize: 16,
            color: COLORS.textPrimary,
        },
        caption: {
            fontSize: 14,
            color: COLORS.textSecondary,
        },
        small: {
            fontSize: 12,
            color: COLORS.textLight,
        },
    },

    // Shadows
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
        },
    },
};
