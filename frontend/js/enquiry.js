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

// Dynamic API base URL for cross-device compatibility
const API_BASE = 'https://aalekhapi.sahaedu.in';
const API_URL = API_BASE + '/api/enquiries';

const enquiryForm = document.getElementById('enquiryForm');
const enquiriesTableBody = document.querySelector('#enquiriesTable tbody');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');
const searchEnquiryInput = document.getElementById('searchEnquiryInput');
const dateFilter = document.getElementById('dateFilter');
const clearDateFilter = document.getElementById('clearDateFilter');
const totalEnquiries = document.getElementById('totalEnquiries');
const filteredEnquiries = document.getElementById('filteredEnquiries');
const feedbackModal = document.getElementById('feedbackModal');
const closeFeedbackModal = document.getElementById('closeFeedbackModal');
const feedbackLog = document.getElementById('feedbackLog');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackDate = document.getElementById('feedbackDate');
const feedbackTime = document.getElementById('feedbackTime');
const feedbackText = document.getElementById('feedbackText');
let currentFeedbackEnquiryId = null;

// Store all enquiries for filtering
let allEnquiries = [];

// Global pagination instance for enquiries
let enquiriesPagination = null;

// Add logout button to header
const header = document.querySelector('header');
const logoutBtn = document.createElement('button');
logoutBtn.textContent = 'Logout';
logoutBtn.className = 'logout-btn';
logoutBtn.onclick = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
};
header.appendChild(logoutBtn);

// === Mobile Menu Functionality ===
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const sidePanel = document.querySelector('.side-panel');

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

