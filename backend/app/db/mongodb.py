"""MongoDB connection setup - Simplified for local testing"""


class MongoDBManager:
    """Manages MongoDB connections"""
    
    @classmethod
    async def connect(cls):
        """Connect to MongoDB - Simplified for testing"""
        print("[WARNING] Running in test mode with in-memory storage")
        print("[WARNING] For production, configure real MongoDB connection")
    
    @classmethod
    async def disconnect(cls):
        """Disconnect from MongoDB"""
        print("[OK] Disconnected from test storage")


# Initialize connection
mongodb = MongoDBManager()
