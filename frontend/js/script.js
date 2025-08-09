// === Mobile Support Enabled ===
// Device check removed - Full mobile support now available

// === Mobile Menu Functionality ===
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const sidePanel = document.getElementById('sidePanel');

    if (mobileMenuToggle && mobileMenuOverlay && sidePanel) {
        // Toggle mobile menu
        mobileMenuToggle.addEventListener('click', function () {
            sidePanel.classList.toggle('mobile-active');
            mobileMenuOverlay.classList.toggle('active');
            document.body.classList.toggle('mobile-menu-open');
        });

        // Close menu when overlay is clicked
        mobileMenuOverlay.addEventListener('click', function () {
            sidePanel.classList.remove('mobile-active');
            mobileMenuOverlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
        });

        // Close menu when a navigation item is clicked (on mobile)
        const tabButtons = sidePanel.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    sidePanel.classList.remove('mobile-active');
                    mobileMenuOverlay.classList.remove('active');
                    document.body.classList.remove('mobile-menu-open');
                }
            });
        });
    }
}

// Initialize mobile menu when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeMobileMenu);

// File upload preview functionality
document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('tenthClassDocument');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFileBtn = document.getElementById('removeFile');

    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showNotification('File size must be less than 5MB', true);
                    fileInput.value = '';
                    filePreview.style.display = 'none';
                    return;
                }

                // Show file preview
                fileName.textContent = file.name;
                fileSize.textContent = formatFileSize(file.size);
                filePreview.style.display = 'flex';
            } else {
                filePreview.style.display = 'none';
            }
        });
    }

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', function () {
            fileInput.value = '';
            filePreview.style.display = 'none';
        });
    }
});

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// === Server Status Overlay ===
function showServerOverlay() {
    if (document.getElementById('server-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'server-overlay';
    overlay.innerHTML = `
        <div class="server-message">
            <div class="server-animation">
                <div class="dot"></div><div class="dot"></div><div class="dot"></div>
            </div>
            <h2>Server Not Running</h2>
            <p>Oops! The backend server is not available.<br>Please start the server and try again.</p>
        </div>
    `;
    document.body.appendChild(overlay);
}
function hideServerOverlay() {
    const overlay = document.getElementById('server-overlay');
    if (overlay) overlay.remove();
}
async function checkServer() {
    try {
        // Try a lightweight API endpoint
        const res = await fetch(`${window.location.protocol}//${window.location.hostname}:4455/api/reports/monthly-student-admissions`, { method: 'GET' });
        if (!res.ok) throw new Error('Not OK');
        hideServerOverlay();
    } catch (e) {
        showServerOverlay();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    checkServer();
    setInterval(checkServer, 10000); // Check every 10s
});

// Check if user is logged in
if (!localStorage.getItem('isLoggedIn')) {
    window.location.replace('login.html');
    throw new Error('Not logged in');
}

// Auto-cleanup missing document references on page load (run once)
if (!localStorage.getItem('documentsCleanedUp')) {
    setTimeout(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/students/cleanup-missing-documents`, {
                method: 'POST'
            });
            if (response.ok) {
                const result = await response.text();
                console.log('Document cleanup result:', result);
                localStorage.setItem('documentsCleanedUp', 'true');
                // Refresh student list if cleanup found issues
                if (result.includes('Cleaned up') && !result.includes('Cleaned up 0')) {
                    console.log('Refreshing student list after cleanup...');
                    if (typeof fetchStudents === 'function') {
                        fetchStudents();
                    }
                }
            }
        } catch (error) {
            console.log('Document cleanup error:', error);
        }
    }, 2000); // Run after 2 seconds to let the page load
}

// Set username from localStorage
const username = localStorage.getItem('username');
if (username) {
    document.getElementById('username').textContent = username;
}

// Dynamic API base URL for cross-device compatibility
const API_BASE = window.location.protocol + '//' + window.location.hostname + ':4455';
// Replace all API URLs
const API_URL = API_BASE + '/api/students';
const PAYMENT_API_URL = API_BASE + '/api/payments';

const studentsTableBody = document.querySelector('#studentsTable tbody');
const studentForm = document.getElementById('studentForm');
const searchInput = document.getElementById('searchInput');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');

let editingStudentId = null;
// Declare a global variable to store students
let allStudents = [];

// Declare a global variable for the active tab ID
let activeTabId = 'list'; // Default to list panel

// Add these variables at the top of the file with other global variables
let enquiriesChart = null;
let studentGrowthChart = null;

// Add logout button to header (ensure this is only added once if script is loaded on multiple pages)
// Consider moving this to dashboard.html and index.html separately if header structure differs
const header = document.querySelector('header');
const logoutBtn = document.createElement('button');
logoutBtn.textContent = 'Logout';
logoutBtn.className = 'logout-btn';
logoutBtn.onclick = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
};
if (header && !header.querySelector('.logout-btn')) { // Prevent adding multiple logout buttons
    header.appendChild(logoutBtn);
}

// Show notification function
function showNotification(message, isError = false) {
    notificationMessage.textContent = message;
    notification.className = 'notification' + (isError ? ' error' : '');
    notification.classList.add('show');

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Function to activate a specific tab
function activateTab(tabId) {
    // Update active tab button
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    // Show corresponding content
    tabContents.forEach(content => {
        if (content) {
            content.classList.remove('active');
            if (content.id === `${tabId}-panel`) {
                content.classList.add('active');
            }
        }
    });
    activeTabId = tabId; // Update the active tab ID
}

// Tab switching functionality (Update event listener)
tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const tabId = button.getAttribute('data-tab');
        if (tabId === 'teachers') {
            const modal = document.getElementById('maintenanceModal');
            if (modal) {
                modal.style.display = 'block';
            }
            return;
        }
        activateTab(tabId); // Use the new activateTab function
    });
});

// Function to get URL parameter
function getUrlParameter(name) {
    name = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// On page load, check for panel parameter and activate the corresponding tab
document.addEventListener('DOMContentLoaded', () => {
    const panelParam = getUrlParameter('panel');
    if (panelParam) {
        activateTab(panelParam);
    } else {
        // If no panel parameter is provided, do not activate any tab by default.
        // The index.html page will appear empty until a panel is selected from the dashboard.
        // Default to the list panel if no parameter is provided
        // activateTab(activeTabId);
    }

    // Initial data fetch based on active tab (if needed)
    // This logic should ideally be called within the activateTab function
    // whenever a tab becomes active, not just on DOMContentLoaded.
    // Example: if (activeTabId === 'list') { fetchStudents(); }
    // You might need to add similar logic for other tabs when they become active initially
});

// Global pagination instances
let studentsPagination = null;
let paymentsPagination = null;

// Global data arrays
let allPayments = [];
let allTeachers = [];

// Additional pagination instances
let teachersPagination = null;

// Fetch and display students
async function fetchStudents() {
    console.log('Fetching students...');
    try {
        const response = await fetch(API_URL);
        console.log('Response status:', response.status);
        const students = await response.json();
        console.log('Received students:', students);
        // Store fetched students in the global variable
        allStudents = students;

        // Initialize pagination if not already done
        if (!studentsPagination) {
            initializeStudentsPagination();
        }

        // Update pagination with new data
        studentsPagination.updateData(students);

        // Update stats
        updateStats(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        showNotification('Error fetching students', true);
    }
}

// Initialize students pagination
function initializeStudentsPagination() {
    studentsPagination = new TablePagination({
        containerId: 'list-panel',
        tableId: 'studentsTable',
        data: [],
        pageSize: 10,
        renderRow: renderStudentRow,
        searchFilter: (student, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return (
                student.name?.toLowerCase().includes(term) ||
                student.email?.toLowerCase().includes(term) ||
                student.phoneNumber?.includes(term) ||
                student.courses?.toLowerCase().includes(term) ||
                String(student.id).includes(term)
            );
        }
    });

    // Make it globally accessible
    window.list_panelPagination = studentsPagination;

    // Connect search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            studentsPagination.search(e.target.value);
        });
    }
}

// Function to format text in capital letters
function toUpperCase(text) {
    if (!text) return '';
    return text.toUpperCase();
}

// Render a single student row for pagination
function renderStudentRow(student, index) {
    // Calculate fee progress
    const totalFee = parseFloat(student.totalCourseFee) || 0;
    const paidAmount = parseFloat(student.paidAmount) || 0;
    const progress = totalFee > 0 ? (paidAmount / totalFee) * 100 : 0;

    const row = `
        <tr>
            <td>
                <div class="student-info">
                    <div class="student-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="student-details">
                        <span class="student-name clickable" data-id="${student.id}">${toUpperCase(student.name) || 'N/A'}</span>
                        <span class="student-id">ID: STU${String(student.id).padStart(4, '0')}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="date-of-joining">${student.admissionDate ? student.admissionDate : 'N/A'}</div>
            </td>
            <td>
                <div class="contact-info">
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${student.phoneNumber || 'N/A'}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>${toUpperCase(student.email) || 'N/A'}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="course-info">
                    <span class="course-name">${toUpperCase(student.courses) || 'N/A'}</span>
                    <span class="course-duration">${student.courseDuration || 'N/A'}</span>
                </div>
            </td>
            <td>
                <div class="fee-status">
                    <span class="fee-amount">₹${formatCurrency(paidAmount)} / ₹${formatCurrency(totalFee)}</span>
                    <div class="fee-progress">
                        <div class="fee-progress-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn professional-view-profile-btn" data-id="${student.id}" title="View Complete Student Profile">
                        <i class="fas fa-user-circle"></i>
                        <span>View Profile</span>
                    </button>
                    <button class="action-btn professional-id-card-btn" data-id="${student.id}" title="Generate & View Student ID Card">
                        <i class="fas fa-id-badge"></i>
                        <span>ID Card</span>
                    </button>
                    <button class="action-btn edit-btn" data-id="${student.id}" title="Edit Student">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn payment-btn" data-id="${student.id}" data-name="${toUpperCase(student.name)}" data-phone="${student.phoneNumber}" title="Add Payment">
                        <i class="fas fa-money-bill"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${student.id}" title="Delete Student">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;

    // Add event listeners after the row is inserted
    setTimeout(() => {
        attachStudentRowEventListeners(student);
    }, 0);

    return row;
}

// Attach event listeners to student row buttons
function attachStudentRowEventListeners(student) {
    // Delete event
    const deleteBtn = document.querySelector(`[data-id="${student.id}"].delete-btn`);
    if (deleteBtn && !deleteBtn.hasAttribute('data-listener-attached')) {
        deleteBtn.addEventListener('click', () => deleteStudent(student.id));
        deleteBtn.setAttribute('data-listener-attached', 'true');
    }

    // Edit event
    const editBtn = document.querySelector(`[data-id="${student.id}"].edit-btn`);
    if (editBtn && !editBtn.hasAttribute('data-listener-attached')) {
        editBtn.addEventListener('click', () => {
            console.log('Edit button clicked for student:', student);
            loadEditStudent(student);
        });
        editBtn.setAttribute('data-listener-attached', 'true');
    }

    // Payment event
    const paymentBtn = document.querySelector(`[data-id="${student.id}"].payment-btn`);
    if (paymentBtn && !paymentBtn.hasAttribute('data-listener-attached')) {
        paymentBtn.addEventListener('click', () => {
            // Switch to payments tab first
            document.querySelector('[data-tab="payments"]').click();

            // Wait a moment for the tab to load, then open the modal
            setTimeout(() => {
                // Open the Add New Payment modal
                const modal = document.getElementById('addPaymentModal');
                if (modal) {
                    modal.style.display = 'block';

                    // Pre-fill the student details
                    const studentSelect = document.getElementById('studentSelect');
                    if (studentSelect) {
                        // Clear existing options
                        studentSelect.innerHTML = '<option value="">Select Student</option>';

                        // Add the selected student as an option
                        const option = new Option(toUpperCase(student.name), student.id);
                        option.setAttribute('data-phone', student.phoneNumber);
                        option.selected = true;
                        studentSelect.appendChild(option);

                        // Show student summary if available
                        const studentSummary = document.getElementById('selectedStudentSummary');
                        const summaryName = document.getElementById('summaryStudentName');
                        const summaryId = document.getElementById('summaryStudentId');

                        if (studentSummary && summaryName && summaryId) {
                            summaryName.textContent = toUpperCase(student.name);
                            summaryId.textContent = `ID: STU${String(student.id).padStart(4, '0')}`;
                            studentSummary.style.display = 'flex';
                        }
                    }

                    // Pre-fill description with student's course
                    const descriptionInput = document.getElementById('description');
                    if (descriptionInput && student.courses) {
                        descriptionInput.value = `Course fee payment - ${student.courses}`;
                    }
                }
            }, 100);
        });
        paymentBtn.setAttribute('data-listener-attached', 'true');
    }

    // Profile view event
    const profileBtn = document.querySelector(`[data-id="${student.id}"].professional-view-profile-btn`);
    if (profileBtn && !profileBtn.hasAttribute('data-listener-attached')) {
        profileBtn.addEventListener('click', () => {
            showStudentProfile(student.id);
        });
        profileBtn.setAttribute('data-listener-attached', 'true');
    }

    // ID Card event
    const idCardBtn = document.querySelector(`[data-id="${student.id}"].professional-id-card-btn`);
    if (idCardBtn && !idCardBtn.hasAttribute('data-listener-attached')) {
        idCardBtn.addEventListener('click', () => {
            showIdCard(student.id);
        });
        idCardBtn.setAttribute('data-listener-attached', 'true');
    }

    // Student name click event
    const studentNameSpan = document.querySelector(`[data-id="${student.id}"].student-name`);
    if (studentNameSpan && !studentNameSpan.hasAttribute('data-listener-attached')) {
        studentNameSpan.addEventListener('click', () => {
            showStudentProfile(student.id);
        });
        studentNameSpan.setAttribute('data-listener-attached', 'true');
    }
}

// Legacy function for backward compatibility - now just updates stats
function displayStudents(students) {
    console.log('Displaying students:', students);

    // Sort students alphabetically by name
    students.sort((a, b) => a.name.localeCompare(b.name));

    // Update stats
    updateStats(students);

    // The actual table rendering is now handled by pagination
    if (studentsPagination) {
        studentsPagination.updateData(students);
    }
}

// Update stats
function updateStats(students) {
    // Total Students
    const totalStudentsCount = document.getElementById('totalStudentsCount');
    if (totalStudentsCount) {
        totalStudentsCount.textContent = students.length;
    }

    // Total Fees
    const totalFees = document.getElementById('totalFees');
    if (totalFees) {
        const total = students.reduce((sum, student) => sum + (parseFloat(student.totalCourseFee) || 0), 0);
        totalFees.textContent = `₹${formatCurrency(total)}`;
    }

    // Students who have not made any payments (paidAmount is 0 or falsy)
    const noPaymentStudents = document.getElementById('noPaymentStudents');
    if (noPaymentStudents) {
        const count = students.filter(student => !student.paidAmount || parseFloat(student.paidAmount) === 0).length;
        noPaymentStudents.textContent = count;
    }
}

// Helper function to format currency values
function formatCurrency(value) {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2);
}

// Load student data into form for editing
function loadEditStudent(student) {
    try {
        // Switch to the add/edit panel
        const addTab = document.querySelector('[data-tab="add"]');
        if (addTab) {
            addTab.click();
        }

        // Fill the form with student data
        document.getElementById('studentId').value = student.id;
        document.getElementById('name').value = student.name || '';
        document.getElementById('fatherName').value = student.fatherName || '';
        document.getElementById('motherName').value = student.motherName || '';
        document.getElementById('dob').value = student.dob || '';
        document.getElementById('email').value = student.email || '';
        document.getElementById('phoneNumber').value = student.phoneNumber || '';
        document.getElementById('address').value = student.address || '';
        document.getElementById('courses').value = student.courses || '';
        document.getElementById('courseDuration').value = student.courseDuration || '';
        document.getElementById('totalCourseFee').value = student.totalCourseFee || '';

        editingStudentId = student.id;
        submitBtn.textContent = 'Update Student';
        cancelEditBtn.style.display = 'inline-block';

        // Scroll to the form
        // Add a small delay to ensure the element is in the DOM
        setTimeout(() => {
            const addStudentSection = document.querySelector('.add-student-section');
            if (addStudentSection) {
                addStudentSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('Add student section not found after tab switch');
            }
        }, 100); // Adjust delay if needed

        showNotification('Edit mode activated. Please update the student details.');
    } catch (error) {
        console.error('Error loading student for edit:', error);
        showNotification('Error loading student details for editing', true);
    }
}

// Cancel editing
document.getElementById('cancelEditBtn').addEventListener('click', () => {
    resetForm();
});

// Reset form to add new student mode
function resetForm() {
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    // Clear file input
    const fileInput = document.getElementById('tenthClassDocument');
    if (fileInput) {
        fileInput.value = '';
    }
    editingStudentId = null;
    submitBtn.textContent = 'Add Student';
    cancelEditBtn.style.display = 'none';
    // Set default value for admissionDate to today
    const admissionDateInput = document.getElementById('admissionDate');
    if (admissionDateInput) {
        const today = new Date().toISOString().split('T')[0];
        admissionDateInput.value = today;
    }
}

// Handle form submit
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const tenthClassDocumentFile = document.getElementById('tenthClassDocument').files[0];

    // Check file size (5MB limit)
    if (tenthClassDocumentFile && tenthClassDocumentFile.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', true);
        return;
    }

    try {
        if (editingStudentId) {
            // Update existing student (without file upload for now)
            const studentData = {
                name: toUpperCase(document.getElementById('name').value),
                fatherName: toUpperCase(document.getElementById('fatherName').value),
                motherName: toUpperCase(document.getElementById('motherName').value),
                dob: document.getElementById('dob').value,
                email: toUpperCase(document.getElementById('email').value),
                phoneNumber: document.getElementById('phoneNumber').value,
                address: toUpperCase(document.getElementById('address').value),
                courses: toUpperCase(document.getElementById('courses').value),
                courseDuration: document.getElementById('courseDuration').value,
                totalCourseFee: parseFloat(document.getElementById('totalCourseFee').value) || 0,
                paidAmount: 0,
                remainingAmount: parseFloat(document.getElementById('totalCourseFee').value) || 0,
                admissionDate: document.getElementById('admissionDate').value
            };

            const response = await fetch(`${API_URL}/${editingStudentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });

            if (!response.ok) {
                throw new Error('Failed to update student');
            }

            resetForm();
            fetchStudents();
            showNotification('Student updated successfully!');
        } else {
            // Add new student with file upload
            const formData = new FormData();
            formData.append('name', toUpperCase(document.getElementById('name').value));
            formData.append('fatherName', toUpperCase(document.getElementById('fatherName').value));
            formData.append('motherName', toUpperCase(document.getElementById('motherName').value));
            formData.append('dob', document.getElementById('dob').value);
            formData.append('email', toUpperCase(document.getElementById('email').value));
            formData.append('phoneNumber', document.getElementById('phoneNumber').value);
            formData.append('address', toUpperCase(document.getElementById('address').value));
            formData.append('courses', toUpperCase(document.getElementById('courses').value));
            formData.append('courseDuration', document.getElementById('courseDuration').value);
            formData.append('totalCourseFee', parseFloat(document.getElementById('totalCourseFee').value) || 0);
            formData.append('admissionDate', document.getElementById('admissionDate').value);

            if (tenthClassDocumentFile) {
                formData.append('tenthClassDocument', tenthClassDocumentFile);
            }

            const response = await fetch(`${API_URL}/with-document`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to add student');
            }

            resetForm();
            fetchStudents();
            showNotification('Student added successfully!');

            // Check if the form was from an enquiry AND the checkbox is checked
            const enquiryData = localStorage.getItem('enquiryToStudent');
            const markConfirmedCheckbox = document.getElementById('markEnquiryConfirmed');

            if (enquiryData && markConfirmedCheckbox && markConfirmedCheckbox.checked) {
                const enquiry = JSON.parse(enquiryData);
                try {
                    const convertResponse = await fetch(`${API_BASE}/api/enquiries/${enquiry.id}/convert`, {
                        method: 'POST'
                    });

                    if (convertResponse.ok) {
                        console.log(`Enquiry ${enquiry.id} marked as converted successfully.`);
                        showNotification('Enquiry status updated to Confirmed!', false);

                        if (window.fetchEnquiries) {
                            window.fetchEnquiries();
                        } else {
                            console.warn('fetchEnquiries function not found in this window. Cannot auto-refresh enquiry list.');
                        }
                    } else {
                        const errorText = await convertResponse.text();
                        console.error(`Failed to mark enquiry ${enquiry.id} as converted:`, errorText);
                        showNotification(`Failed to update enquiry status: ${errorText || convertResponse.statusText}`, true);
                    }
                } catch (error) {
                    console.error(`Error calling /convert endpoint for enquiry ${enquiry.id}:`, error);
                    showNotification(`Error calling update enquiry status API: ${error.message}`, true);
                } finally {
                    localStorage.removeItem('enquiryToStudent');
                }
            } else if (enquiryData) {
                // If the form was from an enquiry but the checkbox was NOT checked
                localStorage.removeItem('enquiryToStudent');
            }
        }
    } catch (error) {
        showNotification('Error: ' + error.message, true);
        console.error(error);
    }
});

// Delete student
async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchStudents();
        showNotification('Student deleted successfully!');
    } catch (error) {
        showNotification('Error deleting student', true);
        console.error(error);
    }
}

// Enhanced search functionality
function filterStudents(students, searchTerm, filterType) {
    if (!searchTerm) return students;

    searchTerm = searchTerm.toLowerCase().trim();

    return students.filter(student => {
        switch (filterType) {
            case 'name':
                return student.name?.toLowerCase().includes(searchTerm);
            case 'id':
                return `stu${String(student.id).padStart(4, '0')}`.includes(searchTerm);
            case 'course':
                return student.courses?.toLowerCase().includes(searchTerm);
            case 'phone':
                return student.phoneNumber?.includes(searchTerm);
            case 'email':
                return student.email?.toLowerCase().includes(searchTerm);
            case 'all':
            default:
                return (
                    student.name?.toLowerCase().includes(searchTerm) ||
                    `stu${String(student.id).padStart(4, '0')}`.includes(searchTerm) ||
                    student.courses?.toLowerCase().includes(searchTerm) ||
                    student.phoneNumber?.includes(searchTerm) ||
                    student.email?.toLowerCase().includes(searchTerm)
                );
        }
    });
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchFilter = document.getElementById('searchFilter');
    const clearSearchBtn = document.querySelector('.clear-search');

    if (!searchInput || !searchFilter || !clearSearchBtn) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value;
            const filterType = searchFilter.value;
            const filteredStudents = filterStudents(allStudents, searchTerm, filterType);
            displayStudents(filteredStudents);

            // Show/hide clear button
            clearSearchBtn.style.display = searchTerm ? 'flex' : 'none';
        }, 300); // Debounce search for better performance
    });

    searchFilter.addEventListener('change', () => {
        const searchTerm = searchInput.value;
        const filterType = searchFilter.value;
        const filteredStudents = filterStudents(allStudents, searchTerm, filterType);
        displayStudents(filteredStudents);
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        displayStudents(allStudents);
    });

    // Hide clear button initially
    clearSearchBtn.style.display = 'none';
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Content Loaded - Initializing application');

    // Initialize search functionality
    initializeSearch();

    // Initialize tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    console.log('Found tab buttons:', tabButtons.length);

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Show corresponding content
            tabContents.forEach(content => {
                if (content) {
                    content.classList.remove('active');
                    if (content.id === `${tabId}-panel`) {
                        content.classList.add('active');
                    }
                }
            });

            // Special handling for teachers tab
            if (tabId === 'teachers') {
                const teachersSection = document.getElementById('teachers-section');
                if (teachersSection) {
                    teachersSection.style.display = 'block';
                    loadTeachers();
                }
            } else {
                const teachersSection = document.getElementById('teachers-section');
                if (teachersSection) {
                    teachersSection.style.display = 'none';
                }
            }

            // If the activated tab is the add tab, scroll to the form
            if (tabId === 'add') {
                const addStudentSection = document.querySelector('#add-panel .add-student-section');
                if (addStudentSection) {
                    addStudentSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Load initial data
    console.log('Loading initial data...');
    fetchStudents();

    if (document.getElementById('teachersTableBody')) {
        console.log('Loading teachers...');
        loadTeachers();
    }

    const teachersBtn = document.querySelector('.tab-btn[data-tab="teachers"]');
    const modal = document.getElementById('maintenanceModal');
    const closeModal = document.getElementById('closeMaintenanceModal');

    if (teachersBtn && modal && closeModal) {
        teachersBtn.addEventListener('click', function (e) {
            e.preventDefault();
            modal.style.display = 'block';
        });

        closeModal.addEventListener('click', function () {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Check if we need to auto-fill the Add Student form from enquiry
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('addStudentFromEnquiry') === '1') {
        const enquiryData = localStorage.getItem('enquiryToStudent');
        if (enquiryData) {
            const enquiry = JSON.parse(enquiryData);

            // Switch to Add Student tab
            const addTab = document.querySelector('[data-tab="add"]');
            if (addTab) {
                addTab.click();
            }

            // Fill the form fields
            const nameInput = document.getElementById('name');
            const fatherNameInput = document.getElementById('fatherName');
            const phoneInput = document.getElementById('phoneNumber');
            const coursesInput = document.getElementById('courses');
            const durationInput = document.getElementById('courseDuration');
            const remarksInput = document.getElementById('remarks');

            if (nameInput) nameInput.value = enquiry.name || '';
            if (fatherNameInput) fatherNameInput.value = enquiry.fatherName || '';
            if (phoneInput) phoneInput.value = enquiry.phoneNumber || '';
            if (coursesInput) coursesInput.value = enquiry.course || '';
            if (durationInput) durationInput.value = enquiry.courseDuration || '';
            if (remarksInput) remarksInput.value = enquiry.remarks || '';
        }
    }
});

// Payment related constants
const paymentForm = document.getElementById('paymentForm');
const addPaymentBtn = document.getElementById('addPaymentBtn');
const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
const studentSelect = document.getElementById('studentSelect');
const paymentsTableBody = document.querySelector('#paymentsTable tbody');

// Initialize payment form
if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const studentId = studentSelect.value;
        if (!studentId) {
            showNotification('Please select a student', true);
            return;
        }

        const studentName = studentSelect.options[studentSelect.selectedIndex].text;
        const studentPhone = studentSelect.options[studentSelect.selectedIndex].getAttribute('data-phone');
        const paymentAmount = parseFloat(document.getElementById('amount').value);

        if (!paymentAmount || paymentAmount <= 0) {
            showNotification('Please enter a valid amount', true);
            return;
        }

        const paymentData = {
            student: {
                id: studentId,
                name: studentName,
                phoneNumber: studentPhone
            },
            amount: paymentAmount,
            paymentMethod: document.getElementById('paymentMethod').value,
            description: document.getElementById('description').value || 'Course fee payment'
        };

        try {
            // First, get the current student data
            const studentResponse = await fetch(`${API_URL}/${studentId}`);
            if (!studentResponse.ok) {
                throw new Error('Failed to fetch student data');
            }
            const student = await studentResponse.json();

            // Update student's payment information
            const updatedStudent = {
                ...student,
                paidAmount: (student.paidAmount || 0) + paymentAmount,
                remainingAmount: (student.totalCourseFee || 0) - ((student.paidAmount || 0) + paymentAmount)
            };

            // Update the student record
            const updateResponse = await fetch(`${API_URL}/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedStudent)
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update student payment information');
            }

            // Then add the payment record
            const paymentResponse = await fetch(PAYMENT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });

            if (paymentResponse.ok) {
                const payment = await paymentResponse.json();
                showNotification('Payment added successfully!');
                const modal = document.getElementById('addPaymentModal');
                if (modal) modal.style.display = 'none';
                paymentForm.reset();
                fetchPayments();
                fetchStudents(); // Refresh the student list to show updated payment info
                generateReceipt(payment);
            } else {
                throw new Error('Failed to create payment record');
            }
        } catch (error) {
            showNotification(error.message || 'Error adding payment', true);
            console.error(error);
        }
    });
}

