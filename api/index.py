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
    image_url = Column(String, default="")
    subcategories = Column(String, default="")
    is_featured = Column(Boolean, default=True)
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(String, default="")
    price = Column(Float, nullable=False, default=0.0)
    cost = Column(Float, nullable=False, default=0.0)
    image_url = Column(String, default="")
    quantity = Column(Integer, nullable=False, default=0)
    is_visible = Column(Boolean, default=True)   # admin toggles public visibility
    subcategory = Column(String, default="")
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="products")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Setting(Base):
    __tablename__ = "settings"
    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)


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


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    company = Column(String, nullable=True)
    phone = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


Base.metadata.create_all(bind=engine)


def run_migrations_and_seed():
    db = SessionLocal()
    try:
        # Check categories table columns
        cols = [r[1] for r in db.execute(text("PRAGMA table_info(categories)")).fetchall()]
        if "image_url" not in cols:
            db.execute(text("ALTER TABLE categories ADD COLUMN image_url VARCHAR DEFAULT ''"))
        if "subcategories" not in cols:
            db.execute(text("ALTER TABLE categories ADD COLUMN subcategories VARCHAR DEFAULT ''"))
        if "is_featured" not in cols:
            db.execute(text("ALTER TABLE categories ADD COLUMN is_featured BOOLEAN DEFAULT 1"))

        # Check products table columns
        prod_cols = [r[1] for r in db.execute(text("PRAGMA table_info(products)")).fetchall()]
        if "subcategory" not in prod_cols:
            db.execute(text("ALTER TABLE products ADD COLUMN subcategory VARCHAR DEFAULT ''"))
        if "cost" not in prod_cols:
            db.execute(text("ALTER TABLE products ADD COLUMN cost FLOAT DEFAULT 0.0"))


        # Seed default settings
        if not db.query(Setting).filter(Setting.key == "catalogue_url").first():
            db.add(Setting(key="catalogue_url", value="/catalogue.pdf"))
        
        # Seed default category images if empty
        cats = db.query(Category).all()
        # Default placeholder/premium images for seeded categories:
        default_images = {
            "lifestyle": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
            "travel": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
            "office-essentials": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
            "gadgets": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
            "eco-life": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
        }
        for c in cats:
            if not c.image_url and c.slug in default_images:
                c.image_url = default_images[c.slug]
            # Default subcategories if empty
            if not c.subcategories:
                if c.slug == "lifestyle":
                    c.subcategories = "Drinkware, Games, Health & Fitness, Home & Living, Lamps & Lights, Work From Home, Others"
                elif c.slug == "travel":
                    c.subcategories = "Bag Zone, Leisure & Outdoors, Travel Essentials, Others"
                elif c.slug == "office-essentials":
                    c.subcategories = "Bags, Desktop Utilities, Gift Sets, Promotional Items, Stationery, Other"
                elif c.slug == "gadgets":
                    c.subcategories = "Computer Accessories, Desk Gadgets, Mobile Accessories, Music Players, Tech Accessories, Others"
        
        db.commit()
    except Exception as e:
        print("Migration and seed error:", e)
    finally:
        db.close()

run_migrations_and_seed()



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
    image_url: Optional[str] = ""
    subcategories: Optional[str] = ""
    is_featured: Optional[bool] = True
    class Config:
        from_attributes = True


class CategoryIn(BaseModel):
    name: str
    image_url: Optional[str] = ""
    subcategories: Optional[str] = ""
    is_featured: Optional[bool] = True


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    image_url: Optional[str] = None
    subcategories: Optional[str] = None
    is_featured: Optional[bool] = None


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    price: float
    image_url: str
    quantity: int
    is_visible: bool
    subcategory: Optional[str] = ""
    stock_status: str
    category: Optional[CategoryOut] = None
    class Config:
        from_attributes = True


class ProductAdminOut(ProductOut):
    cost: float


class ProductIn(BaseModel):
    name: str
    description: str = ""
    price: float = Field(ge=0)
    cost: float = Field(ge=0, default=0.0)
    image_url: str = ""
    quantity: int = Field(ge=0, default=0)
    is_visible: bool = True
    subcategory: Optional[str] = ""
    category_id: Optional[int] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    image_url: Optional[str] = None
    quantity: Optional[int] = None
    is_visible: Optional[bool] = None
    subcategory: Optional[str] = None
    category_id: Optional[int] = None



