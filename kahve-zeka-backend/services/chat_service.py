import os
import json
import google.generativeai as genai
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import MenuItem, Business
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDUjQpSSvGlTGgmrmD6SRWXaJiuqFgYRJY")

if not API_KEY:
    print("Warning: GEMINI_API_KEY not found in .env")
else:
    genai.configure(api_key=API_KEY)

model = genai.GenerativeModel('gemini-2.5-flash')

COFFEE_MATRIX = {
    "Mutlu": [
        {"title": "🎉 Kutlama Modu", "coffee": "Iced Caramel Macchiato", "description": "Mutluluğunu tatlı bir soğuk kahveyle taçlandır. Karamel ve vanilya notaları neşene neşe katsın."},
        {"title": "✨ Enerjik Seçim", "coffee": "Cold Brew", "description": "Enerjin zaten yüksek, Cold Brew ile bu enerjiyi tüm güne yay ve ferahla."},
        {"title": "🍦 Keyif Anı", "coffee": "Affogato", "description": "Dondurma ve espresso... Mutlu anların vazgeçilmez ikilisi."},
        {"title": "🍓 Frappe Rüyası", "coffee": "Çilekli Frappe", "description": "Mutluluğun rengi pembe olsun. Hem serinletici hem de tatlı bir rüya."}
    ],
    "Üzgün": [
        {"title": "🍫 Çikolata Terapisi", "coffee": "Sıcak Çikolata veya Mocha", "description": "Çikolatanın mutluluk hormonu salgılatması bilimsel bir gerçek. Ruhuna iyi gelecek."},
        {"title": "☁️ Yumuşak İçim", "coffee": "Vanilla Latte", "description": "Sıcak, yumuşak ve tatlı bir kucaklama gibi. Seni yormayacak, sakinleştirecek."},
        {"title": "🏠 Ev Sıcaklığı", "coffee": "Salep veya Sahlep Latte", "description": "İçini ısıtacak, tarçın kokulu geleneksel bir teselli."},
        {"title": "🍯 Ballı Sütlü", "coffee": "Ballı Sütlü Kahve", "description": "Anne eli değmiş gibi. Doğal tatlılığıyla seni sarıp sarmalar."}
    ],
    "Stresli": [
        {"title": "🌼 Sakinleştirici Güç", "coffee": "Papatya Çayı veya Melisa", "description": "Kafein bazen stresi artırabilir. Bitki çayı ile sinirlerini yatıştır ve derin bir nefes al."},
        {"title": "🕰️ Mola Zamanı", "coffee": "Sade Türk Kahvesi", "description": "40 yıllık hatırı vardır. Yavaş yavaş iç, fincanı kapat ve sadece ana odaklan."},
        {"title": "🥛 Dengeli Seçim", "coffee": "Cortado", "description": "Az süt, öz kahve. Ne çok sert ne çok yumuşak, tam dengede kalman için."},
        {"title": "🍵 Yeşil Dinginlik", "coffee": "Jasmine Tea", "description": "Yasemin kokusuyla zihnini boşalt, stresini buharla uçur."}
    ],
    "Yorgun": [
        {"title": "⚡ Hızlı Etki", "coffee": "Double Espresso", "description": "Vakit kaybetmeden uyanman lazım. İtalyan usübü hızlı ve etkili çözüm."},
        {"title": "💣 Atom Etkisi", "coffee": "Red Eye", "description": "Filtre kahveye bir shot espresso... Gözlerini faltaşı gibi açacak en güçlü silahımız."},
        {"title": "🛡️ Güçlü Destek", "coffee": "Americano", "description": "Uzun süre içebileceğin, seni yavaş yavaş kendine getirecek güvenilir bir dost."},
        {"title": "🔋 Şarj Ol", "coffee": "Türk Kahvesi (Çifte Kavrulmuş)", "description": "Yoğun aroması ve kafeiniyle seni kendine getirecek, gözlerini açacak."}
    ],
    "Sakin": [
        {"title": "🧘 Meditatif Demleme", "coffee": "V60 veya Chemex", "description": "Acelen yok. Kahvenin demlenmesini izle, aromaların tadını çıkar. Huzur ritüeli."},
        {"title": "📖 Kitap Dostu", "coffee": "Filtre Kahve", "description": "Yanına bir kitap veya sevdiğin bir müzik al. Sade ve akıcı bir keyif."},
        {"title": "🥛 Sütlü Rüya", "coffee": "Flat White", "description": "İpeksi süt köpüğü ve kaliteli espresso. Huzurlu anların sofistike tadı."},
        {"title": "🍂 Sonbahar Esintisi", "coffee": "Cinnamon Latte", "description": "Hafif tarçın aromasıyla huzuruna huzur, keyfine keyif kat."}
    ],
    "Öfkeli": [
        {"title": "🧊 Buz Gibi Serinle", "coffee": "Iced Americano", "description": "Başına vuran ateşi söndürmek için buz gibi, şekersiz ve net bir tat."},
        {"title": "🍋 Ekşi Ferahlık", "coffee": "Espresso Romano", "description": "Limonlu espresso. Keskin tadı odağını değiştirecek ve seni şaşırtarak sakinleştirecek."},
        {"title": "🧉 Soğuk Mat", "coffee": "Cold Brew Latte", "description": "Sistemini yavaşlatacak, tansiyonunu düşürecek soğuk ve sütlü bir mola."},
        {"title": "🌬️ Derin Nefes", "coffee": "Naneli Soğuk Çay", "description": "Kahve yerine ferahlatıcı nane, sinirlerini yatıştırmada birebirdir."}
    ],
    "Heyecanlı": [
        {"title": "🎯 Odaklan", "coffee": "Macchiato", "description": "Heyecanını doğru yönlendirmek için küçük ama etkili bir dokunuş."},
        {"title": "🕺 Ritim Tut", "coffee": "White Chocolate Mocha", "description": "Kalbin pır pır ederken tatlı bir eşlikçi. Heyecanını keyfe dönüştür."},
        {"title": "🚀 Uçuş Modu", "coffee": "Nitro Cold Brew", "description": "Köpüklü ve pürüzsüz. Heyecanlı ruh haline yakışan havalı bir seçim."},
        {"title": "🧂 Tuzlu Karamel", "coffee": "Salted Caramel Latte", "description": "Heyecanlı anların tatlı-tuzlu sürprizi."}
    ],
    "Dalgın": [
        {"title": "💡 Zihin Açıcı", "coffee": "Bulletproof Coffee (Yağlı Kahve)", "description": "Beyin fonksiyonlarını hızlandıran, dikkati toplayan özel bir karışım."},
        {"title": "🎯 Keskin Odak", "coffee": "Ristretto", "description": "Kısa ve öz. Dağınık zihnini tek bir noktada toplamak için."},
        {"title": "🍵 Yeşil Güç", "coffee": "Matcha Latte", "description": "L-Theanine sayesinde sakin bir odaklanma sağlar. Dağınıklığı nazikçe toparlar."}
    ],
    "Uykulu": [
        {"title": "🚨 Acil Durum", "coffee": "Dead Eye", "description": "Üç shot espresso içeren filtre kahve. Uykuyu kesinlikle kaçırır (Dikkatli iç!)."},
        {"title": "☕ Klasik Uyandırıcı", "coffee": "Robusta Blend Filtre", "description": "Kafein oranı yüksek çekirdeklerden, sert bir filtre kahve."},
        {"title": "🍫 Enerji Barı", "coffee": "Mocha Frappuccino", "description": "Soğuk şok ve şeker enerjisiyle gözlerini aç."}
    ],
    "Kararsız": [
        {"title": "👨‍🍳 Şefin Tavsiyesi", "coffee": "Günün Kahvesi", "description": "Karar verme yükünü bize bırak. Bugün senin için seçtiğimiz sürpriz kahveyi dene."},
        {"title": "⚖️ Orta Yol", "coffee": "Latte", "description": "Risk alma. Herkesin sevdiği, her duruma uyan garanti seçim."},
        {"title": "🎨 Sanatsal", "coffee": "Cortado", "description": "Ne çok büyük ne çok küçük. Tam kararında bir lezzet."}
    ],
    "Romantik": [
        {"title": "🌹 Aşk İksiri", "coffee": "Red Velvet Latte", "description": "Rengiyle ve tadıyla romantizmin kahveye dönüşmüş hali."},
        {"title": "🍫 Paylaşmalık", "coffee": "Sıcak Çikolata (Marshmallowlu)", "description": "İki pipetle içmelik, içinizi ısıtacak tatlı bir an."},
        {"title": "🥂 Kahve Şöleni", "coffee": "Irish Coffee (Alkolsüz Şuruplu)", "description": "Özel anlar için sofistike ve farklı bir deneyim."}
    ],
    "Yaratıcı": [
        {"title": "🎨 İlham Kaynağı", "coffee": "Syphon Coffee", "description": "Demleme süreci bir deney gibi. İzlemek bile zihnindeki kıvılcımları ateşler."},
        {"title": "🦄 Fantastik", "coffee": "Unicorn Frappuccino", "description": "Renkli, çılgın ve sıra dışı. Sınırları zorla."},
        {"title": "🧪 Deneysel", "coffee": "Espresso Tonic", "description": "Acı ve gazlı. Alışılmadık tatlar yeni fikirler doğurur."}
    ],
    "Telaşlı": [
        {"title": "🏃‍♂️ Al ve Git", "coffee": "Take-away Filtre Kahve", "description": "Beklemeye vaktin yok. Kupana doldur ve yoluna devam et."},
        {"title": "⏱️ Hızlı Shot", "coffee": "Espresso", "description": "Ayakta bir yudumda iç, enerjini al ve koşturmaya dön."},
        {"title": "🥤 Pratik", "coffee": "Kutu Cold Brew", "description": "Hazır, soğuk ve hemen içime uygun. Hız kesmeden devam."}
    ],
    "Belirsiz": []
}

