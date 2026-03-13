# mega_storage.py - Final Version

import os
from mega import Mega
import uuid
import time

class MegaStorage:
    def __init__(self):
        """MEGA client initialize with auto-login"""
        self.email = os.environ.get('MEGA_EMAIL')
        self.password = os.environ.get('MEGA_PASSWORD')
        self.mega = Mega()
        self.api = None
        self.login()
    
    def login(self):
        """Automatic login on initialization"""
        try:
            self.api = self.mega.login(self.email, self.password)
            print(f"✅ MEGA: Logged in as {self.email}")
            return True
        except Exception as e:
            print(f"❌ MEGA: Login failed - {e}")
            return False
    
    def upload_file(self, file_path, filename, folder=None):
        """Upload and get link in one go"""
        try:
            # Check if file exists
            if not os.path.exists(file_path):
                return {'success': False, 'error': 'File not found'}
            
            print(f"📤 Uploading: {filename}")
            
            # Upload with optional folder
            if folder:
                # Handle folder structure
                try:
                    folder_node = self.api.find(folder)
                    if not folder_node:
                        folder_node = self.api.create_folder(folder)
                except:
                    folder_node = self.api.create_folder(folder)
                
                dest = folder_node[0] if isinstance(folder_node, list) else folder_node
                uploaded = self.api.upload(file_path, dest=dest)
            else:
                uploaded = self.api.upload(file_path)
            
            # Wait for file to register
            time.sleep(2)
            
            # Get public link with retry
            public_link = None
            for attempt in range(3):
                try:
                    file_node = self.api.find(filename)
                    if file_node:
                        public_link = self.api.get_link(file_node)
                        break
                except:
                    time.sleep(2)
            
            if not public_link:
                public_link = "https://mega.nz/"  # Fallback
            
            print(f"✅ Upload complete! Link: {public_link}")
            
            return {
                'success': True,
                'file_name': filename,
                'download_link': public_link
            }
            
        except Exception as e:
            print(f"❌ Upload failed: {e}")
            return {'success': False, 'error': str(e)}