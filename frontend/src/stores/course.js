// frontend/src/stores/course.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios, { uploadApi } from '@/plugins/axios'

export const useCourseStore = defineStore('course', () => {
    const loading = ref(false)
    const error = ref(null)

    // ─── Provider ─────────────────────────────────────────────────────────────

    async function fetchDashboard() {
        const res = await axios.get('/courses/dashboard')
        return res.data.data
    }

    async function fetchMyCourses() {
        const res = await axios.get('/courses/my')
        return res.data.data
    }

    async function createCourse(payload) {
        const res = await axios.post('/courses', payload)
        return res.data.data
    }

    async function updateCourse(id, payload) {
        const res = await axios.put(`/courses/${id}`, payload)
        return res.data.data
    }

    async function deleteCourse(id) {
        await axios.delete(`/courses/${id}`)
    }

    async function publishCourse(id) {
        const res = await axios.post(`/courses/${id}/publish`)
        return res.data.data
    }

    async function archiveCourse(id) {
        const res = await axios.post(`/courses/${id}/archive`)
        return res.data.data
    }

    async function fetchCourseById(id) {
        const res = await axios.get(`/courses/${id}`)
        return res.data.data
    }

    // ─── Blocks ───────────────────────────────────────────────────────────────

    async function addBlock(courseId, title) {
        const res = await axios.post(`/courses/${courseId}/blocks`, { title })
        return res.data.data
    }

    async function updateBlock(courseId, blockId, payload) {
        const res = await axios.put(`/courses/${courseId}/blocks/${blockId}`, payload)
        return res.data.data
    }

    async function deleteBlock(courseId, blockId) {
        const res = await axios.delete(`/courses/${courseId}/blocks/${blockId}`)
        return res.data.data
    }

    async function saveBlockQuiz(courseId, blockId, questions) {
        const res = await axios.put(`/courses/${courseId}/blocks/${blockId}/quiz`, { questions })
        return res.data.data
    }

    // ─── Topics ───────────────────────────────────────────────────────────────

    async function addTopic(courseId, blockId, title) {
        const res = await axios.post(`/courses/${courseId}/blocks/${blockId}/topics`, { title })
        return res.data.data
    }

    async function updateTopic(courseId, blockId, topicId, payload) {
        const res = await axios.put(`/courses/${courseId}/blocks/${blockId}/topics/${topicId}`, payload)
        return res.data.data
    }

    async function deleteTopic(courseId, blockId, topicId) {
        const res = await axios.delete(`/courses/${courseId}/blocks/${blockId}/topics/${topicId}`)
        return res.data.data
    }

    async function saveTopicQuiz(courseId, blockId, topicId, questions) {
        const res = await axios.put(`/courses/${courseId}/blocks/${blockId}/topics/${topicId}/quiz`, { questions })
        return res.data.data
    }

    async function saveFinalQuiz(courseId, questions) {
        const res = await axios.put(`/courses/${courseId}/final-quiz`, { questions })
        return res.data.data
    }

    // ─── Lessons ──────────────────────────────────────────────────────────────

    async function addLesson(courseId, blockId, topicId, title) {
        const res = await axios.post(`/courses/${courseId}/blocks/${blockId}/topics/${topicId}/lessons`, { title })
        return res.data.data
    }

    async function updateLesson(courseId, blockId, topicId, lessonId, payload) {
        const res = await axios.put(
            `/courses/${courseId}/blocks/${blockId}/topics/${topicId}/lessons/${lessonId}`,
            payload
        )
        return res.data.data
    }

    async function deleteLesson(courseId, blockId, topicId, lessonId) {
        const res = await axios.delete(
            `/courses/${courseId}/blocks/${blockId}/topics/${topicId}/lessons/${lessonId}`
        )
        return res.data.data
    }

    async function uploadLessonVideo(courseId, blockId, topicId, lessonId, file, onProgress) {
        const formData = new FormData()
        formData.append('video', file)

        const res = await uploadApi.post(
            `/courses/${courseId}/blocks/${blockId}/topics/${topicId}/lessons/${lessonId}/upload-video`,
            formData,
            {
                onUploadProgress: (e) => {
                    if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
                }
            }
        )
        return res.data.data
    }

    async function uploadLessonMaterial(courseId, blockId, topicId, lessonId, files) {
        const formData = new FormData()
        files.forEach(f => formData.append('material', f))

        const res = await uploadApi.post(
            `/courses/${courseId}/blocks/${blockId}/topics/${topicId}/lessons/${lessonId}/upload-material`,
            formData
        )
        return res.data.data
    }

    async function deleteLessonMaterial(courseId, blockId, topicId, lessonId, materialId) {
        const res = await axios.delete(
            `/courses/${courseId}/blocks/${blockId}/topics/${topicId}/lessons/${lessonId}/materials/${materialId}`
        )
        return res.data
    }

    // ─── Homework ─────────────────────────────────────────────────────────────

    async function fetchHomework(params = {}) {
        const res = await axios.get('/courses/homework', { params })
        return res.data.data
    }

    async function gradeSubmission(submissionId, payload) {
        const res = await axios.put(`/courses/homework/${submissionId}/grade`, payload)
        return res.data.data
    }

    // ─── Client — public / browsing ────────────────────────────────────────

    async function browseCourses(params = {}) {
        const res = await axios.get('/courses', { params })
        return res.data  // { data, total, page, limit }
    }

    async function getCoursePublic(id) {
        const res = await axios.get(`/courses/${id}/public`)
        return res.data.data
    }

    // ─── Client — my learning ──────────────────────────────────────────────

    async function fetchMyLearning() {
        const res = await axios.get('/courses/my-learning')
        return res.data.data
    }

    async function getCourseContent(id) {
        const res = await axios.get(`/courses/${id}/learn`)
        return res.data  // { data: course, progress? }
    }

    // ─── Client — enrollment ───────────────────────────────────────────────

    async function initiateEnrollment(courseId) {
        const res = await axios.post(`/courses/${courseId}/enroll`)
        return res.data.data  // { checkoutUrl?, enrollmentId, free? }
    }

    async function confirmEnrollment(sessionId) {
        const res = await axios.get('/courses/enrollment/confirm', { params: { session_id: sessionId } })
        return res.data
    }

    // ─── Client — lesson progress ──────────────────────────────────────────

    async function completeLesson(courseId, lessonId) {
        const res = await axios.post(`/courses/${courseId}/lessons/${lessonId}/complete`)
        return res.data.data  // { progress }
    }

    // ─── Client — homework ─────────────────────────────────────────────────

    async function submitHomework(courseId, lessonId, submissionText, files = []) {
        const formData = new FormData()
        formData.append('submissionText', submissionText)
        files.forEach(f => formData.append('attachments', f))

        const res = await uploadApi.post(
            `/courses/${courseId}/lessons/${lessonId}/homework`,
            formData
        )
        return res.data.data
    }

    // ─── Client — quiz ─────────────────────────────────────────────────────

    async function submitQuizAttempt(courseId, blockId, answers, topicId = null) {
        const body = { answers }
        if (topicId) body.topicId = topicId
        const res = await axios.post(`/courses/${courseId}/blocks/${blockId}/quiz/attempt`, body)
        return res.data.data  // { score, passed, correctCount, totalQuestions, answers }
    }

    async function submitFinalQuizAttempt(courseId, answers) {
        const res = await axios.post(`/courses/${courseId}/final-quiz/attempt`, { answers })
        return res.data.data
    }

    // ─── Upload thumbnail helpers ──────────────────────────────────────────

    async function uploadCourseThumbnail(courseId, file) {
        const formData = new FormData()
        formData.append('thumbnail', file)
        const res = await uploadApi.post(`/courses/${courseId}/upload-thumbnail`, formData)
        return res.data.data // { thumbnail }
    }

    async function uploadBlockThumbnail(courseId, blockId, file) {
        const formData = new FormData()
        formData.append('thumbnail', file)
        const res = await uploadApi.post(`/courses/${courseId}/blocks/${blockId}/upload-thumbnail`, formData)
        return res.data.data
    }

    async function uploadLessonThumbnail(courseId, blockId, topicId, lessonId, file) {
        const formData = new FormData()
        formData.append('thumbnail', file)
        const res = await uploadApi.post(
            `/courses/${courseId}/blocks/${blockId}/topics/${topicId}/lessons/${lessonId}/upload-thumbnail`,
            formData
        )
        return res.data.data
    }

    return {
        loading, error,
        fetchDashboard, fetchMyCourses, createCourse, updateCourse,
        deleteCourse, publishCourse, archiveCourse, fetchCourseById,
        addBlock, updateBlock, deleteBlock, saveBlockQuiz,
        addTopic, updateTopic, deleteTopic, saveTopicQuiz,
        addLesson, updateLesson, deleteLesson,
        uploadLessonVideo, uploadLessonMaterial, deleteLessonMaterial,
        fetchHomework, gradeSubmission,
        browseCourses, getCoursePublic,
        fetchMyLearning, getCourseContent,
        initiateEnrollment, confirmEnrollment,
        completeLesson, submitHomework, submitQuizAttempt,
        uploadCourseThumbnail, uploadBlockThumbnail, uploadLessonThumbnail,
        saveFinalQuiz, submitFinalQuizAttempt
    }
})