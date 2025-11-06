# main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List, Optional
from passlib.context import CryptContext

from datetime import datetime, timedelta, timezone
from math import radians, cos, sin, asin, sqrt

from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# Kendi oluşturduğumuz modülleri import ediyoruz
import models
import schemas 
# --- KRİTİK DÜZELTME 1: 'Base' ve 'engine'i de import et ---
from database import SessionLocal, engine, Base 

# Şifreleme için context oluşturuyoruz
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# --- KRİTİK DÜZELTME 2: 'database'den gelen 'Base'i kullan ---
# Bu komut, PostgreSQL'de 'users', 'businesses' vb. tabloları oluşturur.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kahve Zeka API",
    description="Kahve severler için kişiselleştirilmiş bir keşif platformu.",
    version="1.0.0"
)

# --- CORS AYARLARI (Tüm sitelere izin ver) ---
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- GÜNCELLEME SONU ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Veritabanı oturumu (session) bağımlılığı
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- GÜVENLİK YARDIMCILARI (Tamamı) ---
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

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
    return {"message": "Kahve Zeka API'sine hoş geldiniz!"}

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
@app.post("/businesses/", response_model=schemas.Business)
def create_business(business: schemas.BusinessCreate, db: Session = Depends(get_db)):
    """
    Sisteme yeni bir kahve mekanı ekler.
    (Yöntem 2: 'is_approved' varsayılan olarak False başlar)
    """
    db_business = models.Business(**business.model_dump())
    
    # Not: 'is_approved' sütunu modelde default=False olduğu için
    # burada ekstra bir şey yapmamıza gerek yok.
    
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    return db_business
# --- GENEL MEKAN/YORUM ENDPOINT'LERİ ---
@app.get("/businesses/{business_id}", response_model=schemas.BusinessDetail)
def get_business(business_id: int, db: Session = Depends(get_db)):
    business = db.query(models.Business).options(
        selectinload(models.Business.reviews).joinedload(models.Review.owner),
        selectinload(models.Business.menu_items),
        selectinload(models.Business.campaigns)
    ).filter(
        models.Business.id == business_id,
        models.Business.is_approved == True
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