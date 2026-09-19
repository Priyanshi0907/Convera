from __future__ import annotations

import datetime
import hashlib
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import User, get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


def hash_password(password: str) -> str:
    salt = secrets.token_hex(8)
    h = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"{salt}${h}"


def verify_password(plain: str, hashed: str) -> bool:
    try:
        salt, h = hashed.split("$", 1)
        test_h = hashlib.sha256((salt + plain).encode("utf-8")).hexdigest()
        return secrets.compare_digest(h, test_h)
    except Exception:
        return False


def make_token(user_id: int) -> str:
    raw = f"{user_id}:{secrets.token_hex(16)}:{datetime.datetime.utcnow().timestamp()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest() + f"-{user_id}"


def get_user_id_from_token(token: Optional[str]) -> Optional[int]:
    if not token or "-" not in token:
        return None
    try:
        parts = token.split("-")
        return int(parts[-1])
    except Exception:
        return None


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = "User"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: str


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = make_token(user.id)
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name or user.email.split("@")[0],
            created_at=user.created_at.isoformat(),
        ),
    )


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if len(payload.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long.")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    new_user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip() if payload.full_name else email.split("@")[0].capitalize(),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = make_token(new_user.id)
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            full_name=new_user.full_name,
            created_at=new_user.created_at.isoformat(),
        ),
    )


@router.get("/me", response_model=UserResponse)
def get_me(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    token = None
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
    user_id = get_user_id_from_token(token)
    if not user_id:
        user = db.query(User).first()
    else:
        user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated.")

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name or user.email.split("@")[0],
        created_at=user.created_at.isoformat(),
    )


@router.post("/logout")
def logout():
    return {"ok": True}


class UpdateProfileRequest(BaseModel):
    full_name: str
    email: Optional[str] = None


@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: UpdateProfileRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    token = authorization.replace("Bearer ", "").strip() if authorization else None
    user_id = get_user_id_from_token(token)
    user = db.query(User).filter(User.id == user_id).first() if user_id else db.query(User).first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated.")

    if payload.email and payload.email.strip():
        new_email = payload.email.strip().lower()
        if new_email != user.email:
            existing = db.query(User).filter(User.email == new_email).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email is already in use by another account.")
            user.email = new_email

    if payload.full_name and payload.full_name.strip():
        user.full_name = payload.full_name.strip()

    db.commit()
    db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name or user.email.split("@")[0],
        created_at=user.created_at.isoformat(),
    )


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.put("/password")
def change_password(
    payload: ChangePasswordRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    token = authorization.replace("Bearer ", "").strip() if authorization else None
    user_id = get_user_id_from_token(token)
    user = db.query(User).filter(User.id == user_id).first() if user_id else db.query(User).first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated.")

    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password does not match.")

    if len(payload.new_password) < 4:
        raise HTTPException(status_code=400, detail="New password must be at least 4 characters long.")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"ok": True, "message": "Password updated successfully."}


@router.delete("/account")
def delete_account(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    token = authorization.replace("Bearer ", "").strip() if authorization else None
    user_id = get_user_id_from_token(token)
    user = db.query(User).filter(User.id == user_id).first() if user_id else db.query(User).first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated.")

    db.delete(user)
    db.commit()
    return {"ok": True, "message": "Account deleted successfully."}

