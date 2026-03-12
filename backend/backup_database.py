# backup_database_final.py
import os
import subprocess
import gzip
import shutil
from datetime import datetime

print("📦 Database Backup Script")
print("="*50)

# Create backup
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
backup_file = f"database_backup_{timestamp}.sql"
compressed_file = f"{backup_file}.gz"

# Database connection
DB_HOST = "dpg-d6ccdf14tr6s73dmn08g-a.singapore-postgres.render.com"
DB_USER = "studyportal_y002_user"
DB_NAME = "studyportal_y002"
DB_PASS = "psG64CVeS2vrWe6RFn1cKhvo1mXNun6s"

print(f"📦 Creating database backup: {backup_file}")

# Set password for pg_dump
env = os.environ.copy()
env['PGPASSWORD'] = DB_PASS

try:
    # Run pg_dump
    subprocess.run([
        "pg_dump",
        f"--host={DB_HOST}",
        f"--username={DB_USER}",
        f"--dbname={DB_NAME}",
        "--format=c",
        "--file=" + backup_file
    ], env=env, check=True)
    
    print(f"✅ Database dump created")
    
    # Compress
    with open(backup_file, 'rb') as f_in:
        with gzip.open(compressed_file, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
    
    print(f"✅ Backup compressed: {compressed_file}")
    print(f"\n📁 Backup saved locally: {compressed_file}")
    print(f"📊 File size: {os.path.getsize(compressed_file)} bytes")
    
    # Manual upload instructions
    print("\n" + "="*50)
    print("📤 MANUAL UPLOAD TO MEGA:")
    print("="*50)
    print(f"1. Go to: https://mega.nz/")
    print(f"2. Login with: suyalkaran441@gmail.com")
    print(f"3. Upload this file: {compressed_file}")
    print("="*50)
    
except Exception as e:
    print(f"❌ Error: {e}")