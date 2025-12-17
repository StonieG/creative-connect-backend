// Creative Connect Platform - Virtual Assistant System
// AI VA Launch Kit Implementation
// Based on Founder Success Assistant (FSA) Framework

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, authorizePermissions } = require('../middleware/auth');

// ===========================================
// VA TASK CATEGORIES (From VA Guide)
// ===========================================
const TASK_CATEGORIES = {
    FOLDER_MANAGEMENT: 'folder_management',
    SOCIAL_POSTING: 'social_posting',
    DM_OUTREACH: 'dm_outreach',
    INBOX_MANAGEMENT: 'inbox_management',
    TEAM_SUPPORT: 'team_support',
    KPI_TRACKING: 'kpi_tracking',
    CALENDAR_MANAGEMENT: 'calendar_management',
    CRM_UPDATES: 'crm_updates'
};

// Task templates based on VA responsibilities
const TASK_TEMPLATES = {
    daily: [
        {
            category: TASK_CATEGORIES.INBOX_MANAGEMENT,
            title: 'Morning Inbox Triage',
            description: 'Sort and filter emails, draft responses, flag urgent items',
            estimatedMinutes: 30,
            priority: 'high'
        },
        {
            category: TASK_CATEGORIES.SOCIAL_POSTING,
            title: 'Daily Social Content',
            description: 'Post scheduled content to IG/TikTok/LinkedIn',
            estimatedMinutes: 45,
            priority: 'high'
        },
        {
            category: TASK_CATEGORIES.DM_OUTREACH,
            title: 'DM Outreach Session',
            description: 'Designer recruitment, client outreach, follow-ups',
            estimatedMinutes: 60,
            priority: 'medium'
        },
        {
            category: TASK_CATEGORIES.CRM_UPDATES,
            title: 'CRM Updates',
            description: 'Update lead status, log interactions, add new contacts',
            estimatedMinutes: 20,
            priority: 'medium'
        }
    ],
    weekly: [
        {
            category: TASK_CATEGORIES.KPI_TRACKING,
            title: 'Weekly KPI Report',
            description: 'Compile metrics, update dashboards, send to leadership',
            estimatedMinutes: 60,
            priority: 'high'
        },
        {
            category: TASK_CATEGORIES.SOCIAL_POSTING,
            title: 'Content Calendar Update',
            description: 'Schedule next week content, update calendar',
            estimatedMinutes: 90,
            priority: 'medium'
        },
        {
            category: TASK_CATEGORIES.FOLDER_MANAGEMENT,
            title: 'Folder Organization',
            description: 'Organize Operational, Marketing, Investor folders',
            estimatedMinutes: 45,
            priority: 'low'
        },
        {
            category: TASK_CATEGORIES.TEAM_SUPPORT,
            title: 'Team Updates Collection',
            description: 'Gather updates from all divisions for CEO briefing',
            estimatedMinutes: 30,
            priority: 'medium'
        }
    ],
    monthly: [
        {
            category: TASK_CATEGORIES.SOCIAL_POSTING,
            title: 'Monthly Performance Report',
            description: 'Social media analytics and performance summary',
            estimatedMinutes: 120,
            priority: 'high'
        },
        {
            category: TASK_CATEGORIES.KPI_TRACKING,
            title: '90-Day Calendar Review',
            description: 'Review and update execution calendar',
            estimatedMinutes: 90,
            priority: 'high'
        }
    ]
};

// In-memory task storage (replace with MongoDB in production)
let vaTasks = [];
let taskIdCounter = 1;

