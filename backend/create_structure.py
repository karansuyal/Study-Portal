import os
import json

# Your courses data from React
courses_data = {
    "B.Tech": {
        "Semester_1": [
            "Design Thinking",
            "Introduction to Python Programming",
            "Basic Electrical Engineering",
            "Professional Communication",
            "Mathematics for AI-I",
            "Engineering Physics",
            "Python Programming Lab",
            "Basic Electrical Engineering Lab",
            "Workshop and Manufacturing Practices",
            "Physics Lab"
        ],
        "Semester_2": [
            "Professional Communication",
            "Engineering Chemistry",
            "Engineering Mathematics-II",
            "Basic Electronics Engineering",
            "Environmental Science",
            "Fundamental of Computer & Introduction to Programming",
            "Basic Electronics Engineering Lab",
            "Chemistry Lab",
            "Engineering Graphics and Design Lab",
            "Computer Lab-I"
        ],
        "Semester_3": [
            "Discrete Structures and Combinatorics",
            "Data Structures with C",
            "Logic Design & Computer Organization",
            "Object Oriented Programming with C++",
            "Introduction to Cryptography",
            "Career Skills",
            "Data Structures Lab",
            "OOPS with C++ Lab",
            "Logic Design & Computer Organization Lab",
            "Career Skills Lab"
        ],
        "Semester_4": [
            "Finite Automata and Formal Languages",
            "Microprocessors",
            "Fundamental of Statistics and AI",
            "Programming in Java",
            "Design and Analysis of Algorithms",
            "Career Skills",
            "Microprocessors Lab",
            "Java Programming Lab",
            "DAA Lab",
            "Career Skills Lab"
        ],
        "Semester_5": [
            "Operating Systems",
            "Database Management Systems",
            "Machine Learning",
            "Communication Model and Protocols",
            "Computer-Based Numerical & Statistical Techniques",
            "Career Skills",
            "CBNST Lab",
            "DBMS Lab",
            "Operating Systems Lab"
        ],
        "Semester_6": [
            "Compiler Design",
            "Computer Networks-I",
            "Software Engineering",
            "Network & System Security",
            "Full Stack Web Development",
            "Career Skills",
            "Compiler Design Lab",
            "Computer Networks Lab",
            "Web Development Lab",
            "Employability Skill Enhancement Lab"
        ],
        "Semester_7": [
            "Big Data Analytics",
            "Cyber Security",
            "Mobile Application Development",
            "Project Management",
            "Elective-II",
            "Mobile App Development Lab",
            "Cyber Security Lab",
            "Project Work-I"
        ],
        "Semester_8": [
            "Major Project",
            "Seminar",
            "Industrial Training",
            "Elective-III"
        ]
    },
    "BCA": {
        "Semester_1": [
            "Computational Thinking & Fundamentals of IT",
            "C Programming",
            "Mathematical Foundations of Computer Science",
            "Professional Communication",
            "C Programming Lab",
            "Digital Productivity Tools for Modern Workplaces(Lab)"
        ],
        "Semester_2": [
            "Introduction to Data Structures",
            "Introduction to Object-Oriented Programming(C++)",
            "Introduction to Operating Systems",
            "Discrete Mathematics",
            "Data Structures Lab",
            "Object-Oriented Programming Lab(C++)"
        ],
        "Semester_3": [
            "Web Application Development",
            "Introduction to Database Management Systems",
            "Digital Logic Design",
            "Python Programming",
            "R Programming",
            "Career Skills-I",
            "Database Management Systems Laboratory",
            "Web Application Development Laboratory"
        ],
        "Semester_4": [
            "Introduction to Design and Analysis of Algorithms",
            "Introduction to Software Engineering",
            "Computer Organization",
            "Data Communication and Computer Networks",
            "Big Data Analytics",
            "Career Skills- 2",
            "Design and Analysis of Algorithms Laboratory",
            "Data Communications and Computer Networks Laboratory"
        ],
        "Semester_5": [
            "Mobile Application Development",
            "Cloud Computing",
            "Java Programming",
            "Career Skills",
            "Microcontroller",
            "Introduction To AI",
            "Object Oriented Analysis And Design",
            "Criptography",
            "Object Oriented Analysis And Design Laboratory",
            "Introduction To AI Laboratory"
        ],
        "Semester_6": [
            "Computer Graphics",
            "Network Security And Cyber Laws",
            "Fundamentals Of Machine Learning",
            "Major Project"
        ]
    },
    "BBA": {
        "Semester_1": [
            "Business Communication",
            "Business Economics",
            "Business Law",
            "Computer Application In Management",
            "Economics For Life",
            "Financial Accounting",
            "Principles Of Management"
        ],
        "Semester_2": [
            "Business Communication 2",
            "Economics For Life 2",
            "Environmental Science",
            "Financial Management",
            "Human Resource Management",
            "Organizational Behaviour",
            "Principles Of Marketing"
        ],
        "Semester_3": [
            "Accounting For Managers",
            "Business Environment",
            "Business Statistics",
            "Career Skills",
            "Entrepreneurship",
            "Macro Economics"
        ],
        "Semester_4": [
            "Business Research",
            "Career Skills",
            "Digital Marketing",
            "International Business",
            "Logistics And Supply Chain Management",
            "Production Management",
            "Wellness And Stress Management"
        ],
        "Semester_5": [
            "Advertising",
            "Business Strategy",
            "Career Skills",
            "Direct Tax Law",
            "E Commerce",
            "Indian Economy",
            "Industrial Relations",
            "Performance Management System",
            "Sales Management",
            "Working Capital Management"
        ],
        "Semester_6": [
            "Business Ethics And Values",
            "Consumer Behaviour",
            "Financial Institutions And Services",
            "GST (Goods and Services Tax)",
            "Money Banking And Finance",
            "Rural Marketing",
            "Training And Development",
            "Wages And Salary Administration",
            "Major Project"
        ]
    },
    "MBA": {
        "Semester_1": [
            "Accounting For Managers",
            "Business Communication",
            "Business Environment",
            "Business Statistics And Analytics For Decision Making",
            "Career Skills",
            "Data Driven Decision Making",
            "Financial Reporting Statement And Analysis",
            "Human Resource Management",
            "Legal Aspects Of Business",
            "Managerial Economics",
            "Marketing Management",
            "Organizational Design And Behaviour"
        ],
        "Semester_2": [
            "Business Intelligence",
            "Business Research Method",
            "Career Skills",
            "Compensation And Reward Management",
            "Consumer Behaviour And Insights",
            "Corporate Finance",
            "Corporate Tax Planning",
            "Cross Cultural Management",
            "Data Mining",
            "Data Science Using R",
            "Entrepreneurship",
            "Financial Institutions And Markets",
            "Financial Management",
            "Human Resource Management",
            "Indian Ethos And Business Ethics",
            "Industrial Relation And Labour Laws",
            "Integrated Market Communications",
            "Logistics And Supply Chain Management",
            "Marketing Management",
            "Operations Research",
            "Organizational Behaviour",
            "Quantitative Techniques",
            "Research Methodology",
            "Sales Force And Channel Management",
            "Security Analysis And Portfolio Management",
            "Warehousing And Inventory Management"
        ],
        "Semester_3": [
            "Compensation And Benefits Management",
            "Consumer Behaviour",
            "Corporate Strategy",
            "Data Mining",
            "Data Science Using R",
            "Employee Relations",
            "Integrated Marketing Communication",
            "Investment Analysis And Portfolio Management",
            "Logistics And Supply Chain Management",
            "Managing Banks And Financial Institutions",
            "Performance Management System",
            "Sales And Distributed Management",
            "Warehousing And Inventory Management",
            "Working Capital Management"
        ],
        "Semester_4": [
            "Corporate Taxation",
            "Data Science With Python",
            "Data Visualization For Manager",
            "Digital Marketing",
            "Export And Trade Documentation",
            "Financial Derivatives",
            "International Finance",
            "International Marketing",
            "IT Application",
            "Manpower Planning Recruitment And Selection",
            "Organizational Change And Development",
            "Project Management",
            "Retail Management",
            "Strategic HRM",
            "Summer Internship",
            "Major Project"
        ]
    },
    "MCA": {
        "Semester_1": [
            "C Programming",
            "Career Skills",
            "Cloud Computing",
            "Computer Organization and Architecture",
            "Computer Network",
            "Discrete Structures and Combinatorics",
            "Full Stack Development",
            "Operating Systems",
            "Probability and Statistics",
            "Python Programming"
        ],
        "Semester_2": [
            "Career Skills",
            "Database Management Systems",
            "Data Structures",
            "IoT (Internet of Things)",
            "Java Programming",
            "Machine Learning",
            "Software Project Management"
        ],
        "Semester_3": [
            "AI and ML (Artificial Intelligence and Machine Learning)",
            "Big Data and Visualization",
            "Design and Analysis of Algorithms",
            "Image Processing and Computer Vision",
            "Machine Learning Using Python",
            "Mobile Application Development",
            "Optimization Techniques",
            "Theory of Computation and Compiler Construction"
        ],
        "Semester_4": [
            "Advanced Software Testing",
            "Data Mining and Warehousing",
            "Deep Learning",
            "Enterprise Architecture Using C Sharp",
            "Graphics and Visual Computing",
            "Network Security and Cryptography",
            "R Programming",
            "Soft Computing"
        ]
    }
}

