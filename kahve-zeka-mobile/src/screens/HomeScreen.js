// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, StatusBar, SafeAreaView, RefreshControl, ScrollView } from 'react-native';
import SearchBar from '../components/SearchBar';
import RadiusFilter from '../components/RadiusFilter';
import CoffeeMapView from '../components/CoffeeMapView';
import NearbyList from '../components/NearbyList';
import FilterModal from '../components/FilterModal';
import BusinessCardSkeleton from '../components/BusinessCardSkeleton';
import { getCurrentLocation } from '../utils/location';
import { getNearbyBusinesses, getBusinessDetail } from '../services/api';
import { COLORS, SIZES } from '../constants/theme';

const HomeScreen = ({ navigation }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRadius, setSelectedRadius] = useState(5);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        has_wifi: false,
        has_socket: false,
        is_pet_friendly: false,
        is_quiet: false,
        serves_food: false,
        has_board_games: false,
        sortBy: 'distance' // Default sort
    });

    useEffect(() => {
        loadUserLocation();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (userLocation) {
                loadNearbyBusinesses();
            }
        }, 500); // Debounce search by 500ms

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, userLocation, selectedRadius, filters.sortBy]); // Add filters.sortBy to dependency if we want immediate sort, but onApply handles it too. 
    // Actually, onApply calls loadNearbyBusinesses which uses current filters.

    const loadUserLocation = async () => {
        try {
            setLoading(true);
            const location = await getCurrentLocation();
            setUserLocation(location);
        } catch (error) {
            Alert.alert('Konum Hatası', 'Konumunuz alınamadı.');
            setLoading(false);
        }
    };

    const loadNearbyBusinesses = async (isPullRefresh = false, retryCount = 0) => {
        try {
            if (isPullRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            // Backend call (filters only has boolean flags + query)
            // We pass filters as is, backend ignores 'sortBy' if not expecting it, which is fine.
            const data = await getNearbyBusinesses(
                userLocation.latitude,
                userLocation.longitude,
                selectedRadius,
                { ...filters, search_query: searchTerm }
            );

            // Production API fix: Fetch details for each business to get reviews and calculate rating
            let enrichedData = await Promise.all(data.map(async (item) => {
                try {
                    const detail = await getBusinessDetail(item.business.id);
                    let average_rating = 0;
                    let review_count = 0;

                    if (detail.reviews && detail.reviews.length > 0) {
                        const totalRating = detail.reviews.reduce((sum, review) => sum + review.rating, 0);
                        average_rating = totalRating / detail.reviews.length;
                        review_count = detail.reviews.length;
                    }

                    return {
                        ...item,
                        business: {
                            ...item.business,
                            average_rating: average_rating,
                            review_count: review_count
                        }
                    };
                } catch (e) {
                    console.log('Error fetching detail for', item.business.name);
                    return item;
                }
            }));

            // --- CLIENT SIDE SORTING ---
            if (filters.sortBy === 'rating') {
                enrichedData.sort((a, b) => b.business.average_rating - a.business.average_rating);
            } else if (filters.sortBy === 'reviews') {
                enrichedData.sort((a, b) => b.business.review_count - a.business.review_count);
            } else {
                // Default 'distance' - Backend already returns sorted by distance, but let's ensure
                enrichedData.sort((a, b) => a.distance_km - b.distance_km);
            }

            setBusinesses(enrichedData);
            setFilteredBusinesses(enrichedData);
        } catch (error) {
            console.log('İşletmeler yüklenemedi', error);

            // Retry logic for Render cold start
            if (retryCount < 2 && (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
                console.log(`Retrying... (${retryCount + 1}/2)`);
                setTimeout(() => {
                    loadNearbyBusinesses(isPullRefresh, retryCount + 1);
                }, 3000); // Wait 3 seconds before retry
                return; // Don't show error yet
            }

            Alert.alert(
                'Bağlantı Hatası',
                'Sunucu uyanıyor, lütfen birkaç saniye bekleyip tekrar deneyin. (Pull-to-refresh ile yenileyebilirsiniz)',
                [
                    { text: 'Tamam' },
                    { text: 'Tekrar Dene', onPress: () => loadNearbyBusinesses(true) }
                ]
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        loadNearbyBusinesses(true);
    };

    const handleBusinessPress = (business) => {
        navigation.navigate('businessDetail', { businessId: business.id });
    };

    if (loading && !userLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Konumunuz alınıyor...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Üst Kısım: Arama ve Filtre */}
            <View style={styles.headerContainer}>
                <SearchBar
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    onFilterPress={() => setFilterModalVisible(true)}
                />
                <RadiusFilter
                    selectedRadius={selectedRadius}
                    onSelectRadius={setSelectedRadius}
                />
            </View>

            {/* Harita */}
            <View style={styles.mapContainer}>
                <CoffeeMapView
                    userLocation={userLocation}
                    businesses={filteredBusinesses}
                    radius={selectedRadius}
                    onBusinessPress={handleBusinessPress}
                />
            </View>

            {/* Alt Liste (Yatay) */}
            <View style={styles.listContainer}>
                {loading && !refreshing ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: SIZES.medium }}>
                        <BusinessCardSkeleton />
                        <BusinessCardSkeleton />
                        <BusinessCardSkeleton />
                    </ScrollView>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={COLORS.primary}
                            />
                        }
                    >
                        <NearbyList
                            businesses={filteredBusinesses}
                            onBusinessPress={handleBusinessPress}
                        />
                    </ScrollView>
                )}
            </View>


            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                filters={filters}
                setFilters={setFilters}
                onApply={() => {
                    loadNearbyBusinesses();
                }}
            />
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: SIZES.base,
        color: COLORS.textSecondary,
    },
    headerContainer: {
        paddingTop: SIZES.base,
        backgroundColor: COLORS.background,
        zIndex: 1,
    },
    mapContainer: {
        flex: 1,
        marginHorizontal: SIZES.base,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        marginBottom: SIZES.base,
    },
    listContainer: {
        height: 180, // Liste yüksekliği
        backgroundColor: COLORS.background,
    },
});

export default HomeScreen;
