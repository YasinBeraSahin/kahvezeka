import os
import sys
import traceback

# Redirect stderr to stdout to capture everything
sys.stderr = sys.stdout

log_file = open("init_log.txt", "w", encoding="utf-8")
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
    
    # Hashing setup
    from passlib.context import CryptContext
    # Try different scheme or simple setup
    log("Setting up CryptContext...")
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def get_password_hash(password):
        log(f"Hashing password: '{password}' (Type: {type(password)})")
        if not password:
            raise ValueError("Password is empty inside wrapper")
        return pwd_context.hash(password)

    log("Starting User Creation...")
    
    # Try creating one user manually first
    user_data = {"email": "admin@kahvezeka.com", "username": "admin", "pass": "admin123", "role": "admin"}
    
    existing = db.query(models.User).filter(models.User.email == user_data["email"]).first()
    if not existing:
        log(f"Creating user {user_data['username']}")
        
        # Test hash before object creation
        h = get_password_hash(user_data["pass"])
        log(f"Hash generated: {h[:10]}...")
        
        u = models.User(
            email=user_data["email"],
            username=user_data["username"],
            hashed_password=h,
            role=user_data["role"]
        )
        db.add(u)
        db.commit()
        log("User created.")
    else:
        log("User exists.")

    log("Script finished successfully.")

except Exception as e:
    log("EXCEPTION OCCURRED:")
    log(str(e))
    traceback.print_exc(file=log_file)
finally:
    log_file.close()
