// Creative Connect Platform - Main App Component
// Handles routing between Login and Dashboard

import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import EmployeeDashboard from './EmployeeDashboard';
import { isAuthenticated, getUser, clearAuth } from './api';

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        if (isAuthenticated()) {
            const storedUser = getUser();
            if (storedUser) {
                setUser(storedUser);
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        clearAuth();
        setUser(null);
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                color: '#00F5FF',
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '1.5rem'
            }}>
                Loading...
            </div>
        );
    }

    return user ? (
        <EmployeeDashboard user={user} onLogout={handleLogout} />
    ) : (
        <LoginPage onLogin={handleLogin} />
    );
};

export default App;
