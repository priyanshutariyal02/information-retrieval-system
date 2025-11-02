"""
Manual test script for FastAPI endpoints.
Run backend first: uvicorn app:app --reload
Then run this script: python test_api.py
"""

import requests
import uuid

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print("Health Check:", response.json())
    return response.status_code == 200

def test_upload(pdf_path: str):
    """Test PDF upload"""
    session_id = str(uuid.uuid4())
    
    with open(pdf_path, 'rb') as f:
        files = {'files': (pdf_path, f, 'application/pdf')}
        data = {'session_id': session_id}
        response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
    
    print("Upload Response:", response.json())
    return session_id if response.status_code == 200 else None

def test_query(session_id: str, question: str):
    """Test query endpoint"""
    payload = {
        "question": question,
        "session_id": session_id,
        "chat_history": []
    }
    response = requests.post(f"{BASE_URL}/query", json=payload)
    print("Query Response:", response.json())
    return response.status_code == 200

if __name__ == "__main__":
    print("=== Testing FastAPI Backend ===\n")
    
    # Test 1: Health check
    print("1. Testing health endpoint...")
    test_health()
    print()
    
    # Test 2: Upload PDF (replace with your test PDF path)
    # print("2. Testing upload endpoint...")
    # session_id = test_upload("path/to/your/test.pdf")
    # print()
    
    # Test 3: Query
    # if session_id:
    #     print("3. Testing query endpoint...")
    #     test_query(session_id, "What is this document about?")
