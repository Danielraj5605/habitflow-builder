from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Identity(Base):
    __tablename__ = "identities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False) # e.g. "Athlete", "Creator"
    theme_color = Column(String(50), default="#3b82f6") # Hex color or tailwind class
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="identities")
    habits = relationship("Habit", back_populates="identity", cascade="all, delete-orphan")
