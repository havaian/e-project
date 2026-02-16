// backend/src/course/controller.js
const fs = require('fs');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Course, Enrollment, HomeworkSubmission, QuizAttempt } = require('./model');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const UPLOADS_ROOT = path.join(__dirname, '../../../uploads');

/**
 * Remove a file from disk safely (no throw if not found).
 */
const removeFile = (relativePath) => {
    if (!relativePath) return;
    const abs = path.join(UPLOADS_ROOT, relativePath.replace(/^\/uploads\//, ''));
    if (fs.existsSync(abs)) {
        try { fs.unlinkSync(abs); } catch (e) { /* ignore */ }
    }
};

/**
 * Count all lessons across a course's block/topic tree.
 */
const countLessons = (course) =>
    course.blocks.reduce((total, block) =>
        total + block.topics.reduce((t, topic) => t + topic.lessons.length, 0), 0);


// ═══════════════════════════════════════════════════════════════════════════
//  PROVIDER — Course CRUD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/courses
 */
exports.createCourse = async (req, res) => {
    try {
        const { title, description, category, subcategory, price, currency, thumbnail } = req.body;

        const course = await Course.create({
            provider: req.user.id,
            title,
            description,
            category,
            subcategory,
            price: price ?? 0,
            currency: currency || 'uzs',
            thumbnail: thumbnail || null
        });

        res.status(201).json({ success: true, data: course });
    } catch (error) {
        console.error('createCourse error:', error);
        res.status(500).json({ message: 'Failed to create course' });
    }
};

/**
 * GET /api/courses/my
 */
exports.getMyCourses = async (req, res) => {
    try {
        const courses = await Course.find({ provider: req.user.id }).sort({ createdAt: -1 });

        // Attach student count to each course
        const courseIds = courses.map(c => c._id);
        const enrollments = await Enrollment.find({
            course: { $in: courseIds },
            'payment.status': { $in: ['succeeded', 'free'] }
        }).select('course');

        const countMap = {};
        enrollments.forEach(e => {
            const key = e.course.toString();
            countMap[key] = (countMap[key] || 0) + 1;
        });

        const data = courses.map(c => ({
            ...c.toObject(),
            studentCount: countMap[c._id.toString()] || 0
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('getMyCourses error:', error);
        res.status(500).json({ message: 'Failed to get courses' });
    }
};

/**
 * GET /api/courses/dashboard
 */
exports.getProviderDashboard = async (req, res) => {
    try {
        const providerId = req.user.id;

        const courses = await Course.find({ provider: providerId });
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({
            course: { $in: courseIds },
            'payment.status': { $in: ['succeeded', 'free'] }
        });

        const grossRevenue = enrollments.reduce((sum, e) => sum + (e.payment.amount || 0), 0);
        const totalStudents = new Set(enrollments.map(e => e.client.toString())).size;
        const activeAssets = courses.filter(c => c.status === 'published').length;

        // Average rating across all courses
        let ratingSum = 0, ratingCount = 0;
        courses.forEach(c => {
            (c.ratings || []).forEach(r => { ratingSum += r.value; ratingCount++; });
        });
        const averageRating = ratingCount ? parseFloat((ratingSum / ratingCount).toFixed(2)) : 0;

        // Students per course (used by bar chart)
        const acquisitionVolume = courses.map(course => {
            const students = enrollments.filter(e => e.course.toString() === course._id.toString()).length;
            return { courseId: course._id, title: course.title, students };
        });

        // Top performers sorted by student count
        const topPerformers = [...acquisitionVolume]
            .sort((a, b) => b.students - a.students)
            .slice(0, 5);

        res.status(200).json({
            success: true,
            data: { grossRevenue, totalStudents, averageRating, activeAssets, acquisitionVolume, topPerformers }
        });
    } catch (error) {
        console.error('getProviderDashboard error:', error);
        res.status(500).json({ message: 'Failed to get dashboard data' });
    }
};

/**
 * GET /api/courses/:id  (provider — full data with blocks/topics/lessons)
 */
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('getCourseById error:', error);
        res.status(500).json({ message: 'Failed to get course' });
    }
};

/**
 * PUT /api/courses/:id
 */
exports.updateCourse = async (req, res) => {
    try {
        const { title, description, category, subcategory, price, currency, thumbnail } = req.body;

        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (title !== undefined) course.title = title;
        if (description !== undefined) course.description = description;
        if (category !== undefined) course.category = category;
        if (subcategory !== undefined) course.subcategory = subcategory;
        if (price !== undefined) course.price = price;
        if (currency !== undefined) course.currency = currency;
        if (thumbnail !== undefined) course.thumbnail = thumbnail;

        await course.save();
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('updateCourse error:', error);
        res.status(500).json({ message: 'Failed to update course' });
    }
};

/**
 * DELETE /api/courses/:id
 */
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.status === 'published') {
            return res.status(400).json({ message: 'Cannot delete a published course. Archive it first.' });
        }

        // Remove uploaded video files
        course.blocks.forEach(block => {
            block.topics.forEach(topic => {
                topic.lessons.forEach(lesson => {
                    if (lesson.videoFile) removeFile(lesson.videoFile);
                    lesson.materials.forEach(m => removeFile(m.fileUrl));
                });
            });
        });

        await course.deleteOne();
        res.status(200).json({ success: true, message: 'Course deleted' });
    } catch (error) {
        console.error('deleteCourse error:', error);
        res.status(500).json({ message: 'Failed to delete course' });
    }
};