// Initialize add payment button
if (addPaymentBtn) {
    addPaymentBtn.addEventListener('click', () => {
        const modal = document.getElementById('addPaymentModal');
        if (modal) modal.style.display = 'block';
        loadStudentsForPayment();
    });
}

// Initialize close modal button
const closeAddPaymentModalBtn = document.getElementById('closeAddPaymentModalBtn');
if (closeAddPaymentModalBtn) {
    closeAddPaymentModalBtn.addEventListener('click', () => {
        const modal = document.getElementById('addPaymentModal');
        if (modal) modal.style.display = 'none';
        paymentForm.reset();
    });
}

// Initialize cancel payment button
if (cancelPaymentBtn) {
    cancelPaymentBtn.addEventListener('click', () => {
        const modal = document.getElementById('addPaymentModal');
        if (modal) modal.style.display = 'none';
        paymentForm.reset();
    });
}

// Load students for payment form
async function loadStudentsForPayment() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        studentSelect.innerHTML = '<option value="">Select Student</option>';
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            option.setAttribute('data-phone', student.phoneNumber);
            studentSelect.appendChild(option);
        });
    } catch (error) {
        showNotification('Error loading students', true);
        console.error(error);
    }
}

// Fetch and display payments
async function fetchPayments() {
    try {
        const response = await fetch(PAYMENT_API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch payments');
        }
        const payments = await response.json();
        displayPayments(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        showNotification('Error fetching payments', true);
    }
}

// Initialize payments pagination
function initializePaymentsPagination() {
    paymentsPagination = new TablePagination({
        containerId: 'payments-panel',
        tableId: 'paymentsTable',
        data: [],
        pageSize: 10,
        renderRow: renderPaymentRow,
        searchFilter: (payment, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return (payment.receiptNumber && payment.receiptNumber.toLowerCase().includes(term)) ||
                (payment.student && payment.student.name && payment.student.name.toLowerCase().includes(term)) ||
                (payment.amount && payment.amount.toString().includes(term)) ||
                (payment.paymentMethod && payment.paymentMethod.toLowerCase().includes(term)) ||
                (payment.status && payment.status.toLowerCase().includes(term));
        }
    });

    // Make it globally accessible
    window.payments_panelPagination = paymentsPagination;

    // Connect search input
    const searchInput = document.getElementById('paymentSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            paymentsPagination.search(e.target.value);
        });
    }
}

