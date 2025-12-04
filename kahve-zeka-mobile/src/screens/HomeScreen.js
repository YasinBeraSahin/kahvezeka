// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, StatusBar, SafeAreaView } from 'react-native';
import SearchBar from '../components/SearchBar';
import RadiusFilter from '../components/RadiusFilter';
import CoffeeMapView from '../components/CoffeeMapView';
import NearbyList from '../components/NearbyList';
import FilterModal from '../components/FilterModal';
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
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        has_wifi: false,
        has_socket: false,
        is_pet_friendly: false,
        is_quiet: false,
        serves_food: false
    });

    useEffect(() => {
        loadUserLocation();
    }, []);

    useEffect(() => {
        if (userLocation) {
            loadNearbyBusinesses();
        }
    }, [userLocation, selectedRadius]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredBusinesses(businesses);
        } else {
            const filtered = businesses.filter((item) =>
                item.business.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredBusinesses(filtered);
        }
    }, [searchTerm, businesses]);

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

    const loadNearbyBusinesses = async () => {
        try {
            setLoading(true);
            const data = await getNearbyBusinesses(
                userLocation.latitude,
                userLocation.longitude,
                selectedRadius,
                filters
            );

            // Production API fix: Fetch details for each business to get reviews and calculate rating
            const enrichedData = await Promise.all(data.map(async (item) => {
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

            setBusinesses(enrichedData);
            setFilteredBusinesses(enrichedData);
        } catch (error) {
            console.log('İşletmeler yüklenemedi', error);
            Alert.alert('Hata', 'İşletmeler yüklenirken bir sorun oluştu. Lütfen internet bağlantınızı kontrol edin.');
        } finally {
            setLoading(false);
        }
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
                {loading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    <NearbyList
                        businesses={filteredBusinesses}
                        onBusinessPress={handleBusinessPress}
                    />
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
