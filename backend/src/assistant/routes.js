const express = require('express');
const router = express.Router();
const assistantController = require('./controller');
const { authenticateUser } = require('../auth/index');

/**
 * @route POST /api/assistant/chat
 * @desc Chat with the assistant
 * @access Private (uses authenticated user ID when available)
 */
router.post('/chat', authenticateUser, assistantController.chatWithAssistant);

/**
 * @route DELETE /api/assistant/conversation
 * @desc Clear conversation history with the assistant
 * @access Private (must be authenticated - uses user ID from token)
 */
router.delete('/history', authenticateUser, assistantController.clearConversationHistory);

/**
 * @route GET /api/assistant/history
 * @desc Get chat history with the assistant
 * @access Private (must be authenticated)
 */
router.get('/history', authenticateUser, assistantController.getChatHistory);

/**
 * @route GET /api/assistant/performance/:topic
 * @desc Get academic performance information about a specific topic
 * @access Public (tracks user ID if authenticated)
 */
router.get('/performance/:topic', assistantController.getPerformanceInfo);

/**
 * @route POST /api/assistant/problems
 * @desc Check problems (basic guidance only)
 * @access Private (uses authenticated user ID when available)
 */
router.post('/problems', assistantController.checkProblems);

/**
 * @route POST /api/assistant/feedback
 * @desc Submit feedback for an assistant message
 * @access Private (must be authenticated)
 */
router.post('/feedback', authenticateUser, assistantController.submitFeedback);

module.exports = router;