// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import 'leaflet/dist/leaflet.css'; // <-- YENİ EKLENEN SATIR
import ProfilePage from './pages/ProfilePage.jsx';
import AdminPage from './pages/AdminPage.jsx';

// Context'imizi import edelim
import { AuthProvider } from './context/AuthContext.jsx';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Sayfalarımızı import edelim
import HomePage from './pages/HomePage.jsx';
import BusinessDetailPage from './pages/BusinessDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx'; // Yeni Login sayfasını import et
import RegisterPage from './pages/RegisterPage.jsx';
import BusinessPanelPage from './pages/BusinessPanelPage.jsx'; // İleride ekleyeceği
import BusinessLandingPage from './pages/BusinessLandingPage.jsx';
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/business/:businessId',
        element: <BusinessDetailPage />,
      },
      {
        path: '/login', // YENİ LOGIN YOLU
        element: <LoginPage />,
      },
      {
        path: '/register', // YENİ KAYIT YOLU
        element: <RegisterPage />,
      },
      {
        path: '/profile', // YENİ PROFİL YOLU
        element: <ProfilePage />,
      },
      { path: '/panel', element: <BusinessPanelPage /> },
      {
        path: '/admin', // YENİ ADMİN YOLU
        element: <AdminPage />,
      },
      {
        path: '/isletme', // YENİ İŞLETME BAŞVURU YOLU
        element: <BusinessLandingPage />,
      },
    ],
  },
]);

// Basit bir kahve teması oluşturalım
import theme from './theme'; // Yeni temayı import et

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Tüm uygulamayı MUI Tema Sağlayıcısı ile sarıyoruz */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline, tarayıcı varsayılanlarını sıfırlar (güzel görünüm için şart) */}
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);