// Creative Connect Platform - Employee Model
// MongoDB Schema for Team Members

const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: 8
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['ceo', 'admin', 'manager', 'employee', 'va', 'contractor'],
        default: 'employee'
    },
    // Divisions based on Creative Connect Brand Guide
    division: {
        type: String,
        enum: [
            'executive',    // CEO/Leadership
            'coo',          // Operations - Steel color
            'cmo',          // Marketing - Violet color
            'cto',          // Technology - Blue color
            'smd',          // Social Media - Aqua color
            'ccro',         // Creator Relations - Coral color
            'general'       // General staff
        ],
        default: 'general'
    },
    permissions: [{
        type: String,
        enum: [
            'read',
            'write',
            'delete',
            'manage_users',
            'manage_payments',
            'manage_content',
            'view_analytics',
            'manage_va',
            'admin_all'
        ]
    }],
    avatar: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    title: {
        type: String,  // Job title: "Marketing Manager", "Lead Developer", etc.
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    passwordChangedAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    // VA-specific fields
    vaAssignments: [{
        task: String,
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed']
        },
        dueDate: Date,
        completedAt: Date
    }],
    // Work tracking
    workStats: {
        tasksCompleted: { type: Number, default: 0 },
        hoursLogged: { type: Number, default: 0 },
        lastActiveDate: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
employeeSchema.index({ email: 1 });
employeeSchema.index({ role: 1, division: 1 });
employeeSchema.index({ isActive: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Method to check permission
employeeSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission) || 
           this.permissions.includes('admin_all') ||
           this.role === 'ceo';
};

module.exports = mongoose.model('Employee', employeeSchema);
