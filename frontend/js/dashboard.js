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
const API_BASE = 'https://aalekhapi.sahaedu.in';

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
            loadEnrollmentChart(e.target.value);
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
        loadEnrollmentChart(30),
        loadRevenueChart('monthly')
    ]);
}

// Load enrollment chart
async function loadEnrollmentChart(period = 30) {
    try {
        const response = await fetch(`${API_BASE}/api/dashboard/enrollment-trend?period=${period}`);
        if (!response.ok) {
            throw new Error('Failed to fetch enrollment data');
        }
        
        const enrollmentData = await response.json();
        
        // Update chart
        updateEnrollmentChart(enrollmentData);
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
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'New Students',
                data: chartData.data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5
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
            },
            elements: {
                point: {
                    hoverRadius: 8
                }
            }
        }
    });
}

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