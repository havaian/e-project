const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Time slot schema for new availability system
const timeSlotSchema = new mongoose.Schema({
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    }
});

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot be more than 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    role: {
        type: String,
        enum: ['client', 'provider', 'admin'],
        default: 'client'
    },
    profilePicture: {
        type: String,
        default: ''
    },
    dateOfBirth: {
        type: Date,
        required: function () { return this.role === 'client'; }
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: function () { return this.role === 'client'; }
    },

    // Provider-specific fields
    specializations: [{
        type: String,
        required: function () { return this.role === 'provider'; }
    }],
    licenseNumber: {
        type: String,
        required: function () { return this.role === 'provider'; }
    },
    experience: {
        type: Number,
        default: 0,
        required: function () { return this.role === 'provider'; }
    },
    education: [{
        degree: String,
        institution: String,
        year: Number
    }],
    certifications: [{
        name: String,
        issuer: String,
        year: Number,
        file: String // URL or path to the uploaded certificate file
    }],
    languages: [{
        type: String
    }],
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    availability: [{
        dayOfWeek: Number, // 0 = Monday, 6 = Sunday
        isAvailable: Boolean,
        // Legacy fields - kept for backward compatibility
        startTime: String, // Format: "HH:MM"
        endTime: String,   // Format: "HH:MM"
        // New field - multiple time slots per day
        timeSlots: [timeSlotSchema]
    }],
    sessionFee: {
        type: Number,
        required: function () { return this.role === 'provider'; }
    },

    // NEW: Provider Analytics Fields
    sessionDuration: {
        type: Number,
        enum: [15, 30, 45, 60, 75, 90, 105, 120],
        default: 60,
        required: function () { return this.role === 'provider'; }
    },
    profileCompletionPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    profileSetupStep: {
        type: Number,
        default: 0,
        min: 0,
        max: 6 // Steps: 1-Education, 2-Availability, 3-Session Settings, 4-Profile Info, 5-Review, 6-Complete
    },
    profileCompletedAt: {
        type: Date
    },
    lastLoginAt: {
        type: Date
    },
    onboardingCompleted: {
        type: Boolean,
        default: false
    },

    // Client-specific fields
    backgroundInfo: {
        type: String,
        required: false
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },

    // Agreement to terms
    termsAccepted: {
        type: Boolean,
        default: false
    },
    privacyPolicyAccepted: {
        type: Boolean,
        default: false
    },
    termsAcceptedAt: {
        type: Date
    },

    // Common fields
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    telegramId: {
        type: String
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Security fields
    jwtSecret: {
        type: String,
        default: () => crypto.randomBytes(32).toString('hex')
    },
    jwtSecretCreatedAt: {
        type: Date,
        default: Date.now
    },

    // Content moderation
    contentViolations: [{
        timestamp: Date,
        matches: [String],
        contentExcerpt: String
    }],
    isSuspended: {
        type: Boolean,
        default: false
    },
    suspensionEnd: Date,
    suspensionReason: String,
    hasWarning: {
        type: Boolean,
        default: false
    },
    warningMessage: String,
    banReason: String
}, {
    timestamps: true
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ role: 1, isProfileComplete: 1 }); // NEW: For filtering complete profiles
userSchema.index({ role: 1, profileSetupStep: 1 }); // NEW: For onboarding tracking

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// NEW: Calculate and update profile completion percentage
userSchema.methods.calculateProfileCompletion = function () {
    if (this.role !== 'provider') {
        this.profileCompletionPercentage = 100;
        this.isProfileComplete = true;
        return;
    }

    let completed = 0;
    const totalFields = 10;

    // Check required fields
    if (this.firstName && this.lastName) completed += 1;
    if (this.email) completed += 1;
    if (this.phone) completed += 1;
    if (this.specializations && this.specializations.length > 0) completed += 1;
    if (this.licenseNumber) completed += 1;
    if (this.bio && this.bio.length >= 50) completed += 1; // Minimum bio length
    if (this.sessionFee && this.sessionFee > 0) completed += 1;
    if (this.sessionDuration) completed += 1;
    if (this.availability && this.availability.some(day => day.isAvailable)) completed += 1;
    if (this.education && this.education.length > 0) completed += 1;

    this.profileCompletionPercentage = Math.round((completed / totalFields) * 100);
    this.isProfileComplete = this.profileCompletionPercentage >= 90; // 90% threshold

    if (this.isProfileComplete && !this.profileCompletedAt) {
        this.profileCompletedAt = new Date();
        this.onboardingCompleted = true;
        this.profileSetupStep = 6; // Mark as completed
    }
};

// Update profile completion before saving
userSchema.pre('save', function (next) {
    if (this.role === 'provider') {
        this.calculateProfileCompletion();
    }
    next();
});

// NEW: Check if provider needs onboarding
userSchema.methods.needsOnboarding = function () {
    return this.role === 'provider' && (!this.onboardingCompleted || this.profileSetupStep < 6);
};

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
    const payload = {
        id: this._id,
        role: this.role,
        email: this.email
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET + this.jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpire;
    delete userObject.verificationToken;
    delete userObject.jwtSecret;
    delete userObject.contentViolations;
    return userObject;
};

// Generate reset password token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

// Static method to find providers with complete profiles only
userSchema.statics.findCompleteProviders = function (filters = {}) {
    return this.find({
        role: 'provider',
        isActive: true,
        isVerified: true,
        isProfileComplete: true, // NEW: Only complete profiles
        ...filters
    });
};

// Static method to find providers needing onboarding
userSchema.statics.findProvidersNeedingOnboarding = function () {
    return this.find({
        role: 'provider',
        isActive: true,
        $or: [
            { onboardingCompleted: false },
            { profileSetupStep: { $lt: 6 } },
            { isProfileComplete: false }
        ]
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User;