<!-- frontend/src/views/courses/provider/CourseBuilder.vue -->
<template>
    <div class="min-h-screen bg-slate-50">

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-32">
            <div class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else-if="course">
            <!-- Course header -->
            <div class="bg-white border-b border-gray-100">
                <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-5">
                    <div class="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                        <img v-if="course.thumbnail" :src="$uploadsUrl(course.thumbnail)"
                            class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <PhotoIcon class="w-8 h-8 text-gray-300" />
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h1 class="text-2xl font-bold text-gray-900 truncate">{{ course.title }}</h1>
                        <p class="text-sm text-gray-500 mt-0.5">
                            {{ [course.category, course.subcategory].filter(Boolean).join(' • ') ||
                                $t('courseBuilder.noCategory') }}
                        </p>
                    </div>
                    <button v-if="firstLessonId" @click="router.push(`/courses/${courseId}/lesson/${firstLessonId}`)"
                        class="shrink-0 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                        {{ $t('courseBuilder.preview') }}
                    </button>
                    <button @click="handleSave" :disabled="saving"
                        class="shrink-0 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
                        {{ saving ? $t('courseBuilder.saving') : (course.status === 'published' ?
                            $t('courseBuilder.saved') : $t('courseBuilder.save')) }}
                    </button>
                </div>

                <!-- Tabs -->
                <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
                    <button v-for="tab in tabsList" :key="tab.key" @click="activeTab = tab.key"
                        class="py-3 text-sm font-semibold border-b-2 transition-colors" :class="activeTab === tab.key
                            ? 'border-sky-500 text-sky-600'
                            : 'border-transparent text-gray-400 hover:text-gray-600'">
                        {{ tab.label }}
                    </button>
                </div>
            </div>

            <!-- Builder tab -->
            <div v-if="activeTab === 'builder'" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
                <div v-if="course.status === 'draft'"
                    class="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-amber-700">
                    <ExclamationTriangleIcon class="w-4 h-4 shrink-0 text-amber-500" />
                    {{ $t('courseBuilder.draftWarning') }}
                </div>

                <div v-for="(block, bi) in course.blocks" :key="block._id"
                    class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <!-- Block header -->
                    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            <button @click="toggleBlock(block._id)"
                                class="text-gray-400 hover:text-gray-600 transition-colors">
                                <ChevronDownIcon class="w-4 h-4 transition-transform"
                                    :class="{ '-rotate-90': !expanded[block._id] }" />
                            </button>
                            <span v-if="!editingBlockId || editingBlockId !== block._id"
                                class="font-semibold text-gray-900">
                                {{ $t('courseDetail.blockLabel', { number: bi + 1, title: block.title }) }}
                            </span>
                            <template v-else>
                                <input v-model="editingBlockTitle" @keyup.enter="saveBlockTitle(block)"
                                    class="input font-semibold text-gray-900 bg-transparent border-b border-sky-400 focus:outline-none flex-1"
                                    autofocus />
                                <button @click="saveBlockTitle(block)"
                                    class="ml-1 text-sky-500 hover:text-sky-700 transition-colors"
                                    :title="$t('common.save')">
                                    <CheckIcon class="w-5 h-5" />
                                </button>
                                <button @click="editingBlockId = null"
                                    class="text-gray-400 hover:text-gray-600 transition-colors"
                                    :title="$t('common.cancel')">
                                    <XMarkIcon class="w-4 h-4" />
                                </button>
                            </template>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                            <button @click="openQuizModal('block', block, null)"
                                class="text-xs font-semibold text-sky-500 hover:text-sky-700 px-2 py-1 rounded-lg hover:bg-sky-50 transition-colors">
                                {{ $t('courseBuilder.blockQuiz') }}
                            </button>
                            <button @click="promptAddTopic(block)"
                                class="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                                + {{ $t('courseBuilder.topic') }}
                            </button>
                            <button @click="editingBlockId = block._id; editingBlockTitle = block.title"
                                class="text-gray-300 hover:text-gray-500 transition-colors">
                                <PencilSquareIcon class="w-4 h-4" />
                            </button>
                            <button @click="handleDeleteBlock(block._id)"
                                class="text-red-400 hover:text-red-600 transition-colors">
                                <XMarkIcon class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <!-- Topics (collapsible) -->
                    <div v-if="expanded[block._id] !== false" class="divide-y divide-gray-50">
                        <div v-for="topic in block.topics" :key="topic._id" class="px-6 py-3">
                            <!-- Topic row -->
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-gray-800 text-sm">{{ topic.title }}</span>
                                <div class="flex items-center gap-2">
                                    <button @click="openQuizModal('topic', block, topic)"
                                        class="text-xs font-semibold text-sky-400 hover:text-sky-600 px-2 py-1 rounded-lg hover:bg-sky-50 transition-colors">
                                        {{ $t('courseBuilder.topicQuiz') }}
                                    </button>
                                    <button @click="promptAddLesson(block, topic)"
                                        class="text-xs font-semibold text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                                        + {{ $t('courseBuilder.lesson') }}
                                    </button>
                                    <button @click="handleDeleteTopic(block._id, topic._id)"
                                        class="text-red-300 hover:text-red-500 transition-colors">
                                        <XMarkIcon class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <!-- Lessons -->
                            <div class="space-y-1 pl-2">
                                <div v-for="lesson in topic.lessons" :key="lesson._id"
                                    class="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                                    @click="openLessonModal(block, topic, lesson)">
                                    <PlayIcon class="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                    <span class="text-sm text-gray-700 flex-1">{{ lesson.title }}</span>
                                    <button @click.stop="handleDeleteLesson(block._id, topic._id, lesson._id)"
                                        class="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-all">
                                        <XMarkIcon class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div v-if="!topic.lessons.length" class="text-xs text-gray-400 py-1 pl-3 italic">
                                    {{ $t('courseBuilder.noLessons') }}
                                </div>
                            </div>
                        </div>

                        <div v-if="!block.topics.length" class="px-6 py-4 text-sm text-gray-400 italic">
                            {{ $t('courseBuilder.noTopics') }}
                        </div>
                    </div>
                </div>

                <!-- Add Block -->
                <button @click="promptAddBlock"
                    class="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors font-medium">
                    + {{ $t('courseBuilder.addBlock') }}
                </button>

                <!-- ── Final Quiz section ────────────────────────────────── -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-4">
                    <div class="flex items-center justify-between px-5 py-4">
                        <div class="flex items-center gap-3">
                            <AcademicCapIcon class="w-5 h-5 text-violet-500" />
                            <div>
                                <p class="font-semibold text-gray-900">{{ $t('courseDetail.finalExam') }}</p>
                                <p class="text-xs text-gray-400">
                                    {{ course?.finalQuiz?.questions?.length
                                        ? $t('courseBuilder.questionsCount', { count: course.finalQuiz.questions.length })
                                        : $t('courseBuilder.noQuestions') }}
                                </p>
                            </div>
                        </div>
                        <button @click="openFinalQuizModal"
                            class="text-sm font-semibold text-violet-500 hover:text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors">
                            {{ course?.finalQuiz?.questions?.length ? $t('courseBuilder.editQuiz') :
                                $t('courseBuilder.addQuiz') }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Settings tab -->
            <div v-else-if="activeTab === 'settings'" class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('courseBuilder.courseTitle')
                            }}</label>
                        <input v-model="settingsForm.title" type="text"
                            class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('courseBuilder.description')
                            }}</label>
                        <textarea v-model="settingsForm.description" rows="4" class="input resize-none"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{
                                $t('courseBuilder.category') }}</label>
                            <input v-model="settingsForm.category" type="text"
                                class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{
                                $t('courseBuilder.subcategory')
                                }}</label>
                            <input v-model="settingsForm.subcategory" type="text"
                                class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                        </div>
                    </div>
                    <!-- Homework toggle -->
                    <div class="flex items-center justify-between py-3 px-1 border border-gray-100 rounded-xl">
                        <div>
                            <p class="text-sm font-medium text-gray-700">{{ $t('courseBuilder.enableHomework') }}</p>
                            <p class="text-xs text-gray-400 mt-0.5">{{ $t('courseBuilder.enableHomeworkDesc') }}</p>
                        </div>
                        <button @click="settingsForm.homeworkEnabled = !settingsForm.homeworkEnabled"
                            class="relative w-11 h-6 rounded-full transition-colors"
                            :class="settingsForm.homeworkEnabled ? 'bg-sky-500' : 'bg-gray-200'">
                            <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                                :class="settingsForm.homeworkEnabled ? 'translate-x-5' : ''"></span>
                        </button>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('courseBuilder.priceLabel')
                            }}</label>
                        <input v-model.number="settingsForm.price" type="number" min="0"
                            class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{
                            $t('courseBuilder.thumbnailUrl') }}</label>
                        <input v-model="settingsForm.thumbnail" type="text" placeholder="https://..."
                            class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{
                            $t('courseBuilder.uploadThumbnail')
                            }}</label>
                        <input ref="courseThumbInput" type="file" accept="image/*" class="hidden"
                            @change="handleCourseThumbUpload" />
                        <div v-if="course.thumbnail" class="w-full h-32 rounded-xl overflow-hidden mb-2 bg-gray-100">
                            <img :src="$uploadsUrl(course.thumbnail)" class="w-full h-full object-cover" />
                        </div>
                        <button @click="$refs.courseThumbInput.click()" :disabled="courseThumbUploading"
                            class="w-full border border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-gray-400 hover:border-sky-300 hover:text-sky-500 transition-colors disabled:opacity-50">
                            {{ courseThumbUploading ? $t('courseBuilder.uploading') : $t('courseBuilder.chooseImage') }}
                        </button>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button @click="saveSettings" :disabled="saving"
                            class="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                            {{ saving ? $t('courseBuilder.saving') : $t('courseBuilder.saveSettings') }}
                        </button>
                        <button v-if="course.status !== 'published'" @click="handlePublish" :disabled="saving"
                            class="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                            {{ $t('courseBuilder.publishCourse') }}
                        </button>
                        <button v-else @click="handleArchive" :disabled="saving"
                            class="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                            {{ $t('courseBuilder.archive') }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Grading tab -->
            <div v-else-if="activeTab === 'grading'" class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Filter row -->
                <div class="flex items-center gap-3 mb-5">
                    <button v-for="f in ['all', 'pending', 'graded', 'revision_requested']" :key="f"
                        @click="gradingFilter = f"
                        class="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors capitalize" :class="gradingFilter === f
                            ? 'bg-sky-100 text-sky-600'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'">
                        {{ f === 'all' ? $t('gradingCenter.all') : f === 'pending' ? $t('gradingCenter.pending') : f ===
                            'graded' ?
                            $t('gradingCenter.graded') : $t('gradingCenter.revision') }}
                    </button>
                </div>

                <!-- Loading -->
                <div v-if="gradingLoading" class="flex justify-center py-12">
                    <div class="w-6 h-6 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                </div>

                <!-- Empty -->
                <div v-else-if="!gradingSubmissions.length" class="text-center py-12 text-gray-400 text-sm">
                    {{ $t('courseBuilder.noSubmissions') }}
                </div>

                <!-- Submission list -->
                <div v-else class="space-y-2">
                    <div v-for="sub in gradingSubmissions" :key="sub._id"
                        class="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <!-- Summary row -->
                        <button @click="toggleSubmission(sub)"
                            class="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                            <div class="w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0">
                                <img v-if="sub.client?.profilePicture" :src="$uploadsUrl(sub.client.profilePicture)"
                                    class="w-full h-full object-cover" />
                                <div v-else
                                    class="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                    {{ sub.client?.firstName?.[0] }}{{ sub.client?.lastName?.[0] }}
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900 truncate">
                                    {{ sub.client?.firstName }} {{ sub.client?.lastName }}
                                </p>
                                <p class="text-xs text-gray-400 truncate">{{ sub.lessonTitle }}</p>
                            </div>
                            <span class="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" :class="{
                                'bg-amber-100 text-amber-700': sub.status === 'pending',
                                'bg-emerald-100 text-emerald-700': sub.status === 'graded',
                                'bg-red-100 text-red-700': sub.status === 'revision_requested'
                            }">
                                {{ sub.status === 'pending' ? $t('gradingCenter.pending') : sub.status === 'graded' ?
                                    $t('gradingCenter.graded') : $t('gradingCenter.revision') }}
                            </span>
                            <span v-if="sub.grade !== undefined && sub.grade !== null"
                                class="text-sm font-bold text-gray-900">
                                {{ sub.grade }}%
                            </span>
                            <ChevronRightIcon class="w-4 h-4 text-gray-300 shrink-0 transition-transform"
                                :class="{ 'rotate-90': expandedSubmission === sub._id }" />
                        </button>

                        <!-- Expanded detail + grading form -->
                        <div v-if="expandedSubmission === sub._id"
                            class="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50">
                            <!-- Submission text -->
                            <div v-if="sub.submissionText">
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{{
                                    $t('gradingCenter.submission') }}</p>
                                <p
                                    class="text-sm text-gray-700 whitespace-pre-wrap bg-white rounded-lg border border-gray-100 p-3">
                                    {{ sub.submissionText }}</p>
                            </div>

                            <!-- Attachments -->
                            <div v-if="sub.attachments?.length">
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{{
                                    $t('gradingCenter.attachments') }}</p>
                                <div class="space-y-1">
                                    <a v-for="att in sub.attachments" :key="att.fileUrl"
                                        :href="$uploadsUrl(att.fileUrl)" target="_blank"
                                        class="flex items-center gap-2 text-sm text-sky-500 hover:underline">
                                        <DocumentIcon class="w-3.5 h-3.5" />
                                        {{ att.name }}
                                    </a>
                                </div>
                            </div>

                            <!-- Date -->
                            <p class="text-xs text-gray-400">
                                {{ $t('gradingCenter.submitted') }} {{ new
                                    Date(sub.submittedAt).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                }}
                            </p>

                            <!-- Grade form -->
                            <div class="border-t border-gray-200 pt-4 space-y-3">
                                <div class="flex items-center gap-4">
                                    <div>
                                        <label
                                            class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{{
                                            $t('gradingCenter.gradeLabel') }}</label>
                                        <input v-model.number="gradingInline.grade" type="number" min="0" max="100"
                                            class="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                    </div>
                                </div>
                                <div>
                                    <label
                                        class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{{
                                        $t('gradingCenter.feedback') }}</label>
                                    <textarea v-model="gradingInline.feedback" rows="3"
                                        :placeholder="$t('gradingCenter.feedbackPlaceholder')"
                                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"></textarea>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button @click="saveGrade(sub, 'graded')" :disabled="gradingInline.saving"
                                        class="bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm">
                                        {{ gradingInline.saving ? $t('courseBuilder.saving') :
                                        $t('gradingCenter.saveGrade') }}
                                    </button>
                                    <button @click="saveGrade(sub, 'revision_requested')"
                                        :disabled="gradingInline.saving"
                                        class="border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-2 px-5 rounded-lg transition-colors text-sm">
                                        {{ $t('gradingCenter.requestRevision') }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- ── Lesson Edit Modal ─────────────────────────────────────────── -->
        <Teleport to="body">
            <div v-if="lessonModal.open"
                class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex items-start justify-between mb-1">
                            <h2 class="text-xl font-bold text-gray-900">{{ $t('courseBuilder.editLessonContent') }}</h2>
                            <button @click="closeLessonModal"
                                class="text-gray-400 hover:text-gray-600 transition-colors">
                                <XMarkIcon class="w-5 h-5" />
                            </button>
                        </div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">
                            {{ lessonModal.lesson?.title }}
                        </p>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <!-- Left: video -->
                            <div>
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{
                                    $t('courseBuilder.lessonVideo') }}</p>

                                <!-- Video preview -->
                                <div class="w-full aspect-video rounded-xl bg-gray-100 overflow-hidden mb-2">
                                    <video v-if="lessonModal.form.videoFile"
                                        :src="$uploadsUrl(lessonModal.form.videoFile)" controls
                                        class="w-full h-full object-cover"></video>
                                    <img v-else-if="videoThumb" :src="videoThumb" class="w-full h-full object-cover" />
                                    <div v-else class="w-full h-full flex items-center justify-center">
                                        <FilmIcon class="w-10 h-10 text-gray-300" />
                                    </div>
                                </div>

                                <!-- Upload or URL -->
                                <div class="flex gap-2 mb-3">
                                    <button @click="videoMode = 'url'"
                                        class="flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors"
                                        :class="videoMode === 'url' ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-500'">URL</button>
                                    <button @click="videoMode = 'upload'"
                                        class="flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors"
                                        :class="videoMode === 'upload' ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-500'">{{
                                        $t('courseBuilder.upload') }}</button>
                                </div>

                                <div v-if="videoMode === 'url'">
                                    <input v-model="lessonModal.form.videoUrl" type="text" placeholder="https://..."
                                        class="input w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                </div>
                                <div v-else>
                                    <input ref="videoFileInput" type="file" accept="video/*" class="hidden"
                                        @change="handleVideoUpload" />
                                    <button @click="$refs.videoFileInput.click()"
                                        :disabled="videoUploadProgress > 0 && videoUploadProgress < 100"
                                        class="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:border-sky-300 hover:text-sky-500 transition-colors disabled:opacity-50">
                                        <span v-if="videoUploadProgress > 0 && videoUploadProgress < 100">{{
                                            $t('courseBuilder.uploadingPercent', { percent: videoUploadProgress })
                                            }}</span>
                                        <span v-else>{{ $t('courseBuilder.chooseVideo') }}</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Right: title + materials -->
                            <div class="space-y-4">
                                <div>
                                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{
                                        $t('courseBuilder.lessonTitle') }}</p>
                                    <input v-model="lessonModal.form.title" type="text"
                                        class="input w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                </div>

                                <div>
                                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{
                                        $t('courseBuilder.materials') }}</p>
                                    <div class="space-y-1 mb-2">
                                        <div v-for="mat in lessonModal.form.materials" :key="mat._id"
                                            class="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
                                            <DocumentIcon class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span class="flex-1 truncate">{{ mat.name }}</span>
                                            <button @click="deleteMaterial(mat._id)"
                                                class="text-red-300 hover:text-red-500 transition-colors">
                                                <XMarkIcon class="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <input ref="materialFileInput" type="file" multiple class="hidden"
                                        @change="handleMaterialUpload" />
                                    <button @click="$refs.materialFileInput.click()" :disabled="materialUploading"
                                        class="w-full border border-dashed border-gray-200 rounded-xl py-2 text-xs text-gray-400 hover:border-sky-300 hover:text-sky-500 transition-colors disabled:opacity-50">
                                        {{ materialUploading ? $t('courseBuilder.uploading') :
                                        $t('courseBuilder.addFiles') }}
                                    </button>
                                </div>

                                <div>
                                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{
                                        $t('courseBuilder.lessonCover') }}</p>
                                    <div class="w-full h-24 bg-gray-100 rounded-xl overflow-hidden mb-2">
                                        <img v-if="lessonModal.form.thumbnail"
                                            :src="$uploadsUrl(lessonModal.form.thumbnail)"
                                            class="w-full h-full object-cover" />
                                        <div v-else
                                            class="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                            {{ $t('courseBuilder.noImage') }}</div>
                                    </div>
                                    <input ref="lessonThumbInput" type="file" accept="image/*" class="hidden"
                                        @change="handleLessonThumbUpload" />
                                    <button @click="$refs.lessonThumbInput.click()" :disabled="lessonThumbUploading"
                                        class="w-full border border-dashed border-gray-200 rounded-xl py-2 text-xs text-gray-400 hover:border-sky-300 hover:text-sky-500 transition-colors disabled:opacity-50">
                                        {{ lessonThumbUploading ? $t('courseBuilder.uploading') :
                                        $t('courseBuilder.uploadCover') }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Text/description -->
                        <div class="mt-5">
                            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{
                                $t('courseBuilder.lessonText') }}</p>
                            <textarea v-model="lessonModal.form.text" rows="4"
                                :placeholder="$t('courseBuilder.lessonTextPlaceholder')"
                                class="input resize-none"></textarea>
                        </div>

                        <!-- Assignment prompt (only when homework enabled) -->
                        <div v-if="course?.homeworkEnabled" class="mt-4">
                            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{
                                $t('courseBuilder.assignmentPrompt') }}</p>
                            <textarea v-model="lessonModal.form.assignmentPrompt" rows="3"
                                :placeholder="$t('courseBuilder.assignmentPlaceholder')"
                                class="input resize-none"></textarea>
                        </div>

                        <button @click="saveLessonConfig" :disabled="lessonModal.saving"
                            class="mt-5 w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wide">
                            {{ lessonModal.saving ? $t('courseBuilder.saving') : $t('courseBuilder.saveLessonConfig') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── Quiz Edit Modal ──────────────────────────────────────────── -->
        <Teleport to="body">
            <div v-if="quizModal.open"
                class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-5">
                            <h2 class="text-xl font-bold text-gray-900">
                                {{ quizModal.type === 'block' ? $t('courseBuilder.blockQuiz') :
                                    $t('courseBuilder.topicQuiz') }}
                            </h2>
                            <button @click="quizModal.open = false" class="text-gray-400 hover:text-gray-600">
                                <XMarkIcon class="w-5 h-5" />
                            </button>
                        </div>

                        <div class="space-y-5">
                            <div v-for="(q, qi) in quizModal.questions" :key="qi" class="bg-gray-50 rounded-xl p-4">
                                <div class="flex items-start gap-3 mb-3">
                                    <span class="text-xs font-bold text-gray-400 mt-2.5 shrink-0">Q{{ qi + 1 }}</span>
                                    <input v-model="q.question" type="text"
                                        :placeholder="$t('courseBuilder.questionText')"
                                        class="input flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                    <button @click="quizModal.questions.splice(qi, 1)"
                                        class="text-red-300 hover:text-red-500 mt-2 shrink-0">
                                        <XMarkIcon class="w-4 h-4" />
                                    </button>
                                </div>

                                <div class="space-y-2 mb-3">
                                    <div v-for="(opt, oi) in q.options" :key="oi" class="flex items-center gap-2">
                                        <input type="radio" :name="`q${qi}-correct`" :value="oi"
                                            v-model="q.correctAnswer" class="w-4 h-4 shrink-0 accent-sky-500" />
                                        <input v-model="q.options[oi]" type="text"
                                            :placeholder="$t('courseBuilder.optionN', { n: oi + 1 })"
                                            class="input flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                        <button v-if="q.options.length > 2" @click="q.options.splice(oi, 1)"
                                            class="text-red-300 hover:text-red-500">
                                            <XMarkIcon class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <button v-if="q.options.length < 6" @click="q.options.push('')"
                                        class="text-xs text-sky-500 hover:text-sky-700 font-medium">+ {{
                                        $t('courseBuilder.addOption') }}</button>
                                    <p class="text-xs text-gray-400">{{ $t('courseBuilder.selectCorrect') }}</p>
                                </div>
                            </div>

                            <button @click="addQuizQuestion"
                                class="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-sky-300 hover:text-sky-500 transition-colors font-medium">
                                + {{ $t('courseBuilder.addQuestion') }}
                            </button>
                        </div>

                        <button @click="saveQuiz" :disabled="quizModal.saving"
                            class="mt-5 w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                            {{ quizModal.saving ? $t('courseBuilder.saving') : $t('courseBuilder.saveQuiz') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── Final Quiz Edit Modal ────────────────────────────────────── -->
        <Teleport to="body">
            <div v-if="finalQuizModal.open"
                class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-5">
                            <h2 class="text-xl font-bold text-gray-900">{{ $t('courseDetail.finalExam') }}</h2>
                            <button @click="finalQuizModal.open = false" class="text-gray-400 hover:text-gray-600">
                                <XMarkIcon class="w-5 h-5" />
                            </button>
                        </div>

                        <!-- Questions -->
                        <div v-for="(q, qi) in finalQuizModal.questions" :key="qi"
                            class="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div class="flex items-start justify-between mb-3">
                                <p class="text-sm font-bold text-gray-700">{{ $t('courseBuilder.questionN', {
                                    n: qi + 1
                                    }) }}
                                </p>
                                <button @click="removeFinalQuizQuestion(qi)"
                                    class="text-red-400 hover:text-red-600 text-xs font-medium">{{
                                    $t('courseBuilder.remove')
                                    }}</button>
                            </div>
                            <input v-model="q.question" :placeholder="$t('courseBuilder.questionText')"
                                class="input w-full mb-3 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <div v-for="(opt, oi) in q.options" :key="oi" class="flex items-center gap-2 mb-2">
                                <input type="radio" :name="`fq_correct_${qi}`" :value="oi" v-model="q.correctAnswer"
                                    class="w-4 h-4 accent-sky-500 shrink-0" />
                                <input v-model="q.options[oi]" :placeholder="$t('courseBuilder.optionN', { n: oi + 1 })"
                                    class="input flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                <button v-if="q.options.length > 2" @click="removeFinalQuizOption(qi, oi)"
                                    class="text-red-300 hover:text-red-500">
                                    <XMarkIcon class="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <button @click="addFinalQuizOption(qi)"
                                class="text-xs text-sky-500 hover:text-sky-700 font-medium mt-1">+ {{
                                    $t('courseBuilder.addOption') }}</button>
                        </div>

                        <button @click="addFinalQuizQuestion"
                            class="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors font-medium mb-4">
                            + {{ $t('courseBuilder.addQuestion') }}
                        </button>

                        <button @click="saveFinalQuiz" :disabled="savingFinalQuiz"
                            class="w-full bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                            {{ savingFinalQuiz ? $t('courseBuilder.saving') : $t('courseBuilder.saveFinalQuiz') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
    XMarkIcon, ChevronDownIcon, PencilSquareIcon, PlayIcon,
    PhotoIcon, FilmIcon, DocumentIcon, PlusIcon, ExclamationTriangleIcon,
    CheckIcon, AcademicCapIcon, ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { useCourseStore } from '@/stores/course'
import { useGlobals } from '@/plugins/globals'

const { t } = useI18n()
const { toast, uploadsUrl, modal } = useGlobals()

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const courseId = route.params.id
const loading = ref(true)
const saving = ref(false)
const course = ref(null)
const lessonThumbUploading = ref(false)
const courseThumbUploading = ref(false)

const tabsList = computed(() => [
    { key: 'builder', label: t('courseBuilder.tabBuilder') },
    { key: 'settings', label: t('courseBuilder.tabSettings') },
    { key: 'grading', label: t('courseBuilder.tabGrading') }
])
const activeTab = ref('builder')

// Expanded state for blocks (default all open)
const expanded = reactive({})

// Inline block title editing
const editingBlockId = ref(null)
const editingBlockTitle = ref('')

// Settings form
const settingsForm = reactive({ title: '', description: '', category: '', subcategory: '', price: 0, thumbnail: '', homeworkEnabled: false })

const firstLessonId = computed(() => {
    if (!course.value?.blocks?.length) return null
    for (const block of course.value.blocks) {
        for (const topic of block.topics) {
            if (topic.lessons?.length) return topic.lessons[0]._id
        }
    }
    return null
})

// ── Grading tab ──────────────────────────────────────────────────────────────
const gradingLoading = ref(false)
const gradingSubmissions = ref([])
const expandedSubmission = ref(null)
const gradingInline = reactive({ grade: null, feedback: '', saving: false })
const gradingFilter = ref('all')

async function loadGrading() {
    gradingLoading.value = true
    try {
        const params = { courseId }
        if (gradingFilter.value !== 'all') params.status = gradingFilter.value
        gradingSubmissions.value = await courseStore.fetchHomework(params)
    } catch (e) {
        console.error('loadGrading error:', e)
    } finally {
        gradingLoading.value = false
    }
}

function toggleSubmission(sub) {
    if (expandedSubmission.value === sub._id) {
        expandedSubmission.value = null
        return
    }
    expandedSubmission.value = sub._id
    gradingInline.grade = sub.grade ?? null
    gradingInline.feedback = sub.feedback ?? ''
}

async function saveGrade(sub, status = 'graded') {
    gradingInline.saving = true
    try {
        const updated = await courseStore.gradeSubmission(sub._id, {
            grade: gradingInline.grade,
            feedback: gradingInline.feedback,
            status
        })
        const idx = gradingSubmissions.value.findIndex(s => s._id === sub._id)
        if (idx !== -1) gradingSubmissions.value[idx] = { ...gradingSubmissions.value[idx], ...updated }
        toast.success(t('gradingCenter.gradeSaved'))
    } catch (e) {
        toast.error(e?.response?.data?.message || t('gradingCenter.gradeFailed'))
    } finally {
        gradingInline.saving = false
    }
}

// ── Final Quiz ───────────────────────────────────────────────────────────────
const finalQuizModal = reactive({
    open: false,
    questions: []
})
const savingFinalQuiz = ref(false)

function openFinalQuizModal() {
    finalQuizModal.questions = course.value?.finalQuiz?.questions?.length
        ? JSON.parse(JSON.stringify(course.value.finalQuiz.questions))
        : []
    finalQuizModal.open = true
}

function addFinalQuizQuestion() {
    finalQuizModal.questions.push({ question: '', options: ['', ''], correctAnswer: 0, explanation: '' })
}

function removeFinalQuizQuestion(idx) {
    finalQuizModal.questions.splice(idx, 1)
}

function addFinalQuizOption(qi) {
    finalQuizModal.questions[qi].options.push('')
}

function removeFinalQuizOption(qi, oi) {
    const q = finalQuizModal.questions[qi]
    q.options.splice(oi, 1)
    if (q.correctAnswer >= q.options.length) q.correctAnswer = 0
}

async function saveFinalQuiz() {
    savingFinalQuiz.value = true
    try {
        await courseStore.saveFinalQuiz(courseId, finalQuizModal.questions)
        const updated = await courseStore.getCourseById(courseId)
        course.value = updated
        finalQuizModal.open = false
        toast.success(t('courseBuilder.finalQuizSaved'))
    } catch (e) {
        toast.error(e?.response?.data?.message || t('courseBuilder.finalQuizFailed'))
    } finally {
        savingFinalQuiz.value = false
    }
}

// ── Lesson modal ────────────────────────────────────────────────────────────
const lessonModal = reactive({
    open: false,
    saving: false,
    blockId: null,
    topicId: null,
    lesson: null,
    form: {
        title: '', videoUrl: null, videoFile: null, text: '', assignmentPrompt: '', materials: []
    }
})

const videoMode = ref('url')
const videoUploadProgress = ref(0)
const materialUploading = ref(false)

const videoThumb = computed(() => {
    if (!lessonModal.form.videoUrl) return null
    const yt = lessonModal.form.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`
    return null
})

// ── Quiz modal ──────────────────────────────────────────────────────────────
const quizModal = reactive({
    open: false,
    saving: false,
    type: 'block',
    blockId: null,
    topicId: null,
    questions: []
})

// ── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(async () => {
    try {
        course.value = await courseStore.fetchCourseById(courseId)
        course.value.blocks.forEach(b => { expanded[b._id] = true })
        Object.assign(settingsForm, {
            title: course.value.title,
            description: course.value.description || '',
            category: course.value.category || '',
            subcategory: course.value.subcategory || '',
            price: course.value.price || 0,
            thumbnail: course.value.thumbnail || '',
            homeworkEnabled: course.value.homeworkEnabled || false
        })
        settingsForm.homeworkEnabled = course.value.homeworkEnabled || false
    } catch (e) {
        console.error('fetchCourseById error:', e)
    } finally {
        loading.value = false
    }
})

watch(activeTab, (tab) => {
    if (tab === 'grading' && !gradingSubmissions.value.length) loadGrading()
})

watch(gradingFilter, () => loadGrading())

// ── Helpers ─────────────────────────────────────────────────────────────────
function toggleBlock(id) {
    expanded[id] = expanded[id] === false ? true : false
}

function refresh(updated) {
    course.value = updated
    course.value.blocks.forEach(b => {
        if (expanded[b._id] === undefined) expanded[b._id] = true
    })
}

async function handleSave() {
    saving.value = true
    try {
        const updated = await courseStore.updateCourse(courseId, {
            title: course.value.title,
            description: course.value.description,
            homeworkEnabled: settingsForm.homeworkEnabled
        })
        refresh(updated)
        toast.success(t('courseBuilder.courseSaved'))
    } catch (e) {
        toast.error(e?.response?.data?.message || t('courseBuilder.saveFailed'))
    } finally {
        saving.value = false
    }
}

async function handleLessonThumbUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    lessonThumbUploading.value = true
    try {
        const result = await courseStore.uploadLessonThumbnail(
            courseId, lessonModal.blockId, lessonModal.topicId, lessonModal.lesson._id, file
        )
        lessonModal.form.thumbnail = result.thumbnail
        const updated = await courseStore.fetchCourseById(courseId)
        refresh(updated)
        toast.success(t('courseBuilder.coverUploaded'))
    } catch (e) {
        toast.error(e?.response?.data?.message || t('courseBuilder.coverUploadFailed'))
    } finally {
        lessonThumbUploading.value = false
        e.target.value = ''
    }
}

async function handleCourseThumbUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    courseThumbUploading.value = true
    try {
        const result = await courseStore.uploadCourseThumbnail(courseId, file)
        course.value.thumbnail = result.thumbnail
        toast.success(t('courseBuilder.thumbUploaded'))
    } catch (e) {
        toast.error(e?.response?.data?.message || t('courseBuilder.thumbUploadFailed'))
    } finally {
        courseThumbUploading.value = false
        e.target.value = ''
    }
}

async function promptAddBlock() {
    const title = await modal.prompt(t('courseBuilder.blockTitlePrompt'))
    if (!title?.trim()) return
    const updated = await courseStore.addBlock(courseId, title.trim())
    refresh(updated)
}

async function saveBlockTitle(block) {
    if (!editingBlockTitle.value.trim() || editingBlockTitle.value === block.title) {
        editingBlockId.value = null
        return
    }
    const updated = await courseStore.updateBlock(courseId, block._id, { title: editingBlockTitle.value.trim() })
    refresh(updated)
    editingBlockId.value = null
}

async function handleDeleteBlock(blockId) {
    if (!(await modal.confirm(t('courseBuilder.deleteBlockConfirm')))) return
    const updated = await courseStore.deleteBlock(courseId, blockId)
    refresh(updated)
}

async function promptAddTopic(block) {
    const title = await modal.prompt(t('courseBuilder.topicTitlePrompt'))
    if (!title?.trim()) return
    const updated = await courseStore.addTopic(courseId, block._id, title.trim())
    refresh(updated)
}

async function handleDeleteTopic(blockId, topicId) {
    if (!(await modal.confirm(t('courseBuilder.deleteTopicConfirm')))) return
    const updated = await courseStore.deleteTopic(courseId, blockId, topicId)
    refresh(updated)
}

async function promptAddLesson(block, topic) {
    const title = await modal.prompt(t('courseBuilder.lessonTitlePrompt'))
    if (!title?.trim()) return
    const updated = await courseStore.addLesson(courseId, block._id, topic._id, title.trim())
    refresh(updated)
}

function openLessonModal(block, topic, lesson) {
    lessonModal.blockId = block._id
    lessonModal.topicId = topic._id
    lessonModal.lesson = lesson
    lessonModal.form = {
        title: lesson.title,
        thumbnail: lesson.thumbnail || null,
        videoUrl: lesson.videoUrl || '',
        videoFile: lesson.videoFile || null,
        text: lesson.text || '',
        assignmentPrompt: lesson.assignmentPrompt || '',
        materials: lesson.materials ? [...lesson.materials] : []
    }
    videoMode.value = lesson.videoUrl ? 'url' : 'upload'
    videoUploadProgress.value = 0
    lessonModal.open = true
}

function closeLessonModal() { lessonModal.open = false }

async function saveLessonConfig() {
    lessonModal.saving = true
    try {
        const updated = await courseStore.updateLesson(
            courseId, lessonModal.blockId, lessonModal.topicId, lessonModal.lesson._id,
            {
                title: lessonModal.form.title,
                videoUrl: videoMode.value === 'url' ? lessonModal.form.videoUrl : undefined,
                text: lessonModal.form.text,
                assignmentPrompt: lessonModal.form.assignmentPrompt
            }
        )
        refresh(updated)
        toast.success(t('courseBuilder.lessonSaved'))
        lessonModal.open = false
    } catch (e) {
        toast.error(e?.response?.data?.message || t('courseBuilder.lessonSaveFailed'))
    } finally {
        lessonModal.saving = false
    }
}

async function handleVideoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    videoUploadProgress.value = 1
    try {
        const result = await courseStore.uploadLessonVideo(
            courseId, lessonModal.blockId, lessonModal.topicId, lessonModal.lesson._id,
            file, (pct) => { videoUploadProgress.value = pct }
        )
        lessonModal.form.videoFile = result.videoFile
        lessonModal.form.videoUrl = null
        videoUploadProgress.value = 100
        const updated = await courseStore.fetchCourseById(courseId)
        refresh(updated)
        toast.success(t('courseBuilder.videoUploaded'))
    } catch (e) {
        toast.error(e?.response?.data?.message || t('courseBuilder.videoUploadFailed'))
        videoUploadProgress.value = 0
    }
    e.target.value = ''
}

async function handleMaterialUpload(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    materialUploading.value = true
    try {
        const added = await courseStore.uploadLessonMaterial(
            courseId, lessonModal.blockId, lessonModal.topicId, lessonModal.lesson._id, files
        )
        lessonModal.form.materials.push(...added)
        const updated = await courseStore.fetchCourseById(courseId)
        refresh(updated)
        toast.success(t('courseBuilder.materialsSaved'))
    } catch (e) {
        toast.error(e?.response?.data?.message || t('courseBuilder.materialsUploadFailed'))
    } finally {
        materialUploading.value = false
        e.target.value = ''
    }
}

async function deleteMaterial(materialId) {
    if (!(await modal.confirm(t('courseBuilder.removeMaterialConfirm')))) return
    await courseStore.deleteLessonMaterial(
        courseId, lessonModal.blockId, lessonModal.topicId, lessonModal.lesson._id, materialId
    )
    lessonModal.form.materials = lessonModal.form.materials.filter(m => m._id !== materialId)
    const updated = await courseStore.fetchCourseById(courseId)
    refresh(updated)
}

async function handleDeleteLesson(blockId, topicId, lessonId) {
    if (!(await modal.confirm(t('courseBuilder.deleteLessonConfirm')))) return
    const updated = await courseStore.deleteLesson(courseId, blockId, topicId, lessonId)
    refresh(updated)
}

function openQuizModal(type, block, topic) {
    quizModal.type = type
    quizModal.blockId = block._id
    quizModal.topicId = topic?._id || null
    const existing = type === 'block' ? block.quiz?.questions : topic?.quiz?.questions
    quizModal.questions = (existing || []).map(q => ({
        question: q.question, options: [...q.options], correctAnswer: q.correctAnswer, explanation: q.explanation || ''
    }))
    quizModal.open = true
}

function addQuizQuestion() {
    quizModal.questions.push({ question: '', options: ['', ''], correctAnswer: 0, explanation: '' })
}

async function saveQuiz() {
    quizModal.saving = true
    try {
        if (quizModal.type === 'block') {
            await courseStore.saveBlockQuiz(courseId, quizModal.blockId, quizModal.questions)
        } else {
            await courseStore.saveTopicQuiz(courseId, quizModal.blockId, quizModal.topicId, quizModal.questions)
        }
        const updated = await courseStore.fetchCourseById(courseId)
        refresh(updated)
        toast.success(t('courseBuilder.quizSaved'))
        quizModal.open = false
    } catch (e) {
        toast.error(e?.response?.data?.message || t('courseBuilder.quizSaveFailed'))
    } finally {
        quizModal.saving = false
    }
}

async function saveSettings() {
    saving.value = true
    try {
        const updated = await courseStore.updateCourse(courseId, { ...settingsForm })
        refresh(updated)
        toast.success(t('courseBuilder.settingsSaved'))
    } catch (e) {
        toast.error(e?.response?.data?.message || t('courseBuilder.settingsSaveFailed'))
    } finally {
        saving.value = false
    }
}

async function handlePublish() {
    if (!(await modal.confirm(t('courseBuilder.publishConfirm')))) return
    saving.value = true
    try {
        const updated = await courseStore.publishCourse(courseId)
        refresh(updated)
        toast.success(t('courseBuilder.publishSuccess'))
    } catch (e) {
        toast.error(e?.response?.data?.message || t('courseBuilder.publishFailed'))
    } finally {
        saving.value = false
    }
}

async function handleArchive() {
    if (!(await modal.confirm(t('courseBuilder.archiveConfirm')))) return
    saving.value = true
    try {
        const updated = await courseStore.archiveCourse(courseId)
        refresh(updated)
        toast.info(t('courseBuilder.archiveSuccess'))
    } catch (e) {
        toast.error(e?.response?.data?.message || t('courseBuilder.archiveFailed'))
    } finally {
        saving.value = false
    }
}
</script>