// ===========================================
// GET VA DASHBOARD
// ===========================================
router.get('/dashboard', authenticateToken, authorizePermissions('manage_va', 'admin_all'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = {
            tasksToday: vaTasks.filter(t => {
                const taskDate = new Date(t.dueDate);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === today.getTime();
            }).length,
            tasksPending: vaTasks.filter(t => t.status === 'pending').length,
            tasksInProgress: vaTasks.filter(t => t.status === 'in_progress').length,
            tasksCompleted: vaTasks.filter(t => t.status === 'completed').length,
            tasksByCategory: {}
        };

        // Group by category
        Object.values(TASK_CATEGORIES).forEach(cat => {
            stats.tasksByCategory[cat] = vaTasks.filter(t => t.category === cat).length;
        });

        res.json({
            success: true,
            dashboard: stats,
            categories: TASK_CATEGORIES,
            templates: TASK_TEMPLATES
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load VA dashboard'
        });
    }
});

// ===========================================
// CREATE VA TASK
// ===========================================
router.post('/tasks', authenticateToken, async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            priority = 'medium',
            dueDate,
            assignedTo,
            estimatedMinutes
        } = req.body;

        const task = {
            id: taskIdCounter++,
            title,
            description,
            category,
            priority,
            dueDate: dueDate || new Date(),
            assignedTo: assignedTo || null,
            estimatedMinutes: estimatedMinutes || 30,
            status: 'pending',
            createdBy: req.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            completedAt: null,
            notes: []
        };

        vaTasks.push(task);

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create task'
        });
    }
});

// ===========================================
// GET ALL TASKS
// ===========================================
router.get('/tasks', authenticateToken, async (req, res) => {
    try {
        const { status, category, priority, assignedTo } = req.query;

        let filteredTasks = [...vaTasks];

        if (status) filteredTasks = filteredTasks.filter(t => t.status === status);
        if (category) filteredTasks = filteredTasks.filter(t => t.category === category);
        if (priority) filteredTasks = filteredTasks.filter(t => t.priority === priority);
        if (assignedTo) filteredTasks = filteredTasks.filter(t => t.assignedTo === assignedTo);

        // Sort by due date and priority
        filteredTasks.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (b.priority === 'high' && a.priority !== 'high') return 1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        res.json({
            success: true,
            tasks: filteredTasks,
            total: filteredTasks.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks'
        });
    }
});

// ===========================================
// UPDATE TASK STATUS
// ===========================================
router.patch('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const taskIndex = vaTasks.findIndex(t => t.id === parseInt(id));
        
        if (taskIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Update task
        vaTasks[taskIndex] = {
            ...vaTasks[taskIndex],
            ...updates,
            updatedAt: new Date()
        };

        // Set completedAt if status changed to completed
        if (updates.status === 'completed' && !vaTasks[taskIndex].completedAt) {
            vaTasks[taskIndex].completedAt = new Date();
        }

        res.json({
            success: true,
            message: 'Task updated successfully',
            task: vaTasks[taskIndex]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update task'
        });
    }
});

// ===========================================
// GENERATE DAILY TASKS FROM TEMPLATES
// ===========================================
router.post('/generate-daily', authenticateToken, authorizePermissions('manage_va', 'admin_all'), async (req, res) => {
    try {
        const today = new Date();
        const generatedTasks = [];

        TASK_TEMPLATES.daily.forEach(template => {
            const task = {
                id: taskIdCounter++,
                ...template,
                dueDate: today,
                status: 'pending',
                createdBy: req.user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                completedAt: null,
                notes: [],
                isAutoGenerated: true
            };
            vaTasks.push(task);
            generatedTasks.push(task);
        });

        res.json({
            success: true,
            message: `Generated ${generatedTasks.length} daily tasks`,
            tasks: generatedTasks
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate daily tasks'
        });
    }
});

