/**
 * Unit Tests for MonthUtils
 * Simple test functions to verify month utility functionality
 */

// Test runner function
function runMonthUtilsTests() {
    console.log('Running MonthUtils Tests...');
    let passed = 0;
    let failed = 0;

    // Test helper function
    function test(description, testFn) {
        try {
            testFn();
            console.log(`✓ ${description}`);
            passed++;
        } catch (error) {
            console.error(`✗ ${description}: ${error.message}`);
            failed++;
        }
    }

    // Test getMonthName
    test('getMonthName returns correct month names', () => {
        if (MonthUtils.getMonthName(1) !== 'January') throw new Error('January test failed');
        if (MonthUtils.getMonthName(6) !== 'June') throw new Error('June test failed');
        if (MonthUtils.getMonthName(12) !== 'December') throw new Error('December test failed');
    });

    test('getMonthName throws error for invalid input', () => {
        try {
            MonthUtils.getMonthName(0);
            throw new Error('Should have thrown error for month 0');
        } catch (e) {
            if (!e.message.includes('Month number must be between 1 and 12')) {
                throw new Error('Wrong error message');
            }
        }
    });

    // Test getShortMonthName
    test('getShortMonthName returns correct short names', () => {
        if (MonthUtils.getShortMonthName(1) !== 'Jan') throw new Error('Jan test failed');
        if (MonthUtils.getShortMonthName(6) !== 'Jun') throw new Error('Jun test failed');
        if (MonthUtils.getShortMonthName(12) !== 'Dec') throw new Error('Dec test failed');
    });

    // Test formatMonthYear
    test('formatMonthYear formats correctly', () => {
        if (MonthUtils.formatMonthYear('2024-01') !== 'January 2024') throw new Error('January 2024 test failed');
        if (MonthUtils.formatMonthYear('2023-12') !== 'December 2023') throw new Error('December 2023 test failed');
    });

    test('formatMonthYear throws error for invalid format', () => {
        try {
            MonthUtils.formatMonthYear('invalid');
            throw new Error('Should have thrown error for invalid format');
        } catch (e) {
            if (!e.message.includes('YYYY-MM format')) {
                throw new Error('Wrong error message');
            }
        }
    });

    // Test formatShortMonthYear
    test('formatShortMonthYear formats correctly', () => {
        if (MonthUtils.formatShortMonthYear('2024-01') !== 'Jan 2024') throw new Error('Jan 2024 test failed');
        if (MonthUtils.formatShortMonthYear('2023-12') !== 'Dec 2023') throw new Error('Dec 2023 test failed');
    });

    // Test getCurrentMonthString
    test('getCurrentMonthString returns valid format', () => {
        const current = MonthUtils.getCurrentMonthString();
        if (!MonthUtils.isValidMonthString(current)) throw new Error('Current month string is invalid');
    });

    // Test getPreviousMonth
    test('getPreviousMonth works correctly', () => {
        if (MonthUtils.getPreviousMonth('2024-02') !== '2024-01') throw new Error('Previous month test failed');
        if (MonthUtils.getPreviousMonth('2024-01') !== '2023-12') throw new Error('Year rollback test failed');
    });

    // Test getNextMonth
    test('getNextMonth works correctly', () => {
        if (MonthUtils.getNextMonth('2024-01') !== '2024-02') throw new Error('Next month test failed');
        if (MonthUtils.getNextMonth('2023-12') !== '2024-01') throw new Error('Year rollover test failed');
    });

    // Test isValidMonthString
    test('isValidMonthString validates correctly', () => {
        if (!MonthUtils.isValidMonthString('2024-01')) throw new Error('Valid string rejected');
        if (MonthUtils.isValidMonthString('invalid')) throw new Error('Invalid string accepted');
        if (MonthUtils.isValidMonthString('2024-13')) throw new Error('Invalid month accepted');
    });

    // Test dateToMonthString
    test('dateToMonthString converts correctly', () => {
        const date = new Date(2024, 0, 15); // January 15, 2024
        if (MonthUtils.dateToMonthString(date) !== '2024-01') throw new Error('Date conversion failed');
    });

    // Test compareMonths
    test('compareMonths compares correctly', () => {
        if (MonthUtils.compareMonths('2024-01', '2024-02') !== -1) throw new Error('Less than comparison failed');
        if (MonthUtils.compareMonths('2024-01', '2024-01') !== 0) throw new Error('Equal comparison failed');
        if (MonthUtils.compareMonths('2024-02', '2024-01') !== 1) throw new Error('Greater than comparison failed');
    });

    console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// Run tests if in browser environment
if (typeof window !== 'undefined' && window.MonthUtils) {
    // Uncomment the line below to run tests automatically
    // runMonthUtilsTests();
}

// Export test runner for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runMonthUtilsTests };
}