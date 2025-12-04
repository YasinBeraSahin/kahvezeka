from database import SessionLocal
from models import Business

db = SessionLocal()
count = db.query(Business).count()
print(f"Total Businesses: {count}")
businesses = db.query(Business).all()
for b in businesses:
    print(f"- {b.name} (Approved: {b.is_approved})")
db.close()
