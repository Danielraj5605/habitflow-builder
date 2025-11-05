"""
Test script to verify API responses and debug frontend display issues
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
DEMO_EMAIL = "demo@habitflow.com"
DEMO_PASSWORD = "demo123"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def login_and_get_token():
    """Login and get authentication token"""
    print_info("Logging in as demo user...")
    
    response = requests.post(
        f"{BASE_URL}/login",
        json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD}
    )
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        print_success(f"Login successful, token: {token[:20]}...")
        return token
    else:
        print_error(f"Login failed: {response.status_code} - {response.text}")
        return None

def test_habits_api(token):
    """Test the habits API endpoint"""
    print_info("Testing /habits endpoint...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{BASE_URL}/habits", headers=headers)
    
    if response.status_code == 200:
        habits = response.json()
        print_success(f"API returned {len(habits)} habits")
        
        if habits:
            print_info("Sample habit data:")
            sample_habit = habits[0]
            print(json.dumps(sample_habit, indent=2, default=str))
            
            print_info("\nAll habits summary:")
            for i, habit in enumerate(habits, 1):
                current_week = habit.get('currentWeek', [])
                completed_this_week = sum(current_week) if current_week else 0
                print_info(f"  {i}. {habit['name']}")
                print_info(f"     ID: {habit['id']}")
                print_info(f"     Streak: {habit.get('streak', 0)}")
                print_info(f"     This week: {completed_this_week}/7 days")
                print_info(f"     Active: {habit.get('is_active', True)}")
                print_info(f"     Icon: {habit.get('icon', '🎯')}")
        else:
            print_warning("No habits returned from API")
        
        return habits
    else:
        print_error(f"Habits API failed: {response.status_code} - {response.text}")
        return None

def test_summary_api(token):
    """Test the summary API endpoints"""
    print_info("Testing summary endpoints...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test overall summary
    response = requests.get(f"{BASE_URL}/summary/overall", headers=headers)
    if response.status_code == 200:
        summary = response.json()
        print_success("Overall summary:")
        print_info(f"  Total habits: {summary.get('total_habits')}")
        print_info(f"  Active habits: {summary.get('active_habits')}")
        print_info(f"  Completion rate: {summary.get('overall_completion_rate')}%")
        print_info(f"  Longest streak: {summary.get('longest_streak')}")
    else:
        print_error(f"Summary API failed: {response.status_code}")

def check_frontend_compatibility(habits):
    """Check if habit data is compatible with frontend expectations"""
    print_info("Checking frontend compatibility...")
    
    if not habits:
        print_error("No habits to check")
        return
    
    required_fields = ['id', 'name', 'description', 'frequency', 'is_active', 'tags', 'icon', 'streak']
    frontend_fields = ['currentWeek', 'weekly_goal']
    
    issues = []
    
    for habit in habits:
        # Check required fields
        for field in required_fields:
            if field not in habit:
                issues.append(f"Missing required field '{field}' in habit {habit.get('id', 'unknown')}")
        
        # Check frontend-specific fields
        for field in frontend_fields:
            if field not in habit:
                issues.append(f"Missing frontend field '{field}' in habit {habit.get('id', 'unknown')}")
        
        # Check data types
        if 'currentWeek' in habit:
            current_week = habit['currentWeek']
            if not isinstance(current_week, list) or len(current_week) != 7:
                issues.append(f"Invalid currentWeek format in habit {habit.get('id')}: {current_week}")
        
        if 'tags' in habit:
            if not isinstance(habit['tags'], list):
                issues.append(f"Tags should be a list in habit {habit.get('id')}: {habit['tags']}")
    
    if issues:
        print_error("Frontend compatibility issues found:")
        for issue in issues:
            print_error(f"  - {issue}")
    else:
        print_success("All habits are frontend-compatible!")

def main():
    print("\n" + "="*60)
    print("HabitFlow API Response Test")
    print("="*60 + "\n")
    
    # Step 1: Login
    token = login_and_get_token()
    if not token:
        return
    
    # Step 2: Test habits API
    habits = test_habits_api(token)
    
    # Step 3: Test summary API
    test_summary_api(token)
    
    # Step 4: Check frontend compatibility
    if habits:
        check_frontend_compatibility(habits)
    
    print("\n" + "="*60)
    print("API Test Complete!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
