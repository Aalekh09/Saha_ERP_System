// Dashboard JavaScript
// Check if user is logged in
if (!localStorage.getItem('isLoggedIn')) {
    window.location.replace('login.html');
    throw new Error('Not logged in');
}

// Set username from localStorage
const username = localStorage.getItem('username');
if (username) {
    document.getElementById('username').textContent = username;
}

// Dynamic API base URL
const API_BASE = 'http://aalekhapi.sahaedu.in';

// Dashboard state
let dashboardData = {
    kpis: null,
    enrollmentChart: null,
    revenueChart: null,
    recentActivity: null
};

// Chart instances
let enrollmentChartInstance = null;
let revenueChartInstance = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    initializeThemeToggle();
    initializeDashboard();
    setupEventListeners();
});

// === Theme Toggle Functionality ===
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('i');
    
    // Get saved theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    // Add click event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Apply new theme
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme, themeIcon);
            
            // Show notification (if available)
            console.log(`Switched to ${newTheme} mode`);
        });
    }
}

function updateThemeIcon(theme, iconElement) {
    if (!iconElement) return;
    
    if (theme === 'dark') {
        iconElement.className = 'fas fa-sun';
        iconElement.parentElement.title = 'Switch to Light Mode';
    } else {
        iconElement.className = 'fas fa-moon';
        iconElement.parentElement.title = 'Switch to Dark Mode';
    }
}

// Initialize mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const sidePanel = document.getElementById('sidePanel');

    if (mobileMenuToggle && mobileMenuOverlay && sidePanel) {
        mobileMenuToggle.addEventListener('click', function() {
            sidePanel.classList.toggle('mobile-active');
            mobileMenuOverlay.classList.toggle('active');
            document.body.classList.toggle('mobile-menu-open');
        });

        mobileMenuOverlay.addEventListener('click', function() {
            sidePanel.classList.remove('mobile-active');
            mobileMenuOverlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
        });

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

// Initialize dashboard
async function initializeDashboard() {
    showLoadingState();
    
    try {
        await Promise.all([
            loadKPIData(),
            loadChartData(),
            loadRecentActivity()
        ]);
        
        updateLastUpdatedTime();
        hideLoadingState();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showErrorState();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboard);
    }
    
    // Chart period selectors
    const enrollmentPeriod = document.getElementById('enrollmentPeriod');
    if (enrollmentPeriod) {
        enrollmentPeriod.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'monthly') {
                loadEnrollmentChart('monthly');
            } else if (val === 'daily-7') {
                loadEnrollmentChart(7);
            } else if (val === 'daily-30') {
                loadEnrollmentChart(30);
            } else {
                loadEnrollmentChart(30);
            }
        });
    }
    
    const revenuePeriod = document.getElementById('revenuePeriod');
    if (revenuePeriod) {
        revenuePeriod.addEventListener('change', (e) => {
            loadRevenueChart(e.target.value);
        });
    }
    
    // Auto-refresh every 30 seconds
    setInterval(refreshDashboard, 30000);
}

// Load KPI data
async function loadKPIData() {
    try {
        const response = await fetch(`${API_BASE}/api/dashboard/kpis`);
        if (!response.ok) {
            throw new Error('Failed to fetch KPI data');
        }
        
        const kpis = await response.json();
        
        // Update KPI widgets
        updateKPIWidgets(kpis);
        
        dashboardData.kpis = kpis;
    } catch (error) {
        console.error('Error loading KPI data:', error);
        showKPIError();
    }
}



// Update KPI widgets
function updateKPIWidgets(kpis) {
    // Total Students
    const totalStudentsEl = document.getElementById('totalStudents');
    const studentsTrendEl = document.getElementById('studentsTrend');
    if (totalStudentsEl && studentsTrendEl) {
        totalStudentsEl.innerHTML = kpis.totalStudents.count.toLocaleString();
        studentsTrendEl.innerHTML = `
            <i class="fas fa-arrow-${kpis.totalStudents.trendDirection === 'up' ? 'up' : 'down'}"></i>
            <span>${kpis.totalStudents.trend}</span>
        `;
        studentsTrendEl.className = `kpi-trend ${kpis.totalStudents.trendDirection === 'up' ? 'positive' : 'negative'}`;
    }
    
    // Monthly Revenue
    const monthlyRevenueEl = document.getElementById('monthlyRevenue');
    const revenueTrendEl = document.getElementById('revenueTrend');
    if (monthlyRevenueEl && revenueTrendEl) {
        monthlyRevenueEl.innerHTML = `₹${kpis.monthlyRevenue.amount.toLocaleString()}`;
        revenueTrendEl.innerHTML = `
            <i class="fas fa-arrow-${kpis.monthlyRevenue.trendDirection === 'up' ? 'up' : 'down'}"></i>
            <span>${kpis.monthlyRevenue.trend}</span>
        `;
        revenueTrendEl.className = `kpi-trend ${kpis.monthlyRevenue.trendDirection === 'up' ? 'positive' : 'negative'}`;
    }
    
    // Pending Fees
    const pendingFeesEl = document.getElementById('pendingFees');
    const pendingTrendEl = document.getElementById('pendingTrend');
    if (pendingFeesEl && pendingTrendEl) {
        pendingFeesEl.innerHTML = `₹${kpis.pendingFees.amount.toLocaleString()}`;
        pendingTrendEl.innerHTML = `
            <i class="fas fa-arrow-${kpis.pendingFees.trendDirection === 'up' ? 'up' : 'down'}"></i>
            <span>${kpis.pendingFees.trend}</span>
        `;
        pendingTrendEl.className = `kpi-trend ${kpis.pendingFees.trendDirection === 'up' ? 'negative' : 'positive'}`;
    }
    
    // New Enquiries
    const newEnquiriesEl = document.getElementById('newEnquiries');
    const enquiriesTrendEl = document.getElementById('enquiriesTrend');
    if (newEnquiriesEl && enquiriesTrendEl) {
        newEnquiriesEl.innerHTML = kpis.newEnquiries.count.toLocaleString();
        enquiriesTrendEl.innerHTML = `
            <i class="fas fa-arrow-${kpis.newEnquiries.trendDirection === 'up' ? 'up' : 'down'}"></i>
            <span>${kpis.newEnquiries.trend}</span>
        `;
        enquiriesTrendEl.className = `kpi-trend ${kpis.newEnquiries.trendDirection === 'up' ? 'positive' : 'negative'}`;
    }
}

