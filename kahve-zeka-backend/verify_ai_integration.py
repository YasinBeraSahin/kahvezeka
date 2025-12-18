import asyncio
import os
from database import SessionLocal, engine
from models import Base, MenuItem, Business, User
from services.chat_service import recommend_coffee_from_mood

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_data(db):
    # Create a dummy business and product for testing
    # Check if user exists
    user = db.query(User).filter(User.username == "test_owner").first()
    if not user:
        user = User(username="test_owner", email="test@example.com", role="owner")
        db.add(user)
        db.commit()

    business = db.query(Business).filter(Business.name == "AI Test Cafe").first()
    if not business:
        business = Business(name="AI Test Cafe", owner_id=user.id, latitude=0, longitude=0, is_approved=True)
        db.add(business)
        db.commit()

    # Add a product that matches a likely recommendation (e.g., for "Mutlu" -> "Caramel Macchiato")
    item = db.query(MenuItem).filter(MenuItem.name == "Iced Caramel MacchiatoTest").first()
    if not item:
        item = MenuItem(name="Iced Caramel MacchiatoTest", price=50.0, business_id=business.id)
        db.add(item)
        db.commit()
    return item

async def test_integration():
    db = SessionLocal()
    with open("verification_result.txt", "w", encoding="utf-8") as f:
        try:
            f.write("Seeding data...\n")
            seed_data(db)
            
            f.write("Testing AI 'Mutlu' mood...\n")
            result = await recommend_coffee_from_mood("Çok mutluyum!", db)
            
            f.write("Result:\n")
            f.write(f"Emotion: {result.get('emotion_category')}\n")
            f.write(f"Matching Products Found: {len(result.get('matching_products', []))}\n")
            
            for p in result.get('matching_products', []):
                f.write(f"- Found: {p['name']} at {p['business_name']}\n")
                
        except Exception as e:
            import traceback
            f.write(traceback.format_exc())
            f.write(f"CRITICAL ERROR: {e}\n")
        finally:
            db.close()

if __name__ == "__main__":
    asyncio.run(test_integration())
