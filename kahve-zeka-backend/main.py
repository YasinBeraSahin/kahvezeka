# main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List, Optional
from passlib.context import CryptContext

from datetime import datetime, timedelta, timezone
from math import radians, cos, sin, asin, sqrt
import os

from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from database import SessionLocal, engine, Base
import models, schemas
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File
import shutil
import uuid # unique dosya isimleri için

# Veritabanı tablolarını oluştur (Dev ortamı için)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kahve Zeka API")

# CORS Ayarları
# Tüm originlere izin veriyoruz (Geliştirme aşaması için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Güvenlik Konfigürasyonu
SECRET_KEY = os.environ.get("SECRET_KEY", "gizli-anahtar-degistirin-lutfen")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 gün

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Global DB connection error variable (used in health check)
db_connection_error = None
try:
    # Basit bir bağlantı testi
    # (database.py içinde engine=None ise zaten oradan anlaşılır)
    if engine is None:
        db_connection_error = "Engine could not be created."
except Exception as e:
    db_connection_error = str(e)


# Yardımcı Fonksiyonlar
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Kimlik bilgileri doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_admin_user(
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Bu işlemi yapmak için admin yetkisi gerekli."
        )
    return current_user

def get_distance_between_points(lat1, lon1, lat2, lon2) -> float:
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371
    return c * r

# --- ANA ENDPOINT ---
@app.get("/")
def read_root():
    return {"message": "Kahve Zeka API'sine hoş geldiniz! (Local Mode)"}

@app.get("/health")
def health_check():
    if db_connection_error:
        return {
            "status": "error",
            "database_error": db_connection_error,
            "message": "Veritabanına bağlanılamadı. Lütfen bağlantı ayarlarını kontrol edin."
        }
    
    # Aktif bir bağlantı testi yapalım
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database_error": str(e)}

# --- KULLANICI VE GİRİŞ ENDPOINT'LERİ (ÖZEL) ---
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Kullanıcı adı veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="E-posta veya kullanıcı adı zaten kullanılıyor")

    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email, 
        username=user.username, 
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=List[schemas.User])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.get("/users/me", response_model=schemas.User)
def get_my_profile(
    current_user: models.User = Depends(get_current_user)
):
    return current_user

