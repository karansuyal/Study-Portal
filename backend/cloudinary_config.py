"""
Cloudinary Configuration Module
"""
import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
from dotenv import load_dotenv 

# Load environment variables
load_dotenv()

def configure_cloudinary():
    """
    Configure Cloudinary with credentials from environment variables.
    Returns True if successful, False otherwise.
    """
    try:
        # Get credentials from environment
        cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
        api_key = os.environ.get('CLOUDINARY_API_KEY')
        api_secret = os.environ.get('CLOUDINARY_API_SECRET')
        
        # Validate credentials
        if not cloud_name or not api_key or not api_secret:
            print("⚠️  Cloudinary credentials missing. Check your .env file.")
            print(f"CLOUDINARY_CLOUD_NAME: {'✓' if cloud_name else '✗'}")
            print(f"CLOUDINARY_API_KEY: {'✓' if api_key else '✗'}")
            print(f"CLOUDINARY_API_SECRET: {'✓' if api_secret else '✗'}")
            return False
        
        # Configure Cloudinary
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        
        print("✅ Cloudinary configured successfully")
        return True
        
    except Exception as e:
        print(f"❌ Cloudinary configuration failed: {e}")
        return False

# Auto-configure when module loads
if __name__ != "__main__":
    configure_cloudinary()