"""
Populate HabitFlow database with realistic test data for the last month
This script creates users, habits, habit logs, and summaries
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta, date
import random
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User
from app.models.habit import Habit, HabitLog
from app.models.habit_summary import HabitSummary
from app.auth import get_password_hash
from sqlalchemy import text

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def print_header(msg):
    print(f"\n{Colors.PURPLE}{'='*60}{Colors.END}")
    print(f"{Colors.PURPLE}{msg.center(60)}{Colors.END}")
    print(f"{Colors.PURPLE}{'='*60}{Colors.END}\n")

# Sample habit data
SAMPLE_HABITS = [
    {
        "name": "Morning Exercise",
        "description": "30 minutes of cardio or strength training",
        "frequency": "daily",
        "weekly_goal": 7,
        "tags": ["fitness", "health", "morning"],
        "icon": "🏃‍♂️",
        "completion_rate": 0.85  # 85% completion rate
    },
    {
        "name": "Read Books",
        "description": "Read for at least 20 minutes",
        "frequency": "daily", 
        "weekly_goal": 6,
        "tags": ["learning", "books", "personal-growth"],
        "icon": "📚",
        "completion_rate": 0.70
    },
    {
        "name": "Meditation",
        "description": "10 minutes of mindfulness meditation",
        "frequency": "daily",
        "weekly_goal": 7,
        "tags": ["mindfulness", "mental-health", "peace"],
        "icon": "🧘‍♀️",
        "completion_rate": 0.60
    },
    {
        "name": "Drink Water",
        "description": "Drink 8 glasses of water throughout the day",
        "frequency": "daily",
        "weekly_goal": 7,
        "tags": ["health", "hydration"],
        "icon": "💧",
        "completion_rate": 0.90
    },
    {
        "name": "Learn Programming",
        "description": "Code for at least 1 hour",
        "frequency": "daily",
        "weekly_goal": 5,
        "tags": ["coding", "career", "skills"],
        "icon": "💻",
        "completion_rate": 0.75
    },
    {
        "name": "Gratitude Journal",
        "description": "Write 3 things I'm grateful for",
        "frequency": "daily",
        "weekly_goal": 7,
        "tags": ["gratitude", "journaling", "mental-health"],
        "icon": "📝",
        "completion_rate": 0.65
    },
    {
        "name": "Walk Outside",
        "description": "Take a 20-minute walk outdoors",
        "frequency": "daily",
        "weekly_goal": 6,
        "tags": ["exercise", "nature", "fresh-air"],
        "icon": "🚶‍♂️",
        "completion_rate": 0.80
    },
    {
        "name": "Healthy Breakfast",
        "description": "Eat a nutritious breakfast",
        "frequency": "daily",
        "weekly_goal": 7,
        "tags": ["nutrition", "health", "morning"],
        "icon": "🥗",
        "completion_rate": 0.85
    }
]

def create_tables():
    """Create all database tables"""
    print_info("Creating database tables...")
    try:
        from app.models import user, habit, habit_summary
        from app.database import Base
        Base.metadata.create_all(bind=engine)
        print_success("Database tables created successfully")
        return True
    except Exception as e:
        print_error(f"Failed to create tables: {e}")
        return False

def clear_existing_data(db: Session):
    """Clear existing test data"""
    print_info("Clearing existing test data...")
    try:
        # Delete in correct order to avoid foreign key constraints
        db.execute(text("DELETE FROM habit_summary WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'demo%')"))
        db.execute(text("DELETE FROM habit_logs WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'demo%')"))
        db.execute(text("DELETE FROM habits WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'demo%')"))
        db.execute(text("DELETE FROM users WHERE email LIKE 'demo%'"))
        db.commit()
        print_success("Existing test data cleared")
    except Exception as e:
        print_warning(f"Could not clear existing data: {e}")
        db.rollback()

def create_demo_user(db: Session):
    """Create a demo user"""
    print_info("Creating demo user...")
    
    demo_user = User(
        email="demo@habitflow.com",
        name="Demo User",
        hashed_password=get_password_hash("demo123"),
        is_active=True
    )
    
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)
    
    print_success(f"Demo user created with ID: {demo_user.id}")
    print_info("  Email: demo@habitflow.com")
    print_info("  Password: demo123")
    
    return demo_user

def create_habits(db: Session, user: User):
    """Create sample habits for the user"""
    print_info("Creating sample habits...")
    
    habits = []
    for habit_data in SAMPLE_HABITS:
        habit = Habit(
            user_id=user.id,
            name=habit_data["name"],
            description=habit_data["description"],
            frequency=habit_data["frequency"],
            weekly_goal=habit_data["weekly_goal"],
            tags=habit_data["tags"],
            icon=habit_data["icon"],
            is_active=True,
            streak=0  # Will be calculated later
        )
        db.add(habit)
        habits.append((habit, habit_data["completion_rate"]))
    
    db.commit()
    
    # Refresh to get IDs
    for habit, _ in habits:
        db.refresh(habit)
    
    print_success(f"Created {len(habits)} sample habits")
    return habits

def create_habit_logs(db: Session, user: User, habits_with_rates):
    """Create habit logs for the last month"""
    print_info("Creating habit logs for the last 30 days...")
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=30)
    
    total_logs = 0
    
    for habit, completion_rate in habits_with_rates:
        habit_logs = 0
        current_date = start_date
        
        while current_date <= end_date:
            # Use completion rate to determine if habit was completed
            if random.random() < completion_rate:
                # Add some randomness to the time
                log_time = datetime.combine(
                    current_date, 
                    datetime.min.time().replace(
                        hour=random.randint(6, 22),
                        minute=random.randint(0, 59)
                    )
                )
                
                habit_log = HabitLog(
                    user_id=user.id,
                    habit_id=habit.id,
                    completed_date=log_time,
                    notes=f"Completed {habit.name} on {current_date}"
                )
                db.add(habit_log)
                habit_logs += 1
                total_logs += 1
            
            current_date += timedelta(days=1)
        
        print_info(f"  {habit.name}: {habit_logs} completions")
    
    db.commit()
    print_success(f"Created {total_logs} habit logs")

def calculate_streaks(db: Session, habits_with_rates):
    """Calculate and update streaks for all habits"""
    print_info("Calculating habit streaks...")
    
    for habit, _ in habits_with_rates:
        # Get all logs for this habit, ordered by date
        logs = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id
        ).order_by(HabitLog.completed_date.desc()).all()
        
        if not logs:
            continue
        
        # Calculate current streak
        streak = 0
        today = datetime.now().date()
        current_date = today
        
        # Convert logs to set of dates for efficient lookup
        log_dates = {log.completed_date.date() for log in logs}
        
        # Count consecutive days from today backwards
        while current_date in log_dates:
            streak += 1
            current_date -= timedelta(days=1)
        
        # Update habit streak
        habit.streak = streak
        print_info(f"  {habit.name}: {streak} day streak")
    
    db.commit()
    print_success("Streaks calculated and updated")

def create_habit_summaries(db: Session, user: User, habits_with_rates):
    """Create habit summaries for the last month"""
    print_info("Creating habit summaries...")
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=30)
    
    total_summaries = 0
    
    for habit, completion_rate in habits_with_rates:
        # Get all logs for this habit
        logs = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.completed_date >= start_date
        ).all()
        
        if not logs:
            continue
        
        # Calculate metrics
        total_completions = len(logs)
        days_in_period = (end_date - start_date).days + 1
        actual_completion_rate = (total_completions / days_in_period) * 100
        
        # Calculate streaks
        log_dates = sorted([log.completed_date.date() for log in logs])
        current_streak = 0
        longest_streak = 0
        temp_streak = 0
        
        # Calculate longest streak
        if log_dates:
            prev_date = None
            for log_date in log_dates:
                if prev_date is None or log_date == prev_date + timedelta(days=1):
                    temp_streak += 1
                    longest_streak = max(longest_streak, temp_streak)
                else:
                    temp_streak = 1
                prev_date = log_date
        
        # Calculate current streak (from today backwards)
        today = datetime.now().date()
        log_date_set = set(log_dates)
        current_date = today
        while current_date in log_date_set:
            current_streak += 1
            current_date -= timedelta(days=1)
        
        # Create summary for today
        summary = HabitSummary(
            user_id=user.id,
            habit_id=habit.id,
            summary_date=end_date,
            completion_rate=actual_completion_rate,
            current_streak=current_streak,
            longest_streak=longest_streak,
            total_completions=total_completions
        )
        
        db.add(summary)
        total_summaries += 1
        
        print_info(f"  {habit.name}:")
        print_info(f"    Completion Rate: {actual_completion_rate:.1f}%")
        print_info(f"    Current Streak: {current_streak}")
        print_info(f"    Longest Streak: {longest_streak}")
        print_info(f"    Total Completions: {total_completions}")
    
    db.commit()
    print_success(f"Created {total_summaries} habit summaries")

def update_current_week_data(db: Session, habits_with_rates):
    """Update currentWeek array for habits based on this week's logs"""
    print_info("Updating current week data...")
    
    today = datetime.now().date()
    # Find Monday of current week
    days_since_monday = today.weekday()  # Monday = 0
    monday = today - timedelta(days=days_since_monday)
    
    for habit, _ in habits_with_rates:
        current_week = [False] * 7  # Monday to Sunday
        
        for i in range(7):
            check_date = monday + timedelta(days=i)
            if check_date <= today:  # Don't check future dates
                log_exists = db.query(HabitLog).filter(
                    HabitLog.habit_id == habit.id,
                    HabitLog.completed_date >= datetime.combine(check_date, datetime.min.time()),
                    HabitLog.completed_date < datetime.combine(check_date + timedelta(days=1), datetime.min.time())
                ).first()
                
                current_week[i] = log_exists is not None
        
        # Update habit's currentWeek field
        habit.currentWeek = current_week
        
        completed_days = sum(current_week)
        print_info(f"  {habit.name}: {completed_days}/7 days this week")
    
    db.commit()
    print_success("Current week data updated")

