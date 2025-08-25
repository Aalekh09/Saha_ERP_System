/**
 * SIMT Student Management System - Core Application
 * Main application initialization and configuration
 */

class App {
    constructor() {
        this.config = {
            API_BASE_URL: 'http://localhost:4455',
            VERSION: '2.0',
            DEBUG: false
        };

        this.init();
    }

    init() {
        this.checkAuthentication();
        this.initializeComponents();
        this.setupGlobalEventListeners();
        this.loadInitialData();
    }

    checkAuthentication() {
        if (!localStorage.getItem('isLoggedIn')) {
            window.location.replace('login.html');
            throw new Error('Not logged in');
        }

        // Set username
        const username = localStorage.getItem('username');
        if (username) {
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = username;
            }
        }
    }

    initializeComponents() {
        // Initialize core components
        this.navigation = new NavigationManager();
        this.notification = new NotificationManager();

        // Initialize feature modules based on current page
        if (document.getElementById('studentsTable')) {
            this.studentManager = new StudentManager();
        }

        if (document.getElementById('paymentsTable')) {
            this.paymentManager = new PaymentManager();
        }

        if (document.getElementById('teachersTableBody')) {
            this.teacherManager = new TeacherManager();
        }
    }

    setupGlobalEventListeners() {
        // Global error handling
        window.addEventListener('error', (e) => {
            if (this.config.DEBUG) {
                console.error('Global error:', e.error);
            }
            this.notification.error('An unexpected error occurred');
        });

        // Logout functionality
        this.setupLogoutButton();
    }

    setupLogoutButton() {
        const header = document.querySelector('header');
        if (header && !header.querySelector('.logout-btn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'Logout';
            logoutBtn.className = 'logout-btn';
            logoutBtn.onclick = () => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                window.location.href = 'login.html';
            };
            header.appendChild(logoutBtn);
        }
    }

    loadInitialData() {
        // Load data based on active tab
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            const tabId = activeTab.getAttribute('data-tab');
            this.navigation.loadTabData(tabId);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Export for global access
window.App = App;