// Render a single payment row for pagination
function renderPaymentRow(payment, index) {
    return `
        <tr>
            <td>${payment.receiptNumber || 'N/A'}</td>
            <td>${payment.student ? payment.student.name : 'N/A'}</td>
            <td>₹${payment.amount || 0}</td>
            <td>${payment.paymentMethod || 'N/A'}</td>
            <td>${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</td>
            <td>
                <span class="status-badge ${payment.status ? payment.status.toLowerCase() : 'pending'}">${payment.status || 'Pending'}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="fetchPaymentAndGenerateReceipt(${payment.id})" title="Generate Receipt">
                        <i class="fas fa-receipt"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deletePayment(${payment.id})" title="Delete Payment">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Display payments in table
function displayPayments(payments) {
    // Store all payments globally
    allPayments = payments;

    // Initialize pagination if not already done
    if (!paymentsPagination) {
        initializePaymentsPagination();
    }

    // Update pagination with new data
    paymentsPagination.updateData(payments);
}

// Generate receipt for a payment
async function fetchPaymentAndGenerateReceipt(paymentId) {
    try {
        const response = await fetch(`${PAYMENT_API_URL}/${paymentId}`);
        const payment = await response.json();
        generateReceipt(payment);
    } catch (error) {
        showNotification('Error generating receipt', true);
        console.error(error);
    }
}

// Generate compact professional payment receipt
function generateReceipt(payment) {
    console.log('Generating compact professional receipt for:', payment);

    // NOTE: Transaction ID (receiptNumber) is generated by the backend server
    // If you need to generate it on frontend, here's how it could be done:
    // function generateTransactionId() {
    //     const date = new Date();
    //     const year = date.getFullYear().toString().substr(-2);
    //     const month = (date.getMonth() + 1).toString().padStart(2, '0');
    //     const day = date.getDate().toString().padStart(2, '0');
    //     const hours = date.getHours().toString().padStart(2, '0');
    //     const minutes = date.getMinutes().toString().padStart(2, '0');
    //     const seconds = date.getSeconds().toString().padStart(2, '0');
    //     const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    //     return `TXN${year}${month}${day}${hours}${minutes}${seconds}${random}`;
    // }
    // Example: TXN241228143045123 (TXN + YYMMDDHHMMSS + 3-digit random)

    // Create compact professional receipt HTML
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Payment Receipt - ${payment.receiptNumber}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.4;
                    color: #2c3e50;
                    background: #f8f9fa;
                    padding: 20px;
                    font-size: 14px;
                }
                
                .receipt-container {
                    max-width: 900px;
                    width: 100%;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e0e0e0;
                }
                
                .receipt-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
                }
                
                .header {
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                    color: white;
                    padding: 25px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                
                .institute-name {
                    font-size: 2.5rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    color: white;
                }
                
                .header-right {
                    text-align: right;
                }
                
                .receipt-badge {
                    background: rgba(255, 255, 255, 0.15);
                    padding: 8px 20px;
                    border-radius: 25px;
                    font-size: 1rem;
                    font-weight: 600;
                    display: inline-block;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                
                .receipt-date {
                    font-size: 0.9rem;
                    opacity: 0.9;
                    margin-top: 8px;
                }
                
                .receipt-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 30px;
                    padding: 30px 40px;
                    background: #f8f9fa;
                    border-bottom: 2px solid #e9ecef;
                }
                
                .info-card {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                    border-left: 4px solid #2c3e50;
                    text-align: center;
                }
                
                .info-label {
                    font-size: 0.8rem;
                    color: #6c757d;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                    font-weight: 600;
                }
                
                .info-value {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #2c3e50;
                }
                
                .receipt-number {
                    color: #2c3e50;
                    font-family: 'Courier New', monospace;
                }
                
                .payment-details {
                    padding: 30px 40px;
                }
                
                .section-title {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #2c3e50;
                    margin-bottom: 25px;
                    text-align: center;
                    border-bottom: 2px solid #2c3e50;
                    padding-bottom: 10px;
                }
                
                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px 40px;
                    margin-bottom: 30px;
                }
                
                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #e9ecef;
                }
                
                .detail-label {
                    font-weight: 600;
                    color: #495057;
                    font-size: 0.95rem;
                }
                
                .detail-value {
                    font-weight: 600;
                    color: #2c3e50;
                    font-size: 0.95rem;
                    text-align: right;
                }
                
                .amount-highlight {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    border-left-color: #28a745 !important;
                    grid-column: 1 / -1;
                    justify-content: center;
                    text-align: center;
                    font-size: 1.1rem;
                }
                
                .amount-highlight .detail-label,
                .amount-highlight .detail-value {
                    color: white;
                    font-weight: 700;
                    font-size: 1.2rem;
                }
                
                .payment-summary {
                    background: #2c3e50;
                    color: white;
                    padding: 25px 40px;
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 30px;
                    text-align: center;
                }
                
                .summary-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .summary-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .summary-value {
                    font-size: 1.1rem;
                    font-weight: 700;
                }
                
                .footer {
                    background: #f8f9fa;
                    padding: 30px 40px;
                    border-top: 2px solid #e9ecef;
                }
                
                .footer-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    align-items: center;
                }
                
                .thank-you {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #2c3e50;
                    text-align: left;
                }
                
                .generated-info {
                    text-align: right;
                    font-size: 0.8rem;
                    color: #6c757d;
                    line-height: 1.4;
                }
                
                .print-button {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 50px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin: 20px;
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                    transition: all 0.3s ease;
                }
                
                .print-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
                }
                
                @media print {
                    body {
                        background: white;
                        padding: 0;
                        font-size: 13px;
                    }
                    .receipt-container {
                        box-shadow: none;
                        border-radius: 0;
                        max-width: 100%;
                        width: 100%;
                    }
                    .print-button {
                        display: none;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 0.5in;
                    }
                }
                
                @media (max-width: 900px) {
                    .receipt-info {
                        grid-template-columns: 1fr;
                        gap: 15px;
                        padding: 20px;
                    }
                    
                    .payment-details {
                        padding: 20px;
                    }
                    
                    .details-grid {
                        grid-template-columns: 1fr;
                        gap: 15px;
                    }
                    
                    .payment-summary {
                        grid-template-columns: 1fr;
                        gap: 20px;
                        padding: 20px;
                    }
                    
                    .footer-content {
                        grid-template-columns: 1fr;
                        gap: 20px;
                        text-align: center;
                    }
                    
                    .generated-info {
                        text-align: center;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="header">
                    <div class="header-left">
                        <h1 class="institute-name">SIMT</h1>
                    </div>
                    <div class="header-right">
                        <div class="receipt-badge">Payment Receipt</div>
                        <div class="receipt-date">${new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}</div>
                    </div>
                </div>
                
                <div class="receipt-info">
                    <div class="info-card">
                        <div class="info-label">Receipt Number</div>
                        <div class="info-value receipt-number">${payment.receiptNumber}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Payment Date</div>
                        <div class="info-value">${new Date(payment.paymentDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Transaction Status</div>
                        <div class="info-value" style="color: #28a745;">✓ Completed</div>
                    </div>
                </div>
                
                <div class="payment-details">
                    <h2 class="section-title">Payment Transaction Details</h2>
                    
                    <div class="details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Student Name</div>
                            <div class="detail-value">${payment.student.name}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Student Phone</div>
                            <div class="detail-value">${payment.student.phoneNumber || 'N/A'}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Payment Method</div>
                            <div class="detail-value">${payment.paymentMethod}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Description</div>
                            <div class="detail-value">${payment.description}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Transaction Status</div>
                            <div class="detail-value">${payment.status || 'Completed'}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Transaction ID</div>
                            <div class="detail-value">${payment.receiptNumber}</div>
                        </div>
                        
                        <div class="detail-item amount-highlight">
                            <div class="detail-label">Total Amount Paid</div>
                            <div class="detail-value">₹${parseFloat(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                    </div>
                </div>
                
                <div class="payment-summary">
                    <div class="summary-item">
                        <div class="summary-label">Payment Status</div>
                        <div class="summary-value" style="color: #28a745;">✓ Completed</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Transaction ID</div>
                        <div class="summary-value" style="font-family: 'Courier New', monospace;">${payment.receiptNumber}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Amount</div>
                        <div class="summary-value">₹${parseFloat(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="footer-content">
                        <div class="thank-you">
                            Thank you for your payment!<br>
                            <small style="font-weight: normal; opacity: 0.8;">This is a computer-generated receipt.</small>
                        </div>
                        
                        <div class="generated-info">
                            Generated: ${new Date().toLocaleDateString('en-IN')}<br>
                            Time: ${new Date().toLocaleTimeString('en-IN')}<br>
                            System: SIMT v2.0
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center;">
                <button class="print-button" onclick="window.print()">🖨️ Print Receipt</button>
            </div>
        </body>
        </html>
    `;

    // Create and download the receipt as HTML file
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${payment.receiptNumber}_${payment.student.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also open receipt in new window for immediate viewing
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
}

// Initialize payments when payments tab is clicked
document.querySelector('[data-tab="payments"]').addEventListener('click', () => {
    fetchPayments();
});

// Delete payment
async function deletePayment(id) {
    try {
        const response = await fetch(`${PAYMENT_API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            showNotification('Payment deleted successfully!');
            fetchPayments();
        } else {
            showNotification('Error deleting payment', true);
        }
    } catch (error) {
        showNotification('Error deleting payment', true);
        console.error(error);
    }
}

// Add payment search functionality
document.getElementById('paymentSearchInput').addEventListener('input', () => {
    fetchPayments();
});

// Student search for Add Payment modal
const studentSearchInput = document.getElementById('studentSearchInput');
if (studentSearchInput && studentSelect) {
    studentSearchInput.addEventListener('input', function () {
        const searchTerm = this.value.trim().toLowerCase();
        // Store all students in a global variable if not already
        if (!window._allStudentsForPayment) {
            window._allStudentsForPayment = [];
            for (let i = 0; i < studentSelect.options.length; i++) {
                const opt = studentSelect.options[i];
                if (opt.value) {
                    window._allStudentsForPayment.push({
                        value: opt.value,
                        text: opt.textContent,
                        phone: opt.getAttribute('data-phone') || ''
                    });
                }
            }
        }
        // Filter and repopulate
        studentSelect.innerHTML = '<option value="">Select Student</option>';
        window._allStudentsForPayment.forEach(opt => {
            if (
                opt.text.toLowerCase().includes(searchTerm) ||
                opt.value.toLowerCase().includes(searchTerm)
            ) {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.text;
                if (opt.phone) option.setAttribute('data-phone', opt.phone);
                studentSelect.appendChild(option);
            }
        });
    });
}

// Teacher Management Functions
function showAddTeacherForm() {
    document.getElementById('teacher-form').style.display = 'block';
    document.getElementById('teacherForm').reset();
    document.getElementById('teacherId').value = '';
}

function hideTeacherForm() {
    document.getElementById('teacher-form').style.display = 'none';
}

// Initialize teachers pagination
function initializeTeachersPagination() {
    teachersPagination = new TablePagination({
        containerId: 'teachers-panel',
        tableId: 'teachersTable',
        data: [],
        pageSize: 10,
        renderRow: renderTeacherRow,
        searchFilter: (teacher, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return (teacher.name && teacher.name.toLowerCase().includes(term)) ||
                (teacher.email && teacher.email.toLowerCase().includes(term)) ||
                (teacher.phoneNumber && teacher.phoneNumber.includes(term)) ||
                (teacher.qualification && teacher.qualification.toLowerCase().includes(term)) ||
                (teacher.specialization && teacher.specialization.toLowerCase().includes(term));
        }
    });

    window.teachers_panelPagination = teachersPagination;
}

// Render a single teacher row for pagination
function renderTeacherRow(teacher, index) {
    return `
        <tr>
            <td>
                <img src="${teacher.photoUrl || '/uploads/teachers/default-teacher.png'}" 
                     alt="${teacher.name}" 
                     class="teacher-photo"
                     onerror="this.src='/uploads/teachers/default-teacher.png'">
            </td>
            <td>${teacher.name}</td>
            <td>${teacher.email}</td>
            <td>${teacher.phoneNumber}</td>
            <td>${teacher.qualification}</td>
            <td>${teacher.specialization}</td>
            <td>${new Date(teacher.joiningDate).toLocaleDateString()}</td>
            <td>₹${teacher.salary.toLocaleString()}</td>
            <td>
                <span class="teacher-status status-${teacher.status.toLowerCase()}">
                    ${teacher.status}
                </span>
            </td>
            <td class="teacher-role">${teacher.role}</td>
            <td class="teacher-actions">
                <button class="edit-teacher-btn" onclick="editTeacher(${teacher.id})">
                    Edit
                </button>
                <button class="delete-teacher-btn" onclick="deleteTeacher(${teacher.id})">
                    Delete
                </button>
            </td>
        </tr>
    `;
}

function loadTeachers() {
    fetch(`${window.location.protocol}//${window.location.hostname}:4455/api/teachers`)
        .then(response => {
            if (!response.ok) {
                // If 404, suppress error notification
                if (response.status === 404) return Promise.reject({ suppress: true });
            }
            return response.json();
        })
        .then(teachers => {
            // Store all teachers globally
            allTeachers = teachers;

            // Initialize pagination if not already done
            if (!teachersPagination) {
                initializeTeachersPagination();
            }

            // Update pagination with new data
            teachersPagination.updateData(teachers);
        })
        .catch(error => {
            // Suppress error notification for 404 or invalid JSON
            if (error && error.suppress) return;
            if (error instanceof SyntaxError) return;
            console.error('Error loading teachers:', error);
            showNotification('Error loading teachers', 'error');
        });
}

function editTeacher(id) {
    fetch(`${window.location.protocol}//${window.location.hostname}:4455/api/teachers/${id}`)
        .then(response => response.json())
        .then(teacher => {
            document.getElementById('teacherId').value = teacher.id;
            document.getElementById('teacherName').value = teacher.name;
            document.getElementById('teacherEmail').value = teacher.email;
            document.getElementById('teacherPhone').value = teacher.phoneNumber;
            document.getElementById('teacherAddress').value = teacher.address;
            document.getElementById('teacherQualification').value = teacher.qualification;
            document.getElementById('teacherSpecialization').value = teacher.specialization;
            document.getElementById('teacherJoiningDate').value = teacher.joiningDate;
            document.getElementById('teacherSalary').value = teacher.salary;
            document.getElementById('teacherStatus').value = teacher.status;
            document.getElementById('teacherRole').value = teacher.role;

            document.getElementById('teacher-form').style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading teacher details:', error);
            showNotification('Error loading teacher details', 'error');
        });
}

function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        fetch(`${window.location.protocol}//${window.location.hostname}:4455/api/teachers/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    showNotification('Teacher deleted successfully', 'success');
                    loadTeachers();
                } else {
                    throw new Error('Failed to delete teacher');
                }
            })
            .catch(error => {
                console.error('Error deleting teacher:', error);
                showNotification('Error deleting teacher', 'error');
            });
    }
}

const teacherFormEl = document.getElementById('teacherForm');
if (teacherFormEl) {
    teacherFormEl.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData();
        const teacherId = document.getElementById('teacherId').value;

        const teacher = {
            name: document.getElementById('teacherName').value,
            email: document.getElementById('teacherEmail').value,
            phoneNumber: document.getElementById('teacherPhone').value,
            address: document.getElementById('teacherAddress').value,
            qualification: document.getElementById('teacherQualification').value,
            specialization: document.getElementById('teacherSpecialization').value,
            joiningDate: document.getElementById('teacherJoiningDate').value,
            salary: parseFloat(document.getElementById('teacherSalary').value),
            status: document.getElementById('teacherStatus').value,
            role: document.getElementById('teacherRole').value
        };

        formData.append('teacher', new Blob([JSON.stringify(teacher)], {
            type: 'application/json'
        }));

        const photoFile = document.getElementById('teacherPhoto').files[0];
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        const url = teacherId ? `${window.location.protocol}//${window.location.hostname}:4455/api/teachers/${teacherId}` : `${window.location.protocol}//${window.location.hostname}:4455/api/teachers`;
        const method = teacherId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    showNotification(
                        `Teacher ${teacherId ? 'updated' : 'added'} successfully`,
                        'success'
                    );
                    hideTeacherForm();
                    loadTeachers();
                } else {
                    throw new Error(`Failed to ${teacherId ? 'update' : 'add'} teacher`);
                }
            })
            .catch(error => {
                console.error('Error saving teacher:', error);
                showNotification('Error saving teacher', 'error');
            });
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();
    fetchPayments();
});

