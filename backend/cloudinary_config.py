# cloudinary_config.py
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv

load_dotenv()

def configure_cloudinary():
    """Cloudinary configuration"""
    cloudinary.config(
        cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
        api_key=os.environ.get('CLOUDINARY_API_KEY'),
        api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
        secure=True,
        timeout = 120 # HTTPS URLs
    )
    print("✅ Cloudinary configured successfully!")

# Test connection
def test_cloudinary_connection():
    try:
        result = cloudinary.api.ping()
        print(f"✅ Cloudinary connection: {result}")
        return True
    except Exception as e:
        print(f"❌ Cloudinary connection failed: {e}")
        return False