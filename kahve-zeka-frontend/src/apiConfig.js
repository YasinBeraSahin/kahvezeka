// Bu dosya, Vite'in .env dosyalarından
// doğru API URL'sini (lokal veya canlı) otomatik olarak okur.

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';