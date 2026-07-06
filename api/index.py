"""
IndiaForms Centre - Backend API
Single FastAPI app deployed as one Vercel Python serverless function.
All requests to /api/* are rewritten to this file (see vercel.json).
"""
import os
import re
import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean,
    ForeignKey, DateTime, text, func
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
import jwt
import bcrypt

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./local.db")
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
JWT_ALGO = "HS256"
JWT_EXPIRY_HOURS = 24

# Neon/Supabase give "postgres://" — SQLAlchemy needs "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(String, default="")
    price = Column(Float, nullable=False, default=0.0)
    image_url = Column(String, default="")
    quantity = Column(Integer, nullable=False, default=0)
    is_visible = Column(Boolean, default=True)   # admin toggles public visibility
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="products")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def stock_status(self):
        return "out_of_stock" if self.quantity <= 0 else "in_stock"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="employee")  # "admin" or "employee"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Enquiry(Base):
    __tablename__ = "enquiries"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    company = Column(String, nullable=True)
    phone = Column(String, nullable=False)
    message = Column(String, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product = relationship("Product")
    status = Column(String, nullable=False, default="new")  # "new", "in_progress", "responded", "closed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def create_token(username: str, role: str) -> str:
    payload = {
        "sub": username,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        username = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


def require_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privilege required for this action"
        )
    return user


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class LoginIn(BaseModel):
    username: str
    password: str


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    class Config:
        from_attributes = True


class CategoryIn(BaseModel):
    name: str


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    price: float
    image_url: str
    quantity: int
    is_visible: bool
    stock_status: str
    category: Optional[CategoryOut] = None
    class Config:
        from_attributes = True


class ProductIn(BaseModel):
    name: str
    description: str = ""
    price: float = Field(ge=0)
    image_url: str = ""
    quantity: int = Field(ge=0, default=0)
    is_visible: bool = True
    category_id: Optional[int] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    quantity: Optional[int] = None
    is_visible: Optional[bool] = None
    category_id: Optional[int] = None


class UserOut(BaseModel):
    id: int
    username: str
    role: str
    created_at: datetime.datetime
    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "employee"


class EnquiryIn(BaseModel):
    name: str
    email: str
    company: Optional[str] = ""
    phone: str
    message: str
    product_id: Optional[int] = None


class EnquiryOut(BaseModel):
    id: int
    name: str
    email: str
    company: Optional[str] = None
    phone: str
    message: str
    product_id: Optional[int] = None
    product: Optional[ProductOut] = None
    status: str
    created_at: datetime.datetime
    class Config:
        from_attributes = True


class EnquiryUpdate(BaseModel):
    status: str


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="IndiaForms Centre API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your Vercel frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# --- Auth ---
@app.post("/api/auth/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not bcrypt.checkpw(data.password.encode(), user.password_hash.encode()):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password")
    return {
        "access_token": create_token(user.username, user.role),
        "token_type": "bearer",
        "username": user.username,
        "role": user.role
    }


# --- Public: Categories ---
@app.get("/api/categories", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


# --- Public: Products (only visible ones) ---
@app.get("/api/products", response_model=List[ProductOut])
def list_products(category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Product).filter(Product.is_visible == True)  # noqa: E712
    if category:
        q = q.join(Category).filter(Category.slug == category)
    return q.order_by(Product.created_at.desc()).all()


@app.get("/api/products/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.slug == slug, Product.is_visible == True).first()  # noqa: E712
    if not p:
        raise HTTPException(404, "Product not found")
    return p


# --- Public: Enquiries ---
@app.post("/api/enquiries", response_model=EnquiryOut)
def create_enquiry(data: EnquiryIn, db: Session = Depends(get_db)):
    enquiry = Enquiry(
        name=data.name,
        email=data.email,
        company=data.company,
        phone=data.phone,
        message=data.message,
        product_id=data.product_id,
        status="new"
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry


# --- Private/Admin: Categories ---
@app.post("/api/admin/categories", response_model=CategoryOut)
def create_category(data: CategoryIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    cat = Category(name=data.name, slug=slugify(data.name))
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@app.get("/api/admin/categories", response_model=List[CategoryOut])
def admin_list_categories(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Category).all()


# --- Private/Admin: Products (full CRUD, sees everything incl. hidden) ---
@app.get("/api/admin/products", response_model=List[ProductOut])
def admin_list_products(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Product).order_by(Product.created_at.desc()).all()


@app.post("/api/admin/products", response_model=ProductOut)
def admin_create_product(data: ProductIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    slug = slugify(data.name)
    base_slug, i = slug, 1
    while db.query(Product).filter(Product.slug == slug).first():
        i += 1
        slug = f"{base_slug}-{i}"
    product = Product(**data.dict(), slug=slug)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@app.put("/api/admin/products/{product_id}", response_model=ProductOut)
def admin_update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@app.delete("/api/admin/products/{product_id}")
def admin_delete_product(product_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    # Delete is restricted to admin role
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    db.delete(product)
    db.commit()
    return {"deleted": True}


# --- Private/Admin: Enquiries Management ---
@app.get("/api/admin/enquiries", response_model=List[EnquiryOut])
def admin_list_enquiries(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Enquiry).order_by(Enquiry.created_at.desc()).all()


@app.put("/api/admin/enquiries/{enquiry_id}", response_model=EnquiryOut)
def admin_update_enquiry(enquiry_id: int, data: EnquiryUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(404, "Enquiry not found")
    enquiry.status = data.status
    db.commit()
    db.refresh(enquiry)
    return enquiry


# --- Private/Admin: User Management (Admin Only) ---
@app.get("/api/admin/users", response_model=List[UserOut])
def admin_list_users(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    return db.query(User).all()


@app.post("/api/admin/users", response_model=UserOut)
def admin_create_user(data: UserCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(400, "Username already exists")
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    user = User(username=data.username, password_hash=hashed, role=data.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    if current_user.id == user_id:
        raise HTTPException(400, "Cannot delete your own admin account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    db.delete(user)
    db.commit()
    return {"deleted": True}


# --- Private/Admin: Dashboard Analytics ---
@app.get("/api/admin/analytics")
def admin_get_analytics(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_enquiries = db.query(func.count(Enquiry.id)).scalar() or 0
    out_of_stock = db.query(func.count(Product.id)).filter(Product.quantity <= 0).scalar() or 0
    total_stock_qty = db.query(func.sum(Product.quantity)).scalar() or 0
    
    # Enquiries status breakdown
    statuses = db.query(Enquiry.status, func.count(Enquiry.id)).group_by(Enquiry.status).all()
    status_breakdown = {s[0]: s[1] for s in statuses}
    for default_status in ["new", "in_progress", "responded", "closed"]:
        if default_status not in status_breakdown:
            status_breakdown[default_status] = 0
            
    # Categories inventory value
    cats = db.query(Category.name, func.count(Product.id)).outerjoin(Product).group_by(Category.name).all()
    categories_breakdown = {c[0]: c[1] for c in cats if c[0] is not None}
    
    # Enquiries by date (last 7 days)
    today = datetime.datetime.utcnow().date()
    enquiries_trend = []
    for i in range(6, -1, -1):
        day = today - datetime.timedelta(days=i)
        day_start = datetime.datetime.combine(day, datetime.time.min)
        day_end = datetime.datetime.combine(day, datetime.time.max)
        count = db.query(func.count(Enquiry.id)).filter(
            Enquiry.created_at >= day_start,
            Enquiry.created_at <= day_end
        ).scalar() or 0
        enquiries_trend.append({
            "date": day.strftime("%b %d"),
            "count": count
        })
        
    return {
        "total_products": total_products,
        "total_enquiries": total_enquiries,
        "out_of_stock": out_of_stock,
        "total_stock_qty": int(total_stock_qty) if total_stock_qty else 0,
        "status_breakdown": status_breakdown,
        "categories_breakdown": categories_breakdown,
        "enquiries_trend": enquiries_trend
    }