import math

def calculate_distance(lat1, lon1, lat2, lon2):
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return float('inf') # Uzaklık hesaplanamazsa en sona at
    
    R = 6371  # Dünya yarıçapı (km)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance

async def recommend_coffee_from_mood(user_message, db: Session = None, user_lat: float = None, user_lon: float = None):
    if not API_KEY:
        # Fallback (API anahtarı yoksa random veya default bir kategori)
        category = "Belirsiz"
        return {
            "emotion_category": category,
            "recommendations": COFFEE_MATRIX[category],
            "note": "API anahtarı bulunamadı, varsayılan öneriler gösteriliyor."
        }

    try:
        categories = list(COFFEE_MATRIX.keys())
        
        # Kategorileri numaralandırarak prompt'a ekle
        category_list_str = "\n".join([f"{i+1}. {cat}" for i, cat in enumerate(categories)])
        
        prompt = f"""
        Görev: Aşağıdaki kullanıcı mesajını analiz et ve verilen {len(categories)} duygu kategorisinden en uygun olanının NUMARASINI döndür.
        
        Eğer kullanıcı mesajı anlamsız, rastgele tuşlara basılmış veya herhangi bir duygu/durum içermiyorsa, "Belirsiz" kategorisinin numarasını dön.
        
        Kategoriler:
        {category_list_str}
        
        Kullanıcı Mesajı: "{user_message}"
        
        YANIT FORMATI: Sadece tek bir rakam (1-{len(categories)} arası). Başka hiçbir kelime veya noktalama işareti kullanma.
        Örnek Yanıt: 3
        """

        response = model.generate_content(prompt)
        response_text = response.text.strip()
        print(f"DEBUG: Raw Gemini Response: {response_text}")
        
        # Yanıttan sayıyı ayıkla (Gemini bazen '1.' veya 'Cevap: 1' diyebilir)
        import re
        match = re.search(r'\d+', response_text)
        
        if match:
            category_index = int(match.group()) - 1 # 1-based to 0-based
            
            # Index geçerli mi kontrol et
            if 0 <= category_index < len(categories):
                matched_category = categories[category_index]
            else:
                print(f"Gemini returned invalid index: {category_index}")
                matched_category = "Belirsiz"
        else:
            print(f"Gemini returned non-digit response: {response_text}")
            matched_category = "Belirsiz"

        # Veritabanında eşleşen ürünleri bul
        matching_products = []
        if db:
            # Önerilen kahve isimlerini al (Matrix'ten)
            recommended_coffees = [rec["coffee"] for rec in COFFEE_MATRIX[matched_category]]
            
            # Tüm potansiyel ürünleri topla
            all_candidates = []
            
            for coffee_name in recommended_coffees:
                search_term = coffee_name.split()[0] if " " in coffee_name else coffee_name
                
                products = db.query(MenuItem).join(Business).filter(
                    MenuItem.name.ilike(f"%{search_term}%"),
                    Business.is_approved == True
                ).all() # Limit kaldırıldı, hepsini çekip mesafeye göre eleyeceğiz
                
                for p in products:
                    # Mesafe hesabı
                    distance = calculate_distance(user_lat, user_lon, p.business.latitude, p.business.longitude)
                    
                    all_candidates.append({
                        "id": p.id,
                        "name": p.name,
                        "price": p.price,
                        "business_name": p.business.name,
                        "business_id": p.business.id,
                        "distance": distance
                    })

            # Mesafeye göre sırala (En yakın en üstte)
            # Eğer konum yoksa (inf döner) varsayılan sırayla gelir
            all_candidates.sort(key=lambda x: x["distance"])
            
            # İlk 3 ürünü al
            # Aynı ürünleri filtrelemek isteyebiliriz ama şimdilik basit tutalım
            # Belki farklı işletmelerden çeşitlilik sağlamak iyi olabilir
            
            unique_businesses = set()
            count = 0
            for item in all_candidates:
                if item["business_id"] not in unique_businesses:
                    matching_products.append(item)
                    unique_businesses.add(item["business_id"])
                    count += 1
                if count >= 3:
                    break
            
            # Eğer 3 farklı mekan çıkmazsa, listeyi doldurmak için tekrar dönmek gerekebilir
            # Ama şimdilik "En yakın 3 farklı mekan" mantığı daha güzel
            
            if count < 3 and len(all_candidates) > count:
                 remaining = [item for item in all_candidates if item["business_id"] in unique_businesses] # Zaten ekli olanların diğer ürünleri
                 # Basitçe kalan kontenjanı doldur
                 for item in all_candidates:
                     if len(matching_products) >= 3:
                         break
                     # Zaten eklenmiş mi diye id kontrolü (yukarıdaki business kontrolü yetmeyebilir raw obje için)
                     if not any(mp["id"] == item["id"] for mp in matching_products):
                         matching_products.append(item)


        return {
            "emotion_category": matched_category,
            "recommendations": COFFEE_MATRIX[matched_category],
            "matching_products": matching_products
        }

    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Hata durumunda fallback
        category = "Belirsiz"
        return {
            "emotion_category": category,
            "recommendations": COFFEE_MATRIX[category],
            "error": str(e)
        }