// Load chart data
async function loadChartData() {
    await Promise.all([
        loadEnrollmentChart('monthly'),
        loadRevenueChart('monthly')
    ]);
}

// Load enrollment chart
async function loadEnrollmentChart(period = 'monthly') {
    try {
        let chartPayload;
        if (period === 'monthly') {
            // Aggregate students per month for last 12 months
            const res = await fetch(`${API_BASE}/api/students`);
            const students = res.ok ? await res.json() : [];
            const map = new Map();
            const now = new Date();
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
                map.set(key, 0);
            }
            students.forEach(s => {
                if (!s.admissionDate) return;
                const key = s.admissionDate.slice(0,7);
                if (map.has(key)) map.set(key, map.get(key) + 1);
            });
            const labels = Array.from(map.keys()).map(k => monthLabelFromKey(k));
            const data = Array.from(map.values());
            chartPayload = { labels, data, keys: Array.from(map.keys()) };
        } else {
            const response = await fetch(`${API_BASE}/api/dashboard/enrollment-trend?period=${period}`);
            if (!response.ok) {
                throw new Error('Failed to fetch enrollment data');
            }
            const enrollmentData = await response.json();
            chartPayload = enrollmentData;
        }
        
        // Update chart
        updateEnrollmentChart(chartPayload);
    } catch (error) {
        console.error('Error loading enrollment chart:', error);
        showChartError('enrollmentChart');
    }
}

// Load revenue chart
async function loadRevenueChart(period = 'monthly') {
    try {
        const response = await fetch(`${API_BASE}/api/dashboard/revenue-overview?period=${period}`);
        if (!response.ok) {
            throw new Error('Failed to fetch revenue data');
        }
        
        const revenueData = await response.json();
        
        // Update chart
        updateRevenueChart(revenueData);
    } catch (error) {
        console.error('Error loading revenue chart:', error);
        showChartError('revenueChart');
    }
}

// These functions are no longer needed as data comes from API

// Update enrollment chart
function updateEnrollmentChart(chartData) {
    const ctx = document.getElementById('enrollmentChart').getContext('2d');
    
    if (enrollmentChartInstance) {
        enrollmentChartInstance.destroy();
    }
    
    enrollmentChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'New Students',
                data: chartData.data,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3b82f6',
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false,
                maxBarThickness: 32
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `New Students: ${ctx.parsed.y}`
                    }
                }
            },
            onClick: async (evt, elements) => {
                if (!elements || !elements.length) return;
                const element = elements[0];
                const index = element.index;
                const label = chartData.labels[index];
                const count = chartData.data[index];
                // If monthly aggregation present, use its key to filter; else fallback to day
                const monthKey = chartData.keys ? chartData.keys[index] : null;
                await showEnrollmentDetails(label, monthKey, count);
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Convert label like "Aug 31" to approximate ISO date for current year
function approximateIsoFromLabel(label) {
    try {
        const [monStr, dayStr] = label.split(' ');
        const monthMap = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };
        const month = monthMap[monStr];
        const day = parseInt(dayStr, 10);
        const now = new Date();
        const year = now.getFullYear();
        const d = new Date(year, month, day);
        // If date is in the future (period spanning last year), subtract one year
        if (d > now) d.setFullYear(year - 1);
        const iso = d.toISOString().slice(0, 10);
        return iso;
    } catch (e) {
        return null;
    }
}

// Convert YYYY-MM to short month label like 'Apr'
function monthLabelFromKey(key) {
    try {
        const parts = key.split('-');
        if (parts.length !== 2) return key;
        const monthIndex = parseInt(parts[1], 10) - 1;
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return months[Math.max(0, Math.min(11, monthIndex))];
    } catch (e) {
        return key;
    }
}

