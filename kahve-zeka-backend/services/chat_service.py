import os
import json
import google.generativeai as genai
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import MenuItem, Business
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

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

async def recommend_coffee_from_mood(user_message, db: Session = None):
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
            
            # Bu kahvelere benzeyen ürünleri veritabanında ara
            # Basit bir "LIKE" sorgusu: Her bir öneri için db'de arama yap
            # Örn: "Cold Brew" önerildiyse, isminde "Cold Brew" geçen MenuItem'ları bul
            
            for coffee_name in recommended_coffees:
                # Arama terimini basitleştir (örn: "Iced Caramel Macchiato" -> "Macchiato")
                # Daha geniş bir eşleşme için
                search_term = coffee_name.split()[0] if " " in coffee_name else coffee_name
                
                products = db.query(MenuItem).join(Business).filter(
                    MenuItem.name.ilike(f"%{search_term}%"),
                    Business.is_approved == True
                ).limit(3).all()
                
                for p in products:
                    matching_products.append({
                        "id": p.id,
                        "name": p.name,
                        "price": p.price,
                        "business_name": p.business.name,
                        "image_url": p.image_url
                    })

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
