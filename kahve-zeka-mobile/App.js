import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BusinessDetailScreen from './src/screens/BusinessDetailScreen';
import AddReviewScreen from './src/screens/AddReviewScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Components
import BottomNavigation from './src/components/BottomNavigation';
import { AuthProvider } from './src/contexts/AuthContext';

import { THEME } from './src/constants/theme';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [screenParams, setScreenParams] = useState({});

  // Basit navigasyon fonksiyonu
  const navigate = (screenName, params = {}) => {
    setCurrentScreen(screenName);
    setScreenParams(params);
  };

  // Geri gitme fonksiyonu
  const goBack = () => {
    setCurrentScreen('home');
    setScreenParams({});
  };

  // Ekranları render et
  const renderScreen = () => {
    const navigationProps = { navigate, goBack, params: screenParams };

    switch (currentScreen) {
      case 'home':
        return <HomeScreen {...navigationProps} />;
      case 'profile':
        return <ProfileScreen {...navigationProps} />;
      case 'businessDetail':
        return <BusinessDetailScreen {...navigationProps} />;
      case 'addReview':
        return <AddReviewScreen {...navigationProps} />;
      case 'login':
        return <LoginScreen {...navigationProps} />;
      case 'register':
        return <RegisterScreen {...navigationProps} />;
      default:
        return <HomeScreen {...navigationProps} />;
    }
  };

  // Alt navigasyon için aktif tab
  const activeTab = currentScreen === 'profile' ? 'profile' : 'home';

  // Tab değişimi
  const handleTabPress = (tabId) => {
    if (tabId === 'home') {
      setCurrentScreen('home');
    } else if (tabId === 'profile') {
      setCurrentScreen('profile');
    }
  };

  // Login ve Register ekranlarında alt navigasyon gösterme
  const showBottomNav = !['login', 'register', 'businessDetail', 'addReview'].includes(currentScreen);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {renderScreen()}
      {showBottomNav && (
        <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
});
