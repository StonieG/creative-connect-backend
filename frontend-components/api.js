// Creative Connect Platform - API Utilities
// Helper functions for API calls with authentication

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Get stored auth token
export const getToken = () => localStorage.getItem('cc_token');
export const getRefreshToken = () => localStorage.getItem('cc_refresh_token');
export const getUser = () => {
    const user = localStorage.getItem('cc_user');
    return user ? JSON.parse(user) : null;
};

// Clear auth data
export const clearAuth = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_refresh_token');
    localStorage.removeItem('cc_user');
};

// Check if user is authenticated
export const isAuthenticated = () => !!getToken();

// Authenticated fetch wrapper
export const authFetch = async (endpoint, options = {}) => {
    const token = getToken();
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        }
    };

    try {
        let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // If token expired, try to refresh
        if (response.status === 401) {
            const refreshed = await refreshTokens();
            if (refreshed) {
                // Retry with new token
                config.headers['Authorization'] = `Bearer ${getToken()}`;
                response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            } else {
                // Refresh failed, clear auth and redirect
                clearAuth();
                window.location.href = '/login';
                return null;
            }
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Refresh tokens
export const refreshTokens = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        const data = await response.json();
        if (data.success) {
            localStorage.setItem('cc_token', data.token);
            return true;
        }
        return false;
    } catch {
        return false;
    }
};

// API Methods
export const api = {
    // Auth
    login: (email, password) => 
        authFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),
    
    logout: () => authFetch('/api/auth/logout', { method: 'POST' }),
    
    getMe: () => authFetch('/api/auth/me'),
    
    changePassword: (currentPassword, newPassword) =>
        authFetch('/api/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        }),

    // Dashboard
    getDashboard: () => authFetch('/api/dashboard/overview'),
    
    getTeam: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return authFetch(`/api/dashboard/team?${query}`);
    },
    
    updateEmployee: (id, data) =>
        authFetch(`/api/dashboard/employee/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    
    getDivisionStats: (divisionCode) =>
        authFetch(`/api/dashboard/division/${divisionCode}`),

    // VA System
    getVADashboard: () => authFetch('/api/va/dashboard'),
    
    getTasks: (filters = {}) => {
        const query = new URLSearchParams(filters).toString();
        return authFetch(`/api/va/tasks?${query}`);
    },
    
    createTask: (task) =>
        authFetch('/api/va/tasks', {
            method: 'POST',
            body: JSON.stringify(task)
        }),
    
    updateTask: (id, updates) =>
        authFetch(`/api/va/tasks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        }),
    
    generateDailyTasks: () =>
        authFetch('/api/va/generate-daily', { method: 'POST' }),
    
    getDMScripts: () => authFetch('/api/va/dm-scripts'),
    
    getVAMetrics: () => authFetch('/api/va/metrics'),

    // Payments
    getProducts: () => authFetch('/api/payments/products'),
    
    createCheckout: (productId, productType, email) =>
        authFetch('/api/payments/create-checkout', {
            method: 'POST',
            body: JSON.stringify({ productId, productType, customerEmail: email })
        }),
    
    getPaymentStats: () => authFetch('/api/payments/stats'),
    
    getPaymentHistory: (limit = 20) =>
        authFetch(`/api/payments/history?limit=${limit}`),

    // Content Kits
    getContentKits: () => authFetch('/api/content-kits'),
    
    getKitDetails: (kitId) => authFetch(`/api/content-kits/${kitId}`),
    
    verifyDownload: (token) => authFetch(`/api/content-kits/download/${token}`),
    
    getKitAnalytics: () => authFetch('/api/content-kits/admin/analytics')
};

export default api;
