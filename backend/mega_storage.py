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
    
    def create_folder_structure(self, folder_path):
        """
        Folder structure create karo with proper error handling
        Returns folder node or None
        """
        if not self.api:
            print("❌ Cannot create folder: Not logged in to MEGA")
            return None
            
        try:
            print(f"📁 Creating folder structure: {folder_path}")
            folders = folder_path.split('/')
            current_node = None
            
            for folder_name in folders:
                if not folder_name.strip():
                    continue
                    
                try:
                    # Check if folder exists
                    existing = self.api.find(folder_name)
                    if existing:
                        # Folder exists, use it
                        if isinstance(existing, list):
                            current_node = existing[0]
                        else:
                            current_node = existing
                        print(f"  📁 Using existing folder: {folder_name}")
                    else:
                        # Create new folder
                        if current_node:
                            # If we have a parent node, create under it
                            try:
                                current_node = self.api.create_folder(folder_name, current_node)
                            except:
                                # If that fails, try creating at root
                                current_node = self.api.create_folder(folder_name)
                        else:
                            # Create at root
                            current_node = self.api.create_folder(folder_name)
                        
                        print(f"  📁 Created folder: {folder_name}")
                        
                except Exception as e:
                    print(f"  ⚠️ Error with folder {folder_name}: {e}")
                    # Continue with next folder
                    continue
            
            return current_node
            
        except Exception as e:
            print(f"❌ Folder creation error: {e}")
            return None
    
    def upload_file(self, file_data, filename, folder_path=None):
        """
        File upload karo MEGA par
        """
        if not self.api:
            print("❌ Cannot upload: Not logged in to MEGA")
            return {'success': False, 'error': 'Not logged in to MEGA'}
        
        try:
            # Create temp file
            temp_path = f"/tmp/{uuid.uuid4()}_{filename}"
            with open(temp_path, 'wb') as f:
                f.write(file_data)
            
            print(f"📤 Uploading: {filename}")
            
            # Upload file - first try without folder
            if folder_path:
                print(f"📁 Target folder: {folder_path}")
                # Try to create/get folder
                folder_node = self.create_folder_structure(folder_path)
                
                if folder_node:
                    # If we have a folder node, upload to it
                    try:
                        # Try different ways to get folder ID
                        if isinstance(folder_node, list):
                            folder_id = folder_node[0]
                        elif hasattr(folder_node, 'get'):
                            folder_id = folder_node.get('h')
                        else:
                            folder_id = folder_node
                        
                        print(f"  📁 Uploading to folder ID: {folder_id}")
                        uploaded_file = self.api.upload(temp_path, dest=folder_id)
                    except Exception as e:
                        print(f"  ⚠️ Folder upload failed: {e}, uploading to root")
                        uploaded_file = self.api.upload(temp_path)
                else:
                    print("  ⚠️ Could not create folder, uploading to root")
                    uploaded_file = self.api.upload(temp_path)
            else:
                print("📁 Uploading to root folder")
                uploaded_file = self.api.upload(temp_path)
            
            # Get file node and link
            print(f"🔍 Getting file info...")
            
            # Wait a moment for file to be registered
            time.sleep(1)
            
            # Find the uploaded file
            file_node = self.api.find(filename)
            if not file_node:
                # Try to find by looking at recent files
                files = self.api.get_files()
                for file_id, file_info in files.items():
                    if file_info.get('a', {}).get('n') == filename:
                        file_node = file_info
                        break
            
            if not file_node:
                print("⚠️ Could not find uploaded file, but upload probably succeeded")
                # Generate link from file info we have
                files = self.api.get_files()
                for file_id, file_info in files.items():
                    if file_info.get('a', {}).get('n') == filename:
                        file_node = file_info
                        break
            
            if file_node:
                try:
                    public_link = self.api.get_link(file_node)
                    print(f"🔗 Link: {public_link}")
                except:
                    public_link = "https://mega.nz/"  # Placeholder
                    print(f"⚠️ Could not generate link")
            else:
                public_link = "https://mega.nz/"  # Placeholder
                print(f"⚠️ Could not find file, but upload completed")
            
            # Cleanup
            os.remove(temp_path)
            
            print(f"✅ Upload complete!")
            
            return {
                'success': True,
                'file_name': filename,
                'download_link': public_link
            }
            
        except Exception as e:
            print(f"❌ Upload failed: {e}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': str(e)}