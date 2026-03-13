# mega_storage.py - FINAL WORKING VERSION
import os
import tempfile
import time
import uuid
from mega import Mega

class MegaStorage:
    def __init__(self):
        """Initialize MEGA client"""
        print("\n" + "="*60)
        print("🚀 Initializing MegaStorage...")
        print("="*60)
        
        self.mega = Mega()
        self.email = os.environ.get('MEGA_EMAIL')
        self.password = os.environ.get('MEGA_PASSWORD')
        self.api = None
        
        print(f"📧 Email: {self.email}")
        print(f"🔑 Password: {'*'*8 if self.password else 'Not set'}")
        
        if not self.email or not self.password:
            print("❌ ERROR: MEGA credentials missing!")
            return
        
        self.login()
    
    def login(self):
        """Login to MEGA"""
        try:
            print("🔑 Logging in...")
            self.api = self.mega.login(self.email, self.password)
            print("✅ Login successful!")
            return True
        except Exception as e:
            print(f"❌ Login failed: {e}")
            self.api = None
            return False
    
    def ensure_folder(self, folder_path):
        """Ensure folder exists, create if not"""
        if not self.api:
            return None
            
        try:
            folders = folder_path.split('/')
            current = None
            
            for folder in folders:
                if not folder:
                    continue
                    
                # Check if folder exists
                try:
                    existing = self.api.find(folder)
                    if existing:
                        current = existing[0] if isinstance(existing, list) else existing
                        continue
                except:
                    pass
                
                # Create folder
                if current:
                    current = self.api.create_folder(folder, current)
                else:
                    current = self.api.create_folder(folder)
                    
                # Handle return format
                if isinstance(current, list):
                    current = current[0]
                    
            return current
            
        except Exception as e:
            print(f"⚠️ Folder warning: {e}")
            return None
    
    def upload_file(self, file_data, filename, folder_path=None):
        """
        Upload file to MEGA and return public link
        file_data: bytes or file path
        filename: name to save as
        folder_path: optional folder structure
        """
        if not self.api:
            return {'success': False, 'error': 'Not logged in to MEGA'}
        
        temp_path = None
        try:
            # Handle input type
            if isinstance(file_data, bytes):
                # Create temp file
                temp_dir = tempfile.gettempdir()
                temp_name = f"{uuid.uuid4().hex[:8]}_{filename}"
                temp_path = os.path.join(temp_dir, temp_name)
                
                with open(temp_path, 'wb') as f:
                    f.write(file_data)
                print(f"📝 Temp file created: {temp_path}")
                upload_path = temp_path
            else:
                upload_path = file_data
            
            # Determine upload destination
            if folder_path:
                print(f"📁 Target folder: {folder_path}")
                folder_node = self.ensure_folder(folder_path)
                if folder_node:
                    # Upload to folder
                    dest = folder_node if not isinstance(folder_node, list) else folder_node[0]
                    uploaded = self.api.upload(upload_path, dest=dest)
                else:
                    # Fallback to root
                    print("⚠️ Folder creation failed, uploading to root")
                    uploaded = self.api.upload(upload_path)
            else:
                # Upload to root
                uploaded = self.api.upload(upload_path)
            
            # Wait for file to register
            time.sleep(2)
            
            # Get public link
            public_link = None
            for attempt in range(3):
                try:
                    file_node = self.api.find(filename)
                    if file_node:
                        if isinstance(file_node, list):
                            file_node = file_node[0]
                        public_link = self.api.get_link(file_node)
                        break
                except:
                    time.sleep(1)
            
            if not public_link:
                # Fallback - try to get from recent uploads
                files = self.api.get_files()
                for file_id, info in files.items():
                    if info.get('a', {}).get('n') == filename:
                        public_link = self.api.get_link(info)
                        break
            
            if not public_link:
                public_link = "https://mega.nz/"
                print("⚠️ Could not generate link")
            
            print(f"✅ Upload complete!")
            print(f"🔗 Link: {public_link}")
            
            return {
                'success': True,
                'file_name': filename,
                'download_link': public_link
            }
            
        except Exception as e:
            print(f"❌ Upload error: {e}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': str(e)}
            
        finally:
            # Cleanup temp file
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except:
                    pass