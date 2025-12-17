// Creative Connect Platform - Employee Dashboard Component
// React Component for Dashboard UI

import React, { useState, useEffect } from 'react';

// Brand Colors from Creative Connect Brand Guide
const colors = {
    neonAqua: '#00F5FF',
    neonViolet: '#7B2CFF',
    midnightBlack: '#000000',
    graphite: '#222222',
    white: '#FFFFFF',
    divisions: {
        coo: '#708090',   // Steel
        cmo: '#7B2CFF',   // Violet
        cto: '#0066FF',   // Blue
        smd: '#00F5FF',   // Aqua
        ccro: '#FF6B6B'   // Coral
    }
};

// Dashboard Styles
const styles = {
    container: {
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.midnightBlack} 0%, ${colors.graphite} 100%)`,
        color: colors.white,
        fontFamily: "'Inter', sans-serif",
        padding: '20px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        border: '1px solid rgba(0,245,255,0.1)'
    },
    logo: {
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 800,
        fontSize: '1.5rem',
        background: `linear-gradient(135deg, ${colors.neonAqua}, ${colors.neonViolet})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    avatar: {
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${colors.neonAqua}, ${colors.neonViolet})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    card: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '25px',
        transition: 'all 0.3s ease'
    },
    statCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(0,245,255,0.2)',
        borderRadius: '16px',
        padding: '25px',
        textAlign: 'center'
    },
    statNumber: {
        fontSize: '2.5rem',
        fontWeight: 800,
        background: `linear-gradient(135deg, ${colors.neonAqua}, ${colors.neonViolet})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '5px'
    },
    statLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    sectionTitle: {
        fontFamily: "'Montserrat', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    taskList: {
        listStyle: 'none',
        padding: 0,
        margin: 0
    },
    taskItem: {
        padding: '15px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 600
    },
    button: {
        padding: '12px 24px',
        background: `linear-gradient(135deg, ${colors.neonAqua}, ${colors.neonViolet})`,
        border: 'none',
        borderRadius: '8px',
        color: colors.midnightBlack,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    countdown: {
        textAlign: 'center',
        padding: '30px',
        background: 'rgba(123,44,255,0.1)',
        borderRadius: '16px',
        border: '1px solid rgba(123,44,255,0.3)',
        marginBottom: '30px'
    }
};

// Dashboard Component
const EmployeeDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        tasksToday: 0,
        tasksPending: 0,
        tasksCompleted: 0,
        teamMembers: 0
    });
    const [tasks, setTasks] = useState([]);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [loading, setLoading] = useState(true);

    // Calculate countdown to Valentine's Day 2026
    useEffect(() => {
        const updateCountdown = () => {
            const launchDate = new Date('February 14, 2026 00:00:00').getTime();
            const now = new Date().getTime();
            const distance = launchDate - now;

            setCountdown({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('cc_token');
                
                // Fetch user data
                const userRes = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userData = await userRes.json();
                if (userData.success) setUser(userData.employee);

                // Fetch dashboard stats
                const dashRes = await fetch('/api/dashboard/overview', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const dashData = await dashRes.json();
                if (dashData.success) {
                    setStats(dashData.dashboard);
                }

                // Fetch VA tasks
                const tasksRes = await fetch('/api/va/tasks?status=pending', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const tasksData = await tasksRes.json();
                if (tasksData.success) setTasks(tasksData.tasks.slice(0, 5));

                setLoading(false);
            } catch (error) {
                console.error('Dashboard fetch error:', error);
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'high': return '#FF6B6B';
            case 'medium': return '#FFD93D';
            case 'low': return '#6BCB77';
            default: return colors.neonAqua;
        }
    };

    const getDivisionColor = (division) => {
        return colors.divisions[division] || colors.neonAqua;
    };

    if (loading) {
        return (
            <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={styles.logo}>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.logo}>⚔️ CREATIVE CONNECT</div>
                <div style={styles.userInfo}>
                    <div>
                        <div style={{ fontWeight: 600 }}>{user?.firstName} {user?.lastName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            {user?.title || user?.role}
                        </div>
                    </div>
                    <div style={styles.avatar}>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                </div>
            </header>

            {/* Launch Countdown */}
            <div style={styles.countdown}>
                <div style={{ fontSize: '0.9rem', color: colors.neonViolet, marginBottom: '10px', letterSpacing: '2px' }}>
                    🚀 LAUNCHING IN
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    {[
                        { value: countdown.days, label: 'DAYS' },
                        { value: countdown.hours, label: 'HOURS' },
                        { value: countdown.minutes, label: 'MINS' },
                        { value: countdown.seconds, label: 'SECS' }
                    ].map((item, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={styles.statNumber}>{String(item.value).padStart(2, '0')}</div>
                            <div style={styles.statLabel}>{item.label}</div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '15px', color: 'rgba(255,255,255,0.6)' }}>
                    Valentine's Day 2026 💜
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.grid}>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{stats.tasksToday || 0}</div>
                    <div style={styles.statLabel}>Tasks Today</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{stats.tasksPending || 0}</div>
                    <div style={styles.statLabel}>Pending</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{stats.tasksCompleted || 0}</div>
                    <div style={styles.statLabel}>Completed</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{stats.teamMembers || 0}</div>
                    <div style={styles.statLabel}>Team Members</div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Tasks Section */}
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>📋 Today's Tasks</h2>
                    <ul style={styles.taskList}>
                        {tasks.length === 0 ? (
                            <li style={styles.taskItem}>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>No pending tasks</span>
                            </li>
                        ) : (
                            tasks.map((task, i) => (
                                <li key={i} style={styles.taskItem}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{task.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                                            {task.category?.replace('_', ' ')}
                                        </div>
                                    </div>
                                    <span style={{
                                        ...styles.badge,
                                        background: getPriorityColor(task.priority),
                                        color: '#000'
                                    }}>
                                        {task.priority}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                    <button style={{ ...styles.button, marginTop: '20px', width: '100%' }}>
                        View All Tasks
                    </button>
                </div>

                {/* Quick Actions */}
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button style={styles.button}>Generate Daily Tasks</button>
                        <button style={{ ...styles.button, background: 'transparent', border: `1px solid ${colors.neonAqua}`, color: colors.neonAqua }}>
                            View DM Scripts
                        </button>
                        <button style={{ ...styles.button, background: 'transparent', border: `1px solid ${colors.neonViolet}`, color: colors.neonViolet }}>
                            Team Overview
                        </button>
                        <button style={{ ...styles.button, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)' }}>
                            Payment Stats
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
