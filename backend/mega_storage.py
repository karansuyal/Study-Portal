# mega_storage.py - Improved Version
import os
from mega import Mega
import tempfile
import time
import uuid
from typing import Optional, Dict, Any
import logging

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        self.folder_cache = {}  # ✅ Folder cache for performance
        
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
                
                # ✅ Check if login successful
                if not self.api:
                    raise Exception("Login returned None")
                
                # Get storage info
                try:
                    storage = self.api.get_storage_space()
                    storage_gb = storage / (1024**3)  # Convert to GB
                    print(f"✅ Login successful!")
                    print(f"💾 Total storage: {storage_gb:.2f} GB")
                    
                    # ✅ Cache root node
                    self.root_node = self.api.get_files()
                    
                except Exception as e:
                    print(f"⚠️ Storage info not available: {e}")
                
                return True
                
            except Exception as e:
                print(f"❌ Login failed: {e}")
                if attempt < max_retries - 1:
                    print(f"⏰ Retrying in 2 seconds...")
                    time.sleep(2)
        
        self.api = None
        return False
    
    def ensure_logged_in(self):
        """✅ Ensure we're logged in before operations"""
        if not self.api:
            print("⚠️ Not logged in, attempting login...")
            return self._login()
        return True
    
    def find_or_create_folder(self, folder_path: str):
        """✅ Find folder or create if not exists (with caching)"""
        if not self.ensure_logged_in():
            return None
        
        # Check cache first
        if folder_path in self.folder_cache:
            return self.folder_cache[folder_path]
        
        try:
            folders = folder_path.strip('/').split('/')
            current_node = None
            
            for folder in folders:
                if not folder:
                    continue
                
                found = False
                
                # Search in current node
                try:
                    files = self.api.get_files() if not current_node else self.api.get_files_in_node(current_node)
                    
                    for file_id, info in files.items():
                        # Check if it's a folder and name matches
                        if info.get('t') == 1 and info.get('n') == folder:  # t=1 means folder
                            current_node = info
                            found = True
                            break
                except Exception as e:
                    logger.warning(f"Error searching folder {folder}: {e}")
                
                # Create folder if not found
                if not found:
                    try:
                        print(f"📁 Creating folder: {folder}")
                        if current_node:
                            new_folder = self.api.create_folder(folder, current_node)
                        else:
                            new_folder = self.api.create_folder(folder)
                        
                        # Handle different return formats
                        if isinstance(new_folder, list):
                            current_node = new_folder[0]
                        else:
                            current_node = new_folder
                            
                        print(f"✅ Folder created: {folder}")
                        
                    except Exception as e:
                        print(f"❌ Failed to create folder {folder}: {e}")
                        return None
            
            # Cache the result
            self.folder_cache[folder_path] = current_node
            return current_node
            
        except Exception as e:
            print(f"❌ Folder operation error: {e}")
            return None
    
    def upload_file(self, file_data, filename, folder_path=None):
        """Upload file to MEGA and return public link"""
        if not self.ensure_logged_in():
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
            
            file_size = len(file_data)
            print(f"📤 Uploading: {filename} ({file_size/1024:.2f} KB)")
            
            # Upload to MEGA
            if folder_path:
                dest_node = self.find_or_create_folder(folder_path)
                if dest_node:
                    print(f"📁 Uploading to folder: {folder_path}")
                    uploaded_file = self.api.upload(temp_path, dest=dest_node)
                else:
                    print(f"⚠️ Folder not available, uploading to root")
                    uploaded_file = self.api.upload(temp_path)
            else:
                uploaded_file = self.api.upload(temp_path)
            
            # ✅ Wait for file to register with exponential backoff
            link = None
            max_attempts = 5
            for attempt in range(max_attempts):
                try:
                    # Try to find by filename
                    if folder_path and dest_node:
                        files = self.api.get_files_in_node(dest_node)
                        for file_id, info in files.items():
                            if info.get('n') == filename:
                                link = self.api.get_link(info)
                                break
                    else:
                        # Search in root
                        file_node = self.api.find(filename)
                        if file_node:
                            if isinstance(file_node, list):
                                file_node = file_node[0]
                            link = self.api.get_link(file_node)
                    
                    if link:
                        break
                    
                except Exception as e:
                    logger.debug(f"Link attempt {attempt+1} failed: {e}")
                
                # Exponential backoff
                wait_time = (2 ** attempt)  # 1, 2, 4, 8, 16 seconds
                print(f"⏰ Waiting {wait_time}s for file to register...")
                time.sleep(wait_time)
            
            if not link:
                # ✅ One final attempt with different method
                try:
                    files = self.api.get_files()
                    for file_id, info in files.items():
                        if info.get('a', {}).get('n') == filename:
                            link = self.api.get_link(info)
                            break
                except:
                    pass
            
            if not link:
                return {
                    'success': False, 
                    'error': 'File uploaded but link generation failed',
                    'file_name': filename
                }
            
            print(f"✅ Upload complete!")
            print(f"🔗 Link: {link[:50]}...")  # Truncate for display
            
            return {
                'success': True,
                'download_link': link,
                'file_name': filename,
                'file_size': file_size,
                'folder': folder_path
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
                    print(f"🧹 Temp file cleaned: {temp_path}")
                except Exception as e:
                    print(f"⚠️ Temp file cleanup failed: {e}")
    
    def get_file_info(self, file_link):
        """✅ Get file info from MEGA link"""
        if not self.ensure_logged_in():
            return None
        
        try:
            file = self.api.get_link(file_link)
            return {
                'name': file.get('name'),
                'size': file.get('size'),
                'type': file.get('type')
            }
        except Exception as e:
            print(f"❌ Failed to get file info: {e}")
            return None
    
    def delete_file(self, filename, folder_path=None):
        """✅ Delete file from MEGA"""
        if not self.ensure_logged_in():
            return False
        
        try:
            if folder_path:
                dest_node = self.find_or_create_folder(folder_path)
                if dest_node:
                    files = self.api.get_files_in_node(dest_node)
                    for file_id, info in files.items():
                        if info.get('n') == filename:
                            self.api.delete(info)
                            print(f"✅ Deleted: {filename}")
                            return True
            else:
                file_node = self.api.find(filename)
                if file_node:
                    if isinstance(file_node, list):
                        file_node = file_node[0]
                    self.api.delete(file_node)
                    print(f"✅ Deleted: {filename}")
                    return True
            
            print(f"⚠️ File not found: {filename}")
            return False
            
        except Exception as e:
            print(f"❌ Delete failed: {e}")
            return False
    
    def list_files(self, folder_path=None):
        """✅ List all files in MEGA"""
        if not self.ensure_logged_in():
            return []
        
        try:
            if folder_path:
                dest_node = self.find_or_create_folder(folder_path)
                if dest_node:
                    files = self.api.get_files_in_node(dest_node)
                else:
                    return []
            else:
                files = self.api.get_files()
            
            file_list = []
            for file_id, info in files.items():
                if info.get('t') == 0:  # t=0 means file
                    file_list.append({
                        'id': file_id,
                        'name': info.get('n'),
                        'size': info.get('s'),
                        'type': 'file'
                    })
            
            return file_list
            
        except Exception as e:
            print(f"❌ Failed to list files: {e}")
            return []

# ✅ Test function
def test_mega_storage():
    """Test MEGA storage functionality"""
    print("\n🧪 TESTING MEGA STORAGE")
    print("-"*40)
    
    storage = MegaStorage()
    
    if not storage.api:
        print("❌ Cannot test - login failed")
        return
    
    # Test folder creation
    test_folder = "StudyPortal/test"
    folder_node = storage.find_or_create_folder(test_folder)
    if folder_node:
        print(f"✅ Folder ready: {test_folder}")
    
    # Test file upload (small test file)
    test_data = b"Hello MEGA! This is a test file."
    result = storage.upload_file(test_data, "test.txt", test_folder)
    
    if result['success']:
        print(f"✅ Upload test passed")
        print(f"   Link: {result['download_link'][:50]}...")
    else:
        print(f"❌ Upload test failed: {result.get('error')}")
    
    print("-"*40)

if __name__ == "__main__":
    test_mega_storage()