class SettingOut(BaseModel):
    key: str
    value: str
    class Config:
        from_attributes = True


class SettingUpdate(BaseModel):
    value: str


class SettingsUpdatePayload(BaseModel):
    settings: Dict[str, str]



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


class ClientOut(BaseModel):
    id: int
    name: str
    email: str
    company: Optional[str] = None
    phone: str
    created_at: datetime.datetime
    class Config:
        from_attributes = True


class EnquiryAdminCreate(BaseModel):
    name: str
    email: str
    company: Optional[str] = ""
    phone: str
    message: str
    product_id: Optional[int] = None
    status: Optional[str] = "new"


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


# --- PDF Catalogue Generator with Watermark ---

def create_placeholder_image(width, height):
    from reportlab.platypus import Table, TableStyle, Paragraph
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    styles = getSampleStyleSheet()
    style = ParagraphStyle(
        'PlaceholderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        textColor=colors.HexColor("#94a3b8"),
        alignment=1 # Centered
    )
    cell = [[Paragraph("NO IMAGE", style)]]
    t = Table(cell, colWidths=[width], rowHeights=[height])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
    ]))
    return t


def get_pdf_image(url, width, height):
    import io
    import requests
    from reportlab.platypus import Image as RLImage
    if not url:
        return create_placeholder_image(width, height)
    try:
        resp = requests.get(url, timeout=2.0)
        if resp.status_code == 200:
            img_data = io.BytesIO(resp.content)
            return RLImage(img_data, width=width, height=height)
    except Exception:
        pass
    return create_placeholder_image(width, height)


def create_product_card(product, styles):
    from reportlab.platypus import Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib import colors
    
    img_flowable = get_pdf_image(product.image_url, 140, 110)
    
    title_style = ParagraphStyle(
        'CardTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#1e293b"),
        alignment=1
    )
    
    price_style = ParagraphStyle(
        'CardPrice',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1d4ed8"),
        alignment=1
    )
    
    name_para = Paragraph(product.name, title_style)
    price_para = Paragraph(f"MRP: Rs. {int(product.price):,}", price_style)
    
    card_data = [
        [img_flowable],
        [Spacer(1, 4)],
        [name_para],
        [Spacer(1, 2)],
        [price_para]
    ]
    
    card_table = Table(card_data, colWidths=[156], rowHeights=[110, 4, 22, 2, 14])
    card_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    return card_table


def make_watermark_canvas_class(logo_path=None):
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    
    class WatermarkCanvas(canvas.Canvas):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.pages = []
            
        def showPage(self):
            self.pages.append(dict(self.__dict__))
            self._startPage()
            
        def save(self):
            page_count = len(self.pages)
            for page in self.pages:
                self.__dict__.update(page)
                self.draw_page_decorations(page_count)
                super().showPage()
            super().save()
            
        def draw_page_decorations(self, page_count):
            self.saveState()
            
            # Watermark (large transparent logo)
            if logo_path and os.path.exists(logo_path):
                width = 300
                height = 300
                x = (595.27 - width) / 2
                y = (841.89 - height) / 2
                self.setFillAlpha(0.06)
                self.setStrokeAlpha(0.06)
                try:
                    self.drawImage(logo_path, x, y, width=width, height=height, mask='auto')
                except Exception:
                    pass
                    
            # Normal decorations (opaque)
            self.setFillAlpha(1.0)
            self.setStrokeAlpha(1.0)
            
            # Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#475569"))
            self.drawString(36, 810, "INDIA FORMS CENTRE")
            self.drawRightString(559.27, 810, "OFFICIAL CORPORATE CATALOGUE")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(36, 804, 559.27, 804)
            
            # Footer
            self.line(36, 44, 559.27, 44)
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawString(36, 32, "Confidential - Shared For Review")
            self.drawRightString(559.27, 32, f"Page {self._pageNumber} of {page_count}")
            
            self.restoreState()
            
    return WatermarkCanvas


