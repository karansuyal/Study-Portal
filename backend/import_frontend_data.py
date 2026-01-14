import requests
import json
import time
from datetime import datetime

# Backend API URLs
BASE_URL = "http://localhost:5000/api"
LOGIN_URL = f"{BASE_URL}/auth/login"
UPLOAD_URL = f"{BASE_URL}/upload"
BULK_UPLOAD_URL = f"{BASE_URL}/admin/bulk-upload"

# Your frontend data (copy from your coursesData)
frontend_data = {
    # Your complete coursesData object here
}

# Course mapping for backend
course_mapping = {
    1: {  # B.Tech CSE
        'program': 'Bachelor of Technology',
        'program_code': 'BTECH',
        'branch': 'Computer Science & Engineering', 
        'branch_code': 'CSE'
    },
    2: {  # BCA
        'program': 'Bachelor of Computer Applications',
        'program_code': 'BCA',
        'branch': 'General',
        'branch_code': 'BCA_GEN'
    },
    3: {  # BBA
        'program': 'Bachelor of Business Administration',
        'program_code': 'BBA',
        'branch': 'Finance',
        'branch_code': 'BBA_FIN'
    },
    4: {  # MBA
        'program': 'Master of Business Administration',
        'program_code': 'MBA',
        'branch': 'Finance',
        'branch_code': 'MBA_FIN'
    },
    5: {  # MCA
        'program': 'Master of Computer Applications',
        'program_code': 'MCA',
        'branch': 'General',
        'branch_code': 'MCA_GEN'
    }
}

