# smart_upload.py
import sqlite3
import os

print("🎯 SMART UPLOAD - SUBJECT WISE")
print("="*50)

def smart_upload():
    conn = sqlite3.connect('noteshub.db')
    cursor = conn.cursor()
    
    # Get path
    path = input("Enter file or folder path: ").strip()
    
    if not os.path.exists(path):
        print("❌ Path not found!")
        return
    
    # Get files
    if os.path.isfile(path):
        files = [path]
    elif os.path.isdir(path):
        files = [os.path.join(path, f) for f in os.listdir(path) if f.lower().endswith('.pdf')]
    else:
        print("❌ Invalid path!")
        return
    
    print(f"\n📁 Found {len(files)} PDF files")
    
    # Group subjects by course and semester
    print("\n📚 ORGANIZED BY COURSE & SEMESTER:")
    print("="*50)
    
    courses = {
        1: "B.Tech (Computer Science)",
        2: "BCA", 
        3: "BBA",
        4: "MBA",
        5: "MCA"
    }
    
    for course_id, course_name in courses.items():
        print(f"\n{course_name}:")
        print("-" * 30)
        
        # Get subjects for this course
        cursor.execute('''
            SELECT id, name, code, semester 
            FROM subject 
            WHERE program_id = ? 
            ORDER BY semester, name
        ''', (course_id,))
        
        subjects = cursor.fetchall()
        
        # Group by semester
        semesters = {}
        for subject_id, name, code, semester in subjects:
            if semester not in semesters:
                semesters[semester] = []
            semesters[semester].append((subject_id, name, code))
        
        # Display
        for sem in sorted(semesters.keys()):
            print(f"\n  Semester {sem}:")
            for subject_id, name, code in semesters[sem]:
                print(f"    - {name} ({code}) [ID: {subject_id}]")
    
    # Now upload each file
    print("\n" + "="*50)
    print("📤 UPLOADING FILES")
    print("="*50)
    
    uploaded = 0
    
    for file_path in files:
        file_name = os.path.basename(file_path)
        print(f"\n📄 File: {file_name}")
        
        # Ask which course
        print("\nSelect Course:")
        for i, (course_id, course_name) in enumerate(courses.items(), 1):
            print(f"  {i}. {course_name}")
        
        try:
            course_choice = int(input("Enter course number: "))
            if not 1 <= course_choice <= len(courses):
                print("❌ Invalid choice")
                continue
        except:
            print("❌ Invalid input")
            continue
        
        course_id = list(courses.keys())[course_choice-1]
        
        # Get subjects for selected course
        cursor.execute('''
            SELECT id, name, code, semester 
            FROM subject 
            WHERE program_id = ? 
            ORDER BY semester, name
        ''', (course_id,))
        
        subjects = cursor.fetchall()
        
        print(f"\nSubjects for {courses[course_id]}:")
        print("-" * 40)
        
        for i, (subject_id, name, code, semester) in enumerate(subjects, 1):
            print(f"{i:3}. Sem {semester}: {name} ({code})")
        
        # Select subject
        try:
            subject_choice = int(input("\nSelect subject number: "))
            if not 1 <= subject_choice <= len(subjects):
                print("❌ Invalid choice")
                continue
        except:
            print("❌ Invalid input")
            continue
        
        subject_id, subject_name, code, semester = subjects[subject_choice-1]
        
        # Select note type
        print("\n📄 Note Type:")
        print("  1. Notes")
        print("  2. Previous Year Questions (PYQ)")
        print("  3. Syllabus") 
        print("  4. Important Questions")
        
        type_map = {
            '1': 'notes',
            '2': 'pyq', 
            '3': 'syllabus',
            '4': 'important_questions'
        }
        
        type_choice = input("Select type (1-4): ").strip()
        note_type = type_map.get(type_choice, 'notes')
        
        # Get title
        default_title = f"{subject_name} - {note_type.replace('_', ' ').title()}"
        title = input(f"Title [{default_title}]: ").strip() or default_title
        
        # Upload
        cursor.execute('''
            INSERT INTO note 
            (title, description, file_name, file_type, material_type, subject_id, is_approved)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            title,
            f"{note_type} for {subject_name} (Sem {semester})",
            file_name,
            'pdf',
            note_type,
            subject_id,
            1
        ))
        
        uploaded += 1
        print(f"✅ Uploaded to: {courses[course_id]} - Sem {semester}")
        print(f"   Subject: {subject_name}")
        print(f"   Type: {note_type}")
    
    conn.commit()
    print(f"\n✨ Successfully uploaded {uploaded}/{len(files)} files")
    conn.close()

if __name__ == "__main__":
    smart_upload()