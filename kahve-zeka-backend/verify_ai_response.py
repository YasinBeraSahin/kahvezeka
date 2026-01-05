import google.generativeai as genai
import os
import json

from dotenv import load_dotenv

load_dotenv()

# 1. Config
API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyD2OTY8c-Y-d-OteT3vtZVHAOLBOFqjxjc")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# 2. Mock Data (Context)
menu_context_str = """
--- MEKAN: Kahve Zeka Merkez (Uzaklık: 0.5 km) ---
[ID: 1] Ürün: Latte | Fiyat: 80 TL | Kategori: Sıcak | İçerik: Sütlü yumuşak içim
[ID: 2] Ürün: Espresso | Fiyat: 50 TL | Kategori: Sıcak | İçerik: Sert ve yoğun
[ID: 3] Ürün: Cold Brew | Fiyat: 90 TL | Kategori: Soğuk | İçerik: 24 saat demleme
[ID: 4] Ürün: Çay | Fiyat: 30 TL | Kategori: Sıcak | İçerik: Taze demlenmiş
"""

user_message = "Çok yorgunum, ayılamadım."

# 3. Prompt (EXACT COPY from chat_service.py)
prompt = f"""
        ROLÜN: Kahve Zeka uygulamasının "Baş Baristası" ve "Yerel Rehberi"sin.
        
        GÖREVİN: Kullanıcının ne dediğini derinlemesine analiz et ve ona aşağıdaki MENÜ listesinden nokta atışı 3 öneri yap.
        
        KULLANICI MESAJI: "{user_message}"
        
        MEVCUT MENÜ VERİSİ (En yakından uzağa sıralı):
        {menu_context_str}
        
        ANALİZ KURALLARI (BU MANTIKLA DÜŞÜN):
        
        1. **DURUM TESPİTİ (Mood & Function):**
           - **YORGUNLUK / ÇALIŞMA:** Kullanıcı "çok çalıştım", "yorgunum", "ayılamadım", "enerji lazım" diyorsa -> HEDEF: YÜKSEK KAFEİN.
             *   ÖNER: Americano, Filtre Kahve, Double Espresso, Cold Brew.
             *   YASAK: Sadece şeker içeren (sıcak çikolata vb.) içecekleri ana öneri yapma. Kafein şart.
           - **STRES / RAHATLAMA:** "Gerginim", "Bunaldım" -> HEDEF: KONFOR.
             *   ÖNER: Bitki çayları, Sütlü yumuşak kahveler (Latte), Sıcak Çikolata.
           - **KEYİF / ÖDÜL:** "Canım tatlı çekti", "Kutlama" -> HEDEF: LEZZET.
             *   ÖNER: Aromalı latteler, Frappe, Tatlılar, Cheesecake.
           - **LOGİSTİK (ACİLEYET):** Eğer "acelem var" derse -> En yakın mesafedeki "Al-Götür" uygun ürünleri seç.
        
        2. **SEÇİM STRATEJİSİ:**
           - Eğer kullanıcı net bir ürün adı verdiyse (Örn: "Latte"), listedeki EN İYİ Latte seçeneklerini (fiyat/mesafe dengesine göre) bul.
           - Eğer ruh hali belirttiyse, o ruh haline en uygun içerikleri farklı mekanlardan seçmeye çalış.
           - **MESAFE FAKTÖRÜ:** Çok uzak (3km+) harika bir ürün yerine, yakındaki (500m) iyi bir ürünü tercih et. Ancak yakındakiler çok kötüyse uzağı öner.
        
        3. **ÇIKTI FORMATI (JSON):**
           {{
             "emotion_category": "Kullanıcının Ruh Hali (Örn: 'Enerji Arayışında', 'Keyifçi', 'Telaşlı')",
             "thought_process": "Neden bu seçimi yaptığını 1 cümleyle açıkla (Örn: 'Yorgun olduğunuz için yüksek kafeinli seçenekleri ve en yakın noktaları öne çıkardım.')",
             "recommendations": [
               {{
                 "id": 123,  // Menüdeki ID (ASLA UYDURMA, listeden seç)
                 "reason": "Kullanıcıya hitap eden ikna edici bir açıklama. (Örn: 'Hem size en yakın seçenek hem de sertifikalı çekirdek kullanıyorlar.')"
               }}
             ]
           }}
        """

# 4. Generate
print("Sending request to Gemini...")
try:
    response = model.generate_content(prompt)
    response_text = response.text.strip()
    
    print(f"RAW RESPONSE:\n{response_text}\n")

    # 5. Parse (EXACT COPY from chat_service.py fix)
    response_text = response_text.replace("```json", "").replace("```", "").strip()
    
    data = json.loads(response_text)
    print("SUCCESS! Parsed JSON:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"FAILED: {e}")
