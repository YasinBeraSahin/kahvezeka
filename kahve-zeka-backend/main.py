# main.py
from fastapi.middleware.cors import CORSMiddleware # YENİ EKLENEN SATIR
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List
from passlib.context import CryptContext

from datetime import datetime, timedelta, timezone # YENİ
from typing import Optional # YENİ (eğer zaten yoksa)
from math import radians, cos, sin, asin, sqrt

from jose import JWTError, jwt # YENİ
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm # YENİ


# Kendi oluşturduğumuz modülleri import ediyoruz
import models
import schemas 
from database import SessionLocal, engine,Base

# Şifreleme için context oluşturuyoruz
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# Veritabanında tablolarımızı oluşturuyoruz (eğer yoksa).
# Bu komut models.py içindeki tüm sınıfları bulup tabloya çevirir.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kahve Zeka API",
    description="Kahve severler için kişiselleştirilmiş bir keşif platformu.",
    version="0.0.1"
)

# --- YENİ EKLENEN CORS AYARLARI ---

# origins (kaynaklar) listesi, bizim frontend'imizin adresini içeriyor.
origins = [
    "http://localhost:5173", # Bizim React (Vite) sunucumuz
    "http://localhost",
    "https://kahve-zeka.netlify.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Bu kaynaklardan gelen isteklere izin ver
    allow_credentials=True,
    allow_methods=["*"], # Tüm metodlara (GET, POST, vb.) izin ver
    allow_headers=["*"], # Tüm başlıklara (header) izin ver
)

# --- CORS AYARLARI SONU ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Veritabanı oturumu (session) bağımlılığı
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API ENDPOINTS ---

@app.post("/businesses/", response_model=schemas.Business)
def create_business(business: schemas.BusinessCreate, db: Session = Depends(get_db)):
    """
    Sisteme yeni bir kahve mekanı ekler.
    """
    # 1. Gelen şema verisini veritabanı modeline çevir
    db_business = models.Business(**business.model_dump())
    
    # 2. Veritabanı oturumuna bu yeni mekanı ekle (henüz kaydetmedi)
    db.add(db_business)
    
    # 3. Değişiklikleri veritabanına işle (kaydet)
    db.commit()
    
    # 4. Veritabanının oluşturduğu id gibi verileri almak için modeli yenile
    db.refresh(db_business)
    
    # 5. Oluşturulan mekanı API yanıtı olarak döndür
    return db_business



@app.get("/")
def read_root():
    return {"message": "Kahve Zeka API'sine hoş geldiniz!"}


