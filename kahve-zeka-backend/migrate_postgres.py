
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load env vars from .env if present
load_dotenv()

def migrate_postgres():
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("❌ HATA: DATABASE_URL çevre değişkeni bulunamadı!")
        print("Bu scripti çalıştırmak için .env dosyanıza DATABASE_URL ekleyin veya bu değişkenin tanımlı olduğu ortamda çalıştırın.")
        print("Örn: DATABASE_URL=postgresql://user:pass@host:port/dbname")
        return

    # Fix Render-specific URL format if needed
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    print(f"🔌 Bağlanılıyor: {url.split('@')[-1]}") # Güvenlik için şifreyi gizle

    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            # Otomatik commit modunda çalışmak yerine transaction başlatalım
            trans = conn.begin()
            try:
                print("1. 'menu_items' tablosuna 'category' sütunu ekleniyor...")
                # PostgreSQL 9.6+ supports IF NOT EXISTS for ADD COLUMN
                conn.execute(text("ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category VARCHAR;"))
                
                print("2. 'menu_items' tablosundan 'image_url' sütunu kaldırılıyor...")
                conn.execute(text("ALTER TABLE menu_items DROP COLUMN IF EXISTS image_url;"))
                
                print("3. 'businesses' tablosundan 'image_url' sütunu kaldırılıyor...")
                conn.execute(text("ALTER TABLE businesses DROP COLUMN IF EXISTS image_url;"))

                trans.commit()
                print("✅ Migrasyon BAŞARIYLA tamamlandı! Veritabanı güncel.")
                
            except Exception as e:
                trans.rollback()
                print(f"❌ Migrasyon hatası (Rollback yapıldı): {e}")
                
    except Exception as e:
        print(f"❌ Veritabanı bağlantı hatası: {e}")

if __name__ == "__main__":
    migrate_postgres()
