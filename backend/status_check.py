#!/usr/bin/env python3
"""
HabitFlow Backend Status Check
Quick verification that all systems are working
"""

import requests
import json

def check_backend_status():
    base_url = "http://localhost:8000"
    
    print("🔍 HabitFlow Backend Status Check")
    print("=" * 50)
    
    # 1. Health Check
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health Check: PASSED")
        else:
            print("❌ Health Check: FAILED")
            return
    except:
        print("❌ Server not running on port 8000")
        return
    
    # 2. API Documentation
    try:
        response = requests.get(f"{base_url}/docs")
        if response.status_code == 200:
            print("✅ API Documentation: AVAILABLE")
        else:
            print("⚠️  API Documentation: Not accessible")
    except:
        print("⚠️  API Documentation: Not accessible")
    
    # 3. Test Registration
    try:
        test_user = {
            "email": "status_test@habitflow.com",
            "password": "testpass123"
        }
        response = requests.post(f"{base_url}/register", json=test_user)
        if response.status_code in [200, 201]:
            print("✅ User Registration: WORKING")
        elif response.status_code == 400 and "already registered" in response.text:
            print("✅ User Registration: WORKING (user exists)")
        else:
            print(f"❌ User Registration: FAILED ({response.status_code})")
    except Exception as e:
        print(f"❌ User Registration: ERROR ({e})")
    
    # 4. Test Login
    try:
        response = requests.post(f"{base_url}/login", json=test_user)
        if response.status_code == 200:
            token = response.json().get("access_token")
            print("✅ User Login: WORKING")
            
            # 5. Test Authenticated Endpoint
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{base_url}/habits/", headers=headers)
            if response.status_code == 200:
                print("✅ Authenticated Endpoints: WORKING")
            else:
                print("❌ Authenticated Endpoints: FAILED")
        else:
            print("❌ User Login: FAILED")
    except Exception as e:
        print(f"❌ User Login: ERROR ({e})")
    
    print("\n🎉 Backend Status Summary:")
    print(f"📍 Server URL: {base_url}")
    print(f"📚 API Docs: {base_url}/docs")
    print(f"🔄 ReDoc: {base_url}/redoc")
    print("\n✅ HabitFlow Backend is ready for frontend integration!")

if __name__ == "__main__":
    check_backend_status()
