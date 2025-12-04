from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
from passlib.context import CryptContext

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    db = SessionLocal()
    
    # Kullanıcılar
    admin_user = models.User(
        email="admin@kahvezeka.com",
        username="admin",
        hashed_password=get_password_hash("admin123"),
        role="admin"
    )
    
    owner_user = models.User(
        email="owner@kahvezeka.com",
        username="owner",
        hashed_password=get_password_hash("owner123"),
        role="owner"
    )
    
    normal_user = models.User(
        email="user@kahvezeka.com",
        username="user",
        hashed_password=get_password_hash("user123"),
        role="customer"
    )
    
    db.add(admin_user)
    db.add(owner_user)
    db.add(normal_user)
    db.commit()
    
    # Mekanlar
    cafe1 = models.Business(
        name="Espresso Lab",
        address="Beşiktaş, İstanbul",
        latitude=41.0422,
        longitude=29.0067,
        owner_id=owner_user.id,
        is_approved=True,
        has_wifi=True,
        has_socket=True,
        is_pet_friendly=False,
        is_quiet=True,
        serves_food=True
    )
    
    cafe2 = models.Business(
        name="Starbucks",
        address="Kadıköy, İstanbul",
        latitude=40.9901,
        longitude=29.0292,
        owner_id=owner_user.id,
        is_approved=True,
        has_wifi=True,
        has_socket=True,
        is_pet_friendly=False,
        is_quiet=False,
        serves_food=True
    )
    
    cafe3 = models.Business(
        name="Petra Roasting Co.",
        address="Gayrettepe, İstanbul",
        latitude=41.0667,
        longitude=29.0050,
        owner_id=owner_user.id,
        is_approved=True,
        has_wifi=True,
        has_socket=True,
        is_pet_friendly=True,
        is_quiet=True,
        serves_food=True
    )
    
    db.add(cafe1)
    db.add(cafe2)
    db.add(cafe3)
    db.commit()
    
    print("Database seeded successfully with filter attributes!")
    db.close()

if __name__ == "__main__":
    seed_data()
