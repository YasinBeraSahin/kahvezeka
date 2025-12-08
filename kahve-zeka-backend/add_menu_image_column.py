
from sqlalchemy import text
from database import engine

def migrate():
    with engine.connect() as conn:
        try:
            # Check if column exists
            check_sql = text("SELECT column_name FROM information_schema.columns WHERE table_name='menu_items' AND column_name='image_url';")
            result = conn.execute(check_sql).fetchone()
            
            if not result:
                print("Adding image_url column to menu_items table...")
                sql = text("ALTER TABLE menu_items ADD COLUMN image_url VARCHAR;")
                conn.execute(sql)
                conn.commit()
                print("Migration successful: image_url added.")
            else:
                print("Column image_url already exists in menu_items.")
                
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
