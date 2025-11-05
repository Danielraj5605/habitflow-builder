from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

class HabitSummaryBase(BaseModel):
    habit_id: int
    summary_date: date
    completion_rate: float
    current_streak: int
    longest_streak: int
    total_completions: int

class HabitSummaryCreate(HabitSummaryBase):
    pass

class HabitSummarySchema(HabitSummaryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True