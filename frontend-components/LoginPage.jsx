// Creative Connect Platform - Login Component
// Employee Authentication UI

import React, { useState } from 'react';

const colors = {
    neonAqua: '#00F5FF',
    neonViolet: '#7B2CFF',
    midnightBlack: '#000000',
    graphite: '#222222',
    white: '#FFFFFF'
};

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('cc_token', data.token);
                localStorage.setItem('cc_refresh_token', data.refreshToken);
                localStorage.setItem('cc_user', JSON.stringify(data.employee));
                onLogin(data.employee);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${colors.midnightBlack} 0%, ${colors.graphite} 100%)`,
            fontFamily: "'Inter', sans-serif",
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        },
        bgGrid: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `
                linear-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 245, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            pointerEvents: 'none'
        },
        glowOrb: {
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            filter: 'blur(100px)',
            opacity: 0.15,
            pointerEvents: 'none'
        },
        card: {
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: '24px',
            padding: '50px 40px',
            width: '100%',
            maxWidth: '420px',
            position: 'relative',
            zIndex: 1,
            backdropFilter: 'blur(20px)'
        },
        logo: {
            textAlign: 'center',
            marginBottom: '40px'
        },
        logoText: {
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: '1.8rem',
            background: `linear-gradient(135deg, ${colors.neonAqua}, ${colors.neonViolet})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        subtitle: {
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.95rem',
            marginTop: '10px'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        label: {
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.9rem',
            fontWeight: 500
        },
        input: {
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: colors.white,
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s ease'
        },
        button: {
            padding: '16px',
            background: `linear-gradient(135deg, ${colors.neonAqua}, ${colors.neonViolet})`,
            border: 'none',
            borderRadius: '12px',
            color: colors.midnightBlack,
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '10px'
        },
        error: {
            background: 'rgba(255,107,107,0.1)',
            border: '1px solid rgba(255,107,107,0.3)',
            borderRadius: '8px',
            padding: '12px',
            color: '#FF6B6B',
            fontSize: '0.9rem',
            textAlign: 'center'
        },
        footer: {
            textAlign: 'center',
            marginTop: '30px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.85rem'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.bgGrid}></div>
            <div style={{ ...styles.glowOrb, background: colors.neonAqua, top: '-150px', right: '-150px' }}></div>
            <div style={{ ...styles.glowOrb, background: colors.neonViolet, bottom: '-150px', left: '-150px' }}></div>
            
            <div style={styles.card}>
                <div style={styles.logo}>
                    <div style={styles.logoText}>⚔️ CREATIVE CONNECT</div>
                    <div style={styles.subtitle}>Employee Dashboard</div>
                </div>

                <form style={styles.form} onSubmit={handleSubmit}>
                    {error && <div style={styles.error}>{error}</div>}
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@creativeconnect.io"
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            style={styles.input}
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={styles.footer}>
                    Launching Valentine's Day 2026 💜
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
