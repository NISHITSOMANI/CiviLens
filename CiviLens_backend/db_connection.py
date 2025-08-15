from pymongo import MongoClient
import certifi, os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment variables
MONGO_URI = os.getenv("MONGO_URI")

# Create MongoDB client with SSL certificate verification
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())

# Create database object
db = client[os.getenv("MONGO_DB_NAME", "civlens_db")]
