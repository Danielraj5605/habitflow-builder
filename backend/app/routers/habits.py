from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app.models.user import User
from app.models.habit import Habit, HabitLog
from app.models.habit_summary import HabitSummary
from app.schemas.habit import HabitCreate, HabitUpdate, Habit as HabitSchema, HabitLogCreate, HabitLog as HabitLogSchema
from app.auth import get_current_user
from app.services.consistency import calculate_7_day_consistency, get_local_today, check_and_award_rest_tokens, calculate_current_streak

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
    
    today = get_local_today()
    days_since_monday = today.weekday()
    monday = today - timedelta(days=days_since_monday)
    
    for habit in habits:
        current_week = [False] * 7
        
        for i in range(7):
            check_date = monday + timedelta(days=i)
            if check_date <= today:
                log_exists = db.query(HabitLog).filter(
                    HabitLog.habit_id == habit.id,
                    HabitLog.user_id == current_user.id,
                    func.date(HabitLog.completed_date) == check_date
                ).first()
                
                current_week[i] = log_exists is not None
        
        habit.currentWeek = current_week
        
        # Calculate and update 7-day consistency and streak
        consistency_score = calculate_7_day_consistency(db, habit.id, current_user.id)
        streak = calculate_current_streak(db, habit.id, current_user.id)
        
        habit.consistency_score = consistency_score
        habit.streak = streak
        
        db.query(Habit).filter(Habit.id == habit.id).update({
            "consistency_score": consistency_score,
            "currentWeek": current_week,
            "streak": streak
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
        user_id=current_user.id,
        consistency_score=0.0,
        streak=0
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
    
    # Calculate consistency and streak
    habit.consistency_score = calculate_7_day_consistency(db, habit.id, current_user.id)
    habit.streak = calculate_current_streak(db, habit.id, current_user.id)
    
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
    check_and_award_rest_tokens(db, current_user.id, habit_id)
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
        return

    total_completions = len(all_logs)

    # Calculate 7-day rolling consistency score and streaks
    consistency_score = calculate_7_day_consistency(db, habit_id, user_id)
    current_streak = calculate_current_streak(db, habit_id, user_id)
    longest_streak = calculate_longest_streak(db, habit_id, user_id)
    
    # Use consistency_score as completion_rate for the daily summary
    completion_rate = consistency_score

    db.query(Habit).filter(Habit.id == habit_id).update({
        "consistency_score": consistency_score,
        "streak": current_streak
    })

    # Use func.date for comparison to avoid time issues
    existing_summary = db.query(HabitSummary).filter(
        and_(
            HabitSummary.user_id == user_id,
            HabitSummary.habit_id == habit_id,
            func.date(HabitSummary.summary_date) == summary_date
        )
    ).first()

    if existing_summary:
        existing_summary.consistency_score = consistency_score
        existing_summary.completion_rate = completion_rate
        existing_summary.current_streak = current_streak
        existing_summary.longest_streak = longest_streak
        existing_summary.total_completions = total_completions
    else:
        new_summary = HabitSummary(
            user_id=user_id,
            habit_id=habit_id,
            summary_date=datetime.combine(summary_date, datetime.min.time(), tzinfo=timezone.utc),
            consistency_score=consistency_score,
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