@app.get("/users/me/reviews", response_model=List[schemas.ReviewForUser])
def get_my_reviews(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reviews = db.query(models.Review).options(
        joinedload(models.Review.business)
    ).filter(models.Review.user_id == current_user.id).order_by(models.Review.id.desc()).all()
    return reviews

# --- FAVORİLER ENDPOINT'LERİ ---
@app.post("/users/me/favorites/{business_id}", response_model=dict)
def add_favorite(
    business_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Mekan bulunamadı")
    
    if business in current_user.favorites:
        return {"message": "Zaten favorilerde"}
    
    current_user.favorites.append(business)
    db.commit()
    return {"message": "Favorilere eklendi"}

@app.delete("/users/me/favorites/{business_id}", response_model=dict)
def remove_favorite(
    business_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Mekan bulunamadı")
    
    if business not in current_user.favorites:
        return {"message": "Favorilerde değil"}
    
    current_user.favorites.remove(business)
    db.commit()
    return {"message": "Favorilerden çıkarıldı"}

@app.get("/users/me/favorites", response_model=List[schemas.Business])
def get_my_favorites(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user.favorites

# --- ADMİN ENDPOINT'LERİ ---
@app.put("/admin/businesses/{business_id}/approve", response_model=schemas.Business)
def approve_business(
    business_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    db_business = db.query(models.Business).filter(
        models.Business.id == business_id
    ).first()
    if db_business is None:
        raise HTTPException(status_code=404, detail="Mekan bulunamadı.")
        
    db_business.is_approved = True
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    return db_business

@app.delete("/admin/businesses/{business_id}", response_model=dict)
def reject_business(
    business_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    """
    (Admin Yetkisi Gerekir)
    Bir mekanı (onaylanmamış başvuruyu) sistemden tamamen siler.
    """
    db_business = db.query(models.Business).filter(
        models.Business.id == business_id
    ).first()

    if db_business is None:
        raise HTTPException(status_code=404, detail="Mekan bulunamadı.")

    # (Opsiyonel: Zaten onaylanmış bir mekanı silmeyi engelleyedebiliriz)
    # if db_business.is_approved:
    #    raise HTTPException(status_code=400, detail="Onaylanmış mekan silinemez.")

    db.delete(db_business)
    db.commit()

    return {"message": "Mekan başvurusu başarıyla reddedildi/silindi"}

@app.get("/admin/all-businesses", response_model=List[schemas.Business])
def get_all_businesses_for_admin(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_user)
):
    all_businesses = db.query(models.Business).all()
    return all_businesses

# --- İŞLETME PANELİ ENDPOINT'LERİ (ÖZEL, 'me' rotaları) ---
@app.get("/businesses/me", response_model=schemas.BusinessDetail)
def get_my_business(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=403, detail="Bu işlemi yapmaya yetkiniz yok."
        )
            
    db_business = db.query(models.Business).options(
        selectinload(models.Business.reviews).joinedload(models.Review.owner), 
        selectinload(models.Business.menu_items),
        selectinload(models.Business.campaigns)
    ).filter(
        models.Business.owner_id == current_user.id
    ).first()

    if db_business is None:
        raise HTTPException(
            status_code=404, detail="Yönetilecek mekan bulunamadı."
        )
            
    return db_business

@app.put("/businesses/me", response_model=schemas.Business)
def update_my_business(
    business_data: schemas.BusinessUpdate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=403, detail="Bu işlemi yapmaya yetkiniz yok."
        )
            
    db_business = db.query(models.Business).filter(
        models.Business.owner_id == current_user.id
    ).first()

    if db_business is None:
        raise HTTPException(
            status_code=404, detail="Yönetilecek mekan bulunamadı."
        )
            
    update_data = business_data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_business, key, value)
            
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    
    return db_business

@app.post("/businesses/me/menu-items/", response_model=schemas.MenuItem)
def create_menu_item(
    menu_item: schemas.MenuItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Bu işlemi yapmaya yetkiniz yok.")
            
    db_business = db.query(models.Business).filter(
        models.Business.owner_id == current_user.id
    ).first()

    if db_business is None:
        raise HTTPException(status_code=404, detail="Yönetilecek mekan bulunamadı.")
            
    db_menu_item = models.MenuItem(
        **menu_item.model_dump(),
        business_id=db_business.id
    )
    db.add(db_menu_item)
    db.commit()
    db.refresh(db_menu_item)
    return db_menu_item

@app.delete("/businesses/me/menu-items/{item_id}", response_model=dict)
def delete_menu_item(
    item_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Bu işlemi yapmaya yetkiniz yok.")

    db_menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    
    if db_menu_item is None:
        raise HTTPException(status_code=404, detail="Menü öğesi bulunamadı.")

    if db_menu_item.business.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu öğeyi silme yetkiniz yok.")
            
    db.delete(db_menu_item)
    db.commit()
    return {"message": "Menü öğesi başarıyla silindi"}

@app.post("/businesses/me/campaigns/", response_model=schemas.Campaign)
def create_campaign(
    campaign: schemas.CampaignCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Bu işlemi yapmaya yetkiniz yok.")
            
    db_business = db.query(models.Business).filter(
        models.Business.owner_id == current_user.id
    ).first()

    if db_business is None:
        raise HTTPException(status_code=404, detail="Yönetilecek mekan bulunamadı.")
            
    db_campaign = models.Campaign(
        **campaign.model_dump(),
        business_id=db_business.id
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

@app.delete("/businesses/me/campaigns/{campaign_id}", response_model=dict)
def delete_campaign(
    campaign_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Bu işlemi yapmaya yetkiniz yok.")

    db_campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()
    
    if db_campaign is None:
        raise HTTPException(status_code=404, detail="Kampanya bulunamadı.")

    if db_campaign.business.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu kampanyayı silme yetkiniz yok.")
            
    db.delete(db_campaign)
    db.commit()
    return {"message": "Kampanya başarıyla silindi"}

# --- GENEL MEKAN/YORUM ENDPOINT'LERİ ---

# (EKSİK OLAN 1. FONKSİYON)
@app.post("/businesses/", response_model=schemas.Business)
def create_business(business: schemas.BusinessCreate, db: Session = Depends(get_db)):
    """
    Sisteme yeni bir kahve mekanı ekler.
    (Yöntem 2: 'is_approved' varsayılan olarak False başlar)
    """
    db_business = models.Business(**business.model_dump())
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    return db_business

@app.get("/businesses/", response_model=List[schemas.Business])
def get_businesses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Sistemdeki ONAYLI kahve mekanlarını listeler.
    """
    businesses = db.query(models.Business).options(
        joinedload(models.Business.reviews)
    ).filter(models.Business.is_approved == True).offset(skip).limit(limit).all()
    return businesses

# (EKSİK OLAN 2. FONKSİYON)
@app.get("/businesses/nearby/", response_model=List[schemas.BusinessDistance])
def get_nearby_businesses(
    lat: float, 
    lon: float, 
    radius_km: float = 5.0,
    search_query: Optional[str] = None, # <-- YENİ PARAMETRE
    has_wifi: bool = False,
    has_socket: bool = False,
    is_pet_friendly: bool = False,
    is_quiet: bool = False,
    serves_food: bool = False,
    has_board_games: bool = False,
    db: Session = Depends(get_db)
):
    """
    Verilen enlem/boylama ve yarıçapa (km) göre ONAYLI mekanları listeler.
    Ayrıca filtreleme ve arama seçenekleri sunar.
    """
    query = db.query(models.Business).options(
        joinedload(models.Business.reviews)
    ).filter(models.Business.is_approved == True)
    
    # İsim ile arama (Case-insensitive)
    if search_query:
        query = query.filter(models.Business.name.ilike(f"%{search_query}%"))

    if has_wifi:
        query = query.filter(models.Business.has_wifi == True)
    if has_socket:
        query = query.filter(models.Business.has_socket == True)
    if is_pet_friendly:
        query = query.filter(models.Business.is_pet_friendly == True)
    if is_quiet:
        query = query.filter(models.Business.is_quiet == True)
    if serves_food:
        query = query.filter(models.Business.serves_food == True)
    if has_board_games:
        query = query.filter(models.Business.has_board_games == True)
        
    all_businesses = query.all()
    
    nearby_businesses = []
    
    for business in all_businesses:
        distance = get_distance_between_points(
            lat1=lat, lon1=lon, lat2=business.latitude, lon2=business.longitude
        )
        if distance <= radius_km:
            nearby_businesses.append(
                schemas.BusinessDistance(business=business, distance_km=distance)
            )
            
    nearby_businesses.sort(key=lambda x: x.distance_km)
    
    return nearby_businesses

# DİKKAT: BU GENEL ROTA, ÖZEL OLAN '/businesses/me' ROTASINDAN SONRA GELİYOR
@app.get("/businesses/{business_id}", response_model=schemas.BusinessDetail)
def get_business(business_id: int, db: Session = Depends(get_db)):
    """
    Tek bir ONAYLI mekanın detaylarını getirir.
    """
    business = db.query(models.Business).options(
        selectinload(models.Business.reviews).joinedload(models.Review.owner),
        selectinload(models.Business.menu_items),
        selectinload(models.Business.campaigns)
    ).filter(
        models.Business.id == business_id,
        models.Business.is_approved == True # <-- GÜVENLİK KİLİDİ
    ).first()
    
    if business is None:
        raise HTTPException(status_code=404, detail="Mekan bulunamadı veya henüz onaylanmadı.")
        
    return business

@app.post("/businesses/{business_id}/reviews/", response_model=schemas.Review)
def create_review_for_business(
    business_id: int, 
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    db_review = models.Review(
        **review.model_dump(), 
        business_id=business_id,
        user_id=current_user.id
    )
    if not (1 <= db_review.rating <= 5):
        raise HTTPException(status_code=400, detail="Puan 1 ile 5 arasında olmalıdır.")
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    db_review.owner = current_user 
    return db_review

@app.get("/businesses/{business_id}/reviews/", response_model=List[schemas.Review])
def get_reviews_for_business(business_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).options(
        joinedload(models.Review.owner)
    ).filter(models.Review.business_id == business_id).all()
    return reviews

# --- DOSYA YÜKLEME VE STATİK DOSYA SERVİSİ ---

# Uploads klasörünü oluştur
os.makedirs("uploads", exist_ok=True)

# /uploads path'ini dışarı aç (Resimlere erişim için)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Dosya uzantısını al
    extension = file.filename.split(".")[-1]
    # Unique isim oluştur
    filename = f"{uuid.uuid4()}.{extension}"
    file_path = f"uploads/{filename}"
    
    # Dosyayı kaydet
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # URL'i döndür (Prod ortamında domain değişebilir, şimdilik relatif veya tam yol)
    # Backend URL'i mobil tarafta bilindiği için sadece path döndürmek yeterli olabilir,
    # ama tam URL vermek daha güvenli.
    # Şimdilik static path verelim:
    return {"url": f"/uploads/{filename}"}


# --- CHAT / AI ENDPOINT ---
from services import chat_service

class ChatRequest(schemas.BaseModel):
    message: str

@app.post("/api/chat/recommend")
async def recommend_coffee(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Kullanıcının ruh haline göre kahve önerisi yapar (Google Gemini AI).
    """
    # İsterseniz burada kullanıcı oturumunu kontrol edebilirsiniz (current_user = Depends...)
    # Şimdilik herkese açık olsun veya token isteyebiliriz.
    
    result = await chat_service.recommend_coffee_from_mood(request.message)
    return result

# --- DEBUG / SYSTEM ENDPOINTS ---
@app.post("/debug/reset-db")
def reset_database(db: Session = Depends(get_db)):
    """
    Veritabanını sıfırlar ve yeni şemayı uygular.
    DİKKAT: Tüm veriler silinir!
    """
    # Tabloları sil
    Base.metadata.drop_all(bind=engine)
    # Tabloları yeniden oluştur
    Base.metadata.create_all(bind=engine)
    
    # Örnek veri ekle (Opsiyonel, boş kalmasın diye)
    # Admin kullanıcısı
    admin_user = models.User(
        email="admin@kahvezeka.com",
        username="admin",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        is_active=True
    )
    db.add(admin_user)
    
    # Örnek İşletme
    sample_business = models.Business(
        name="Kahve Zeka Merkez",
        address="Alsancak, İzmir",
        phone="05551112233",
        latitude=38.4381,
        longitude=27.1418,
        has_wifi=True,
        has_socket=True,
        is_pet_friendly=True,
        is_quiet=True,
        serves_food=True,
        has_board_games=True,
        owner_id=1,
        is_approved=True
    )
    db.add(sample_business)
    
    db.commit()
    return {"message": "Veritabanı sıfırlandı ve güncellendi."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)