/**
 * POST /api/courses/:id/publish
 */
exports.publishCourse = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.status === 'published') {
            return res.status(400).json({ message: 'Course is already published' });
        }

        course.status = 'published';
        await course.save();
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('publishCourse error:', error);
        res.status(500).json({ message: 'Failed to publish course' });
    }
};

/**
 * POST /api/courses/:id/archive
 */
exports.archiveCourse = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        course.status = 'archived';
        await course.save();
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('archiveCourse error:', error);
        res.status(500).json({ message: 'Failed to archive course' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════
//  PROVIDER — Block management
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/courses/:id/blocks
 */
exports.addBlock = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const { title } = req.body;
        if (!title?.trim()) return res.status(400).json({ message: 'Block title is required' });

        course.blocks.push({ title: title.trim(), order: course.blocks.length });
        await course.save();
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        console.error('addBlock error:', error);
        res.status(500).json({ message: 'Failed to add block' });
    }
};

/**
 * PUT /api/courses/:id/blocks/:blockId
 */
exports.updateBlock = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const block = course.blocks.id(req.params.blockId);
        if (!block) return res.status(404).json({ message: 'Block not found' });

        const { title, order } = req.body;
        if (title !== undefined) block.title = title;
        if (order !== undefined) block.order = order;

        await course.save();
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('updateBlock error:', error);
        res.status(500).json({ message: 'Failed to update block' });
    }
};

/**
 * DELETE /api/courses/:id/blocks/:blockId
 */
exports.deleteBlock = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const block = course.blocks.id(req.params.blockId);
        if (!block) return res.status(404).json({ message: 'Block not found' });

        // Remove uploaded files for all lessons in this block
        block.topics.forEach(topic => {
            topic.lessons.forEach(lesson => {
                if (lesson.videoFile) removeFile(lesson.videoFile);
                lesson.materials.forEach(m => removeFile(m.fileUrl));
            });
        });

        block.deleteOne();
        await course.save();
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('deleteBlock error:', error);
        res.status(500).json({ message: 'Failed to delete block' });
    }
};

/**
 * PUT /api/courses/:id/blocks/:blockId/quiz
 * Body: { questions: [{ question, options, correctAnswer, explanation }] }
 */
