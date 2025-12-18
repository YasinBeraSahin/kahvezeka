
from sqlalchemy import text
from database import engine

def migrate():
    with engine.connect() as conn:
        columns_to_add = [
            ("has_wifi", "BOOLEAN DEFAULT 0"),
            ("has_socket", "BOOLEAN DEFAULT 0"),
            ("is_pet_friendly", "BOOLEAN DEFAULT 0"),
            ("is_quiet", "BOOLEAN DEFAULT 0"),
            ("serves_food", "BOOLEAN DEFAULT 0"),
            ("has_board_games", "BOOLEAN DEFAULT 0"),
            ("is_approved", "BOOLEAN DEFAULT 0"),
            ("owner_id", "INTEGER"),
            ("image_url", "VARCHAR") # Already added but safe to retry logic if handled suitable
        ]

        for col_name, col_type in columns_to_add:
            try:
                print(f"Attempting to add {col_name} column to businesses table...")
                sql = text(f"ALTER TABLE businesses ADD COLUMN {col_name} {col_type};")
                conn.execute(sql)
                conn.commit()
                print(f"Migration successful: {col_name} added to businesses.")
            except Exception as e:
                # Likely "duplicate column name" error, ignored
                print(f"Migration info for {col_name}: {e}")

        # Fix menu_items table (just in case)
        try:
            print("Attempting to add image_url column to menu_items table...")
            sql = text("ALTER TABLE menu_items ADD COLUMN image_url VARCHAR;")
            conn.execute(sql)
            conn.commit()
            print("Migration successful: image_url added to menu_items.")
        except Exception as e:
            print(f"MenuItem migration info (probably already exists): {e}")

if __name__ == "__main__":
    migrate()
