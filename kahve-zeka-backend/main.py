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
    
    # --- FAVORITES ANALYTICS TRACKING ---
    try:
        from models import BusinessAnalytics
        from datetime import datetime
        today = datetime.now().date()
        
        stat = db.query(BusinessAnalytics).filter(
            BusinessAnalytics.business_id == business_id,
            BusinessAnalytics.date == today
        ).first()
        
        if stat:
            stat.favorites_gained += 1
        else:
            stat = BusinessAnalytics(business_id=business_id, date=today, favorites_gained=1)
            db.add(stat)
    except Exception as e:
        print(f"Analytics Error: {e}")
    # ------------------------------------
    
    db.commit()
    return {"message": "Mekan favorilere eklendi"}

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
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@app.post("/api/chat/recommend")
async def recommend_coffee(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Kullanıcının ruh haline göre kahve önerisi yapar (Google Gemini AI + RAG).
    Artık veritabanındaki gerçek ürünleri analiz eder.
    """
    result = await chat_service.recommend_coffee_smart(
        request.message, 
        db,
        user_lat=request.latitude,
        user_lon=request.longitude
    )
    return result

# --- CHAT HISTORY ENDPOINTS ---
import json

class ChatSessionCreate(schemas.BaseModel):
    title: Optional[str] = "Yeni Sohbet"

class ChatMessageCreate(schemas.BaseModel):
    content: str
    sender: str # 'user' or 'bot'
    is_recommendation: bool = False
    recommendation_data: Optional[str] = None # JSON string

@app.post("/api/chat/sessions", response_model=dict)
def create_chat_session(
    session_data: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Yeni bir sohbet oturumu başlatır."""
    new_session = models.ChatSession(
        user_id=current_user.id,
        title=session_data.title
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return {"id": new_session.id, "title": new_session.title, "created_at": new_session.created_at}

@app.get("/api/chat/sessions", response_model=List[dict])
def get_chat_sessions(
    skip: int = 0, 
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Kullanıcının sohbet geçmişini getirir."""
    sessions = db.query(models.ChatSession).filter(
        models.ChatSession.user_id == current_user.id
    ).order_by(models.ChatSession.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {"id": s.id, "title": s.title, "created_at": s.created_at}
        for s in sessions
    ]

@app.get("/api/chat/sessions/{session_id}/messages", response_model=List[dict])
def get_session_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Bir oturuma ait mesajları getirir."""
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Oturum bulunamadı.")
        
    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.session_id == session_id
    ).order_by(models.ChatMessage.timestamp.asc()).all()
    
    result = []
    for m in messages:
        msg_dict = {
            "id": m.id,
            "text": m.content,
            "sender": m.sender,
            "timestamp": m.timestamp,
        }
        if m.is_recommendation and m.recommendation_data:
             try:
                 rec_data = json.loads(m.recommendation_data)
                 # Frontend'in beklediği formatta veriyi genişlet
                 if "recommendations" in rec_data:
                     msg_dict["isRecommendation"] = True
                     msg_dict["recommendations"] = rec_data["recommendations"]
                 if "products" in rec_data:
                     msg_dict["isProductList"] = True
                     msg_dict["products"] = rec_data["products"]
             except:
                 pass
        result.append(msg_dict)
        
    return result

@app.post("/api/chat/sessions/{session_id}/message")
async def send_message_to_session(
    session_id: int,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Mevcut bir oturuma mesaj gönderir ve AI cevabını kaydeder.
    """
    import traceback
    try:
        # 1. Oturumu Doğrula
        session = db.query(models.ChatSession).filter(
            models.ChatSession.id == session_id,
            models.ChatSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Oturum bulunamadı.")

        # 2. Kullanıcı Mesajını Kaydet
        user_msg = models.ChatMessage(
            session_id=session_id,
            sender="user",
            content=request.message
        )
        db.add(user_msg)
        db.commit()

        # 3. AI Cevabını Al
        ai_result = await chat_service.recommend_coffee_smart(
            request.message, 
            db,
            user_lat=request.latitude,
            user_lon=request.longitude
        )

        # 4. AI Mesajlarını Kaydet (Parçalı olarak)
        
        # a. Giriş/Düşünce Mesajı
        intro_text = ai_result.get("thought_process")
        if not intro_text:
             emotion = ai_result.get("emotion_category", "Belirsiz")
             intro_text = f"Seni '{emotion}' hissettim."

        bot_intro = models.ChatMessage(
            session_id=session_id,
            sender="bot",
            content=intro_text
        )
        db.add(bot_intro)
        
        # b. Öneriler (Varsa)
        recs = ai_result.get("recommendations", [])
        if recs:
            # Öneri verisini JSON olarak sakla
            rec_json = json.dumps({"recommendations": recs})
            bot_recs = models.ChatMessage(
                session_id=session_id,
                sender="bot",
                content="Önerilerim:", # Fallback text
                is_recommendation=True,
                recommendation_data=rec_json
            )
            db.add(bot_recs)

        # c. Ürünler (Varsa)
        products = ai_result.get("matching_products", [])
        if products:
            prod_json = json.dumps({"products": products}, default=str) # Safe serialize
            bot_prods = models.ChatMessage(
                session_id=session_id,
                sender="bot",
                content="Mekan önerileri:",
                is_recommendation=True, # Frontend bunu da kart olarak işleyebilir veya ayrı flag
                recommendation_data=prod_json
            )
            db.add(bot_prods)

        # Oturum başlığını güncelle (İlk mesajsa)
        # Basitçe ilk mesajın ilk 30 karakteri olabilir
        messages_count = db.query(models.ChatMessage).filter(models.ChatMessage.session_id == session_id).count()
        if messages_count <= 4: # Yeni bir oturum sayılır
            session.title = request.message[:50] + "..."
            db.add(session)

        db.commit()
        
        return ai_result
    except Exception as e:
        db.rollback()
        print("CHAT ERROR TRACEBACK:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Sunucu hatası: {str(e)}")


# --- BUSINESS ANALYTICS ENDPOINTS ---
@app.post("/api/analytics/{business_id}/view")
def increment_business_view(
    business_id: int,
    db: Session = Depends(get_db)
):
    """
    Bir mekanın günlük görüntülenme sayısını artırır.
    (Herhangi bir kullanıcı tetikleyebilir)
    """
    today = datetime.now().date()
    # Bugün için kayıt var mı kontrol et
    stat = db.query(models.BusinessAnalytics).filter(
        models.BusinessAnalytics.business_id == business_id,
        models.BusinessAnalytics.date == today
    ).first()
    
    if stat:
        stat.views += 1
    else:
        stat = models.BusinessAnalytics(business_id=business_id, date=today, views=1)
        db.add(stat)
    
    db.commit()
    return {"status": "success", "views": stat.views}

@app.post("/api/analytics/{business_id}/click")
def increment_business_click(
    business_id: int,
    db: Session = Depends(get_db)
):
    """
    Bir mekanın aksiyon (tel, harita vb.) tıklanma sayısını artırır.
    """
    today = datetime.now().date()
    stat = db.query(models.BusinessAnalytics).filter(
        models.BusinessAnalytics.business_id == business_id,
        models.BusinessAnalytics.date == today
    ).first()
    
    if stat:
        stat.clicks += 1
    else:
        stat = models.BusinessAnalytics(business_id=business_id, date=today, clicks=1)
        db.add(stat)
    
    db.commit()
    return {"status": "success", "clicks": stat.clicks}

@app.get("/api/analytics/{business_id}/stats")
def get_business_stats(
    business_id: int,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Bir mekanın son X günkü istatistiklerini getirir.
    (Sadece mekan sahibi görebilir)
    """
    # Yetki Kontrolü
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
         raise HTTPException(status_code=404, detail="Mekan bulunamadı")
    
    # Admin değilse ve sahibi değilse hata ver
    if current_user.role != 'admin' and business.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu veriye erişim yetkiniz yok")

    start_date = datetime.now().date() - timedelta(days=days)
    
    stats = db.query(models.BusinessAnalytics).filter(
        models.BusinessAnalytics.business_id == business_id,
        models.BusinessAnalytics.date >= start_date
    ).order_by(models.BusinessAnalytics.date.asc()).all()
    
    return [
        {
            "date": s.date.strftime("%Y-%m-%d"),
            "views": s.views,
            "clicks": s.clicks,
            "ai_recommendations": s.ai_recommendations,
            "favorites_gained": s.favorites_gained
        }
        for s in stats
    ]

@app.get("/api/analytics/{business_id}/ratings")
def get_business_rating_distribution(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Bir mekanın yıldız dağılımını (kaç tane 5 yıldız, kaç tane 1 yıldız vb.) getirir.
    """
    # Yetki Kontrolü
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
         raise HTTPException(status_code=404, detail="Mekan bulunamadı")
    
    if current_user.role != 'admin' and business.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu veriye erişim yetkiniz yok")

    # Group by rating
    from sqlalchemy import func
    distribution = db.query(
        models.Review.rating,
        func.count(models.Review.id)
    ).filter(
        models.Review.business_id == business_id
    ).group_by(models.Review.rating).all()
    
    # Format result: {1: 10, 2: 5, ...}
    dist_dict = {r: c for r, c in distribution}
    result = []
    for i in range(1, 6):
        result.append({"name": f"{i} Yıldız", "value": dist_dict.get(i, 0)})
        
    return result

# --- PRODUCTION FIX ENDPOINT ---
@app.post("/api/admin/fix-prod-schema")
def fix_prod_schema(db: Session = Depends(get_db)):
    """
    Production tablosunu güncellemek için geçici endpoint.
    Render'da DB'ye doğrudan erişim zor olduğu için buradan yapıyoruz.
    """
    from sqlalchemy import text
    try:
        # 0. Tablo hiç yoksa oluştur (create_all eksik tabloları oluşturur, mevcutlara dokunmaz)
        models.Base.metadata.create_all(bind=engine)
        print("Ensured tables exist.")

        # 1. ai_recommendations sütunu - Postgres için IF NOT EXISTS güvenlidir
        try:
            # Postgres syntax: ADD COLUMN IF NOT EXISTS
            # Eğer hata verirse (SQLite vb.) try-except yakalar
            db.execute(text("ALTER TABLE business_analytics ADD COLUMN IF NOT EXISTS ai_recommendations INTEGER DEFAULT 0;"))
            print("Checked/Added ai_recommendations")
        except Exception as e:
            print(f"Postgres specific alter failed, try standard: {e}")
            try:
                db.execute(text("ALTER TABLE business_analytics ADD COLUMN ai_recommendations INTEGER DEFAULT 0;"))
            except Exception as e2:
                 print(f"Skipped ai_recommendations (likely exists): {e2}")

        # 2. favorites_gained sütunu
        try:
            db.execute(text("ALTER TABLE business_analytics ADD COLUMN IF NOT EXISTS favorites_gained INTEGER DEFAULT 0;"))
            print("Checked/Added favorites_gained")
        except Exception as e:
             print(f"Postgres specific alter failed, try standard: {e}")
             try:
                db.execute(text("ALTER TABLE business_analytics ADD COLUMN favorites_gained INTEGER DEFAULT 0;"))
             except Exception as e2:
                 print(f"Skipped favorites_gained (likely exists): {e2}")
            
        db.commit()
        return {"message": "Schema update attempted successfully. Check logs for details."}
    except Exception as e:
        db.rollback()
        return {"error": str(e)}

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