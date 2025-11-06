# kahve-zeka-backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os # Ortam değişkenlerini okumak için 'os' import edildi

# --- GÜNCELLENEN BÖLÜM ---

# 1. Render, veritabanı adresini 'DATABASE_URL' adında bir
#    ortam değişkeni olarak bize verecek.
DATABASE_URL = os.environ.get('DATABASE_URL')

# 2. Eğer 'DATABASE_URL' bulunamazsa (örn: hala lokalde çalıştırıyorsak),
#    eskisi gibi SQLite kullanmaya devam et (bu, lokal testi bozmaz).
if DATABASE_URL is None:
    print("DATABASE_URL bulunamadı, SQLite kullanılacak.")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./kahve_zeka.db"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # 3. 'DATABASE_URL' bulunduysa (Render'da çalışıyorsa),
    #    PostgreSQL'e bağlan.
    print("PostgreSQL'e bağlanılıyor...")
    # Render'ın verdiği URL 'postgres://' ile başlar, SQLAlchemy 'postgresql://' bekler
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        
    engine = create_engine(DATABASE_URL)

# --- GÜNCELLEME SONU ---


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()