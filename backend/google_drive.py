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
    
    # Check if token exists
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Try from environment variable
            creds_base64 = os.environ.get('GOOGLE_DRIVE_CREDENTIALS')
            if creds_base64:
                try:
                    creds_json = base64.b64decode(creds_base64).decode('utf-8')
                    creds_dict = json.loads(creds_json)
                    
                    # Extract installed credentials
                    if 'installed' in creds_dict:
                        creds_dict = creds_dict['installed']
                    
                    # Create credentials object
                    creds = Credentials.from_authorized_user_info(creds_dict, SCOPES)
                except Exception as e:
                    print(f"⚠️ Failed to load credentials from env: {e}")
            
            # Fallback to file
            if not creds and os.path.exists('credentials.json'):
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            
            if not creds:
                print("⚠️ No Google Drive credentials available")
                return None
            
            # Save token
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
        
        folder_id = get_or_create_folder(service, 'StudyPortal_Backup')
        
        file_metadata = {'name': filename, 'parents': [folder_id]}
        media = MediaFileUpload(file_path, resumable=True)
        service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        
        print(f"✅ Google Drive: {filename}")
        return True
        
    except Exception as e:
        print(f"❌ Google Drive error: {e}")
        return False

def get_or_create_folder(service, name):
    query = f"name='{name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(q=query, fields="files(id)").execute()
    items = results.get('files', [])
    if items:
        return items[0]['id']
    file_metadata = {'name': name, 'mimeType': 'application/vnd.google-apps.folder'}
    file = service.files().create(body=file_metadata, fields='id').execute()
    return file['id']