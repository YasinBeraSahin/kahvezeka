import os
from sqlalchemy import create_engine, text

def fix_production_database():
    print("="*50)
    print(" KAHVE ZEKA - PRODUCTION DATABASE KURTARMA")
    print("="*50)
    print("\nBu script Render veritabanına bağlanıp eksik sütunları ekleyecektir.")
    
    # 1. URL İste
    db_url = input("\nLütfen Render'daki 'External Database URL'i yapıştırın:\n(postgres://... ile başlar)\n> ").strip()
    
    if not db_url:
        print("URL boş olamaz!")
        return

    # URL düzeltme (SQLAlchemy için)
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    print("\nBağlanılıyor...")
    
    try:
        engine = create_engine(db_url)
        connection = engine.connect()
        print("✅ Bağlantı başarılı!")
        
        # 2. Düzeltmeleri Uygula
        print("\nTablolar güncelleniyor...")
        
        fix_commands = [
            # Kullanıcılar tablosu fix
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'customer';",
            
            # Review tablosu fix
            "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image_url VARCHAR;",
            
            # Business tablosu fixleri
            "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS image_url VARCHAR;",
            "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_id INTEGER;",
            "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS has_wifi BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS has_socket BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_pet_friendly BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_quiet BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS serves_food BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS has_board_games BOOLEAN DEFAULT FALSE;"
        ]

        trans = connection.begin()
        try:
            for sql in fix_commands:
                print(f"  -> Çalıştırılıyor: {sql[:40]}...")
                connection.execute(text(sql))
            
            trans.commit()
            print("\n✅ TÜM DÜZELTMELER BAŞARIYLA UYGULANDI!")
            print("Mobil uygulamayı yeniden başlatıp giriş yapabilirsiniz.")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ SQL Hatası: {e}")
            
    except Exception as e:
        print(f"\n❌ Bağlantı hatası: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    fix_production_database()
    input("\nÇıkmak için Enter'a basın...")
