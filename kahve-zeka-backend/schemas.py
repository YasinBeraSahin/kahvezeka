# kahve-zeka-backend/schemas.py

from pydantic import BaseModel
from typing import Optional, List

# -----------------------------------------------
# 1. TEMEL ŞEMALAR (Kimseye bağımlı olmayanlar)
# -----------------------------------------------

class BusinessBase(BaseModel):
    name: str
    address: str
    phone: Optional[str] = None
    latitude: float
    longitude: float
    has_wifi: bool = False
    has_socket: bool = False
    is_pet_friendly: bool = False
    is_quiet: bool = False
    serves_food: bool = False
    image_url: Optional[str] = None # <-- Yeni alan

class BusinessSimple(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    username: str

class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None
    image_url: Optional[str] = None # <-- Yeni alan

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

# --- KAMPANYA TEMEL ŞEMASI (BURAYA TAŞINDI) ---
class CampaignBase(BaseModel):
    title: str
    description: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# -----------------------------------------------
# 2. OLUŞTURMA VE GÜNCELLEME ŞEMALARI
# -----------------------------------------------

class BusinessCreate(BusinessBase):
    owner_id: Optional[int] = None

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    owner_id: Optional[int] = None
    has_wifi: Optional[bool] = None
    has_socket: Optional[bool] = None
    is_pet_friendly: Optional[bool] = None
    is_quiet: Optional[bool] = None
    serves_food: Optional[bool] = None
    image_url: Optional[str] = None # <-- Yeni alan

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "customer"

class ReviewCreate(ReviewBase):
    pass

class MenuItemCreate(MenuItemBase):
    pass

# --- KAMPANYA OLUŞTURMA ŞEMASI (BURAYA TAŞINDI) ---
class CampaignCreate(CampaignBase):
    pass 


# -----------------------------------------------
# 3. VERİTABANI OKUMA ŞEMALARI (Sıralama Önemli!)
# -----------------------------------------------

# 'User'ı tanımla
class User(UserBase):
    id: int
    is_active: bool
    role: str
    class Config:
        from_attributes = True

# 'Review'u tanımla
class Review(ReviewBase):
    id: int
    business_id: int
    owner: User 
    class Config:
        from_attributes = True
        
# 'ReviewForUser'ı tanımla
class ReviewForUser(ReviewBase):
    id: int
    business: BusinessSimple
    class Config:
        from_attributes = True

# 'MenuItem'ı tanımla
class MenuItem(MenuItemBase):
    id: int
    business_id: int
    class Config:
        from_attributes = True

# --- KAMPANYA OKUMA ŞEMASI (BURAYA TAŞINDI) ---
class Campaign(CampaignBase):
    id: int
    business_id: int
    class Config:
        from_attributes = True

# 'Business'ı tanımla
class Business(BusinessBase):
    id: int
    average_rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    is_approved: bool
    class Config:
        from_attributes = True

# 'BusinessDetail'i tanımla (Artık 'Campaign'i tanıyacak)
class BusinessDetail(Business):
    reviews: List[Review] = []
    menu_items: List[MenuItem] = []
    campaigns: List[Campaign] = [] # <-- Artık hata vermemeli

# 'BusinessDistance'ı tanımla
class BusinessDistance(BaseModel):
    business: Business
    distance_km: float