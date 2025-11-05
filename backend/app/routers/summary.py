from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta, datetime
from sqlalchemy import func, and_

from app.database import get_db
from app.models.user import User
from app.models.habit import Habit, HabitLog
from app.models.habit_summary import HabitSummary
from app.schemas.habit_summary import HabitSummarySchema, HabitSummaryCreate
from app.models.habit import Habit
from app.models.habit_summary import HabitSummary
from app.auth import get_current_user

router = APIRouter(
    prefix="/summary",
    tags=["Summary"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[HabitSummarySchema])
def get_habit_summaries(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get habit summaries for the current user, optionally filtered by date range"""
    query = db.query(HabitSummary).filter(HabitSummary.user_id == current_user.id)

    if start_date:
        query = query.filter(HabitSummary.summary_date >= start_date)
    if end_date:
        query = query.filter(HabitSummary.summary_date <= end_date)

    return query.all()

@router.post("/", response_model=HabitSummarySchema)
def create_habit_summary(
    summary: HabitSummaryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new habit summary entry"""
    db_summary = HabitSummary(
        **summary.dict(),
        user_id=current_user.id
    )
    db.add(db_summary)
    db.commit()
    db.refresh(db_summary)
    return db_summary

@router.get("/overall")
def get_overall_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overall summary data for the current user"""
    total_habits = db.query(Habit).filter(Habit.user_id == current_user.id).count()
    active_habits = db.query(Habit).filter(and_(Habit.user_id == current_user.id, Habit.is_active == True)).count()

    # Calculate overall completion rate for the month
    first_day_of_month = datetime.now().replace(day=1).date()
    monthly_summaries = db.query(HabitSummary).filter(
        and_(
            HabitSummary.user_id == current_user.id,
            HabitSummary.summary_date >= first_day_of_month
        )
    ).all()

    total_completion_rate = 0
    if monthly_summaries:
        total_completion_rate = sum([s.completion_rate for s in monthly_summaries]) / len(monthly_summaries)

    # Calculate best streak across all habits
    longest_streak_overall = db.query(func.max(HabitSummary.longest_streak)).filter(
        HabitSummary.user_id == current_user.id
    ).scalar()
    if longest_streak_overall is None:
        longest_streak_overall = 0

    # Calculate total completions
    total_completions = db.query(func.sum(HabitSummary.total_completions)).filter(
        HabitSummary.user_id == current_user.id
    ).scalar()
    if total_completions is None:
        total_completions = 0

    # Calculate current streak (this is more complex and might need a dedicated function or more sophisticated query)
    # For now, a simplified approach or placeholder
    current_streak = 0 # This needs proper implementation based on daily logs

    print(f"Fetching overall summary for user_id: {current_user.id}")
    overall_summary = {
        "total_habits": total_habits,
        "active_habits": active_habits,
        "overall_completion_rate": round(total_completion_rate, 2),
        "current_streak": current_streak,
        "longest_streak": longest_streak_overall,
        "total_completions": total_completions
    }
    print(f"Overall summary data: {overall_summary}")
    return overall_summary


@router.get("/weekly")
def get_weekly_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly summary data for the current user for the past 4 weeks"""
    weekly_summaries = []
    today = datetime.now().date()

    for i in range(4):
        end_date = today - timedelta(weeks=i)
        start_date = end_date - timedelta(days=6) # Start of the week

        summaries_in_week = db.query(HabitSummary).filter(
            and_(
                HabitSummary.user_id == current_user.id,
                HabitSummary.summary_date >= start_date,
                HabitSummary.summary_date <= end_date
            )
        ).all()

        weekly_completion_rate = 0
        if summaries_in_week:
            weekly_completion_rate = sum([s.completion_rate for s in summaries_in_week]) / len(summaries_in_week)
        
        weekly_summaries.append({
            "week_start": start_date.isoformat(),
            "completion_rate": round(weekly_completion_rate, 2)
        })
    
    return list(reversed(weekly_summaries)) # Return in chronological order

@router.get("/top-habits")
def get_top_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get top habits data for the current user"""
    top_habits_query = db.query(
        HabitSummary.habit_id,
        func.avg(HabitSummary.completion_rate).label("avg_completion_rate")
    ).filter(
        HabitSummary.user_id == current_user.id
    ).group_by(HabitSummary.habit_id).order_by(func.avg(HabitSummary.completion_rate).desc()).limit(5)

    top_habits_ids = [item.habit_id for item in top_habits_query.all()]

    result = []
    for habit_id in top_habits_ids:
        habit = db.query(Habit).filter(Habit.id == habit_id).first()
        # Get the most recent HabitSummary for this habit_id and user_id
        hs = db.query(HabitSummary).filter(
            HabitSummary.user_id == current_user.id,
            HabitSummary.habit_id == habit_id
        ).order_by(HabitSummary.summary_date.desc()).first()

        if habit and hs:
            result.append({
                "habit_id": str(hs.habit_id),
                "habit_name": habit.name,
                "current_streak": hs.current_streak,
                "longest_streak": hs.longest_streak,
                "total_completions": hs.total_completions,
                "completion_rate": hs.completion_rate
            })
    return result

@router.get("/daily-completions")
def get_daily_completions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Get daily completions data for the current user"""
    if start_date is None:
        start_date = datetime.now().date() - timedelta(days=30) # Last 30 days by default
    if end_date is None:
        end_date = datetime.now().date()

    daily_completions_data = db.query(HabitSummary.summary_date, func.sum(HabitSummary.total_completions)).filter(
        and_(
            HabitSummary.user_id == current_user.id,
            HabitSummary.summary_date >= start_date,
            HabitSummary.summary_date <= end_date
        )
    ).group_by(HabitSummary.summary_date).order_by(HabitSummary.summary_date).all()

    result = []
    for date_obj, count in daily_completions_data:
        result.append({
            "date": date_obj.isoformat(),
            "count": count
        })
    return result

@router.get("/daily", response_model=List[HabitSummarySchema])
def get_daily_summary(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily summary data for the current user for a specific date"""
    try:
        summary_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    daily_summaries = db.query(HabitSummary).filter(
        and_(
            HabitSummary.user_id == current_user.id,
            HabitSummary.summary_date == summary_date
        )
    ).all()

    return daily_summaries

@router.get("/habit/{habit_id}", response_model=List[HabitSummarySchema])
def get_habit_summary(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all summary data for a specific habit"""
    habit_summaries = db.query(HabitSummary).filter(
        and_(
            HabitSummary.user_id == current_user.id,
            HabitSummary.habit_id == habit_id
        )
    ).order_by(HabitSummary.summary_date).all()

    if not habit_summaries:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No summary data found for this habit"
        )
    return habit_summaries

# Helper function to calculate streak (can be moved to a separate utility file)
def calculate_streak(habit_id: int, user_id: int, db: Session) -> int:
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == user_id
    ).order_by(HabitLog.completed_date.desc()).all()

    if not logs:
        return 0

    current_streak = 0
    last_completed_date = None

    for log in logs:
        log_date = log.completed_date.date()
        if last_completed_date is None:
            current_streak = 1
        elif last_completed_date - timedelta(days=1) == log_date:
            current_streak += 1
        else:
            break
        last_completed_date = log_date

    return current_streak

# Helper function to calculate completion rate (can be moved to a separate utility file)
def calculate_completion_rate(habit_id: int, user_id: int, start_date: date, end_date: date, db: Session) -> float:
    total_days = (end_date - start_date).days + 1
    completed_days = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == user_id,
        HabitLog.completed_date.between(start_date, end_date)
    ).count()
    return (completed_days / total_days) * 100 if total_days > 0 else 0.0