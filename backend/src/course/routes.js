// backend/src/course/routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('./controller');
const { authenticateUser, authorizeRoles } = require('../auth');
const { videoUpload, materialUpload } = require('./uploadConfig');

// ─── Public ──────────────────────────────────────────────────────────────────

/**
 * @route GET /api/courses
 * @desc Browse published courses (with optional ?category= ?search= ?page= ?limit=)
 * @access Public
 */
router.get('/', ctrl.browseCourses);

/**
 * @route GET /api/courses/:id/public
 * @desc Public course detail (structure only, no lesson content)
 * @access Public
 */
router.get('/:id/public', ctrl.getCoursePublic);


// ─── Auth required (any role) ─────────────────────────────────────────────────

/**
 * @route GET /api/courses/enrollment/confirm
 * @desc Confirm enrollment after Stripe redirect (?session_id=xxx)
 * @access Private
 */
router.get('/enrollment/confirm', authenticateUser, ctrl.confirmEnrollment);


// ─── Provider only ───────────────────────────────────────────────────────────

/**
 * @route GET /api/courses/dashboard
 * @desc Provider performance dashboard stats
 * @access Private (provider)
 */
router.get('/dashboard', authenticateUser, authorizeRoles(['provider']), ctrl.getProviderDashboard);

/**
 * @route GET /api/courses/my
 * @desc Get provider's own courses
 * @access Private (provider)
 */
router.get('/my', authenticateUser, authorizeRoles(['provider']), ctrl.getMyCourses);

/**
 * @route GET /api/courses/homework
 * @desc Get all homework submissions for grading (?status= ?courseId=)
 * @access Private (provider)
 */
router.get('/homework', authenticateUser, authorizeRoles(['provider']), ctrl.getHomeworkSubmissions);

/**
 * @route PUT /api/courses/homework/:submissionId/grade
 * @desc Grade a homework submission
 * @access Private (provider)
 */
router.put('/homework/:submissionId/grade', authenticateUser, authorizeRoles(['provider']), ctrl.gradeSubmission);

/**
 * @route POST /api/courses
 * @desc Create a new course (starts as draft)
 * @access Private (provider)
 */
router.post('/', authenticateUser, authorizeRoles(['provider']), ctrl.createCourse);

/**
 * @route GET /api/courses/:id
 * @desc Get full course data for builder (provider only)
 * @access Private (provider)
 */
router.get('/:id', authenticateUser, authorizeRoles(['provider']), ctrl.getCourseById);

/**
 * @route PUT /api/courses/:id
 * @desc Update course metadata (title, description, price, etc.)
 * @access Private (provider)
 */
router.put('/:id', authenticateUser, authorizeRoles(['provider']), ctrl.updateCourse);

/**
 * @route DELETE /api/courses/:id
 * @desc Delete a draft/archived course
 * @access Private (provider)
 */
router.delete('/:id', authenticateUser, authorizeRoles(['provider']), ctrl.deleteCourse);

/**
 * @route POST /api/courses/:id/publish
 * @desc Publish a course
 * @access Private (provider)
 */
router.post('/:id/publish', authenticateUser, authorizeRoles(['provider']), ctrl.publishCourse);

/**
 * @route POST /api/courses/:id/archive
 * @desc Archive a course
 * @access Private (provider)
 */
router.post('/:id/archive', authenticateUser, authorizeRoles(['provider']), ctrl.archiveCourse);

// ── Blocks ────────────────────────────────────────────────────────────────

router.post('/:id/blocks',
    authenticateUser, authorizeRoles(['provider']), ctrl.addBlock);

router.put('/:id/blocks/:blockId',
    authenticateUser, authorizeRoles(['provider']), ctrl.updateBlock);

router.delete('/:id/blocks/:blockId',
    authenticateUser, authorizeRoles(['provider']), ctrl.deleteBlock);

/**
 * @route PUT /api/courses/:id/blocks/:blockId/quiz
 * @desc Save (create/replace) block quiz
 * @access Private (provider)
 */
router.put('/:id/blocks/:blockId/quiz',
    authenticateUser, authorizeRoles(['provider']), ctrl.saveBlockQuiz);

// ── Topics ────────────────────────────────────────────────────────────────

router.post('/:id/blocks/:blockId/topics',
    authenticateUser, authorizeRoles(['provider']), ctrl.addTopic);

router.put('/:id/blocks/:blockId/topics/:topicId',
    authenticateUser, authorizeRoles(['provider']), ctrl.updateTopic);

