import os
import pickle
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']

def get_drive_service():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    
    return build('drive', 'v3', credentials=creds)

def upload_to_drive(file_path, filename):
    try:
        service = get_drive_service()
        
        # Create folder
        folder_id = get_or_create_folder(service, 'StudyPortal_Backup')
        
        # Upload
        file_metadata = {'name': filename, 'parents': [folder_id]}
        media = MediaFileUpload(file_path, resumable=True)
        service.files().create(body=file_metadata, media_body=media).execute()
        
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