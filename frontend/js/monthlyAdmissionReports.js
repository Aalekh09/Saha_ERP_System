/**
 * Monthly Admission Reports Class
 * Handles interactive monthly admission reports with clickable months and student details
 */

class MonthlyAdmissionReports {
    constructor() {
        this.currentView = 'overview'; // 'overview' or 'details'
        this.selectedMonth = null;
        this.monthlyData = [];
        this.studentsData = [];
        this.isLoading = false;

        // DOM elements
        this.monthsGrid = document.getElementById('monthsGrid');
        this.monthlyOverview = document.getElementById('monthly-overview');
        this.studentDetailsPanel = document.getElementById('student-details-panel');
        this.selectedMonthTitle = document.getElementById('selectedMonthTitle');
        this.studentsList = document.getElementById('studentsList');
        this.tableView = document.getElementById('table-view');
        this.viewToggleText = document.getElementById('viewToggleText');

        // API base URL
        this.API_BASE = `https://aalekhapi.sahaedu.in/api/reports`;

        // Initialize the component
        this.init();
    }

    /**
     * Initialize the monthly admission reports
     */
    async init() {
        try {
            await this.loadMonthlyData();
            this.renderMonthlyOverview();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing monthly admission reports:', error);
            this.showError('Failed to load monthly admission data');
        }
    }

