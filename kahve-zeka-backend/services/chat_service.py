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

model = genai.GenerativeModel('gemini-1.5-flash')

async def recommend_coffee_from_mood(user_message):
    if not API_KEY:
        return {
            "recommendation": "Filtre Kahve",
            "reason": "API anahtarı eksik olduğu için varsayılan öneri sunuyorum. Çoğu duruma uyar!",
            "mood_detected": "Bilinmiyor"
        }

    try:
        prompt = f"""
        Sen "Kahve Zeka" uygulamasının uzman baristasısın. 
        Kullanıcının gönderdiği mesaja göre ruh halini analiz et ve ona en uygun kahve çeşidini öner.
        
        Kullanıcı mesajı: "{user_message}"
        
        Lütfen SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir metin ekleme:
        {{
            "mood_detected": "Kullanıcının ruh hali (örn: Yorgun, Mutlu, Stresli)",
            "recommendation": "Önerilen kahve adı (örn: Double Espresso, Latte, Papatya Çayı)",
            "reason": "Neden bu kahveyi önerdiğine dair samimi, kısa ve Türkçe bir açıklama."
        }}
        """

        response = model.generate_content(prompt)
        
        # Temizlik: Markdown json varsa temizle
        text_response = response.text.replace('```json', '').replace('```', '').strip()
        
        return json.loads(text_response)

    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "recommendation": "Türk Kahvesi",
            "reason": "Şu an zihnimi toplayamıyorum ama bir Türk Kahvesi her derde devadır.",
            "mood_detected": "Karışık"
        }
