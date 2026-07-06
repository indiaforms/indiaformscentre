"""
IndiaForms Centre - Backend API
Single FastAPI app deployed as one Vercel Python serverless function.
All requests to /api/* are rewritten to this file (see vercel.json).
"""
import os
import re
import datetime
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean,
    ForeignKey, DateTime, text
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
JWT_EXPIRY_HOURS = 12

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
    price = Column(Float, nullable=False, default=0)
    image_url = Column(String, default="")
    quantity = Column(Integer, nullable=False, default=0)
    is_visible = Column(Boolean, default=True)   # admin toggles public visibility
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="products")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def stock_status(self):
        return "out_of_stock" if self.quantity <= 0 else "in_stock"


class AdminUser(Base):
    __tablename__ = "admin_users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)


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


def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        username = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    admin = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not admin:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Admin not found")
    return admin


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
    admin = db.query(AdminUser).filter(AdminUser.username == data.username).first()
    if not admin or not bcrypt.checkpw(data.password.encode(), admin.password_hash.encode()):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password")
    return {"access_token": create_token(admin.username), "token_type": "bearer"}


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


# --- Admin: Categories ---
@app.post("/api/admin/categories", response_model=CategoryOut)
def create_category(data: CategoryIn, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    cat = Category(name=data.name, slug=slugify(data.name))
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@app.get("/api/admin/categories", response_model=List[CategoryOut])
def admin_list_categories(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(Category).all()


# --- Admin: Products (full CRUD, sees everything incl. hidden) ---
@app.get("/api/admin/products", response_model=List[ProductOut])
def admin_list_products(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(Product).order_by(Product.created_at.desc()).all()


@app.post("/api/admin/products", response_model=ProductOut)
def create_product(data: ProductIn, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
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
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(product, field, value)
    # quantity of 0 automatically shows as "out_of_stock" via stock_status property
    db.commit()
    db.refresh(product)
    return product


@app.delete("/api/admin/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    db.delete(product)
    db.commit()
    return {"deleted": True}
