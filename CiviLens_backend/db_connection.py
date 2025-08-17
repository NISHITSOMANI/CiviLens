from pymongo import MongoClient
import certifi, os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment variables
MONGO_URI = os.getenv("MONGO_URI")

# Create MongoDB client with SSL certificate verification and short timeouts
# Shorter timeouts help the API fail fast with a clean 503 when network is down
client = MongoClient(
    MONGO_URI,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000,  # 5s to select a server
    connectTimeoutMS=5000,          # 5s to establish connections
    socketTimeoutMS=5000,           # 5s for socket operations
    retryWrites=True,
)

# Create database object
db = client[os.getenv("MONGO_DB_NAME", "civlens_db")]
