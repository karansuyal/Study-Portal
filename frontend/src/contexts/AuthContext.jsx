// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import config from '../config/config';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [authError, setAuthError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check localStorage on app start
//     const savedUser = localStorage.getItem(config.AUTH.USER_KEY);
//     const savedToken = localStorage.getItem(config.AUTH.TOKEN_KEY);
    
//     if (savedUser && savedToken) {
//       try {
//         const parsedUser = JSON.parse(savedUser);
        
//         // Check if token is expired
//         const tokenData = parseJwt(savedToken);
//         if (tokenData && tokenData.exp * 1000 > Date.now()) {
//           setUser(parsedUser);
//         } else {
//           // Token expired, logout
//           logout();
//         }
//       } catch (error) {
//         console.error('Error parsing saved user:', error);
//         logout();
//       }
//     }
//     setLoading(false);
//   }, []);

//   // Helper function to parse JWT token
//   const parseJwt = (token) => {
//     try {
//       const base64Url = token.split('.')[1];
//       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       return JSON.parse(window.atob(base64));
//     } catch (error) {
//       return null;
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       setAuthError(null);
      
//       // In production, replace with actual API call
//       // const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({ email, password })
//       // });
      
//       // For demo - simulate API call
//       return new Promise((resolve, reject) => {
//         setTimeout(() => {
//           if (email === 'demo@student.com' && password === 'demo123') {
//             const mockUser = {
//               id: 1,
//               email: email,
//               name: 'Demo Student',
//               role: 'student',
//               course: 'B.Tech',
//               year: 2,
//               semester: 3,
//               profilePic: '👨‍🎓',
//               createdAt: new Date().toISOString(),
//               permissions: ['view_courses', 'download_materials', 'upload_materials']
//             };
            
//             const mockToken = 'mock-jwt-token-12345';
            
//             localStorage.setItem(config.AUTH.TOKEN_KEY, mockToken);
//             localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(mockUser));
//             setUser(mockUser);
//             resolve({ user: mockUser, token: mockToken });
//           } else if (email === 'admin@college.com' && password === 'admin123') {
//             const mockUser = {
//               id: 2,
//               email: email,
//               name: 'College Admin',
//               role: 'admin',
//               profilePic: '👨‍🏫',
//               createdAt: new Date().toISOString(),
//               permissions: ['view_all', 'upload_materials', 'manage_users', 'delete_content']
//             };
            
//             const mockToken = 'mock-admin-token-67890';
            
//             localStorage.setItem(config.AUTH.TOKEN_KEY, mockToken);
//             localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(mockUser));
//             setUser(mockUser);
//             resolve({ user: mockUser, token: mockToken });
//           } else {
//             setAuthError('Invalid email or password');
//             reject(new Error('Invalid credentials'));
//           }
//         }, 1000);
//       });
      
//     } catch (error) {
//       setAuthError(error.message || 'Login failed');
//       throw error;
//     }
//   };

//   const register = async (userData) => {
//     try {
//       setAuthError(null);
      
//       // In production, replace with actual API call
//       // const response = await fetch(`${config.API_BASE_URL}/api/auth/register`, {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify(userData)
//       // });
      
//       // For demo - simulate API call
//       return new Promise((resolve, reject) => {
//         setTimeout(() => {
//           const newUser = {
//             id: Date.now(),
//             email: userData.email,
//             name: userData.name,
//             role: 'student',
//             course: userData.course || 'B.Tech',
//             year: 1,
//             semester: 1,
//             profilePic: '👤',
//             createdAt: new Date().toISOString(),
//             permissions: ['view_courses', 'download_materials']
//           };
          
//           const mockToken = 'mock-register-token-' + Date.now();
          
//           localStorage.setItem(config.AUTH.TOKEN_KEY, mockToken);
//           localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(newUser));
//           setUser(newUser);
//           resolve({ user: newUser, token: mockToken });
//         }, 1000);
//       });
      
//     } catch (error) {
//       setAuthError(error.message || 'Registration failed');
//       throw error;
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem(config.AUTH.TOKEN_KEY);
//     localStorage.removeItem(config.AUTH.USER_KEY);
//     setUser(null);
//     setAuthError(null);
//     navigate('/');
//   };

//   const updateProfile = (updatedData) => {
//     try {
//       const updatedUser = { ...user, ...updatedData };
//       localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(updatedUser));
//       setUser(updatedUser);
//     } catch (error) {
//       console.error('Error updating profile:', error);
//     }
//   };

