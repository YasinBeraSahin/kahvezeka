# Development Build Gerekli

`react-native-maps` native modül gerektirdiği için Expo Go ile çalışmıyor. 

## Çözüm: Development Build Oluştur

```bash
# EAS CLI kur (ilk kez)
npm install -g eas-cli

# EAS'a giriş yap
eas login

# Build yapılandır
eas build:configure

# Development build oluştur
# Android için:
eas build --profile development --platform android

# iOS için (Mac gerekli):
eas build --profile development --platform ios
```

## Alternatif: Haritasız Versiyon

Eğer development build yapmak istemiyorsanız, haritayı geçici olarak kaldırıp sadece liste görünümü kullanabiliriz.

## Hızlı Test için

Web versiyonunda harita çalışmaz ama liste çalışır:
```bash
npm run web
```