// ===========================================
// DM OUTREACH SCRIPTS
// ===========================================
router.get('/dm-scripts', authenticateToken, async (req, res) => {
    const scripts = {
        designerRecruitment: {
            initial: `Hey [Name]! 👋 Love your work on [specific piece]. We're building Creative Connect - a platform where designers like you can connect with opportunities and grow together. Would love to have you join our early community. Interested in learning more?`,
            followUp: `Hey [Name]! Just following up on my message about Creative Connect. We're launching on Valentine's Day 2026 and building an amazing community of designers. Would love to chat if you have 5 mins this week!`
        },
        clientOutreach: {
            initial: `Hi [Name]! I noticed [company] has been doing great work in [industry]. At Creative Connect, we help brands connect with top creative talent. Would you be open to a quick call about how we might help with your creative needs?`,
            followUp: `Hi [Name]! Following up on my note about Creative Connect. We have some amazing designers who specialize in [relevant area]. Happy to share some portfolio examples if helpful!`
        },
        ambassadorOutreach: {
            initial: `Hey [Name]! 🚀 Your content about [topic] really resonates with our mission at Creative Connect. We're looking for creative ambassadors to help spread the word before our Valentine's Day 2026 launch. Interested in being part of something big?`
        }
    };

    res.json({
        success: true,
        scripts
    });
});

// ===========================================
// VA PERFORMANCE METRICS
// ===========================================
router.get('/metrics', authenticateToken, authorizePermissions('manage_va', 'admin_all'), async (req, res) => {
    try {
        const completed = vaTasks.filter(t => t.status === 'completed');
        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);

        const metrics = {
            totalTasks: vaTasks.length,
            completedTasks: completed.length,
            completionRate: vaTasks.length > 0 
                ? ((completed.length / vaTasks.length) * 100).toFixed(1) 
                : 0,
            tasksThisWeek: vaTasks.filter(t => new Date(t.createdAt) > thisWeek).length,
            completedThisWeek: completed.filter(t => new Date(t.completedAt) > thisWeek).length,
            avgCompletionTime: calculateAvgCompletionTime(completed),
            byCategory: {},
            byPriority: {
                high: vaTasks.filter(t => t.priority === 'high').length,
                medium: vaTasks.filter(t => t.priority === 'medium').length,
                low: vaTasks.filter(t => t.priority === 'low').length
            }
        };

        // Calculate by category
        Object.values(TASK_CATEGORIES).forEach(cat => {
            const catTasks = vaTasks.filter(t => t.category === cat);
            const catCompleted = catTasks.filter(t => t.status === 'completed');
            metrics.byCategory[cat] = {
                total: catTasks.length,
                completed: catCompleted.length,
                pending: catTasks.filter(t => t.status === 'pending').length
            };
        });

        res.json({
            success: true,
            metrics
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch metrics'
        });
    }
});

function calculateAvgCompletionTime(completedTasks) {
    if (completedTasks.length === 0) return 0;
    
    const times = completedTasks
        .filter(t => t.completedAt && t.createdAt)
        .map(t => new Date(t.completedAt) - new Date(t.createdAt));
    
    if (times.length === 0) return 0;
    
    const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
    return Math.round(avgMs / (1000 * 60)); // Return in minutes
}

// ===========================================
// VA CONFIRMATION COMMANDS
// ===========================================
router.post('/confirm', authenticateToken, async (req, res) => {
    const { command } = req.body;

    const confirmations = {
        'inbox_cleared': '✅ Inbox has been triaged and organized',
        'social_posted': '✅ Daily social content has been posted',
        'dms_sent': '✅ DM outreach session completed',
        'crm_updated': '✅ CRM has been updated with latest interactions',
        'kpis_logged': '✅ KPIs have been logged and dashboard updated',
        'calendar_updated': '✅ Calendar has been updated',
        'folders_organized': '✅ Folders have been organized',
        'team_briefed': '✅ Team updates collected and briefing prepared'
    };

    const message = confirmations[command] || `Command received: ${command}`;

    res.json({
        success: true,
        message,
        timestamp: new Date().toISOString(),
        confirmedBy: req.user.email
    });
});

// ===========================================
// NUMA AI TOOLS - 5 Creative Assistant Endpoints
// ===========================================

