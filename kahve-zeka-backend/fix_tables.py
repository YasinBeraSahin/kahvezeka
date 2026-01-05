from database import engine
from models import Base
# Tüm modellerin yüklendiğinden emin oluyoruz
import models 

def fix_tables():
    print("Checking and creating missing tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully.")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    fix_tables()
