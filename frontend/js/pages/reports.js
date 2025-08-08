// DOM Elements
const reportPeriod = document.getElementById('reportPeriod');
const customDateRange = document.getElementById('customDateRange');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Chart instances
let revenueChart, studentChart, courseChart, paymentMethodChart;

// Initialize charts
function initializeCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Revenue',
                data: [],
                borderColor: '#3498db',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '₹' + value.toLocaleString()
                    }
                }
            }
        }
    });

    // Student Chart
    const studentCtx = document.getElementById('studentChart').getContext('2d');
    studentChart = new Chart(studentCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'New Students',
                data: [],
                backgroundColor: '#2ecc71'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // Course Chart
    const courseCtx = document.getElementById('courseChart').getContext('2d');
    courseChart = new Chart(courseCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f1c40f',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });

    // Payment Method Chart
    const paymentCtx = document.getElementById('paymentMethodChart').getContext('2d');
    paymentMethodChart = new Chart(paymentCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f1c40f'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Fetch and update data
async function fetchReportData() {
    try {
        const period = reportPeriod.value;
        let url = '/api/reports';
        
        if (period === 'custom') {
            url += `?startDate=${startDate.value}&endDate=${endDate.value}`;
        } else {
            url += `?period=${period}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        updateCharts(data);
        updateTables(data);
    } catch (error) {
        console.error('Error fetching report data:', error);
        showNotification('Error loading report data', 'error');
    }
}

// Update charts with new data
function updateCharts(data) {
    // Update Revenue Chart
    revenueChart.data.labels = data.revenue.labels;
    revenueChart.data.datasets[0].data = data.revenue.values;
    revenueChart.update();

    // Update Student Chart
    studentChart.data.labels = data.students.labels;
    studentChart.data.datasets[0].data = data.students.values;
    studentChart.update();

    // Update Course Chart
    courseChart.data.labels = data.courses.labels;
    courseChart.data.datasets[0].data = data.courses.values;
    courseChart.update();

    // Update Payment Method Chart
    paymentMethodChart.data.labels = data.paymentMethods.labels;
    paymentMethodChart.data.datasets[0].data = data.paymentMethods.values;
    paymentMethodChart.update();
}

// Update tables with new data
function updateTables(data) {
    // Revenue Table
    const revenueTable = document.querySelector('#revenue-tab tbody');
    revenueTable.innerHTML = data.revenue.details.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>₹${item.totalRevenue.toLocaleString()}</td>
            <td>${item.newStudents}</td>
            <td>₹${item.averagePayment.toLocaleString()}</td>
        </tr>
    `).join('');

    // Students Table
    const studentsTable = document.querySelector('#students-tab tbody');
    studentsTable.innerHTML = data.students.details.map(item => `
        <tr>
            <td>${item.course}</td>
            <td>${item.totalStudents}</td>
            <td>${item.activeStudents}</td>
            <td>${item.completionRate}%</td>
        </tr>
    `).join('');

    // Courses Table
    const coursesTable = document.querySelector('#courses-tab tbody');
    coursesTable.innerHTML = data.courses.details.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.enrollments}</td>
            <td>₹${item.revenue.toLocaleString()}</td>
            <td>${item.popularity}%</td>
        </tr>
    `).join('');

    // Payments Table
    const paymentsTable = document.querySelector('#payments-tab tbody');
    paymentsTable.innerHTML = data.paymentMethods.details.map(item => `
        <tr>
            <td>${item.method}</td>
            <td>${item.count}</td>
            <td>₹${item.totalAmount.toLocaleString()}</td>
            <td>${item.percentage}%</td>
        </tr>
    `).join('');
}

// Tab switching
function switchTab(tabName) {
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// Export report
function exportReport(format) {
    const period = reportPeriod.value;
    let url = `/api/reports/export?format=${format}`;
    
    if (period === 'custom') {
        url += `&startDate=${startDate.value}&endDate=${endDate.value}`;
    } else {
        url += `&period=${period}`;
    }

    window.location.href = url;
}

// Event Listeners
// reportPeriod.addEventListener('change', () => {
//     customDateRange.style.display = reportPeriod.value === 'custom' ? 'flex' : 'none';
//     fetchReportData();
// });

// startDate.addEventListener('change', fetchReportData);
// endDate.addEventListener('change', fetchReportData);

// tabButtons.forEach(btn => {
//     btn.addEventListener('click', () => switchTab(btn.dataset.tab));
// });

// === Mobile Menu Functionality ===
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const sidePanel = document.querySelector('.side-panel');
    
    if (mobileMenuToggle && mobileMenuOverlay && sidePanel) {
        // Toggle mobile menu
        mobileMenuToggle.addEventListener('click', function() {
            sidePanel.classList.toggle('mobile-active');
            mobileMenuOverlay.classList.toggle('active');
            document.body.classList.toggle('mobile-menu-open');
        });
        
        // Close menu when overlay is clicked
        mobileMenuOverlay.addEventListener('click', function() {
            sidePanel.classList.remove('mobile-active');
            mobileMenuOverlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
        });
        
        // Close menu when a navigation item is clicked (on mobile)
        const tabButtons = sidePanel.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    sidePanel.classList.remove('mobile-active');
                    mobileMenuOverlay.classList.remove('active');
                    document.body.classList.remove('mobile-menu-open');
                }
            });
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Only load the charts/tables that exist in the current HTML
    loadStudentAdmissions();
    loadMonthlyPayments();
    loadPendingFees();
    // loadEnquirySummary(); // Only if you add this table to the HTML
    
    // Students by month picker
    const monthPicker = document.getElementById('studentsMonthPicker');
    if (monthPicker) {
        monthPicker.value = getCurrentMonthString();
        loadStudentsByMonth();
        monthPicker.addEventListener('change', loadStudentsByMonth);
    }
    
    // Pending fees month picker
    const pendingFeesMonthPicker = document.getElementById('pendingFeesMonthPicker');
    if (pendingFeesMonthPicker) {
        pendingFeesMonthPicker.value = getCurrentMonthString();
        pendingFeesMonthPicker.addEventListener('change', loadPendingFeesByMonth);
    }
});

// Enhanced notification system
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles for the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Reports.js - Professional Reports Dashboard
const API_BASE = `${window.location.protocol}//localhost:4455/api/reports`;

// Global pagination instances for reports
let studentAdmissionsPagination = null;
let monthlyPaymentsPagination = null;
let pendingFeesPagination = null;
let studentsByMonthPagination = null;

// Initialize student admissions pagination
function initializeStudentAdmissionsPagination() {
    studentAdmissionsPagination = new TablePagination({
        containerId: 'student-admissions-container',
        tableId: 'studentAdmissionsTable',
        data: [],
        pageSize: 10,
        renderRow: (row, index) => `<tr><td>${row.month}</td><td>${row.count}</td></tr>`
    });
    
    window.student_admissions_containerPagination = studentAdmissionsPagination;
}

// 1. Monthly Student Admissions
async function loadStudentAdmissions() {
    try {
        const res = await fetch(`${API_BASE}/monthly-student-admissions`);
        if (!res.ok) throw new Error('Failed to fetch data');
        
        const data = await res.json();
        const labels = data.map(row => row.month);
        const counts = data.map(row => row.count);
        
        // Chart
        renderBarChart('studentAdmissionsChart', labels, counts, 'New Students');
        
        // Initialize pagination if not already done
        if (!studentAdmissionsPagination) {
            initializeStudentAdmissionsPagination();
        }
        
        // Add total row to data
        const total = counts.reduce((sum, val) => sum + val, 0);
        const dataWithTotal = [...data, { month: 'Total', count: total, isTotal: true }];
        
        // Update pagination with new data
        studentAdmissionsPagination.updateData(dataWithTotal);
        
    } catch (error) {
        console.error('Error loading student admissions:', error);
        if (!studentAdmissionsPagination) {
            initializeStudentAdmissionsPagination();
        }
        studentAdmissionsPagination.updateData([{ month: 'Error loading data', count: 'Please check server', isError: true }]);
        showNotification('Error loading student admissions data', 'error');
    }
}

// Initialize monthly payments pagination
function initializeMonthlyPaymentsPagination() {
    monthlyPaymentsPagination = new TablePagination({
        containerId: 'monthly-payments-container',
        tableId: 'monthlyPaymentsTable',
        data: [],
        pageSize: 10,
        renderRow: (row, index) => `<tr><td>${row.month}</td><td>₹${row.totalPayments.toLocaleString('en-IN', {minimumFractionDigits:2})}</td></tr>`
    });
    
    window.monthly_payments_containerPagination = monthlyPaymentsPagination;
}

// 2. Monthly Payments Collected
async function loadMonthlyPayments() {
    try {
        const res = await fetch(`${API_BASE}/monthly-payments`);
        if (!res.ok) throw new Error('Failed to fetch data');
        
        const data = await res.json();
        const labels = data.map(row => row.month);
        const totals = data.map(row => row.totalPayments);
        
        // Chart
        renderBarChart('monthlyPaymentsChart', labels, totals, 'Total Payments (₹)');
        
        // Initialize pagination if not already done
        if (!monthlyPaymentsPagination) {
            initializeMonthlyPaymentsPagination();
        }
        
        // Update pagination with new data
        monthlyPaymentsPagination.updateData(data);
        
    } catch (error) {
        console.error('Error loading monthly payments:', error);
        if (!monthlyPaymentsPagination) {
            initializeMonthlyPaymentsPagination();
        }
        monthlyPaymentsPagination.updateData([{ month: 'Error loading data', totalPayments: 0, isError: true }]);
        showNotification('Error loading monthly payments data', 'error');
    }
}

// Initialize pending fees pagination
function initializePendingFeesPagination() {
    pendingFeesPagination = new TablePagination({
        containerId: 'pending-fees-container',
        tableId: 'pendingFeesTable',
        data: [],
        pageSize: 10,
        renderRow: (row, index) => {
            if (row.isTotal) {
                return `<tr style='font-weight:bold;background:#f9f9f9;'><td colspan='3' style='text-align:right;'>Total Pending Fees</td><td>₹${row.totalAmount.toLocaleString('en-IN', {minimumFractionDigits:2})}</td></tr>`;
            }
            const admissionDate = row.admissionDate ? new Date(row.admissionDate).toLocaleDateString('en-IN') : 'N/A';
            return `<tr><td>${row.studentName}</td><td>${row.course}</td><td>₹${row.pendingAmount}</td><td>${admissionDate}</td></tr>`;
        },
        searchFilter: (row, searchTerm) => {
            if (row.isTotal) return false; // Don't include total row in search
            const term = searchTerm.toLowerCase();
            return (row.studentName && row.studentName.toLowerCase().includes(term)) ||
                   (row.course && row.course.toLowerCase().includes(term)) ||
                   (row.pendingAmount && row.pendingAmount.toString().includes(term));
        }
    });
    
    window.pending_fees_containerPagination = pendingFeesPagination;
}

// 3. Pending Fees
async function loadPendingFees() {
    try {
        const res = await fetch(`${API_BASE}/pending-fees`);
        if (!res.ok) throw new Error('Failed to fetch data');
        
        const data = await res.json();
        const countDiv = document.getElementById('pendingFeesCount');
        
        // Initialize pagination if not already done
        if (!pendingFeesPagination) {
            initializePendingFeesPagination();
        }
        
        if (data.length) {
            let total = data.reduce((sum, row) => sum + Number(row.pendingAmount), 0);
            
            // Add total row to data
            const dataWithTotal = [...data, { 
                studentName: 'Total Pending Fees', 
                course: '', 
                pendingAmount: '', 
                admissionDate: '', 
                totalAmount: total, 
                isTotal: true 
            }];
            
            pendingFeesPagination.updateData(dataWithTotal);
            countDiv.textContent = `Total Students with Pending Fees: ${data.length}`;
        } else {
            pendingFeesPagination.updateData([]);
            countDiv.textContent = 'Total Students with Pending Fees: 0';
        }
    } catch (error) {
        console.error('Error loading pending fees:', error);
        if (!pendingFeesPagination) {
            initializePendingFeesPagination();
        }
        pendingFeesPagination.updateData([]);
        const countDiv = document.getElementById('pendingFeesCount');
        countDiv.textContent = 'Error loading pending fees data';
        showNotification('Error loading pending fees data', 'error');
    }
}

// 3.1. Pending Fees by Month
async function loadPendingFeesByMonth() {
    const month = document.getElementById('pendingFeesMonthPicker').value;
    const countDiv = document.getElementById('pendingFeesCount');
    
    if (!month) {
        await loadPendingFees();
        return;
    }
    
    // Initialize pagination if not already done
    if (!pendingFeesPagination) {
        initializePendingFeesPagination();
    }
    
    // Show loading state
    pendingFeesPagination.updateData([{ studentName: 'Loading...', course: '', pendingAmount: '', admissionDate: '' }]);
    countDiv.textContent = '';
    
    try {
        const response = await fetch(`${API_BASE}/pending-fees-by-month?month=${month}`);
        const data = await response.json();
        
        if (data.length) {
            let total = data.reduce((sum, row) => sum + Number(row.pendingAmount), 0);
            
            // Add total row to data
            const dataWithTotal = [...data, { 
                studentName: 'Total Pending Fees', 
                course: '', 
                pendingAmount: '', 
                admissionDate: '', 
                totalAmount: total, 
                isTotal: true 
            }];
            
            pendingFeesPagination.updateData(dataWithTotal);
            countDiv.textContent = `Students with Pending Fees (${month}): ${data.length}`;
        } else {
            pendingFeesPagination.updateData([]);
            countDiv.textContent = `Students with Pending Fees (${month}): 0`;
        }
    } catch (err) {
        pendingFeesPagination.updateData([]);
        countDiv.textContent = 'Error loading data';
    }
}

// 4. Enquiry Summary
async function loadEnquirySummary() {
    const res = await fetch(`${API_BASE}/monthly-enquiries`);
    const data = await res.json();
    const tbody = document.querySelector('#enquirySummaryTable tbody');
    tbody.innerHTML = data.map(row => `<tr><td>${row.month}</td><td>${row.totalEnquiries}</td></tr>`).join('');
}

// Chart.js Bar Chart Helper
function renderBarChart(canvasId, labels, data, label) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (window[canvasId + '_chart']) window[canvasId + '_chart'].destroy();
    window[canvasId + '_chart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label,
                data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 6,
                maxBarThickness: 32
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: '#eee' } }
            }
        }
    });
}

