// backend/src/course/model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ─── Reusable sub-schemas ───────────────────────────────────────────────────

const quizQuestionSchema = new Schema({
    question: { type: String, required: true, trim: true },
    options: { type: [String], required: true },   // 2–6 items
    correctAnswer: { type: Number, required: true },      // index into options[]
    explanation: { type: String, trim: true }
});

const quizSchema = new Schema({
    questions: [quizQuestionSchema]
});

const materialSchema = new Schema({
    name: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

// ─── Lesson ─────────────────────────────────────────────────────────────────

const lessonSchema = new Schema({
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    thumbnail: { type: String, default: null },
    videoUrl: { type: String, trim: true },
    videoFile: { type: String },
    text: { type: String },
    materials: [materialSchema],
    assignmentPrompt: { type: String, trim: true }
});

// ─── Topic (contains lessons + optional quiz) ───────────────────────────────

const topicSchema = new Schema({
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    quiz: quizSchema,
    lessons: [lessonSchema]
});

// ─── Block (contains topics + optional quiz) ────────────────────────────────

const blockSchema = new Schema({
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    thumbnail: { type: String, default: null },
    quiz: quizSchema,
    topics: [topicSchema]
});

// ─── Course ─────────────────────────────────────────────────────────────────

const courseSchema = new Schema({
    provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    thumbnail: { type: String },   // URL or file path
    category: { type: String, trim: true },
    subcategory: { type: String, trim: true },
    price: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, default: 'uzs' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    homeworkEnabled: { type: Boolean, default: false },
    blocks: [blockSchema],
    finalQuiz: quizSchema,
    // Ratings — submitted by enrolled clients
    ratings: [{
        client: { type: Schema.Types.ObjectId, ref: 'User' },
        value: { type: Number, min: 1, max: 5 },
        ratedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

courseSchema.index({ provider: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ category: 1 });

const Course = mongoose.model('Course', courseSchema);

// ─── Enrollment ─────────────────────────────────────────────────────────────

const enrollmentSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    payment: {
        amount: { type: Number, required: true },
        currency: { type: String, default: 'uzs' },
        // 'free' is used when course price is 0
        status: { type: String, enum: ['pending', 'succeeded', 'failed', 'free'], default: 'pending' },
        stripeSessionId: { type: String },
        checkoutUrl: { type: String },
        paidAt: { type: Date }
    },
    progress: {
        completedLessons: [{
            lessonId: { type: Schema.Types.ObjectId, required: true },
            completedAt: { type: Date, default: Date.now }
        }],
        // quizId = _id of the block or topic that owns the quiz
        completedQuizzes: [{
            quizId: { type: Schema.Types.ObjectId, required: true },
            quizType: { type: String, enum: ['block', 'topic', 'final'] },
            score: { type: Number },
            completedAt: { type: Date, default: Date.now }
        }],
        percentComplete: { type: Number, default: 0 }
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
}, { timestamps: true });

enrollmentSchema.index({ course: 1, client: 1 });
enrollmentSchema.index({ client: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// ─── HomeworkSubmission ──────────────────────────────────────────────────────

const homeworkSubmissionSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    enrollment: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: Schema.Types.ObjectId, required: true },
    lessonTitle: { type: String },
    courseTitle: { type: String },
    submissionText: { type: String },
    attachments: [{
        name: { type: String },
        fileUrl: { type: String },
        fileType: { type: String }
    }],
    status: { type: String, enum: ['pending', 'graded', 'revision_requested'], default: 'pending' },
    grade: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date }
}, { timestamps: true });

homeworkSubmissionSchema.index({ provider: 1, status: 1 });
homeworkSubmissionSchema.index({ client: 1 });
homeworkSubmissionSchema.index({ course: 1 });

const HomeworkSubmission = mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);

// ─── QuizAttempt ─────────────────────────────────────────────────────────────

const quizAttemptSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    enrollment: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // quizId = _id of the block (block quiz) or topic (topic quiz)
    quizId: { type: Schema.Types.ObjectId, required: true },
    quizType: { type: String, enum: ['block', 'topic', 'final'], required: true },
    answers: [{
        questionIndex: { type: Number },
        selectedOption: { type: Number },
        isCorrect: { type: Boolean }
    }],
    score: { type: Number },   // 0–100 percentage
    passed: { type: Boolean },
    attemptedAt: { type: Date, default: Date.now }
}, { timestamps: true });

quizAttemptSchema.index({ enrollment: 1, quizId: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = { Course, Enrollment, HomeworkSubmission, QuizAttempt };