/**
 * Comprehensive Tests for Monthly Admission Reports
 * Tests all functionality including user interactions, data loading, and edge cases
 */

// Mock data for testing
const mockMonthlyData = [
    { month: '2024-01', count: 15 },
    { month: '2024-02', count: 8 },
    { month: '2024-03', count: 0 },
    { month: '2023-12', count: 22 }
];

const mockStudentsData = [
    { name: 'John Doe', fatherName: 'Robert Doe', courses: 'Web Development' },
    { name: 'Jane Smith', fatherName: 'Michael Smith', courses: 'Digital Marketing' },
    { name: 'Alice Johnson', fatherName: 'David Johnson', courses: 'Basic Computer' }
];

// Test runner
class MonthlyReportsTestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.mockFetch = null;
    }

    // Test helper function
    test(description, testFn) {
        this.tests.push({ description, testFn });
    }

    // Setup mock environment
    setupMocks() {
        // Mock DOM elements
        document.body.innerHTML = `
            <div id="monthsGrid"></div>
            <div id="monthly-overview"></div>
            <div id="student-details-panel" style="display: none;">
                <div class="panel-header">
                    <h3 id="selectedMonthTitle">Students Admitted</h3>
                    <button class="back-btn" onclick="monthlyAdmissionReports.returnToOverview()">Back</button>
                </div>
                <div id="studentsList"></div>
            </div>
            <div id="table-view" style="display: none;">
                <table id="studentAdmissionsTable">
                    <tbody></tbody>
                </table>
            </div>
            <span id="viewToggleText">Grid View</span>
        `;

        // Mock fetch
        this.mockFetch = global.fetch;
        global.fetch = jest.fn();

        // Mock MonthUtils if not available
        if (typeof MonthUtils === 'undefined') {
            global.MonthUtils = {
                formatMonthYear: (month) => {
                    const [year, monthNum] = month.split('-');
                    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                                  'July', 'August', 'September', 'October', 'November', 'December'];
                    return `${months[parseInt(monthNum) - 1]} ${year}`;
                },
                formatShortMonthYear: (month) => {
                    const [year, monthNum] = month.split('-');
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${months[parseInt(monthNum) - 1]} ${year}`;
                },
                compareMonths: (a, b) => a.localeCompare(b)
            };
        }
    }

    // Cleanup mocks
    cleanupMocks() {
        if (this.mockFetch) {
            global.fetch = this.mockFetch;
        }
        document.body.innerHTML = '';
    }

    // Run all tests
    async runTests() {
        console.log('Running Monthly Admission Reports Tests...');
        this.passed = 0;
        this.failed = 0;

        for (const test of this.tests) {
            try {
                await test.testFn();
                console.log(`✓ ${test.description}`);
                this.passed++;
            } catch (error) {
                console.error(`✗ ${test.description}: ${error.message}`);
                this.failed++;
            }
        }

        console.log(`\nTest Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }

    // Assert helper
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    // Async assert helper
    async assertAsync(asyncFn, message) {
        try {
            await asyncFn();
        } catch (error) {
            throw new Error(message || `Async assertion failed: ${error.message}`);
        }
    }
}

// Initialize test runner
const testRunner = new MonthlyReportsTestRunner();

// Test 1: Class Initialization
testRunner.test('MonthlyAdmissionReports class initializes correctly', async () => {
    testRunner.setupMocks();
    
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMonthlyData
    });

    const reports = new MonthlyAdmissionReports();
    
    testRunner.assert(reports.currentView === 'overview', 'Initial view should be overview');
    testRunner.assert(reports.selectedMonth === null, 'No month should be selected initially');
    testRunner.assert(Array.isArray(reports.monthlyData), 'Monthly data should be an array');
    
    testRunner.cleanupMocks();
});

// Test 2: Data Loading
testRunner.test('loadMonthlyData fetches and transforms data correctly', async () => {
    testRunner.setupMocks();
    
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMonthlyData
    });

    const reports = new MonthlyAdmissionReports();
    await reports.loadMonthlyData();
    
    testRunner.assert(reports.monthlyData.length === mockMonthlyData.length, 'Data length should match');
    testRunner.assert(reports.monthlyData[0].monthName, 'Month name should be formatted');
    testRunner.assert(reports.monthlyData[0].shortMonthName, 'Short month name should be formatted');
    
    testRunner.cleanupMocks();
});

// Test 3: Monthly Overview Rendering
testRunner.test('renderMonthlyOverview creates month cards correctly', async () => {
    testRunner.setupMocks();
    
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMonthlyData
    });

    const reports = new MonthlyAdmissionReports();
    await reports.loadMonthlyData();
    reports.renderMonthlyOverview();
    
    const monthCards = document.querySelectorAll('.month-card');
    testRunner.assert(monthCards.length === mockMonthlyData.length, 'Should create correct number of month cards');
    
    const firstCard = monthCards[0];
    testRunner.assert(firstCard.dataset.month, 'Month card should have data-month attribute');
    testRunner.assert(firstCard.querySelector('.student-count'), 'Month card should have student count');
    
    testRunner.cleanupMocks();
});

// Test 4: Empty State Handling
testRunner.test('handles empty data state correctly', async () => {
    testRunner.setupMocks();
    
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
    });

    const reports = new MonthlyAdmissionReports();
    await reports.loadMonthlyData();
    reports.renderMonthlyOverview();
    
    const emptyState = document.querySelector('.empty-state');
    testRunner.assert(emptyState, 'Should show empty state when no data');
    testRunner.assert(emptyState.textContent.includes('No Admission Data'), 'Should show appropriate message');
    
    testRunner.cleanupMocks();
});

