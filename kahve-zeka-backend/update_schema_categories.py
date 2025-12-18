
from sqlalchemy import text
from database import engine

def migrate():
    with engine.connect() as conn:
        try:
            # 1. Add category to menu_items
            print("Attempting to add category column to menu_items table...")
            try:
                # Check existence first? Or just try add
                sql = text("ALTER TABLE menu_items ADD COLUMN category VARCHAR;")
                conn.execute(sql)
                conn.commit()
                print("Migration successful: category added to menu_items.")
            except Exception as e:
                print(f"Category column migration info (might already exist): {e}")

            # 2. Drop image_url from menu_items (SQLite limitations applied)
            # In SQLite, DROP COLUMN is supported in newer versions.
            try:
                print("Attempting to drop image_url column from menu_items table...")
                sql = text("ALTER TABLE menu_items DROP COLUMN image_url;")
                conn.execute(sql)
                conn.commit()
                print("Migration successful: image_url dropped from menu_items.")
            except Exception as e:
                print(f"Drop image_url (menu_items) failed (SQLite version might be old, ignore if so): {e}")

            # 3. Drop image_url from businesses
            try:
                print("Attempting to drop image_url column from businesses table...")
                sql = text("ALTER TABLE businesses DROP COLUMN image_url;")
                conn.execute(sql)
                conn.commit()
                print("Migration successful: image_url dropped from businesses.")
            except Exception as e:
                print(f"Drop image_url (businesses) failed (SQLite version might be old, ignore if so): {e}")

        except Exception as e:
            print(f"General Migration failed: {e}")

if __name__ == "__main__":
    migrate()