# Material types
material_types = ["notes", "pyq", "syllabus", "imp_questions"]

def clean_name(name):
    """Clean name for folder"""
    return name.replace(" ", "_").replace("(", "").replace(")", "").replace("&", "and").replace("/", "_").replace(",", "")

def create_course_structure(base_path="uploads"):
    """Create course-wise folder structure"""
    
    print("=== Creating Uploads Folder Structure ===")
    print("="*60)
    
    # Main uploads directory
    uploads_dir = os.path.join(base_path, "courses")
    os.makedirs(uploads_dir, exist_ok=True)
    
    total_folders = 0
    total_files = 0
    
    # Create structure for each course
    for course_name, semesters in courses_data.items():
        safe_course_name = clean_name(course_name)
        course_dir = os.path.join(uploads_dir, safe_course_name)
        os.makedirs(course_dir, exist_ok=True)
        
        print(f"\n[COURSE]: {course_name}")
        print("-" * 40)
        
        # Create semester folders
        for sem_name, subjects in semesters.items():
            sem_dir = os.path.join(course_dir, sem_name)
            os.makedirs(sem_dir, exist_ok=True)
            
            print(f"  [SEMESTER]: {sem_name}:")
            
            # Create subject folders
            for subject in subjects:
                safe_subject = clean_name(subject)
                subject_dir = os.path.join(sem_dir, safe_subject)
                os.makedirs(subject_dir, exist_ok=True)
                total_folders += 1
                
                print(f"    [SUBJECT]: {subject}")
                
                # Create material type folders
                for mat_type in material_types:
                    mat_dir = os.path.join(subject_dir, mat_type)
                    os.makedirs(mat_dir, exist_ok=True)
                    total_folders += 1
                    
                    # Create sample PDF files
                    sample_files = {
                        "notes": ["complete_notes.pdf", "unit_wise_notes.pdf"],
                        "pyq": ["2022_pyq.pdf", "2023_pyq.pdf"],
                        "syllabus": ["syllabus.pdf"],
                        "imp_questions": ["important_questions.pdf", "model_answers.pdf"]
                    }
                    
                    for sample_file in sample_files.get(mat_type, []):
                        file_path = os.path.join(mat_dir, sample_file)
                        # Create text files instead of PDFs to avoid encoding issues
                        txt_file = file_path.replace('.pdf', '.txt')
                        with open(txt_file, "w", encoding='utf-8') as f:
                            f.write(f"# {subject}\n")
                            f.write(f"## {mat_type.upper()}\n\n")
                            f.write(f"This is a sample {mat_type} file for {subject}.\n")
                        total_files += 1
                        
                        print(f"      [FILE]: {mat_type}/{sample_file.replace('.pdf', '.txt')}")
    
    print("\n" + "="*60)
    print("[SUCCESS] Structure Created Successfully!")
    print(f"[STATS] Total Folders: {total_folders}")
    print(f"[STATS] Total Files: {total_files}")
    print(f"[LOCATION] {os.path.abspath(uploads_dir)}")
    
    return uploads_dir