router.delete('/:id/blocks/:blockId/topics/:topicId',
    authenticateUser, authorizeRoles(['provider']), ctrl.deleteTopic);

/**
 * @route PUT /api/courses/:id/blocks/:blockId/topics/:topicId/quiz
 * @desc Save (create/replace) topic quiz
 * @access Private (provider)
 */
router.put('/:id/blocks/:blockId/topics/:topicId/quiz',
    authenticateUser, authorizeRoles(['provider']), ctrl.saveTopicQuiz);

// ── Lessons ───────────────────────────────────────────────────────────────

router.post('/:id/blocks/:blockId/topics/:topicId/lessons',
    authenticateUser, authorizeRoles(['provider']), ctrl.addLesson);

router.put('/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId',
    authenticateUser, authorizeRoles(['provider']), ctrl.updateLesson);

router.delete('/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId',
    authenticateUser, authorizeRoles(['provider']), ctrl.deleteLesson);

/**
 * @route POST .../lessons/:lessonId/upload-video
 * @desc Upload video file for a lesson (max 100 MB)
 * @access Private (provider)
 */
router.post('/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId/upload-video',
    authenticateUser,
    authorizeRoles(['provider']),
    videoUpload.single('video'),
    ctrl.uploadLessonVideo);

/**
 * @route POST .../lessons/:lessonId/upload-material
 * @desc Upload one or more material files for a lesson (max 5 MB each)
 * @access Private (provider)
 */
router.post('/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId/upload-material',
    authenticateUser,
    authorizeRoles(['provider']),
    materialUpload.array('material', 10),
    ctrl.uploadLessonMaterial);

/**
 * @route DELETE .../lessons/:lessonId/materials/:materialId
 * @access Private (provider)
 */
router.delete('/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId/materials/:materialId',
    authenticateUser, authorizeRoles(['provider']), ctrl.deleteLessonMaterial);


// ─── Client only ──────────────────────────────────────────────────────────────

/**
 * @route GET /api/courses/my-learning
 * @desc Get client's enrolled courses with progress
 * @access Private (client)
 */
router.get('/my-learning', authenticateUser, authorizeRoles(['client']), ctrl.getMyLearning);

/**
 * @route POST /api/courses/:id/enroll
 * @desc Initiate enrollment (creates Stripe session or free enrollment)
 * @access Private (client)
 */
router.post('/:id/enroll', authenticateUser, authorizeRoles(['client']), ctrl.initiateEnrollment);

/**
 * @route POST /api/courses/:id/rate
 * @desc Submit or update a star rating (1–5) for an enrolled course
 * @access Private (client)
 */
router.post('/:id/rate', authenticateUser, authorizeRoles(['client']), ctrl.rateCourse);

/**
 * @route GET /api/courses/:id/learn
 * @desc Get full course content (enrolled client or provider)
 * @access Private
 */
router.get('/:id/learn', authenticateUser, ctrl.getCourseContent);

/**
 * @route POST /api/courses/:id/lessons/:lessonId/complete
 * @desc Mark a lesson as completed, update progress
 * @access Private (client)
 */
router.post('/:id/lessons/:lessonId/complete',
    authenticateUser, authorizeRoles(['client']), ctrl.completeLesson);

/**
 * @route POST /api/courses/:id/lessons/:lessonId/homework
 * @desc Submit homework for a lesson (optional file attachments, field: attachments)
 * @access Private (client)
 */
router.post('/:id/lessons/:lessonId/homework',
    authenticateUser,
    authorizeRoles(['client']),
    materialUpload.array('attachments', 5),
    ctrl.submitHomework);

/**
 * @route POST /api/courses/:id/blocks/:blockId/quiz/attempt
 * @desc Submit a quiz attempt (body: { answers[], topicId? })
 * @access Private (client)
 */
router.post('/:id/blocks/:blockId/quiz/attempt',
    authenticateUser, authorizeRoles(['client']), ctrl.submitQuizAttempt);


// ─── Shared (provider + enrolled client) ─────────────────────────────────────

/**
 * @route GET /api/courses/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId/stream
 * @desc Stream uploaded lesson video (supports range requests)
 * @access Private
 */
router.get('/:id/blocks/:blockId/topics/:topicId/lessons/:lessonId/stream',
    authenticateUser, ctrl.streamLessonVideo);

module.exports = router;