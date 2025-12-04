import * as Location from 'expo-location';

// Konum izni iste
export const requestLocationPermission = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Konum izni hatası:', error);
        return false;
    }
};

// Kullanıcının mevcut konumunu al
export const getCurrentLocation = async () => {
    try {
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            throw new Error('Konum izni reddedildi');
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    } catch (error) {
        console.error('Konum alınırken hata:', error);
        throw error;
    }
};

// İki nokta arasındaki mesafeyi hesapla (km)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

const toRad = (value) => {
    return (value * Math.PI) / 180;
};
