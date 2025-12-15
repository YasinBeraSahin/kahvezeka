import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("Warning: GEMINI_API_KEY not found in .env")
else:
    genai.configure(api_key=API_KEY)

model = genai.GenerativeModel('gemini-pro-latest')

COFFEE_MATRIX = {
    "Enerjik & Neşeli": [
        {"title": "🎉 Coşkuyu Katla!", "coffee": "Cold Brew (Nitro Dahil)", "description": "Enerjiniz tavan yapmış! Cold Brew'un pürüzsüz ama güçlü kafein vuruşuyla bu güzel modu tüm güne yayın."},
        {"title": "✨ Tatlı Bir Kutlama", "coffee": "Iced Caramel Macchiato", "description": "Neşenize yakışır, katmanlı ve keyifli bir seçenek. Tatlı ve soğuk yapısıyla anı daha da özel kılın."},
        {"title": "🍦 Sıradışı Keyif", "coffee": "Affogato", "description": "Güneşli ruh halinizi yansıtan, hem kahve hem tatlı. Hızlı ve eğlenceli bir mola ile modunuzu pekiştirin."}
    ],
    "Hüzünlü & Teselli Arayan": [
        {"title": "💖 Sıcak Bir Sarılma", "coffee": "Mocha (Yoğun Çikolatalı)", "description": "Bazen tek ihtiyacımız olan yoğun bir tesellidir. Çikolatanın mutluluk hormonuyla ruhunuzu ısıtın."},
        {"title": "☁️ Yumuşak Bir Sığınak", "coffee": "Vanilla Latte (Büyük Boy)", "description": "Büyük ve kremsi bir kucaklama. Vanilya Latte'nin tanıdık, rahatlatıcı tadıyla biraz yavaşlayın."},
        {"title": "🌿 İç Huzuru Bul", "coffee": "Baharatlı Chai Latte", "description": "Eğer kafeine ara vermek isterseniz: Chai'nin sıcak baharatları iç gerginliği hafifletir ve huzur verir."}
    ],
    "Yoğun & Stresli": [
        {"title": "🎯 Odaklanma Alanı", "coffee": "Sade Americano", "description": "Dağınıklıktan uzak durun. Americano'nun keskin ve saf gücüyle zihninizi toparlayın ve görevlere odaklanın."},
        {"title": "🕰️ Yavaşlama Ritüeli", "coffee": "Sade Filtre Kahve", "description": "Bu karmaşık günde sade ve güvenilir bir seçim. Demliğinizi yavaşça yudumlayarak stresi uzaklaştırın."},
        {"title": "⚖️ Mükemmel Denge", "coffee": "Cortado / Piccolo Latte", "description": "Çok fazla süt istemeyenler için. Espresso'nun gücü, küçük bir süt dokunuşuyla yumuşatılır; tam kararında."}
    ],
    "Yorgun & Düşük Enerjili": [
        {"title": "⚡ Anında Şarj!", "coffee": "Ristretto / Double Espresso", "description": "Vücudunuz 'acil durum' sinyali veriyor. Hızlı bir Ristretto ile en yoğun kafeini en kısa sürede alın!"},
        {"title": "🔥 Geleneksel Güç", "coffee": "Türk Kahvesi", "description": "Yoğun ve telveli yapısıyla zihni açar. Güçlü bir canlanma ve kalıcı enerji için ideal."},
        {"title": "💣 Enerji Bombası", "coffee": "Red Eye / Black Eye", "description": "Maksimum güç isteyenler için. Filtre kahvenizin içine ekstra bir shot espresso: İki katı enerji!"}
    ],
    "Sakin & Huzurlu": [
        {"title": "🧘 Ritüel ve Haz", "coffee": "Pour-Over (V60/Chemex)", "description": "Huzur anınızı demleme sanatıyla taçlandırın. Aromaların nüanslarına odaklanarak anın keyfini çıkarın."},
        {"title": "🤏 Öz ve Nüans", "coffee": "Macchiato (Geleneksel)", "description": "Sakinliğinizin tadını çıkarın. Sadece bir kaşık köpükle örtülmüş saf espresso ile sade bir keyif."},
        {"title": "😌 Dinlenme Modu", "coffee": "Kremalı Bitkisel Çay", "description": "Bugün kafeine ihtiyacınız yok. Yumuşak, bitkisel bir çay ile huzurunuzu koruyun ve rahatlayın."}
    ],
    "Kararsız & Karmaşık": [
        {"title": "🔄 Dengeleyici Güç", "coffee": "Flat White", "description": "Hissiniz karmaşık ama kahveniz net olabilir. Süt ve espresso'nun mükemmel dengesini tadın."},
        {"title": "🖼️ Görsel Terapi", "coffee": "Latte (Sanatlı Köpük)", "description": "Ne istediğinize karar veremiyorsanız, en azından güzel görünen bir şey için. Görsel çekicilik ve tanıdık tat."},
        {"title": "🤯 Şaşırtıcı Kontrast", "coffee": "Espresso Tonic", "description": "Kararsız ruh halinize ayak uydurun. Acı, tatlı ve ekşi kontrastıyla zihninizi şaşırtın."}
    ],
    "Öfkeli & Gergin": [
        {"title": "🌬️ Serinletici Nefes", "coffee": "Iced Matcha Latte", "description": "Kafein hassasiyetini düşürün. Matcha'nın sakinleştirici bileşenleri ve buzun serinliği gerginliği azaltır."},
        {"title": "🧊 Soğuk Fikirler", "coffee": "Buzlu Americano", "description": "Öfke yüksek ısıda oluşur. Bol buzlu Americano ile hızlıca serinleyin ve durumu sadeleştirin."},
        {"title": "🍭 Şekerli Kaçış", "coffee": "Soğuk Sütlü Kahve (Dalgona Tarzı)", "description": "Yoğun tatlılık ile odağınızı öfkenizden uzaklaştırın. Biraz eğlenceli ve farklı bir mola verin."}
    ]
}

async def recommend_coffee_from_mood(user_message):
    if not API_KEY:
        # Fallback (API anahtarı yoksa random veya default bir kategori)
        category = "Kararsız & Karmaşık"
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
        Görev: Aşağıdaki kullanıcı mesajını analiz et ve verilen 7 duygu kategorisinden en uygun olanının NUMARASINI döndür.
        
        Kategoriler:
        {category_list_str}
        
        Kullanıcı Mesajı: "{user_message}"
        
        YANIT FORMATI: Sadece tek bir rakam (1-7 arası). Başka hiçbir kelime veya noktalama işareti kullanma.
        Örnek Yanıt: 3
        """

        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
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
                matched_category = "Kararsız & Karmaşık"
        else:
            print(f"Gemini returned non-digit response: {response_text}")
            matched_category = "Kararsız & Karmaşık"

        return {
            "emotion_category": matched_category,
            "recommendations": COFFEE_MATRIX[matched_category]
        }

    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Hata durumunda fallback
        category = "Kararsız & Karmaşık"
        return {
            "emotion_category": category,
            "recommendations": COFFEE_MATRIX[category],
            "error": str(e)
        }