@app.get("/api/products/catalogue/pdf")
def download_catalogue_pdf(
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = None,
    db: Session = Depends(get_db)
):
    import io
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from sqlalchemy import or_
    from fastapi.responses import StreamingResponse
    
    # Query visible products
    q = db.query(Product).filter(Product.is_visible == True)  # noqa: E712
    if category:
        q = q.join(Category).filter(Category.slug == category)
    if subcategory:
        q = q.filter(Product.subcategory == subcategory)
    if search:
        search_like = f"%{search}%"
        q = q.filter(or_(Product.name.like(search_like), Product.description.like(search_like)))
    if min_price is not None:
        q = q.filter(Product.price >= min_price)
    if max_price is not None:
        q = q.filter(Product.price <= max_price)
        
    products = q.all()
    
    # Apply sorting
    if sort == "price_asc":
        products = sorted(products, key=lambda x: x.price)
    elif sort == "price_desc":
        products = sorted(products, key=lambda x: x.price, reverse=True)
    elif sort == "name_asc":
        products = sorted(products, key=lambda x: x.name.lower())
    elif sort == "name_desc":
        products = sorted(products, key=lambda x: x.name.lower(), reverse=True)
    else:
        products = sorted(products, key=lambda x: x.created_at, reverse=True)
        
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CatalogMainTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        alignment=1,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'CatalogSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#64748b"),
        alignment=1,
        spaceAfter=15
    )
    
    filter_style = ParagraphStyle(
        'CatalogFilters',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0d9488"),
        alignment=1,
        spaceAfter=15
    )
    
    category_title_style = ParagraphStyle(
        'CategoryTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    
    story = []
    story.append(Spacer(1, 8))
    story.append(Paragraph("INDIA FORMS CENTRE", title_style))
    story.append(Paragraph("Premium Corporate Gifting & Customized Merchandise Collection", subtitle_style))
    
    is_filtered = any([category, subcategory, search, min_price, max_price, sort])
    
    if is_filtered:
        filter_labels = []
        if category:
            cat_obj = db.query(Category).filter(Category.slug == category).first()
            filter_labels.append(f"Category: {cat_obj.name if cat_obj else category}")
        if subcategory:
            filter_labels.append(f"Subcategory: {subcategory}")
        if search:
            filter_labels.append(f"Search: \"{search}\"")
        if min_price is not None or max_price is not None:
            min_val = int(min_price) if min_price is not None else 0
            max_val = int(max_price) if max_price is not None else "Max"
            filter_labels.append(f"Price: Rs. {min_val} - {max_val}")
        if sort:
            filter_labels.append(f"Sorted By: {sort.replace('_', ' ').title()}")
            
        filters_str = " | ".join(filter_labels)
        story.append(Paragraph(f"Active Catalogue Filters: {filters_str}", filter_style))
        
        if not products:
            no_products_style = ParagraphStyle('NoProducts', parent=styles['Normal'], fontSize=9.5, textColor=colors.HexColor("#94a3b8"), alignment=1)
            story.append(Spacer(1, 40))
            story.append(Paragraph("No products match the selected filters.", no_products_style))
        else:
            grid_data = []
            for i in range(0, len(products), 3):
                chunk = products[i:i+3]
                row_cells = []
                for p in chunk:
                    row_cells.append(create_product_card(p, styles))
                while len(row_cells) < 3:
                    row_cells.append("")
                grid_data.append([row_cells[0], "", row_cells[1], "", row_cells[2]])
                
            grid_table = Table(grid_data, colWidths=[156, 18, 156, 18, 156])
            grid_table.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 16),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ]))
            story.append(grid_table)
    else:
        categories_list = db.query(Category).all()
        has_any_products = False
        
        for cat in categories_list:
            cat_products = [p for p in products if p.category_id == cat.id]
            if not cat_products:
                continue
            has_any_products = True
            
            story.append(Paragraph(cat.name.upper(), category_title_style))
            story.append(Table([[""]], colWidths=[522], rowHeights=[1.5], style=TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#1d4ed8")),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
            ])))
            story.append(Spacer(1, 10))
            
            grid_data = []
            for i in range(0, len(cat_products), 3):
                chunk = cat_products[i:i+3]
                row_cells = []
                for p in chunk:
                    row_cells.append(create_product_card(p, styles))
                while len(row_cells) < 3:
                    row_cells.append("")
                grid_data.append([row_cells[0], "", row_cells[1], "", row_cells[2]])
                
            grid_table = Table(grid_data, colWidths=[156, 18, 156, 18, 156])
            grid_table.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 16),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ]))
            story.append(KeepTogether([grid_table]))
            story.append(Spacer(1, 12))
            
        if not has_any_products:
            no_products_style = ParagraphStyle('NoProducts', parent=styles['Normal'], fontSize=9.5, textColor=colors.HexColor("#94a3b8"), alignment=1)
            story.append(Spacer(1, 40))
            story.append(Paragraph("No products available in the catalogue.", no_products_style))
            
    logo_path = "public/logo.jpg"
    WatermarkCanvas = make_watermark_canvas_class(logo_path)
    doc.build(story, canvasmaker=WatermarkCanvas)
    
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=indiaforms_catalogue.pdf"}
    )



