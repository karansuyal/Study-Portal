# mega_storage.py
import os
from mega import Mega
import uuid
import time

class MegaStorage:
    def __init__(self):
        print("\n" + "="*60)
        print("🚀 MegaStorage INITIALIZING...")
        print("="*60)
        
        self.mega = Mega()
        self.email = os.environ.get('MEGA_EMAIL')
        self.password = os.environ.get('MEGA_PASSWORD')
        
        print(f"📧 MEGA_EMAIL from env: {self.email}")
        print(f"🔑 MEGA_PASSWORD from env: {'*'*8 if self.password else 'NOT SET'}")
        
        if not self.email or not self.password:
            print("❌ CRITICAL: MEGA credentials missing!")
            self.api = None
            return
        
        self.api = None
        self.login()
    
    def login(self):
        """MEGA login with retry"""
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                print(f"🔑 Attempting MEGA login (attempt {attempt+1}/{max_retries})...")
                self.api = self.mega.login(self.email, self.password)
                print(f"✅ Login successful!")
                return True
            except Exception as e:
                print(f"❌ Login failed: {e}")
                if attempt < max_retries - 1:
                    print(f"⏰ Retrying in {retry_delay}s...")
                    time.sleep(retry_delay)
                else:
                    print("❌ All login attempts failed")
                    self.api = None
                    return False
    
    def upload_file(self, file_data, filename, folder_path=None):
        """File upload karo MEGA par"""
        if not self.api:
            print("❌ Cannot upload: Not logged in to MEGA")
            return {'success': False, 'error': 'Not logged in to MEGA'}
        
        try:
            # Temp file banao
            temp_path = f"/tmp/{uuid.uuid4()}_{filename}"
            with open(temp_path, 'wb') as f:
                f.write(file_data)
            
            print(f"📤 Uploading: {filename}")
            
            # Upload file
            if folder_path:
                # Folder mein upload karo
                folder_node = self.create_folder_structure(folder_path)
                if folder_node:
                    folder_id = folder_node[0] if isinstance(folder_node, list) else folder_node
                    uploaded_file = self.api.upload(temp_path, dest=folder_id)
                else:
                    uploaded_file = self.api.upload(temp_path)
            else:
                uploaded_file = self.api.upload(temp_path)
            
            # Get public link
            file_node = self.api.find(filename)
            if isinstance(file_node, list):
                file_node = file_node[0]
            public_link = self.api.get_link(file_node)
            
            # Cleanup
            os.remove(temp_path)
            
            print(f"✅ Upload complete! Link: {public_link}")
            return {
                'success': True,
                'file_name': filename,
                'download_link': public_link
            }
            
        except Exception as e:
            print(f"❌ Upload failed: {e}")
            return {'success': False, 'error': str(e)}
    
    def create_folder_structure(self, folder_path):
        """Folder structure create karo"""
        if not self.api:
            return None
        try:
            folders = folder_path.split('/')
            current = None
            for folder in folders:
                if folder:
                    try:
                        existing = self.api.find(folder)
                        if existing:
                            current = existing
                        else:
                            current = self.api.create_folder(folder, current)
                    except:
                        current = self.api.create_folder(folder, current)
            return current
        except Exception as e:
            print(f"❌ Folder creation error: {e}")
            return None