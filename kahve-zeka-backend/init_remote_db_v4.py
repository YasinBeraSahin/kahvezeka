import os
import sys
import traceback
import bcrypt # Using direct bcrypt to avoid passlib wrap_bug check failure on Windows

# Redirect stderr to stdout to capture everything
sys.stderr = sys.stdout

log_file = open("init_log_v4.txt", "w", encoding="utf-8")
def log(msg):
    print(msg)
    log_file.write(str(msg) + "\n")
    log_file.flush()

os.environ['DATABASE_URL'] = "postgresql://kahvezeka_v3_user:xPHXTid4on9szfk4LQyRSnav87mvDOEC@dpg-d5jac9q4d50c73a9v67g-a.frankfurt-postgres.render.com/kahvezeka_v3"
log(f"ENV SET: {os.environ['DATABASE_URL']}")

try:
    log("Importing database module...")
    import database
    if database.engine is None:
        log("Engine was None, recreating...")
        from sqlalchemy import create_engine
        database.engine = create_engine(os.environ['DATABASE_URL'])
    
    log("Importing models...")
    import models
    
    log("Creating tables...")
    models.Base.metadata.create_all(bind=database.engine)
    log("Tables created.")

    from sqlalchemy.orm import sessionmaker
    NewSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=database.engine)
    db = NewSessionLocal()
    
    def get_password_hash(password):
        # Generate bcrypt hash directly. 
        # Passlib compatible format: $2b$12$... or similar. 
        # bcrypt.hashpw returns bytes, we decode to string.
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    log("Starting User Creation...")
    
    users_to_create = [
        {"email": "admin@kahvezeka.com", "username": "admin", "pass": "admin123", "role": "admin"},
        {"email": "owner@kahvezeka.com", "username": "owner", "pass": "owner123", "role": "owner"},
        {"email": "user@kahvezeka.com", "username": "user", "pass": "user123", "role": "customer"},
        {"email": "mekan@kahvezeka.com", "username": "mekan_sahibi", "pass": "123456", "role": "owner"}
    ]

    for u_data in users_to_create:
        existing = db.query(models.User).filter(models.User.email == u_data["email"]).first()
        if not existing:
            log(f"Creating user {u_data['username']}...")
            new_user = models.User(
                email=u_data["email"],
                username=u_data["username"],
                hashed_password=get_password_hash(u_data["pass"]),
                role=u_data["role"]
            )
            db.add(new_user)
        else:
            log(f"User {u_data['username']} already exists.")
    
    db.commit()

    # Fetch owners for linking
    owner_user = db.query(models.User).filter(models.User.username == "owner").first()
    mekan_user = db.query(models.User).filter(models.User.username == "mekan_sahibi").first()

    log("Starting Business Creation...")
    
    # 1. Businesses for 'owner'
    cafes = [
        {
            "name": "Espresso Lab", "address": "Beşiktaş, İstanbul", 
            "lat": 41.0422, "lon": 29.0067, "owner": owner_user,
            "wifi": True, "socket": True, "pet": False, "quiet": True, "food": True
        },
        {
            "name": "Starbucks", "address": "Kadıköy, İstanbul", 
            "lat": 40.9901, "lon": 29.0292, "owner": owner_user,
            "wifi": True, "socket": True, "pet": False, "quiet": False, "food": True
        },
        {
            "name": "Petra Roasting Co.", "address": "Gayrettepe, İstanbul", 
            "lat": 41.0667, "lon": 29.0050, "owner": owner_user,
            "wifi": True, "socket": True, "pet": True, "quiet": True, "food": True
        }
    ]

    for c in cafes:
        if not db.query(models.Business).filter(models.Business.name == c["name"]).first():
            log(f"Creating {c['name']}...")
            b = models.Business(
                name=c["name"], address=c["address"], latitude=c["lat"], longitude=c["lon"],
                owner_id=c["owner"].id, is_approved=True,
                has_wifi=c["wifi"], has_socket=c["socket"], is_pet_friendly=c["pet"],
                is_quiet=c["quiet"], serves_food=c["food"]
            )
            db.add(b)
        else:
            log(f"Business {c['name']} already exists.")

    db.commit()

    # 2. Business for 'mekan_sahibi' (Detailed with Menu)
    log("Seeding Detailed Business...")
    detailed_name = "Espresso Lab - Kadıköy"
    business = db.query(models.Business).filter(models.Business.name == detailed_name).first()
    if not business:
        log(f"Creating {detailed_name}...")
        business = models.Business(
            name=detailed_name,
            description="Nitelikli kahvenin adresi. Taze kavrulmuş çekirdekler.",
            address="Caferağa Mah. Moda Cad. No: 12, Kadıköy/İstanbul",
            latitude=40.9882,
            longitude=29.0223,
            owner_id=mekan_user.id,
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
    else:
        log(f"{detailed_name} already exists.")

    log("Seeding Menu Items...")
    if not db.query(models.MenuItem).filter(models.MenuItem.business_id == business.id).first():
        items = [
            models.MenuItem(name="Latte", description="Yumuşak içim", price=85.0, category="Sıcak", business_id=business.id),
            models.MenuItem(name="Cold Brew", description="24 saat demlenmiş", price=95.0, category="Soğuk", business_id=business.id),
            models.MenuItem(name="Cheesecake", description="San Sebastian", price=120.0, category="Tatlı", business_id=business.id),
        ]
        db.add_all(items)
        db.commit()
        log("Menu items created.")
    else:
        log("Menu items already exist.")

    log("Seeding Campaign...")
    if not db.query(models.Campaign).filter(models.Campaign.business_id == business.id).first():
        campaign = models.Campaign(
            title="Kahve + Tatlı Menüsü",
            description="Herhangi bir kahve ve tatlı alımında %15 indirim!",
            discount_percentage=15,
            business_id=business.id
        )
        db.add(campaign)
        db.commit()
        log("Campaign created.")
    else:
        log("Campaign already exists.")

    db.close()
    log("Script finished successfully.")

except Exception as e:
    log("EXCEPTION OCCURRED:")
    log(str(e))
    traceback.print_exc(file=log_file)
finally:
    log_file.close()
