import os
import sqlite3
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import uuid

# Configuration
UPLOADS_BASE = 'uploads/courses'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'}

app = Flask(__name__)

def get_subject_folder_path(course_name, semester, subject_name, material_type):
    """Generate folder path based on subject"""
    # Clean names for folder paths
    safe_course = course_name.replace(' ', '_').replace('(', '').replace(')', '')
    safe_subject = subject_name.replace(' ', '_').replace('&', 'and').replace('/', '_')
    
    # Build the path: uploads/courses/B_Tech/Semester_1/Design_Thinking/notes/
    folder_path = os.path.join(
        UPLOADS_BASE,
        safe_course,
        f"Semester_{semester}",
        safe_subject,
        material_type
    )
    
    # Create directories if they don't exist
    os.makedirs(folder_path, exist_ok=True)
    return folder_path

@app.route('/api/upload-material', methods=['POST'])
def upload_material():
    try:
        # Get form data
        course_name = request.form.get('course_name')
        semester = request.form.get('semester')
        subject_name = request.form.get('subject_name')
        material_type = request.form.get('material_type', 'notes')
        file = request.files.get('file')
        
        if not all([course_name, semester, subject_name, file]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create subject folder
        folder_path = get_subject_folder_path(course_name, semester, subject_name, material_type)
        
        # Generate unique filename
        original_filename = secure_filename(file.filename)
        file_ext = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{subject_name.replace(' ', '_')}_{material_type}_{uuid.uuid4().hex[:8]}.{file_ext}"
        
        # Save file
        file_path = os.path.join(folder_path, unique_filename)
        file.save(file_path)
        
        # Here you would save to database
        # save_to_database(course_name, semester, subject_name, material_type, file_path)
        
        return jsonify({
            'success': True,
            'message': 'File uploaded successfully',
            'file_path': file_path,
            'download_url': f'/api/files/{unique_filename}'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/<filename>')
def get_file(filename):
    """Serve files from uploads directory"""
    # You'll need to implement logic to find the file
    return send_from_directory('uploads', filename)

@app.route('/api/courses', methods=['GET'])
def get_courses():
    """Get list of courses from folder structure"""
    courses_dir = 'uploads/courses'
    courses = []
    
    if os.path.exists(courses_dir):
        for course in os.listdir(courses_dir):
            course_path = os.path.join(courses_dir, course)
            if os.path.isdir(course_path):
                courses.append({
                    'name': course.replace('_', ' '),
                    'code': course,
                    'path': course_path
                })
    
    return jsonify({'courses': courses})

if __name__ == '__main__':
    print("=== Notes Hub Backend ===")
    print("Uploads structure ready at: uploads/courses")
    app.run(debug=True, port=5000)