@app.get("/businesses/", response_model=List[schemas.Business])
def get_businesses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Sistemdeki tüm kahve mekanlarını ve ortalama puanlarını listeler.
    (Yorumları içermez)
    """
    # 'joinedload' ile 'reviews' ilişkisini yüklüyoruz.
    # Bu, 'average_rating' hibrit özelliğinin N+1 sorgu yapmadan,
    # hafızadaki 'reviews' listesi üzerinden çalışmasını sağlar.
    businesses = db.query(models.Business).options(
        joinedload(models.Business.reviews)
    ).filter(models.Business.is_approved == True).offset(skip).limit(limit).all() # <-- FİLTRE EKLENDİ

    return businesses



@app.get("/businesses/nearby/", response_model=List[schemas.BusinessDistance])
def get_nearby_businesses(
    lat: float, 
    lon: float, 
    radius_km: float = 5.0, # Varsayılan 5km yarıçap
    db: Session = Depends(get_db)
):
    """
    Verilen enlem/boylama ve yarıçapa (km) göre yakındaki mekanları listeler.
    Mekanları en yakından en uzağa doğru sıralar.
    """
    
    # 1. Tüm mekanları veritabanından çek (şimdilik)
    #    Ortalama puanı da hesaplayabilmek için 'reviews' ilişkisini yüklüyoruz.
    all_businesses = db.query(models.Business).options(
        joinedload(models.Business.reviews)
    ).filter(models.Business.is_approved == True).all()
    
    nearby_businesses = []
    
    # 2. Python içinde her bir mekanı döngüye al
    for business in all_businesses:
        # 3. Mesafeyi hesapla
        distance = get_distance_between_points(
            lat1=lat, 
            lon1=lon, 
            lat2=business.latitude, 
            lon2=business.longitude
        )
        
        # 4. Yarıçapın içindeyse listeye ekle
        if distance <= radius_km:
            nearby_businesses.append(
                schemas.BusinessDistance(
                    business=business, 
                    distance_km=distance
                )
            )
            
    # 5. Listeyi en yakından en uzağa doğru sırala
    nearby_businesses.sort(key=lambda x: x.distance_km)
    
    return nearby_businesses


# --- Güvenlik için yardımcı fonksiyon ---
def get_password_hash(password):
    return pwd_context.hash(password)

# ... (get_password_hash fonksiyonunun altı)


def verify_password(plain_password, hashed_password):
    """Gelen açık şifre ile veritabanındaki hash'lenmiş şifreyi karşılaştırır."""
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(db: Session, username: str, password: str):
    """Kullanıcıyı doğrular. Başarılıysa kullanıcı objesini, değilse False döndürür."""
    # 1. Kullanıcıyı veritabanında kullanıcı adına göre bul
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return False # Kullanıcı bulunamadı
        
    # 2. Gelen şifre ile veritabanındaki hash'lenmiş şifreyi doğrula
    if not verify_password(password, user.hashed_password):
        return False # Şifre yanlış
        
    # 3. Her şey yolundaysa kullanıcıyı döndür
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Verilen 'data'yı kullanarak yeni bir JWT jetonu oluşturur."""
    to_encode = data.copy()
    
    # Jetonun son kullanma tarihini ayarla
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Varsayılan olarak 15 dakika ekle
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        
    to_encode.update({"exp": expire})
    
    # Jetonu gizli anahtarımızla imzala
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- User Endpoints ---
# ... (create_user fonksiyonu burada devam ediyor)

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
):
    """
    Gelen jetonu (token) çözer, kullanıcıyı doğrular ve 
    veritabanından kullanıcı objesini döndürür.
    """

    # Jetonu (token) çözemezsek vereceğimiz standart hata
    credentials_exception = HTTPException(
        status_code=401, # Yetkisiz
        detail="Kimlik bilgileri doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Jetonu, gizli anahtarımızla çözmeyi dene
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Jetonun içinden "sub" (subject) alanını al (biz buraya username'i koymuştuk)
        username: str = payload.get("sub")

        if username is None:
            raise credentials_exception # Jetonun içinde username yoksa

        token_data = schemas.TokenData(username=username)

    except JWTError:
        raise credentials_exception # Jeton geçersiz veya süresi dolmuşsa

    # Jeton geçerliyse, kullanıcıyı veritabanından bul
    user = db.query(models.User).filter(models.User.username == token_data.username).first()

    if user is None:
        raise credentials_exception # Jetonun sahibi olan kullanıcı veritabanında yoksa

    # Her şey yolundaysa, kullanıcıyı döndür
    return user

def get_current_admin_user(
    current_user: models.User = Depends(get_current_user)
):
    """
    Giriş yapmış kullanıcının 'admin' rolünde olup olmadığını
    kontrol eden bir bağımlılık.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Bu işlemi yapmak için admin yetkisi gerekli."
        )
    return current_user