def verify_data(db: Session):
    """Verify that data was created correctly"""
    print_info("Verifying created data...")
    
    # Count records
    user_count = db.query(User).filter(User.email.like('demo%')).count()
    habit_count = db.query(Habit).count()
    log_count = db.query(HabitLog).count()
    summary_count = db.query(HabitSummary).count()
    
    print_success("Data verification:")
    print_info(f"  Users: {user_count}")
    print_info(f"  Habits: {habit_count}")
    print_info(f"  Habit Logs: {log_count}")
    print_info(f"  Summaries: {summary_count}")
    
    # Show sample habit with logs
    if habit_count > 0:
        sample_habit = db.query(Habit).first()
        sample_logs = db.query(HabitLog).filter(HabitLog.habit_id == sample_habit.id).count()
        print_info(f"  Sample habit '{sample_habit.name}' has {sample_logs} logs and {sample_habit.streak} day streak")

def main():
    print_header("HabitFlow Database Population Script")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Step 1: Create tables
        if not create_tables():
            return
        
        # Step 2: Clear existing test data
        clear_existing_data(db)
        
        # Step 3: Create demo user
        demo_user = create_demo_user(db)
        
        # Step 4: Create habits
        habits_with_rates = create_habits(db, demo_user)
        
        # Step 5: Create habit logs for last month
        create_habit_logs(db, demo_user, habits_with_rates)
        
        # Step 6: Calculate streaks
        calculate_streaks(db, habits_with_rates)
        
        # Step 7: Update current week data
        update_current_week_data(db, habits_with_rates)
        
        # Step 8: Create summaries
        create_habit_summaries(db, demo_user, habits_with_rates)
        
        # Step 9: Verify data
        verify_data(db)
        
        print_header("Database Population Complete!")
        print_success("You can now log in with:")
        print_info("  Email: demo@habitflow.com")
        print_info("  Password: demo123")
        print_info("\nThe database now contains:")
        print_info("  ✓ 8 sample habits with realistic data")
        print_info("  ✓ 30 days of habit completion logs")
        print_info("  ✓ Calculated streaks and statistics")
        print_info("  ✓ Current week progress data")
        print_info("  ✓ Habit summaries for analytics")
        
    except Exception as e:
        print_error(f"Error populating database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
