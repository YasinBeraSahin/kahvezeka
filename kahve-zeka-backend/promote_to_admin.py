from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import sys

# Veritabanı tablolarını oluştur (gerekirse)
models.Base.metadata.create_all(bind=engine)

def promote_user_to_admin(username):
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.username == username).first()
        if user:
            user.role = "admin"
            db.commit()
            print(f"BAŞARILI: '{username}' kullanıcısı artık ADMIN yetkisine sahip.")
        else:
            print(f"HATA: '{username}' adında bir kullanıcı bulunamadı.")
    except Exception as e:
        print(f"Bir hata oluştu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        username = sys.argv[1]
        promote_user_to_admin(username)
    else:
        print("Kullanım: python promote_to_admin.py <kullanici_adi>")
        username = input("Lütfen admin yapmak istediğiniz kullanıcı adını girin: ")
        promote_user_to_admin(username)