// Fetch students for the selected date/month and show details modal
async function showEnrollmentDetails(label, periodKey, count) {
    try {
        let studentsForSelection = [];
        if (periodKey) {
            const res = await fetch(`${API_BASE}/api/students`);
            if (res.ok) {
                const allStudents = await res.json();
                // If key looks like YYYY-MM, filter by month; else exact date
                if (/^\d{4}-\d{2}$/.test(periodKey)) {
                    studentsForSelection = allStudents.filter(s => s.admissionDate && s.admissionDate.startsWith(periodKey));
                } else {
                    studentsForSelection = allStudents.filter(s => s.admissionDate === periodKey);
                }
            }
        }
        const modal = document.getElementById('enrollmentDetailsModal');
        const title = document.getElementById('enrollmentDetailsTitle');
        const list = document.getElementById('enrollmentDetailsList');
        const meta = document.getElementById('enrollmentDetailsMeta');
        if (modal && title && list && meta) {
            title.textContent = `Enrollments — ${label}`;
            meta.textContent = `${count} student(s)`;
            if (studentsForSelection.length) {
                list.innerHTML = studentsForSelection.map(s => `<li>${s.name || 'Student'} — ${s.courses || ''}</li>`).join('');
            } else {
                list.innerHTML = `<li>No detailed records available.</li>`;
            }
            modal.style.display = 'block';
        }
    } catch (err) {
        console.error('Failed to load enrollment details', err);
    }
}

// Close modal helper
function closeEnrollmentDetailsModal() {
    const modal = document.getElementById('enrollmentDetailsModal');
    if (modal) modal.style.display = 'none';
}

// Expose close function
window.closeEnrollmentDetailsModal = closeEnrollmentDetailsModal;

// Update revenue chart
function updateRevenueChart(chartData) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }
    
    revenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Revenue',
                data: chartData.data,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: '#10b981',
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false
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
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const response = await fetch(`${API_BASE}/api/dashboard/recent-activity?limit=10`);
        if (!response.ok) {
            throw new Error('Failed to fetch recent activity');
        }
        
        const data = await response.json();
        const activities = data.activities || [];
        
        updateRecentActivity(activities);
        dashboardData.recentActivity = activities;
    } catch (error) {
        console.error('Error loading recent activity:', error);
        showActivityError();
    }
}

// Activity data now comes from API

// Update recent activity
function updateRecentActivity(activities) {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    if (activities.length === 0) {
        activityList.innerHTML = `
            <div class="activity-empty">
                <i class="fas fa-inbox"></i>
                <p>No recent activity</p>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item" onclick="handleActivityClick('${activity.type}', ${activity.id})">
            <div class="activity-icon ${activity.type}">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// Handle activity click
function handleActivityClick(type, id) {
    switch (type) {
        case 'student':
            window.location.href = 'index.html';
            break;
        case 'payment':
            window.location.href = 'index.html#payments-panel';
            break;
        case 'enquiry':
            window.location.href = 'enquiry.html';
            break;
        case 'certificate':
            window.location.href = 'certificate.html';
            break;
        default:
            console.log('Unknown activity type:', type);
    }
}

// Quick action functions
function navigateToAddStudent() {
    window.location.href = 'index.html#add-panel';
}

function navigateToEnquiry() {
    window.location.href = 'enquiry.html';
}

function openPaymentModal() {
    // This would need to be implemented based on your existing payment modal
    window.location.href = 'index.html#payments-panel';
}

function navigateToCertificate() {
    window.location.href = 'certificate.html';
}

// Refresh dashboard
async function refreshDashboard() {
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.classList.add('loading');
    }
    
    try {
        await initializeDashboard();
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    } finally {
        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
        }
    }
}

// Update last updated time
function updateLastUpdatedTime() {
    const lastUpdatedEl = document.getElementById('lastUpdated');
    if (lastUpdatedEl) {
        lastUpdatedEl.textContent = new Date().toLocaleTimeString();
    }
}

// Show loading state
function showLoadingState() {
    // KPI widgets already have loading skeletons
    // Charts will show loading when they're being rendered
}

// Hide loading state
function hideLoadingState() {
    // Remove any loading indicators
}

// Show error states
function showErrorState() {
    console.error('Dashboard failed to load');
}

function showKPIError() {
    // Show error in KPI widgets
    const kpiValues = document.querySelectorAll('.kpi-value');
    kpiValues.forEach(el => {
        el.innerHTML = '<span style="color: #ef4444;">Error</span>';
    });
}

function showChartError(chartId) {
    const chartContainer = document.querySelector(`#${chartId}`).parentElement;
    chartContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #6b7280;">
            <div style="text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load chart data</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Retry
                </button>
            </div>
        </div>
    `;
}

function showActivityError() {
    const activityList = document.getElementById('recentActivity');
    if (activityList) {
        activityList.innerHTML = `
            <div class="activity-empty">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load recent activity</p>
                <button onclick="loadRecentActivity()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}