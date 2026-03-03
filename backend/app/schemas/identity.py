from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class IdentityBase(BaseModel):
    name: str
    theme_color: Optional[str] = "#3b82f6"

class IdentityCreate(IdentityBase):
    pass

class IdentityUpdate(BaseModel):
    name: Optional[str] = None
    theme_color: Optional[str] = None

class Identity(IdentityBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
