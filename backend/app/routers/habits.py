from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.habit import Habit, HabitLog
from app.models.habit_summary import HabitSummary
from app.schemas.habit import HabitCreate, HabitUpdate, Habit as HabitSchema, HabitLogCreate, HabitLog as HabitLogSchema
from app.auth import get_current_user

router = APIRouter(prefix="/habits", tags=["habits"])

@router.get("/", response_model=List[HabitSchema])
def get_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all habits for the current user"""
    habits = db.query(Habit).filter(
        and_(Habit.user_id == current_user.id, Habit.is_active == True)
    ).order_by(Habit.created_at.desc()).all()
    
    # Calculate current week data and streaks for each habit
    today = datetime.now().date()
    # Find Monday of current week
    days_since_monday = today.weekday()  # Monday = 0
    monday = today - timedelta(days=days_since_monday)
    
    for habit in habits:
        # Calculate current week completion
        current_week = [False] * 7  # Monday to Sunday
        
        for i in range(7):
            check_date = monday + timedelta(days=i)
            if check_date <= today:  # Don't check future dates
                log_exists = db.query(HabitLog).filter(
                    HabitLog.habit_id == habit.id,
                    HabitLog.user_id == current_user.id,
                    func.date(HabitLog.completed_date) == check_date
                ).first()
                
                current_week[i] = log_exists is not None
        
        # Update habit's currentWeek field
        habit.currentWeek = current_week
        
        # Calculate and update streak
        calculated_streak = calculate_habit_streak(db, habit.id, current_user.id)
        habit.streak = calculated_streak
        
        # Update the database with new values
        db.query(Habit).filter(Habit.id == habit.id).update({
            "streak": calculated_streak,
            "currentWeek": current_week
        })
    
    db.commit()
    return habits

@router.post("/", response_model=HabitSchema)
def create_habit(
    habit: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new habit"""
    db_habit = Habit(
        **habit.dict(),
        user_id=current_user.id
    )
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    
    return db_habit