// Show notification function
function showNotification(message, isError = false) {
    notificationMessage.textContent = message;
    notification.className = 'notification' + (isError ? ' error' : '');
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Tab switching functionality
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');

        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-panel`) {
                content.classList.add('active');
            }
        });

        if (tabId === 'enquiry-list') {
            fetchEnquiries();
        }
    });
});

// Date filter functionality
if (dateFilter) {
    dateFilter.addEventListener('change', () => {
        applyFilters();
    });
}

// Clear date filter
if (clearDateFilter) {
    clearDateFilter.addEventListener('click', () => {
        dateFilter.value = '';
        applyFilters();
    });
}

// Apply all filters (date and search)
function applyFilters() {
    const selectedDate = dateFilter.value;
    const searchTerm = searchEnquiryInput.value.toLowerCase();

    let filteredEnquiries = allEnquiries;

    // Apply date filter
    if (selectedDate) {
        filteredEnquiries = filteredEnquiries.filter(enquiry => {
            const enquiryDate = new Date(enquiry.dateOfEnquiry).toISOString().split('T')[0];
            return enquiryDate === selectedDate;
        });
    }

    // Apply search filter
    if (searchTerm) {
        filteredEnquiries = filteredEnquiries.filter(enquiry => {
            const name = enquiry.name.toLowerCase();
            const fatherName = (enquiry.fatherName || '').toLowerCase();
            const phone = enquiry.phoneNumber.toLowerCase();
            const remarks = (enquiry.remarks || '').toLowerCase();

            return name.includes(searchTerm) ||
                fatherName.includes(searchTerm) ||
                phone.includes(searchTerm) ||
                remarks.includes(searchTerm);
        });
    }

    displayEnquiries(filteredEnquiries);
    updateStats(allEnquiries.length, filteredEnquiries.length);
}

// Update stats display
function updateStats(total, filtered) {
    if (totalEnquiries) {
        totalEnquiries.textContent = `Total: ${total}`;
    }
    if (filteredEnquiries) {
        filteredEnquiries.textContent = `Showing: ${filtered}`;
    }
}

// Search functionality
searchEnquiryInput.addEventListener('input', (e) => {
    applyFilters();
});

// Fetch and display enquiries
async function fetchEnquiries() {
    try {
        const response = await fetch(API_URL);
        const enquiries = await response.json();
        allEnquiries = enquiries; // Store all enquiries
        applyFilters(); // Apply current filters
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        showNotification('Error fetching enquiries', true);
    }
}

// Initialize enquiries pagination
function initializeEnquiriesPagination() {
    enquiriesPagination = new TablePagination({
        containerId: 'enquiries-panel',
        tableId: 'enquiriesTable',
        data: [],
        pageSize: 10,
        renderRow: renderEnquiryRow,
        searchFilter: (enquiry, searchTerm) => {
            const term = searchTerm.toLowerCase();
            return (enquiry.name && enquiry.name.toLowerCase().includes(term)) ||
                (enquiry.fatherName && enquiry.fatherName.toLowerCase().includes(term)) ||
                (enquiry.phoneNumber && enquiry.phoneNumber.includes(term)) ||
                (enquiry.course && enquiry.course.toLowerCase().includes(term)) ||
                (enquiry.takenBy && enquiry.takenBy.toLowerCase().includes(term));
        }
    });

    window.enquiries_panelPagination = enquiriesPagination;

    // Connect search input
    if (searchEnquiryInput) {
        searchEnquiryInput.addEventListener('input', (e) => {
            enquiriesPagination.search(e.target.value);
        });
    }
}

// Render a single enquiry row for pagination
function renderEnquiryRow(enquiry, index) {
    const row = `
        <tr>
            <td>${enquiry.name}</td>
            <td>${enquiry.fatherName || ''}</td>
            <td>${new Date(enquiry.dateOfEnquiry).toLocaleDateString()}</td>
            <td>${enquiry.takenBy || 'N/A'}</td>
            <td>${enquiry.phoneNumber}</td>
            <td>${enquiry.course || ''}</td>
            <td>${enquiry.courseDuration || ''}</td>
            <td class="mobile-hide">${enquiry.remarks || ''}</td>
            <td>
                <span class="badge ${enquiry.convertedToStudent ? 'bg-success' : 'bg-warning'}">
                    ${enquiry.convertedToStudent ? 'Confirmed' : 'Pending'}
                </span>
            </td>
            <td class="mobile-hide">
                <div class="latest-feedback-cell" id="feedback-${enquiry.id}">
                    <span style="color:#aaa;">Loading...</span>
                </div>
                <button class="action-btn feedback-btn" data-id="${enquiry.id}" title="View/Add Feedback" style="margin-top:6px;">
                    <i class="fas fa-comments"></i>
                </button>
            </td>
            <td class="mobile-hide">
                <div class="action-buttons">
                    ${!enquiry.convertedToStudent ? `
                        <button class="action-btn convert-btn" data-id="${enquiry.id}" title="Convert to Student">
                            <i class="fas fa-user-plus"></i>
                            <span>Convert</span>
                        </button>
                    ` : `
                        <button class="action-btn reverse-btn" data-id="${enquiry.id}" title="Reverse Conversion">
                            <i class="fas fa-undo"></i>
                            <span>Reverse</span>
                        </button>
                    `}
                </div>
            </td>
            <td class="mobile-hide">
                ${!enquiry.convertedToStudent ? `
                    <input type="checkbox" class="convert-checkbox" data-id="${enquiry.id}" title="Mark as Confirmed">
                ` : ''}
            </td>
        </tr>
    `;

    // Load latest feedback for this enquiry after rendering
    setTimeout(() => loadLatestFeedbackForEnquiry(enquiry.id), 100);

    return row;
}

// Display enquiries in table
function displayEnquiries(enquiries) {
    // Store all enquiries globally
    allEnquiries = enquiries;

    // Initialize pagination if not already done
    if (!enquiriesPagination) {
        initializeEnquiriesPagination();
    }

    // Update pagination with new data
    enquiriesPagination.updateData(enquiries);

    // Add event listeners after pagination renders
    setTimeout(() => {
        addEnquiryEventListeners();
    }, 200);
}

// Add event listeners to enquiry action buttons
function addEnquiryEventListeners() {
    // Feedback buttons
    document.querySelectorAll('.feedback-btn').forEach(btn => {
        if (!btn.hasAttribute('data-listener-attached')) {
            btn.addEventListener('click', (e) => {
                const enquiryId = e.currentTarget.getAttribute('data-id');
                const enquiry = allEnquiries.find(enq => enq.id == enquiryId);
                if (enquiry) openFeedbackModal(enquiry);
            });
            btn.setAttribute('data-listener-attached', 'true');
        }
    });

    // Convert buttons
    document.querySelectorAll('.convert-btn').forEach(btn => {
        if (!btn.hasAttribute('data-listener-attached')) {
            btn.addEventListener('click', (e) => {
                const enquiryId = e.currentTarget.getAttribute('data-id');
                convertToStudent(enquiryId);
            });
            btn.setAttribute('data-listener-attached', 'true');
        }
    });

    // Reverse buttons
    document.querySelectorAll('.reverse-btn').forEach(btn => {
        if (!btn.hasAttribute('data-listener-attached')) {
            btn.addEventListener('click', (e) => {
                const enquiryId = e.currentTarget.getAttribute('data-id');
                reverseConversion(enquiryId);
            });
            btn.setAttribute('data-listener-attached', 'true');
        }
    });

    // Convert checkboxes
    document.querySelectorAll('.convert-checkbox').forEach(checkbox => {
        if (!checkbox.hasAttribute('data-listener-attached')) {
            checkbox.addEventListener('change', async (e) => {
                if (e.target.checked) {
                    const enquiryId = e.target.getAttribute('data-id');
                    try {
                        const response = await fetch(`${API_URL}/${enquiryId}/convert`, {
                            method: 'POST'
                        });
                        if (response.ok) {
                            showNotification('Enquiry marked as Confirmed!');
                            fetchEnquiries(); // Refresh the list
                        } else {
                            const errorText = await response.text();
                            throw new Error(errorText || 'Failed to mark enquiry as confirmed');
                        }
                    } catch (error) {
                        console.error('Error marking enquiry as confirmed:', error);
                        showNotification('Error marking enquiry as confirmed: ' + error.message, true);
                        e.target.checked = false; // Uncheck the box on error
                    }
                }
            });
            checkbox.setAttribute('data-listener-attached', 'true');
        }
    });
}


async function loadLatestFeedbackForEnquiry(enquiryId) {
    try {
        const response = await fetch(`${API_URL}/${enquiryId}/feedback`);
        if (response.ok) {
            const entries = await response.json();
            const feedbackCell = document.getElementById(`feedback-${enquiryId}`);
            if (feedbackCell) {
                if (entries.length > 0) {
                    const last = entries[0]; // First entry is the latest due to DESC ordering
                    feedbackCell.innerHTML = `
                        <span class="feedback-datetime">${last.date} ${last.time}</span><br>
                        <span class="feedback-text">${last.feedback.length > 40 ? last.feedback.slice(0, 40) + '…' : last.feedback}</span>
                    `;
                } else {
                    feedbackCell.innerHTML = '<span style="color:#aaa;">No feedback</span>';
                }
            }
        }
    } catch (error) {
        console.error('Error loading latest feedback:', error);
        const feedbackCell = document.getElementById(`feedback-${enquiryId}`);
        if (feedbackCell) {
            feedbackCell.innerHTML = '<span style="color:#aaa;">Error loading</span>';
        }
    }
}

// Handle form submission
enquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const formData = {
            name: document.getElementById('name').value,
            fatherName: document.getElementById('fatherName').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            course: document.getElementById('course').value,
            courseDuration: document.getElementById('courseDuration').value,
            remarks: document.getElementById('remarks').value,
            dateOfEnquiry: document.getElementById('enquiryDate').value,
            takenBy: document.getElementById('takenBy').value,
            convertedToStudent: false
        };

        console.log('Submitting enquiry:', formData); // Debug log

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit enquiry');
        }

        const result = await response.json();
        console.log('Enquiry submitted successfully:', result); // Debug log

        showNotification('Enquiry submitted successfully!');
        enquiryForm.reset();
        // Switch to enquiry list tab
        document.querySelector('[data-tab="enquiry-list"]').click();
    } catch (error) {
        console.error('Error submitting enquiry:', error);
        showNotification('Error submitting enquiry: ' + error.message, true);
    }
});

// Convert enquiry to student
async function convertToStudent(id) {
    try {
        // Get the enquiry data first
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch enquiry data');
        const enquiry = await response.json();

        // Store enquiry data in localStorage
        localStorage.setItem('enquiryToStudent', JSON.stringify(enquiry));

        // Redirect to main dashboard (index.html) and open Add Student tab
        window.location.href = 'index.html?addStudentFromEnquiry=1';
    } catch (error) {
        console.error('Error preparing to convert enquiry:', error);
        showNotification('Error preparing to convert enquiry', true);
    }
}

// Add reverse conversion function
async function reverseConversion(id) {
    if (!confirm('Are you sure you want to reverse this conversion? This will mark the enquiry as pending again.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}/reverse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showNotification('Enquiry conversion reversed successfully!');
            fetchEnquiries();
            // Also refresh the student list in the main window if available
            if (window.opener && typeof window.opener.fetchStudents === 'function') {
                window.opener.fetchStudents();
            } else if (window.parent && typeof window.parent.fetchStudents === 'function') {
                window.parent.fetchStudents();
            } else if (window.fetchStudents) {
                window.fetchStudents();
            }
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to reverse conversion');
        }
    } catch (error) {
        console.error('Error reversing conversion:', error);
        showNotification('Error reversing conversion: ' + error.message, true);
    }
}

function openFeedbackModal(enquiry) {
    currentFeedbackEnquiryId = enquiry.id;
    // Load feedback from backend API
    loadFeedbackFromAPI(enquiry.id);
    feedbackModal.style.display = 'block';
    feedbackForm.reset();
    // Default date/time to now
    const now = new Date();
    feedbackDate.value = now.toISOString().split('T')[0];
    feedbackTime.value = now.toTimeString().slice(0, 5);
}

async function loadFeedbackFromAPI(enquiryId) {
    try {
        const response = await fetch(`${API_URL}/${enquiryId}/feedback`);
        if (response.ok) {
            const entries = await response.json();
            renderFeedbackLog(entries);
        } else {
            renderFeedbackLog([]);
        }
    } catch (error) {
        console.error('Error loading feedback:', error);
        renderFeedbackLog([]);
    }
}

function renderFeedbackLog(entries) {
    if (!entries.length) {
        feedbackLog.innerHTML = '<p>No feedback entries yet. Add the first communication record below.</p>';
        return;
    }
    feedbackLog.innerHTML = entries.map(e => `
        <div class="feedback-entry">
            <div class="feedback-datetime">${e.date} ${e.time}</div>
            <div class="feedback-text">${e.feedback}</div>
        </div>
    `).join('');
}

if (closeFeedbackModal) {
    closeFeedbackModal.onclick = () => {
        feedbackModal.style.display = 'none';
        currentFeedbackEnquiryId = null;
    };
}

window.onclick = function (event) {
    if (event.target === feedbackModal) {
        feedbackModal.style.display = 'none';
        currentFeedbackEnquiryId = null;
    }
};

if (feedbackForm) {
    feedbackForm.onsubmit = async function (e) {
        e.preventDefault();
        if (!currentFeedbackEnquiryId) return;
        const entry = {
            date: feedbackDate.value,
            time: feedbackTime.value,
            feedback: feedbackText.value
        };
        try {
            const response = await fetch(`${API_URL}/${currentFeedbackEnquiryId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });
            if (response.ok) {
                showNotification('Feedback added!');
                // Reload feedback from API
                await loadFeedbackFromAPI(currentFeedbackEnquiryId);
                // Refresh the enquiry list to show latest feedback
                fetchEnquiries();
                feedbackForm.reset();
                // Set date/time to now for next entry
                const now = new Date();
                feedbackDate.value = now.toISOString().split('T')[0];
                feedbackTime.value = now.toTimeString().slice(0, 5);
            } else {
                showNotification('Failed to add feedback', true);
            }
        } catch (error) {
            console.error('Error adding feedback:', error);
            showNotification('Error adding feedback', true);
        }
    };
}

