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
    
    # ==================== METHOD 4: From environment variable credentials (Backup) ====================
    if not creds:
        creds_base64 = os.environ.get('GOOGLE_DRIVE_CREDENTIALS')
        if creds_base64:
            try:
                creds_json = base64.b64decode(creds_base64).decode('utf-8')
                creds_dict = json.loads(creds_json)
                
                # Extract installed credentials
                if 'installed' in creds_dict:
                    creds_dict = creds_dict['installed']
                
                creds = Credentials.from_authorized_user_info(creds_dict, SCOPES)
                print("✅ Loaded credentials from environment variable")
            except Exception as e:
                print(f"⚠️ Failed to load credentials from env: {e}")
    
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


def upload_to_drive(file_path, filename):
    """Upload file to Google Drive"""
    try:
        service = get_drive_service()
        if not service:
            print("⚠️ Google Drive service not available")
            return False
        
        # Create folder if not exists
        folder_id = get_or_create_folder(service, 'StudyPortal_Backup')
        
        # Upload file
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        media = MediaFileUpload(file_path, resumable=True)
        service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        
        print(f"✅ Google Drive: {filename}")
        return True
        
    except Exception as e:
        print(f"❌ Google Drive error: {e}")
        return False


def get_or_create_folder(service, name):
    """Get folder ID or create new"""
    query = f"name='{name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(q=query, fields="files(id)").execute()
    items = results.get('files', [])
    
    if items:
        return items[0]['id']
    
    # Create new folder
    file_metadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    file = service.files().create(body=file_metadata, fields='id').execute()
    print(f"📁 Created Google Drive folder: {name}")
    return file['id']


def check_drive_status():
    """Check if Google Drive is configured"""
    service = get_drive_service()
    if service:
        print("✅ Google Drive is configured and working")
        return True
    else:
        print("⚠️ Google Drive is not configured")
        return False


# Optional: Test function
if __name__ == '__main__':
    check_drive_status()