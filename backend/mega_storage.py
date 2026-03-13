# mega_storage.py - Simple version jo kaam karega

import os
import time
from mega import Mega

class MegaStorage:
    def __init__(self):
        print("\n" + "="*60)
        print("🚀 MEGA STORAGE INITIALIZATION")
        print("="*60)
        
        self.email = os.environ.get('MEGA_EMAIL')
        self.password = os.environ.get('MEGA_PASSWORD')
        self.api = None
        
        print(f"📧 Email: {self.email}")
        print(f"🔑 Password: {'*'*8 if self.password else 'NOT SET'}")
        
        if not self.email or not self.password:
            print("❌ MEGA credentials missing!")
            return
        
        self._login()
    
    def _login(self):
        """Simple login with retry"""
        try:
            print("🔄 Connecting to MEGA...")
            mega = Mega()
            self.api = mega.login(self.email, self.password)
            
            if self.api:
                print("✅ MEGA Login successful!")
                # Test connection
                storage = self.api.get_storage_space()
                print(f"💾 Storage: {storage / (1024**3):.2f} GB")
                return True
            else:
                print("❌ Login failed - no API returned")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    def upload_file(self, file_data, filename, folder_path=None):
        """Simple upload function"""
        if not self.api:
            return {'success': False, 'error': 'Not logged in'}
        
        import tempfile
        import uuid
        
        temp_path = None
        try:
            # Create temp file
            temp_dir = tempfile.gettempdir()
            temp_filename = f"{uuid.uuid4().hex}_{filename}"
            temp_path = os.path.join(temp_dir, temp_filename)
            
            with open(temp_path, 'wb') as f:
                f.write(file_data)
            
            print(f"📤 Uploading: {filename}")
            
            # Upload to root (simpler)
            file = self.api.upload(temp_path)
            
            # Get link
            time.sleep(2)
            link = self.api.get_link(file)
            
            return {
                'success': True,
                'download_link': link,
                'file_name': filename
            }
            
        except Exception as e:
            print(f"❌ Upload error: {e}")
            return {'success': False, 'error': str(e)}
            
        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except:
                    pass