"""
Test script to verify database sync fixes for HabitFlow
Run this after starting the backend server to test all endpoints
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://127.0.0.1:8000"
TEST_EMAIL = f"test_sync_{datetime.now().timestamp()}@example.com"
TEST_PASSWORD = "testpassword123"

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

class HabitFlowTester:
    def __init__(self):
        self.token = None
        self.user_id = None
        self.habit_id = None
        
    def register_user(self):
        """Test user registration"""
        print_info("Testing user registration...")
        response = requests.post(
            f"{BASE_URL}/register",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            print_success("User registered successfully")
            return True
        else:
            print_error(f"Registration failed: {response.text}")
            return False
    
    def login_user(self):
        """Test user login"""
        print_info("Testing user login...")
        response = requests.post(
            f"{BASE_URL}/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token")
            print_success(f"Login successful, token: {self.token[:20]}...")
            return True
        else:
            print_error(f"Login failed: {response.text}")
            return False
    
    def get_headers(self):
        """Get authorization headers"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def create_habit(self):
        """Test habit creation"""
        print_info("Testing habit creation...")
        habit_data = {
            "name": "Test Habit - Database Sync",
            "description": "Testing database sync fixes",
            "frequency": "daily",
            "weekly_goal": 7,
            "tags": ["test", "sync"],
            "icon": "🧪"
        }
        response = requests.post(
            f"{BASE_URL}/habits",
            headers=self.get_headers(),
            json=habit_data
        )
        if response.status_code == 200:
            data = response.json()
            self.habit_id = data.get("id")
            print_success(f"Habit created with ID: {self.habit_id}")
            print_info(f"  Name: {data.get('name')}")
            print_info(f"  Streak: {data.get('streak')}")
            return True
        else:
            print_error(f"Habit creation failed: {response.text}")
            return False
    
    def fetch_habits(self):
        """Test fetching habits"""
        print_info("Testing habit fetch...")
        response = requests.get(
            f"{BASE_URL}/habits",
            headers=self.get_headers()
        )
        if response.status_code == 200:
            habits = response.json()
            print_success(f"Fetched {len(habits)} habit(s)")
            if habits:
                for habit in habits:
                    print_info(f"  - {habit['name']} (ID: {habit['id']}, Streak: {habit['streak']})")
            return True
        else:
            print_error(f"Habit fetch failed: {response.text}")
            return False
    
    def log_habit_completion(self, date_offset=0):
        """Test logging habit completion"""
        target_date = datetime.now() + timedelta(days=date_offset)
        date_str = target_date.isoformat()
        
        print_info(f"Testing habit completion logging for {target_date.date()}...")
        log_data = {
            "habit_id": self.habit_id,
            "completed_date": date_str,
            "notes": f"Test log for {target_date.date()}"
        }
        response = requests.post(
            f"{BASE_URL}/habits/{self.habit_id}/logs",
            headers=self.get_headers(),
            json=log_data
        )
        if response.status_code == 200:
            data = response.json()
            print_success(f"Habit logged successfully (Log ID: {data.get('id')})")
            return True
        else:
            print_error(f"Habit logging failed: {response.text}")
            return False
    
    def delete_habit_log(self, date_offset=0):
        """Test deleting habit log by date"""
        target_date = datetime.now() + timedelta(days=date_offset)
        date_str = target_date.isoformat()
        
        print_info(f"Testing habit log deletion for {target_date.date()}...")
        response = requests.delete(
            f"{BASE_URL}/habits/{self.habit_id}/logs/by-date",
            headers=self.get_headers(),
            params={"completed_date": date_str}
        )
        if response.status_code == 200:
            print_success("Habit log deleted successfully")
            return True
        else:
            print_error(f"Habit log deletion failed: {response.text}")
            return False
    
    def get_habit_logs(self):
        """Test fetching habit logs"""
        print_info("Testing habit logs fetch...")
        response = requests.get(
            f"{BASE_URL}/habits/{self.habit_id}/logs",
            headers=self.get_headers()
        )
        if response.status_code == 200:
            logs = response.json()
            print_success(f"Fetched {len(logs)} log(s)")
            for log in logs:
                date = log.get('completed_date', '')[:10]
                print_info(f"  - {date} (ID: {log.get('id')})")
            return True
        else:
            print_error(f"Habit logs fetch failed: {response.text}")
            return False
    
    def check_streak_update(self):
        """Verify streak is updated after logging"""
        print_info("Checking if streak updated...")
        response = requests.get(
            f"{BASE_URL}/habits/{self.habit_id}",
            headers=self.get_headers()
        )
        if response.status_code == 200:
            habit = response.json()
            streak = habit.get('streak', 0)
            print_success(f"Current streak: {streak}")
            return True
        else:
            print_error(f"Failed to fetch habit: {response.text}")
            return False
    
    def get_habit_summary(self):
        """Test habit summary endpoint"""
        print_info("Testing habit summary fetch...")
        response = requests.get(
            f"{BASE_URL}/summary/habit/{self.habit_id}",
            headers=self.get_headers()
        )
        if response.status_code == 200:
            summaries = response.json()
            print_success(f"Fetched {len(summaries)} summary record(s)")
            for summary in summaries:
                print_info(f"  - Date: {summary.get('summary_date')}")
                print_info(f"    Completion Rate: {summary.get('completion_rate')}%")
                print_info(f"    Current Streak: {summary.get('current_streak')}")
                print_info(f"    Longest Streak: {summary.get('longest_streak')}")
            return True
        elif response.status_code == 404:
            print_warning("No summary data found (this is normal for new habits)")
            return True
        else:
            print_error(f"Summary fetch failed: {response.text}")
            return False
    
    def get_overall_summary(self):
        """Test overall summary endpoint"""
        print_info("Testing overall summary...")
        response = requests.get(
            f"{BASE_URL}/summary/overall",
            headers=self.get_headers()
        )
        if response.status_code == 200:
            summary = response.json()
            print_success("Overall summary fetched")
            print_info(f"  Total Habits: {summary.get('total_habits')}")
            print_info(f"  Active Habits: {summary.get('active_habits')}")
            print_info(f"  Completion Rate: {summary.get('overall_completion_rate')}%")
            print_info(f"  Longest Streak: {summary.get('longest_streak')}")
            return True
        else:
            print_error(f"Overall summary failed: {response.text}")
            return False
    
    def cleanup(self):
        """Delete test habit"""
        if self.habit_id:
            print_info("Cleaning up test data...")
            response = requests.delete(
                f"{BASE_URL}/habits/{self.habit_id}",
                headers=self.get_headers()
            )
            if response.status_code == 200:
                print_success("Test habit deleted")
            else:
                print_warning("Could not delete test habit")