// Add these new functions for ID card functionality
function showIdCard(studentId) {
    // Use the global allStudents variable
    const student = allStudents.find(s => s.id === studentId);

    if (!student) {
        console.error('Student not found for ID card:', studentId);
        showNotification('Student data not found for ID card', true);
        return;
    }

    console.log('Found student for ID card:', student);

    // Calculate valid till date based on course duration
    const validTill = calculateValidTillDate(student.courseDuration);

    // Update ID card content
    document.getElementById('idCardName').textContent = student.name;
    document.getElementById('idCardId').textContent = `STU${String(student.id).padStart(4, '0')}`;
    document.getElementById('idCardCourse').textContent = student.courses;
    document.getElementById('idCardDuration').textContent = student.courseDuration;
    document.getElementById('idCardValidTill').textContent = validTill;

    // Show modal
    const modal = document.getElementById('idCardModal');
    modal.style.display = 'block';
}

function calculateValidTillDate(duration) {
    const today = new Date();
    let months = 0;

    if (duration.includes('Month')) {
        months = parseInt(duration);
    } else if (duration.includes('Year')) {
        months = parseInt(duration) * 12;
    }

    const validTill = new Date(today.setMonth(today.getMonth() + months));
    return validTill.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Add event listeners for ID card modal
document.getElementById('closeIdCardModal').addEventListener('click', () => {
    document.getElementById('idCardModal').style.display = 'none';
});

document.getElementById('downloadIdCard').addEventListener('click', async () => {
    const idCard = document.querySelector('.id-card');

    try {
        // Use html2canvas to capture the ID card
        const canvas = await html2canvas(idCard, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `student_id_card_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');
    } catch (error) {
        console.error('Error generating ID card:', error);
        showNotification('Error generating ID card', 'error');
    }
});

document.getElementById('shareIdCard').addEventListener('click', async () => {
    const idCard = document.querySelector('.id-card');

    try {
        // Use html2canvas to capture the ID card
        const canvas = await html2canvas(idCard, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            const file = new File([blob], 'student_id_card.png', { type: 'image/png' });

            if (navigator.share) {
                navigator.share({
                    title: 'Student ID Card',
                    text: 'Check out this student ID card',
                    files: [file]
                }).catch(error => {
                    console.error('Error sharing:', error);
                    showNotification('Error sharing ID card', 'error');
                });
            } else {
                showNotification('Sharing is not supported on this browser', 'error');
            }
        }, 'image/png');
    } catch (error) {
        console.error('Error sharing ID card:', error);
        showNotification('Error sharing ID card', 'error');
    }
});

// Add html2canvas library to your HTML file
const html2canvasScript = document.createElement('script');
html2canvasScript.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
document.head.appendChild(html2canvasScript);

// Reports functionality
async function loadReports() {
    try {
        console.log('Loading reports...');

        // Fetch enquiries
        const enquiriesResponse = await fetch(`${window.location.protocol}//${window.location.hostname}:4455/api/enquiries`);
        if (!enquiriesResponse.ok) {
            throw new Error(`Failed to fetch enquiries: ${enquiriesResponse.status}`);
        }
        const enquiries = await enquiriesResponse.json();
        console.log('Fetched enquiries:', enquiries);

        // Set current month as default in selector
        const currentMonth = new Date().getMonth();
        const monthSelect = document.getElementById('enquiryMonthSelect');
        if (!monthSelect) {
            console.error('Month select element not found');
            return;
        }
        monthSelect.value = currentMonth;

        // Load initial month's data
        loadMonthEnquiries(enquiries, currentMonth);

        // Add event listener for month change
        monthSelect.addEventListener('change', (e) => {
            loadMonthEnquiries(enquiries, parseInt(e.target.value));
        });

        // Get pending enquiries
        const pendingEnquiries = enquiries.filter(enquiry =>
            enquiry.status === 'PENDING' || enquiry.status === 'pending'
        );
        console.log('Pending enquiries:', pendingEnquiries);

        // Update pending enquiries count
        const pendingEnquiriesCount = document.getElementById('pendingEnquiries');
        if (pendingEnquiriesCount) {
            pendingEnquiriesCount.textContent = pendingEnquiries.length;
        }

        // Update pending enquiries list
        const pendingEnquiriesList = document.querySelector('#pendingEnquiriesList tbody');
        if (pendingEnquiriesList) {
            if (pendingEnquiries.length === 0) {
                pendingEnquiriesList.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center;">No pending enquiries</td>
                    </tr>
                `;
            } else {
                pendingEnquiriesList.innerHTML = pendingEnquiries.map(enquiry => `
                    <tr>
                        <td>${enquiry.name || 'N/A'}</td>
                        <td>${enquiry.course || 'N/A'}</td>
                        <td>${enquiry.phoneNumber || 'N/A'}</td>
                        <td>${enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                `).join('');
            }
        } else {
            console.error('Pending enquiries list element not found');
        }

        // Fetch students for pending fees
        const studentsResponse = await fetch(API_URL);
        if (!studentsResponse.ok) {
            throw new Error(`Failed to fetch students: ${studentsResponse.status}`);
        }
        const students = await studentsResponse.json();
        console.log('Fetched students:', students);

        // Calculate total pending fees
        const totalPendingFees = students.reduce((total, student) => {
            return total + (parseFloat(student.remainingAmount) || 0);
        }, 0);

        const totalPendingFeesElement = document.getElementById('totalPendingFees');
        if (totalPendingFeesElement) {
            totalPendingFeesElement.textContent = `₹${totalPendingFees.toFixed(2)}`;
        }

        // Update pending fees list
        const pendingFeesList = document.getElementById('pendingFeesList');
        if (pendingFeesList) {
            const studentsWithPendingFees = students
                .filter(student => (parseFloat(student.remainingAmount) || 0) > 0)
                .sort((a, b) => (parseFloat(b.remainingAmount) || 0) - (parseFloat(a.remainingAmount) || 0))
                .slice(0, 5);

            if (studentsWithPendingFees.length === 0) {
                pendingFeesList.innerHTML = `
                    <div class="report-list-item">
                        <span class="item-name">No pending fees</span>
                    </div>
                `;
            } else {
                pendingFeesList.innerHTML = studentsWithPendingFees.map(student => `
                    <div class="report-list-item">
                        <span class="item-name">${student.name || 'N/A'}</span>
                        <span class="item-value">₹${(parseFloat(student.remainingAmount) || 0).toFixed(2)}</span>
                    </div>
                `).join('');
            }
        }

        // Update total students count
        const totalStudentsElement = document.getElementById('totalStudents');
        if (totalStudentsElement) {
            totalStudentsElement.textContent = students.length;
        }

        // Initialize student growth chart
        initializeStudentGrowthChart(students);

    } catch (error) {
        console.error('Error loading reports:', error);
        showNotification('Error loading reports: ' + error.message, true);
    }
}

function loadMonthEnquiries(enquiries, month) {
    console.log('Loading enquiries for month:', month);
    const currentYear = new Date().getFullYear();
    const monthEnquiries = enquiries.filter(enquiry => {
        const enquiryDate = new Date(enquiry.createdAt);
        return enquiryDate.getMonth() === month &&
            enquiryDate.getFullYear() === currentYear;
    });
    console.log('Filtered enquiries for month:', monthEnquiries);

    // Update count
    const countElement = document.getElementById('currentMonthEnquiries');
    if (countElement) {
        countElement.textContent = monthEnquiries.length;
    }

    // Update chart
    initializeEnquiriesChart(monthEnquiries);
}

function initializeEnquiriesChart(enquiries) {
    console.log('Initializing enquiries chart with data:', enquiries);
    const ctx = document.getElementById('enquiriesChart');
    if (!ctx) {
        console.error('Enquiries chart canvas not found');
        return;
    }

    // Group enquiries by date
    const enquiriesByDate = {};
    enquiries.forEach(enquiry => {
        if (enquiry.createdAt) {
            const date = new Date(enquiry.createdAt).toLocaleDateString();
            enquiriesByDate[date] = (enquiriesByDate[date] || 0) + 1;
        }
    });
    console.log('Enquiries grouped by date:', enquiriesByDate);

    // Sort dates
    const sortedDates = Object.keys(enquiriesByDate).sort((a, b) => new Date(a) - new Date(b));

    // Destroy existing chart if it exists
    if (enquiriesChart instanceof Chart) {
        enquiriesChart.destroy();
    }

    // Create new chart
    enquiriesChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Enquiries',
                data: sortedDates.map(date => enquiriesByDate[date]),
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                tension: 0.4,
                fill: true
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
}

function initializeStudentGrowthChart(students) {
    console.log('Initializing student growth chart with data:', students);
    const ctx = document.getElementById('studentGrowthChart');
    if (!ctx) {
        console.error('Student growth chart canvas not found');
        return;
    }

    // Group students by month
    const studentsByMonth = {};
    students.forEach(student => {
        if (student.createdAt) {
            const date = new Date(student.createdAt);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            studentsByMonth[monthYear] = (studentsByMonth[monthYear] || 0) + 1;
        }
    });
    console.log('Students grouped by month:', studentsByMonth);

    // Sort months chronologically
    const sortedMonths = Object.keys(studentsByMonth).sort((a, b) => {
        const [monthA, yearA] = a.split('/');
        const [monthB, yearB] = b.split('/');
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });

    // Destroy existing chart if it exists
    if (studentGrowthChart instanceof Chart) {
        studentGrowthChart.destroy();
    }

    // Create new chart
    studentGrowthChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: sortedMonths,
            datasets: [{
                label: 'New Students',
                data: sortedMonths.map(month => studentsByMonth[month]),
                backgroundColor: '#42a5f5',
                borderRadius: 5
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
}

// Add event listener for reports tab
document.querySelector('[data-tab="reports"]').addEventListener('click', () => {
    loadReports();
});

// Add Chart.js library
const chartScript = document.createElement('script');
chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
document.head.appendChild(chartScript);

// Function to display student profile in a modal
async function showStudentProfile(studentId) {
    const student = allStudents.find(s => String(s.id) === String(studentId));
    const modal = document.getElementById('studentProfileModal');
    const profileContent = document.getElementById('studentProfileContent');

    if (!student) {
        if (profileContent) {
            profileContent.innerHTML = '<div class="error-message">Student not found.</div>';
        }
        if (modal) modal.style.display = 'flex';
        return;
    }

    // Calculate fee progress
    const totalFee = parseFloat(student.totalCourseFee) || 0;
    const paidAmount = parseFloat(student.paidAmount) || 0;
    const remainingAmount = totalFee - paidAmount;
    const progress = totalFee > 0 ? (paidAmount / totalFee) * 100 : 0;

    profileContent.innerHTML = `
        <div class="compact-profile-card">
            <div class="profile-header-compact">
                <div class="profile-avatar-compact">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div class="profile-main-info-compact">
                    <h3 class="profile-name-compact">${student.name || 'N/A'}</h3>
                    <div class="profile-id-compact">ID: STU${String(student.id).padStart(4, '0')}</div>
                    <div class="profile-course-compact">${student.courses || 'No Course'}</div>
                </div>
                <div class="profile-status-compact">
                    <div class="fee-progress-compact">
                        <div class="progress-bar-compact">
                            <div class="progress-fill-compact" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text-compact">${progress.toFixed(0)}% Paid</div>
                    </div>
                </div>
            </div>
            
            <div class="profile-details-grid">
                <div class="detail-card">
                    <div class="detail-icon"><i class="fas fa-user"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Personal Info</div>
                        <div class="detail-value">Father: ${student.fatherName || 'N/A'}</div>
                        <div class="detail-value">Mother: ${student.motherName || 'N/A'}</div>
                        <div class="detail-value">DOB: ${student.dob || 'N/A'}</div>
                    </div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-icon"><i class="fas fa-phone"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Contact Info</div>
                        <div class="detail-value">Phone: ${student.phoneNumber || 'N/A'}</div>
                        <div class="detail-value">Email: ${student.email || 'N/A'}</div>
                        <div class="detail-value">Address: ${student.address || 'N/A'}</div>
                    </div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-icon"><i class="fas fa-graduation-cap"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Academic Info</div>
                        <div class="detail-value">Course: ${student.courses || 'N/A'}</div>
                        <div class="detail-value">Duration: ${student.courseDuration || 'N/A'}</div>
                        <div class="detail-value">Joined: ${student.admissionDate || 'N/A'}</div>
                    </div>
                </div>
                
                <div class="detail-card fee-card">
                    <div class="detail-icon"><i class="fas fa-rupee-sign"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Fee Status</div>
                        <div class="detail-value">Total: ₹${formatCurrency(totalFee)}</div>
                        <div class="detail-value">Paid: ₹${formatCurrency(paidAmount)}</div>
                        <div class="detail-value ${remainingAmount > 0 ? 'pending' : 'completed'}">
                            Remaining: ₹${formatCurrency(remainingAmount)}
                        </div>
                    </div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-icon"><i class="fas fa-file-alt"></i></div>
                    <div class="detail-content">
                        <div class="detail-label">Documents</div>
                        <div class="detail-value">
                            ${student.tenthClassDocument ?
            `<a href="${API_BASE}/api/students/document/${student.tenthClassDocument}" target="_blank" class="document-link">
                                    <i class="fas fa-download"></i> 10th Class Document
                                </a>` :
            '<span class="no-document">No 10th class document uploaded</span>'
        }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // Ensure close button works
    const closeBtn = document.getElementById('closeStudentProfileModal');
    if (closeBtn) {
        closeBtn.onclick = function () {
            modal.style.display = 'none';
        };
    }
}

// Event listener for closing the student profile modal
document.getElementById('closeStudentProfileModal').addEventListener('click', () => {
    document.getElementById('studentProfileModal').style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('studentProfileModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});