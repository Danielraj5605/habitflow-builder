from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class HabitBase(BaseModel):
    name: str
    description: Optional[str] = None
    frequency: str = "daily"
    weekly_goal: int = 7
    is_active: bool = True
    tags: List[str] = []
    icon: str = "🎯"

class HabitCreate(HabitBase):
    pass

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None
    weekly_goal: Optional[int] = None
    is_active: Optional[bool] = None
    tags: Optional[List[str]] = None
    icon: Optional[str] = None
    currentWeek: Optional[List[bool]] = None
    streak: Optional[int] = None

class Habit(HabitBase):
    id: int
    user_id: int
    streak: int
    currentWeek: List[bool] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class HabitLogBase(BaseModel):
    habit_id: int
    completed_date: datetime
    notes: Optional[str] = None

class HabitLogCreate(HabitLogBase):
    pass

class HabitLog(HabitLogBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