//   const checkPermission = (permission) => {
//     if (!user) return false;
//     if (user.role === 'admin') return true;
//     return user.permissions?.includes(permission) || false;
//   };

//   const getUserStats = () => {
//     if (!user) return null;
    
//     // Mock stats - replace with actual API call
//     return {
//       downloads: 42,
//       uploads: 15,
//       bookmarks: 8,
//       lastLogin: '2024-01-15'
//     };
//   };

//   const isCourseAccessible = (courseId) => {
//     if (!user) return false;
//     if (user.role === 'admin') return true;
    
//     // Students can access all courses for demo
//     // In real app, check if user is enrolled in this course
//     return user.role === 'student';
//   };

//   return (
//     <AuthContext.Provider value={{ 
//       user, 
//       loading, 
//       authError,
//       login, 
//       register,
//       logout,
//       updateProfile,
//       checkPermission,
//       getUserStats,
//       isCourseAccessible,
//       isAuthenticated: !!user,
//       isAdmin: user?.role === 'admin',
//       isStudent: user?.role === 'student'
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Higher Order Component for protected routes
// export const withAuth = (Component) => {
//   return function ProtectedComponent(props) {
//     const { isAuthenticated, loading } = useAuth();
    
//     if (loading) {
//       return (
//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'center', 
//           alignItems: 'center',
//           height: '100vh'
//         }}>
//           <div>Loading authentication...</div>
//         </div>
//       );
//     }
    
//     if (!isAuthenticated) {
//       return <Navigate to="/login" />;
//     }
    
//     return <Component {...props} />;
//   };
// };

// // Higher Order Component for admin routes
// export const withAdmin = (Component) => {
//   return function AdminComponent(props) {
//     const { isAdmin, loading } = useAuth();
    
//     if (loading) {
//       return (
//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'center', 
//           alignItems: 'center',
//           height: '100vh'
//         }}>
//           <div>Loading authentication...</div>
//         </div>
//       );
//     }
    
//     if (!isAdmin) {
//       return <Navigate to="/" />;
//     }
    
//     return <Component {...props} />;
//   };
// };


// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import config from '../config/config';

const AuthContext = createContext();

// ✅ FIX: Safer useAuth hook
export const useAuth = () => {
  try {
    const context = useContext(AuthContext);
    if (!context) {
      console.warn('useAuth used outside AuthProvider');
      // Return a fallback context instead of throwing
      return {
        user: null,
        loading: false,
        authError: null,
        login: () => Promise.reject(new Error('Not authenticated')),
        loginWithCredentials: () => Promise.reject(new Error('Not authenticated')),
        register: () => Promise.reject(new Error('Not authenticated')),
        logout: () => {},
        updateProfile: () => {},
        checkPermission: () => false,
        isCourseAccessible: () => false,
        isAuthenticated: false,
        isAdmin: false,
        isStudent: false
      };
    }
    return context;
  } catch (error) {
    console.error('Error in useAuth hook:', error);
    throw new Error('Invalid credentials');
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check localStorage on app start
    try {
      const savedUser = localStorage.getItem(config.AUTH.USER_KEY);
      const savedToken = localStorage.getItem(config.AUTH.TOKEN_KEY);
      
      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading auth from localStorage:', error);
      // Clear invalid data
      localStorage.removeItem(config.AUTH.TOKEN_KEY);
      localStorage.removeItem(config.AUTH.USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIX: Simpler login function
  const login = async (userData, token) => {
    try {
      setAuthError(null);
      
      if (!userData || !token) {
        throw new Error('Invalid login data');
      }
      
      // Store in localStorage
      localStorage.setItem(config.AUTH.TOKEN_KEY, token);
      localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(userData));
      setUser(userData);
      
      return { user: userData, token };
      
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const loginWithCredentials = async (email, password) => {
    try {
      setAuthError(null);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(config.AUTH.TOKEN_KEY, data.access_token);
        localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
        return data;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login with credentials error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setAuthError(null);
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(config.AUTH.TOKEN_KEY);
    localStorage.removeItem(config.AUTH.USER_KEY);
    setUser(null);
    setAuthError(null);
    window.location.href = '/';
  };

  const updateProfile = (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const checkPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  const isCourseAccessible = (courseId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === 'student' || user.role === 'user';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      authError,
      login, 
      loginWithCredentials,
      register,
      logout,
      updateProfile,
      checkPermission,
      isCourseAccessible,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isStudent: user?.role === 'student' || user?.role === 'user'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;