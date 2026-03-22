import os
import json
import base64
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']

def get_drive_service():
    """Get authenticated Google Drive service"""
    creds = None
    
    # ==================== METHOD 1: From Environment Variable (Render) ====================
    token_base64 = os.environ.get('GOOGLE_DRIVE_TOKEN')
    if token_base64:
        try:
            token_bytes = base64.b64decode(token_base64)
            creds = pickle.loads(token_bytes)
            print("✅ Loaded Google Drive token from environment variable")
        except Exception as e:
            print(f"⚠️ Failed to load token from env: {e}")
    
    # ==================== METHOD 2: From Local token.pickle ====================
    if not creds and os.path.exists('token.pickle'):
        try:
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
            print("✅ Loaded Google Drive token from local file")
        except Exception as e:
            print(f"⚠️ Failed to load token from file: {e}")
    
    # ==================== METHOD 3: From credentials.json (First Time Only) ====================
    if not creds and os.path.exists('credentials.json'):
        try:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
            print("✅ Created new Google Drive token from credentials.json")
            
            # Save for next time
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)
        except Exception as e:
            print(f"⚠️ Failed to create token from credentials.json: {e}")
    
    if not creds:
        print("⚠️ No Google Drive credentials available")
        return None
    
    # Refresh if expired
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            print("✅ Refreshed Google Drive token")
        except Exception as e:
            print(f"⚠️ Failed to refresh token: {e}")
    
    return build('drive', 'v3', credentials=creds)


def get_or_create_folder(service, name, parent_id=None):
    """
    Get folder ID or create new with optional parent
    Returns folder ID
    """
    # Build query
    query = f"name='{name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    if parent_id:
        query += f" and '{parent_id}' in parents"
    
    # Search for existing folder
    results = service.files().list(q=query, fields="files(id, name)", pageSize=10).execute()
    items = results.get('files', [])
    
    if items:
        return items[0]['id']
    
    # Create new folder
    file_metadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    if parent_id:
        file_metadata['parents'] = [parent_id]
    
    file = service.files().create(body=file_metadata, fields='id').execute()
    print(f"📁 Created folder: {name}")
    return file['id']


def upload_to_drive(file_path, filename, course=None, semester=None, subject=None, note_type=None):
    """
    Upload file to Google Drive with structured folder hierarchy:
    
    StudyPortal_Backup/
    ├── Course (e.g., BTECH, BCA, MBA)
    │   ├── Semester_X
    │   │   ├── Subject Name
    │   │   │   ├── notes/
    │   │   │   ├── pyq/
    │   │   │   ├── syllabus/
    │   │   │   ├── imp_questions/
    │   │   │   └── lab/
    │   │   │       └── filename.pdf
    """
    try:
        service = get_drive_service()
        if not service:
            print("⚠️ Google Drive service not available")
            return False
        
        # Root folder: StudyPortal_Backup
        root_folder_id = get_or_create_folder(service, 'StudyPortal_Backup')
        
        # Course folder (e.g., BTECH, BCA, MBA)
        course_name = course or 'General'
        course_folder_id = get_or_create_folder(service, course_name, root_folder_id)
        
        # Semester folder (e.g., Semester_1, Semester_2, etc.)
        semester_name = f"Semester_{semester}" if semester else 'General'
        semester_folder_id = get_or_create_folder(service, semester_name, course_folder_id)
        
        # Subject folder
        subject_name = subject or 'General'
        subject_folder_id = get_or_create_folder(service, subject_name, semester_folder_id)
        
        # Note type folder (notes, pyq, syllabus, imp_questions, lab, assignment)
        note_type_name = note_type or 'notes'
        type_folder_id = get_or_create_folder(service, note_type_name, subject_folder_id)
        
        # Upload file
        file_metadata = {
            'name': filename,
            'parents': [type_folder_id]
        }
        media = MediaFileUpload(file_path, resumable=True)
        service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        
        print(f"✅ Google Drive: {course_name}/{semester_name}/{subject_name}/{note_type_name}/{filename}")
        return True
        
    except Exception as e:
        print(f"❌ Google Drive error: {e}")
        return False


def upload_file_simple(file_path, filename):
    """
    Simple upload (without folder structure) - for backward compatibility
    """
    return upload_to_drive(file_path, filename)


def list_drive_files(folder_name=None):
    """List files in Google Drive (for debugging)"""
    try:
        service = get_drive_service()
        if not service:
            return []
        
        query = "trashed=false"
        if folder_name:
            query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
            results = service.files().list(q=query, fields="files(id)").execute()
            items = results.get('files', [])
            if items:
                folder_id = items[0]['id']
                query = f"'{folder_id}' in parents and trashed=false"
        
        results = service.files().list(q=query, fields="files(id, name, mimeType, parents)").execute()
        return results.get('files', [])
        
    except Exception as e:
        print(f"❌ Error listing files: {e}")
        return []


def check_drive_status():
    """Check if Google Drive is configured"""
    service = get_drive_service()
    if service:
        print("✅ Google Drive is configured and working")
        return True
    else:
        print("⚠️ Google Drive is not configured")
        return False


# ==================== TEST FUNCTIONS ====================

if __name__ == '__main__':
    print("=" * 50)
    print("Google Drive Integration Test")
    print("=" * 50)
    
    # Check status
    check_drive_status()
    
    # Test file upload
    test_file = "test_upload.txt"
    with open(test_file, 'w') as f:
        f.write("This is a test file for Google Drive structured upload")
    
    print("\n📤 Testing upload with structure...")
    upload_to_drive(
        test_file,
        "test_file.txt",
        course="BTECH",
        semester="1",
        subject="Computer Networks",
        note_type="notes"
    )
    
    # Clean up
    os.remove(test_file)
    print("\n✅ Test complete!")