// Character counting for feedback textarea
function initializeCharacterCounter() {
    const feedbackTextarea = document.getElementById('feedbackText');
    const charCountElement = document.querySelector('.char-count');

    if (feedbackTextarea && charCountElement) {
        feedbackTextarea.addEventListener('input', function () {
            const currentLength = this.value.length;
            charCountElement.textContent = `${currentLength} characters`;

            // Change color based on length
            if (currentLength < 50) {
                charCountElement.style.color = '#ef4444'; // Red for too short
            } else if (currentLength < 100) {
                charCountElement.style.color = '#f59e0b'; // Orange for moderate
            } else {
                charCountElement.style.color = '#10b981'; // Green for good length
            }
        });
    }
}

// Enhanced feedback modal opening with animations
function openFeedbackModal(enquiry) {
    currentFeedbackEnquiryId = enquiry.id;

    // Load feedback from backend API
    loadFeedbackFromAPI(enquiry.id);

    // Show modal with animation
    feedbackModal.style.display = 'block';
    setTimeout(() => {
        feedbackModal.classList.add('show');
    }, 10);

    // Reset form and initialize character counter
    feedbackForm.reset();
    initializeCharacterCounter();

    // Default date/time to now
    const now = new Date();
    feedbackDate.value = now.toISOString().split('T')[0];
    feedbackTime.value = now.toTimeString().slice(0, 5);

    // Initialize scroll handling for the modal body
    initializeFeedbackModalScrolling();

    // Focus on the feedback textarea
    setTimeout(() => {
        const feedbackTextarea = document.getElementById('feedbackText');
        if (feedbackTextarea) {
            feedbackTextarea.focus();
        }
    }, 300);
}

