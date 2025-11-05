from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Habit(Base):
    __tablename__ = "habits"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    frequency = Column(String(50), default="daily")  # daily, weekly, custom
    weekly_goal = Column(Integer, default=7)
    is_active = Column(Boolean, default=True)
    tags = Column(JSON, default=list)  # Store as JSON array
    icon = Column(String(50), default="🎯")
    currentWeek = Column(JSON, default=lambda: [False] * 7) # Store as JSON array of booleans
    streak = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="habits")
    habit_logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")
    habit_summaries = relationship("HabitSummary", back_populates="habit", cascade="all, delete-orphan")

class HabitLog(Base):
    __tablename__ = "habit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    completed_date = Column(DateTime, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="habit_logs")
    habit = relationship("Habit", back_populates="habit_logs")
