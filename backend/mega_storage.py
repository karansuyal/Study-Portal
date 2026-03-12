# mega_storage.py
import os
from mega import Mega
import uuid
import json
import time

class MegaStorage:
    def __init__(self):
        """MEGA client initialize karo"""
        print("\n" + "="*60)
        print("🚀 MegaStorage INITIALIZING...")
        print("="*60)
        
        self.mega = Mega()
        self.email = os.environ.get('MEGA_EMAIL')
        self.password = os.environ.get('MEGA_PASSWORD')
        self.api = None
        
        print(f"📧 MEGA_EMAIL from env: {self.email}")
        print(f"🔑 MEGA_PASSWORD from env: {'*' * 8 if self.password else 'NOT SET'}")
        
        if not self.email or not self.password:
            print("❌ CRITICAL: MEGA credentials missing in environment variables!")
            print("📝 Please set MEGA_EMAIL and MEGA_PASSWORD in Render dashboard")
            return
        
        self.login()
    
    def login(self):
        """MEGA mein login karo with retry logic"""
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                print(f"🔑 Attempting MEGA login (attempt {attempt + 1}/{max_retries})...")
                
                # Login attempt
                self.api = self.mega.login(self.email, self.password)
                
                # Get account details to verify login
                details = self.api.get_user()
                print(f"✅ Login successful! Account: {details.get('name', 'Unknown')}")
                
                # Get storage space
                try:
                    space = self.api.get_storage_space(kilo=True)
                    print(f"💾 Total storage: {space} KB")
                except:
                    print("⚠️ Could not fetch storage space")
                
                return True
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON decode error (attempt {attempt + 1}): {e}")
                print("   This usually means MEGA API is rate limiting or network issue")
                
                if attempt < max_retries - 1:
                    print(f"⏰ Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    print("❌ All login attempts failed. Please check:")
                    print("   1. Your MEGA credentials are correct")
                    print("   2. You can login at https://mega.nz")
                    print("   3. MEGA service is not down")
                    
            except Exception as e:
                print(f"❌ Login failed (attempt {attempt + 1}): {e}")
                
                if attempt < max_retries - 1:
                    print(f"⏰ Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    print("❌ All login attempts failed")
        
        self.api = None
        return False
    
    def create_folder_structure(self, folder_path):
        """
        Folder structure create karo (e.g., "BCA/Data_Structures/notes")
        Returns last folder node
        """
        if not self.api:
            print("❌ Not logged in to MEGA")
            return None
            
        try:
            print(f"📁 Creating folder structure: {folder_path}")
            folders = folder_path.split('/')
            current_folder = None
            
            for folder_name in folders:
                if not folder_name.strip():
                    continue
                    
                try:
                    # Check if folder exists
                    existing = self.api.find(folder_name)
                    if existing:
                        # Folder exists, use it
                        if isinstance(existing, list):
                            current_folder = existing[0]
                        else:
                            current_folder = existing
                        print(f"  📁 Using existing folder: {folder_name}")
                    else:
                        # Create new folder
                        if current_folder:
                            current_folder = self.api.create_folder(folder_name, current_folder)
                        else:
                            current_folder = self.api.create_folder(folder_name)
                        
                        print(f"  📁 Created folder: {folder_name}")
                        
                except Exception as e:
                    print(f"  ⚠️ Error with folder {folder_name}: {e}")
                    # Continue with next folder
                    continue
            
            return current_folder
            
        except Exception as e:
            print(f"❌ Folder creation error: {e}")
            return None
    
    def upload_file(self, file_data, filename, folder_path=None):
        """
        File upload karo MEGA par
        
        Args:
            file_data: File content (bytes)
            filename: File ka naam
            folder_path: Destination folder (e.g., "BCA/Data_Structures/notes")
        
        Returns:
            dict: File info with link
        """
        if not self.api:
            print("❌ Cannot upload: Not logged in to MEGA")
            return {'success': False, 'error': 'Not logged in to MEGA'}
            
        try:
            # Pehle temp file banao (kyunki mega.py ko file path chahiye)
            temp_dir = '/tmp' if os.name != 'nt' else os.environ.get('TEMP', '.')
            temp_path = os.path.join(temp_dir, f"{uuid.uuid4().hex}_{filename}")
            
            print(f"📝 Creating temp file: {temp_path}")
            with open(temp_path, 'wb') as f:
                f.write(file_data)
            
            print(f"📤 Uploading: {filename}")
            print(f"📦 File size: {len(file_data)} bytes")
            
            # Upload file
            if folder_path:
                print(f"📁 Target folder: {folder_path}")
                # Folder mein upload karo
                folder_node = self.create_folder_structure(folder_path)
                
                if folder_node:
                    # Get folder ID
                    if isinstance(folder_node, list):
                        folder_id = folder_node[0]
                    else:
                        folder_id = folder_node
                    
                    print(f"📁 Uploading to folder ID: {folder_id}")
                    uploaded_file = self.api.upload(temp_path, dest=folder_id)
                else:
                    print("⚠️ Could not create folder structure, uploading to root")
                    uploaded_file = self.api.upload(temp_path)
            else:
                print("📁 Uploading to root folder")
                uploaded_file = self.api.upload(temp_path)
            
            # Get file node
            print(f"🔍 Finding uploaded file...")
            file_node = self.api.find(filename)
            if isinstance(file_node, list):
                file_node = file_node[0]
            
            # Get public link
            print(f"🔗 Generating public link...")
            public_link = self.api.get_link(file_node)
            
            # Temp file delete karo
            print(f"🧹 Cleaning up temp file...")
            os.remove(temp_path)
            
            print(f"✅ Upload complete!")
            print(f"🔗 Link: {public_link}")
            
            return {
                'success': True,
                'file_name': filename,
                'download_link': public_link,
                'public_link': public_link,
                'file_node': file_node
            }
            
        except Exception as e:
            print(f"❌ Upload failed: {e}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': str(e)}
    
    def get_file_link(self, file_name):
        """File ka public link get karo"""
        if not self.api:
            return None
            
        try:
            file = self.api.find(file_name)
            if file:
                link = self.api.get_link(file)
                return link
        except Exception as e:
            print(f"❌ Error getting link: {e}")
        return None
    
    def list_files(self):
        """All files list karo"""
        if not self.api:
            print("❌ Not logged in to MEGA")
            return []
            
        try:
            print("📋 Fetching MEGA files...")
            files = self.api.get_files()
            file_list = []
            
            for file_id, file_info in files.items():
                if file_info['t'] == 0:  # File type
                    file_list.append({
                        'id': file_id,
                        'name': file_info['a']['n'],
                        'size': file_info['s'],
                        'type': 'file'
                    })
                elif file_info['t'] == 1:  # Folder type
                    file_list.append({
                        'id': file_id,
                        'name': file_info['a']['n'],
                        'size': 0,
                        'type': 'folder'
                    })
            
            print(f"✅ Found {len(file_list)} items")
            return file_list
            
        except Exception as e:
            print(f"❌ Error listing files: {e}")
            return []
    
    def delete_file(self, file_name):
        """File delete karo"""
        if not self.api:
            return {'success': False, 'error': 'Not logged in to MEGA'}
            
        try:
            file = self.api.find(file_name)
            if file:
                self.api.delete(file)
                return {'success': True}
            else:
                return {'success': False, 'error': 'File not found'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def check_connection(self):
        """Check if MEGA connection is working"""
        if not self.api:
            return False
        
        try:
            # Try to list files as connection test
            self.api.get_user()
            return True
        except:
            return False