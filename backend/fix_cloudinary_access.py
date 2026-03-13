# fix_cloudinary_access.py
import cloudinary.api
import cloudinary.uploader

# Saari files fetch karo
result = cloudinary.api.resources(type='upload', prefix='study_portal', max_results=500)

for resource in result['resources']:
    if resource['access_mode'] != 'public':
        # Access mode update karo
        cloudinary.api.update(resource['public_id'], access_mode='public')
        print(f"✅ Fixed: {resource['public_id']}")