# migrate_to_mega.py
import os
import psycopg2
from mega import Mega
import traceback
import time
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Database connection with retry logic
def get_db(retries=3, delay=5):
    for attempt in range(retries):
        try:
            db_url = os.environ.get('DATABASE_URL')
            if not db_url:
                print("❌ DATABASE_URL environment variable not set")
                return None
            
            print(f"🔌 Connecting to database (attempt {attempt + 1}/{retries})...")
            
            # Parse connection string
            if db_url.startswith('postgres://'):
                db_url = db_url.replace('postgres://', 'postgresql://', 1)
            
            # Add SSL mode if not present
            if 'sslmode' not in db_url:
                if '?' in db_url:
                    db_url += '&sslmode=require'
                else:
                    db_url += '?sslmode=require'
            
            # Add timeout parameters
            if 'connect_timeout' not in db_url:
                db_url += '&connect_timeout=30'
            
            # Connect with extended parameters
            conn = psycopg2.connect(
                db_url,
                keepalives=1,
                keepalives_idle=30,
                keepalives_interval=10,
                keepalives_count=5,
                connect_timeout=30
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            print("✅ Database connected!")
            return conn
            
        except Exception as e:
            print(f"❌ Attempt {attempt + 1} failed: {e}")
            if attempt < retries - 1:
                print(f"⏰ Waiting {delay} seconds before retry...")
                time.sleep(delay)
            else:
                print("❌ All connection attempts failed")
                return None
    return None

# MEGA login
print("\n🔑 Logging into MEGA...")
try:
    from mega import Mega
    mega = Mega()
    api = mega.login(os.environ.get('MEGA_EMAIL'), os.environ.get('MEGA_PASSWORD'))
    print("✅ MEGA login successful!")
except Exception as e:
    print(f"❌ MEGA login failed: {e}")
    exit(1)

# Connect to database with retry
conn = get_db()
if not conn:
    print("❌ Cannot proceed without database connection")
    exit(1)

cur = conn.cursor()

# Get all notes without mega_link
print("\n📊 Fetching notes from database...")
cur.execute("""
    SELECT id, title, file_path, original_filename, course_id, subject_id, note_type
    FROM notes 
    WHERE mega_link IS NULL
""")

notes = cur.fetchall()
print(f"📊 Found {len(notes)} notes to migrate")

if len(notes) == 0:
    print("✅ All notes already have mega_link!")
    exit(0)

# Upload each file
success_count = 0
fail_count = 0

for i, note in enumerate(notes, 1):
    note_id, title, file_path, filename, course_id, subject_id, note_type = note
    
    print(f"\n[{i}/{len(notes)}] 📤 Migrating: {filename}")
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"   ❌ File not found: {file_path}")
        
        # Try to find in common locations
        possible_paths = [
            file_path,
            os.path.join('uploads', filename),
            os.path.join('uploads', str(course_id), filename),
            os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', filename)
        ]
        
        found = False
        for alt_path in possible_paths:
            if os.path.exists(alt_path):
                file_path = alt_path
                found = True
                print(f"   ✅ Found at: {file_path}")
                break
        
        if not found:
            print(f"   ❌ File not found anywhere!")
            fail_count += 1
            continue
    
    # Read file
    try:
        with open(file_path, 'rb') as f:
            file_data = f.read()
        print(f"   📦 File size: {len(file_data)} bytes")
    except Exception as e:
        print(f"   ❌ Cannot read file: {e}")
        fail_count += 1
        continue
    
    # Upload to MEGA
    try:
        # Upload file
        uploaded_file = api.upload(file_path)
        print(f"   ✅ Uploaded to MEGA")
        
        # Get file node and link
        file_node = api.find(filename)
        link = api.get_link(file_node)
        
        # Update database
        cur.execute(
            "UPDATE notes SET mega_link = %s WHERE id = %s",
            (link, note_id)
        )
        conn.commit()
        
        print(f"   🔗 Link: {link}")
        success_count += 1
        
    except Exception as e:
        print(f"   ❌ Upload failed: {e}")
        fail_count += 1
        continue

# Summary
print("\n" + "="*60)
print("📊 MIGRATION SUMMARY")
print("="*60)
print(f"✅ Success: {success_count}")
print(f"❌ Failed: {fail_count}")
print(f"📦 Total: {len(notes)}")

cur.close()
conn.close()
print("\n✅ Migration script completed!")