def upsert_client(name: str, email: str, company: Optional[str], phone: str, db: Session):
    client = db.query(Client).filter(Client.email == email).first()
    if client:
        client.name = name
        client.company = company
        client.phone = phone
    else:
        client = Client(name=name, email=email, company=company, phone=phone)
        db.add(client)
    db.commit()
    return client


# --- Public: Enquiries ---
@app.post("/api/enquiries", response_model=EnquiryOut)
def create_enquiry(data: EnquiryIn, db: Session = Depends(get_db)):
    upsert_client(data.name, data.email, data.company, data.phone, db)
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


# --- Public: Settings ---
@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(Setting).all()
    return {s.key: s.value for s in settings}


# --- Private/Admin: Settings ---
@app.post("/api/admin/settings")
def update_settings(payload: SettingsUpdatePayload, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    for key, val in payload.settings.items():
        setting = db.query(Setting).filter(Setting.key == key).first()
        if setting:
            setting.value = val
        else:
            setting = Setting(key=key, value=val)
            db.add(setting)
    db.commit()
    return {"success": True}


# --- Private/Admin: Categories ---
@app.post("/api/admin/categories", response_model=CategoryOut)
def create_category(data: CategoryIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    cat = Category(
        name=data.name,
        slug=slugify(data.name),
        image_url=data.image_url or "",
        subcategories=data.subcategories or "",
        is_featured=data.is_featured if data.is_featured is not None else True
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@app.get("/api/admin/categories", response_model=List[CategoryOut])
def admin_list_categories(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Category).all()


@app.put("/api/admin/categories/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, data: CategoryUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
    if data.name is not None:
        cat.name = data.name
        cat.slug = slugify(data.name)
    if data.image_url is not None:
        cat.image_url = data.image_url
    if data.subcategories is not None:
        cat.subcategories = data.subcategories
    if data.is_featured is not None:
        cat.is_featured = data.is_featured
    db.commit()
    db.refresh(cat)
    return cat


@app.delete("/api/admin/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
    db.delete(cat)
    db.commit()
    return {"deleted": True}



# --- Private/Admin: Products (full CRUD, sees everything incl. hidden) ---
@app.get("/api/admin/products", response_model=List[ProductAdminOut])
def admin_list_products(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Product).order_by(Product.created_at.desc()).all()


@app.post("/api/admin/products", response_model=ProductAdminOut)
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


@app.put("/api/admin/products/{product_id}", response_model=ProductAdminOut)
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


@app.get("/api/admin/clients", response_model=List[ClientOut])
def admin_list_clients(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Client).order_by(Client.name.asc()).all()


@app.post("/api/admin/enquiries", response_model=EnquiryOut)
def admin_create_enquiry(data: EnquiryAdminCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    upsert_client(data.name, data.email, data.company, data.phone, db)
    enquiry = Enquiry(
        name=data.name,
        email=data.email,
        company=data.company,
        phone=data.phone,
        message=data.message,
        product_id=data.product_id,
        status=data.status or "new"
    )
    db.add(enquiry)
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
