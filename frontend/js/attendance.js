// Attendance Management System
class AttendanceManager {
    constructor() {
        this.students = [];
        this.attendanceData = {};
        this.currentDate = new Date().toISOString().split('T')[0];
        this.enhancedSearch = null;
        
        this.init();
    }
    

    
    async init() {
        this.setupEventListeners();
        this.initializeThemeToggle();
        this.initializeMobileMenu();
        this.updateAPIStatus();
        await this.loadStudents();
        this.initializeEnhancedSearch();
        this.setCurrentDate();
        this.loadAttendanceForDate();
    }
    
    setupEventListeners() {
        // Date change
        document.getElementById('attendanceDate').addEventListener('change', (e) => {
            this.currentDate = e.target.value;
            this.loadAttendanceForDate();
        });
        
        // Mark all present
        document.getElementById('markAllPresentBtn').addEventListener('click', () => {
            this.markAllPresent();
        });
        
        // Save attendance
        document.getElementById('saveAttendanceBtn').addEventListener('click', () => {
            this.saveAttendance();
        });
        
        // Course filter
        document.getElementById('courseFilter').addEventListener('change', (e) => {
            this.filterByCourse(e.target.value);
        });
        
        // Export attendance
        document.getElementById('exportAttendanceBtn').addEventListener('click', () => {
            this.exportAttendance();
        });
        
        // Modal close
        document.getElementById('closeAttendanceModal').addEventListener('click', () => {
            this.closeModal();
        });
    }
    
    async loadStudents() {
        try {
            this.showLoadingSkeleton();
            
            // Use API wrapper that automatically falls back to mock
            this.students = await window.apiWrapper.get('/api/students');
            
            this.populateCourseFilter();
            this.renderAttendanceGrid();
            this.updateStats();
            this.updateAPIStatus();
            
        } catch (error) {
            console.error('Error loading students:', error);
            
            // Final fallback to demo data
            this.loadDemoStudents();
            this.showNotification('Using demo data - API not available', true);
            this.updateAPIStatus();
        }
    }
    
    loadDemoStudents() {
        // No demo students - will show empty state
        this.students = [];
        
        this.populateCourseFilter();
        this.renderAttendanceGrid();
        this.updateStats();
    }
    
    initializeEnhancedSearch() {
        this.enhancedSearch = new EnhancedSearch({
            container: '#attendanceSearchContainer',
            data: this.students,
            placeholder: 'Search students by name, course, or ID...',
            onSearch: (query) => {
                this.filterStudents(query);
            },
            onSelect: (student) => {
                this.highlightStudent(student.id);
            }
        });
    }
    
    setCurrentDate() {
        document.getElementById('attendanceDate').value = this.currentDate;
    }
    
    populateCourseFilter() {
        const courses = [...new Set(this.students.map(s => s.courses).filter(Boolean))];
        const courseFilter = document.getElementById('courseFilter');
        
        courseFilter.innerHTML = '<option value="">All Courses</option>';
        courses.forEach(course => {
            courseFilter.innerHTML += `<option value="${course}">${course}</option>`;
        });
    }
    
    showLoadingSkeleton() {
        const loadingSkeleton = document.getElementById('loadingSkeleton');
        const attendanceGrid = document.getElementById('attendanceGrid');
        
        if (loadingSkeleton) {
            loadingSkeleton.style.display = 'grid';
        }
        if (attendanceGrid) {
            attendanceGrid.style.display = 'none';
        }
    }
    
    hideLoadingSkeleton() {
        const loadingSkeleton = document.getElementById('loadingSkeleton');
        const attendanceGrid = document.getElementById('attendanceGrid');
        
        if (loadingSkeleton) {
            loadingSkeleton.style.display = 'none';
        }
        if (attendanceGrid) {
            attendanceGrid.style.display = 'grid';
        }
    }
    
    renderAttendanceGrid() {
        this.hideLoadingSkeleton();
        
        const grid = document.getElementById('attendanceGrid');
        grid.innerHTML = '';
        
        this.students.forEach(student => {
            const attendanceStatus = this.getAttendanceStatus(student.id);
            const card = this.createStudentCard(student, attendanceStatus);
            grid.appendChild(card);
        });
        
        // Add fade-in animation
        setTimeout(() => {
            grid.classList.add('fade-in');
        }, 100);
    }
    