def get_distance_between_points(lat1, lon1, lat2, lon2) -> float:
    """
    Haversine formülünü kullanarak iki enlem/boylam 
    noktası arasındaki mesafeyi kilometre olarak hesaplar.
    """
    # Tüm dereceleri radyana çevir
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # Haversine formülü
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 # Dünyanın yarıçapı (km)
    return c * r

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Sisteme yeni bir kullanıcı (şifresi hash'lenerek) ekler.
    """

    # Hata Kontrolü: E-posta veya kullanıcı adı zaten var mı?
    existing_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="E-posta veya kullanıcı adı zaten kullanılıyor")

    # ŞİFREYİ HASH'LİYORUZ
    hashed_password = get_password_hash(user.password)

    # Modeli oluştururken 'password' yerine 'hashed_password'ı kaydediyoruz
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
    """
    Sistemdeki tüm kullanıcıları listeler.
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

# --- YENİ PROFİL ENDPOINT'İ ---
@app.get("/users/me/reviews", response_model=List[schemas.ReviewForUser])
def get_my_reviews(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Giriş yapmış kullanıcının (jetondan alınan)
    kendi yaptığı tüm yorumları listeler.
    Yorumla birlikte, yorumun yapıldığı mekanın (business)
    temel bilgisini de getirir.
    """
    # SQLAlchemy'ye 'business' ilişkisini de (SQL JOIN ile)
    # verimli bir şekilde yüklemesini söylüyoruz.
    reviews = db.query(models.Review).options(
        joinedload(models.Review.business)
    ).filter(models.Review.user_id == current_user.id).order_by(models.Review.id.desc()).all()

    return reviews

@app.put("/admin/businesses/{business_id}/approve", response_model=schemas.Business)
def approve_business(
    business_id: int,
    db: Session = Depends(get_db),
    # Bu endpoint'i sadece adminler kullanabilir
    admin_user: models.User = Depends(get_current_admin_user)
):
    """
    (Admin Yetkisi Gerekir)
    Bir mekanın 'is_approved' statüsünü 'True' olarak günceller.
    """
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

# --- YENİ HATA AYIKLAMA ENDPOINT'İ ---
@app.get("/admin/all-businesses", response_model=List[schemas.Business])
def get_all_businesses_for_admin(
    db: Session = Depends(get_db),
    # Bu endpoint'i sadece adminler kullanabilir
    admin_user: models.User = Depends(get_current_admin_user)
):
    """
    (Admin Yetkisi Gerekir)
    Sistemdeki ONAYLI VEYA ONAYSIZ TÜM mekanları listeler.
    Hata ayıklama için eklendi.
    """
    # Filtre OLMADAN tüm mekanları çek
    all_businesses = db.query(models.Business).all()
    return all_businesses

# --- YENİ İŞLETME PANELİ ENDPOINT'LERİ ---

@app.get("/users/me", response_model=schemas.User)
def get_my_profile(
    current_user: models.User = Depends(get_current_user)
):
    """
    Giriş yapmış kullanıcının (jetondan alınan)
    kendi tam profil bilgilerini (rolü dahil) döndürür.
    Frontend, kullanıcının 'owner' olup olmadığını buradan anlar.
    """
    return current_user

@app.get("/businesses/me", response_model=schemas.BusinessDetail)
def get_my_business(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    (Giriş yapmış işletme sahibi adına)
    Sahip olunan mekanın mevcut bilgilerini getirir.
    Panel sayfasını doldurmak için bu kullanılır.
    """
    if current_user.role != "owner":
        raise HTTPException(
            status_code=403, detail="Bu işlemi yapmaya yetkiniz yok."
        )
            
    db_business = db.query(models.Business).options(
        # Müşteri tarafında çalışan sorgunun AYNISI:
        joinedload(models.Business.reviews).joinedload(models.Review.owner), 
        joinedload(models.Business.menu_items),
        joinedload(models.Business.campaigns)
       
    ).filter(
        models.Business.owner_id == current_user.id
    ).first()

    if db_business is None:
        raise HTTPException(
            status_code=404, detail="Yönetilecek mekan bulunamadı."
        )
            
    return db_business

@app.get("/businesses/{business_id}", response_model=schemas.BusinessDetail)
def get_business(business_id: int, db: Session = Depends(get_db)):
    business = db.query(models.Business).options(
        # 'selectinload' kullanarak bu 3 listeyi çakışmadan,
        # ayrı sorgularla yüklüyoruz.
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

@app.put("/businesses/me", response_model=schemas.Business)
def update_my_business(
    # 'business_update' adında yeni bir şema kullanacağız (aşağıda)
    business_data: schemas.BusinessUpdate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    (Giriş yapmış işletme sahibi adına)
    Sahip olunan mekanın bilgilerini günceller.
    """
    # 1. Kullanıcının 'owner' (sahip) rolü var mı?
    if current_user.role != "owner":
        raise HTTPException(
            status_code=403, detail="Bu işlemi yapmaya yetkiniz yok."
        )

    # 2. Kullanıcının sahip olduğu mekanı bul
    # (Şimdilik bir sahibin 1 mekanı olduğunu varsayıyoruz)
    db_business = db.query(models.Business).filter(
        models.Business.owner_id == current_user.id
    ).first()

    if db_business is None:
        raise HTTPException(
            status_code=404, detail="Yönetilecek mekan bulunamadı."
        )

    # 3. Gelen verilerle mekanı güncelle
    # 'business_data' Pydantic modelini dict'e çevir
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
    """
    (Giriş yapmış işletme sahibi adına)
    Sahip olunan mekana yeni bir menü öğesi ekler.
    """
    # 1. 'update_my_business'teki aynı mantık:
    # Önce kullanıcı 'owner' mı ve bir mekanı var mı?
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Bu işlemi yapmaya yetkiniz yok.")

    db_business = db.query(models.Business).filter(
        models.Business.owner_id == current_user.id
    ).first()

    if db_business is None:
        raise HTTPException(status_code=404, detail="Yönetilecek mekan bulunamadı.")

    # 2. Yeni menü öğesini oluştur ve mekana ata
    db_menu_item = models.MenuItem(
        **menu_item.model_dump(),
        business_id=db_business.id # Öğeyi bu mekana bağla
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
    """
    (Giriş yapmış işletme sahibi adına)
    Sahip olunan mekandan bir menü öğesini siler.
    """
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Bu işlemi yapmaya yetkiniz yok.")

    # 1. Silinecek menü öğesini bul
    db_menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()

    if db_menu_item is None:
        raise HTTPException(status_code=404, detail="Menü öğesi bulunamadı.")

    # 2. Güvenlik Kontrolü: Bu menü öğesi, bu 'owner'ın mekanına mı ait?
    if db_menu_item.business.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu öğeyi silme yetkiniz yok.")

    # 3. Öğeyi sil
    db.delete(db_menu_item)
    db.commit()

    return {"message": "Menü öğesi başarıyla silindi"}

# --- YENİ KAMPANYA YÖNETİMİ ENDPOINT'LERİ ---

@app.post("/businesses/me/campaigns/", response_model=schemas.Campaign)
def create_campaign(
    campaign: schemas.CampaignCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    (Giriş yapmış işletme sahibi adına)
    Sahip olunan mekana yeni bir kampanya ekler.
    """
    # Menü eklemeyle aynı mantık: Sahibi ve mekanı doğrula
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Bu işlemi yapmaya yetkiniz yok.")

    db_business = db.query(models.Business).filter(
        models.Business.owner_id == current_user.id
    ).first()

    if db_business is None:
        raise HTTPException(status_code=404, detail="Yönetilecek mekan bulunamadı.")

    # Yeni kampanyayı oluştur ve mekana ata
    db_campaign = models.Campaign(
        **campaign.model_dump(),
        business_id=db_business.id # Kampanyayı bu mekana bağla
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
    """
    (Giriş yapmış işletme sahibi adına)
    Sahip olunan mekandan bir kampanyayı siler.
    """
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Bu işlemi yapmaya yetkiniz yok.")

    # Silinecek kampanyayı bul
    db_campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()

    if db_campaign is None:
        raise HTTPException(status_code=404, detail="Kampanya bulunamadı.")

    # Güvenlik Kontrolü: Bu kampanya, bu 'owner'ın mekanına mı ait?
    if db_campaign.business.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu kampanyayı silme yetkiniz yok.")

    # Öğeyi sil
    db.delete(db_campaign)
    db.commit()

    return {"message": "Kampanya başarıyla silindi"}

# --- Authentication (Kimlik Doğrulama) Endpoint ---

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Kullanıcıya giriş yapması için bir 'access token' sağlar.
    
    Bu endpoint JSON DEĞİL, x-www-form-urlencoded verisi bekler.
    (username=... & password=...)
    """
    
    # 1. Kullanıcıyı doğrula (username ve password ile)
    user = authenticate_user(db, form_data.username, form_data.password)
    
    # 2. Doğrulama başarısızsa hata fırlat
    if not user:
        raise HTTPException(
            status_code=401, # 401 Unauthorized (Kimlik Doğrulanamadı)
            detail="Kullanıcı adı veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 3. Jetonun ne kadar geçerli olacağını belirle
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 4. Jetonu oluştur. Jetonun içine kimlik bilgisi olarak 'sub' (subject) koyarız.
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # 5. Jetonu kullanıcıya döndür
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/businesses/{business_id}/reviews/", response_model=schemas.Review)
def create_review_for_business(
    business_id: int, 
    review: schemas.ReviewCreate, # Artık içinde user_id yok
    db: Session = Depends(get_db),
    # YENİ KORUMA: Bu satır, giriş yapmayı zorunlu kılar!
    current_user: models.User = Depends(get_current_user) 
):
    """
    (Giriş yapmış kullanıcı adına) Belirli bir mekana yeni bir yorum ekler.
    """
    
    # Yorumu oluştururken 'user_id'yi manuel olarak 'review' objesinden
    # değil, güvenli bir şekilde 'current_user' objesinden alıyoruz.
    db_review = models.Review(
        **review.model_dump(), 
        business_id=business_id,
        user_id=current_user.id  # EN ÖNEMLİ DEĞİŞİKLİK
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
    """
    Belirli bir mekanın tüm yorumlarını listeler.
    """
    # .options(joinedload(models.Review.owner)) ekleyerek,
    # her yorumu çekerken 'owner' (yani User) ilişkisini de
    # aynı sorguda getirmesini söylüyoruz. Bu çok verimlidir.
    reviews = db.query(models.Review).options(
        joinedload(models.Review.owner)
    ).filter(models.Review.business_id == business_id).all()
    return reviews