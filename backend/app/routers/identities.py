from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database import get_db
from app.models.user import User
from app.models.identity import Identity
from app.schemas.identity import IdentityCreate, IdentityUpdate, Identity as IdentitySchema
from app.auth import get_current_user

router = APIRouter(prefix="/identities", tags=["identities"])

@router.get("/", response_model=List[IdentitySchema])
def get_identities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all identities for the current user"""
    identities = db.query(Identity).filter(Identity.user_id == current_user.id).all()
    return identities

@router.post("/", response_model=IdentitySchema)
def create_identity(
    identity: IdentityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new identity"""
    db_identity = Identity(
        **identity.dict(),
        user_id=current_user.id
    )
    db.add(db_identity)
    db.commit()
    db.refresh(db_identity)
    return db_identity

@router.get("/{identity_id}", response_model=IdentitySchema)
def get_identity(
    identity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific identity"""
    identity = db.query(Identity).filter(
        and_(Identity.id == identity_id, Identity.user_id == current_user.id)
    ).first()
    
    if not identity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Identity not found"
        )
    return identity

@router.put("/{identity_id}", response_model=IdentitySchema)
def update_identity(
    identity_id: int,
    identity_update: IdentityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an identity"""
    identity = db.query(Identity).filter(
        and_(Identity.id == identity_id, Identity.user_id == current_user.id)
    ).first()
    
    if not identity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Identity not found"
        )
    
    update_data = identity_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(identity, field, value)
    
    db.commit()
    db.refresh(identity)
    return identity

@router.delete("/{identity_id}")
def delete_identity(
    identity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an identity"""
    identity = db.query(Identity).filter(
        and_(Identity.id == identity_id, Identity.user_id == current_user.id)
    ).first()
    
    if not identity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Identity not found"
        )
    
    db.delete(identity)
    db.commit()
    return {"message": "Identity deleted successfully"}
