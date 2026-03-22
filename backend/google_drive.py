import os
import json
import base64
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']

def get_credentials_from_env():
    """Get credentials from environment variable"""
    creds_base64 = os.environ.get('GOOGLE_DRIVE_CREDENTIALS')
    if not creds_base64:
        return None
    
    try:
        creds_json = base64.b64decode(creds_base64).decode('utf-8')
        creds_dict = json.loads(creds_json)
        return creds_dict
    except Exception as e:
        print(f"⚠️ Failed to decode credentials: {e}")
        return None

def get_drive_service():
    """Get authenticated Google Drive service"""
    creds = None
    
    # Check if token exists
    if os.path.exists('token.pickle'):
        import pickle
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    # If no valid credentials, try from env or file
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Try from environment variable first
            creds_dict = get_credentials_from_env()
            if creds_dict:
                creds = Credentials.from_authorized_user_info(creds_dict, SCOPES)
            elif os.path.exists('credentials.json'):
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            else:
                print("⚠️ No Google Drive credentials found")
                return None
        
        # Save token
        import pickle
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    
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
    file_metadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    file = service.files().create(body=file_metadata, fields='id').execute()
    return file['id']