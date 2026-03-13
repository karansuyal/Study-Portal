# mega_storage.py
import os
from mega import Mega
import tempfile
import time
import uuid

class MegaStorage:
    def __init__(self):
        """Initialize MEGA client with proper error handling"""
        print("\n" + "="*60)
        print("🚀 MEGA STORAGE INITIALIZATION")
        print("="*60)
        
        self.mega = Mega()
        self.email = os.environ.get('MEGA_EMAIL')
        self.password = os.environ.get('MEGA_PASSWORD')
        self.api = None
        
        print(f"📧 Email from env: {self.email}")
        print(f"🔑 Password from env: {'*'*8 if self.password else 'NOT SET'}")
        
        if not self.email or not self.password:
            print("❌ MEGA credentials not found in environment variables!")
            print("Please set MEGA_EMAIL and MEGA_PASSWORD in Render dashboard")
            return
        
        self._login()
    
    def _login(self):
        """Login to MEGA with retry"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"🔑 Logging into MEGA (attempt {attempt+1}/{max_retries})...")
                self.api = self.mega.login(self.email, self.password)
                print(f"✅ Login successful!")
                
                # Get storage info
                storage = self.api.get_storage_space()
                print(f"💾 Total storage: {storage} bytes")
                return True
                
            except Exception as e:
                print(f"❌ Login failed: {e}")
                if attempt < max_retries - 1:
                    print(f"⏰ Retrying in 2 seconds...")
                    time.sleep(2)
        
        self.api = None
        return False
    
    def upload_file(self, file_data, filename, folder_path=None):
        """Upload file to MEGA and return public link"""
        if not self.api:
            return {'success': False, 'error': 'Not logged in to MEGA'}
        
        temp_path = None
        try:
            # Create temp file
            temp_dir = tempfile.gettempdir()
            temp_filename = f"{uuid.uuid4().hex}_{filename}"
            temp_path = os.path.join(temp_dir, temp_filename)
            
            # Save file data
            with open(temp_path, 'wb') as f:
                f.write(file_data)
            
            print(f"📤 Uploading: {filename}")
            
            # Upload to MEGA (with optional folder)
            if folder_path:
                # Create folder structure if needed
                try:
                    # Navigate to/create folder
                    folders = folder_path.split('/')
                    current_node = None
                    
                    for folder in folders:
                        if not folder:
                            continue
                        try:
                            # Check if folder exists
                            folder_node = self.api.find(folder)
                            if folder_node:
                                current_node = folder_node[0] if isinstance(folder_node, list) else folder_node
                            else:
                                # Create folder
                                if current_node:
                                    current_node = self.api.create_folder(folder, current_node)
                                else:
                                    current_node = self.api.create_folder(folder)
                                # Handle return format
                                if isinstance(current_node, list):
                                    current_node = current_node[0]
                        except Exception as e:
                            print(f"⚠️ Folder warning: {e}")
                    
                    # Upload to folder
                    self.api.upload(temp_path, dest=current_node)
                except Exception as e:
                    print(f"⚠️ Folder upload failed, uploading to root: {e}")
                    self.api.upload(temp_path)
            else:
                # Upload to root
                self.api.upload(temp_path)
            
            # Wait for file to register
            time.sleep(2)
            
            # Get public link with retry
            link = None
            for attempt in range(3):
                try:
                    # Try to find by filename
                    file_node = self.api.find(filename)
                    if file_node:
                        if isinstance(file_node, list):
                            file_node = file_node[0]
                        link = self.api.get_link(file_node)
                        break
                except:
                    time.sleep(1)
            
            if not link:
                # Try to find in recent files
                files = self.api.get_files()
                for file_id, info in files.items():
                    if info.get('a', {}).get('n') == filename:
                        try:
                            link = self.api.get_link(info)
                            break
                        except:
                            continue
            
            if not link:
                return {'success': False, 'error': 'File uploaded but link generation failed'}
            
            print(f"✅ Upload complete!")
            print(f"🔗 Link: {link}")
            
            return {
                'success': True,
                'download_link': link,
                'file_name': filename
            }
            
        except Exception as e:
            print(f"❌ Upload error: {e}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': str(e)}
        
        finally:
            # Clean up temp file
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except:
                    pass