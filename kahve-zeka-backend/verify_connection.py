from dotenv import load_dotenv
import os
from sqlalchemy import create_engine, text

load_dotenv()

db_url = os.environ.get('DATABASE_URL')
if not db_url:
    print("❌ DATABASE_URL bulunamadı!")
    exit(1)

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

try:
    print(f"Bağlanılıyor: {db_url.split('@')[1]}") # Şifreyi gizle
    engine = create_engine(db_url)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT count(*) FROM businesses"))
        count = result.scalar()
        print(f"✅ Veritabanı bağlantısı BAŞARILI!")
        print(f"📊 Toplam Mekan Sayısı: {count}")
        
        if count > 0:
             result = connection.execute(text("SELECT name, is_approved FROM businesses LIMIT 3"))
             print("🔍 Örnek Mekanlar:")
             for row in result:
                 print(f" - {row[0]} (Onaylı: {row[1]})")
        else:
            print("⚠️ Veritabanında hiç mekan yok! Web sitesinde mekan görüyorsanız farklı veritabanı olabilir.")
            
except Exception as e:
    print(f"❌ Hata: {e}")
