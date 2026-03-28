// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Please login first</h2>
        <a href="/login">Go to Login</a>
      </div>
    );
  }
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>👤 User Dashboard</h1>
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.5rem'
          }}>
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{user.name}</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>
              {user.email} • {user.branch} • Semester {user.semester}
            </p>
          </div>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: '#f0f9ff', 
            padding: '1.5rem', 
            borderRadius: '8px',
            borderLeft: '4px solid #0ea5e9'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>📤 My Uploads</h3>
            <p style={{ fontSize: '2rem', margin: 0, color: '#0ea5e9' }}>0</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
              Notes uploaded by you
            </p>
          </div>
          
          <div style={{ 
            background: '#fefce8', 
            padding: '1.5rem', 
            borderRadius: '8px',
            borderLeft: '4px solid #f59e0b'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>⬇️ Downloads</h3>
            <p style={{ fontSize: '2rem', margin: 0, color: '#f59e0b' }}>0</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
              Total downloads of your notes
            </p>
          </div>
          
          <div style={{ 
            background: '#f0fdf4', 
            padding: '1.5rem', 
            borderRadius: '8px',
            borderLeft: '4px solid #10b981'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>⭐ Rating</h3>
            <p style={{ fontSize: '2rem', margin: 0, color: '#10b981' }}>0.0</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
              Average rating of your notes
            </p>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={logout}
            style={{
              background: '#ef4444',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;