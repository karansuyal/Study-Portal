# mega_storage.py
import os
from mega import Mega
import uuid

class MegaStorage:
    def __init__(self):
        """MEGA client initialize karo"""
        self.mega = Mega()
        self.email = os.environ.get('MEGA_EMAIL')
        self.password = os.environ.get('MEGA_PASSWORD')
        self.api = None
        self.login()
    
    def login(self):
        """MEGA mein login karo"""
        try:
            print(f"🔑 Logging into MEGA as: {self.email}")
            self.api = self.mega.login(self.email, self.password)
            
            # Account info check karo
            details = self.api.get_user()
            print(f"✅ Login successful! Account: {details}")
            
            # Storage space check
            space = self.api.get_storage_space(kilo=True)
            print(f"💾 Total storage: {space} KB")
            return True
            
        except Exception as e:
            print(f"❌ Login failed: {e}")
            return False
    
    def create_folder_structure(self, folder_path):
        """
        Folder structure create karo (e.g., "BCA/Data_Structures/notes")
        Returns last folder node
        """
        try:
            folders = folder_path.split('/')
            current_folder = None
            
            for folder_name in folders:
                if not folder_name.strip():
                    continue
                    
                # Check if folder exists
                existing = self.api.find(folder_name)
                if existing:
                    # Folder exists, use it
                    current_folder = existing
                else:
                    # Create new folder
                    if current_folder:
                        current_folder = self.api.create_folder(folder_name, current_folder)
                    else:
                        current_folder = self.api.create_folder(folder_name)
                    
                    print(f"📁 Created folder: {folder_name}")
            
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
        try:
            # Pehle temp file banao (kyunki mega.py ko file path chahiye)
            temp_path = f"/tmp/{uuid.uuid4()}_{filename}"
            with open(temp_path, 'wb') as f:
                f.write(file_data)
            
            print(f"📤 Uploading: {filename}")
            
            # Upload file
            if folder_path:
                # Folder mein upload karo
                folder_node = self.create_folder_structure(folder_path)
                if folder_node:
                    # Get folder ID
                    if isinstance(folder_node, list):
                        folder_id = folder_node[0]
                    else:
                        folder_id = folder_node
                    
                    uploaded_file = self.api.upload(temp_path, dest=folder_id)
                else:
                    uploaded_file = self.api.upload(temp_path)
            else:
                uploaded_file = self.api.upload(temp_path)
            
            # Get file node
            file_node = self.api.find(filename)
            if isinstance(file_node, list):
                file_node = file_node[0]
            
            # Get public link
            public_link = self.api.get_link(file_node)
            
            # Temp file delete karo
            os.remove(temp_path)
            
            print(f"✅ Upload complete! Link: {public_link}")
            
            return {
                'success': True,
                'file_name': filename,
                'download_link': public_link,
                'public_link': public_link,
                'file_node': file_node
            }
            
        except Exception as e:
            print(f"❌ Upload failed: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_file_link(self, file_name):
        """File ka public link get karo"""
        try:
            file = self.api.find(file_name)
            if file:
                link = self.api.get_link(file)
                return link
        except:
            pass
        return None
    
    def list_files(self):
        """All files list karo"""
        try:
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
            
            return file_list
            
        except Exception as e:
            print(f"❌ Error listing files: {e}")
            return []
    
    def delete_file(self, file_name):
        """File delete karo"""
        try:
            file = self.api.find(file_name)
            if file:
                self.api.delete(file)
                return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}