    /**
     * Load monthly admission data from API
     */
    async loadMonthlyData() {
        this.setLoading(true);

        try {
            const response = await fetch(`${this.API_BASE}/monthly-student-admissions`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Transform data to include formatted month names
            this.monthlyData = data.map(item => ({
                ...item,
                monthName: MonthUtils.formatMonthYear(item.month),
                shortMonthName: MonthUtils.formatShortMonthYear(item.month)
            }));

            // Sort by month (most recent first)
            this.monthlyData.sort((a, b) => MonthUtils.compareMonths(b.month, a.month));

        } catch (error) {
            console.error('Error loading monthly data:', error);
            this.monthlyData = [];
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Render the monthly overview grid
     */
    renderMonthlyOverview() {
        if (!this.monthsGrid) {
            console.error('Months grid element not found');
            return;
        }

        if (this.monthlyData.length === 0) {
            this.monthsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-calendar-times" style="font-size: 4rem; color: #e9ecef; margin-bottom: 20px;"></i>
                    <h4 style="color: #495057; margin-bottom: 12px;">No Admission Data</h4>
                    <p style="color: #6c757d; margin: 0;">No monthly admission data available to display.</p>
                </div>
            `;
            return;
        }

        const monthCards = this.monthlyData.map(monthData => {
            const hasStudents = monthData.count > 0;
            const cardClass = hasStudents ? 'month-card' : 'month-card no-students';

            return `
                <div class="${cardClass}" 
                     data-month="${monthData.month}" 
                     ${hasStudents ? 'onclick="monthlyAdmissionReports.showStudentDetails(\'' + monthData.month + '\')"' : ''}
                     ${hasStudents ? 'tabindex="0"' : ''}
                     ${hasStudents ? 'role="button"' : ''}
                     ${hasStudents ? 'aria-label="View students admitted in ' + monthData.monthName + '"' : ''}
                     ${hasStudents ? 'onkeydown="if(event.key===\'Enter\'||event.key===\' \'){monthlyAdmissionReports.showStudentDetails(\'' + monthData.month + '\');}"' : ''}>
                    <h3>
                        <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                        ${monthData.monthName}
                    </h3>
                    <span class="student-count" aria-label="${monthData.count} students">${monthData.count}</span>
                    <span class="student-label">${monthData.count === 1 ? 'Student' : 'Students'}</span>
                </div>
            `;
        }).join('');

        this.monthsGrid.innerHTML = monthCards;

        // Add animation delay to cards
        const cards = this.monthsGrid.querySelectorAll('.month-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
        });
    }

    /**
     * Show student details for selected month
     */
    async showStudentDetails(month) {
        if (this.isLoading) return;

        this.selectedMonth = month;
        const monthData = this.monthlyData.find(item => item.month === month);

        if (!monthData || monthData.count === 0) {
            this.showNotification('No students found for this month', 'info');
            return;
        }

        try {
            // Update title
            if (this.selectedMonthTitle) {
                this.selectedMonthTitle.innerHTML = `
                    <i class="fas fa-users"></i>
                    Students Admitted in ${monthData.monthName}
                `;
            }

            // Switch to details view
            this.switchToDetailsView();

            // Load student details
            await this.loadStudentDetails(month);

        } catch (error) {
            console.error('Error showing student details:', error);
            this.showError('Failed to load student details');
            this.returnToOverview();
        }
    }

    /**
     * Load student details for specific month
     */
    async loadStudentDetails(month) {
        this.setLoading(true, 'students');

        try {
            const response = await fetch(`${this.API_BASE}/students-by-month?month=${month}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.studentsData = await response.json();
            this.renderStudentDetails();

        } catch (error) {
            console.error('Error loading student details:', error);
            this.studentsData = [];
            this.renderStudentDetails();
            throw error;
        } finally {
            this.setLoading(false, 'students');
        }
    }

    /**
     * Render student details list
     */
    renderStudentDetails() {
        if (!this.studentsList) {
            console.error('Students list element not found');
            return;
        }

        if (this.studentsData.length === 0) {
            this.studentsList.innerHTML = `
                <div class="students-list-empty">
                    <i class="fas fa-user-slash"></i>
                    <h4>No Students Found</h4>
                    <p>No students were admitted in this month.</p>
                </div>
            `;
            return;
        }

        const studentsHtml = this.studentsData.map(student => `
            <div class="student-item">
                <div class="student-info">
                    <div class="student-field name">
                        <span class="label">Student Name</span>
                        <span class="value">${student.name || 'N/A'}</span>
                    </div>
                    <div class="student-field course">
                        <span class="label">Course</span>
                        <span class="value">${student.courses || 'N/A'}</span>
                    </div>
                    <div class="student-field father">
                        <span class="label">Father's Name</span>
                        <span class="value">${student.fatherName || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join('');

        this.studentsList.innerHTML = studentsHtml;

        // Add animation delay to student items
        const items = this.studentsList.querySelectorAll('.student-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
        });
    }

    /**
     * Return to monthly overview
     */
    returnToOverview() {
        this.selectedMonth = null;
        this.studentsData = [];
        this.switchToOverviewView();
    }

    /**
     * Switch to details view
     */
    switchToDetailsView() {
        this.currentView = 'details';

        if (this.monthlyOverview) {
            this.monthlyOverview.style.display = 'none';
        }

        if (this.studentDetailsPanel) {
            this.studentDetailsPanel.style.display = 'block';

            // Focus management for accessibility
            const backButton = this.studentDetailsPanel.querySelector('.back-btn');
            if (backButton) {
                setTimeout(() => backButton.focus(), 100);
            }
        }

        if (this.tableView) {
            this.tableView.style.display = 'none';
        }
    }

    /**
     * Switch to overview view
     */
    switchToOverviewView() {
        this.currentView = 'overview';

        if (this.monthlyOverview) {
            this.monthlyOverview.style.display = 'block';

            // Focus management - return focus to the selected month card if available
            if (this.selectedMonth) {
                const monthCard = this.monthsGrid.querySelector(`[data-month="${this.selectedMonth}"]`);
                if (monthCard) {
                    setTimeout(() => monthCard.focus(), 100);
                }
            }
        }

        if (this.studentDetailsPanel) {
            this.studentDetailsPanel.style.display = 'none';
        }

        if (this.tableView) {
            this.tableView.style.display = 'none';
        }
    }

    /**
     * Toggle between grid view and table view
     */
    toggleView() {
        if (this.currentView === 'details') {
            // If in details view, return to overview first
            this.returnToOverview();
            return;
        }

        const isTableView = this.tableView && this.tableView.style.display !== 'none';

        if (isTableView) {
            // Switch to grid view
            this.switchToOverviewView();
            if (this.viewToggleText) {
                this.viewToggleText.textContent = 'Table View';
            }
        } else {
            // Switch to table view
            this.switchToTableView();
            if (this.viewToggleText) {
                this.viewToggleText.textContent = 'Grid View';
            }
        }
    }

    /**
     * Switch to table view
     */
    switchToTableView() {
        this.currentView = 'table';

        if (this.monthlyOverview) {
            this.monthlyOverview.style.display = 'none';
        }

        if (this.studentDetailsPanel) {
            this.studentDetailsPanel.style.display = 'none';
        }

        if (this.tableView) {
            this.tableView.style.display = 'block';
            this.renderTableView();
        }
    }

    /**
     * Render table view
     */
    renderTableView() {
        const tableBody = this.tableView.querySelector('tbody');
        if (!tableBody) return;

        if (this.monthlyData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="2" style="text-align: center; padding: 40px;">
                        <i class="fas fa-table"></i>
                        <p style="margin: 16px 0 8px 0; font-weight: 600;">No Data Available</p>
                        <p style="margin: 0; color: #6c757d;">No monthly admission data to display in table format.</p>
                    </td>
                </tr>
            `;
            return;
        }

        const tableRows = this.monthlyData.map(monthData => `
            <tr>
                <td>${monthData.monthName}</td>
                <td>${monthData.count}</td>
            </tr>
        `).join('');

        // Add total row
        const totalStudents = this.monthlyData.reduce((sum, item) => sum + item.count, 0);
        const totalRow = `
            <tr style="font-weight: bold; background: #f9f9f9;">
                <td>Total</td>
                <td>${totalStudents}</td>
            </tr>
        `;

        tableBody.innerHTML = tableRows + totalRow;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentView === 'details') {
                this.returnToOverview();
            }
        });

        // Handle window resize for responsive behavior
        window.addEventListener('resize', () => {
            // Debounce resize events
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Re-render current view if needed
        if (this.currentView === 'overview') {
            // Refresh grid layout if needed
        } else if (this.currentView === 'details') {
            // Refresh details layout if needed
        }
    }

    /**
     * Set loading state
     */
    setLoading(loading, target = 'overview') {
        this.isLoading = loading;

        if (target === 'overview' && this.monthsGrid) {
            this.monthsGrid.classList.toggle('loading', loading);
        } else if (target === 'students' && this.studentsList) {
            this.studentsList.classList.toggle('loading', loading);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            // Fallback to console
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Refresh data
     */
    async refresh() {
        try {
            await this.loadMonthlyData();

            if (this.currentView === 'overview') {
                this.renderMonthlyOverview();
            } else if (this.currentView === 'details' && this.selectedMonth) {
                await this.loadStudentDetails(this.selectedMonth);
            } else if (this.currentView === 'table') {
                this.renderTableView();
            }

            this.showNotification('Data refreshed successfully', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showError('Failed to refresh data');
        }
    }

    /**
     * Get current view state
     */
    getCurrentState() {
        return {
            view: this.currentView,
            selectedMonth: this.selectedMonth,
            dataCount: this.monthlyData.length
        };
    }

    /**
     * Export current view data
     */
    exportData() {
        if (this.currentView === 'details' && this.studentsData.length > 0) {
            // Export student details
            const monthData = this.monthlyData.find(item => item.month === this.selectedMonth);
            const filename = `Students_${monthData ? monthData.monthName.replace(' ', '_') : 'Unknown'}_${new Date().toISOString().slice(0, 10)}`;

            // Create temporary table for export
            const tempTable = document.createElement('table');
            tempTable.innerHTML = `
                <thead>
                    <tr><th>Student Name</th><th>Course</th><th>Father's Name</th></tr>
                </thead>
                <tbody>
                    ${this.studentsData.map(student => `
                        <tr>
                            <td>${student.name || 'N/A'}</td>
                            <td>${student.courses || 'N/A'}</td>
                            <td>${student.fatherName || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;

            // Export using existing function if available
            if (typeof XLSX !== 'undefined') {
                const wb = XLSX.utils.table_to_book(tempTable, { sheet: "Students" });
                XLSX.writeFile(wb, `${filename}.xlsx`);
            }
        } else {
            // Export monthly overview
            if (typeof exportTableToExcel === 'function') {
                exportTableToExcel('studentAdmissionsTable');
            }
        }
    }
}

// Global instance
let monthlyAdmissionReports = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the reports page and the required elements exist
    if (document.getElementById('monthsGrid')) {
        monthlyAdmissionReports = new MonthlyAdmissionReports();

        // Make it globally available
        window.monthlyAdmissionReports = monthlyAdmissionReports;
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MonthlyAdmissionReports;
}