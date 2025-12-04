// src/components/MenuTab.js
import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const MenuTab = ({ business }) => {
    const menuItems = business?.menu_items || [];

    if (menuItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz menü eklenmemiş.</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.menuItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description || 'Açıklama bulunmuyor.'}
                </Text>
                <Text style={styles.itemPrice}>{item.price} ₺</Text>
            </View>
            {item.image_url ? (
                <Image
                    source={{ uri: item.image_url }}
                    style={styles.itemImage}
                />
            ) : (
                <View style={[styles.itemImage, { backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 24 }}>☕</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={menuItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
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
    menuItem: {
        flexDirection: 'row',
        paddingVertical: SIZES.medium,
        alignItems: 'center',
    },
    itemInfo: {
        flex: 1,
        paddingRight: SIZES.medium,
    },
    itemName: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    itemPrice: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: SIZES.radius,
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.border,
    },
});

export default MenuTab;
