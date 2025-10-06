// Migration script: backend/migrations/achievements.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../src/user/model');

// Set longer timeout for MongoDB operations
mongoose.set('bufferTimeoutMS', 30000);

// No need to connect - using existing connection from db.js

// Default achievements to initialize for all users
const getDefaultAchievements = (role) => {
    const baseAchievements = [
        {
            id: 'first_profile_complete',
            name: 'Profile Master',
            description: 'Complete your profile with all required information',
            category: 'platform',
            icon: 'user-check',
            requirements: 'Fill out all required profile fields',
            isEarned: false
        },
        {
            id: 'first_appointment',
            name: 'First Steps',
            description: 'Complete your first appointment',
            category: 'milestone',
            icon: 'calendar-check',
            requirements: 'Successfully complete your first appointment',
            isEarned: false
        },
        {
            id: 'verified_provider',
            name: 'Verified professional',
            description: 'Get verified as a professional provider',
            category: 'professional',
            icon: 'shield-check',
            requirements: 'Complete the verification process',
            isEarned: false
        }
    ];

    if (role === 'provider') {
        baseAchievements.push(
            {
                id: 'ten_appointments',
                name: 'Experienced professional',
                description: 'Complete 10 successful appointments',
                category: 'milestone',
                icon: 'trophy',
                requirements: 'Complete 10 appointments with good ratings',
                isEarned: false
            },
            {
                id: 'first_client',
                name: 'Mentor',
                description: 'Take on your first client',
                category: 'professional',
                icon: 'users',
                requirements: 'Accept your first client for mentorship',
                isEarned: false
            },
            {
                id: 'five_star_rating',
                name: 'Excellence Award',
                description: 'Maintain a 5-star average rating',
                category: 'professional',
                icon: 'star',
                requirements: 'Achieve and maintain 5-star average rating',
                isEarned: false
            }
        );
    }

    return baseAchievements;
};

// Non-destructive migration function
async function addAchievementsAndClients() {
    try {
        console.log('🔍 [migration] Starting achievements and clients migration...');
        
        // Get all existing users
        const existingUsers = await User.find({}).select('firstName lastName email role achievements clients').maxTimeMS(30000);
        console.log(`📋 [migration] Found ${existingUsers.length} existing users`);
        
        let updatedUsersCount = 0;
        let skippedUsersCount = 0;
        
        for (const user of existingUsers) {
            let needsUpdate = false;
            const updateFields = {};
            
            // Check if user needs achievements
            if (!user.achievements || user.achievements.length === 0) {
                updateFields.achievements = getDefaultAchievements(user.role);
                needsUpdate = true;
                console.log(`🏆 [migration] Adding achievements for ${user.firstName} ${user.lastName} (${user.role})`);
            }
            
            // Check if user needs clients array (for providers)
            if (user.role === 'provider' && !user.clients) {
                updateFields.clients = [];
                needsUpdate = true;
                console.log(`👥 [migration] Adding clients array for provider ${user.firstName} ${user.lastName}`);
            }
            
            if (needsUpdate) {
                await User.findByIdAndUpdate(user._id, updateFields, { new: true }).maxTimeMS(30000);
                updatedUsersCount++;
                console.log(`✅ [migration] Updated user: ${user.email}`);
            } else {
                skippedUsersCount++;
            }
        }
        
        console.log(`🎯 [migration] Migration completed successfully!`);
        console.log(`📊 [migration] Summary:`);
        console.log(`   - Total users processed: ${existingUsers.length}`);
        console.log(`   - Users updated: ${updatedUsersCount}`);
        console.log(`   - Users skipped (already had data): ${skippedUsersCount}`);
        
        // Verify the migration
        const usersWithAchievements = await User.countDocuments({ achievements: { $exists: true, $not: { $size: 0 } } });
        const providersWithClients = await User.countDocuments({ role: 'provider', clients: { $exists: true } });
        
        console.log(`🔍 [migration] Verification:`);
        console.log(`   - Users with achievements: ${usersWithAchievements}`);
        console.log(`   - Providers with clients array: ${providersWithClients}`);
        
    } catch (error) {
        console.error('❌ [migration] Migration error:', error);
        
        // Additional error context
        if (error.name === 'MongoTimeoutError') {
            console.error('💡 [migration] Timeout error - check MongoDB connection and network');
        } else if (error.code === 11000) {
            console.error('💡 [migration] Duplicate key error - check for conflicting data');
        } else if (error.name === 'ValidationError') {
            console.error('💡 [migration] Validation error - check user schema requirements');
        }
        
        throw error; // Re-throw to prevent silent failures
    }
}

// Run the migration
addAchievementsAndClients();