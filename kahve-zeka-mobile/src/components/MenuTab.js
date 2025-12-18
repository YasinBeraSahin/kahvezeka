// src/components/MenuTab.js
import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { getImageUrl } from '../utils/image';


const MenuTab = ({ business }) => {
    const menuItems = business?.menu_items || [];

    if (menuItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz menü eklenmemiş.</Text>
            </View>
        );
    }

    const categories = ['Sıcak', 'Soğuk', 'Çay', 'Soğuk İçecek', 'Fresh / Smoothie', 'Tatlı', 'Atıştırmalık', 'Sandviç', 'Diğer'];

    return (
        <View style={styles.container}>
            {categories.map(category => {
                const itemsInCat = menuItems.filter(item => {
                    if (category === 'Diğer') {
                        return !item.category || !['Sıcak', 'Soğuk', 'Çay', 'Soğuk İçecek', 'Fresh / Smoothie', 'Tatlı', 'Atıştırmalık', 'Sandviç'].includes(item.category);
                    }
                    return item.category === category;
                });

                if (itemsInCat.length === 0) return null;

                return (
                    <View key={category} style={styles.categorySection}>
                        <Text style={styles.categoryHeader}>
                            {category === 'Sıcak' && '☕ Sıcak Kahveler'}
                            {category === 'Soğuk' && '❄️ Soğuk Kahveler'}
                            {category === 'Çay' && '🍵 Çaylar'}
                            {category === 'Soğuk İçecek' && '🥤 Soğuk İçecekler'}
                            {category === 'Fresh / Smoothie' && '🍹 Fresh / Smoothie'}
                            {category === 'Tatlı' && '🍰 Tatlılar'}
                            {category === 'Atıştırmalık' && '🍪 Atıştırmalıklar'}
                            {category === 'Sandviç' && '🥪 Sandviçler'}
                            {category === 'Diğer' && '📦 Diğer'}
                        </Text>
                        {itemsInCat.map((item, index) => (
                            <View key={item.id} style={styles.menuItem}>
                                <View style={styles.itemInfo}>
                                    <View style={styles.namePriceRow}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemPrice}>{item.price} ₺</Text>
                                    </View>
                                    <Text style={styles.itemDescription} numberOfLines={2}>
                                        {item.description || 'Açıklama bulunmuyor.'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.medium,
        ...SHADOWS.light,
    },
    emptyContainer: {
        padding: SIZES.extraLarge,
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.font,
    },
    categorySection: {
        marginBottom: SIZES.large,
    },
    categoryHeader: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SIZES.small,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 4,
    },
    menuItem: {
        paddingVertical: SIZES.small,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    itemInfo: {
        flex: 1,
    },
    namePriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemName: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
    },
    itemPrice: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginLeft: 8,
    },
    itemDescription: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
});

export default MenuTab;
