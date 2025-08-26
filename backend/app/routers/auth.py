# app/routers/auth.py
from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi import status
from app.db import users_col
from app.schemas import UserCreate, Token
from app.utils import hash_password, verify_password
from app.security import create_access_token, create_refresh_token, decode_token
from bson.objectid import ObjectId

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate):
    if users_col.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(payload.password)
    doc = {"email": payload.email, "password": hashed, "full_name": payload.full_name, "role": "admin"}
    res = users_col.insert_one(doc)
    return {"id": str(res.inserted_id), "email": payload.email}

@router.post("/login", response_model=Token)
def login(payload: UserCreate):
    user = users_col.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    data = {"user_id": str(user["_id"]), "email": user["email"], "role": user.get("role", "admin")}
    access = create_access_token(data)
    refresh = create_refresh_token(data)
    # store refresh token (optional)
    users_col.update_one({"_id": user["_id"]}, {"$set": {"refresh_token": refresh}})
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}

@router.get("/me")
def me(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        scheme, token = authorization.split()
        payload = decode_token(token)
        user_id = payload.get("user_id")
        user = users_col.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {"id": str(user["_id"]), "email": user["email"], "full_name": user.get("full_name")}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
