import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import { THEME } from '../constants/theme';

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
            {item.image_url && (
                <Image
                    source={{ uri: item.image_url }}
                    style={styles.itemImage}
                />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={menuItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false} // Parent ScrollView handles scrolling
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContainer: {
        padding: THEME.spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...THEME.typography.body,
        color: THEME.colors.textSecondary,
    },
    menuItem: {
        flexDirection: 'row',
        paddingVertical: THEME.spacing.md,
        alignItems: 'center',
    },
    itemInfo: {
        flex: 1,
        paddingRight: THEME.spacing.md,
    },
    itemName: {
        ...THEME.typography.h3,
        marginBottom: 4,
    },
    itemDescription: {
        ...THEME.typography.caption,
        color: THEME.colors.textSecondary,
        marginBottom: 8,
    },
    itemPrice: {
        ...THEME.typography.h3,
        color: THEME.colors.primaryBrown,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: THEME.borderRadius.small,
        backgroundColor: '#eee',
    },
    separator: {
        height: 1,
        backgroundColor: THEME.colors.border,
    },
});

export default MenuTab;
