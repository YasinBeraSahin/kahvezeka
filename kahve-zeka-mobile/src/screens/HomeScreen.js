import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import RadiusFilter from '../components/RadiusFilter';
import CoffeeMapView from '../components/CoffeeMapView';
import NearbyList from '../components/NearbyList';
import BottomNavigation from '../components/BottomNavigation';
import { getCurrentLocation } from '../utils/location';
import { getNearbyBusinesses } from '../services/api';
import { THEME } from '../constants/theme';

const HomeScreen = ({ navigate, goBack }) => {
    // State
    const [userLocation, setUserLocation] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRadius, setSelectedRadius] = useState(5);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home');
    const [locationName, setLocationName] = useState('Konum alınıyor...');

    // Konum al ve işletmeleri yükle
    useEffect(() => {
        loadUserLocation();
    }, []);

    // Konum veya yarıçap değiştiğinde işletmeleri yeniden yükle
    useEffect(() => {
        if (userLocation) {
            loadNearbyBusinesses();
        }
    }, [userLocation, selectedRadius]);

    // Arama filtresi
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
            setLocationName('Konumunuz'); // Gerçek konum adı için reverse geocoding eklenebilir
        } catch (error) {
            Alert.alert(
                'Konum Hatası',
                'Konumunuz alınamadı. Lütfen konum izinlerini kontrol edin.',
                [{ text: 'Tamam' }]
            );
            setLoading(false);
        }
    };

    const loadNearbyBusinesses = async () => {
        try {
            setLoading(true);
            const data = await getNearbyBusinesses(
                userLocation.latitude,
                userLocation.longitude,
                selectedRadius
            );
            setBusinesses(data);
            setFilteredBusinesses(data);
        } catch (error) {
            Alert.alert(
                'Hata',
                'Yakındaki işletmeler yüklenirken bir hata oluştu.',
                [{ text: 'Tamam' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBusinessPress = (business) => {
        navigate('businessDetail', { businessId: business.id });
    };

    const handleMenuPress = () => {
        Alert.alert('Menü', 'Menü açılacak', [{ text: 'Tamam' }]);
    };

    const handleProfilePress = () => {
        navigate('profile');
    };

    const handleFilterPress = () => {
        Alert.alert('Filtre', 'Filtre seçenekleri gösterilecek', [{ text: 'Tamam' }]);
    };



    // Yükleniyor ekranı
    if (loading && !userLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME.colors.primaryBrown} />
                <Text style={styles.loadingText}>Konumunuz alınıyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header
                onMenuPress={handleMenuPress}
                onProfilePress={handleProfilePress}
                location={locationName}
            />

            {/* Scrollable Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <SearchBar
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    onFilterPress={handleFilterPress}
                />

                {/* Radius Filter */}
                <RadiusFilter
                    selectedRadius={selectedRadius}
                    onSelectRadius={setSelectedRadius}
                />

                {/* Map */}
                <CoffeeMapView
                    userLocation={userLocation}
                    businesses={filteredBusinesses}
                    radius={selectedRadius}
                    onBusinessPress={handleBusinessPress}
                />

                {/* Loading indicator for businesses */}
                {loading && (
                    <View style={styles.businessLoading}>
                        <ActivityIndicator size="small" color={THEME.colors.primaryBrown} />
                        <Text style={styles.loadingText}>Yakındaki mekanlar yükleniyor...</Text>
                    </View>
                )}

                {/* Nearby List */}
                {!loading && (
                    <NearbyList
                        businesses={filteredBusinesses}
                        onBusinessPress={handleBusinessPress}
                    />
                )}

                {/* No results message */}
                {!loading && filteredBusinesses.length === 0 && (
                    <View style={styles.noResults}>
                        <Text style={styles.noResultsText}>
                            {searchTerm
                                ? `"${searchTerm}" ile eşleşen mekan bulunamadı.`
                                : `Seçili yarıçapta (${selectedRadius}km) kayıtlı mekan bulunamadı.`}
                        </Text>
                    </View>
                )}
            </ScrollView>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.background,
    },
    loadingText: {
        ...THEME.typography.body,
        marginTop: THEME.spacing.md,
        color: THEME.colors.textSecondary,
    },
    businessLoading: {
        padding: THEME.spacing.lg,
        alignItems: 'center',
    },
    noResults: {
        padding: THEME.spacing.lg,
        alignItems: 'center',
    },
    noResultsText: {
        ...THEME.typography.body,
        color: THEME.colors.textSecondary,
        textAlign: 'center',
    },
});

export default HomeScreen;
