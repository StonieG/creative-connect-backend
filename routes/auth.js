// Creative Connect Platform - Authentication Routes
// Employee Dashboard Login System with Role-Based Access

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// ===========================================
// EMPLOYEE REGISTRATION (Admin Only)
// ===========================================
router.post('/register', authenticateToken, authorizeRoles('admin', 'ceo'), async (req, res) => {
    try {
        const { 
            email, 
            password, 
            firstName, 
            lastName, 
            role, 
            division,
            permissions 
        } = req.body;

        // Check if employee exists
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: 'Employee with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new employee
        const employee = new Employee({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: role || 'employee',
            division: division || 'general',
            permissions: permissions || ['read'],
            createdBy: req.user.id,
            isActive: true
        });

        await employee.save();

        res.status(201).json({
            success: true,
            message: 'Employee registered successfully',
            employee: {
                id: employee._id,
                email: employee.email,
                firstName: employee.firstName,
                lastName: employee.lastName,
                role: employee.role,
                division: employee.division
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// ===========================================
// EMPLOYEE LOGIN
// ===========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find employee
        const employee = await Employee.findOne({ email }).select('+password');
        if (!employee) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!employee.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Contact admin.'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            // Track failed login attempts
            employee.failedLoginAttempts = (employee.failedLoginAttempts || 0) + 1;
            if (employee.failedLoginAttempts >= 5) {
                employee.isActive = false;
            }
            await employee.save();

            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Reset failed attempts on successful login
        employee.failedLoginAttempts = 0;
        employee.lastLogin = new Date();
        await employee.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                id: employee._id,
                email: employee.email,
                role: employee.role,
                division: employee.division,
                permissions: employee.permissions
            },
            process.env.JWT_SECRET || 'creative-connect-secret-key-2026',
            { expiresIn: '8h' }
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
            { id: employee._id },
            process.env.JWT_REFRESH_SECRET || 'creative-connect-refresh-2026',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            refreshToken,
            employee: {
                id: employee._id,
                email: employee.email,
                firstName: employee.firstName,
                lastName: employee.lastName,
                role: employee.role,
                division: employee.division,
                permissions: employee.permissions,
                avatar: employee.avatar
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// ===========================================
// REFRESH TOKEN
// ===========================================
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'creative-connect-refresh-2026'
        );

        const employee = await Employee.findById(decoded.id);
        if (!employee || !employee.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        const newToken = jwt.sign(
            {
                id: employee._id,
                email: employee.email,
                role: employee.role,
                division: employee.division,
                permissions: employee.permissions
            },
            process.env.JWT_SECRET || 'creative-connect-secret-key-2026',
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            token: newToken
        });

    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
});

// ===========================================
// GET CURRENT USER
// ===========================================
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const employee = await Employee.findById(req.user.id).select('-password');
        res.json({
            success: true,
            employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data'
        });
    }
});

// ===========================================
// CHANGE PASSWORD
// ===========================================
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const employee = await Employee.findById(req.user.id).select('+password');
        
        const isMatch = await bcrypt.compare(currentPassword, employee.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const salt = await bcrypt.genSalt(12);
        employee.password = await bcrypt.hash(newPassword, salt);
        employee.passwordChangedAt = new Date();
        await employee.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
});

// ===========================================
// LOGOUT (Invalidate token - requires token blacklist)
// ===========================================
router.post('/logout', authenticateToken, async (req, res) => {
    // In production, add token to blacklist in Redis
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