exports.saveBlockQuiz = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const block = course.blocks.id(req.params.blockId);
        if (!block) return res.status(404).json({ message: 'Block not found' });

        block.quiz = { questions: req.body.questions || [] };
        await course.save();
        res.status(200).json({ success: true, data: block.quiz });
    } catch (error) {
        console.error('saveBlockQuiz error:', error);
        res.status(500).json({ message: 'Failed to save quiz' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════
//  PROVIDER — Topic management
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/courses/:id/blocks/:blockId/topics
 */
exports.addTopic = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const block = course.blocks.id(req.params.blockId);
        if (!block) return res.status(404).json({ message: 'Block not found' });

        const { title } = req.body;
        if (!title?.trim()) return res.status(400).json({ message: 'Topic title is required' });

        block.topics.push({ title: title.trim(), order: block.topics.length });
        await course.save();
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        console.error('addTopic error:', error);
        res.status(500).json({ message: 'Failed to add topic' });
    }
};

/**
 * PUT /api/courses/:id/blocks/:blockId/topics/:topicId
 */
exports.updateTopic = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const block = course.blocks.id(req.params.blockId);
        if (!block) return res.status(404).json({ message: 'Block not found' });

        const topic = block.topics.id(req.params.topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        const { title, order } = req.body;
        if (title !== undefined) topic.title = title;
        if (order !== undefined) topic.order = order;

        await course.save();
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('updateTopic error:', error);
        res.status(500).json({ message: 'Failed to update topic' });
    }
};

/**
 * DELETE /api/courses/:id/blocks/:blockId/topics/:topicId
 */
exports.deleteTopic = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const block = course.blocks.id(req.params.blockId);
        if (!block) return res.status(404).json({ message: 'Block not found' });

        const topic = block.topics.id(req.params.topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        topic.lessons.forEach(lesson => {
            if (lesson.videoFile) removeFile(lesson.videoFile);
            lesson.materials.forEach(m => removeFile(m.fileUrl));
        });

        topic.deleteOne();
        await course.save();
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('deleteTopic error:', error);
        res.status(500).json({ message: 'Failed to delete topic' });
    }
};

/**
 * PUT /api/courses/:id/blocks/:blockId/topics/:topicId/quiz
 */
