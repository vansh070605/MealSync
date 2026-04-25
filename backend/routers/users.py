"""
routers/users.py — User CRUD endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserOut, UserUpdate
import json

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    result = []
    for u in users:
        out = UserOut(
            id=u.id,
            name=u.name,
            avatar=u.avatar,
            likes=u.likes,
            dislikes=u.dislikes,
            spice_tolerance=u.spice_tolerance,
            effort_tolerance=u.effort_tolerance,
            created_at=u.created_at,
        )
        result.append(out)
    return result


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(
        id=user.id,
        name=user.name,
        avatar=user.avatar,
        likes=user.likes,
        dislikes=user.dislikes,
        spice_tolerance=user.spice_tolerance,
        effort_tolerance=user.effort_tolerance,
        created_at=user.created_at,
    )


@router.post("/", response_model=UserOut, status_code=201)
def create_user(body: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.name == body.name).first():
        raise HTTPException(status_code=409, detail="User already exists")
    user = User(
        name=body.name,
        avatar=body.avatar,
        spice_tolerance=body.spice_tolerance,
        effort_tolerance=body.effort_tolerance,
    )
    user.likes = body.likes
    user.dislikes = body.dislikes
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut(
        id=user.id,
        name=user.name,
        avatar=user.avatar,
        likes=user.likes,
        dislikes=user.dislikes,
        spice_tolerance=user.spice_tolerance,
        effort_tolerance=user.effort_tolerance,
        created_at=user.created_at,
    )


@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: int, body: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.avatar is not None:
        user.avatar = body.avatar
    if body.likes is not None:
        user.likes = body.likes
    if body.dislikes is not None:
        user.dislikes = body.dislikes
    if body.spice_tolerance is not None:
        user.spice_tolerance = body.spice_tolerance
    if body.effort_tolerance is not None:
        user.effort_tolerance = body.effort_tolerance
    db.commit()
    db.refresh(user)
    return UserOut(
        id=user.id,
        name=user.name,
        avatar=user.avatar,
        likes=user.likes,
        dislikes=user.dislikes,
        spice_tolerance=user.spice_tolerance,
        effort_tolerance=user.effort_tolerance,
        created_at=user.created_at,
    )
