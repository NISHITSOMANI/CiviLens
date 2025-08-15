#!/usr/bin/env python
"""
Test script to verify MongoDB connection
"""
import os
import sys

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import the database connection
try:
    from db_connection import db, client
    print("✓ Successfully imported db_connection")
    
    # Test the connection
    try:
        # Ping the database
        client.admin.command('ping')
        print("✓ Successfully connected to MongoDB")
        
        # Get database name
        print(f"✓ Database name: {db.name}")
        
        # List collections (this will create a connection)
        collections = db.list_collection_names()
        print(f"✓ Available collections: {collections}")
        
        print("\n✅ All tests passed! MongoDB connection is working correctly.")
        
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        
except Exception as e:
    print(f"✗ Failed to import db_connection: {e}")
    print("Make sure you have set up your .env file with MONGO_URI")
