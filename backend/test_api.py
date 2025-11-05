#!/usr/bin/env python3
"""
Simple API Test Script for HabitFlow Backend
Run this after starting the backend to verify everything works
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_api():
    print("🧪 Testing HabitFlow API...")
    print(f"Base URL: {BASE_URL}")
    
    # Test 1: Health Check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print("❌ Health check failed")
            return
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        print("   Make sure the backend is running on port 8000")
        return
    
    # Test 2: Register User
    print("\n2. Testing user registration...")
    test_user = {
        "email": f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@habitflow.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=test_user)
        if response.status_code == 201:
            print("✅ User registration successful")
            user_data = response.json()
            print(f"   User ID: {user_data['id']}")
        else:
            print(f"❌ Registration failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return
    
    # Test 3: Login User
    print("\n3. Testing user login...")
    try:
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        if response.status_code == 200:
            print("✅ Login successful")
            token_data = response.json()
            access_token = token_data["access_token"]
            print(f"   Token received (first 20 chars): {access_token[:20]}...")
        else:
            print(f"❌ Login failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Set up headers for authenticated requests
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Test 4: Create Habit
    print("\n4. Testing habit creation...")
    test_habit = {
        "name": "Test Habit",
        "description": "A test habit for API verification",
        "frequency": "daily",
        "weekly_goal": 7,
        "tags": ["test", "api"],
        "icon": "🧪"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/habits/", json=test_habit, headers=headers)
        if response.status_code == 201:
            print("✅ Habit creation successful")
            habit_data = response.json()
            habit_id = habit_data["id"]
            print(f"   Habit ID: {habit_id}")
            print(f"   Habit Name: {habit_data['name']}")
        else:
            print(f"❌ Habit creation failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Habit creation error: {e}")
        return
    
    # Test 5: Get Habits
    print("\n5. Testing get habits...")
    try:
        response = requests.get(f"{BASE_URL}/habits/", headers=headers)
        if response.status_code == 200:
            print("✅ Get habits successful")
            habits = response.json()
            print(f"   Found {len(habits)} habit(s)")
        else:
            print(f"❌ Get habits failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Get habits error: {e}")
        return
    
    # Test 6: Log Habit Completion
    print("\n6. Testing habit logging...")
    habit_log = {
        "habit_id": habit_id,
        "completed_date": datetime.now().isoformat(),
        "notes": "Test completion via API"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/habits/{habit_id}/logs", json=habit_log, headers=headers)
        if response.status_code == 201:
            print("✅ Habit logging successful")
            log_data = response.json()
            print(f"   Log ID: {log_data['id']}")
        else:
            print(f"❌ Habit logging failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Habit logging error: {e}")
        return
    
    # Test 7: Get Habit Logs
    print("\n7. Testing get habit logs...")
    try:
        response = requests.get(f"{BASE_URL}/habits/{habit_id}/logs", headers=headers)
        if response.status_code == 200:
            print("✅ Get habit logs successful")
            logs = response.json()
            print(f"   Found {len(logs)} log(s)")
        else:
            print(f"❌ Get habit logs failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Get habit logs error: {e}")
        return
    
    print("\n🎉 All API tests passed successfully!")
    print("\nYour HabitFlow backend is working correctly!")
    print(f"📚 API Documentation: {BASE_URL}/docs")
    print(f"🔍 ReDoc Documentation: {BASE_URL}/redoc")

if __name__ == "__main__":
    test_api()
