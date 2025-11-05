"""
Add habit logs for the current week to test currentWeek functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.models.habit import Habit, HabitLog

def add_current_week_logs():
    """Add some habit logs for the current week"""
    db = SessionLocal()
    
    try:
        # Get the demo user
        demo_user = db.query(User).filter(User.email == "demo@habitflow.com").first()
        if not demo_user:
            print("Demo user not found!")
            return
        
        # Get all habits for the demo user
        habits = db.query(Habit).filter(Habit.user_id == demo_user.id).all()
        if not habits:
            print("No habits found!")
            return
        
        print(f"Found {len(habits)} habits for demo user")
        
        # Calculate current week dates
        today = datetime.now().date()
        days_since_monday = today.weekday()  # Monday = 0
        monday = today - timedelta(days=days_since_monday)
        
        print(f"Current week: {monday} to {monday + timedelta(days=6)}")
        print(f"Today is: {today}")
        
        # Add logs for some habits for the current week
        logs_added = 0
        
        for habit in habits[:4]:  # Just first 4 habits
            print(f"\nAdding logs for: {habit.name}")
            
            # Add logs for Monday, Tuesday, and today (if different)
            days_to_log = [0, 1]  # Monday, Tuesday
            if today.weekday() > 1:  # If today is after Tuesday
                days_to_log.append(today.weekday())  # Add today
            
            for day_offset in days_to_log:
                log_date = monday + timedelta(days=day_offset)
                
                # Check if log already exists
                existing_log = db.query(HabitLog).filter(
                    HabitLog.habit_id == habit.id,
                    HabitLog.user_id == demo_user.id,
                    HabitLog.completed_date >= datetime.combine(log_date, datetime.min.time()),
                    HabitLog.completed_date < datetime.combine(log_date + timedelta(days=1), datetime.min.time())
                ).first()
                
                if not existing_log:
                    # Create new log
                    log_time = datetime.combine(log_date, datetime.min.time().replace(hour=10, minute=0))
                    new_log = HabitLog(
                        user_id=demo_user.id,
                        habit_id=habit.id,
                        completed_date=log_time,
                        notes=f"Current week completion for {log_date}"
                    )
                    db.add(new_log)
                    logs_added += 1
                    print(f"  Added log for {log_date}")
                else:
                    print(f"  Log already exists for {log_date}")
        
        db.commit()
        print(f"\n✓ Added {logs_added} new logs for current week")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_current_week_logs()
