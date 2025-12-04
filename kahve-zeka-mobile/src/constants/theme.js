// src/constants/theme.js

export const COLORS = {
    primary: '#4E342E', // Rich Coffee Brown
    secondary: '#FFB300', // Gold/Amber
    background: '#FAFAFA', // Warm/Creamy Background
    surface: '#FFFFFF', // Card Background
    text: '#212121', // Primary Text
    textSecondary: '#757575', // Secondary Text
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#FBC02D',
    border: '#E0E0E0',
    overlay: 'rgba(0, 0, 0, 0.5)', // For modal/loading overlays
};

export const FONTS = {
    // React Native'de fontlar genellikle yüklenip isimle çağrılır.
    // Şimdilik sistem fontlarını kullanacağız, ileride özel font eklenebilir.
    regular: 'System',
    medium: 'System',
    bold: 'System',
    // Eğer özel font yüklersek burayı güncelleyeceğiz (örn: 'Outfit-Regular')
};

export const SIZES = {
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 18,
    extraLarge: 24,
    radius: 12, // Card border radius
    padding: 16,
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6.27,
        elevation: 5,
    },
};

export default {
    COLORS,
    FONTS,
    SIZES,
    SHADOWS,
};
