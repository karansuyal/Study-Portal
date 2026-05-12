import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userParam = params.get('user');

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                localStorage.setItem('study_portal_token', token);
                localStorage.setItem('study_portal_user', JSON.stringify(user));
                navigate('/');
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate, location]);

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <div className="loading-spinner"></div>
            <p>Logging you in...</p>
        </div>
    );
};

export default AuthCallback;