// Enhanced modal closing with animations
function closeFeedbackModalWithAnimation() {
    feedbackModal.classList.remove('show');
    setTimeout(() => {
        feedbackModal.style.display = 'none';
        currentFeedbackEnquiryId = null;
    }, 300);
}

// Update close modal handlers
if (closeFeedbackModal) {
    closeFeedbackModal.onclick = closeFeedbackModalWithAnimation;
}

window.onclick = function (event) {
    if (event.target === feedbackModal) {
        closeFeedbackModalWithAnimation();
    }
};

// Enhanced form submission with better UX
if (feedbackForm) {
    feedbackForm.onsubmit = async function (e) {
        e.preventDefault();
        if (!currentFeedbackEnquiryId) return;

        const submitButton = this.querySelector('.btn-primary');
        const originalText = submitButton.innerHTML;

        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Feedback...';
        submitButton.disabled = true;

        const entry = {
            date: feedbackDate.value,
            time: feedbackTime.value,
            feedback: feedbackText.value
        };

        try {
            const response = await fetch(`${API_URL}/${currentFeedbackEnquiryId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });

            if (response.ok) {
                showNotification('Feedback added successfully!');

                // Reload feedback from API
                await loadFeedbackFromAPI(currentFeedbackEnquiryId);

                // Refresh the enquiry list to show latest feedback
                fetchEnquiries();

                // Reset form
                feedbackForm.reset();
                initializeCharacterCounter();

                // Set date/time to now for next entry
                const now = new Date();
                feedbackDate.value = now.toISOString().split('T')[0];
                feedbackTime.value = now.toTimeString().slice(0, 5);

                // Focus back on textarea for quick next entry
                setTimeout(() => {
                    const feedbackTextarea = document.getElementById('feedbackText');
                    if (feedbackTextarea) {
                        feedbackTextarea.focus();
                    }
                }, 100);
            } else {
                showNotification('Failed to add feedback', true);
            }
        } catch (error) {
            console.error('Error adding feedback:', error);
            showNotification('Error adding feedback', true);
        } finally {
            // Restore button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    };
}

// Initial load of enquiries
fetchEnquiries();

// Set default date to today for new enquiry form
document.addEventListener('DOMContentLoaded', () => {
    const enquiryDateField = document.getElementById('enquiryDate');
    if (enquiryDateField) {
        const today = new Date().toISOString().split('T')[0];
        enquiryDateField.value = today;
    }

    // Initialize character counter when DOM is loaded
    initializeCharacterCounter();
});
    // / Initialize feedback modal scrolling functionality
function initializeFeedbackModalScrolling() {
    const modalBody = document.querySelector('.professional-feedback-body');
    if (!modalBody) return;

    // Function to check scroll position and update indicators
    function updateScrollIndicators() {
        const scrollTop = modalBody.scrollTop;
        const scrollHeight = modalBody.scrollHeight;
        const clientHeight = modalBody.clientHeight;

        // Add scrolled class if scrolled down
        if (scrollTop > 10) {
            modalBody.classList.add('scrolled');
        } else {
            modalBody.classList.remove('scrolled');
        }

        // Add has-more class if there's more content below
        if (scrollTop + clientHeight < scrollHeight - 10) {
            modalBody.classList.add('has-more');
        } else {
            modalBody.classList.remove('has-more');
        }
    }

    // Add scroll event listener
    modalBody.addEventListener('scroll', updateScrollIndicators);

    // Initial check
    setTimeout(updateScrollIndicators, 100);

    // Smooth scroll to top when modal opens
    modalBody.scrollTop = 0;

    // Add touch scroll support for mobile
    modalBody.style.webkitOverflowScrolling = 'touch';
    modalBody.style.overscrollBehavior = 'contain';
}

// Enhanced modal backdrop click handling
window.onclick = function (event) {
    if (event.target === feedbackModal) {
        closeFeedbackModalWithAnimation();
    }
};

// Prevent modal from closing when clicking inside the modal content
document.addEventListener('click', function (event) {
    const modalContent = document.querySelector('.professional-feedback-modal');
    if (modalContent && modalContent.contains(event.target)) {
        event.stopPropagation();
    }
});

// Add keyboard navigation for modal
document.addEventListener('keydown', function (event) {
    if (feedbackModal.style.display === 'block') {
        if (event.key === 'Escape') {
            closeFeedbackModalWithAnimation();
        }
    }
});

// Improve mobile scrolling experience
if ('ontouchstart' in window) {
    // Add momentum scrolling for iOS
    const modalBody = document.querySelector('.professional-feedback-body');
    if (modalBody) {
        modalBody.style.webkitOverflowScrolling = 'touch';
        modalBody.style.overscrollBehavior = 'contain';
    }
}