@router.get("/{habit_id}", response_model=HabitSchema)
def get_habit(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific habit"""
    habit = db.query(Habit).filter(
        and_(Habit.id == habit_id, Habit.user_id == current_user.id)
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    # Calculate streak
    habit.streak = calculate_habit_streak(db, habit.id, current_user.id)
    
    return habit

@router.put("/{habit_id}", response_model=HabitSchema)
def update_habit(
    habit_id: int,
    habit_update: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a habit"""
    habit = db.query(Habit).filter(
        and_(Habit.id == habit_id, Habit.user_id == current_user.id)
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    # Update only provided fields
    update_data = habit_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(habit, field, value)
    
    db.commit()
    db.refresh(habit)
    
    return habit

@router.delete("/{habit_id}")
def delete_habit(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a habit (soft delete by setting is_active to False)"""
    habit = db.query(Habit).filter(
        and_(Habit.id == habit_id, Habit.user_id == current_user.id)
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    habit.is_active = False
    db.commit()
    
    return {"message": "Habit deleted successfully"}

@router.post("/{habit_id}/logs", response_model=HabitLogSchema)
def log_habit_completion(
    habit_id: int,
    habit_log: HabitLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log a habit completion or update existing log"""
    # Verify habit belongs to user
    habit = db.query(Habit).filter(
        and_(Habit.id == habit_id, Habit.user_id == current_user.id)
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    # Check if already logged for this date
    existing_log = db.query(HabitLog).filter(
        and_(
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == current_user.id,
            func.date(HabitLog.completed_date) == func.date(habit_log.completed_date)
        )
    ).first()
    
    if existing_log:
        # Update existing log instead of raising error
        if habit_log.notes:
            existing_log.notes = habit_log.notes
        db.commit()
        db.refresh(existing_log)
        update_habit_summary(db, current_user.id, habit_id, habit_log.completed_date.date())
        return existing_log
    
    # Create new log
    db_log = HabitLog(
        **habit_log.dict(),
        user_id=current_user.id
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    update_habit_summary(db, current_user.id, habit_id, habit_log.completed_date.date())
    return db_log

def update_habit_summary(db: Session, user_id: int, habit_id: int, summary_date: datetime.date):
    # Get all logs for the habit
    all_logs = db.query(HabitLog).filter(
        and_(
            HabitLog.user_id == user_id,
            HabitLog.habit_id == habit_id
        )
    ).order_by(HabitLog.completed_date).all()

    if not all_logs:
        # No logs, so no summary
        return

    # Calculate total completions
    total_completions = len(all_logs)

    # Calculate current streak and longest streak
    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    
    # Sort logs by date to calculate streaks correctly
    sorted_logs = sorted(all_logs, key=lambda log: log.completed_date.date())
    
    # Convert logs to a set of dates for efficient lookup
    logged_dates = {log.completed_date.date() for log in sorted_logs}

    # Calculate current streak
    today = datetime.now().date()
    date_to_check = today
    while date_to_check in logged_dates:
        current_streak += 1
        date_to_check -= timedelta(days=1)

    # Calculate longest streak
    if sorted_logs:
        first_log_date = sorted_logs[0].completed_date.date()
        last_log_date = sorted_logs[-1].completed_date.date()
        
        date_range = [first_log_date + timedelta(days=i) for i in range((last_log_date - first_log_date).days + 1)]
        
        for date in date_range:
            if date in logged_dates:
                temp_streak += 1
            else:
                longest_streak = max(longest_streak, temp_streak)
                temp_streak = 0
        longest_streak = max(longest_streak, temp_streak) # Check for streak at the end

    # Calculate completion rate (simple average for now, can be refined)
    # For a more accurate completion rate, we'd need to know the habit's frequency
    # For now, let's assume it's based on total logs vs. days since habit creation
    # This needs to be refined based on habit frequency (e.g., daily, weekly, specific days)
    # For simplicity, let's calculate based on logs in the last 30 days or since habit creation
    
    # For now, let's calculate completion rate based on the number of logs vs. the number of days the habit has been active
    # This is a placeholder and needs to be improved with habit frequency logic
    
    # Get habit creation date
    habit_obj = db.query(Habit).filter(Habit.id == habit_id).first()
    if habit_obj:
        habit_creation_date = habit_obj.created_at.date()
        days_active = (summary_date - habit_creation_date).days + 1
        if days_active > 0:
            completion_rate = (total_completions / days_active) * 100
        else:
            completion_rate = 0
    else:
        completion_rate = 0 # Should not happen if habit_id is valid

    # Check if a summary for this date and habit already exists
    existing_summary = db.query(HabitSummary).filter(
        and_(
            HabitSummary.user_id == user_id,
            HabitSummary.habit_id == habit_id,
            HabitSummary.summary_date == summary_date
        )
    ).first()

    if existing_summary:
        # Update existing summary
        existing_summary.completion_rate = completion_rate
        existing_summary.current_streak = current_streak
        existing_summary.longest_streak = longest_streak
        existing_summary.total_completions = total_completions
    else:
        # Create new summary
        new_summary = HabitSummary(
            user_id=user_id,
            habit_id=habit_id,
            summary_date=summary_date,
            completion_rate=completion_rate,
            current_streak=current_streak,
            longest_streak=longest_streak,
            total_completions=total_completions
        )
        db.add(new_summary)
    db.commit()

@router.get("/{habit_id}/logs", response_model=List[HabitLogSchema])
def get_habit_logs(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all logs for a specific habit"""
    # Verify habit belongs to user
    habit = db.query(Habit).filter(
        and_(Habit.id == habit_id, Habit.user_id == current_user.id)
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    logs = db.query(HabitLog).filter(
        and_(HabitLog.habit_id == habit_id, HabitLog.user_id == current_user.id)
    ).order_by(HabitLog.completed_date.desc()).all()
    
    return logs


@router.delete("/{habit_id}/logs/{log_id}")
def delete_habit_log(
    habit_id: int,
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific habit log by ID"""
    # Verify habit belongs to user
    habit = db.query(Habit).filter(
        and_(Habit.id == habit_id, Habit.user_id == current_user.id)
    ).first()

    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )

    # Verify log belongs to user and habit
    log = db.query(HabitLog).filter(
        and_(
            HabitLog.id == log_id,
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == current_user.id
        )
    ).first()

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit log not found"
        )

    log_date = log.completed_date.date()
    db.delete(log)
    db.commit()

    # Update habit summary after log deletion
    update_habit_summary(db, current_user.id, habit_id, log_date)

    return {"message": "Habit log deleted successfully"}

@router.delete("/{habit_id}/logs/by-date")
def delete_habit_log_by_date(
    habit_id: int,
    completed_date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a habit log by date (for toggle functionality)"""
    # Verify habit belongs to user
    habit = db.query(Habit).filter(
        and_(Habit.id == habit_id, Habit.user_id == current_user.id)
    ).first()

    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )

    # Parse the date
    try:
        log_date = datetime.fromisoformat(completed_date.replace('Z', '+00:00')).date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format"
        )

    # Find and delete log for this date
    log = db.query(HabitLog).filter(
        and_(
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == current_user.id,
            func.date(HabitLog.completed_date) == log_date
        )
    ).first()

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No log found for this date"
        )

    db.delete(log)
    db.commit()

    # Update habit summary after log deletion
    update_habit_summary(db, current_user.id, habit_id, log_date)

    return {"message": "Habit log deleted successfully"}

def calculate_habit_streak(db: Session, habit_id: int, user_id: int) -> int:
    """Calculate current streak for a habit"""
    today = datetime.now().date()
    streak = 0
    current_date = today
    
    while True:
        log = db.query(HabitLog).filter(
            and_(
                HabitLog.habit_id == habit_id,
                HabitLog.user_id == user_id,
                func.date(HabitLog.completed_date) == current_date
            )
        ).first()
        
        if log:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    return streak
