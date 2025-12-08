// App.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { COLORS } from './src/constants/theme';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BusinessDetailScreen from './src/screens/BusinessDetailScreen';
import AddReviewScreen from './src/screens/AddReviewScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BusinessManagementScreen from './src/screens/BusinessManagementScreen';
import AdminScreen from './src/screens/AdminScreen';

// Components
import BottomNavigation from './src/components/BottomNavigation';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [screenParams, setScreenParams] = useState({});

  // Kullanıcı rolüne göre başlangıç ekranını belirle
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (user?.role === 'admin') {
          setCurrentScreen('admin');
        } else if (user?.role === 'owner') {
          setCurrentScreen('businessManagement');
        } else {
          setCurrentScreen('home');
        }
      } else {
        setCurrentScreen('home');
      }
    }
  }, [loading, isAuthenticated, user]);

  const navigate = (screenName, params = {}) => {
    setCurrentScreen(screenName);
    setScreenParams(params);
  };

  const goBack = () => {
    if (user?.role === 'admin') {
      setCurrentScreen('admin');
    } else if (user?.role === 'owner') {
      setCurrentScreen('businessManagement');
    } else {
      setCurrentScreen('home');
    }
    setScreenParams({});
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderScreen = () => {
    const navigationProps = { navigation: { navigate, goBack }, route: { params: screenParams } };

    switch (currentScreen) {
      case 'home':
        return <HomeScreen {...navigationProps} />;
      case 'profile':
        return <ProfileScreen {...navigationProps} />;
      case 'businessDetail':
        return <BusinessDetailScreen {...navigationProps} />;
      case 'addReview':
        return <AddReviewScreen {...navigationProps} />;
      case 'Login':
      case 'login':
        return <LoginScreen {...navigationProps} />;
      case 'Register':
      case 'register':
        return <RegisterScreen {...navigationProps} />;
      case 'businessManagement':
        return <BusinessManagementScreen {...navigationProps} />;
      case 'admin':
        return <AdminScreen {...navigationProps} />;
      default:
        return <HomeScreen {...navigationProps} />;
    }
  };

  const handleTabPress = (tabId) => {
    setCurrentScreen(tabId);
  };

  // Bottom Nav'ı kimler görecek?
  const showBottomNav = !['login', 'Login', 'register', 'Register', 'businessDetail', 'addReview'].includes(currentScreen);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      {renderScreen()}
      {showBottomNav && (
        <BottomNavigation
          activeTab={currentScreen}
          onTabPress={handleTabPress}
          isOwner={user?.role === 'owner'}
          isAdmin={user?.role === 'admin'}
        />
      )}
      <Toast />
    </View>
  );
}

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
  }
});
