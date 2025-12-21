// Creative Connect Platform - Main Server
// MVP Backend for Investor Demo - January 2025
// Launch Date: Valentine's Day 2026

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const paymentRoutes = require('./routes/payment');
const vaRoutes = require('./routes/va-system');
const contentKitRoutes = require('./routes/content-kits');

// Initialize Express
const app = express();

// ===========================================
// MIDDLEWARE CONFIGURATION
// ===========================================
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ===========================================
// DATABASE CONNECTION
// ===========================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creative-connect')
.then(() => console.log('✅ MongoDB Connected - Creative Connect Platform'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// ===========================================
// API ROUTES
// ===========================================
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/va', vaRoutes);
app.use('/api/content-kits', contentKitRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'operational',
        platform: 'Creative Connect',
        version: '1.0.0-mvp',
        launchDate: '2026-02-14',
        timestamp: new Date().toISOString()
    });
});

// ===========================================
// ERROR HANDLING
// ===========================================
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// ===========================================
// SERVER STARTUP
// ===========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════╗
    ║     CREATIVE CONNECT PLATFORM - MVP SERVER        ║
    ║═══════════════════════════════════════════════════║
    ║  🚀 Server running on port ${PORT}                   ║
    ║  💜 Brand: Neon Aqua #00F5FF | Violet #7B2CFF     ║
    ║  📅 Launch: Valentine's Day 2026                  ║
    ║  🎯 Status: Investor MVP Ready                    ║
    ╚═══════════════════════════════════════════════════╝
    `);
});

module.exports = app;
