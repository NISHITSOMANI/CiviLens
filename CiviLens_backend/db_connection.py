from pymongo import MongoClient
import certifi, os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment variables
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set. Create CiviLens_backend/.env with your MongoDB Atlas connection string. See ENVIRONMENT.md for details.")

# Allow overrides from env; keep sensible defaults suitable for Atlas
SERVER_SELECTION_TIMEOUT_MS = int(os.getenv("MONGO_SERVER_SELECTION_TIMEOUT_MS", "15000"))  # 15s
CONNECT_TIMEOUT_MS = int(os.getenv("MONGO_CONNECT_TIMEOUT_MS", "15000"))  # 15s
SOCKET_TIMEOUT_MS = int(os.getenv("MONGO_SOCKET_TIMEOUT_MS", "20000"))  # 20s
W_TIMEOUT_MS = int(os.getenv("MONGO_W_TIMEOUT_MS", "15000"))  # 15s write concern timeout

# Create MongoDB client with SSL certificate verification and robust timeouts
client = MongoClient(
    MONGO_URI,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=SERVER_SELECTION_TIMEOUT_MS,
    connectTimeoutMS=CONNECT_TIMEOUT_MS,
    socketTimeoutMS=SOCKET_TIMEOUT_MS,
    retryWrites=True,
    retryReads=True,
    wtimeoutMS=W_TIMEOUT_MS,
)

# Create database object
db = client[os.getenv("MONGO_DB_NAME", "civlens_db")]
