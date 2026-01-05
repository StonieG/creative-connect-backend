// Creative Connect Platform - Database Seed Script
// Creates initial admin accounts and sample data

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Employee Schema (inline for seeding)
const employeeSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['ceo', 'admin', 'manager', 'employee', 'va'], default: 'employee' },
    division: { type: String, default: 'general' },
    permissions: [String],
    title: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

// Seed Data
const seedEmployees = [
    {
        email: 'ceo@creativeconnectplatform.com',
        password: 'CreativeConnect2026!',
        firstName: 'Founder',
        lastName: 'CEO',
        role: 'ceo',
        division: 'executive',
        permissions: ['admin_all'],
        title: 'Chief Executive Officer'
    },
    {
        email: 'admin@creativeconnectplatform.com',
        password: 'Admin2026!',
        firstName: 'Platform',
        lastName: 'Admin',
        role: 'admin',
        division: 'executive',
        permissions: ['admin_all'],
        title: 'Platform Administrator'
    },
    {
        email: 'coo@creativeconnectplatform.com',
        password: 'Operations2026!',
        firstName: 'Operations',
        lastName: 'Manager',
        role: 'manager',
        division: 'coo',
        permissions: ['read', 'write', 'manage_users'],
        title: 'Chief Operating Officer'
    },
    {
        email: 'cmo@creativeconnectplatform.com',
        password: 'Marketing2026!',
        firstName: 'Marketing',
        lastName: 'Lead',
        role: 'manager',
        division: 'cmo',
        permissions: ['read', 'write', 'manage_content'],
        title: 'Chief Marketing Officer'
    },
    {
        email: 'cto@creativeconnectplatform.com',
        password: 'Technology2026!',
        firstName: 'Tech',
        lastName: 'Lead',
        role: 'manager',
        division: 'cto',
        permissions: ['read', 'write', 'admin_all'],
        title: 'Chief Technology Officer'
    },
    {
        email: 'va@creativeconnectplatform.com',
        password: 'Assistant2026!',
        firstName: 'Virtual',
        lastName: 'Assistant',
        role: 'va',
        division: 'executive',
        permissions: ['read', 'write', 'manage_va'],
        title: 'Founder Success Assistant'
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creative-connect');
        console.log('✅ Connected to MongoDB');

        // Clear existing employees (optional - comment out in production)
        await Employee.deleteMany({});
        console.log('🗑️  Cleared existing employees');

        // Hash passwords and create employees
        for (const emp of seedEmployees) {
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(emp.password, salt);
            
            await Employee.create({
                ...emp,
                password: hashedPassword
            });
            
            console.log(`✅ Created: ${emp.email} (${emp.role})`);
        }

        console.log('\n════════════════════════════════════════');
        console.log('   🎉 DATABASE SEEDED SUCCESSFULLY!');
        console.log('════════════════════════════════════════');
        console.log('\nTest Accounts Created:');
        console.log('────────────────────────────────────────');
        seedEmployees.forEach(emp => {
            console.log(`📧 ${emp.email}`);
            console.log(`   Password: ${emp.password}`);
            console.log(`   Role: ${emp.role} | Division: ${emp.division}`);
            console.log('');
        });

        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();
