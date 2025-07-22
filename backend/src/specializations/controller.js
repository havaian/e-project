const Specialization = require('./model');
const User = require('../user/model');

/**
 * Get all active specializations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getActiveSpecializations = async (req, res) => {
    try {
        const specializations = await Specialization.find({ isActive: true })
            .sort({ name: 1 })
            .select('name description icon');

        // Get count of active providers for each specializations
        const specializationsWithProviderCount = await Promise.all(
            specializations.map(async (spec) => {
                const providerCount = await User.countDocuments({
                    role: 'provider',
                    specializations: spec.name,
                    isActive: true,
                    isVerified: true
                });

                return {
                    ...spec.toObject(),
                    providerCount
                };
            })
        );

        res.status(200).json({
            specializations: specializationsWithProviderCount
        });
    } catch (error) {
        console.error('Error fetching specializations:', error);
        res.status(500).json({
            message: 'An error occurred while fetching specializations',
            error: error.message
        });
    }
};

/**
 * Get specializations by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSpecializationById = async (req, res) => {
    try {
        const { id } = req.params;

        const specializations = await Specialization.findById(id);

        if (!specializations) {
            return res.status(404).json({ message: 'Specialization not found' });
        }

        if (!specializations.isActive) {
            return res.status(404).json({ message: 'Specialization is not active' });
        }

        // Get count of active providers for this specializations
        const providerCount = await User.countDocuments({
            role: 'provider',
            specializations: specializations.name,
            isActive: true,
            isVerified: true
        });

        res.status(200).json({
            specializations: {
                ...specializations.toObject(),
                providerCount
            }
        });
    } catch (error) {
        console.error('Error fetching specializations:', error);
        res.status(500).json({
            message: 'An error occurred while fetching specializations',
            error: error.message
        });
    }
};

/**
 * Get providers by specializations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProvidersBySpecialization = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const specializations = await Specialization.findById(id);

        if (!specializations) {
            return res.status(404).json({ message: 'Specialization not found' });
        }

        if (!specializations.isActive) {
            return res.status(404).json({ message: 'Specialization is not active' });
        }

        // Query for providers with this specializations
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const providers = await User.find({
            role: 'provider',
            specializations: specializations.name,
            isActive: true,
            isVerified: true
        })
            .select('firstName lastName profilePicture experience sessionFeebio languages address')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ experience: -1 });

        const total = await User.countDocuments({
            role: 'provider',
            specializations: specializations.name,
            isActive: true,
            isVerified: true
        });

        res.status(200).json({
            specializations: {
                _id: specializations._id,
                name: specializations.name,
                description: specializations.description,
                icon: specializations.icon
            },
            providers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching providers by specializations:', error);
        res.status(500).json({
            message: 'An error occurred while fetching providers',
            error: error.message
        });
    }
};