
from database import SessionLocal
from models import Business, MenuItem
from sqlalchemy import text

def verify_schema_and_data():
    db = SessionLocal()
    try:
        print("1. Checking 'menu_items' columns...")
        result = db.execute(text("PRAGMA table_info(menu_items);")).fetchall()
        columns = [row[1] for row in result]
        print(f"Columns in menu_items: {columns}")
        
        if "category" not in columns:
            print("ERROR: 'category' column IS MISSING!")
        else:
            print("SUCCESS: 'category' column exists.")

        if "image_url" in columns:
            print("WARNING: 'image_url' column still exists in menu_items (SQLite drop might have failed), but application ignores it.")
        else:
            print("SUCCESS: 'image_url' column is GONE from menu_items.")

        # 2. Try to insert a menu item with category
        print("\n2. Testing Insert with Category...")
        # Ensure a business exists
        business = db.query(Business).first()
        if not business:
            print("No business found, creating one...")
            business = Business(name="Schema Test Cafe", address="Test Addr", latitude=0, longitude=0, is_approved=True)
            db.add(business)
            db.commit()
            db.refresh(business)
        
        item = MenuItem(name="Schema Test Coffee", price=100.0, category="Sıcak", business_id=business.id)
        db.add(item)
        db.commit()
        print(f"SUCCESS: Inserted MenuItem with category='{item.category}'")
        
    except Exception as e:
        print(f"VERIFICATION FAILED: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_schema_and_data()
