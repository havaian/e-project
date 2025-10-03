const nodemailer = require('nodemailer');
const amqp = require('amqplib');
const { telegramBot } = require('../bot');
const sessionNotification = require('./sessionNotification');

/**
 * Notification Service
 * Handles sending various notifications through email, SMS, push notifications, and Telegram
 */
class NotificationService {
    constructor() {
        // Initialize email transporter
        this.emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 20000,
            keepAlive: true
        });

        this.rabbitChannel = null;
        this.rabbitConnection = null;
        
        // Try to initialize RabbitMQ but don't block if it fails
        this.initializeRabbitMQ();

        console.log('✅ NotificationService initialized with direct SMTP + RabbitMQ fallback');
    }

    async initializeRabbitMQ() {
        try {
            console.log('🔄 Attempting to connect to RabbitMQ...');
            
            this.rabbitConnection = await amqp.connect(process.env.RABBITMQ_URI);
            
            this.rabbitConnection.on('error', (err) => {
                console.error('⚠️ RabbitMQ connection error:', err.message);
                this.rabbitChannel = null;
            });
            
            this.rabbitConnection.on('close', () => {
                console.warn('⚠️ RabbitMQ connection closed.');
                this.rabbitChannel = null;
                // Retry after 30 seconds
                setTimeout(() => this.initializeRabbitMQ(), 30000);
            });

            this.rabbitChannel = await this.rabbitConnection.createChannel();
            await this.rabbitChannel.assertQueue('email_notifications', { durable: true });
            
            console.log('✅ RabbitMQ connected and ready as fallback');
            
            // Start consuming queued emails
            this.consumeEmailNotifications();
            
        } catch (error) {
            console.warn(`⚠️ RabbitMQ not available: ${error.message}. Will use direct SMTP only.`);
            this.rabbitChannel = null;
            // Retry after 60 seconds
            setTimeout(() => this.initializeRabbitMQ(), 60000);
        }
    }

    async consumeEmailNotifications() {
        if (!this.rabbitChannel) return;

        try {
            await this.rabbitChannel.prefetch(1);
            
            this.rabbitChannel.consume('email_notifications', async (msg) => {
                if (!msg) return;
                
                try {
                    const emailData = JSON.parse(msg.content.toString());
                    console.log('📧 Processing queued email:', emailData.to);
                    
                    // Send directly via SMTP
                    await this.sendEmailDirect(emailData);
                    
                    this.rabbitChannel.ack(msg);
                } catch (error) {
                    console.error('❌ Error processing queued email:', error.message);
                    
                    // Retry logic
                    const headers = msg.properties.headers || {};
                    const retryCount = (headers.retryCount || 0) + 1;
                    
                    if (retryCount <= 3) {
                        // Requeue with retry count
                        setTimeout(() => {
                            if (this.rabbitChannel) {
                                this.rabbitChannel.sendToQueue(
                                    'email_notifications',
                                    msg.content,
                                    { 
                                        persistent: true,
                                        headers: { retryCount }
                                    }
                                );
                            }
                        }, retryCount * 5000); // Exponential backoff
                    }
                    
                    this.rabbitChannel.ack(msg); // Remove from queue
                }
            });
            
            console.log('📬 Email queue consumer ready');
        } catch (error) {
            console.error('❌ Error setting up email consumer:', error);
        }
    }

    /**
     * MAIN EMAIL METHOD - Try direct SMTP first, queue as fallback
     */
    async sendEmail(emailData) {
        try {
            // FIRST: Try direct SMTP
            return await this.sendEmailDirect(emailData);
        } catch (error) {
            console.warn('⚠️ Direct SMTP failed, trying RabbitMQ fallback:', error.message);
            
            // FALLBACK: Queue in RabbitMQ
            if (this.rabbitChannel) {
                try {
                    this.rabbitChannel.sendToQueue(
                        'email_notifications',
                        Buffer.from(JSON.stringify(emailData)),
                        { persistent: true }
                    );
                    console.log('📬 Email queued for retry:', emailData.to);
                    return { messageId: 'queued', fallback: true };
                } catch (queueError) {
                    console.error('❌ RabbitMQ fallback also failed:', queueError.message);
                    throw error; // Throw original SMTP error
                }
            } else {
                console.error('❌ No RabbitMQ available for fallback');
                throw error;
            }
        }
    }

    /**
     * INTERNAL: Direct SMTP sending
     */
    async sendEmailDirect(emailData) {
        const { to, subject, text, html } = emailData;

        if (!to || !subject) {
            throw new Error('Missing required email fields: to, subject');
        }

        console.log('📧 Sending email:', { to, subject });

        const mailOptions = {
            from: `"${process.env.VITE_PROJECT_URL_SHORT}" <${process.env.SMTP_FROM_EMAIL}>`,
            to,
            subject,
            text: text || '',
            html: html || ''
        };

        const info = await this.emailTransporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return info;
    }

    // LEGACY COMPATIBILITY
    queueEmail(emailData) {
        return this.sendEmail(emailData);
    }

    /**
     * Queue an SMS to be sent asynchronously
     * @param {Object} smsData SMS data (to, message)
     */
    queueSMS(smsData) {
        if (!this.rabbitChannel) {
            console.error('RabbitMQ channel not available for SMS notifications');
            return;
        }

        try {
            this.rabbitChannel.sendToQueue(
                'sms_notifications',
                Buffer.from(JSON.stringify(smsData)),
                { persistent: true }
            );
        } catch (error) {
            console.error('Error queuing SMS:', error);
        }
    }

    /**
     * Queue a push notification to be sent asynchronously
     * @param {Object} pushData Push notification data (userId, title, body, data)
     */
    queuePushNotification(pushData) {
        if (!this.rabbitChannel) {
            console.error('RabbitMQ channel not available for push notifications');
            return;
        }

        try {
            this.rabbitChannel.sendToQueue(
                'push_notifications',
                Buffer.from(JSON.stringify(pushData)),
                { persistent: true }
            );
        } catch (error) {
            console.error('Error queuing push notification:', error);
        }
    }

    /**
     * Queue a Telegram message to be sent asynchronously
     * @param {Object} telegramData Telegram message data (chatId, text, options)
     */
    queueTelegramMessage(telegramData) {
        if (!this.rabbitChannel) {
            console.error('RabbitMQ channel not available for Telegram notifications');
            // Fallback to direct send
            this.sendTelegramMessage(telegramData.chatId, telegramData.text, telegramData.options).catch(err => {
                console.error('Error in fallback Telegram send:', err);
            });
            return;
        }

        try {
            this.rabbitChannel.sendToQueue(
                'telegram_notifications',
                Buffer.from(JSON.stringify(telegramData)),
                { persistent: true }
            );
        } catch (error) {
            console.error('Error queuing Telegram message:', error);
            // Fallback to direct send
            this.sendTelegramMessage(telegramData.chatId, telegramData.text, telegramData.options).catch(err => {
                console.error('Error in fallback Telegram send:', err);
            });
        }
    }

    /**
     * Send a Telegram message directly
     * @param {String} chatId Telegram chat ID
     * @param {String} text Message text
     * @param {Object} options Additional options
     */
    async sendTelegramMessage(chatId, text, options = {}) {
        try {
            if (!telegramBot) {
                console.error('Telegram bot not initialized');
                return;
            }

            const result = await telegramBot.telegram.sendMessage(chatId, text, options);
            return result;
        } catch (error) {
            console.error('Error sending Telegram message:', error);
            throw error;
        }
    }

    /**
     * Send verification email
     * @param {String} email User email
     * @param {String} token Verification token
    */
    async sendVerificationEmail(email, token) {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

        const emailData = {
            to: email,
            subject: `Verify Your Email - ${process.env.VITE_PROJECT_URL_SHORT}`,
            text: `Please verify your email by clicking on the following link: ${verificationLink}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">${process.env.VITE_PROJECT_URL_SHORT} Email Verification</h2>
            <p>Thank you for registering with ${process.env.VITE_PROJECT_URL_SHORT}!</p>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verificationLink}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
            <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
            <p>${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with ${process.env.VITE_PROJECT_URL_SHORT}, please ignore this email.</p>
            </div>
        `
        };

        return this.sendEmail(emailData);
    }

    /**
     * Send password reset email
     * @param {String} email User email
     * @param {String} token Reset token
     */
    async sendPasswordResetEmail(email, token) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        const emailData = {
            to: email,
            subject: `Reset Your Password - ${process.env.VITE_PROJECT_URL_SHORT}`,
            text: `You requested a password reset. Please click the following link to reset your password: ${resetLink}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">${process.env.VITE_PROJECT_URL_SHORT} Password Reset</h2>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
            <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
            <p>${resetLink}</p>
            <p>This link will expire in 10 minutes.</p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
            </div>
        `
        };

        return this.sendEmail(emailData);
    }

    /**
     * Send appointment confirmation
     * @param {Object} appointment Appointment object
    */
    async sendAppointmentConfirmation(appointment) {
        try {
            await appointment.populate('client provider');

            const { client, provider, dateTime, type } = appointment;
            const formattedDateTime = new Date(dateTime).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Email to client
            const clientEmailData = {
                to: client.email,
                subject: `Appointment Confirmation - ${process.env.VITE_PROJECT_URL_SHORT}`,
                text: `Your appointment with ${provider.firstName} ${provider.lastName} has been confirmed for ${formattedDateTime}.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">Appointment Confirmation</h2>
            <p>Your appointment with ${provider.firstName} ${provider.lastName} has been confirmed.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date and Time:</strong> ${formattedDateTime}</p>
              <p><strong>Session Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
              <p><strong>Provider:</strong> ${provider.firstName} ${provider.lastName} (${provider.specializations})</p>
            </div>
            <p>You can view your appointment details and join the session by logging into your ${process.env.VITE_PROJECT_URL_SHORT} account.</p>
          </div>
        `
            };

            // Email to provider
            const providerEmailData = {
                to: provider.email,
                subject: `New Appointment - ${process.env.VITE_PROJECT_URL_SHORT}`,
                text: `You have a new appointment with ${client.firstName} ${client.lastName} scheduled for ${formattedDateTime}.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">New Appointment</h2>
            <p>You have a new appointment with ${client.firstName} ${client.lastName}.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date and Time:</strong> ${formattedDateTime}</p>
              <p><strong>Session Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
              <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
            </div>
            <p>You can view appointment details and join the session by logging into your ${process.env.VITE_PROJECT_URL_SHORT} account.</p>
          </div>
        `
            };

            // Queue emails
            this.sendEmail(clientEmailData);
            this.sendEmail(providerEmailData);

            // If users have Telegram accounts linked, send notifications there too
            if (client.telegramId) {
                const telegramData = {
                    chatId: client.telegramId,
                    text: `✅ Your appointment with ${provider.firstName} ${provider.lastName} has been confirmed for ${formattedDateTime}.`,
                    options: {
                        parse_mode: 'HTML'
                    }
                };
                this.queueTelegramMessage(telegramData);
            }

            if (provider.telegramId) {
                const telegramData = {
                    chatId: provider.telegramId,
                    text: `📋 New appointment with ${client.firstName} ${client.lastName} scheduled for ${formattedDateTime}.`,
                    options: {
                        parse_mode: 'HTML'
                    }
                };
                this.queueTelegramMessage(telegramData);
            }
        } catch (error) {
            console.error('Error sending appointment confirmation:', error);
        }
    }

    /**
     * Send appointment cancellation notification
     * @param {Object} appointment Appointment object
     */
    async sendAppointmentCancellation(appointment) {
        try {
            await appointment.populate('client provider');

            const { client, provider, dateTime, type } = appointment;
            const formattedDateTime = new Date(dateTime).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Email to client
            const clientEmailData = {
                to: client.email,
                subject: `Appointment Canceled - ${process.env.VITE_PROJECT_URL_SHORT}`,
                text: `Your appointment with ${provider.firstName} ${provider.lastName} scheduled for ${formattedDateTime} has been canceled.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">Appointment Canceled</h2>
            <p>Your appointment with ${provider.firstName} ${provider.lastName} has been canceled.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date and Time:</strong> ${formattedDateTime}</p>
              <p><strong>Session Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
              <p><strong>Provider:</strong> ${provider.firstName} ${provider.lastName} (${provider.specializations})</p>
            </div>
            <p>You can schedule a new appointment by logging into your ${process.env.VITE_PROJECT_URL_SHORT} account.</p>
          </div>
        `
            };

            // Email to provider
            const providerEmailData = {
                to: provider.email,
                subject: `Appointment Canceled - ${process.env.VITE_PROJECT_URL_SHORT}`,
                text: `Your appointment with ${client.firstName} ${client.lastName} scheduled for ${formattedDateTime} has been canceled.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">Appointment Canceled</h2>
            <p>Your appointment with ${client.firstName} ${client.lastName} has been canceled.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date and Time:</strong> ${formattedDateTime}</p>
              <p><strong>Session Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
              <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
            </div>
          </div>
        `
            };

            // Queue emails
            this.sendEmail(clientEmailData);
            this.sendEmail(providerEmailData);

            // If users have Telegram accounts linked, send notifications there too
            if (client.telegramId) {
                const telegramData = {
                    chatId: client.telegramId,
                    text: `❌ Your appointment with ${provider.firstName} ${provider.lastName} scheduled for ${formattedDateTime} has been canceled.`,
                    options: {
                        parse_mode: 'HTML'
                    }
                };
                this.queueTelegramMessage(telegramData);
            }

            if (provider.telegramId) {
                const telegramData = {
                    chatId: provider.telegramId,
                    text: `❌ Appointment with ${client.firstName} ${client.lastName} scheduled for ${formattedDateTime} has been canceled.`,
                    options: {
                        parse_mode: 'HTML'
                    }
                };
                this.queueTelegramMessage(telegramData);
            }
        } catch (error) {
            console.error('Error sending appointment cancellation:', error);
        }
    }

    /**
     * Send appointment completion notification
     * @param {Object} appointment Appointment object
     */
    async sendAppointmentCompletionNotification(appointment) {
        try {
            await appointment.populate('client provider');

            const { client, provider } = appointment;

            // Email to client for feedback
            const clientEmailData = {
                to: client.email,
                subject: `Appointment Completed - ${process.env.VITE_PROJECT_URL_SHORT}`,
                text: `Your appointment with ${provider.firstName} ${provider.lastName} has been completed. Please leave your feedback.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">Appointment Completed</h2>
            <p>Your appointment with ${provider.firstName} ${provider.lastName} has been completed.</p>
            <p>If any recommendations were provided, you can view them in your ${process.env.VITE_PROJECT_URL_SHORT} account.</p>
            <a href="${process.env.FRONTEND_URL}/appointments/feedback/${appointment._id}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Leave Feedback</a>
            <p>Your feedback helps us improve our services.</p>
          </div>
        `
            };

            // Queue emails
            this.sendEmail(clientEmailData);

            // If client has Telegram account linked, send notification there too
            if (client.telegramId) {
                const telegramData = {
                    chatId: client.telegramId,
                    text: `✅ Your appointment with ${provider.firstName} ${provider.lastName} has been completed. Any recommendations will be available in your account. Please consider leaving feedback.`,
                    options: {
                        parse_mode: 'HTML'
                    }
                };
                this.queueTelegramMessage(telegramData);
            }
        } catch (error) {
            console.error('Error sending appointment completion notification:', error);
        }
    }

    /**
     * Send recommendation notification
     * @param {Object} appointment Appointment object with recommendations
     */
    async sendRecommendationNotification(appointment) {
        try {
            await appointment.populate('client provider');

            const { client, provider, recommendations } = appointment;

            // Format recommendations for email
            let recommendationsHtml = '';
            recommendations.forEach((recommendation, index) => {
                recommendationsHtml += `
          <div style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px;">
            <p><strong>Medication:</strong> ${recommendation.title}</p>
            <p><strong>Dosage:</strong> ${recommendation.description}</p>
            <p><strong>Frequency:</strong> ${recommendation.frequency}</p>
            <p><strong>Duration:</strong> ${recommendation.duration}</p>
            <p><strong>Instructions:</strong> ${recommendation.instructions}</p>
          </div>
        `;
            });

            // Email to client
            const clientEmailData = {
                to: client.email,
                subject: `New Recommendations - ${process.env.VITE_PROJECT_URL_SHORT}`,
                text: `${provider.firstName} ${provider.lastName} has added recommendations to your recent appointment.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">New Recommendations</h2>
            <p>${provider.firstName} ${provider.lastName} has added the following recommendations to your recent appointment:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              ${recommendationsHtml}
            </div>
            <p>You can view these recommendations anytime by logging into your ${process.env.VITE_PROJECT_URL_SHORT} account.</p>
          </div>
        `
            };

            // Queue email
            this.sendEmail(clientEmailData);

            // If client has Telegram account linked, send notification there too
            if (client.telegramId) {
                const telegramData = {
                    chatId: client.telegramId,
                    text: `💊 ${provider.firstName} ${provider.lastName} has added recommendations to your recent appointment. Check your email or ${process.env.VITE_PROJECT_URL_SHORT} account for details.`,
                    options: {
                        parse_mode: 'HTML'
                    }
                };
                this.queueTelegramMessage(telegramData);
            }
        } catch (error) {
            console.error('Error sending recommendation notification:', error);
        }
    }

    /**
     * Send follow-up notification
     * @param {Object} followUpAppointment Follow-up appointment object
     */
    async sendFollowUpNotification(followUpAppointment) {
        try {
            await followUpAppointment.populate('client provider');

            const { client, provider, dateTime, type } = followUpAppointment;
            const formattedDateTime = new Date(dateTime).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Email to client
            const clientEmailData = {
                to: client.email,
                subject: 'Follow-up Appointment Scheduled - ${process.env.VITE_PROJECT_URL_SHORT}',
                text: `A follow-up appointment with ${provider.firstName} ${provider.lastName} has been scheduled for ${formattedDateTime}.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">Follow-up Appointment Scheduled</h2>
            <p>A follow-up appointment with ${provider.firstName} ${provider.lastName} has been scheduled.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date and Time:</strong> ${formattedDateTime}</p>
              <p><strong>Session Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
              <p><strong>Provider:</strong> ${provider.firstName} ${provider.lastName} (${provider.specializations})</p>
            </div>
            <p>You can view your appointment details and join the session by logging into your ${process.env.VITE_PROJECT_URL_SHORT} account.</p>
          </div>
        `
            };

            // Email to provider
            const providerEmailData = {
                to: provider.email,
                subject: `Follow-up Appointment Scheduled - ${process.env.VITE_PROJECT_URL_SHORT}`,
                text: `A follow-up appointment with ${client.firstName} ${client.lastName} has been scheduled for ${formattedDateTime}.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">Follow-up Appointment Scheduled</h2>
            <p>A follow-up appointment with ${client.firstName} ${client.lastName} has been scheduled.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date and Time:</strong> ${formattedDateTime}</p>
              <p><strong>Session Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
              <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
            </div>
            <p>You can view appointment details and join the session by logging into your ${process.env.VITE_PROJECT_URL_SHORT} account.</p>
          </div>
        `
            };

            // Queue emails
            this.sendEmail(clientEmailData);
            this.sendEmail(providerEmailData);

            // If users have Telegram accounts linked, send notifications there too
            if (client.telegramId) {
                const telegramData = {
                    chatId: client.telegramId,
                    text: `📅 A follow-up appointment with ${provider.firstName} ${provider.lastName} has been scheduled for ${formattedDateTime}.`,
                    options: {
                        parse_mode: 'HTML'
                    }
                };
                this.queueTelegramMessage(telegramData);
            }

            if (provider.telegramId) {
                const telegramData = {
                    chatId: provider.telegramId,
                    text: `📅 Follow-up appointment with ${client.firstName} ${client.lastName} scheduled for ${formattedDateTime}.`,
                    options: {
                        parse_mode: 'HTML'
                    }
                };
                this.queueTelegramMessage(telegramData);
            }
        } catch (error) {
            console.error('Error sending follow-up notification:', error);
        }
    }

    /**
     * Send appointment reminder (24 hours before)
     * @param {Object} appointment Appointment object
     */
    async sendAppointmentReminder(appointment) {
        try {
            await appointment.populate('client provider');

            const { client, provider, dateTime, type } = appointment;
            const formattedDateTime = new Date(dateTime).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Email to client
            const clientEmailData = {
                to: client.email,
                subject: `Appointment Reminder - ${process.env.VITE_PROJECT_URL_SHORT}`,
                text: `Reminder: Your appointment with ${provider.firstName} ${provider.lastName} is scheduled for tomorrow at ${formattedDateTime}.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">Appointment Reminder</h2>
            <p>This is a reminder that your appointment with ${provider.firstName} ${provider.lastName} is scheduled for tomorrow.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date and Time:</strong> ${formattedDateTime}</p>
              <p><strong>Session Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
              <p><strong>Provider:</strong> ${provider.firstName} ${provider.lastName} (${provider.specializations})</p>
            </div>
            <p>You can view your appointment details and join the session by logging into your ${process.env.VITE_PROJECT_URL_SHORT} account.</p>
          </div>
        `
            };

            // Email to provider
            const providerEmailData = {
                to: provider.email,
                subject: `Appointment Reminder - ${process.env.VITE_PROJECT_URL_SHORT}`,
                text: `Reminder: Your appointment with ${client.firstName} ${client.lastName} is scheduled for tomorrow at ${formattedDateTime}.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">Appointment Reminder</h2>
            <p>This is a reminder that your appointment with ${client.firstName} ${client.lastName} is scheduled for tomorrow.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date and Time:</strong> ${formattedDateTime}</p>
              <p><strong>Session Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
              <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
            </div>
            <p>You can view appointment details and join the session by logging into your ${process.env.VITE_PROJECT_URL_SHORT} account.</p>
          </div>
        `
            };

            // Queue emails
            this.sendEmail(clientEmailData);
            this.sendEmail(providerEmailData);

            // If users have Telegram accounts linked, send notifications there too
            if (client.telegramId) {
                const telegramData = {
                    chatId: client.telegramId,
                    text: `⏰ Reminder: Your appointment with ${provider.firstName} ${provider.lastName} is scheduled for tomorrow at ${formattedDateTime}.`,
                    options: {
                        parse_mode: 'HTML'
                    }
                };
                this.queueTelegramMessage(telegramData);
            }

            if (provider.telegramId) {
                const telegramData = {
                    chatId: provider.telegramId,
                    text: `⏰ Reminder: Your appointment with ${client.firstName} ${client.lastName} is scheduled for tomorrow at ${formattedDateTime}.`,
                    options: {
                        parse_mode: 'HTML'
                    }
                };
                this.queueTelegramMessage(telegramData);
            }
        } catch (error) {
            console.error('Error sending appointment reminder:', error);
        }
    }

    /**
     * Send session start notification (15 minutes before)
     * @param {Object} appointment Appointment object
     */
    async sendSessionStartNotification(appointment) {
        try {
            await appointment.populate('client provider');

            const { client, provider, dateTime, type, _id } = appointment;
            const formattedTime = new Date(dateTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const sessionLink = `${process.env.FRONTEND_URL}/session/${_id}`;

            // Email to client
            const clientEmailData = {
                to: client.email,
                subject: `Your Session Starts Soon - ${process.env.VITE_PROJECT_URL_SHORT}`,
                text: `Your session with ${provider.firstName} ${provider.lastName} starts in 15 minutes.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">Your Session Starts Soon</h2>
            <p>Your session with ${provider.firstName} ${provider.lastName} starts in 15 minutes at ${formattedTime}.</p>
            <a href="${sessionLink}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Join Session</a>
            <p>Please ensure your device has a working camera and microphone for a video session.</p>
          </div>
        `
            };

            // Email to provider
            const providerEmailData = {
                to: provider.email,
                subject: `Session Starts Soon - ${process.env.VITE_PROJECT_URL_SHORT}`,
                text: `Your session with ${client.firstName} ${client.lastName} starts in 15 minutes.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">Session Starts Soon</h2>
            <p>Your session with ${client.firstName} ${client.lastName} starts in 15 minutes at ${formattedTime}.</p>
            <a href="${sessionLink}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Join Session</a>
            <p>Please ensure your device has a working camera and microphone for a video session.</p>
          </div>
        `
            };

            // Queue emails
            this.sendEmail(clientEmailData);
            this.sendEmail(providerEmailData);

            // If users have Telegram accounts linked, send notifications there too
            if (client.telegramId) {
                const telegramData = {
                    chatId: client.telegramId,
                    text: `🔔 Your session with ${provider.firstName} ${provider.lastName} starts in 15 minutes. Click here to join: ${sessionLink}`,
                    options: {
                        parse_mode: 'HTML',
                        disable_web_page_preview: false
                    }
                };
                this.queueTelegramMessage(telegramData);
            }

            if (provider.telegramId) {
                const telegramData = {
                    chatId: provider.telegramId,
                    text: `🔔 Your session with ${client.firstName} ${client.lastName} starts in 15 minutes. Click here to join: ${sessionLink}`,
                    options: {
                        parse_mode: 'HTML',
                        disable_web_page_preview: false
                    }
                };
                this.queueTelegramMessage(telegramData);
            }
        } catch (error) {
            console.error('Error sending session start notification:', error);
        }
    }

    /**
     * Send payment success email
     * @param {String} paymentId Payment ID
     * @param {Object} appointment Appointment object
     */
    async sendPaymentSuccessEmail(paymentId, appointment) {
        try {
            const { client, provider } = appointment;
            const formattedDate = new Date(appointment.dateTime).toLocaleString();

            const emailData = {
                to: client.email,
                subject: `Payment Successful - ${process.env.VITE_PROJECT_URL_SHORT}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">Payment Successful</h2>
            <p>Your payment for the appointment has been processed successfully.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Provider:</strong> ${provider.firstName} ${provider.lastName}</p>
              <p><strong>Date & Time:</strong> ${formattedDate}</p>
              <p><strong>Type:</strong> ${appointment.type}</p>
              <p><strong>Payment ID:</strong> ${paymentId}</p>
            </div>
            <p>You can view your appointment details in your ${process.env.VITE_PROJECT_URL_SHORT} account.</p>
          </div>
        `
            };

            await this.sendEmail(emailData);
        } catch (error) {
            console.error('Error sending payment success email:', error);
        }
    }

    /**
     * Send provider appointment email
     * @param {Object} appointment Appointment object
     */
    async sendProviderAppointmentEmail(appointment) {
        try {
            const { client, provider, dateTime } = appointment;
            const formattedDate = new Date(dateTime).toLocaleString();

            const emailData = {
                to: provider.email,
                subject: `New Appointment Confirmed - ${process.env.VITE_PROJECT_URL_SHORT}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a90e2;">New Appointment Confirmed</h2>
            <p>A new appointment has been scheduled and payment has been received.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
              <p><strong>Date & Time:</strong> ${formattedDate}</p>
              <p><strong>Type:</strong> ${appointment.type}</p>
            </div>
            <p>Please log in to your ${process.env.VITE_PROJECT_URL_SHORT} account to view the appointment details.</p>
          </div>
        `
            };

            await this.sendEmail(emailData);
        } catch (error) {
            console.error('Error sending provider appointment email:', error);
        }
    }

    /**
     * Send payment failure email
     * @param {String} paymentId Payment ID
     * @param {Object} appointment Appointment object
     */
    async sendPaymentFailureEmail(paymentId, appointment) {
        try {
            const { client, provider } = appointment;
            const formattedDate = new Date(appointment.dateTime).toLocaleString();

            const emailData = {
                to: client.email,
                subject: `Payment Failed - ${process.env.VITE_PROJECT_URL_SHORT}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">Payment Failed</h2>
            <p>We were unable to process your payment for the following appointment:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Provider:</strong> ${provider.firstName} ${provider.lastName}</p>
              <p><strong>Date & Time:</strong> ${formattedDate}</p>
              <p><strong>Type:</strong> ${appointment.type}</p>
            </div>
            <p>Please try booking again or contact support if you need assistance.</p>
          </div>
        `
            };

            await this.sendEmail(emailData);
        } catch (error) {
            console.error('Error sending payment failure email:', error);
        }
    }



    
    /**
     * Send document upload notification
     * @param {Object} appointment - Appointment object
     * @param {Object} document - Document object
     * @param {Object} recipient - User to notify
     */
    async sendDocumentUploadNotification(appointment, document, recipient) {
        const documentNotification = require('./documentNotification');
        return documentNotification.sendDocumentUploadNotification(appointment, document, recipient);
    }

    /**
     * Send appointment booking confirmation
     * @param {Object} appointment - Appointment object with populated client and provider
     */
    async sendAppointmentBookedEmails(appointment) {
        return require('./emailService').sendAppointmentBookedEmails(appointment);
    }

    /**
     * Send appointment cancellation notification
     * @param {Object} appointment - Appointment object with populated client and provider
     * @param {String} cancelledBy - Who cancelled the appointment ('client', 'provider', 'system')
     */
    async sendAppointmentCancellationNotification(appointment, cancelledBy) {
        return require('./emailService').sendAppointmentCancelledEmails(appointment, cancelledBy);
    }

    /**
     * Send appointment confirmation notification
     * @param {Object} appointment - Appointment object with populated client and provider
     */
    async sendAppointmentConfirmedNotification(appointment) {
        return require('./emailService').sendAppointmentConfirmedEmails(appointment);
    }

    /**
     * Send payment success notification
     * @param {String} paymentId - Payment ID
     * @param {Object} appointment - Appointment object
     */
    async sendPaymentSuccessEmail(paymentId, appointment) {
        return require('./emailService').sendPaymentSuccessEmail(paymentId, appointment);
    }

    /**
     * Send payment confirmation
     * @param {String} paymentId - Payment ID
     */
    async sendPaymentConfirmation(paymentId) {
        return require('./emailService').sendPaymentConfirmation(paymentId);
    }

    /**
     * Send payment refund notification
     * @param {Object} payment - Payment object
     */
    async sendPaymentRefundNotification(payment) {
        return require('./emailService').sendPaymentRefundNotification(payment);
    }

    /**
     * Send appointment reminder emails
     * @param {Object} appointment - Appointment object with populated client and provider
     */
    async sendAppointmentReminderEmails(appointment) {
        return require('./emailService').sendAppointmentReminderEmails(appointment);
    }

    /**
     * Send recommendation notification
     * @param {Object} appointment - Appointment object with populated client and provider
     */
    async sendRecommendationNotification(appointment) {
        return require('./emailService').sendRecommendationNotification(appointment);
    }

    /**
     * Send follow-up notification
     * @param {Object} appointment - Appointment object with populated client and provider
     */
    async sendFollowUpNotification(appointment) {
        return require('./emailService').sendFollowUpNotification(appointment);
    }

    /**
     * Send session completed notification
     * @param {Object} appointment - Appointment object with populated client and provider
     */
    async sendSessionCompletedNotification(appointment) {
        return sessionNotification.sendSessionCompletedNotification(appointment);
    }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export the service
module.exports = {
    NotificationService: notificationService
};