from database import SessionLocal
from models import Business, User, MenuItem, Campaign
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

db = SessionLocal()

# 1. Create Owner User
owner_email = "mekan@kahvezeka.com"
owner = db.query(User).filter(User.email == owner_email).first()
if not owner:
    owner = User(
        email=owner_email,
        username="mekan_sahibi",
        hashed_password=get_password_hash("123456"),
        role="owner"
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)
    print("Owner user created.")
else:
    print("Owner user already exists.")

# 2. Create Business
business = db.query(Business).filter(Business.name == "Espresso Lab - Kadıköy").first()
if not business:
    business = Business(
        name="Espresso Lab - Kadıköy",
        description="Nitelikli kahvenin adresi. Taze kavrulmuş çekirdekler.",
        address="Caferağa Mah. Moda Cad. No: 12, Kadıköy/İstanbul",
        latitude=40.9882,
        longitude=29.0223,
        owner_id=owner.id,
        is_approved=True,
        average_rating=4.8,
        review_count=120
    )
    db.add(business)
    db.commit()
    db.refresh(business)
    print("Business created.")
else:
    print("Business already exists.")

# 3. Create Menu Items
if not db.query(MenuItem).filter(MenuItem.business_id == business.id).first():
    items = [
        MenuItem(name="Latte", description="Yumuşak içim", price=85.0, category="Sıcak", business_id=business.id),
        MenuItem(name="Cold Brew", description="24 saat demlenmiş", price=95.0, category="Soğuk", business_id=business.id),
        MenuItem(name="Cheesecake", description="San Sebastian", price=120.0, category="Tatlı", business_id=business.id),
    ]
    db.add_all(items)
    db.commit()
    print("Menu items created.")

# 4. Create Campaign
if not db.query(Campaign).filter(Campaign.business_id == business.id).first():
    campaign = Campaign(
        title="Kahve + Tatlı Menüsü",
        description="Herhangi bir kahve ve tatlı alımında %15 indirim!",
        discount_percentage=15,
        business_id=business.id
    )
    db.add(campaign)
    db.commit()
    print("Campaign created.")

db.close()
print("Seeding complete!")
