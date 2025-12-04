from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# Veritabanı tablolarını oluştur (gerekirse)
models.Base.metadata.create_all(bind=engine)

def list_businesses():
    db = SessionLocal()
    try:
        businesses = db.query(models.Business).all()
        print(f"{'ID':<5} {'Name':<20} {'Approved':<10} {'Lat':<10} {'Lon':<10} {'OwnerID':<10}")
        print("-" * 70)
        for b in businesses:
            print(f"{b.id:<5} {b.name:<20} {str(b.is_approved):<10} {b.latitude:<10} {b.longitude:<10} {b.owner_id:<10}")
    except Exception as e:
        print(f"Bir hata oluştu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_businesses()
