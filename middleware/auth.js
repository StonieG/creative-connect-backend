// Creative Connect Platform - Auth Middleware
// JWT Verification and Role-Based Access Control

const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// ===========================================
// JWT TOKEN VERIFICATION
// ===========================================
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'creative-connect-secret-key-2026'
        );

        // Attach user info to request
        req.user = decoded;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        return res.status(403).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// ===========================================
// ROLE-BASED ACCESS CONTROL
// ===========================================
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

// ===========================================
// PERMISSION-BASED ACCESS CONTROL
// ===========================================
const authorizePermissions = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userPermissions = req.user.permissions || [];
        
        // CEO and admin_all have all permissions
        if (req.user.role === 'ceo' || userPermissions.includes('admin_all')) {
            return next();
        }

        const hasPermission = permissions.some(p => userPermissions.includes(p));
        
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required permissions: ${permissions.join(', ')}`
            });
        }

        next();
    };
};

// ===========================================
// DIVISION-BASED ACCESS CONTROL
// ===========================================
const authorizeDivision = (...divisions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Executive and CEO can access all divisions
        if (req.user.role === 'ceo' || req.user.division === 'executive') {
            return next();
        }

        if (!divisions.includes(req.user.division)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. This resource is for: ${divisions.join(', ')}`
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    authorizePermissions,
    authorizeDivision
};
