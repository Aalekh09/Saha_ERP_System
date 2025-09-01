// Mock API for Testing - Use when backend is not available
class MockAPI {
    constructor() {
        this.students = [];
        
        this.payments = [];
        
        this.attendance = {};
    }
    

    
    // Mock API endpoints
    async getStudents() {
        // Simulate network delay
        await this.delay(500);
        return this.students;
    }
    
    async getPayments() {
        await this.delay(300);
        return this.payments;
    }
    
    async getAttendance(date) {
        await this.delay(200);
        return {
            date: date,
            attendance: this.attendance[date] || {}
        };
    }
    
    async saveAttendance(date, attendanceData) {
        await this.delay(300);
        this.attendance[date] = attendanceData;
        return { success: true, message: 'Attendance saved successfully' };
    }
    
    async addStudent(studentData) {
        await this.delay(400);
        const newId = Math.max(...this.students.map(s => s.id)) + 1;
        const newStudent = { ...studentData, id: newId };
        this.students.push(newStudent);
        return newStudent;
    }
    
    async addPayment(paymentData) {
        await this.delay(300);
        const newId = Math.max(...this.payments.map(p => p.id)) + 1;
        const newPayment = { ...paymentData, id: newId };
        this.payments.push(newPayment);
        
        // Update student's paid amount
        const student = this.students.find(s => s.id === paymentData.studentId);
        if (student) {
            student.paidAmount = (student.paidAmount || 0) + paymentData.amount;
        }
        
        return newPayment;
    }
    
    // Utility method to simulate network delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Check if real API is available
    static async isRealAPIAvailable() {
        try {
            const response = await fetch('https://aalekhapi.sahaedu.in/api/students', {
                method: 'HEAD',
                timeout: 2000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Global mock API instance
window.mockAPI = new MockAPI();

// API wrapper that automatically falls back to mock
window.apiWrapper = {
    // Cache API availability status
    _apiAvailable: null,
    _lastCheck: 0,
    _checkInterval: 30000, // Check every 30 seconds
    
    async checkAPIAvailability() {
        const now = Date.now();
        
        // Use cached result if recent
        if (this._apiAvailable !== null && (now - this._lastCheck) < this._checkInterval) {
            return this._apiAvailable;
        }
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
            
            const response = await fetch('https://aalekhapi.sahaedu.in/api/students', {
                method: 'HEAD',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            this._apiAvailable = response.ok;
            this._lastCheck = now;
            
            return this._apiAvailable;
        } catch (error) {
            this._apiAvailable = false;
            this._lastCheck = now;
            return false;
        }
    },
    
    async get(endpoint) {
        const isAPIAvailable = await this.checkAPIAvailability();
        
        if (isAPIAvailable) {
            try {
                const response = await fetch(`https://aalekhapi.sahaedu.in${endpoint}`);
                if (response.ok) {
                    return await response.json();
                }
                // If we get here, API is available but endpoint returned error
                console.log(`API endpoint ${endpoint} returned ${response.status}, falling back to mock`);
            } catch (error) {
                console.log(`API request failed for ${endpoint}, falling back to mock`);
            }
        }
        
        // Use mock API
        console.log(`Using mock API for: ${endpoint}`);
        
        // Route to appropriate mock method
        if (endpoint === '/api/students') {
            return await window.mockAPI.getStudents();
        } else if (endpoint === '/api/payments') {
            return await window.mockAPI.getPayments();
        } else if (endpoint.startsWith('/api/attendance/')) {
            const date = endpoint.split('/').pop();
            return await window.mockAPI.getAttendance(date);
        }
        
        throw new Error(`Unknown endpoint: ${endpoint}`);
    },
    
    async post(endpoint, data) {
        const isAPIAvailable = await this.checkAPIAvailability();
        
        if (isAPIAvailable) {
            try {
                const response = await fetch(`https://aalekhapi.sahaedu.in${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    return await response.json();
                }
                console.log(`API endpoint ${endpoint} returned ${response.status}, falling back to mock`);
            } catch (error) {
                console.log(`API request failed for ${endpoint}, falling back to mock`);
            }
        }
        
        // Use mock API
        console.log(`Using mock API for: ${endpoint}`);
        
        // Route to appropriate mock method
        if (endpoint === '/api/students') {
            return await window.mockAPI.addStudent(data);
        } else if (endpoint === '/api/payments') {
            return await window.mockAPI.addPayment(data);
        } else if (endpoint === '/api/attendance') {
            return await window.mockAPI.saveAttendance(data.date, data.attendance);
        }
        
        throw new Error(`Unknown endpoint: ${endpoint}`);
    },
    
    // Method to force refresh API availability check
    refreshAPIStatus() {
        this._apiAvailable = null;
        this._lastCheck = 0;
    }
};

console.log('Mock API initialized - will be used when real API is not available');