async def recommend_coffee_smart(user_message, db: Session, user_lat: float = None, user_lon: float = None):
    """
    RAG-Lite implementation:
    1. Fetches nearby business menus.
    2. Feeds them to Gemini.
    3. Asks for specific product recommendations based on user mood/request.
    """
    if not API_KEY:
        return {
            "emotion_category": "Belirsiz",
            "recommendations": [],
            "matching_products": [],
            "text_response": "API Anahtarı eksik."
        }

    # 1. Gather Context (Nearby Menu Items)
    # ---------------------------------------------------------
    try:
        # Get all approved businesses
        businesses = db.query(Business).filter(Business.is_approved == True).all()
        
        # Filter by distance (if location provided) or take all (limit 10 closest)
        nearby_data = []
        
        for b in businesses:
            dist = calculate_distance(user_lat, user_lon, b.latitude, b.longitude)
            nearby_data.append({
                "business": b,
                "distance": dist
            })
        
        # Sort by distance (nearest first)
        nearby_data.sort(key=lambda x: x["distance"])
        
        # Take top 5 nearest businesses to keep context window manageable
        nearby_data = nearby_data[:5]
        
        if not nearby_data:
            # Fallback if no businesses
            return await recommend_coffee_from_mood(user_message, db, user_lat, user_lon)

        # Format menu items for Prompt
        menu_context_str = ""
        valid_item_ids = []
        
        for entry in nearby_data:
            b = entry["business"]
            dist_str = f"{entry['distance']:.1f} km" if entry['distance'] != float('inf') else "? km"
            
            menu_context_str += f"\n--- MEKAN: {b.name} (Uzaklık: {dist_str}) ---\n"
            
            for item in b.menu_items:
                # Item ID'yi takip etmek önemli
                valid_item_ids.append(item.id)
                desc = item.description if item.description else "Açıklama yok"
                cat = item.category if item.category else "Genel"
                menu_context_str += f"[ID: {item.id}] Ürün: {item.name} | Fiyat: {item.price} TL | Kategori: {cat} | İçerik: {desc}\n"

        # 2. Build Prompt (Advanced Persona)
        # ---------------------------------------------------------
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
        
        # 3. Call Gemini
        # ---------------------------------------------------------
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up JSON (remove markdown ticks if present)
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        print(f"DEBUG: Gemini RAG Response: {response_text}")
        
        ai_data = json.loads(response_text)
        
        # 4. Process Response & Fetch Details
        # ---------------------------------------------------------
        emotion = ai_data.get("emotion_category", "Belirsiz")
        thought = ai_data.get("thought_process", "")
        ai_recs = ai_data.get("recommendations", [])
        
        matching_products = []
        
        # Seçilen ID'leri DB'den tam detaylarıyla çek
        for rec in ai_recs:
            item_id = rec.get("id")
            reason = rec.get("reason", "")
            
            # DB'den bul
            db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
            if db_item:
                # Mesafe hesabı tekrar (Context'te vardı ama objeye ekleyelim)
                dist = calculate_distance(user_lat, user_lon, db_item.business.latitude, db_item.business.longitude)
                
                matching_products.append({
                    "id": db_item.id,
                    "name": db_item.name,
                    "price": db_item.price,
                    "business_name": db_item.business.name,
                    "business_id": db_item.business.id,
                    "distance": dist,
                    "ai_reason": reason, 
                    "description": db_item.description 
                })

        # Frontend formatına uyumlu dönüş
        frontend_recs = []
        
        # Eğer AI genel bir düşünce süreci belirttiyse, ilk karta bunu ekleyelim
        if thought and matching_products:
             frontend_recs.append({
                "title": f"💡 AI Analizi",
                "coffee": emotion, 
                "description": thought 
            })

        for p in matching_products:
            # Mesafeyi formatla (örn: 0.5 km veya 1.2 km)
            dist_display = f"{p['distance']:.1f} km"
            if p['distance'] < 1.0:
                 dist_display = f"{int(p['distance']*1000)}m"

            frontend_recs.append({
                "title": f"Öneri: {p['name']}",
                "coffee": f"{p['business_name']} ({dist_display})", # Mesafeyi buraya ekledik
                "description": p['ai_reason'] 
            })

        return {
            "emotion_category": emotion,
            "recommendations": frontend_recs, # Kartlarda görünecek AI yorumları
            "matching_products": matching_products, # Aşağıdaki ürün listesi
            "is_smart_search": True
        }
    except Exception as e:
        print(f"CRITICAL ERROR in Smart Recommend: {e}")
        try:
             # Ana AI başarısız olursa yedek (eski) sistemi devreye sok
            return await recommend_coffee_from_mood(user_message, db, user_lat, user_lon)
        except Exception as fallback_e:
            print(f"Fallback Failed: {fallback_e}")
            return {
                "emotion_category": "Belirsiz",
                "recommendations": [],
                "matching_products": [],
                "thought_process": "Sistem geçici olarak yanıt veremiyor, lütfen tekrar deneyin.",
                "is_smart_search": False,
                "error": str(e)
            }
