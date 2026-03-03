from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta, timezone
from app.models.habit import Habit, HabitLog
from app.models.user import User

def get_local_today() -> datetime.date:
    # Here we should technically use the user's timezone.
    # For now, we return UTC date, but the models use timezone-aware datetimes.
    return datetime.now(timezone.utc).date()

def calculate_7_day_consistency(db: Session, habit_id: int, user_id: int) -> float:
    """
    Calculate the 7-day rolling consistency score.
    Returns a percentage (0.0 to 100.0).
    """
    today = get_local_today()
    start_date = today - timedelta(days=6) # 7 days including today
    
    # Get the habit to ensure it exists
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        return 0.0
    
    completions = db.query(func.count(HabitLog.id)).filter(
        and_(
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == user_id,
            func.date(HabitLog.completed_date) >= start_date,
            func.date(HabitLog.completed_date) <= today
        )
    ).scalar()
    
    # Cap completions at 7 (in case of multiple logs per day)
    completions = min(completions, 7)
    
    return (completions / 7.0) * 100

def calculate_current_streak(db: Session, habit_id: int, user_id: int) -> int:
    """Calculate current streak of days with logs for a habit."""
    today = get_local_today()
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

def check_and_award_rest_tokens(db: Session, user_id: int, habit_id: int):
    """
    If a user has reached a multiple of 7 days in their streak, award 1 rest token.
    """
    streak = calculate_current_streak(db, habit_id, user_id)
    if streak > 0 and streak % 7 == 0:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            # Award a token only if we just hit a multiple of 7
            user.rest_tokens_available += 1
            db.commit()

def use_rest_token_if_available(db: Session, user_id: int, habit_id: int, missed_date: datetime.date) -> bool:
    """
    Burns a rest token to preserve consistency on a missed day.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.rest_tokens_available > 0:
        user.rest_tokens_available -= 1
        
        # Create a "pseudo-log" indicating a rest token was used
        pseudo_log = HabitLog(
            user_id=user_id,
            habit_id=habit_id,
            completed_date=datetime.combine(missed_date, datetime.min.time(), tzinfo=timezone.utc),
            used_rest_token=True,
            notes="Rest Token Used"
        )
        db.add(pseudo_log)
        db.commit()
        return True
    return False
