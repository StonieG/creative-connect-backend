// Creative Connect Platform - Content Kits Routes
// Digital Products for Early Revenue Generation

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizePermissions } = require('../middleware/auth');

// ===========================================
// CONTENT KIT DEFINITIONS
// ===========================================
const CONTENT_KITS = {
    // STARTER KIT - $49
    'starter-kit': {
        id: 'starter-kit',
        name: 'Creator Starter Kit',
        tagline: 'Everything you need to launch your creative journey',
        price: 49.00,
        originalPrice: 79.00,
        currency: 'USD',
        category: 'starter',
        featured: true,
        contents: {
            templates: {
                count: 50,
                types: ['Instagram Posts', 'Stories', 'Reels Covers', 'LinkedIn Posts']
            },
            guides: [
                'Content Calendar Template (Notion)',
                'Brand Color Palette Generator',
                'Basic Analytics Tracking Sheet',
                'Hashtag Strategy Guide'
            ],
            bonuses: [
                '30-Day Content Challenge',
                'Caption Templates (50+)'
            ]
        },
        deliverables: [
            { name: 'Social Templates Pack', format: 'Canva + Figma', size: '245 MB' },
            { name: 'Content Calendar', format: 'Notion Template', size: 'Link' },
            { name: 'Guides Bundle', format: 'PDF', size: '12 MB' }
        ],
        targetAudience: 'New creators, side hustlers, small business owners',
        testimonials: [
            { name: 'Sarah M.', role: 'Freelance Designer', text: 'This kit saved me weeks of work!' }
        ]
    },

    // PRO KIT - $149
    'pro-kit': {
        id: 'pro-kit',
        name: 'Pro Creator Kit',
        tagline: 'Level up your content game with professional tools',
        price: 149.00,
        originalPrice: 249.00,
        currency: 'USD',
        category: 'professional',
        featured: true,
        bestseller: true,
        contents: {
            templates: {
                count: 200,
                types: ['Instagram', 'TikTok', 'LinkedIn', 'Twitter', 'Pinterest', 'YouTube']
            },
            guides: [
                'Advanced Content Strategy Playbook',
                'Video Thumbnail Mastery Guide',
                'Analytics Deep Dive Course',
                'Collaboration & Partnership Templates',
                'Brand Guidelines Template'
            ],
            tools: [
                'Engagement Rate Calculator',
                'Posting Schedule Optimizer',
                'Competitor Analysis Template'
            ],
            bonuses: [
                'Monthly Content Themes (12 months)',
                '100+ Viral Caption Formulas',
                'Private Community Access (1 month)'
            ]
        },
        deliverables: [
            { name: 'Complete Template Library', format: 'Canva + Figma + PSD', size: '1.2 GB' },
            { name: 'Video Assets Pack', format: 'MP4 + MOV', size: '800 MB' },
            { name: 'Strategy Course', format: 'Video + PDF', size: '2.1 GB' },
            { name: 'Tools & Calculators', format: 'Google Sheets + Notion', size: 'Links' }
        ],
        targetAudience: 'Growing creators, influencers, content marketers',
        testimonials: [
            { name: 'Mike R.', role: 'Content Creator', text: 'My engagement doubled in 30 days!' },
            { name: 'Lisa K.', role: 'Marketing Manager', text: 'Worth every penny. Incredible value.' }
        ]
    },

    // AGENCY KIT - $499
    'agency-kit': {
        id: 'agency-kit',
        name: 'Agency Power Kit',
        tagline: 'Complete solution for agencies and creative teams',
        price: 499.00,
        originalPrice: 899.00,
        currency: 'USD',
        category: 'agency',
        featured: true,
        contents: {
            templates: {
                count: 500,
                types: ['All Platforms', 'White-Label', 'Client Presentations', 'Reports']
            },
            systems: [
                'Client Onboarding System',
                'Project Management Templates',
                'Team Workflow SOPs',
                'Client Reporting Dashboard',
                'Invoice & Proposal Templates'
            ],
            whiteLabel: [
                'Brandable Templates',
                'Client Portal Setup Guide',
                'Reseller License Included'
            ],
            training: [
                'Agency Operations Course',
                'Team Training Videos',
                'Client Communication Scripts'
            ],
            bonuses: [
                'Private Slack Community (3 months)',
                '1:1 Onboarding Call',
                'Quarterly Template Updates'
            ]
        },
        deliverables: [
            { name: 'Agency Template Vault', format: 'All Formats', size: '4.5 GB' },
            { name: 'White-Label Assets', format: 'Canva + Figma + AI', size: '1.8 GB' },
            { name: 'Operations System', format: 'Notion + Airtable', size: 'Links' },
            { name: 'Training Academy', format: 'Video Course', size: '3.2 GB' },
            { name: 'Client Documents', format: 'Google Docs + PDF', size: '150 MB' }
        ],
        targetAudience: 'Creative agencies, marketing teams, freelance studios',
        testimonials: [
            { name: 'Agency XYZ', role: 'Digital Agency', text: 'Transformed how we onboard clients.' },
            { name: 'Tom H.', role: 'Studio Owner', text: 'ROI in the first week. Unbelievable.' }
        ]
    }
};

// Purchase tracking (in-memory, use MongoDB in production)
let purchases = [];
let purchaseIdCounter = 1;

