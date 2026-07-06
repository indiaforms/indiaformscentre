"""
Run locally (not deployed) to create your first admin login and sample categories.

Usage:
    python api/seed.py
"""
import os
import sys
import bcrypt

sys.path.append(os.path.dirname(__file__))
from index import SessionLocal, AdminUser, Category, slugify  # noqa: E402

db = SessionLocal()

username = input("Admin username: ").strip()
password = input("Admin password: ").strip()

if db.query(AdminUser).filter(AdminUser.username == username).first():
    print("That admin username already exists.")
else:
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    db.add(AdminUser(username=username, password_hash=hashed))
    db.commit()
    print(f"Admin '{username}' created.")

default_categories = ["Lifestyle", "Travel", "Office Essentials", "Gadgets", "Eco Life"]
for name in default_categories:
    if not db.query(Category).filter(Category.name == name).first():
        db.add(Category(name=name, slug=slugify(name)))
db.commit()
print("Sample categories ensured:", default_categories)

db.close()
