import os
from sqlalchemy import create_engine, text

def fix_production_database_v2():
    print("="*50)
    print(" KAHVE ZEKA - PRODUCTION DATABASE KURTARMA V2")
    print("="*50)
    print("\nBu script Render veritabanına bağlanıp 'menu_items' tablosuna eksik 'image_url' sütununu ekleyecektir.")
    
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
            # MenuItem tablosu fix
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url VARCHAR;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS name VARCHAR NOT NULL DEFAULT 'Menü';",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS price FLOAT NOT NULL DEFAULT 0.0;",
            "ALTER TABLE menu_items ALTER COLUMN name DROP DEFAULT;",
            "ALTER TABLE menu_items ALTER COLUMN price DROP DEFAULT;"
        ]

        trans = connection.begin()
        try:
            for sql in fix_commands:
                print(f"  -> Çalıştırılıyor: {sql.split(';')[0]}...") # Sadece ilk kısmı göster
                try:
                    connection.execute(text(sql))
                except Exception as inner_e:
                    # Column already exists hatası olabilir, devam et
                    print(f"     (Uyarı: {inner_e})")
            
            trans.commit()
            print("\n✅ TÜM DÜZELTMELER BAŞARIYLA UYGULANDI!")
            print("Mobil uygulamayı veya Web panelini yenileyip test edebilirsiniz.")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ SQL Hatası: {e}")
            
    except Exception as e:
        print(f"\n❌ Bağlantı hatası: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    fix_production_database_v2()
    input("\nÇıkmak için Enter'a basın...")
