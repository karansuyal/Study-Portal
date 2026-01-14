import os
import sqlite3
from datetime import datetime
import uuid

# Database connection
conn = sqlite3.connect('instance/noteshub.db')
cursor = conn.cursor()

def scan_and_register_files():
    """Scan uploads folder and register files in database"""
    
    base_path = 'uploads/courses'
    
    print("🔍 Scanning for files in:", os.path.abspath(base_path))
    print("="*60)
    
    total_files = 0
    registered = 0
    
    # Walk through all files
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith(('.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.jpg', '.jpeg', '.png')):
                total_files += 1
                file_path = os.path.join(root, file)
                
                # Extract information from folder structure
                # uploads/courses/B_Tech/Semester_1/Design_Thinking/notes/filename.pdf
                parts = file_path.split(os.sep)
                
                if len(parts) >= 6:
                    course_folder = parts[2]  # B_Tech
                    semester_folder = parts[3]  # Semester_1
                    subject_folder = parts[4]   # Design_Thinking
                    material_type = parts[5]    # notes
                    
                    # Convert folder names to actual names
                    course_name = course_folder.replace('_', ' ')
                    semester = semester_folder.replace('Semester_', '')
                    subject_name = subject_folder.replace('_', ' ')
                    
                    # Generate a title from filename
                    title = file.replace('.pdf', '').replace('.docx', '').replace('_', ' ').title()
                    
                    # Check if already in database
                    cursor.execute('''
                        SELECT id FROM study_materials 
                        WHERE file_path = ? OR original_filename = ?
                    ''', (file_path, file))
                    
                    if cursor.fetchone():
                        print(f"⏭️  Already exists: {file}")
                    else:
                        # Get file info
                        file_size = os.path.getsize(file_path)
                        file_ext = file.split('.')[-1].lower()
                        
                        # Get admin user id
                        cursor.execute('SELECT id FROM users WHERE email = ?', ('admin@noteshub.com',))
                        admin = cursor.fetchone()
                        
                        if admin:
                            user_id = admin[0]
                            
                            # Get or create course
                            cursor.execute('SELECT id FROM courses WHERE name LIKE ?', (f'%{course_name}%',))
                            course = cursor.fetchone()
                            
                            if not course:
                                # Create new course
                                cursor.execute('''
                                    INSERT INTO courses (name, branch, semester, code, created_at)
                                    VALUES (?, ?, ?, ?, ?)
                                ''', (
                                    course_name,
                                    course_name.split()[0] if ' ' in course_name else course_name,
                                    int(semester),
                                    f'{course_folder}_001',
                                    datetime.now().isoformat()
                                ))
                                course_id = cursor.lastrowid
                            else:
                                course_id = course[0]
                            
                            # Get or create subject
                            cursor.execute('''
                                SELECT id FROM subjects 
                                WHERE name LIKE ? AND course_id = ? AND semester = ?
                            ''', (f'%{subject_name}%', course_id, int(semester)))
                            
                            subject = cursor.fetchone()
                            
                            if not subject:
                                cursor.execute('''
                                    INSERT INTO subjects (name, code, semester, course_id)
                                    VALUES (?, ?, ?, ?)
                                ''', (
                                    subject_name,
                                    f'{course_folder[:3]}_{semester}_{subject_name[:3]}',
                                    int(semester),
                                    course_id
                                ))
                                subject_id = cursor.lastrowid
                            else:
                                subject_id = subject[0]
                            
                            # Insert into study_materials
                            cursor.execute('''
                                INSERT INTO study_materials (
                                    title, description, file_name, original_filename,
                                    file_path, file_type, file_size, material_type,
                                    status, downloads, views, uploaded_at, approved_at,
                                    subject_id, user_id
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ''', (
                                title,
                                f'Auto-registered from manual upload - {subject_name}',
                                f'auto_{uuid.uuid4().hex[:8]}.{file_ext}',
                                file,
                                file_path,
                                file_ext,
                                file_size,
                                material_type,
                                'approved',
                                0,
                                0,
                                datetime.now().isoformat(),
                                datetime.now().isoformat(),
                                subject_id,
                                user_id
                            ))
                            
                            registered += 1
                            print(f"✅ Registered: {course_name} > Sem {semester} > {subject_name} > {material_type} > {file}")
    
    conn.commit()
    print("\n" + "="*60)
    print(f"📊 Scan Complete!")
    print(f"📁 Total files found: {total_files}")
    print(f"✅ Newly registered: {registered}")
    print(f"📝 Already in database: {total_files - registered}")

if __name__ == '__main__':
    scan_and_register_files()
    conn.close()