    createStudentCard(student, status) {
        const card = document.createElement('div');
        card.className = `student-attendance-card ${status}`;
        card.dataset.studentId = student.id;
        
        const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        card.innerHTML = `
            <div class="student-card-header">
                <div class="student-avatar-attendance">${initials}</div>
                <div class="student-info-attendance">
                    <div class="student-name-attendance">${student.name}</div>
                    <div class="student-course-attendance">${student.courses || 'No Course'}</div>
                </div>
                <div class="attendance-status ${status}">
                    <i class="fas ${this.getStatusIcon(status)}"></i>
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
            </div>
            <div class="attendance-controls">
                <button class="attendance-btn present" onclick="attendanceManager.markAttendance(${student.id}, 'present')">
                    <i class="fas fa-check"></i> Present
                </button>
                <button class="attendance-btn absent" onclick="attendanceManager.markAttendance(${student.id}, 'absent')">
                    <i class="fas fa-times"></i> Absent
                </button>
                <button class="attendance-btn late" onclick="attendanceManager.markAttendance(${student.id}, 'late')">
                    <i class="fas fa-clock"></i> Late
                </button>
            </div>
        `;
        
        // Add click handler for student details
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('attendance-btn')) {
                this.showStudentDetails(student);
            }
        });
        
        return card;
    }
    
    getStatusIcon(status) {
        switch (status) {
            case 'present': return 'fa-user-check';
            case 'absent': return 'fa-user-times';
            case 'late': return 'fa-user-clock';
            default: return 'fa-user';
        }
    }
    
    getAttendanceStatus(studentId) {
        const dateKey = this.currentDate;
        return this.attendanceData[dateKey]?.[studentId] || 'absent';
    }
    
    markAttendance(studentId, status) {
        const dateKey = this.currentDate;
        
        if (!this.attendanceData[dateKey]) {
            this.attendanceData[dateKey] = {};
        }
        
        this.attendanceData[dateKey][studentId] = status;
        
        // Update the card
        const card = document.querySelector(`[data-student-id="${studentId}"]`);
        if (card) {
            card.className = `student-attendance-card ${status}`;
            const statusElement = card.querySelector('.attendance-status');
            statusElement.className = `attendance-status ${status}`;
            statusElement.innerHTML = `
                <i class="fas ${this.getStatusIcon(status)}"></i>
                ${status.charAt(0).toUpperCase() + status.slice(1)}
            `;
        }
        
        this.updateStats();
        this.showNotification(`Marked ${this.getStudentName(studentId)} as ${status}`);
    }
    
    markAllPresent() {
        this.students.forEach(student => {
            this.markAttendance(student.id, 'present');
        });
        this.showNotification('Marked all students as present');
    }
    
    updateStats() {
        const dateKey = this.currentDate;
        const attendance = this.attendanceData[dateKey] || {};
        
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        
        this.students.forEach(student => {
            const status = attendance[student.id] || 'absent';
            switch (status) {
                case 'present': presentCount++; break;
                case 'absent': absentCount++; break;
                case 'late': lateCount++; break;
            }
        });
        
        document.getElementById('presentCount').textContent = presentCount;
        document.getElementById('absentCount').textContent = absentCount;
        document.getElementById('lateCount').textContent = lateCount;
        document.getElementById('totalStudents').textContent = this.students.length;
    }
    
    async saveAttendance() {
        try {
            const dateKey = this.currentDate;
            const attendanceForDate = this.attendanceData[dateKey] || {};
            
            // Use API wrapper that automatically falls back to mock
            const result = await window.apiWrapper.post('/api/attendance', {
                date: dateKey,
                attendance: attendanceForDate
            });
            
            this.showNotification('Attendance saved successfully!');
            
        } catch (error) {
            console.error('Error saving attendance:', error);
            this.showNotification('Error saving attendance', true);
        }
    }
    
    async loadAttendanceForDate() {
        try {
            // Use API wrapper that automatically falls back to mock
            const data = await window.apiWrapper.get(`/api/attendance/${this.currentDate}`);
            this.attendanceData[this.currentDate] = data.attendance || {};
            
            this.renderAttendanceGrid();
            this.updateStats();
            
        } catch (error) {
            console.error('Error loading attendance:', error);
            // Initialize empty attendance for the date
            this.attendanceData[this.currentDate] = {};
            this.renderAttendanceGrid();
            this.updateStats();
        }
    }
    
    filterByCourse(course) {
        const cards = document.querySelectorAll('.student-attendance-card');
        cards.forEach(card => {
            const studentId = parseInt(card.dataset.studentId);
            const student = this.students.find(s => s.id === studentId);
            
            if (!course || student.courses === course) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    filterStudents(query) {
        if (!query) {
            // Show all cards
            document.querySelectorAll('.student-attendance-card').forEach(card => {
                card.style.display = 'block';
            });
            return;
        }
        
        const cards = document.querySelectorAll('.student-attendance-card');
        cards.forEach(card => {
            const studentId = parseInt(card.dataset.studentId);
            const student = this.students.find(s => s.id === studentId);
            
            const searchText = `${student.name} ${student.email || ''} ${student.phoneNumber || ''} ${student.courses || ''}`.toLowerCase();
            
            if (searchText.includes(query.toLowerCase())) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    highlightStudent(studentId) {
        // Remove previous highlights
        document.querySelectorAll('.student-attendance-card').forEach(card => {
            card.classList.remove('highlighted');
        });
        
        // Highlight selected student
        const card = document.querySelector(`[data-student-id="${studentId}"]`);
        if (card) {
            card.classList.add('highlighted');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    showStudentDetails(student) {
        document.getElementById('modalStudentName').textContent = student.name;
        
        // Calculate attendance statistics
        const stats = this.calculateStudentStats(student.id);
        document.getElementById('totalClasses').textContent = stats.total;
        document.getElementById('presentDays').textContent = stats.present;
        document.getElementById('absentDays').textContent = stats.absent;
        document.getElementById('attendancePercentage').textContent = stats.percentage + '%';
        
        // Show modal
        document.getElementById('attendanceModal').style.display = 'block';
    }
    
    calculateStudentStats(studentId) {
        let total = 0;
        let present = 0;
        let absent = 0;
        
        Object.keys(this.attendanceData).forEach(date => {
            const status = this.attendanceData[date][studentId];
            if (status) {
                total++;
                if (status === 'present' || status === 'late') {
                    present++;
                } else {
                    absent++;
                }
            }
        });
        
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return { total, present, absent, percentage };
    }
    
    closeModal() {
        document.getElementById('attendanceModal').style.display = 'none';
    }
    
    getStudentName(studentId) {
        const student = this.students.find(s => s.id === studentId);
        return student ? student.name : 'Unknown Student';
    }
    
    exportAttendance() {
        // Create CSV data
        const headers = ['Date', 'Student Name', 'Course', 'Status'];
        const rows = [headers];
        
        Object.keys(this.attendanceData).forEach(date => {
            const attendance = this.attendanceData[date];
            Object.keys(attendance).forEach(studentId => {
                const student = this.students.find(s => s.id == studentId);
                if (student) {
                    rows.push([
                        date,
                        student.name,
                        student.courses || 'N/A',
                        attendance[studentId]
                    ]);
                }
            });
        });
        
        // Convert to CSV
        const csvContent = rows.map(row => row.join(',')).join('\n');
        
        // Download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Attendance exported successfully!');
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
    
    // API Status Management
    async updateAPIStatus() {
        const statusElement = document.getElementById('apiStatus');
        if (!statusElement) return;
        
        try {
            const isOnline = await window.apiWrapper.checkAPIAvailability();
            
            if (isOnline) {
                statusElement.className = 'api-status online';
                statusElement.innerHTML = '<i class="fas fa-circle"></i><span>API Online</span>';
            } else {
                statusElement.className = 'api-status offline';
                statusElement.innerHTML = '<i class="fas fa-circle"></i><span>Demo Mode</span>';
            }
        } catch (error) {
            statusElement.className = 'api-status offline';
            statusElement.innerHTML = '<i class="fas fa-circle"></i><span>Demo Mode</span>';
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

// Initialize attendance manager when DOM is loaded
let attendanceManager;
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
    
    attendanceManager = new AttendanceManager();
});