// 1. TEXT POLISH - Improve and refine text
router.post('/ai/polish', authenticateToken, async (req, res) => {
    try {
        const { text, style = 'professional' } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, error: 'Text is required' });
        }

        // Mock AI response (replace with OpenAI call in production)
        const styleGuides = {
            professional: 'formal, clear, and polished',
            casual: 'friendly and approachable',
            creative: 'unique and engaging'
        };

        const polished = `[${style.toUpperCase()}] ${text.charAt(0).toUpperCase() + text.slice(1).toLowerCase().trim()}`;

        res.json({
            success: true,
            result: polished,
            suggestions: [
                'Consider adding a call-to-action',
                'Try varying sentence length for better flow'
            ]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to polish text' });
    }
});

// 2. CAPTION GENERATOR - Generate social media captions
router.post('/ai/caption', authenticateToken, async (req, res) => {
    try {
        const { context, platform = 'instagram', tone = 'fun' } = req.body;

        if (!context) {
            return res.status(400).json({ success: false, error: 'Context is required' });
        }

        const captions = {
            instagram: `✨ ${context} | What do you think? Drop a comment below! 👇 #creative #design`,
            tiktok: `POV: You just discovered ${context} 🔥 #fyp #creative #trending`,
            linkedin: `Excited to share: ${context}. Here's what I learned along the way...`,
            twitter: `New: ${context} 🚀 Thoughts?`
        };

        res.json({
            success: true,
            result: captions[platform] || captions.instagram,
            suggestions: [
                'Add emojis for more engagement',
                'Include a question to boost comments',
                'Tag relevant accounts for reach'
            ]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to generate caption' });
    }
});

// 3. HASHTAG FINDER - Find relevant hashtags
router.post('/ai/hashtags', authenticateToken, async (req, res) => {
    try {
        const { topic, platform = 'instagram', count = 20 } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, error: 'Topic is required' });
        }

        const baseHashtags = [
            `#${topic.replace(/\s+/g, '')}`,
            '#creative', '#design', '#art', '#inspiration',
            '#graphicdesign', '#branding', '#creative',
            '#designinspiration', '#artwork', '#digitalart',
            '#creativedesign', '#designlife', '#visualart',
            '#creativecommunity', '#designstudio', '#artdaily',
            '#creativework', '#designtrends', '#artistsoninstagram',
            '#creativeconnect'
        ].slice(0, count);

        res.json({
            success: true,
            result: baseHashtags.join(' '),
            suggestions: baseHashtags
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to find hashtags' });
    }
});

// 4. IMAGE IDEAS - Generate image/visual concepts
router.post('/ai/image-ideas', authenticateToken, async (req, res) => {
    try {
        const { theme, style = 'modern', count = 5 } = req.body;

        if (!theme) {
            return res.status(400).json({ success: false, error: 'Theme is required' });
        }

        const ideas = [
            `1. Flat lay composition featuring ${theme} elements with clean white background`,
            `2. Behind-the-scenes shot of ${theme} creation process`,
            `3. Before/after transformation showing ${theme} impact`,
            `4. Mood board collage inspired by ${theme}`,
            `5. Detail shot highlighting textures related to ${theme}`
        ].slice(0, count);

        res.json({
            success: true,
            result: ideas.join('\n'),
            suggestions: ideas
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to generate image ideas' });
    }
});

// 5. CONTENT BRAINSTORM - Generate content calendar ideas
router.post('/ai/brainstorm', authenticateToken, async (req, res) => {
    try {
        const { niche, contentType = 'all', timeframe = 'week' } = req.body;

        if (!niche) {
            return res.status(400).json({ success: false, error: 'Niche is required' });
        }

        const weekPlan = [
            `Monday: Educational carousel about ${niche} fundamentals`,
            `Tuesday: Behind-the-scenes reel of your ${niche} process`,
            `Wednesday: Client testimonial or case study`,
            `Thursday: Tips & tricks post with actionable advice`,
            `Friday: Trending audio reel related to ${niche}`,
            `Saturday: Community engagement - polls or Q&A stories`,
            `Sunday: Inspiration post + weekly recap`
        ];

        res.json({
            success: true,
            result: weekPlan.join('\n'),
            suggestions: weekPlan
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to brainstorm content' });
    }
});

module.exports = router;
