<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">FERPA Compliance</h1>
                <p class="text-lg text-gray-600">Family Educational Rights and Privacy Act</p>
                <div class="w-24 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 mx-auto mt-6"></div>
            </div>

            <!-- FERPA Badge -->
            <div class="text-center mb-12">
                <div class="inline-flex items-center bg-green-100 rounded-full px-6 py-3">
                    <svg class="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span class="text-green-800 font-semibold">FERPA Compliant Platform</span>
                </div>
            </div>

            <!-- Content -->
            <div class="bg-white rounded-xl shadow-lg p-8 md:p-12">
                <div class="prose prose-lg max-w-none">
                    <p class="text-gray-700 leading-relaxed mb-8">
                        {{ companyName }} is committed to full compliance with the Family Educational Rights and Privacy
                        Act (FERPA).
                        We understand the critical importance of protecting educational records and have implemented
                        comprehensive
                        measures to ensure student privacy and data security.
                    </p>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">What is FERPA?</h2>
                        <p class="text-gray-700 mb-6">
                            The Family Educational Rights and Privacy Act (FERPA) is a federal law that protects the
                            privacy of student
                            education records. FERPA gives parents certain rights with respect to their children's
                            education records,
                            and these rights transfer to the student when they reach the age of 18 or attend a school
                            beyond the high school level.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Our FERPA Commitment</h2>

                        <div class="grid md:grid-cols-2 gap-6 mb-6">
                            <div class="bg-blue-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-blue-900 mb-3">Data Protection</h3>
                                <ul class="text-blue-800 space-y-2">
                                    <li>• End-to-end encryption</li>
                                    <li>• Secure data storage</li>
                                    <li>• Access controls</li>
                                    <li>• Regular security audits</li>
                                </ul>
                            </div>
                            <div class="bg-green-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-green-900 mb-3">Privacy Rights</h3>
                                <ul class="text-green-800 space-y-2">
                                    <li>• Student consent required</li>
                                    <li>• Limited data sharing</li>
                                    <li>• Right to access records</li>
                                    <li>• Right to request corrections</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Educational Records We Handle</h2>
                        <p class="text-gray-700 mb-4">In the course of providing consultation services, we may handle:
                        </p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Academic performance records</li>
                            <li>Behavioral assessment data</li>
                            <li>Individualized Education Programs (IEPs)</li>
                            <li>504 Plan documentation</li>
                            <li>Consultation notes and recommendations</li>
                            <li>Progress monitoring data</li>
                            <li>Communication logs with educational staff</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Access and Disclosure Policies</h2>

                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Who Can Access Educational Records</h3>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                            <p class="text-gray-700 mb-4">Educational records are accessible only to:</p>
                            <ul class="list-disc ml-6 text-gray-700">
                                <li>The student (if 18+ years old) or their parents/guardians</li>
                                <li>Authorized school officials with legitimate educational interest</li>
                                <li>Designated consultation professionals working on the case</li>
                                <li>Parties authorized by valid court order or subpoena</li>
                                <li>Officials for audit or evaluation purposes</li>
                            </ul>
                        </div>

                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Disclosure Requirements</h3>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Written consent required for most disclosures</li>
                            <li>Directory information may be shared unless opted out</li>
                            <li>Emergency situations may allow disclosure without consent</li>
                            <li>All disclosures are logged and tracked</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Student and Parent Rights</h2>

                        <div class="space-y-6">
                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Right to Inspect and Review</h3>
                                <p class="text-gray-700">
                                    Students and parents have the right to inspect and review educational records
                                    maintained by our platform.
                                    Requests can be made through our support channels, and we will respond within 45
                                    days.
                                </p>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Right to Request Amendment</h3>
                                <p class="text-gray-700">
                                    If you believe information in the educational record is inaccurate or misleading,
                                    you have the right to
                                    request an amendment. We will review the request and make corrections as
                                    appropriate.
                                </p>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Right to Control Disclosure</h3>
                                <p class="text-gray-700">
                                    You have the right to control most disclosures of personally identifiable
                                    information from educational
                                    records and can request that directory information not be disclosed.
                                </p>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Right to File Complaints</h3>
                                <p class="text-gray-700">
                                    You have the right to file complaints concerning alleged failures to comply with
                                    FERPA with the
                                    Family Policy Compliance Office, U.S. Department of Education.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Technical Safeguards</h2>

                        <div class="grid md:grid-cols-3 gap-6">
                            <div class="bg-purple-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-purple-900 mb-3">Encryption</h3>
                                <p class="text-purple-800 text-sm">
                                    All data is encrypted both in transit and at rest using industry-standard AES-256
                                    encryption.
                                </p>
                            </div>

                            <div class="bg-indigo-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-indigo-900 mb-3">Access Controls</h3>
                                <p class="text-indigo-800 text-sm">
                                    Role-based access controls ensure only authorized personnel can access educational
                                    records.
                                </p>
                            </div>

                            <div class="bg-teal-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-teal-900 mb-3">Audit Trails</h3>
                                <p class="text-teal-800 text-sm">
                                    Comprehensive logging tracks all access to and modifications of educational records.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Data Retention and Destruction</h2>
                        <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h3 class="text-lg font-semibold text-red-900 mb-3">Retention Policy</h3>
                            <ul class="text-red-800 space-y-2">
                                <li>• Educational records are retained only as long as necessary for consultation
                                    purposes</li>
                                <li>• Records are securely destroyed when no longer needed</li>
                                <li>• Destruction follows NIST guidelines for secure data disposal</li>
                                <li>• Certificates of destruction are maintained for audit purposes</li>
                            </ul>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Training and Compliance</h2>
                        <p class="text-gray-700 mb-6">
                            All {{ companyName }} staff members receive comprehensive FERPA training, including annual
                            refresher courses.
                            Our compliance program includes regular internal audits, third-party security assessments,
                            and continuous
                            monitoring of FERPA regulations for updates and changes.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Incident Response</h2>
                        <p class="text-gray-700 mb-4">
                            In the unlikely event of a data security incident affecting educational records:
                        </p>
                        <ol class="list-decimal ml-6 text-gray-700 mb-6">
                            <li>Immediate containment and assessment procedures are activated</li>
                            <li>Affected parties are notified within 24 hours</li>
                            <li>Regulatory authorities are contacted as required</li>
                            <li>Corrective measures are implemented to prevent recurrence</li>
                            <li>Post-incident review and reporting is conducted</li>
                        </ol>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Contact Our FERPA Compliance Officer</h2>
                        <div class="bg-gray-50 rounded-lg p-6">
                            <p class="text-gray-700 mb-4">
                                For questions about FERPA compliance, educational record access, or to file a complaint:
                            </p>
                            <div class="space-y-2">
                                <p class="text-gray-700"><strong>FERPA Compliance Officer:</strong> Dr. Sarah Johnson
                                </p>
                                <p class="text-gray-700"><strong>Email:</strong> ferpa@ytech.space</p>
                                <p class="text-gray-700"><strong>Phone:</strong> {{ supportPhone }} (ext. 105)</p>
                                <p class="text-gray-700"><strong>Address:</strong> Y.TECH FERPA Compliance Office</p>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Additional Resources</h2>
                        <div class="bg-blue-50 rounded-lg p-6">
                            <h4 class="font-semibold text-blue-900 mb-3">Learn More About FERPA:</h4>
                            <ul class="text-blue-800 space-y-1">
                                <li>• U.S. Department of Education FERPA Website</li>
                                <li>• Family Policy Compliance Office</li>
                                <li>• FERPA Quick Reference Guide</li>
                                <li>• Student Privacy Policy Office (SPPO)</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Environment variables
const companyName = import.meta.env.VITE_APP_COMPANY_NAME
const supportPhone = import.meta.env.VITE_SUPPORT_PHONE

// Meta tags
import { useMeta } from '@unhead/vue'
useMeta({
    title: `FERPA Compliance | ${companyName}`,
    meta: [
        { name: 'description', content: 'Our commitment to FERPA compliance and student privacy protection.' }
    ]
})
</script>