export const coursesData = {
  // B.Tech (4 Years, 8 Semesters) - Computer Science with ACTUAL KIET subjects
  1: {
    name: "B.Tech (Computer Science)",
    icon: "💻",
    duration: "4 Years (8 Semesters)",
    years: {
      1: {
        name: "First Year",
        semesters: {
          1: [
            // THEORY SUBJECTS FIRST
            { id: 101, name: 'Design Thinking', code: 'HSMC101', credits: 3, materials: 15, rating: 4.5, type: 'Theory' },
            { id: 102, name: 'Introduction to Python Programming', code: 'TCS102', credits: 4, materials: 25, rating: 4.7, type: 'Theory' },
            { id: 103, name: 'Basic Electrical Engineering', code: 'TEE101', credits: 3, materials: 20, rating: 4.3, type: 'Theory' },
            { id: 104, name: 'Professional Communication', code: 'THU101', credits: 2, materials: 12, rating: 4.2, type: 'Theory' },
            { id: 105, name: 'Mathematics for AI-I', code: 'TMA102', credits: 4, materials: 18, rating: 4.4, type: 'Theory' },
            { id: 106, name: 'Engineering Physics', code: 'TPH101', credits: 4, materials: 15, rating: 4.6, type: 'Theory' },
            
            // LAB SUBJECTS LAST
            { id: 107, name: 'Python Programming Lab', code: 'PCS152', credits: 2, materials: 16, rating: 4.8, type: 'Lab' },
            { id: 108, name: 'Basic Electrical Engineering Lab', code: 'PEE151', credits: 1, materials: 12, rating: 4.5, type: 'Lab' },
            { id: 109, name: 'Workshop and Manufacturing Practices', code: 'PME151', credits: 2, materials: 14, rating: 4.3, type: 'Lab' },
            { id: 110, name: 'Physics Lab', code: 'PPH151', credits: 1, materials: 10, rating: 4.4, type: 'Lab' }
          ],
         
      2: [
  // THEORY SUBJECTS FIRST (Semester 1 - Actual)
  { id: 101, name: 'Professional Communication', code: 'THU201', credits: 3, materials: 15, rating: 4.4, type: 'Theory' },
  { id: 102, name: 'Engineering Chemistry', code: 'TCH201', credits: 4, materials: 18, rating: 4.3, type: 'Theory' },
  { id: 103, name: 'Engineering Mathematics-II', code: 'TMA201', credits: 4, materials: 22, rating: 4.6, type: 'Theory' },
  { id: 104, name: 'Basic Electronics Engineering', code: 'TEC201', credits: 3, materials: 20, rating: 4.2, type: 'Theory' },
  { id: 105, name: 'Environmental Science', code: 'TE2101', credits: 2, materials: 12, rating: 4.0, type: 'Theory' },
  { id: 106, name: 'Fundamental of Computer & Introduction to Programming', code: 'TCS201', credits: 4, materials: 25, rating: 4.8, type: 'Theory' },
  
  // LAB SUBJECTS LAST (Semester 1 - Actual)
  { id: 107, name: 'Basic Electronics Engineering Lab', code: 'PEC251', credits: 1, materials: 14, rating: 4.3, type: 'Lab' },
  { id: 108, name: 'Chemistry Lab', code: 'PCH251', credits: 1, materials: 12, rating: 4.2, type: 'Lab' },
  { id: 109, name: 'Engineering Graphics and Design Lab', code: 'PME253', credits: 2, materials: 18, rating: 4.5, type: 'Lab' },
  { id: 110, name: 'Computer Lab-I', code: 'PCS251', credits: 2, materials: 20, rating: 4.7, type: 'Lab' },
  
],
        }
      },
     2: {
  name: "Second Year",
  semesters: {
    3: [
      // THEORY SUBJECTS FIRST (Semester 3 - Actual)
      { id: 121, name: 'Discrete Structures and Combinatorics', code: 'TMA316', credits: 4, materials: 16, rating: 4.4, type: 'Theory' },
      { id: 122, name: 'Data Structures with C', code: 'TCS302', credits: 4, materials: 28, rating: 4.7, type: 'Theory' },
      { id: 123, name: 'Logic Design & Computer Organization', code: 'TCS308', credits: 3, materials: 18, rating: 4.3, type: 'Theory' },
      { id: 124, name: 'Object Oriented Programming with C++', code: 'TCS307', credits: 4, materials: 25, rating: 4.8, type: 'Theory' },
      { id: 125, name: 'Introduction to Cryptography', code: 'TCS392', credits: 3, materials: 14, rating: 4.1, type: 'Theory' },
      { id: 126, name: 'Career Skills', code: 'XCS301', credits: 2, materials: 12, rating: 4.2, type: 'Theory' },
      
      // LAB SUBJECTS LAST (Semester 3 - Actual)
      { id: 127, name: 'Data Structures Lab', code: 'PCS302', credits: 2, materials: 20, rating: 4.6, type: 'Lab' },
      { id: 128, name: 'OOPS with C++ Lab', code: 'PCS307', credits: 2, materials: 18, rating: 4.5, type: 'Lab' },
      { id: 129, name: 'Logic Design & Computer Organization Lab', code: 'PCS308', credits: 1, materials: 12, rating: 4.3, type: 'Lab' },
      { id: 130, name: 'Career Skills Lab', code: 'XCS310', credits: 1, materials: 10, rating: 4.0, type: 'Lab' }
    ],
    4: [
      // THEORY SUBJECTS FIRST (Semester 4 - Actual)
      { id: 134, name: 'Finite Automata and Formal Languages', code: 'TCS402', credits: 4, materials: 22, rating: 4.6, type: 'Theory' },
      { id: 135, name: 'Microprocessors', code: 'TCS403', credits: 4, materials: 20, rating: 4.7, type: 'Theory' },
      { id: 136, name: 'Fundamental of Statistics and AI', code: 'TCS421', credits: 3, materials: 18, rating: 4.4, type: 'Theory' },
      { id: 137, name: 'Programming in Java', code: 'TCS408', credits: 4, materials: 24, rating: 4.8, type: 'Theory' },
      { id: 138, name: 'Design and Analysis of Algorithms', code: 'TCS409', credits: 4, materials: 25, rating: 4.7, type: 'Theory' },
      { id: 139, name: 'Career Skills', code: 'XCS401', credits: 2, materials: 12, rating: 4.2, type: 'Theory' },
      
      // LAB SUBJECTS LAST (Semester 4 - Actual)
      { id: 140, name: 'Microprocessors Lab', code: 'PCS403', credits: 2, materials: 16, rating: 4.5, type: 'Lab' },
      { id: 141, name: 'Java Programming Lab', code: 'PCS408', credits: 2, materials: 18, rating: 4.4, type: 'Lab' },
      { id: 142, name: 'DAA Lab', code: 'PCS409', credits: 2, materials: 20, rating: 4.6, type: 'Lab' },
      { id: 143, name: 'Career Skills Lab', code: 'XCS410', credits: 1, materials: 10, rating: 4.0, type: 'Lab' }
      
    ]
  }
},
3: {
  name: "Third Year",
  semesters: {
    5: [
      // THEORY SUBJECTS FIRST (Semester 5 - Actual)
      { id: 147, name: 'Operating Systems', code: 'TCS502', credits: 4, materials: 22, rating: 4.6, type: 'Theory' },
      { id: 148, name: 'Database Management Systems', code: 'TCS503', credits: 4, materials: 24, rating: 4.8, type: 'Theory' },
      { id: 149, name: 'Machine Learning', code: 'TCS509', credits: 4, materials: 28, rating: 4.9, type: 'Theory' },
      { id: 150, name: 'Communication Model and Protocols', code: 'TCS531', credits: 3, materials: 18, rating: 4.4, type: 'Theory' },
      { id: 151, name: 'Computer-Based Numerical & Statistical Techniques', code: 'TMA502', credits: 3, materials: 20, rating: 4.5, type: 'Theory' },
      { id: 152, name: 'Career Skills', code: 'XCS501', credits: 2, materials: 12, rating: 4.2, type: 'Theory' },
      
      // LAB SUBJECTS LAST (Semester 5 - Actual)
      { id: 153, name: 'CBNST Lab', code: 'PMA502', credits: 2, materials: 16, rating: 4.5, type: 'Lab' },
      { id: 154, name: 'DBMS Lab', code: 'PCS503', credits: 2, materials: 18, rating: 4.4, type: 'Lab' },
      { id: 155, name: 'Operating Systems Lab', code: 'PCS506', credits: 2, materials: 20, rating: 4.6, type: 'Lab' }
    ],
    6: [
      // THEORY SUBJECTS FIRST (Semester 6 - Actual)
      { id: 159, name: 'Compiler Design', code: 'TCS601', credits: 4, materials: 22, rating: 4.6, type: 'Theory' },
      { id: 160, name: 'Computer Networks-I', code: 'TCS604', credits: 4, materials: 24, rating: 4.8, type: 'Theory' },
      { id: 161, name: 'Software Engineering', code: 'TCS611', credits: 3, materials: 18, rating: 4.4, type: 'Theory' },
      { id: 162, name: 'Network & System Security', code: 'TCS619', credits: 4, materials: 25, rating: 4.7, type: 'Theory' },
      { id: 163, name: 'Full Stack Web Development', code: 'TCS693', credits: 4, materials: 30, rating: 4.9, type: 'Theory' },
      { id: 164, name: 'Career Skills', code: 'XCS601', credits: 2, materials: 12, rating: 4.2, type: 'Theory' },
      
      // LAB SUBJECTS LAST (Semester 6 - Actual)
      { id: 165, name: 'Compiler Design Lab', code: 'PCS601', credits: 2, materials: 20, rating: 4.6, type: 'Lab' },
      { id: 166, name: 'Computer Networks Lab', code: 'PCS604', credits: 2, materials: 18, rating: 4.5, type: 'Lab' },
      { id: 167, name: 'Web Development Lab', code: 'PCS693', credits: 2, materials: 25, rating: 4.8, type: 'Lab' },
      { id: 168, name: 'Employability Skill Enhancement Lab', code: 'PESE600', credits: 1, materials: 15, rating: 4.3, type: 'Lab' }
    ]
  }
},
      4: {
        name: "Final Year",
        semesters: {
          7: [
            // THEORY SUBJECTS FIRST
            { id: 153, name: 'Big Data Analytics', code: 'TCS401', credits: 4, materials: 20, rating: 4.7, type: 'Theory' },
            { id: 154, name: 'Cyber Security', code: 'TCS402', credits: 4, materials: 18, rating: 4.6, type: 'Theory' },
            { id: 155, name: 'Mobile Application Development', code: 'TCS403', credits: 4, materials: 25, rating: 4.8, type: 'Theory' },
            { id: 156, name: 'Project Management', code: 'TME301', credits: 3, materials: 12, rating: 4.2, type: 'Theory' },
            { id: 157, name: 'Elective-II', code: 'TEL401', credits: 3, materials: 15, rating: 4.4, type: 'Elective' },
            
            // LAB SUBJECTS LAST
            { id: 158, name: 'Mobile App Development Lab', code: 'PCS451', credits: 2, materials: 22, rating: 4.7, type: 'Lab' },
            { id: 159, name: 'Cyber Security Lab', code: 'PCS452', credits: 1, materials: 16, rating: 4.5, type: 'Lab' },
            { id: 160, name: 'Project Work-I', code: 'PCS453', credits: 4, materials: 30, rating: 4.9, type: 'Project' }
          ],
          8: [
            // FINAL SEMESTER - Major Project Focus
            { id: 161, name: 'Major Project', code: 'PCS454', credits: 12, materials: 50, rating: 4.9, type: 'Project' },
            { id: 162, name: 'Seminar', code: 'PCS455', credits: 2, materials: 15, rating: 4.3, type: 'Seminar' },
            { id: 163, name: 'Industrial Training', code: 'PCS456', credits: 4, materials: 20, rating: 4.7, type: 'Training' },
            { id: 164, name: 'Elective-III', code: 'TEL402', credits: 3, materials: 18, rating: 4.5, type: 'Elective' }
          ]
        }
      }
    }
  },

  // BCA (3 Years, 6 Semesters)
  2: {
    name: "BCA (Bachelor of Computer Applications)",
    icon: "📱",
    duration: "3 Years (6 Semesters)",
    years: {
      1: {
        name: "First Year",
        semesters: {
          1: [
            { id: 201, name: 'Computational Thinking & Fundamentals of IT', code: 'TBC101', credits: 3, materials: 12, rating: 4.3, type: 'Theory' },
            { id: 202, name: 'C Programming', code: 'TBC102', credits: 4, materials: 25, rating: 4.8, type: 'Theory' },
            { id: 203, name: 'Mathematical Foundations of Computer Science', code: 'TBC103', credits: 3, materials: 15, rating: 4.2, type: 'Theory' },
            { id: 204, name: 'Professional Communication', code: 'THU101', credits: 3, materials: 10, rating: 4.1, type: 'Theory' },
            { id: 205, name: 'C Programming  Lab', code: 'PBC101', credits: 2, materials: 12, rating: 4.0, type: 'Lab' },
            { id: 206, name: 'Digital Productivity Tools for Modern Workplaces(Lab)', code: 'PBC102', credits: 2, materials: 12, rating: 4.0, type: 'Lab' }

          ],
          2: [
            { id: 207, name: 'Introduction to Data Structures ', code: 'TBC106', credits: 4, materials: 14, rating: 4.4, type: 'Theory' },
            { id: 208, name: 'Introduction to Object-Oriented Programming(C++) ', code: 'TBC202', credits: 3, materials: 22, rating: 4.7, type: 'Theory' },
            { id: 209, name: 'Introduction to Operating Systems', code: 'TBC203', credits: 3, materials: 20, rating: 4.6, type: 'Theory' },
            { id: 210, name: 'Discrete Mathematics', code: 'TBC204', credits: 3, materials: 18, rating: 4.5, type: 'Theory' },
            { id: 211, name: 'Data Structures Lab', code: 'PBC201', credits: 2, materials: 14, rating: 4.2, type: 'Lab' },
            { id: 212, name: 'Object-Oriented Programming Lab(C++)', code: 'PBC202', credits: 2, materials: 14, rating: 4.2, type: 'Lab' }
          ]
        }
      },
      2: {
        name: "Second Year",
        semesters: {
          3: [
            { id: 213, name: 'Web Application Development', code: 'TBC301', credits: 3, materials: 24, rating: 4.7, type: 'Theory' },
            { id: 214, name: 'Introduction to Database Management Systems', code: 'TBC302', credits: 3, materials: 18, rating: 4.5, type: 'Theory' },
            { id: 215, name: 'Digital Logic Design', code: 'TBC303', credits: 3, materials: 20, rating: 4.6, type: 'Theory' },
            { id: 216, name: 'Python Programming', code: 'TBC304', credits: 3, materials: 16, rating: 4.3, type: 'Theory' },
            { id: 217, name: 'R Programming ', code: 'TBC305', credits: 3, materials: 12, rating: 4.2, type: 'Theory' },
            { id: 218, name: 'Career Skills-I', code: 'TBC306', credits: 1, materials: 12, rating: 4.2, type: 'Theory' },
            { id: 219, name: 'Database Management Systems Laboratory ', code: 'PBC301', credits: 2, materials: 12, rating: 4.2, type: 'Lab' },
            { id: 220, name: 'Web Application Development Laboratory ', code: 'PBC302', credits: 2, materials: 12, rating: 4.2, type: 'Lab' }
          ],
          
          
          4: [
            { id: 221, name: 'Introduction to Design and Analysis of Algorithms', code: 'TBC401', credits: 3, materials: 26, rating: 4.8, type: 'Theory' },
            { id: 222, name: 'Introduction to Software Engineering ', code: 'TBC402', credits: 3, materials: 22, rating: 4.7, type: 'Theory' },
            { id: 223, name: 'Computer Organization', code: 'TBC403', credits: 3, materials: 15, rating: 4.3, type: 'Theory' },
            { id: 224, name: 'Data Communication and Computer Networks', code: 'TBC404', credits: 3, materials: 14, rating: 4.4, type: 'Theory' },
            { id: 225, name: 'Big Data Analytics', code: 'TBC405', credits: 3, materials: 20, rating: 4.8, type: 'Theory' },
            { id: 226, name: 'Career Skills- 2', code: 'TBC406', credits: 1, materials: 20, rating: 4.8, type: 'Theory' },
            { id: 227, name: 'Design and Analysis of Algorithms Laboratory', code: 'PBC401', credits: 2, materials: 20, rating: 4.8, type: 'Lab' },
            { id: 228, name: 'Data Communications and Computer Networks Laboratory', code: 'PBC402', credits: 2, materials: 20, rating: 4.8, type: 'Lab' }

          ]
        }
      },
      3: {
        name: "Final Year",
        semesters: {
          5: [
            { id: 229, name: 'Mobile Application Development', code: 'TBC501', credits: 4, materials: 24, rating: 4.7, type: 'Theory' },
            { id: 230, name: 'Cloud Computing', code: 'TBC502', credits: 4, materials: 18, rating: 4.6, type: 'Theory' },
            { id: 231, name: 'Java Programming', code: 'TBC503', credits: 4, materials: 20, rating: 4.7, type: 'Theory' },
            { id: 232, name: 'Career Skills', code: 'TBC504', credits: 1, materials: 25, rating: 4.9, type: 'Theory' },
            { id: 233, name: 'Microcontroller', code: 'TBC505', credits: 3, materials: 15, rating: 4.4, type: 'Theory' },
            { id: 234, name: 'Introduction To AI', code: 'TBC506', credits: 3, materials: 15, rating: 4.4, type: 'Theory' },
            { id: 235, name: 'Object Oriented Analysis And Design', code: 'TBCA507', credits: 3, materials: 15, rating: 4.4, type: 'Theory' },
            { id: 236, name: 'Criptography', code: 'TBC508', credits: 3, materials: 15, rating: 4.4, type: 'Theory' },
            { id: 237, name: 'Object Oriented Analysis And Design Laboratory', code: 'PBCA501', credits: 2, materials: 15, rating: 4.4, type: 'Lab' },
            { id: 238, name: 'Introduction To AI Laboratory', code: 'PBC502', credits: 2, materials: 15, rating: 4.4, type: 'Lab' }

          ],
          6: [
            { id: 239, name: 'Computer Graphics', code: 'TBCA601', credits: 8, materials: 30, rating: 4.9, type: 'Theory' },
            { id: 240, name: 'Network Security And Cyber Laws', code: 'TBC602', credits: 4, materials: 18, rating: 4.7, type: 'Theory' },
            { id: 241, name: 'Fundamentals Of Machine Learning', code: 'TBC603', credits: 2, materials: 10, rating: 4.3, type: 'Theory' },
            { id: 242, name: 'Major Project', code: 'TBC604', credits: 3, materials: 14, rating: 4.5, type: 'Project' }
          ]
        }
      }
    }
  },

  // BBA (3 Years, 6 Semesters)
  3: {
    name: "BBA (Bachelor of Business Administration)",
    icon: "📊",
    duration: "3 Years (6 Semesters)",
    years: {
      1: {
        name: "First Year",
        semesters: {
          1: [
            { id: 301, name: 'Business Communication', code: 'BBA101', credits: 4, materials: 15, rating: 4.5, type: 'Theory' },
            { id: 302, name: 'Business Economics', code: 'BBA102', credits: 4, materials: 18, rating: 4.3, type: 'Theory' },
            { id: 303, name: 'Business Law', code: 'BBA103', credits: 3, materials: 16, rating: 4.2, type: 'Theory' },
            { id: 304, name: 'Computer Application In Management', code: 'BBA104', credits: 3, materials: 20, rating: 4.6, type: 'Lab' },
            { id: 305, name: 'Economics For Life', code: 'BBA105', credits: 3, materials: 14, rating: 4.1, type: 'Theory' },
            { id: 306, name: 'Financial Accounting', code: 'BBA106', credits: 4, materials: 22, rating: 4.7, type: 'Theory' },
            { id: 307, name: 'Principles Of Management', code: 'BBA107', credits: 4, materials: 18, rating: 4.4, type: 'Theory' }
          ],
          2: [
            { id: 308, name: 'Business Communication 2', code: 'BBA108', credits: 3, materials: 16, rating: 4.5, type: 'Theory' },
            { id: 309, name: 'Economics For Life 2', code: 'BBA109', credits: 3, materials: 14, rating: 4.3, type: 'Theory' },
            { id: 310, name: 'Environmental Science', code: 'BBA110', credits: 2, materials: 12, rating: 4.2, type: 'Theory' },
            { id: 311, name: 'Financial Management', code: 'BBA111', credits: 4, materials: 25, rating: 4.8, type: 'Theory' },
            { id: 312, name: 'Human Resource Management', code: 'BBA112', credits: 4, materials: 22, rating: 4.7, type: 'Theory' },
            { id: 313, name: 'Organizational Behaviour', code: 'BBA113', credits: 4, materials: 20, rating: 4.6, type: 'Theory' },
            { id: 314, name: 'Principles Of Marketing', code: 'BBA114', credits: 4, materials: 24, rating: 4.9, type: 'Theory' }
          ]
        }
      },
      2: {
        name: "Second Year",
        semesters: {
          3: [
            { id: 315, name: 'Accounting For Managers', code: 'BBA201', credits: 4, materials: 20, rating: 4.6, type: 'Theory' },
            { id: 316, name: 'Business Environment', code: 'BBA202', credits: 3, materials: 15, rating: 4.3, type: 'Theory' },
            { id: 317, name: 'Business Statistics', code: 'BBA203', credits: 4, materials: 18, rating: 4.5, type: 'Theory' },
            { id: 318, name: 'Career Skills', code: 'BBA204', credits: 2, materials: 12, rating: 4.2, type: 'Skill' },
            { id: 319, name: 'Entrepreneurship', code: 'BBA205', credits: 3, materials: 16, rating: 4.4, type: 'Theory' },
            { id: 320, name: 'Macro Economics', code: 'BBA206', credits: 4, materials: 17, rating: 4.3, type: 'Theory' }
          ],
          4: [
            { id: 321, name: 'Business Research', code: 'BBA207', credits: 4, materials: 20, rating: 4.7, type: 'Theory' },
            { id: 322, name: 'Career Skills', code: 'BBA208', credits: 2, materials: 12, rating: 4.4, type: 'Skill' },
            { id: 323, name: 'Digital Marketing', code: 'BBA209', credits: 3, materials: 25, rating: 4.8, type: 'Lab' },
            { id: 324, name: 'International Business', code: 'BBA210', credits: 4, materials: 18, rating: 4.6, type: 'Theory' },
            { id: 325, name: 'Logistics And Supply Chain Management', code: 'BBA211', credits: 3, materials: 16, rating: 4.5, type: 'Theory' },
            { id: 326, name: 'Production Management', code: 'BBA212', credits: 3, materials: 15, rating: 4.3, type: 'Theory' },
            { id: 327, name: 'Wellness And Stress Management', code: 'BBA213', credits: 2, materials: 10, rating: 4.2, type: 'Theory' }
          ]
        }
      },
      3: {
        name: "Final Year",
        semesters: {
          5: [
            { id: 328, name: 'Advertising', code: 'BBA301', credits: 3, materials: 16, rating: 4.5, type: 'Theory' },
            { id: 329, name: 'Business Strategy', code: 'BBA302', credits: 4, materials: 18, rating: 4.6, type: 'Theory' },
            { id: 330, name: 'Career Skills', code: 'BBA303', credits: 2, materials: 10, rating: 4.3, type: 'Skill' },
            { id: 331, name: 'Direct Tax Law', code: 'BBA304', credits: 3, materials: 20, rating: 4.7, type: 'Theory' },
            { id: 332, name: 'E Commerce', code: 'BBA305', credits: 3, materials: 22, rating: 4.8, type: 'Lab' },
            { id: 333, name: 'Indian Economy', code: 'BBA306', credits: 3, materials: 15, rating: 4.2, type: 'Theory' },
            { id: 334, name: 'Industrial Relations', code: 'BBA307', credits: 3, materials: 14, rating: 4.4, type: 'Theory' },
            { id: 335, name: 'Performance Management System', code: 'BBA308', credits: 3, materials: 16, rating: 4.5, type: 'Theory' },
            { id: 336, name: 'Sales Management', code: 'BBA309', credits: 3, materials: 18, rating: 4.6, type: 'Theory' },
            { id: 337, name: 'Working Capital Management', code: 'BBA310', credits: 3, materials: 17, rating: 4.3, type: 'Theory' }
          ],
          6: [
            { id: 338, name: 'Business Ethics And Values', code: 'BBA311', credits: 3, materials: 14, rating: 4.4, type: 'Theory' },
            { id: 339, name: 'Consumer Behaviour', code: 'BBA312', credits: 3, materials: 18, rating: 4.6, type: 'Theory' },
            { id: 340, name: 'Financial Institutions And Services', code: 'BBA313', credits: 4, materials: 20, rating: 4.7, type: 'Theory' },
            { id: 341, name: 'GST (Goods and Services Tax)', code: 'BBA314', credits: 3, materials: 16, rating: 4.5, type: 'Theory' },
            { id: 342, name: 'Money Banking And Finance', code: 'BBA315', credits: 4, materials: 22, rating: 4.8, type: 'Theory' },
            { id: 343, name: 'Rural Marketing', code: 'BBA316', credits: 3, materials: 16, rating: 4.5, type: 'Theory' },
            { id: 344, name: 'Training And Development', code: 'BBA317', credits: 3, materials: 15, rating: 4.3, type: 'Theory' },
            { id: 345, name: 'Wages And Salary Administration', code: 'BBA318', credits: 3, materials: 14, rating: 4.4, type: 'Theory' },
            { id: 346, name: 'Major Project', code: 'BBA319', credits: 8, materials: 30, rating: 4.9, type: 'Project' }
          ]
        }
      }
    }
  },
  
  // MBA (2 Years, 4 Semesters)
  4: {
    name: "MBA (Master of Business Administration)",
    icon: "🎓",
    duration: "2 Years (4 Semesters)",
    years: {
      1: {
        name: "First Year",
        semesters: {
          1: [
            // CORE SUBJECTS
            { id: 401, name: 'Accounting For Managers', code: 'MBA101', credits: 4, materials: 20, rating: 4.6, type: 'Core' },
            { id: 402, name: 'Business Communication', code: 'MBA102', credits: 3, materials: 18, rating: 4.5, type: 'Core' },
            { id: 403, name: 'Business Environment', code: 'MBA103', credits: 3, materials: 16, rating: 4.4, type: 'Core' },
            { id: 404, name: 'Business Statistics And Analytics For Decision Making', code: 'MBA104', credits: 4, materials: 22, rating: 4.7, type: 'Core' },
            { id: 405, name: 'Career Skills', code: 'MBA105', credits: 2, materials: 12, rating: 4.3, type: 'Skill' },
            { id: 406, name: 'Data Driven Decision Making', code: 'MBA106', credits: 3, materials: 20, rating: 4.8, type: 'Core' },
            { id: 407, name: 'Financial Reporting Statement And Analysis', code: 'MBA107', credits: 4, materials: 24, rating: 4.7, type: 'Core' },
            { id: 408, name: 'Human Resource Management', code: 'MBA108', credits: 4, materials: 22, rating: 4.6, type: 'Core' },
            { id: 409, name: 'Legal Aspects Of Business', code: 'MBA109', credits: 3, materials: 18, rating: 4.4, type: 'Core' },
            { id: 410, name: 'Managerial Economics', code: 'MBA110', credits: 4, materials: 20, rating: 4.7, type: 'Core' },
            { id: 411, name: 'Marketing Management', code: 'MBA111', credits: 4, materials: 25, rating: 4.8, type: 'Core' },
            { id: 412, name: 'Organizational Design And Behaviour', code: 'MBA112', credits: 3, materials: 16, rating: 4.5, type: 'Core' }
          ],
          2: [
            // CORE + SPECIALIZATION ELECTIVES
            { id: 413, name: 'Business Intelligence', code: 'MBA201', credits: 3, materials: 22, rating: 4.8, type: 'Elective' },
            { id: 414, name: 'Business Research Method', code: 'MBA202', credits: 3, materials: 18, rating: 4.6, type: 'Core' },
            { id: 415, name: 'Career Skills', code: 'MBA203', credits: 2, materials: 10, rating: 4.4, type: 'Skill' },
            { id: 416, name: 'Compensation And Reward Management', code: 'MBA204', credits: 3, materials: 16, rating: 4.5, type: 'Elective' },
            { id: 417, name: 'Consumer Behaviour And Insights', code: 'MBA205', credits: 3, materials: 20, rating: 4.7, type: 'Elective' },
            { id: 418, name: 'Corporate Finance', code: 'MBA206', credits: 4, materials: 25, rating: 4.9, type: 'Core' },
            { id: 419, name: 'Corporate Tax Planning', code: 'MBA207', credits: 3, materials: 18, rating: 4.6, type: 'Elective' },
            { id: 420, name: 'Cross Cultural Management', code: 'MBA208', credits: 3, materials: 15, rating: 4.5, type: 'Elective' },
            { id: 421, name: 'Data Mining', code: 'MBA209', credits: 3, materials: 22, rating: 4.8, type: 'Elective' },
            { id: 422, name: 'Data Science Using R', code: 'MBA210', credits: 3, materials: 24, rating: 4.9, type: 'Lab' },
            { id: 423, name: 'Entrepreneurship', code: 'MBA211', credits: 3, materials: 16, rating: 4.5, type: 'Elective' },
            { id: 424, name: 'Financial Institutions And Markets', code: 'MBA212', credits: 4, materials: 20, rating: 4.7, type: 'Core' },
            { id: 425, name: 'Financial Management', code: 'MBA213', credits: 4, materials: 22, rating: 4.8, type: 'Core' },
            { id: 426, name: 'Human Resource Management', code: 'MBA214', credits: 4, materials: 20, rating: 4.6, type: 'Core' },
            { id: 427, name: 'Indian Ethos And Business Ethics', code: 'MBA215', credits: 2, materials: 12, rating: 4.4, type: 'Core' },
            { id: 428, name: 'Industrial Relation And Labour Laws', code: 'MBA216', credits: 3, materials: 16, rating: 4.5, type: 'Elective' },
            { id: 429, name: 'Integrated Market Communications', code: 'MBA217', credits: 3, materials: 18, rating: 4.7, type: 'Elective' },
            { id: 430, name: 'Logistics And Supply Chain Management', code: 'MBA218', credits: 3, materials: 20, rating: 4.8, type: 'Elective' },
            { id: 431, name: 'Marketing Management', code: 'MBA219', credits: 4, materials: 22, rating: 4.7, type: 'Core' },
            { id: 432, name: 'Operations Research', code: 'MBA220', credits: 3, materials: 18, rating: 4.6, type: 'Core' },
            { id: 433, name: 'Organizational Behaviour', code: 'MBA221', credits: 3, materials: 16, rating: 4.5, type: 'Core' },
            { id: 434, name: 'Quantitative Techniques', code: 'MBA222', credits: 3, materials: 15, rating: 4.4, type: 'Core' },
            { id: 435, name: 'Research Methodology', code: 'MBA223', credits: 3, materials: 18, rating: 4.6, type: 'Core' },
            { id: 436, name: 'Sales Force And Channel Management', code: 'MBA224', credits: 3, materials: 16, rating: 4.5, type: 'Elective' },
            { id: 437, name: 'Security Analysis And Portfolio Management', code: 'MBA225', credits: 3, materials: 20, rating: 4.8, type: 'Elective' },
            { id: 438, name: 'Warehousing And Inventory Management', code: 'MBA226', credits: 3, materials: 15, rating: 4.4, type: 'Elective' }
          ]
        }
      },
      2: {
        name: "Final Year",
        semesters: {
          3: [
            // SPECIALIZATION COURSES
            { id: 439, name: 'Compensation And Benefits Management', code: 'MBA301', credits: 3, materials: 16, rating: 4.5, type: 'Elective' },
            { id: 440, name: 'Consumer Behaviour', code: 'MBA302', credits: 3, materials: 18, rating: 4.7, type: 'Elective' },
            { id: 441, name: 'Corporate Strategy', code: 'MBA303', credits: 4, materials: 20, rating: 4.8, type: 'Core' },
            { id: 442, name: 'Data Mining', code: 'MBA304', credits: 3, materials: 20, rating: 4.8, type: 'Elective' },
            { id: 443, name: 'Data Science Using R', code: 'MBA305', credits: 3, materials: 22, rating: 4.9, type: 'Lab' },
            { id: 444, name: 'Employee Relations', code: 'MBA306', credits: 3, materials: 15, rating: 4.4, type: 'Elective' },
            { id: 445, name: 'Integrated Marketing Communication', code: 'MBA307', credits: 3, materials: 18, rating: 4.7, type: 'Elective' },
            { id: 446, name: 'Investment Analysis And Portfolio Management', code: 'MBA308', credits: 4, materials: 24, rating: 4.9, type: 'Elective' },
            { id: 447, name: 'Logistics And Supply Chain Management', code: 'MBA309', credits: 3, materials: 20, rating: 4.8, type: 'Elective' },
            { id: 448, name: 'Managing Banks And Financial Institutions', code: 'MBA310', credits: 4, materials: 22, rating: 4.7, type: 'Elective' },
            { id: 449, name: 'Performance Management System', code: 'MBA311', credits: 3, materials: 16, rating: 4.5, type: 'Elective' },
            { id: 450, name: 'Sales And Distributed Management', code: 'MBA312', credits: 3, materials: 18, rating: 4.6, type: 'Elective' },
            { id: 451, name: 'Warehousing And Inventory Management', code: 'MBA313', credits: 3, materials: 15, rating: 4.4, type: 'Elective' },
            { id: 452, name: 'Working Capital Management', code: 'MBA314', credits: 3, materials: 17, rating: 4.5, type: 'Elective' }
          ],
          4: [
            // ADVANCED SPECIALIZATION + PROJECTS
            { id: 453, name: 'Corporate Taxation', code: 'MBA401', credits: 3, materials: 18, rating: 4.6, type: 'Elective' },
            { id: 454, name: 'Data Science With Python', code: 'MBA402', credits: 3, materials: 25, rating: 4.9, type: 'Lab' },
            { id: 455, name: 'Data Visualization For Manager', code: 'MBA403', credits: 3, materials: 20, rating: 4.8, type: 'Lab' },
            { id: 456, name: 'Digital Marketing', code: 'MBA404', credits: 3, materials: 28, rating: 4.9, type: 'Lab' },
            { id: 457, name: 'Export And Trade Documentation', code: 'MBA405', credits: 3, materials: 16, rating: 4.5, type: 'Elective' },
            { id: 458, name: 'Financial Derivatives', code: 'MBA406', credits: 4, materials: 22, rating: 4.7, type: 'Elective' },
            { id: 459, name: 'International Finance', code: 'MBA407', credits: 4, materials: 20, rating: 4.8, type: 'Elective' },
            { id: 460, name: 'International Marketing', code: 'MBA408', credits: 3, materials: 18, rating: 4.7, type: 'Elective' },
            { id: 461, name: 'IT Application', code: 'MBA409', credits: 3, materials: 20, rating: 4.6, type: 'Lab' },
            { id: 462, name: 'Manpower Planning Recruitment And Selection', code: 'MBA410', credits: 3, materials: 16, rating: 4.5, type: 'Elective' },
            { id: 463, name: 'Organizational Change And Development', code: 'MBA411', credits: 3, materials: 15, rating: 4.4, type: 'Elective' },
            { id: 464, name: 'Project Management', code: 'MBA412', credits: 3, materials: 22, rating: 4.8, type: 'Core' },
            { id: 465, name: 'Retail Management', code: 'MBA413', credits: 3, materials: 18, rating: 4.7, type: 'Elective' },
            { id: 466, name: 'Strategic HRM', code: 'MBA414', credits: 4, materials: 20, rating: 4.8, type: 'Elective' },
            { id: 467, name: 'Summer Internship', code: 'MBA415', credits: 4, materials: 25, rating: 4.9, type: 'Project' },
            { id: 468, name: 'Major Project', code: 'MBA416', credits: 8, materials: 40, rating: 4.9, type: 'Project' }
          ]
        }
      }
    }
  },

  // MCA (2 Years, 4 Semesters)
  5: {
    name: "MCA (Master of Computer Applications)",
    icon: "💼",
    duration: "2 Years (4 Semesters)",
    years: {
      1: {
        name: "First Year",
        semesters: {
          1: [
            { id: 501, name: 'C Programming', code: 'MCA101', credits: 4, materials: 20, rating: 4.7, type: 'Lab' },
            { id: 502, name: 'Career Skills', code: 'MCA102', credits: 2, materials: 12, rating: 4.6, type: 'Theory' },
            { id: 503, name: 'Cloud Computing', code: 'MCA103', credits: 4, materials: 22, rating: 4.8, type: 'Theory' },
            { id: 504, name: 'Computer Organization and Architecture', code: 'MCA104', credits: 3, materials: 18, rating: 4.5, type: 'Theory' },
            { id: 505, name: 'Computer Network', code: 'MCA105', credits: 4, materials: 21, rating: 4.7, type: 'Theory' },
            { id: 506, name: 'Discrete Structures and Combinatorics', code: 'MCA106', credits: 3, materials: 17, rating: 4.4, type: 'Theory' },
            { id: 507, name: 'Full Stack Development', code: 'MCA107', credits: 4, materials: 25, rating: 4.9, type: 'Lab' },
            { id: 508, name: 'Operating Systems', code: 'MCA108', credits: 4, materials: 22, rating: 4.7, type: 'Lab' },
            { id: 509, name: 'Probability and Statistics', code: 'MCA109', credits: 3, materials: 16, rating: 4.5, type: 'Theory' },
            { id: 510, name: 'Python Programming', code: 'MCA110', credits: 4, materials: 24, rating: 4.8, type: 'Lab' }
          ],
          2: [
            { id: 511, name: 'Career Skills', code: 'MCA111', credits: 2, materials: 13, rating: 4.6, type: 'Theory' },
            { id: 512, name: 'Database Management Systems', code: 'MCA112', credits: 4, materials: 23, rating: 4.8, type: 'Lab' },
            { id: 513, name: 'Data Structures', code: 'MCA113', credits: 4, materials: 22, rating: 4.7, type: 'Lab' },
            { id: 514, name: 'IoT (Internet of Things)', code: 'MCA114', credits: 3, materials: 19, rating: 4.5, type: 'Lab' },
            { id: 515, name: 'Java Programming', code: 'MCA115', credits: 4, materials: 25, rating: 4.8, type: 'Lab' },
            { id: 516, name: 'Machine Learning', code: 'MCA116', credits: 4, materials: 24, rating: 4.7, type: 'Lab' },
            { id: 517, name: 'Software Project Management', code: 'MCA117', credits: 3, materials: 18, rating: 4.5, type: 'Theory' }
          ]
        }
      },
      2: {
        name: "Final Year",
        semesters: {
          3: [
            { id: 518, name: 'AI and ML (Artificial Intelligence and Machine Learning)', code: 'MCA201', credits: 4, materials: 26, rating: 4.8, type: 'Lab' },
            { id: 519, name: 'Big Data and Visualization', code: 'MCA202', credits: 4, materials: 24, rating: 4.7, type: 'Lab' },
            { id: 520, name: 'Design and Analysis of Algorithms', code: 'MCA203', credits: 3, materials: 20, rating: 4.6, type: 'Theory' },
            { id: 521, name: 'Image Processing and Computer Vision', code: 'MCA204', credits: 4, materials: 23, rating: 4.8, type: 'Lab' },
            { id: 522, name: 'Machine Learning Using Python', code: 'MCA205', credits: 4, materials: 26, rating: 4.9, type: 'Lab' },
            { id: 523, name: 'Mobile Application Development', code: 'MCA206', credits: 4, materials: 24, rating: 4.8, type: 'Lab' },
            { id: 524, name: 'Optimization Techniques', code: 'MCA207', credits: 3, materials: 18, rating: 4.5, type: 'Theory' },
            { id: 525, name: 'Theory of Computation and Compiler Construction', code: 'MCA208', credits: 4, materials: 22, rating: 4.6, type: 'Theory' }
          ],
          4: [
            { id: 526, name: 'Advanced Software Testing', code: 'MCA209', credits: 4, materials: 23, rating: 4.7, type: 'Lab' },
            { id: 527, name: 'Data Mining and Warehousing', code: 'MCA210', credits: 4, materials: 25, rating: 4.8, type: 'Lab' },
            { id: 528, name: 'Deep Learning', code: 'MCA211', credits: 4, materials: 27, rating: 4.9, type: 'Lab' },
            { id: 529, name: 'Enterprise Architecture Using C Sharp', code: 'MCA212', credits: 4, materials: 24, rating: 4.7, type: 'Lab' },
            { id: 530, name: 'Graphics and Visual Computing', code: 'MCA213', credits: 4, materials: 22, rating: 4.6, type: 'Lab' },
            { id: 531, name: 'Network Security and Cryptography', code: 'MCA214', credits: 4, materials: 25, rating: 4.8, type: 'Lab' },
            { id: 532, name: 'R Programming', code: 'MCA215', credits: 3, materials: 20, rating: 4.7, type: 'Lab' },
            { id: 533, name: 'Soft Computing', code: 'MCA216', credits: 3, materials: 19, rating: 4.6, type: 'Theory' }
          ]
        }
      }
    }
  }
};

