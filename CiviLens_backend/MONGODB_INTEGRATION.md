# MongoDB Atlas Integration with Django

This document explains how to use MongoDB Atlas with your Django project using pymongo directly.

## Setup

1. The MongoDB connection is configured in `db_connection.py` in the project root.
2. The connection string is loaded from environment variables using `python-dotenv`.
3. SSL connection is established using `certifi`.

## Usage

To use the MongoDB connection in any Django app:

```python
from db_connection import db

# Access a collection
collection = db['collection_name']

# Insert a document
collection.insert_one({'name': 'John', 'age': 30})

# Find documents
documents = list(collection.find({'age': {'$gt': 25}}))

# Update a document
collection.update_one({'name': 'John'}, {'$set': {'age': 31}})

# Delete a document
collection.delete_one({'name': 'John'})
```

## Environment Variables

Create a `.env` file in the project root with:

```
MONGO_URI=mongodb+srv://username:password@cluster-url.mongodb.net/
MONGO_DB_NAME=your_database_name
```

## Testing

- Test MongoDB connection: `GET /api/test-mongodb/`
- Sample data operations: `GET/POST /api/sample-data/`

## Notes

- This setup bypasses Django's ORM completely
- All database operations use pymongo directly
- No models.py files are needed for MongoDB collections
