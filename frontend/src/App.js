// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BreadcrumbNav from './components/BreadcrumbNav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/404';
import './App.css';
import About from './pages/About';
import { AuthProvider } from './contexts/AuthContext';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';
import AllMaterials from './pages/AllMaterials';


// ✅ HIERARCHICAL PAGES IMPORTS
import YearSelection from './pages/YearSelection.jsx';
import SemesterSelection from './pages/SemesterSelection.jsx';
import SubjectSelection from './pages/SubjectSelection.jsx';
import MaterialsPage from './pages/MaterialsPage.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div
          className="App"
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        >
          <Navbar />
          <BreadcrumbNav />

          <main style={{ padding: '20px', flex: 1 }}>
            <Routes>
              {/* Existing Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/about" element={<About />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/all-materials" element={<AllMaterials />} />
             


              {/* New Hierarchical Routes */}
              <Route path="/course/:courseId" element={<YearSelection />} />
              <Route path="/course/:courseId/year/:yearId" element={<SemesterSelection />} />
              <Route path="/course/:courseId/year/:yearId/sem/:semId" element={<SubjectSelection />} />
              <Route
                path="/course/:courseId/year/:yearId/sem/:semId/subject/:subjectId"
                element={<MaterialsPage />}
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}


export default App;
