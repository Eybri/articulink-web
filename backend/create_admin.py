# create_admin.py
from app.db import users_col
from app.utils import hash_password

email = "admin@gmail.com"
password = "Admin123!"  # change this
if users_col.find_one({"email": email}):
    print("Admin already exists")
else:
    users_col.insert_one({"email": email, "password": hash_password(password), "full_name": "ArticuLink Admin", "role": "admin"})
    print("Admin created:", email)
