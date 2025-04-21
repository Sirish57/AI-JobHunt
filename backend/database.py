import os
from pymongo import MongoClient, IndexModel
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

def get_mongo_client():
    try:
        # Try local MongoDB first
        local_uri = "mongodb://localhost:27017/"
        client = MongoClient(
            os.getenv("MONGO_URI", local_uri),
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=30000
        )
        
        # Test the connection
        client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        return client
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        return None

# Initialize connection
client = get_mongo_client()

if client is None:
    logger.error("Could not connect to MongoDB. Please check:")
    logger.error("1. Is MongoDB running? (try 'mongod' in terminal)")
    logger.error("2. Is the connection string correct?")
    logger.error("3. Are there any firewall restrictions?")
    # Continue with None client (will fail on DB operations)
else:
    db = client["ai_jobhunt"]

    # Initialize collections
    try:
        jobs_collection = db["jobs"]
        users_collection = db["users"]
        
        # Create indexes
        jobs_collection.create_indexes([
            IndexModel([("title", "text"), ("description", "text")]),
            IndexModel([("companyName", 1)]),
            IndexModel([("experienceLevel", 1)]),
            IndexModel([("contractType", 1)]),
            IndexModel([("workType", 1)]),
            IndexModel([("applicationsCount", 1)])
        ])
        
        users_collection.create_index([("email", 1)], unique=True)
        
        logger.info("Database collections initialized")
    except Exception as e:
        logger.error(f"Failed to initialize collections: {e}")