exports.saveTopicQuiz = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const block = course.blocks.id(req.params.blockId);
        if (!block) return res.status(404).json({ message: 'Block not found' });

        const topic = block.topics.id(req.params.topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        topic.quiz = { questions: req.body.questions || [] };
        await course.save();
        res.status(200).json({ success: true, data: topic.quiz });
    } catch (error) {
        console.error('saveTopicQuiz error:', error);
        res.status(500).json({ message: 'Failed to save quiz' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════
//  PROVIDER — Lesson management
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/courses/:id/blocks/:blockId/topics/:topicId/lessons
 */
exports.addLesson = async (req, res) => {
    try {
        const { id, blockId, topicId } = req.params;
        const course = await Course.findOne({ _id: id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const block = course.blocks.id(blockId);
        if (!block) return res.status(404).json({ message: 'Block not found' });

        const topic = block.topics.id(topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        const { title } = req.body;
        if (!title?.trim()) return res.status(400).json({ message: 'Lesson title is required' });

        topic.lessons.push({ title: title.trim(), order: topic.lessons.length });
        await course.save();
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        console.error('addLesson error:', error);
        res.status(500).json({ message: 'Failed to add lesson' });
    }
};

/**
 * PUT /api/courses/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId
 * Handles text fields only (title, videoUrl, text, assignmentPrompt).
 * Files are handled by dedicated upload endpoints.
 */
exports.updateLesson = async (req, res) => {
    try {
        const { id, blockId, topicId, lessonId } = req.params;
        const course = await Course.findOne({ _id: id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const block = course.blocks.id(blockId);
        const topic = block?.topics.id(topicId);
        const lesson = topic?.lessons.id(lessonId);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        const { title, videoUrl, text, assignmentPrompt } = req.body;
        if (title !== undefined) lesson.title = title;
        if (text !== undefined) lesson.text = text;
        if (assignmentPrompt !== undefined) lesson.assignmentPrompt = assignmentPrompt;

        // Setting an external URL clears any uploaded file reference
        if (videoUrl !== undefined) {
            if (videoUrl && lesson.videoFile) {
                removeFile(lesson.videoFile);
                lesson.videoFile = null;
            }
            lesson.videoUrl = videoUrl;
        }

        await course.save();
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('updateLesson error:', error);
        res.status(500).json({ message: 'Failed to update lesson' });
    }
};

/**
 * DELETE /api/courses/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId
 */
exports.deleteLesson = async (req, res) => {
    try {
        const { id, blockId, topicId, lessonId } = req.params;
        const course = await Course.findOne({ _id: id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const block = course.blocks.id(blockId);
        const topic = block?.topics.id(topicId);
        const lesson = topic?.lessons.id(lessonId);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        if (lesson.videoFile) removeFile(lesson.videoFile);
        lesson.materials.forEach(m => removeFile(m.fileUrl));

        lesson.deleteOne();
        await course.save();
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('deleteLesson error:', error);
        res.status(500).json({ message: 'Failed to delete lesson' });
    }
};

/**
 * POST /api/courses/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId/upload-video
 * Expects multipart/form-data field: video
 */
exports.uploadLessonVideo = async (req, res) => {
    try {
        const { id, blockId, topicId, lessonId } = req.params;

        if (!req.file) return res.status(400).json({ message: 'No video file uploaded' });

        const course = await Course.findOne({ _id: id, provider: req.user.id });
        if (!course) {
            removeFile(`/uploads/videos/${req.file.filename}`);
            return res.status(404).json({ message: 'Course not found' });
        }

        const block = course.blocks.id(blockId);
        const topic = block?.topics.id(topicId);
        const lesson = topic?.lessons.id(lessonId);

        if (!lesson) {
            removeFile(`/uploads/videos/${req.file.filename}`);
            return res.status(404).json({ message: 'Lesson not found' });
        }

        // Delete previous uploaded video if it exists
        if (lesson.videoFile) removeFile(lesson.videoFile);

        lesson.videoFile = `/uploads/videos/${req.file.filename}`;
        // Uploading a file clears the external URL
        lesson.videoUrl = null;

        await course.save();
        res.status(200).json({ success: true, data: { videoFile: lesson.videoFile } });
    } catch (error) {
        if (req.file) removeFile(`/uploads/videos/${req.file.filename}`);
        console.error('uploadLessonVideo error:', error);
        res.status(500).json({ message: 'Failed to upload video' });
    }
};

/**
 * POST /api/courses/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId/upload-material
 * Expects multipart/form-data field: material (can be multiple files)
 */
exports.uploadLessonMaterial = async (req, res) => {
    try {
        const { id, blockId, topicId, lessonId } = req.params;

        if (!req.files?.length) return res.status(400).json({ message: 'No material files uploaded' });

        const course = await Course.findOne({ _id: id, provider: req.user.id });
        if (!course) {
            req.files.forEach(f => removeFile(`/uploads/course-materials/${f.filename}`));
            return res.status(404).json({ message: 'Course not found' });
        }

        const block = course.blocks.id(blockId);
        const topic = block?.topics.id(topicId);
        const lesson = topic?.lessons.id(lessonId);

        if (!lesson) {
            req.files.forEach(f => removeFile(`/uploads/course-materials/${f.filename}`));
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const added = req.files.map(file => ({
            name: file.originalname,
            fileUrl: `/uploads/course-materials/${file.filename}`,
            fileType: file.mimetype
        }));

        lesson.materials.push(...added);
        await course.save();
        res.status(200).json({ success: true, data: added });
    } catch (error) {
        if (req.files) req.files.forEach(f => removeFile(`/uploads/course-materials/${f.filename}`));
        console.error('uploadLessonMaterial error:', error);
        res.status(500).json({ message: 'Failed to upload material' });
    }
};

/**
 * DELETE /api/courses/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId/materials/:materialId
 */
exports.deleteLessonMaterial = async (req, res) => {
    try {
        const { id, blockId, topicId, lessonId, materialId } = req.params;
        const course = await Course.findOne({ _id: id, provider: req.user.id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const block = course.blocks.id(blockId);
        const topic = block?.topics.id(topicId);
        const lesson = topic?.lessons.id(lessonId);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        const material = lesson.materials.id(materialId);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        removeFile(material.fileUrl);
        material.deleteOne();
        await course.save();

        res.status(200).json({ success: true, message: 'Material deleted' });
    } catch (error) {
        console.error('deleteLessonMaterial error:', error);
        res.status(500).json({ message: 'Failed to delete material' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════
//  PROVIDER — Homework grading
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/courses/homework?status=pending&courseId=xxx
 */
exports.getHomeworkSubmissions = async (req, res) => {
    try {
        const filter = { provider: req.user.id };
        if (req.query.status) filter.status = req.query.status;
        if (req.query.courseId) filter.course = req.query.courseId;

        const submissions = await HomeworkSubmission.find(filter)
            .populate('client', 'firstName lastName profilePicture')
            .populate('course', 'title')
            .sort({ submittedAt: -1 });

        res.status(200).json({ success: true, data: submissions });
    } catch (error) {
        console.error('getHomeworkSubmissions error:', error);
        res.status(500).json({ message: 'Failed to get submissions' });
    }
};

/**
 * PUT /api/courses/homework/:submissionId/grade
 * Body: { grade, feedback, status }
 */
exports.gradeSubmission = async (req, res) => {
    try {
        const submission = await HomeworkSubmission.findOne({
            _id: req.params.submissionId,
            provider: req.user.id
        });
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        const { grade, feedback, status } = req.body;
        if (grade !== undefined) submission.grade = grade;
        if (feedback !== undefined) submission.feedback = feedback;
        submission.status = status || 'graded';
        submission.gradedAt = new Date();

        await submission.save();
        res.status(200).json({ success: true, data: submission });
    } catch (error) {
        console.error('gradeSubmission error:', error);
        res.status(500).json({ message: 'Failed to grade submission' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════
//  PUBLIC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/courses?category=&search=&page=&limit=
 * Returns published courses without lesson content.
 */
exports.browseCourses = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 12 } = req.query;

        const filter = { status: 'published' };
        if (category) filter.category = category;
        if (search) filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Course.countDocuments(filter);

        const courses = await Course.find(filter)
            .populate('provider', 'firstName lastName profilePicture')
            .select('-blocks.topics.lessons.text -blocks.topics.lessons.videoFile -blocks.quiz -blocks.topics.quiz')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({ success: true, data: courses, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        console.error('browseCourses error:', error);
        res.status(500).json({ message: 'Failed to browse courses' });
    }
};

/**
 * GET /api/courses/:id/public
 * Public course detail — structure visible but lesson content hidden.
 */
exports.getCoursePublic = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, status: 'published' })
            .populate('provider', 'firstName lastName profilePicture bio');

        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Strip lesson content (text, videoUrl, videoFile, materials, assignmentPrompt)
        const stripped = course.toObject();
        stripped.blocks.forEach(block => {
            delete block.quiz;
            block.topics.forEach(topic => {
                delete topic.quiz;
                topic.lessons.forEach(lesson => {
                    delete lesson.text;
                    delete lesson.videoUrl;
                    delete lesson.videoFile;
                    delete lesson.materials;
                    delete lesson.assignmentPrompt;
                });
            });
        });

        res.status(200).json({ success: true, data: stripped });
    } catch (error) {
        console.error('getCoursePublic error:', error);
        res.status(500).json({ message: 'Failed to get course' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════
//  CLIENT — Enrollment & Learning
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/courses/my-learning
 */
exports.getMyLearning = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            client: req.user.id,
            'payment.status': { $in: ['succeeded', 'free'] },
            status: { $ne: 'cancelled' }
        })
            .populate('course', 'title thumbnail category subcategory provider')
            .sort({ enrolledAt: -1 });

        res.status(200).json({ success: true, data: enrollments });
    } catch (error) {
        console.error('getMyLearning error:', error);
        res.status(500).json({ message: 'Failed to get learning data' });
    }
};

/**
 * GET /api/courses/:id/learn
 * Full course content — only accessible to enrolled client or the provider.
 */
exports.getCourseContent = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('provider', 'firstName lastName profilePicture');

        if (!course) return res.status(404).json({ message: 'Course not found' });

        const isProvider = course.provider._id.toString() === req.user.id;

        if (!isProvider) {
            const enrollment = await Enrollment.findOne({
                course: req.params.id,
                client: req.user.id,
                'payment.status': { $in: ['succeeded', 'free'] }
            });
            if (!enrollment) {
                return res.status(403).json({ message: 'You are not enrolled in this course' });
            }

            return res.status(200).json({ success: true, data: course, progress: enrollment.progress });
        }

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error('getCourseContent error:', error);
        res.status(500).json({ message: 'Failed to get course content' });
    }
};

/**
 * POST /api/courses/:id/enroll
 * Creates a Stripe checkout session or enrolls for free if price === 0.
 */
exports.initiateEnrollment = async (req, res) => {
    try {
        const courseId = req.params.id;
        const clientId = req.user.id;

        const course = await Course.findById(courseId).populate('provider', 'firstName lastName');
        if (!course || course.status !== 'published') {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Prevent provider from enrolling in their own course
        if (course.provider._id.toString() === clientId) {
            return res.status(400).json({ message: 'You cannot enroll in your own course' });
        }

        // Check for active enrollment that is already paid
        const existing = await Enrollment.findOne({
            course: courseId,
            client: clientId,
            'payment.status': { $in: ['succeeded', 'free'] }
        });
        if (existing) {
            return res.status(400).json({ message: 'You are already enrolled in this course' });
        }

        // Free course
        if (course.price === 0) {
            const enrollment = await Enrollment.create({
                course: courseId,
                client: clientId,
                payment: { amount: 0, currency: course.currency || 'uzs', status: 'free' }
            });
            return res.status(201).json({ success: true, data: { enrollment, free: true } });
        }

        // Paid course — create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: course.currency || 'uzs',
                    product_data: {
                        name: course.title,
                        description: course.description?.substring(0, 255)
                    },
                    unit_amount: course.price * 100
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/courses/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/courses/${courseId}`,
            metadata: {
                courseId: courseId,
                clientId: clientId.toString(),
                providerId: course.provider._id.toString()
            }
        });

        // Find a pending enrollment to update, or create a new one
        let enrollment = await Enrollment.findOne({ course: courseId, client: clientId, status: { $ne: 'cancelled' } });

        if (enrollment) {
            enrollment.payment.stripeSessionId = session.id;
            enrollment.payment.checkoutUrl = session.url;
            enrollment.payment.status = 'pending';
        } else {
            enrollment = new Enrollment({
                course: courseId,
                client: clientId,
                payment: {
                    amount: course.price,
                    currency: course.currency || 'uzs',
                    status: 'pending',
                    stripeSessionId: session.id,
                    checkoutUrl: session.url
                }
            });
        }

        await enrollment.save();
        res.status(200).json({ success: true, data: { checkoutUrl: session.url, enrollmentId: enrollment._id } });
    } catch (error) {
        console.error('initiateEnrollment error:', error);
        res.status(500).json({ message: 'Failed to initiate enrollment' });
    }
};

/**
 * GET /api/courses/enrollment/confirm?session_id=xxx
 * Called by frontend after Stripe redirects back on success.
 */
exports.confirmEnrollment = async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ message: 'session_id is required' });

        const enrollment = await Enrollment.findOne({ 'payment.stripeSessionId': session_id })
            .populate('course', 'title description thumbnail');

        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found for this session' });

        // If already confirmed, return as-is
        if (enrollment.payment.status === 'succeeded') {
            return res.status(200).json({ success: true, data: enrollment });
        }

        // Verify with Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
            enrollment.payment.status = 'succeeded';
            enrollment.payment.paidAt = new Date();
            await enrollment.save();
        }

        res.status(200).json({
            success: true,
            data: enrollment,
            paid: enrollment.payment.status === 'succeeded'
        });
    } catch (error) {
        console.error('confirmEnrollment error:', error);
        res.status(500).json({ message: 'Failed to confirm enrollment' });
    }
};

/**
 * POST /api/courses/:id/lessons/:lessonId/complete
 * Marks a lesson as completed and recalculates overall progress %.
 */
exports.completeLesson = async (req, res) => {
    try {
        const { id, lessonId } = req.params;

        const enrollment = await Enrollment.findOne({
            course: id,
            client: req.user.id,
            'payment.status': { $in: ['succeeded', 'free'] }
        }).populate('course');

        if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

        const alreadyDone = enrollment.progress.completedLessons.some(
            l => l.lessonId.toString() === lessonId
        );

        if (!alreadyDone) {
            enrollment.progress.completedLessons.push({ lessonId, completedAt: new Date() });
        }

        const total = countLessons(enrollment.course);
        enrollment.progress.percentComplete = total
            ? Math.round((enrollment.progress.completedLessons.length / total) * 100)
            : 0;

        if (enrollment.progress.percentComplete >= 100 && enrollment.status !== 'completed') {
            enrollment.status = 'completed';
            enrollment.completedAt = new Date();
        }

        await enrollment.save();
        res.status(200).json({ success: true, data: { progress: enrollment.progress } });
    } catch (error) {
        console.error('completeLesson error:', error);
        res.status(500).json({ message: 'Failed to mark lesson complete' });
    }
};

/**
 * POST /api/courses/:id/lessons/:lessonId/homework
 * Body: { submissionText } + optional file attachments (field: attachments)
 */
exports.submitHomework = async (req, res) => {
    try {
        const { id, lessonId } = req.params;
        const clientId = req.user.id;

        const enrollment = await Enrollment.findOne({
            course: id,
            client: clientId,
            'payment.status': { $in: ['succeeded', 'free'] }
        });
        if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

        const course = await Course.findById(id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Locate lesson for its title
        let lessonTitle = '';
        course.blocks.forEach(block => {
            block.topics.forEach(topic => {
                const lesson = topic.lessons.id(lessonId);
                if (lesson) lessonTitle = lesson.title;
            });
        });

        const attachments = (req.files || []).map(file => ({
            name: file.originalname,
            fileUrl: `/uploads/course-materials/${file.filename}`,
            fileType: file.mimetype
        }));

        const submission = await HomeworkSubmission.create({
            course: id,
            enrollment: enrollment._id,
            client: clientId,
            provider: course.provider,
            lessonId,
            lessonTitle,
            courseTitle: course.title,
            submissionText: req.body.submissionText,
            attachments
        });

        res.status(201).json({ success: true, data: submission });
    } catch (error) {
        if (req.files) req.files.forEach(f => removeFile(`/uploads/course-materials/${f.filename}`));
        console.error('submitHomework error:', error);
        res.status(500).json({ message: 'Failed to submit homework' });
    }
};

/**
 * POST /api/courses/:id/blocks/:blockId/quiz/attempt
 * Body: { answers: [selectedOptionIndex, ...], topicId? }
 * topicId present → topic quiz; absent → block quiz
 */
exports.submitQuizAttempt = async (req, res) => {
    try {
        const { id, blockId } = req.params;
        const { topicId, answers } = req.body;
        const clientId = req.user.id;

        const enrollment = await Enrollment.findOne({
            course: id,
            client: clientId,
            'payment.status': { $in: ['succeeded', 'free'] }
        });
        if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

        const course = await Course.findById(id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const block = course.blocks.id(blockId);
        if (!block) return res.status(404).json({ message: 'Block not found' });

        let quiz, quizId, quizType;

        if (topicId) {
            const topic = block.topics.id(topicId);
            if (!topic?.quiz?.questions?.length) return res.status(404).json({ message: 'Topic quiz not found' });
            quiz = topic.quiz;
            quizId = topic._id;
            quizType = 'topic';
        } else {
            if (!block.quiz?.questions?.length) return res.status(404).json({ message: 'Block quiz not found' });
            quiz = block.quiz;
            quizId = block._id;
            quizType = 'block';
        }

        if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
            return res.status(400).json({ message: 'Answer count must match question count' });
        }

        const gradedAnswers = answers.map((selectedOption, i) => ({
            questionIndex: i,
            selectedOption,
            isCorrect: selectedOption === quiz.questions[i].correctAnswer
        }));

        const correctCount = gradedAnswers.filter(a => a.isCorrect).length;
        const score = Math.round((correctCount / quiz.questions.length) * 100);
        const passed = score >= 60;

        await QuizAttempt.create({
            course: id,
            enrollment: enrollment._id,
            client: clientId,
            quizId,
            quizType,
            answers: gradedAnswers,
            score,
            passed
        });

        // Record in enrollment progress (allow re-attempts — push latest)
        enrollment.progress.completedQuizzes.push({
            quizId,
            quizType,
            score,
            completedAt: new Date()
        });
        await enrollment.save();

        res.status(200).json({
            success: true,
            data: {
                score,
                passed,
                correctCount,
                totalQuestions: quiz.questions.length,
                answers: gradedAnswers
            }
        });
    } catch (error) {
        console.error('submitQuizAttempt error:', error);
        res.status(500).json({ message: 'Failed to submit quiz' });
    }
};


// ═══════════════════════════════════════════════════════════════════════════
//  SHARED — Video streaming (provider preview + enrolled client playback)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/courses/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId/stream
 * Supports HTTP range requests for video seeking.
 */
exports.streamLessonVideo = async (req, res) => {
    try {
        const { id, blockId, topicId, lessonId } = req.params;
        const userId = req.user.id;

        const course = await Course.findById(id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const isProvider = course.provider.toString() === userId;

        if (!isProvider) {
            const enrollment = await Enrollment.findOne({
                course: id,
                client: userId,
                'payment.status': { $in: ['succeeded', 'free'] }
            });
            if (!enrollment) return res.status(403).json({ message: 'Not authorized to view this video' });
        }

        const block = course.blocks.id(blockId);
        const topic = block?.topics.id(topicId);
        const lesson = topic?.lessons.id(lessonId);

        if (!lesson?.videoFile) return res.status(404).json({ message: 'No uploaded video for this lesson' });

        const videoPath = path.join(UPLOADS_ROOT, lesson.videoFile.replace(/^\/uploads\//, ''));

        if (!fs.existsSync(videoPath)) return res.status(404).json({ message: 'Video file not found on server' });

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const [rawStart, rawEnd] = range.replace(/bytes=/, '').split('-');
            const start = parseInt(rawStart, 10);
            const end = rawEnd ? parseInt(rawEnd, 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4'
            });
            fs.createReadStream(videoPath, { start, end }).pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4'
            });
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        console.error('streamLessonVideo error:', error);
        if (!res.headersSent) res.status(500).json({ message: 'Failed to stream video' });
    }
};

/**
 * POST /api/courses/:id/rate
 * Body: { value: 1-5 }
 * Client must be enrolled and payment confirmed.
 * Each client can only submit one rating per course (upsert).
 */
exports.rateCourse = async (req, res) => {
    try {
        const { value } = req.body;
        const clientId = req.user.id;

        if (!value || value < 1 || value > 5) {
            return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
        }

        // Verify enrollment
        const enrollment = await Enrollment.findOne({
            course: req.params.id,
            client: clientId,
            'payment.status': { $in: ['succeeded', 'free'] }
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'You must be enrolled in this course to rate it' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Upsert: replace existing rating from this client, or push new
        const existingIndex = course.ratings.findIndex(
            r => r.client?.toString() === clientId
        );

        if (existingIndex !== -1) {
            course.ratings[existingIndex].value = value;
            course.ratings[existingIndex].ratedAt = new Date();
        } else {
            course.ratings.push({ client: clientId, value, ratedAt: new Date() });
        }

        await course.save();

        const avg = course.ratings.length
            ? parseFloat((course.ratings.reduce((s, r) => s + r.value, 0) / course.ratings.length).toFixed(2))
            : 0;

        res.status(200).json({
            success: true,
            data: { averageRating: avg, totalRatings: course.ratings.length }
        });
    } catch (error) {
        console.error('rateCourse error:', error);
        res.status(500).json({ message: 'Failed to submit rating' });
    }
};