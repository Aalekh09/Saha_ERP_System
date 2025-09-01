// Email Notification System
class EmailNotificationSystem {
    constructor() {
        this.templates = {
            feeReminder: {
                subject: 'Fee Payment Reminder - Saha Institute',
                template: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; text-align: center;">
                            <h1>Saha Institute of Management & Technology</h1>
                            <p>Fee Payment Reminder</p>
                        </div>
                        <div style="padding: 20px; background: #f8fafc;">
                            <p>Dear {{studentName}},</p>
                            <p>This is a friendly reminder that your course fee payment is pending.</p>
                            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h3>Payment Details:</h3>
                                <p><strong>Course:</strong> {{courseName}}</p>
                                <p><strong>Total Fee:</strong> ₹{{totalFee}}</p>
                                <p><strong>Paid Amount:</strong> ₹{{paidAmount}}</p>
                                <p><strong>Pending Amount:</strong> ₹{{pendingAmount}}</p>
                            </div>
                            <p>Please make the payment at your earliest convenience to avoid any inconvenience.</p>
                            <p>For any queries, please contact us at the institute.</p>
                            <p>Best regards,<br>Saha Institute Administration</p>
                        </div>
                    </div>
                `
            },
            welcomeStudent: {
                subject: 'Welcome to Saha Institute of Management & Technology',
                template: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #10b981, #34d399); color: white; padding: 20px; text-align: center;">
                            <h1>Welcome to Saha Institute!</h1>
                            <p>Your journey to success begins here</p>
                        </div>
                        <div style="padding: 20px; background: #f8fafc;">
                            <p>Dear {{studentName}},</p>
                            <p>Welcome to Saha Institute of Management & Technology! We are excited to have you join our community of learners.</p>
                            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h3>Your Course Details:</h3>
                                <p><strong>Student ID:</strong> STU{{studentId}}</p>
                                <p><strong>Course:</strong> {{courseName}}</p>
                                <p><strong>Duration:</strong> {{courseDuration}}</p>
                                <p><strong>Start Date:</strong> {{startDate}}</p>
                            </div>
                            <p>Please keep your Student ID safe as you'll need it for all future communications.</p>
                            <p>We look forward to supporting you throughout your learning journey!</p>
                            <p>Best regards,<br>Saha Institute Team</p>
                        </div>
                    </div>
                `
            },
            attendanceAlert: {
                subject: 'Attendance Alert - Saha Institute',
                template: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; padding: 20px; text-align: center;">
                            <h1>Attendance Alert</h1>
                            <p>Low Attendance Notice</p>
                        </div>
                        <div style="padding: 20px; background: #f8fafc;">
                            <p>Dear {{studentName}},</p>
                            <p>We noticed that your attendance has fallen below the required minimum.</p>
                            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h3>Attendance Summary:</h3>
                                <p><strong>Current Attendance:</strong> {{attendancePercentage}}%</p>
                                <p><strong>Required Minimum:</strong> 75%</p>
                                <p><strong>Classes Attended:</strong> {{classesAttended}}/{{totalClasses}}</p>
                            </div>
                            <p>Regular attendance is crucial for your academic success. Please ensure you attend classes regularly.</p>
                            <p>If you have any concerns, please contact us immediately.</p>
                            <p>Best regards,<br>Saha Institute Administration</p>
                        </div>
                    </div>
                `
            }
        };
    }
    
    // Send fee reminder to students with pending payments
    async sendFeeReminders() {
        try {
            const response = await fetch('https://aalekhapi.sahaedu.in/api/students');
            const students = await response.json();
            
            const pendingStudents = students.filter(student => {
                const totalFee = parseFloat(student.totalCourseFee) || 0;
                const paidAmount = parseFloat(student.paidAmount) || 0;
                return paidAmount < totalFee && totalFee > 0;
            });
            
            let sentCount = 0;
            
            for (const student of pendingStudents) {
                const emailData = {
                    to: student.email,
                    subject: this.templates.feeReminder.subject,
                    html: this.populateTemplate('feeReminder', {
                        studentName: student.name,
                        courseName: student.courses || 'N/A',
                        totalFee: student.totalCourseFee || 0,
                        paidAmount: student.paidAmount || 0,
                        pendingAmount: (parseFloat(student.totalCourseFee) || 0) - (parseFloat(student.paidAmount) || 0)
                    })
                };
                
                const sent = await this.sendEmail(emailData);
                if (sent) sentCount++;
            }
            
            return {
                success: true,
                message: `Fee reminders sent to ${sentCount} students`,
                count: sentCount
            };
            
        } catch (error) {
            console.error('Error sending fee reminders:', error);
            return {
                success: false,
                message: 'Error sending fee reminders',
                error: error.message
            };
        }
    }
    
    // Send welcome email to new student
    async sendWelcomeEmail(student) {
        try {
            const emailData = {
                to: student.email,
                subject: this.templates.welcomeStudent.subject,
                html: this.populateTemplate('welcomeStudent', {
                    studentName: student.name,
                    studentId: String(student.id).padStart(4, '0'),
                    courseName: student.courses || 'N/A',
                    courseDuration: student.courseDuration || 'N/A',
                    startDate: student.admissionDate || new Date().toLocaleDateString()
                })
            };
            
            return await this.sendEmail(emailData);
            
        } catch (error) {
            console.error('Error sending welcome email:', error);
            return false;
        }
    }
    
    // Send attendance alert
    async sendAttendanceAlert(student, attendanceData) {
        try {
            const emailData = {
                to: student.email,
                subject: this.templates.attendanceAlert.subject,
                html: this.populateTemplate('attendanceAlert', {
                    studentName: student.name,
                    attendancePercentage: attendanceData.percentage,
                    classesAttended: attendanceData.present,
                    totalClasses: attendanceData.total
                })
            };
            
            return await this.sendEmail(emailData);
            
        } catch (error) {
            console.error('Error sending attendance alert:', error);
            return false;
        }
    }
    
    // Populate email template with data
    populateTemplate(templateName, data) {
        let template = this.templates[templateName].template;
        
        Object.keys(data).forEach(key => {
            const placeholder = `{{${key}}}`;
            template = template.replace(new RegExp(placeholder, 'g'), data[key]);
        });
        
        return template;
    }
    
    // Send email (simulate API call)
    async sendEmail(emailData) {
        try {
            // In a real implementation, this would call your email service API
            // For now, we'll simulate the email sending
            
            console.log('Sending email:', emailData);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simulate success/failure (90% success rate)
            const success = Math.random() > 0.1;
            
            if (success) {
                console.log(`Email sent successfully to ${emailData.to}`);
                return true;
            } else {
                console.log(`Failed to send email to ${emailData.to}`);
                return false;
            }
            
        } catch (error) {
            console.error('Error in sendEmail:', error);
            return false;
        }
    }
    
    // Bulk email functionality
    async sendBulkEmails(students, templateName, customData = {}) {
        let sentCount = 0;
        let failedCount = 0;
        
        for (const student of students) {
            try {
                const templateData = {
                    studentName: student.name,
                    studentId: String(student.id).padStart(4, '0'),
                    courseName: student.courses || 'N/A',
                    ...customData
                };
                
                const emailData = {
                    to: student.email,
                    subject: this.templates[templateName].subject,
                    html: this.populateTemplate(templateName, templateData)
                };
                
                const sent = await this.sendEmail(emailData);
                if (sent) {
                    sentCount++;
                } else {
                    failedCount++;
                }
                
                // Add delay between emails to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`Error sending email to ${student.email}:`, error);
                failedCount++;
            }
        }
        
        return {
            sent: sentCount,
            failed: failedCount,
            total: students.length
        };
    }
    
    // Schedule automatic fee reminders
    scheduleAutomaticReminders() {
        // Send fee reminders every Monday at 9 AM
        const now = new Date();
        const nextMonday = new Date();
        nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
        nextMonday.setHours(9, 0, 0, 0);
        
        const timeUntilNextMonday = nextMonday.getTime() - now.getTime();
        
        setTimeout(() => {
            this.sendFeeReminders();
            
            // Set up weekly interval
            setInterval(() => {
                this.sendFeeReminders();
            }, 7 * 24 * 60 * 60 * 1000); // Weekly
            
        }, timeUntilNextMonday);
        
        console.log(`Automatic fee reminders scheduled for ${nextMonday.toLocaleString()}`);
    }
}

// Export for global use
window.EmailNotificationSystem = EmailNotificationSystem;