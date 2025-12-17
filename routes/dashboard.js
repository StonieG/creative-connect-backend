// Creative Connect Platform - Dashboard Routes
// Employee Portal API Endpoints

const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { 
    authenticateToken, 
    authorizeRoles, 
    authorizePermissions,
    authorizeDivision 
} = require('../middleware/auth');

// ===========================================
// DASHBOARD OVERVIEW
// ===========================================
router.get('/overview', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const userDivision = req.user.division;

        // Base stats for all employees
        let stats = {
            user: await Employee.findById(userId).select('-password'),
            pendingTasks: 0,
            completedTasks: 0,
            teamMembers: 0,
            recentActivity: []
        };

        // Role-based data enrichment
        if (['ceo', 'admin', 'manager'].includes(userRole)) {
            // Get team stats
            const teamQuery = userRole === 'ceo' ? {} : { division: userDivision };
            stats.teamMembers = await Employee.countDocuments({ 
                ...teamQuery, 
                isActive: true 
            });

            // Get all active employees for managers+
            stats.team = await Employee.find({ ...teamQuery, isActive: true })
                .select('firstName lastName email role division lastLogin')
                .limit(20);
        }

        // Platform-wide stats for executives
        if (['ceo', 'admin'].includes(userRole)) {
            stats.platformStats = {
                totalEmployees: await Employee.countDocuments({ isActive: true }),
                totalVAs: await Employee.countDocuments({ role: 'va', isActive: true }),
                divisionBreakdown: await Employee.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: '$division', count: { $sum: 1 } } }
                ])
            };
        }

        res.json({
            success: true,
            dashboard: stats,
            launchCountdown: {
                launchDate: '2026-02-14',
                daysRemaining: Math.ceil(
                    (new Date('2026-02-14') - new Date()) / (1000 * 60 * 60 * 24)
                )
            }
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard'
        });
    }
});

// ===========================================
// TEAM MANAGEMENT (Managers+)
// ===========================================
router.get('/team', authenticateToken, authorizeRoles('ceo', 'admin', 'manager'), async (req, res) => {
    try {
        const { division, role, page = 1, limit = 20 } = req.query;
        
        let query = { isActive: true };
        
        // Filter by division if not CEO/admin
        if (req.user.role === 'manager') {
            query.division = req.user.division;
        } else if (division) {
            query.division = division;
        }

        if (role) query.role = role;

        const team = await Employee.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Employee.countDocuments(query);

        res.json({
            success: true,
            team,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team'
        });
    }
});

// ===========================================
// UPDATE EMPLOYEE (Admin+)
// ===========================================
router.put('/employee/:id', authenticateToken, authorizeRoles('ceo', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Prevent password updates through this route
        delete updates.password;

        const employee = await Employee.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            message: 'Employee updated successfully',
            employee
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update employee'
        });
    }
});

// ===========================================
// DEACTIVATE EMPLOYEE (Admin+)
// ===========================================
router.post('/employee/:id/deactivate', authenticateToken, authorizeRoles('ceo', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            message: 'Employee deactivated successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate employee'
        });
    }
});

// ===========================================
// DIVISION STATS (Division Heads)
// ===========================================
router.get('/division/:divisionCode', authenticateToken, async (req, res) => {
    try {
        const { divisionCode } = req.params;
        
        // Division color mapping from brand guide
        const divisionColors = {
            'coo': '#708090',   // Steel
            'cmo': '#7B2CFF',   // Violet
            'cto': '#0066FF',   // Blue
            'smd': '#00F5FF',   // Aqua
            'ccro': '#FF6B6B'   // Coral
        };

        const stats = {
            division: divisionCode,
            brandColor: divisionColors[divisionCode] || '#00F5FF',
            memberCount: await Employee.countDocuments({ 
                division: divisionCode, 
                isActive: true 
            }),
            members: await Employee.find({ 
                division: divisionCode, 
                isActive: true 
            }).select('firstName lastName email role title lastLogin'),
            roles: await Employee.aggregate([
                { $match: { division: divisionCode, isActive: true } },
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ])
        };

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch division stats'
        });
    }
});

// ===========================================
// ACTIVITY LOG
// ===========================================
router.get('/activity', authenticateToken, async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        
        // Get recent logins as activity
        const recentLogins = await Employee.find({ 
            lastLogin: { $ne: null } 
        })
        .select('firstName lastName division lastLogin')
        .sort({ lastLogin: -1 })
        .limit(parseInt(limit));

        const activity = recentLogins.map(emp => ({
            type: 'login',
            user: `${emp.firstName} ${emp.lastName}`,
            division: emp.division,
            timestamp: emp.lastLogin
        }));

        res.json({
            success: true,
            activity
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity'
        });
    }
});

// ===========================================
// SEARCH EMPLOYEES
// ===========================================
router.get('/search', authenticateToken, authorizeRoles('ceo', 'admin', 'manager'), async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const employees = await Employee.find({
            isActive: true,
            $or: [
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        })
        .select('firstName lastName email role division')
        .limit(10);

        res.json({
            success: true,
            results: employees
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
});

module.exports = router;
