# MongoDB Atlas Integration Setup

## Prerequisites

Make sure you have the following packages installed:

```
pip install pymongo certifi python-dotenv
```

Or simply run:

```
pip install -r requirements.txt
```

## Environment Setup

1. Create a `.env` file in the `CiviLens_backend` directory
2. Add your MongoDB Atlas connection string:

```
MONGO_URI=mongodb+srv://username:password@cluster-url.mongodb.net/
MONGO_DB_NAME=your_database_name
```

## Testing the Connection

1. Start your Django server:

```
python manage.py runserver
```

2. Test the MongoDB connection:

```
curl http://localhost:8000/api/test-mongodb/
```

3. Test sample data operations:

```
curl http://localhost:8000/api/sample-data/
```

## Using MongoDB in Your Apps

To use MongoDB in any of your Django apps:

```python
from db_connection import db

collection = db['your_collection_name']

# Insert data
collection.insert_one({'key': 'value'})

# Find data
data = list(collection.find({'key': 'value'}))
```

## Available Endpoints

- `GET /api/test-mongodb/` - Test MongoDB connection
- `GET /api/sample-data/` - Get sample data from MongoDB
- `POST /api/sample-data/` - Insert sample data into MongoDB
- `POST /api/auth/log-activity/` - Log user activity to MongoDB
- `GET /api/auth/analytics/` - Get user analytics from MongoDB
