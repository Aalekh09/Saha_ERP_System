// Notifications Management System
class NotificationManager {
    constructor() {
        this.emailSystem = new EmailNotificationSystem();
        this.students = [];
        this.emailActivity = [];
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.initializeThemeToggle();
        this.initializeMobileMenu();
        await this.loadStudents();
        this.loadEmailActivity();
        this.updateStats();
    }
    
    setupEventListeners() {
        // Send fee reminders
        document.getElementById('sendFeeRemindersBtn').addEventListener('click', () => {
            this.sendFeeReminders();
        });
        
        // Preview email templates
        document.getElementById('previewEmailBtn').addEventListener('click', () => {
            this.previewTemplate('feeReminder');
        });
        
        // Bulk email modal
        const recipientFilter = document.getElementById('recipientFilter');
        if (recipientFilter) {
            recipientFilter.addEventListener('change', (e) => {
                this.toggleCourseFilter(e.target.value);
            });
        }
        
        // Bulk email form
        const bulkEmailForm = document.getElementById('bulkEmailForm');
        if (bulkEmailForm) {
            bulkEmailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendBulkEmail();
            });
        }
        
        // Modal close buttons
        document.getElementById('closePreviewModal')?.addEventListener('click', () => {
            this.closeModal('emailPreviewModal');
        });
        
        document.getElementById('closeBulkModal')?.addEventListener('click', () => {
            this.closeModal('bulkEmailModal');
        });
        
        // Preview bulk email
        document.getElementById('previewBulkEmail')?.addEventListener('click', () => {
            this.previewBulkEmail();
        });
    }
    
    async loadStudents() {
        try {
            const response = await fetch('http://localhost:4455/api/students');
            this.students = await response.json();
            
            this.populateCourseSelect();
            this.updateStats();
            
        } catch (error) {
            console.error('Error loading students:', error);
            this.showNotification('Error loading students', true);
        }
    }
    
    populateCourseSelect() {
        const courseSelect = document.getElementById('courseSelect');
        if (courseSelect && this.students.length > 0) {
            const courses = [...new Set(this.students.map(s => s.courses).filter(Boolean))];
            courseSelect.innerHTML = '<option value="">Select Course</option>';
            courses.forEach(course => {
                courseSelect.innerHTML += `<option value="${course}">${course}</option>`;
            });
        }
    }
    
    async sendFeeReminders() {
        try {
            this.showLoadingState('sendFeeRemindersBtn');
            
            const result = await this.emailSystem.sendFeeReminders();
            
            if (result.success) {
                this.showNotification(result.message);
                this.addEmailActivity('Fee Reminders Sent', `Sent to ${result.count} students`, 'success');
                this.updateStats();
            } else {
                this.showNotification(result.message, true);
            }
            
        } catch (error) {
            console.error('Error sending fee reminders:', error);
            this.showNotification('Error sending fee reminders', true);
        } finally {
            this.hideLoadingState('sendFeeRemindersBtn');
        }
    }
    

    
    openBulkEmailModal() {
        document.getElementById('bulkEmailModal').style.display = 'block';
    }
    
    toggleCourseFilter(value) {
        const courseFilterGroup = document.getElementById('courseFilterGroup');
        if (courseFilterGroup) {
            courseFilterGroup.style.display = value === 'course' ? 'block' : 'none';
        }
    }
    
    async sendBulkEmail() {
        try {
            const recipientFilter = document.getElementById('recipientFilter').value;
            const courseSelect = document.getElementById('courseSelect').value;
            const subject = document.getElementById('emailSubject').value;
            const message = document.getElementById('emailMessage').value;
            
            if (!subject || !message) {
                this.showNotification('Please fill in subject and message', true);
                return;
            }
            
            // Filter recipients
            let recipients = this.getFilteredRecipients(recipientFilter, courseSelect);
            
            if (recipients.length === 0) {
                this.showNotification('No recipients found for the selected criteria', true);
                return;
            }
            
            // Create custom template
            const customTemplate = {
                subject: subject,
                template: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; text-align: center;">
                            <h1>Saha Institute of Management & Technology</h1>
                        </div>
                        <div style="padding: 20px; background: #f8fafc;">
                            <p>Dear {{studentName}},</p>
                            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                            <p>Best regards,<br>Saha Institute Administration</p>
                        </div>
                    </div>
                `
            };
            
            // Send emails
            const result = await this.emailSystem.sendBulkEmails(recipients, customTemplate);
            
            this.showNotification(`Bulk email sent: ${result.sent} successful, ${result.failed} failed`);
            this.addEmailActivity('Bulk Email Sent', `Sent to ${result.sent} recipients`, 'success');
            this.closeModal('bulkEmailModal');
            this.updateStats();
            
        } catch (error) {
            console.error('Error sending bulk email:', error);
            this.showNotification('Error sending bulk email', true);
        }
    }
    
    getFilteredRecipients(filter, course) {
        switch (filter) {
            case 'all':
                return this.students;
            case 'pending-fees':
                return this.students.filter(student => {
                    const totalFee = parseFloat(student.totalCourseFee) || 0;
                    const paidAmount = parseFloat(student.paidAmount) || 0;
                    return paidAmount < totalFee && totalFee > 0;
                });
            case 'low-attendance':
                // Simulate low attendance filter
                return this.students.filter(() => Math.random() < 0.3);
            case 'course':
                return this.students.filter(student => student.courses === course);
            default:
                return [];
        }
    }
    
    previewTemplate(templateName) {
        const modal = document.getElementById('emailPreviewModal');
        const content = document.getElementById('emailPreviewContent');
        
        // Sample data for preview
        const sampleData = {
            studentName: 'John Doe',
            courseName: 'Web Development',
            totalFee: '15000',
            paidAmount: '5000',
            pendingAmount: '10000',
            studentId: '0001',
            courseDuration: '6 Months',
            startDate: new Date().toLocaleDateString(),
            attendancePercentage: '65',
            classesAttended: '13',
            totalClasses: '20'
        };
        
        const template = this.emailSystem.populateTemplate(templateName, sampleData);
        content.innerHTML = template;
        modal.style.display = 'block';
    }
    
    previewBulkEmail() {
        const subject = document.getElementById('emailSubject').value;
        const message = document.getElementById('emailMessage').value;
        
        if (!subject || !message) {
            this.showNotification('Please fill in subject and message first', true);
            return;
        }
        
        const modal = document.getElementById('emailPreviewModal');
        const content = document.getElementById('emailPreviewContent');
        
        const previewHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; text-align: center;">
                    <h1>Saha Institute of Management & Technology</h1>
                </div>
                <div style="padding: 20px; background: #f8fafc;">
                    <p>Dear [Student Name],</p>
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <p>Best regards,<br>Saha Institute Administration</p>
                </div>
            </div>
        `;
        
        content.innerHTML = previewHTML;
        modal.style.display = 'block';
    }
    
    editTemplate(templateName) {
        // This would open a template editor
        this.showNotification('Template editor coming soon!');
    }
    
    scheduleReminders() {
        this.emailSystem.scheduleAutomaticReminders();
        this.showNotification('Automatic fee reminders scheduled for every Monday at 9 AM');
        this.addEmailActivity('Automatic Reminders Scheduled', 'Weekly fee reminders enabled', 'success');
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
    
    loadEmailActivity() {
        // Simulate email activity data
        this.emailActivity = [
            {
                type: 'success',
                title: 'Fee Reminders Sent',
                description: 'Sent to 15 students with pending payments',
                time: '2 hours ago'
            },
            {
                type: 'success',
                title: 'Welcome Email Sent',
                description: 'New student: John Doe',
                time: '4 hours ago'
            },
            {
                type: 'error',
                title: 'Email Delivery Failed',
                description: 'Failed to send to invalid@email.com',
                time: '6 hours ago'
            },
            {
                type: 'success',
                title: 'Bulk Email Sent',
                description: 'Course update notification to 45 students',
                time: '1 day ago'
            }
        ];
        
        this.renderEmailActivity();
    }
    
    renderEmailActivity() {
        const activityList = document.getElementById('emailActivity');
        
        if (this.emailActivity.length === 0) {
            activityList.innerHTML = `
                <div class="empty-activity">
                    <i class="fas fa-inbox"></i>
                    <h4>No email activity yet</h4>
                    <p>Email activities will appear here once you start sending notifications</p>
                </div>
            `;
            return;
        }
        
        activityList.innerHTML = this.emailActivity.map(activity => `
            <div class="activity-item">
                <div class="activity-icon-wrapper ${activity.type}">
                    <i class="fas ${activity.type === 'success' ? 'fa-check' : 'fa-exclamation-triangle'}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
    
    addEmailActivity(title, description, type = 'success') {
        this.emailActivity.unshift({
            type,
            title,
            description,
            time: 'Just now'
        });
        
        // Keep only last 10 activities
        this.emailActivity = this.emailActivity.slice(0, 10);
        
        this.renderEmailActivity();
    }
    
    updateStats() {
        // Update email stats
        document.getElementById('emailsSentToday').textContent = '23';
        
        // Calculate pending fee reminders
        const pendingFeeStudents = this.students.filter(student => {
            const totalFee = parseFloat(student.totalCourseFee) || 0;
            const paidAmount = parseFloat(student.paidAmount) || 0;
            return paidAmount < totalFee && totalFee > 0;
        });
        
        document.getElementById('pendingReminders').textContent = pendingFeeStudents.length;
        document.getElementById('successRate').textContent = '96%';
    }
    
    showLoadingState(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.add('loading-state');
            button.disabled = true;
        }
    }
    
    hideLoadingState(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.remove('loading-state');
            button.disabled = false;
        }
    }
    
    showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notificationMessage');
        
        notificationMessage.textContent = message;
        notification.className = 'notification' + (isError ? ' error' : '');
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Theme toggle functionality
    initializeThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle?.querySelector('i');
        
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme, themeIcon);
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                this.updateThemeIcon(newTheme, themeIcon);
                
                this.showNotification(`Switched to ${newTheme} mode`);
            });
        }
    }
    
    updateThemeIcon(theme, iconElement) {
        if (!iconElement) return;
        
        if (theme === 'dark') {
            iconElement.className = 'fas fa-sun';
            iconElement.parentElement.title = 'Switch to Light Mode';
        } else {
            iconElement.className = 'fas fa-moon';
            iconElement.parentElement.title = 'Switch to Dark Mode';
        }
    }
    
    // Mobile menu functionality
    initializeMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const sidePanel = document.getElementById('sidePanel');

        if (mobileMenuToggle && mobileMenuOverlay && sidePanel) {
            mobileMenuToggle.addEventListener('click', () => {
                sidePanel.classList.toggle('mobile-active');
                mobileMenuOverlay.classList.toggle('active');
                document.body.classList.toggle('mobile-menu-open');
            });

            mobileMenuOverlay.addEventListener('click', () => {
                sidePanel.classList.remove('mobile-active');
                mobileMenuOverlay.classList.remove('active');
                document.body.classList.remove('mobile-menu-open');
            });
        }
    }
}

// Initialize notification manager when DOM is loaded
let notificationManager;
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.replace('login.html');
        return;
    }
    
    // Set username
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
    }
    
    notificationManager = new NotificationManager();
});