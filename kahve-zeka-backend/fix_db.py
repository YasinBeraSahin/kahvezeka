import sqlite3

# Veritabanı dosyasının yolu
DB_PATH = "kahve_zeka.db"

def inspect_and_fix():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Tabloları listele
        print("--- EXISTING TABLES ---")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        for t in tables:
            print(t[0])
        print("-----------------------")

        # Tablo adını bul
        target_table = "business_analytics"
        if (target_table,) not in tables:
            print(f"WARNING: '{target_table}' not found in DB.")
            # Belki 'businessanalytics' diye geçiyordur?
        else:
            print(f"Table '{target_table}' found. Applying schema update...")
            
            # 1. ai_recommendations
            try:
                cursor.execute(f"ALTER TABLE {target_table} ADD COLUMN ai_recommendations INTEGER DEFAULT 0")
                print("Added column: ai_recommendations")
            except Exception as e:
                print(f"Skipped ai_recommendations ({e})")

            # 2. favorites_gained
            try:
                cursor.execute(f"ALTER TABLE {target_table} ADD COLUMN favorites_gained INTEGER DEFAULT 0")
                print("Added column: favorites_gained")
            except Exception as e:
                print(f"Skipped favorites_gained ({e})")
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        print(f"Critical Error: {e}")

if __name__ == "__main__":
    inspect_and_fix()