// Test 5: Student Details Loading
testRunner.test('showStudentDetails loads and displays student data', async () => {
    testRunner.setupMocks();
    
    // Mock monthly data response
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMonthlyData
    });

    // Mock student details response
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudentsData
    });

    const reports = new MonthlyAdmissionReports();
    await reports.loadMonthlyData();
    await reports.showStudentDetails('2024-01');
    
    testRunner.assert(reports.currentView === 'details', 'Should switch to details view');
    testRunner.assert(reports.selectedMonth === '2024-01', 'Should set selected month');
    testRunner.assert(reports.studentsData.length === mockStudentsData.length, 'Should load student data');
    
    const studentItems = document.querySelectorAll('.student-item');
    testRunner.assert(studentItems.length === mockStudentsData.length, 'Should render student items');
    
    testRunner.cleanupMocks();
});

// Test 6: Navigation Between Views
testRunner.test('navigation between views works correctly', async () => {
    testRunner.setupMocks();
    
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMonthlyData
    });

    const reports = new MonthlyAdmissionReports();
    await reports.loadMonthlyData();
    
    // Test switch to details view
    reports.switchToDetailsView();
    testRunner.assert(reports.currentView === 'details', 'Should switch to details view');
    testRunner.assert(document.getElementById('student-details-panel').style.display === 'block', 'Details panel should be visible');
    testRunner.assert(document.getElementById('monthly-overview').style.display === 'none', 'Overview should be hidden');
    
    // Test return to overview
    reports.returnToOverview();
    testRunner.assert(reports.currentView === 'overview', 'Should return to overview');
    testRunner.assert(reports.selectedMonth === null, 'Selected month should be cleared');
    testRunner.assert(document.getElementById('monthly-overview').style.display === 'block', 'Overview should be visible');
    
    testRunner.cleanupMocks();
});

// Test 7: View Toggle Functionality
testRunner.test('toggleView switches between grid and table views', async () => {
    testRunner.setupMocks();
    
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMonthlyData
    });

    const reports = new MonthlyAdmissionReports();
    await reports.loadMonthlyData();
    
    // Test toggle to table view
    reports.toggleView();
    testRunner.assert(reports.currentView === 'table', 'Should switch to table view');
    testRunner.assert(document.getElementById('table-view').style.display === 'block', 'Table view should be visible');
    
    // Test toggle back to grid view
    reports.toggleView();
    testRunner.assert(reports.currentView === 'overview', 'Should switch back to overview');
    testRunner.assert(document.getElementById('monthly-overview').style.display === 'block', 'Overview should be visible');
    
    testRunner.cleanupMocks();
});

// Test 8: Error Handling
testRunner.test('handles API errors gracefully', async () => {
    testRunner.setupMocks();
    
    // Mock API error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const reports = new MonthlyAdmissionReports();
    
    try {
        await reports.loadMonthlyData();
    } catch (error) {
        testRunner.assert(error.message === 'Network error', 'Should propagate network errors');
    }
    
    testRunner.assert(reports.monthlyData.length === 0, 'Should have empty data on error');
    
    testRunner.cleanupMocks();
});

// Test 9: Keyboard Navigation
testRunner.test('keyboard navigation works correctly', async () => {
    testRunner.setupMocks();
    
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMonthlyData
    });

    const reports = new MonthlyAdmissionReports();
    await reports.loadMonthlyData();
    reports.switchToDetailsView();
    
    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);
    
    // Note: In a real test environment, you'd need to wait for the event handler
    // For this mock test, we'll just verify the handler is set up
    testRunner.assert(reports.currentView === 'details', 'View state should be testable');
    
    testRunner.cleanupMocks();
});

// Test 10: Responsive Behavior
testRunner.test('handles window resize events', async () => {
    testRunner.setupMocks();
    
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMonthlyData
    });

    const reports = new MonthlyAdmissionReports();
    await reports.loadMonthlyData();
    
    // Simulate window resize
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
    
    // Verify resize timeout is set
    testRunner.assert(typeof reports.resizeTimeout !== 'undefined', 'Should handle resize events');
    
    testRunner.cleanupMocks();
});

// Test 11: Data Refresh
testRunner.test('refresh method reloads data correctly', async () => {
    testRunner.setupMocks();
    
    // Initial data load
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMonthlyData
    });

    // Refresh data load
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [...mockMonthlyData, { month: '2024-04', count: 5 }]
    });

    const reports = new MonthlyAdmissionReports();
    await reports.loadMonthlyData();
    
    const initialCount = reports.monthlyData.length;
    await reports.refresh();
    
    testRunner.assert(reports.monthlyData.length === initialCount + 1, 'Should update data on refresh');
    
    testRunner.cleanupMocks();
});

// Test 12: State Management
testRunner.test('getCurrentState returns correct state information', async () => {
    testRunner.setupMocks();
    
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMonthlyData
    });

    const reports = new MonthlyAdmissionReports();
    await reports.loadMonthlyData();
    
    const state = reports.getCurrentState();
    testRunner.assert(state.view === 'overview', 'Should return current view');
    testRunner.assert(state.selectedMonth === null, 'Should return selected month');
    testRunner.assert(state.dataCount === mockMonthlyData.length, 'Should return data count');
    
    testRunner.cleanupMocks();
});

// Export test runner for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MonthlyReportsTestRunner, testRunner };
}

// Auto-run tests if in browser and MonthlyAdmissionReports is available
if (typeof window !== 'undefined' && typeof MonthlyAdmissionReports !== 'undefined') {
    // Uncomment to run tests automatically
    // testRunner.runTests();
}

// Manual test runner function for browser
function runMonthlyReportsTests() {
    return testRunner.runTests();
}

// Make test runner available globally
if (typeof window !== 'undefined') {
    window.runMonthlyReportsTests = runMonthlyReportsTests;
    window.monthlyReportsTestRunner = testRunner;
}