def create_config_file():
    """Create a JSON config file with all subjects"""
    config_data = {}
    
    for course_name, semesters in courses_data.items():
        safe_course = clean_name(course_name)
        config_data[safe_course] = {}
        
        for sem_name, subjects in semesters.items():
            sem_num = sem_name.replace("Semester_", "")
            config_data[safe_course][sem_num] = []
            
            for subject in subjects:
                safe_subject = clean_name(subject)
                config_data[safe_course][sem_num].append({
                    "name": subject,
                    "folder_name": safe_subject,
                    "materials": material_types
                })
    
    # Save to JSON file with UTF-8 encoding
    with open("courses_config.json", "w", encoding="utf-8") as f:
        json.dump(config_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n[FILE] Created: courses_config.json")

def main():
    """Main function"""
    try:
        # Create the uploads structure
        uploads_path = create_course_structure()
        
        # Create additional files
        create_config_file()
        
        print("\n" + "="*60)
        print("ALL FILES CREATED SUCCESSFULLY!")
        print("="*60)
        print(f"\n[STRUCTURE LOCATION]: {os.path.abspath(uploads_path)}")
        print("[CONFIG FILE]: courses_config.json")
        print("\nYour Notes Hub folder structure is ready!")
        
    except Exception as e:
        print(f"\n[ERROR] An error occurred: {e}")

if __name__ == "__main__":
    main()