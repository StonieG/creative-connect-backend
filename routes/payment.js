// Creative Connect Platform - Payment Routes
// Stripe Integration for Content Kits & Management Services

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateToken, authorizePermissions } = require('../middleware/auth');

// ===========================================
// PRODUCT CATALOG - Content Kits & Services
// ===========================================
const PRODUCTS = {
    // One-time Content Kits
    contentKits: {
        'starter-kit': {
            id: 'starter-kit',
            name: 'Creator Starter Kit',
            description: 'Essential templates, graphics, and guides for new creators',
            price: 4900, // $49.00
            type: 'one_time',
            includes: [
                '50+ Social Media Templates',
                'Brand Color Palette Generator',
                'Content Calendar Template',
                'Basic Analytics Guide'
            ]
        },
        'pro-kit': {
            id: 'pro-kit',
            name: 'Pro Creator Kit',
            description: 'Advanced toolkit for serious content creators',
            price: 14900, // $149.00
            type: 'one_time',
            includes: [
                '200+ Premium Templates',
                'Video Thumbnail Pack',
                'Advanced Analytics Dashboard',
                'Collaboration Templates',
                'Brand Guidelines Template'
            ]
        },
        'agency-kit': {
            id: 'agency-kit',
            name: 'Agency Power Kit',
            description: 'Complete solution for agencies and teams',
            price: 49900, // $499.00
            type: 'one_time',
            includes: [
                '500+ Agency Templates',
                'Client Onboarding System',
                'White-label Assets',
                'Team Workflow Templates',
                'Client Reporting Templates',
                'SOPs & Training Docs'
            ]
        }
    },
    // Subscription Content Management
    subscriptions: {
        'basic-management': {
            id: 'basic-management',
            name: 'Basic Content Management',
            description: 'Essential content management for solo creators',
            price: 9900, // $99/month
            interval: 'month',
            type: 'subscription',
            includes: [
                'Content Calendar Management',
                'Basic Analytics Reports',
                'Email Support',
                '5 Scheduled Posts/Week'
            ]
        },
        'pro-management': {
            id: 'pro-management',
            name: 'Pro Content Management',
            description: 'Full-service content management',
            price: 29900, // $299/month
            interval: 'month',
            type: 'subscription',
            includes: [
                'Full Content Calendar',
                'Advanced Analytics',
                'Priority Support',
                'Unlimited Scheduled Posts',
                'Monthly Strategy Call',
                'Competitor Analysis'
            ]
        },
        'enterprise-management': {
            id: 'enterprise-management',
            name: 'Enterprise Management',
            description: 'White-glove service for brands and agencies',
            price: 99900, // $999/month
            interval: 'month',
            type: 'subscription',
            includes: [
                'Dedicated Account Manager',
                'Custom Reporting Dashboard',
                '24/7 Priority Support',
                'Weekly Strategy Calls',
                'Influencer Matching',
                'Campaign Management',
                'ROI Tracking'
            ]
        }
    }
};

// ===========================================
// GET PRODUCTS CATALOG
// ===========================================
router.get('/products', (req, res) => {
    res.json({
        success: true,
        products: {
            contentKits: Object.values(PRODUCTS.contentKits),
            subscriptions: Object.values(PRODUCTS.subscriptions)
        },
        currency: 'usd'
    });
});

