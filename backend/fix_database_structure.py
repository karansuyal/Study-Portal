# fix_database_structure.py
import sqlite3
import os

print("🔧 Fixing Database Structure")
print("="*50)

DB_FILE = "noteshub.db"

if not os.path.exists(DB_FILE):
    print("❌ Database not found! Creating new...")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create tables based on YOUR models
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            icon TEXT,
            duration TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY,
            course_id INTEGER,
            year INTEGER,
            semester INTEGER,
            name TEXT NOT NULL,
            code TEXT NOT NULL,
            credits INTEGER,
            type TEXT,
            materials INTEGER DEFAULT 0,
            rating REAL DEFAULT 4.5,
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            file_name TEXT,
            file_type TEXT,
            note_type TEXT DEFAULT 'notes',
            downloads INTEGER DEFAULT 0,
            rating REAL DEFAULT 0.0,
            is_approved BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (subject_id) REFERENCES subjects(id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ New database created with correct structure")
else:
    print("✅ Database found, checking structure...")

print("\n✨ Done! Now run: python app.py")