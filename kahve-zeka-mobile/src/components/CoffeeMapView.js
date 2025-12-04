// src/components/CoffeeMapView.js
import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const CoffeeMapView = ({
    userLocation,
    businesses = [],
    radius = 5,
    onBusinessPress
}) => {
    if (!userLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const mapHTML = useMemo(() => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { width: 100%; height: 100vh; }
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 8px;
                    padding: 0;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                }
                .custom-popup .leaflet-popup-content {
                    margin: 10px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map', {zoomControl: false}).setView([${userLocation.latitude}, ${userLocation.longitude}], 14);

                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    subdomains: 'abcd',
                    maxZoom: 20
                }).addTo(map);

                var userIcon = L.divIcon({
                    className: 'user-marker',
                    html: '<div style="background-color: ${COLORS.secondary}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.4);"></div>',
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                });

                L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon}).addTo(map);

                L.circle([${userLocation.latitude}, ${userLocation.longitude}], {
                    color: '${COLORS.secondary}',
                    fillColor: '${COLORS.secondary}',
                    fillOpacity: 0.05,
                    weight: 1,
                    radius: ${radius * 1000}
                }).addTo(map);

                var businesses = ${JSON.stringify(businesses)};
                
                var coffeeIcon = L.divIcon({
                    className: 'coffee-marker',
                    html: '<div style="background-color: ${COLORS.primary}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; justify-content: center; align-items: center; color: white; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">☕</div>',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });

                businesses.forEach(function(item) {
                    var marker = L.marker([item.business.latitude, item.business.longitude], {icon: coffeeIcon})
                        .addTo(map)
                        .bindPopup('<b>' + item.business.name + '</b><br>⭐ ' + (item.business.average_rating ? item.business.average_rating.toFixed(1) : '0.0'), {
                            className: 'custom-popup'
                        });
                    
                    marker.on('popupopen', function() {
                        var popupContent = document.querySelector('.leaflet-popup-content');
                        popupContent.onclick = function() {
                            window.ReactNativeWebView.postMessage(JSON.stringify(item.business));
                        };
                    });
                });

                if (businesses.length > 0) {
                    var group = new L.featureGroup(businesses.map(b => L.marker([b.business.latitude, b.business.longitude])));
                    map.fitBounds(group.getBounds().pad(0.1));
                }
            </script>
        </body>
        </html>
    `, [userLocation, businesses, radius]);

    const handleMessage = (event) => {
        try {
            const business = JSON.parse(event.nativeEvent.data);
            if (business && onBusinessPress) {
                onBusinessPress(business);
            }
        } catch (error) {
            console.error('Harita mesaj hatası:', error);
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={['*']}
                source={{ html: mapHTML }}
                style={styles.map}
                onMessage={handleMessage}
                scrollEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
});

export default CoffeeMapView;