// ===========================================
// CREATE CHECKOUT SESSION
// ===========================================
router.post('/create-checkout', async (req, res) => {
    try {
        const { productId, productType, customerEmail, successUrl, cancelUrl } = req.body;

        // Find product
        const product = productType === 'subscription' 
            ? PRODUCTS.subscriptions[productId]
            : PRODUCTS.contentKits[productId];

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let sessionConfig = {
            payment_method_types: ['card'],
            customer_email: customerEmail,
            success_url: successUrl || `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
            metadata: {
                productId: product.id,
                productType: productType
            }
        };

        if (product.type === 'subscription') {
            // Create or get Stripe Price for subscription
            sessionConfig.mode = 'subscription';
            sessionConfig.line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description
                    },
                    unit_amount: product.price,
                    recurring: {
                        interval: product.interval
                    }
                },
                quantity: 1
            }];
        } else {
            // One-time payment for content kits
            sessionConfig.mode = 'payment';
            sessionConfig.line_items = [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description
                    },
                    unit_amount: product.price
                },
                quantity: 1
            }];
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        res.json({
            success: true,
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create checkout session',
            error: error.message
        });
    }
});

// ===========================================
// STRIPE WEBHOOK HANDLER
// ===========================================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('✅ Payment successful:', session.id);
            // TODO: Fulfill the order
            // - Send content kit download links
            // - Activate subscription
            // - Send confirmation email
            await handleSuccessfulPayment(session);
            break;

        case 'customer.subscription.created':
            console.log('✅ Subscription created:', event.data.object.id);
            break;

        case 'customer.subscription.updated':
            console.log('📝 Subscription updated:', event.data.object.id);
            break;

        case 'customer.subscription.deleted':
            console.log('❌ Subscription cancelled:', event.data.object.id);
            // TODO: Handle subscription cancellation
            break;

        case 'invoice.payment_failed':
            console.log('⚠️ Payment failed:', event.data.object.id);
            // TODO: Send payment failure notification
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// Helper function for successful payments
async function handleSuccessfulPayment(session) {
    const { productId, productType } = session.metadata;
    
    // Log the sale
    console.log(`
    ╔═══════════════════════════════════════╗
    ║        💰 NEW SALE - CREATIVE CONNECT ║
    ╠═══════════════════════════════════════╣
    ║  Product: ${productId.padEnd(26)}║
    ║  Type: ${productType.padEnd(29)}║
    ║  Amount: $${(session.amount_total / 100).toFixed(2).padEnd(26)}║
    ║  Customer: ${session.customer_email?.substring(0, 23).padEnd(23)}║
    ╚═══════════════════════════════════════╝
    `);

    // TODO: Implement order fulfillment
    // - Create order in database
    // - Send email with download links / welcome
    // - Update analytics
}

// ===========================================
// GET CUSTOMER PORTAL LINK
// ===========================================
router.post('/customer-portal', authenticateToken, async (req, res) => {
    try {
        const { customerId } = req.body;

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.FRONTEND_URL}/dashboard`
        });

        res.json({
            success: true,
            url: portalSession.url
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create portal session'
        });
    }
});

// ===========================================
// GET PAYMENT HISTORY (Admin)
// ===========================================
router.get('/history', authenticateToken, authorizePermissions('manage_payments', 'admin_all'), async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const payments = await stripe.paymentIntents.list({
            limit: parseInt(limit)
        });

        const formattedPayments = payments.data.map(payment => ({
            id: payment.id,
            amount: payment.amount / 100,
            currency: payment.currency,
            status: payment.status,
            created: new Date(payment.created * 1000),
            customer: payment.customer
        }));

        res.json({
            success: true,
            payments: formattedPayments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment history'
        });
    }
});

// ===========================================
// GET REVENUE STATS (Admin)
// ===========================================
router.get('/stats', authenticateToken, authorizePermissions('manage_payments', 'admin_all'), async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get balance
        const balance = await stripe.balance.retrieve();

        // Get charges for this month
        const charges = await stripe.charges.list({
            created: {
                gte: Math.floor(startOfMonth.getTime() / 1000)
            },
            limit: 100
        });

        const monthlyRevenue = charges.data
            .filter(c => c.status === 'succeeded')
            .reduce((sum, c) => sum + c.amount, 0) / 100;

        res.json({
            success: true,
            stats: {
                availableBalance: balance.available.reduce((sum, b) => sum + b.amount, 0) / 100,
                pendingBalance: balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100,
                monthlyRevenue,
                transactionsThisMonth: charges.data.length,
                currency: 'usd'
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats'
        });
    }
});

module.exports = router;
