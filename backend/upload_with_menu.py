# upload_with_menu.py
import sqlite3
import os

print("🎯 UPLOAD WITH MENU SELECTION")
print("="*50)

def upload_with_menu():
    conn = sqlite3.connect('noteshub.db')
    cursor = conn.cursor()
    
    # File path
    file_path = input("Enter PDF file path: ").strip()
    
    if not os.path.exists(file_path):
        print("❌ File not found!")
        return
    
    if not file_path.lower().endswith('.pdf'):
        print("❌ Only PDF files allowed!")
        return
    
    file_name = os.path.basename(file_path)
    print(f"\n📄 File: {file_name}")
    
    # COURSE SELECTION
    print("\n📚 SELECT COURSE:")
    print("1. B.Tech (Computer Science)")
    print("2. BCA")
    print("3. BBA")
    print("4. MBA")
    print("5. MCA")
    
    course_choice = input("\nSelect course (1-5): ").strip()
    course_map = {'1': 1, '2': 2, '3': 3, '4': 4, '5': 5}
    course_id = course_map.get(course_choice)
    
    if not course_id:
        print("❌ Invalid course selection!")
        return
    
    # Get course name
    cursor.execute("SELECT name FROM program WHERE id = ?", (course_id,))
    course_name = cursor.fetchone()[0]
    print(f"\n✅ Selected: {course_name}")
    
    # GET SUBJECTS FOR SELECTED COURSE
    cursor.execute('''
        SELECT id, name, code, semester 
        FROM subject 
        WHERE program_id = ? 
        ORDER BY semester, name
    ''', (course_id,))
    
    subjects = cursor.fetchall()
    
    # Display organized by semester
    print(f"\n📘 SUBJECTS FOR {course_name}:")
    print("="*40)
    
    current_semester = None
    subject_list = []
    
    for i, (subject_id, name, code, semester) in enumerate(subjects, 1):
        if semester != current_semester:
            print(f"\nSemester {semester}:")
            print("-" * 30)
            current_semester = semester
        
        print(f"{i:3}. {name} ({code})")
        subject_list.append((subject_id, name, code, semester))
    
    # SUBJECT SELECTION
    try:
        subject_num = int(input(f"\nSelect subject (1-{len(subject_list)}): "))
        if 1 <= subject_num <= len(subject_list):
            subject_id, subject_name, code, semester = subject_list[subject_num-1]
            print(f"\n✅ Selected: {subject_name} (Semester {semester})")
        else:
            print("❌ Invalid subject selection!")
            return
    except:
        print("❌ Please enter a valid number!")
        return
    
    # NOTE TYPE SELECTION
    print("\n📄 SELECT NOTE TYPE:")
    print("1. Notes (Regular study material)")
    print("2. PYQ (Previous Year Questions)")
    print("3. Syllabus (Course syllabus)")
    print("4. Important Questions (Exam important questions)")
    
    type_map = {
        '1': ('notes', 'Notes'),
        '2': ('pyq', 'Previous Year Questions'),
        '3': ('syllabus', 'Syllabus'),
        '4': ('important_questions', 'Important Questions')
    }
    
    type_choice = input("\nSelect type (1-4): ").strip()
    if type_choice not in type_map:
        print("❌ Invalid type selection!")
        return
    
    note_type, type_name = type_map[type_choice]
    
    # TITLE
    default_title = f"{subject_name} - {type_name}"
    title = input(f"\nEnter title [{default_title}]: ").strip() or default_title
    
    # DESCRIPTION
    default_desc = f"{type_name} for {subject_name} (Semester {semester}) - {course_name}"
    description = input(f"Enter description [{default_desc}]: ").strip() or default_desc
    
    # UPLOAD
    cursor.execute('''
        INSERT INTO note 
        (title, description, file_name, file_type, material_type, subject_id, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        title,
        description,
        file_name,
        'pdf',
        note_type,
        subject_id,
        1
    ))
    
    conn.commit()
    
    print(f"\n✅ FILE UPLOADED SUCCESSFULLY!")
    print(f"   📚 Course: {course_name}")
    print(f"   📘 Subject: {subject_name} (Sem {semester})")
    print(f"   📄 Type: {type_name}")
    print(f"   📁 File: {file_name}")
    print(f"   📝 Title: {title}")
    
    conn.close()

if __name__ == "__main__":
    upload_with_menu()