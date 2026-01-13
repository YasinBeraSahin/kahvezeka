import os
import sys

# 1. Set the environment variable BEFORE importing database.py
# This ensures database.py picks up the remote URL instead of SQLite
os.environ['DATABASE_URL'] = "postgresql://kahvezeka_v3_user:xPHXTid4on9szfk4LQyRSnav87mvDOEC@dpg-d5jac9q4d50c73a9v67g-a.frankfurt-postgres.render.com/kahvezeka_v3"

print(f"Setting DATABASE_URL to: {os.environ['DATABASE_URL']}")

try:
    from database import engine, Base, SessionLocal
    import models
    
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")
    
    # 2. Run Seed logic from seed_db_filters.py (Users + 3 Cafes)
    print("\n--- Running Seed DB Filters Logic ---")
    import seed_db_filters
    # We need to manually call the logic or function if available, 
    # but seed_db_filters.py runs on main. 
    # Let's import it and run its function if possible, or just re-implement minimal call
    seed_db_filters.seed_data()
    
    # 3. Run Seed logic from seed_db.py (Main Owner + Menu Items)
    print("\n--- Running Seed DB Logic ---")
    # seed_db.py also runs on main, but we can import it. 
    # NOTE: seed_db.py executes immediately on import if not guarded? 
    # Let's check the file content from earlier view_file.
    # It does NOT have 'if __name__ == "__main__":' block for the logic! 
    # It executes directly. 
    # However, we can use run_command/subprocess to run it if import is messy, 
    # BUT we need the ENV VAR set.
    # So better to just replicate the seed_db logic here or exec it.
    
    # Re-implementing seed_db.py logic here to be safe and clean:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    def get_password_hash(password):
        return pwd_context.hash(password)

    db = SessionLocal()

    # 1. Create Owner User (mekan_sahibi)
    owner_email = "mekan@kahvezeka.com"
    owner = db.query(models.User).filter(models.User.email == owner_email).first()
    if not owner:
        owner = models.User(
            email=owner_email,
            username="mekan_sahibi",
            hashed_password=get_password_hash("123456"),
            role="owner"
        )
        db.add(owner)
        db.commit()
        db.refresh(owner)
        print("Owner user (mekan_sahibi) created.")
    else:
        print("Owner user already exists.")

    # 2. Create Business (Espresso Lab - Kadıköy)
    business = db.query(models.Business).filter(models.Business.name == "Espresso Lab - Kadıköy").first()
    if not business:
        business = models.Business(
            name="Espresso Lab - Kadıköy",
            description="Nitelikli kahvenin adresi. Taze kavrulmuş çekirdekler.",
            address="Caferağa Mah. Moda Cad. No: 12, Kadıköy/İstanbul",
            latitude=40.9882,
            longitude=29.0223,
            owner_id=owner.id,
            is_approved=True,
            average_rating=4.8,
            review_count=120,
            has_wifi=True,
            has_socket=True,
            serves_food=True
        )
        db.add(business)
        db.commit()
        db.refresh(business)
        print("Business (Espresso Lab - Kadıköy) created.")
    else:
        print("Business already exists.")

    # 3. Create Menu Items
    if not db.query(models.MenuItem).filter(models.MenuItem.business_id == business.id).first():
        items = [
            models.MenuItem(name="Latte", description="Yumuşak içim", price=85.0, category="Sıcak", business_id=business.id),
            models.MenuItem(name="Cold Brew", description="24 saat demlenmiş", price=95.0, category="Soğuk", business_id=business.id),
            models.MenuItem(name="Cheesecake", description="San Sebastian", price=120.0, category="Tatlı", business_id=business.id),
        ]
        db.add_all(items)
        db.commit()
        print("Menu items created.")

    # 4. Create Campaign
    if not db.query(models.Campaign).filter(models.Campaign.business_id == business.id).first():
        campaign = models.Campaign(
            title="Kahve + Tatlı Menüsü",
            description="Herhangi bir kahve ve tatlı alımında %15 indirim!",
            discount_percentage=15,
            business_id=business.id
        )
        db.add(campaign)
        db.commit()
        print("Campaign created.")

    db.close()
    
    print("\n✅ SUCCESS: New Database is Initialized and Seeded!")

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
