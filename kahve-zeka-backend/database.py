# database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Veritabanı dosyamızın adını ve yolunu belirliyoruz.
SQLALCHEMY_DATABASE_URL = "sqlite:///./kahve_zeka.db"

# SQLAlchemy "engine"ini oluşturuyoruz. Bu, veritabanına ana bağlantı noktasıdır.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Veritabanı oturumları (session) için bir fabrika oluşturuyoruz.
# Her bir istek için ayrı bir oturum açıp kapatacağız.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Modellerimizin (veritabanı tablolarımızın) miras alacağı temel bir sınıf oluşturuyoruz.
Base = declarative_base()