// Excel Export Helper
function exportTableToExcel(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const wb = XLSX.utils.table_to_book(table, {sheet: "Report"});
    XLSX.writeFile(wb, `${tableId}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// === Students By Month Feature ===
function getCurrentMonthString() {
    const now = new Date();
    return now.toISOString().slice(0, 7); // 'YYYY-MM'
}

// Initialize students by month pagination
function initializeStudentsByMonthPagination() {
    studentsByMonthPagination = new TablePagination({
        containerId: 'students-by-month-container',
        tableId: 'studentsByMonthTable',
        data: [],
        pageSize: 10,
        renderRow: (student, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${student.name || ''}</td>
                <td>${student.fatherName || ''}</td>
                <td>${student.courses || ''}</td>
            </tr>
        `,
        searchFilter: (student, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return (student.name && student.name.toLowerCase().includes(term)) ||
                   (student.fatherName && student.fatherName.toLowerCase().includes(term)) ||
                   (student.courses && student.courses.toLowerCase().includes(term));
        }
    });
    
    window.students_by_month_containerPagination = studentsByMonthPagination;
}

async function loadStudentsByMonth() {
    const month = document.getElementById('studentsMonthPicker').value;
    const countDiv = document.getElementById('studentsByMonthCount');
    
    // Initialize pagination if not already done
    if (!studentsByMonthPagination) {
        initializeStudentsByMonthPagination();
    }
    
    // Show loading state
    studentsByMonthPagination.updateData([{ name: 'Loading...', fatherName: '', courses: '' }]);
    countDiv.textContent = '';
    
    try {
        const response = await fetch(`${API_BASE}/students-by-month?month=${month}`);
        const students = await response.json();
        
        if (students.length === 0) {
            studentsByMonthPagination.updateData([]);
            countDiv.textContent = 'Total Students: 0';
            return;
        }
        
        countDiv.textContent = `Total Students: ${students.length}`;
        studentsByMonthPagination.updateData(students);
        
    } catch (err) {
        studentsByMonthPagination.updateData([]);
        countDiv.textContent = 'Error loading data';
    }
}
window.loadStudentsByMonth = loadStudentsByMonth;
window.loadPendingFeesByMonth = loadPendingFeesByMonth;

// Export all reports function
function exportAllReports() {
    const tables = [
        { id: 'studentAdmissionsTable', name: 'Student_Admissions' },
        { id: 'monthlyPaymentsTable', name: 'Monthly_Payments' },
        { id: 'pendingFeesTable', name: 'Pending_Fees' },
        { id: 'studentsByMonthTable', name: 'Students_By_Month' }
    ];
    
    tables.forEach(table => {
        const tableElement = document.getElementById(table.id);
        if (tableElement && tableElement.querySelector('tbody').children.length > 0) {
            setTimeout(() => {
                exportTableToExcel(table.id, table.name);
            }, 500);
        }
    });
    
    showNotification('All available reports are being exported...', 'success');
}

// Enhanced export function with custom filename
function exportTableToExcel(tableId, customName = null) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const filename = customName || tableId;
    const wb = XLSX.utils.table_to_book(table, {sheet: "Report"});
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// Make functions globally available
window.exportAllReports = exportAllReports;
window.exportTableToExcel = exportTableToExcel;