// Helper functions
export const getSubjects = (courseId, yearId, semId) => {
  const course = coursesData[courseId];
  if (!course || !course.years[yearId] || !course.years[yearId].semesters[semId]) {
    return [];
  }
  return course.years[yearId].semesters[semId];
};

export const getAllCourses = () => {
  return Object.entries(coursesData).map(([id, data]) => ({
    id,
    name: data.name,
    icon: data.icon,
    duration: data.duration
  }));
};

export const getCourseInfo = (courseId) => {
  return coursesData[courseId] || null;
};

export const getYearsForCourse = (courseId) => {
  const course = coursesData[courseId];
  if (!course) return [];
  
  return Object.entries(course.years).map(([yearId, yearData]) => ({
    id: yearId,
    name: yearData.name,
    semesters: Object.keys(yearData.semesters).length
  }));
};

export const getTotalSubjectsCount = (courseId) => {
  const course = coursesData[courseId];
  if (!course) return 0;
  
  let total = 0;
  Object.values(course.years).forEach(year => {
    Object.values(year.semesters).forEach(semester => {
      total += semester.length;
    });
  });
  return total;
};

export const getTotalMaterialsCount = (courseId) => {
  const course = coursesData[courseId];
  if (!course) return 0;
  
  let total = 0;
  Object.values(course.years).forEach(year => {
    Object.values(year.semesters).forEach(semester => {
      semester.forEach(subject => {
        total += subject.materials;
      });
    });
  });
  return total;
};