# Kahve Zeka Mobile App

React Native mobil uygulaması - Yakınındaki kahve mekanlarını keşfet!

## 🎨 Tasarım

Web frontend'deki tasarım sistemi ile uyumlu:
- **Ana Renk:** Kahve (#8b4513)
- **Vurgu Rengi:** Altın (#c7a17a)
- **Mavi Aksanlar:** #007bff
- **Temiz, minimal tasarım**

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# iOS için (Mac gerekli)
npm run ios

# Android için
npm run android

# Web için
npm run web
```

## 📱 Özellikler

### Ana Sayfa (HomeScreen)
- ✅ Kullanıcı konumu takibi
- ✅ Harita görünümü (Google Maps)
- ✅ Kahve mekanı işaretçileri
- ✅ Yarıçap filtresi (1-20 km)
- ✅ Arama özelliği
- ✅ Yatay kaydırmalı işletme kartları
- ✅ Alt navigasyon menüsü

## 🔧 Yapılandırma

### Google Maps API Key

Android için `app.json` dosyasında Google Maps API key'i güncellemeniz gerekiyor:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    }
  }
}
```

### Backend API URL

`src/services/api.js` dosyasında backend URL'ini güncelleyin:

```javascript
const API_URL = __DEV__ 
  ? 'http://localhost:8000/api'  // Geliştirme
  : 'https://your-production-api.com/api';  // Production
```

**Not:** Android emülatörde localhost yerine `10.0.2.2` kullanın:
```javascript
const API_URL = __DEV__ 
  ? 'http://10.0.2.2:8000/api'  // Android emülatör
  : 'https://your-production-api.com/api';
```

## 📂 Proje Yapısı

```
src/
├── screens/
│   └── HomeScreen.js          # Ana sayfa
├── components/
│   ├── Header.js              # Üst başlık
│   ├── SearchBar.js           # Arama çubuğu
│   ├── RadiusFilter.js        # Yarıçap seçici
│   ├── CoffeeMapView.js       # Harita görünümü
│   ├── NearbyList.js          # Yakındaki mekanlar listesi
│   └── BottomNavigation.js    # Alt navigasyon
├── constants/
│   ├── colors.js              # Renk paleti
│   └── theme.js               # Tema yapılandırması
├── services/
│   └── api.js                 # Backend API servisi
└── utils/
    └── location.js            # Konum yardımcıları
```

## 🔐 İzinler

### iOS
- Konum izni (NSLocationWhenInUseUsageDescription)

### Android
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION

## 🎯 Sonraki Adımlar

- [ ] İşletme detay sayfası ekle
- [ ] Favoriler özelliği
- [ ] Kullanıcı profili
- [ ] Kampanyalar sayfası
- [ ] Yorumlar ve puanlama
- [ ] Bildirimler

## 🐛 Bilinen Sorunlar

- Google Maps API key'i eklenmesi gerekiyor
- Backend API URL'i güncellenmeli
- iOS için reverse geocoding eklenebilir (konum adı için)

## 📝 Notlar

- Expo Go uygulaması ile test edebilirsiniz
- react-native-maps için native build gerekebilir
- Geliştirme sırasında backend'in çalışır durumda olması gerekiyor
