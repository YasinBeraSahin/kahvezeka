# models.py

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, func, select, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from database import Base

# 'User' (Kullanıcı) modelini/tablosunu tanımlıyoruz.
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Rol: 'customer' (normal kullanıcı) veya 'owner' (işletme sahibi)
    role = Column(String, default="customer") 
    
    # 'owner' rolündeki kullanıcının sahip olduğu mekanlar
    businesses = relationship("Business", back_populates="owner")
    
    # Favori mekanlar (Many-to-Many)
    favorites = relationship("Business", secondary="favorites", back_populates="favorited_by")

    reviews = relationship("Review", back_populates="owner")
    
    # Chat Geçmişi
    chat_sessions = relationship("ChatSession", back_populates="owner")


# Many-to-Many ilişki için ara tablo
from sqlalchemy import Table
favorites = Table(
    "favorites",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("business_id", Integer, ForeignKey("businesses.id"), primary_key=True),
)

# 'Review' (Yorum) modelini/tablosunu tanımlıyoruz.
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer, index=True) # 1-5 arası puan
    comment = Column(Text, nullable=True) # Yorum metni (opsiyonel)
    
    # --- İlişkiler (Relationships) ---
    user_id = Column(Integer, ForeignKey("users.id"))
    business_id = Column(Integer, ForeignKey("businesses.id"))

    owner = relationship("User", back_populates="reviews")
    business = relationship("Business", back_populates="reviews")

# 'Business' (Mekan) modelini/tablosunu tanımlıyoruz.
class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    phone = Column(String, nullable=True)
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Filtreleme Özellikleri
    has_wifi = Column(Boolean, default=False)
    has_socket = Column(Boolean, default=False)  # Priz var mı?
    is_pet_friendly = Column(Boolean, default=False)
    is_quiet = Column(Boolean, default=False)    # Sessiz/Çalışmaya uygun mu?
    serves_food = Column(Boolean, default=False) # Yemek servisi var mı?
    has_board_games = Column(Boolean, default=False) # Masa/Kutu oyunları var mı?
    
    # Bu mekanın sahibinin 'users' tablosundaki ID'si
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    # Bu mekanın menü öğelerini listeler
    menu_items = relationship("MenuItem", back_populates="business", cascade="all, delete-orphan")
    is_approved = Column(Boolean, default=False, nullable=False)  # Mekanın onaylanıp onaylanmadığını belirtir
    # Bu mekanın kampanyalarını listeler
    campaigns = relationship("Campaign", back_populates="business", cascade="all, delete-orphan")
    # Python kodunda business.owner yazarak User objesine ulaşmayı sağlar
    owner = relationship("User", back_populates="businesses")
    
    # Bu mekanı favorileyen kullanıcılar
    favorited_by = relationship("User", secondary="favorites", back_populates="favorites")

    reviews = relationship("Review", back_populates="business")

    @hybrid_property
    def average_rating(self):
        if not self.reviews:
            return 0.0
        total_rating = sum(r.rating for r in self.reviews)
        return total_rating / len(self.reviews)

    @hybrid_property
    def review_count(self):
        return len(self.reviews)

# --- YENİ MENÜ ÖĞESİ MODELİ ---
class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False) # örn: "Espresso"
    description = Column(String, nullable=True)     # örn: "İtalyan usulü"
    price = Column(Float, nullable=False)           # örn: 50.0
    category = Column(String, nullable=True, index=True) # <-- Yeni alan: Kategori (Sıcak, Soğuk, Tatlı vb.)
    
    # Bu öğenin hangi mekana ait olduğunu belirten ilişki
    business_id = Column(Integer, ForeignKey("businesses.id"))
    
    business = relationship("Business", back_populates="menu_items")

# --- YENİ KAMPANYA MODELİ ---
class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False) # örn: "1 Alana 1 Bedava"
    description = Column(Text, nullable=False)      # örn: "Filtre kahvelerde..."
    
    # Bu kampanyanın hangi mekana ait olduğunu belirten ilişki
    business_id = Column(Integer, ForeignKey("businesses.id"))
    
    business = relationship("Business", back_populates="campaigns")

# --- CHAT GEÇMİŞİ MODELLERİ ---
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=True) # "Kahve Önerisi - 10.05.2024" gibi
    created_at = Column(DateTime, default=func.now())
    
    # İlişkiler
    owner = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    sender = Column(String) # 'user' veya 'bot'
    content = Column(Text)  # Mesaj içeriği (JSON string olarak tutulabilir eğer zengin içerik varsa)
    is_recommendation = Column(Boolean, default=False) # Öneri içeriyor mu?
    recommendation_data = Column(Text, nullable=True) # Öneri JSON verisi
    timestamp = Column(DateTime, default=func.now())

    session = relationship("ChatSession", back_populates="messages")

