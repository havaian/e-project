const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../src/user/model');
const Specialization = require('../src/specialization/model');

// Set longer timeout for MongoDB operations
mongoose.set('bufferTimeoutMS', 30000);

// No need to connect - using existing connection from db.js

// Seed data
const specializations = [
    { name: 'Specialization 1', description: 'Description 1', icon: 'fa-calculator' },
    { name: 'Specialization 2', description: 'Description 2', icon: 'fa-atom' },
    { name: 'Specialization 3', description: 'Description 3', icon: 'fa-language' },
    { name: 'Specialization 4', description: 'Description 4', icon: 'fa-code' },
    { name: 'Specialization 5', description: 'Description 5', icon: 'fa-landmark' },
    { name: 'Specialization 6', description: 'Description 6', icon: 'fa-book' },
    { name: 'Specialization 7', description: 'Description 7', icon: 'fa-palette' },
    { name: 'Specialization 8', description: 'Description 8', icon: 'fa-music' },
    { name: 'Specialization 9', description: 'Description 9', icon: 'fa-chart-line' },
    { name: 'Specialization 10', description: 'Description 10', icon: 'fa-graduation-cap' }
];

// Non-destructive seed function
async function seedDatabase() {
    try {
        console.log('🔍 [db seed] Checking existing specializations...');
        
        // Get all existing specializations
        const existingSpecializations = await Specialization.find({}).maxTimeMS(30000);
        const existingNames = existingSpecializations.map(spec => spec.name);
        
        console.log(`📋 [db seed] Found ${existingSpecializations.length} existing specializations: ${existingNames.join(', ')}`);
        
        // Filter out specializations that already exist
        const missingSpecializations = specializations.filter(spec => 
            !existingNames.includes(spec.name)
        );
        
        if (missingSpecializations.length === 0) {
            console.log('✅ [db seed] All specializations already exist - no changes needed');
            return;
        }
        
        console.log(`🌱 [db seed] Adding ${missingSpecializations.length} missing specializations...`);
        console.log(`📝 [db seed] Missing: ${missingSpecializations.map(s => s.name).join(', ')}`);
        
        // Create only the missing specializations
        const createdSpecializations = await Specialization.insertMany(missingSpecializations);
        console.log(`✅ [db seed] Successfully created ${createdSpecializations.length} new specializations`);
        
        // Show final count
        const totalSpecializations = await Specialization.countDocuments();
        console.log(`📊 [db seed] Total specializations in database: ${totalSpecializations}`);
        
    } catch (error) {
        console.error('❌ [db seed] Seeding error:', error);
        
        // Additional error context
        if (error.name === 'MongoTimeoutError') {
            console.error('💡 [db seed] Timeout error - check MongoDB connection and network');
        } else if (error.code === 11000) {
            console.error('💡 [db seed] Duplicate key error - specialization names must be unique');
        }
    }
}

// Run the seeder
seedDatabase();