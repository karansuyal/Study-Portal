import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userParam = params.get('user');

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                // Go through the shared AuthContext.login() instead of writing
                // to localStorage directly — it also fires the
                // "loginStateChanged" event so the navbar (and anything else
                // watching auth state) updates immediately, with no refresh
                // needed.
                login(user, token);
                navigate('/');
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate, location, login]);

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <div className="loading-spinner"></div>
            <p>Logging you in...</p>
        </div>
    );
};

export default AuthCallback;