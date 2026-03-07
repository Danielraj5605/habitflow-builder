from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
import os
import shutil
import uuid
from app.database import get_db
from app.schemas.user import UserCreate, User as UserSchema, UserUpdate
from app.models.user import User
from app.auth import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

UPLOAD_DIR = "uploads/profile_photos"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = user.password + "notreallyhashed" # Placeholder for actual hashing
    db_user = User(email=user.email, name=user.name, hashed_password=hashed_password, profile_photo_url=user.profile_photo_url)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile information"""
    # Update only the fields that are provided
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.profile_photo_url is not None:
        current_user.profile_photo_url = user_update.profile_photo_url

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/photo", response_model=UserSchema)
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and set profile photo for current user"""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    if not file_extension:
        file_extension = ".jpg" # Default extension

    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update user profile
    # The URL will be relative to the static files mount point
    photo_url = f"/uploads/profile_photos/{filename}"
    current_user.profile_photo_url = photo_url

    db.commit()
    db.refresh(current_user)
    return current_user