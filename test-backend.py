#!/usr/bin/env python3
"""
Simple test script to verify the backend API is working
"""

import requests
import json

def test_backend():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Backend API...")
    print("=" * 50)
    
    # Test 1: Basic endpoint
    try:
        print("1. Testing basic endpoint (/)...")
        response = requests.get(f"{base_url}/")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        print()
    except Exception as e:
        print(f"   ❌ Error: {e}")
        print()
    
    # Test 2: Test endpoint
    try:
        print("2. Testing test endpoint (/test)...")
        response = requests.get(f"{base_url}/test")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        print()
    except Exception as e:
        print(f"   ❌ Error: {e}")
        print()
    
    # Test 3: CORS preflight request
    try:
        print("3. Testing CORS preflight request...")
        headers = {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{base_url}/", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   CORS Headers: {dict(response.headers)}")
        print()
    except Exception as e:
        print(f"   ❌ Error: {e}")
        print()
    
    print("✅ Backend test completed!")

if __name__ == "__main__":
    test_backend() 