def login_admin():
    """Login as admin and get token"""
    login_data = {
        "email": "admin@noteshub.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(LOGIN_URL, json=login_data)
        if response.status_code == 200:
            token = response.json()['access_token']
            print("✅ Login successful")
            return token
        else:
            print(f"❌ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return None

def create_sample_files():
    """Create sample PDF files for each subject"""
    import os
    sample_folder = "sample_notes"
    os.makedirs(sample_folder, exist_ok=True)
    
    sample_files = []
    
    # Create 5 sample PDFs
    for i in range(1, 6):
        filename = f"sample_notes_{i}.pdf"
        filepath = os.path.join(sample_folder, filename)
        
        # Create a simple PDF file (you can replace with real files)
        with open(filepath, 'w') as f:
            f.write(f"This is sample content for {filename}\n")
            f.write("Uploaded via automated script\n")
            f.write(f"Created on: {datetime.now()}")
        
        sample_files.append(filepath)
        print(f"📄 Created: {filename}")
    
    return sample_files

def upload_sample_note(token, subject_info, sample_file_path):
    """Upload a sample note for a subject"""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Prepare file
    with open(sample_file_path, 'rb') as f:
        files = {
            'file': (f'sample_note.pdf', f, 'application/pdf')
        }
        
        data = {
            'title': f'{subject_info["name"]} - Sample Notes',
            'description': f'Sample notes for {subject_info["name"]} ({subject_info["code"]})',
            'material_type': 'notes',
            'subject_id': str(subject_info.get('subject_id', 1))  # Default to first subject
        }
        
        try:
            response = requests.post(UPLOAD_URL, files=files, data=data, headers=headers)
            if response.status_code == 201:
                print(f"   ✅ Uploaded sample for {subject_info['name']}")
                return True
            else:
                print(f"   ❌ Failed: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False

def import_all_courses():
    """Import all courses from frontend data to backend"""
    
    print("="*70)
    print("🎓 IMPORTING FRONTEND COURSES DATA TO BACKEND")
    print("="*70)
    
    # 1. Login
    token = login_admin()
    if not token:
        return
    
    # 2. Create sample files
    print("\n📁 Creating sample files...")
    sample_files = create_sample_files()
    
    # 3. Import each course
    total_subjects = 0
    imported_count = 0
    
    for course_id, course_data in frontend_data.items():
        print(f"\n{'='*60}")
        print(f"📚 Processing: {course_data['name']}")
        print(f"{'='*60}")
        
        course_info = course_mapping.get(int(course_id), {})
        print(f"📊 Program: {course_info.get('program', 'Unknown')}")
        print(f"📊 Branch: {course_info.get('branch', 'Unknown')}")
        
        # Process each year and semester
        for year_id, year_data in course_data['years'].items():
            print(f"\n📅 Year {year_id}: {year_data['name']}")
            
            for sem_id, subjects in year_data['semesters'].items():
                print(f"  📖 Semester {sem_id}: {len(subjects)} subjects")
                
                for subject in subjects:
                    total_subjects += 1
                    print(f"    📘 {subject['code']}: {subject['name']} ({subject['type']})")
                    
                    # Prepare subject info
                    subject_info = {
                        'name': subject['name'],
                        'code': subject['code'],
                        'credits': subject['credits'],
                        'type': subject['type'],
                        'materials': subject['materials']
                    }
                    
                    # Upload sample note for this subject
                    if sample_files:
                        sample_file = sample_files[imported_count % len(sample_files)]
                        if upload_sample_note(token, subject_info, sample_file):
                            imported_count += 1
                    
                    # Small delay to avoid overwhelming the server
                    time.sleep(0.5)
    
    # Summary
    print(f"\n{'='*70}")
    print("📊 IMPORT SUMMARY")
    print("="*70)
    print(f"Total subjects in frontend: {total_subjects}")
    print(f"Sample notes uploaded: {imported_count}")
    print(f"\n✅ Data structure imported successfully!")
    print(f"\n🌐 Check your backend:")
    print(f"   • Programs: http://localhost:5000/api/programs")
    print(f"   • Subjects: http://localhost:5000/api/subjects")
    print(f"   • Notes: http://localhost:5000/api/notes")
    print("="*70)

def get_backend_subjects(token):
    """Get all subjects from backend to check mapping"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/subjects", headers=headers)
        if response.status_code == 200:
            subjects = response.json()['subjects']
            print(f"\n📋 Backend has {len(subjects)} subjects:")
            
            # Group by program
            programs = {}
            for subject in subjects:
                prog_name = subject.get('program_name', 'Unknown')
                if prog_name not in programs:
                    programs[prog_name] = []
                programs[prog_name].append(subject)
            
            for prog_name, prog_subjects in programs.items():
                print(f"\n  {prog_name}:")
                for subject in prog_subjects[:5]:  # Show first 5
                    print(f"    • {subject['code']}: {subject['name']}")
                if len(prog_subjects) > 5:
                    print(f"    • ... and {len(prog_subjects) - 5} more")
            
            return subjects
        else:
            print(f"❌ Failed to get subjects: {response.text}")
            return []
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

def bulk_import_real_files(token, folder_path):
    """Bulk import real PDF files from a folder"""
    import os
    from pathlib import Path
    
    headers = {"Authorization": f"Bearer {token}"}
    
    if not os.path.exists(folder_path):
        print(f"❌ Folder not found: {folder_path}")
        return
    
    # Get all PDF files
    pdf_files = []
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.lower().endswith('.pdf'):
                pdf_files.append(os.path.join(root, file))
    
    if not pdf_files:
        print("❌ No PDF files found in folder")
        return
    
    print(f"\n📁 Found {len(pdf_files)} PDF files")
    print("Starting bulk import...")
    
    # Process in batches of 5
    batch_size = 5
    imported = 0
    
    for i in range(0, len(pdf_files), batch_size):
        batch = pdf_files[i:i+batch_size]
        
        # Prepare files for upload
        files = []
        for filepath in batch:
            filename = os.path.basename(filepath)
            files.append(('files[]', (filename, open(filepath, 'rb'), 'application/pdf')))
        
        # Prepare form data
        data = {
            'material_type': 'notes',
            'program_id': '1',  # Default to B.Tech
        }
        
        try:
            response = requests.post(BULK_UPLOAD_URL, files=files, data=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                imported += result.get('counts', {}).get('successful', 0)
                print(f"✅ Batch {i//batch_size + 1}: {result.get('message')}")
            else:
                print(f"❌ Batch {i//batch_size + 1} failed: {response.text}")
        
        except Exception as e:
            print(f"❌ Error in batch {i//batch_size + 1}: {e}")
        
        finally:
            # Close all files
            for _, file_tuple in files:
                if len(file_tuple) > 1:
                    file_tuple[1].close()
        
        # Delay between batches
        time.sleep(2)
    
    print(f"\n🎯 Total imported: {imported} files")

if __name__ == "__main__":
    print("🎯 FRONTEND DATA IMPORT TOOL")
    print("="*50)
    print("Options:")
    print("1. Import course structure with sample files")
    print("2. Check existing backend subjects")
    print("3. Bulk import real PDF files from folder")
    print("4. Exit")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    token = login_admin()
    if not token:
        exit()
    
    if choice == "1":
        import_all_courses()
    elif choice == "2":
        get_backend_subjects(token)
    elif choice == "3":
        folder_path = input("Enter folder path containing PDFs: ").strip()
        bulk_import_real_files(token, folder_path)
    elif choice == "4":
        print("👋 Exiting...")
    else:
        print("❌ Invalid choice")