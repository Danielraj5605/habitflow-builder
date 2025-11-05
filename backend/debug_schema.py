"""
Debug script to test Pydantic schema serialization
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.habit import Habit
from app.schemas.habit import Habit as HabitSchema
from app.database import SessionLocal
from app.models.user import User
import json

def test_schema_serialization():
    """Test if the Habit schema properly serializes currentWeek"""
    db = SessionLocal()
    
    try:
        # Get a habit from database
        demo_user = db.query(User).filter(User.email == "demo@habitflow.com").first()
        if not demo_user:
            print("Demo user not found!")
            return
        
        habit = db.query(Habit).filter(Habit.user_id == demo_user.id).first()
        if not habit:
            print("No habits found!")
            return
        
        print(f"Raw habit from database:")
        print(f"  ID: {habit.id}")
        print(f"  Name: {habit.name}")
        print(f"  currentWeek (raw): {habit.currentWeek}")
        print(f"  currentWeek type: {type(habit.currentWeek)}")
        
        # Set currentWeek manually for testing
        habit.currentWeek = [True, False, True, False, True, False, False]
        
        print(f"\nAfter setting currentWeek:")
        print(f"  currentWeek: {habit.currentWeek}")
        
        # Try to serialize with Pydantic
        try:
            habit_dict = HabitSchema.from_orm(habit).dict()
            print(f"\nPydantic serialization successful:")
            print(f"  currentWeek in dict: {'currentWeek' in habit_dict}")
            if 'currentWeek' in habit_dict:
                print(f"  currentWeek value: {habit_dict['currentWeek']}")
            else:
                print("  Available fields:", list(habit_dict.keys()))
            
            # Print full serialized habit
            print(f"\nFull serialized habit:")
            print(json.dumps(habit_dict, indent=2, default=str))
            
        except Exception as e:
            print(f"Pydantic serialization failed: {e}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_schema_serialization()