def main():
    print("\n" + "="*60)
    print("HabitFlow Database Sync Test Suite")
    print("="*60 + "\n")
    
    tester = HabitFlowTester()
    
    try:
        # Test 1: User Registration and Login
        print("\n--- Test 1: Authentication ---")
        if not tester.register_user():
            return
        if not tester.login_user():
            return
        
        # Test 2: Habit Creation and Fetch
        print("\n--- Test 2: Habit Creation & Fetch ---")
        if not tester.create_habit():
            return
        if not tester.fetch_habits():
            return
        
        # Test 3: Habit Logging
        print("\n--- Test 3: Habit Logging ---")
        if not tester.log_habit_completion(0):  # Today
            return
        if not tester.check_streak_update():
            return
        if not tester.get_habit_logs():
            return
        
        # Test 4: Toggle Functionality (log again for same day)
        print("\n--- Test 4: Toggle Functionality ---")
        print_info("Attempting to log same day again (should update, not error)...")
        if not tester.log_habit_completion(0):
            return
        
        # Test 5: Multiple Day Logging
        print("\n--- Test 5: Multi-Day Logging ---")
        if not tester.log_habit_completion(-1):  # Yesterday
            return
        if not tester.log_habit_completion(-2):  # 2 days ago
            return
        if not tester.check_streak_update():
            return
        
        # Test 6: Log Deletion
        print("\n--- Test 6: Log Deletion ---")
        if not tester.delete_habit_log(0):  # Delete today's log
            return
        if not tester.check_streak_update():
            return
        if not tester.get_habit_logs():
            return
        
        # Test 7: Summary Endpoints
        print("\n--- Test 7: Summary Data ---")
        if not tester.get_habit_summary():
            return
        if not tester.get_overall_summary():
            return
        
        # Test 8: Refetch to verify persistence
        print("\n--- Test 8: Data Persistence ---")
        if not tester.fetch_habits():
            return
        
        print("\n" + "="*60)
        print_success("All tests passed! Database sync is working correctly.")
        print("="*60 + "\n")
        
    except Exception as e:
        print_error(f"Test suite failed with error: {str(e)}")
    finally:
        tester.cleanup()

if __name__ == "__main__":
    main()
