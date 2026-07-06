"""
Run locally (not deployed) to create your first admin login, employee login, and sample categories.

Usage:
    python api/seed.py
"""
import os
import sys
import bcrypt

sys.path.append(os.path.dirname(__file__))
from index import SessionLocal, User, Category, slugify  # noqa: E402

db = SessionLocal()

print("--- Corporate Gifting System Database Seeder ---")

# Seed admin
admin_username = input("Enter admin username [default: admin]: ").strip() or "admin"
admin_password = input("Enter admin password [default: admin123]: ").strip() or "admin123"

if db.query(User).filter(User.username == admin_username).first():
    print(f"User '{admin_username}' already exists.")
else:
    hashed = bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode()
    db.add(User(username=admin_username, password_hash=hashed, role="admin"))
    db.commit()
    print(f"Admin '{admin_username}' created successfully.")

# Seed employee
emp_username = input("Enter employee username [default: employee]: ").strip() or "employee"
emp_password = input("Enter employee password [default: employee123]: ").strip() or "employee123"

if db.query(User).filter(User.username == emp_username).first():
    print(f"User '{emp_username}' already exists.")
else:
    hashed = bcrypt.hashpw(emp_password.encode(), bcrypt.gensalt()).decode()
    db.add(User(username=emp_username, password_hash=hashed, role="employee"))
    db.commit()
    print(f"Employee '{emp_username}' created successfully.")

# Seed categories
default_categories = ["Lifestyle", "Travel", "Office Essentials", "Gadgets", "Eco Life", "Drinkware"]
for name in default_categories:
    if not db.query(Category).filter(Category.name == name).first():
        db.add(Category(name=name, slug=slugify(name)))
db.commit()
print("Sample categories ensured:", default_categories)

db.close()
print("Database seeding completed.")