// ===========================================
// GET ALL CONTENT KITS
// ===========================================
router.get('/', (req, res) => {
    const { category, featured } = req.query;

    let kits = Object.values(CONTENT_KITS);

    if (category) {
        kits = kits.filter(k => k.category === category);
    }

    if (featured === 'true') {
        kits = kits.filter(k => k.featured);
    }

    // Return public info only
    const publicKits = kits.map(kit => ({
        id: kit.id,
        name: kit.name,
        tagline: kit.tagline,
        price: kit.price,
        originalPrice: kit.originalPrice,
        currency: kit.currency,
        category: kit.category,
        featured: kit.featured,
        bestseller: kit.bestseller,
        templateCount: kit.contents.templates.count,
        targetAudience: kit.targetAudience
    }));

    res.json({
        success: true,
        kits: publicKits,
        total: publicKits.length
    });
});

// ===========================================
// GET SINGLE KIT DETAILS
// ===========================================
router.get('/:kitId', (req, res) => {
    const { kitId } = req.params;
    const kit = CONTENT_KITS[kitId];

    if (!kit) {
        return res.status(404).json({
            success: false,
            message: 'Content kit not found'
        });
    }

    res.json({
        success: true,
        kit
    });
});

// ===========================================
// RECORD PURCHASE (called by payment webhook)
// ===========================================
router.post('/purchase', async (req, res) => {
    try {
        const { 
            kitId, 
            customerEmail, 
            customerName,
            paymentId,
            amount 
        } = req.body;

        const kit = CONTENT_KITS[kitId];
        if (!kit) {
            return res.status(404).json({
                success: false,
                message: 'Content kit not found'
            });
        }

        // Generate unique download token
        const downloadToken = generateDownloadToken();

        const purchase = {
            id: purchaseIdCounter++,
            kitId,
            kitName: kit.name,
            customerEmail,
            customerName,
            paymentId,
            amount,
            downloadToken,
            downloadCount: 0,
            maxDownloads: 5,
            purchasedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'active'
        };

        purchases.push(purchase);

        // TODO: Send email with download link
        console.log(`
        ╔════════════════════════════════════════╗
        ║   📦 NEW CONTENT KIT PURCHASE!         ║
        ╠════════════════════════════════════════╣
        ║  Kit: ${kit.name.padEnd(30)}║
        ║  Customer: ${customerEmail.substring(0, 27).padEnd(27)}║
        ║  Amount: $${amount.toFixed(2).padEnd(28)}║
        ╚════════════════════════════════════════╝
        `);

        res.status(201).json({
            success: true,
            message: 'Purchase recorded successfully',
            purchase: {
                id: purchase.id,
                kitName: purchase.kitName,
                downloadToken: purchase.downloadToken,
                expiresAt: purchase.expiresAt
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to record purchase'
        });
    }
});

// ===========================================
// VERIFY DOWNLOAD ACCESS
// ===========================================
router.get('/download/:token', (req, res) => {
    const { token } = req.params;

    const purchase = purchases.find(p => p.downloadToken === token);

    if (!purchase) {
        return res.status(404).json({
            success: false,
            message: 'Invalid download token'
        });
    }

    if (purchase.status !== 'active') {
        return res.status(403).json({
            success: false,
            message: 'Download access has been revoked'
        });
    }

    if (new Date() > new Date(purchase.expiresAt)) {
        return res.status(403).json({
            success: false,
            message: 'Download link has expired'
        });
    }

    if (purchase.downloadCount >= purchase.maxDownloads) {
        return res.status(403).json({
            success: false,
            message: 'Maximum download limit reached'
        });
    }

    const kit = CONTENT_KITS[purchase.kitId];

    // Increment download count
    purchase.downloadCount++;

    res.json({
        success: true,
        kit: {
            name: kit.name,
            deliverables: kit.deliverables
        },
        downloadsRemaining: purchase.maxDownloads - purchase.downloadCount,
        expiresAt: purchase.expiresAt,
        // In production, return signed URLs for actual files
        downloadLinks: kit.deliverables.map((d, i) => ({
            name: d.name,
            format: d.format,
            size: d.size,
            url: `/api/content-kits/file/${purchase.kitId}/${i}?token=${token}`
        }))
    });
});

// ===========================================
// SALES ANALYTICS (Admin)
// ===========================================
router.get('/admin/analytics', authenticateToken, authorizePermissions('manage_payments', 'admin_all'), (req, res) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthPurchases = purchases.filter(p => new Date(p.purchasedAt) >= thisMonth);
    const lastMonthPurchases = purchases.filter(p => 
        new Date(p.purchasedAt) >= lastMonth && new Date(p.purchasedAt) < thisMonth
    );

    const analytics = {
        totalPurchases: purchases.length,
        totalRevenue: purchases.reduce((sum, p) => sum + p.amount, 0),
        thisMonth: {
            purchases: thisMonthPurchases.length,
            revenue: thisMonthPurchases.reduce((sum, p) => sum + p.amount, 0)
        },
        lastMonth: {
            purchases: lastMonthPurchases.length,
            revenue: lastMonthPurchases.reduce((sum, p) => sum + p.amount, 0)
        },
        byKit: {
            'starter-kit': purchases.filter(p => p.kitId === 'starter-kit').length,
            'pro-kit': purchases.filter(p => p.kitId === 'pro-kit').length,
            'agency-kit': purchases.filter(p => p.kitId === 'agency-kit').length
        },
        recentPurchases: purchases
            .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt))
            .slice(0, 10)
            .map(p => ({
                kitName: p.kitName,
                amount: p.amount,
                date: p.purchasedAt
            }))
    };

    res.json({
        success: true,
        analytics
    });
});

// Helper function to generate download token
function generateDownloadToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

module.exports = router;
