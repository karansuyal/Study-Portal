# fix_notes_display.py
import sqlite3

print("🔧 FIXING NOTES DISPLAY")
print("="*50)

def fix_notes():
    conn = sqlite3.connect('noteshub.db')
    cursor = conn.cursor()
    
    # 1. Check current notes
    print("📋 Current notes in database:")
    cursor.execute("SELECT id, title, material_type, subject_id FROM note")
    notes = cursor.fetchall()
    
    if len(notes) == 0:
        print("❌ No notes found in database!")
        
        # Add sample notes
        print("\n➕ Adding sample notes...")
        
        # Get first subject
        cursor.execute("SELECT id, name FROM subject LIMIT 1")
        subject = cursor.fetchone()
        
        if subject:
            subject_id, subject_name = subject
            
            sample_notes = [
                ("Complete Syllabus 2024", "Official syllabus with unit-wise distribution", "syllabus"),
                ("Complete Notes - Unit 1 to 5", "Handwritten notes with diagrams and examples", "notes"),
                ("PYQ 2020-2023", "Previous year questions with solutions", "pyq"),
                ("Important Questions Set 1", "Most expected questions for exams", "important_questions"),
                ("Complete Lab Manual", "All experiments with code and output", "lab_manual"),
                ("Semester Assignments", "All assignments with solutions", "assignment")
            ]
            
            for title, description, note_type in sample_notes:
                cursor.execute('''
                    INSERT INTO note 
                    (title, description, file_name, file_type, material_type, subject_id, is_approved, downloads, views)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    title,
                    description,
                    f"{subject_name.replace(' ', '_')}_{note_type}.pdf",
                    "pdf",
                    note_type,
                    subject_id,
                    1,
                    100,
                    250
                ))
            
            conn.commit()
            print(f"✅ Added 6 sample notes for {subject_name}")
        else:
            print("❌ No subjects found!")
    else:
        print(f"✅ Found {len(notes)} notes in database:")
        for note_id, title, material_type, subject_id in notes[:5]:
            print(f"   📄 {title} [{material_type}]")
    
    # 2. Check material_type values
    print("\n📊 Material types distribution:")
    cursor.execute("SELECT material_type, COUNT(*) FROM note GROUP BY material_type")
    for mat_type, count in cursor.fetchall():
        print(f"   {mat_type}: {count}")
    
    # 3. Verify frontend expects these material_type values
    print("\n🎯 Frontend expects these material types:")
    expected_types = ['notes', 'pyq', 'syllabus', 'important_questions', 'lab_manual', 'assignment']
    for t in expected_types:
        cursor.execute("SELECT COUNT(*) FROM note WHERE material_type = ?", (t,))
        count = cursor.fetchone()[0]
        print(f"   {t}: {count} {'✅' if count > 0 else '❌'}")
    
    conn.close()
    
    print("\n✨ Now check:")
    print("1. http://localhost:5000/api/notes")
    print("2. http://localhost:5000/ (website)")

if __name__ == "__main__":
    fix_notes()