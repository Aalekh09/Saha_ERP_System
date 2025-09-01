/**
 * Issued Certificates Management System
 * Handles display and management of all issued certificates
 */

class IssuedCertificatesManager {
    constructor() {
        this.certificates = [];
        this.filteredCertificates = [];
        this.currentFilters = {
            search: '',
            status: '',
            course: ''
        };
        this.init();
    }

    async init() {
        console.log('Initializing Issued Certificates Manager...');
        this.setupEventListeners();
        this.initializeMobileMenu();
        await this.loadCertificates();
        this.populateCourseFilter();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('issuedCertSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.applyFilters();
            });
        }

        // Course filter
        const courseFilter = document.getElementById('courseFilter');
        if (courseFilter) {
            courseFilter.addEventListener('change', (e) => {
                this.currentFilters.course = e.target.value;
                this.applyFilters();
            });
        }
    }

    initializeMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const sidePanel = document.getElementById('sidePanel');

        if (mobileMenuToggle && mobileMenuOverlay && sidePanel) {
            mobileMenuToggle.addEventListener('click', function() {
                sidePanel.classList.toggle('mobile-open');
                mobileMenuOverlay.classList.toggle('active');
            });

            mobileMenuOverlay.addEventListener('click', function() {
                sidePanel.classList.remove('mobile-open');
                mobileMenuOverlay.classList.remove('active');
            });
        }
    }

    async loadCertificates() {
        try {
            console.log('Loading certificates...');
            const response = await fetch('http://localhost:4455/api/certificates');
            
            if (response.ok) {
                this.certificates = await response.json();
                console.log('Certificates loaded:', this.certificates);
                this.filteredCertificates = [...this.certificates];
                this.renderCertificates();
                this.updateStatistics();
            } else {
                console.error('Failed to load certificates');
                this.showNotification('Failed to load certificates', 'error');
            }
        } catch (error) {
            console.error('Error loading certificates:', error);
            this.showNotification('Error loading certificates', 'error');
        }
    }

    populateCourseFilter() {
        const courseFilter = document.getElementById('courseFilter');
        if (!courseFilter) return;

        // Get unique courses from certificates
        const courses = [...new Set(this.certificates.map(cert => cert.type).filter(Boolean))];
        
        // Clear existing options (except "All Courses")
        courseFilter.innerHTML = '<option value="">All Courses</option>';
        
        // Add course options
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            courseFilter.appendChild(option);
        });
    }

    applyFilters() {
        this.filteredCertificates = this.certificates.filter(cert => {
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchableText = [
                    cert.studentName,
                    cert.fathersName,
                    cert.mothersName,
                    cert.type,
                    cert.registrationNumber,
                    `CERT-${cert.id}`
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // Status filter
            if (this.currentFilters.status && cert.status !== this.currentFilters.status) {
                return false;
            }

            // Course filter
            if (this.currentFilters.course && cert.type !== this.currentFilters.course) {
                return false;
            }

            return true;
        });

        this.renderCertificates();
        this.updateStatistics();
    }

    renderCertificates() {
        const grid = document.getElementById('certificatesGrid');
        const noCertificates = document.getElementById('noCertificates');
        
        if (!grid) return;

        if (this.filteredCertificates.length === 0) {
            grid.style.display = 'none';
            noCertificates.style.display = 'flex';
            return;
        }

        grid.style.display = 'grid';
        noCertificates.style.display = 'none';

        // Group certificates to detect duplicates
        const certificateGroups = {};
        this.filteredCertificates.forEach(cert => {
            const key = `${(cert.studentName || '').toLowerCase().trim()}_${(cert.fathersName || '').toLowerCase().trim()}`;
            if (!certificateGroups[key]) {
                certificateGroups[key] = [];
            }
            certificateGroups[key].push(cert);
        });

        grid.innerHTML = this.filteredCertificates.map(cert => {
            const groupKey = `${(cert.studentName || '').toLowerCase().trim()}_${(cert.fathersName || '').toLowerCase().trim()}`;
            const isDuplicate = certificateGroups[groupKey] && certificateGroups[groupKey].length > 1;
            
            return this.createCertificateCard(cert, isDuplicate);
        }).join('');
    }

    createCertificateCard(certificate, isDuplicate = false) {
        const issueDate = certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : 'N/A';
        const statusClass = this.getStatusClass(certificate.status);
        
        return `
            <div class="certificate-card ${isDuplicate ? 'duplicate' : ''}" onclick="showCertificateDetails(${certificate.id})">
                <div class="certificate-header">
                    <div class="certificate-id">
                        <span>CERT-${certificate.id}</span>
                        ${isDuplicate ? '<i class="fas fa-exclamation-triangle duplicate-icon" title="Duplicate Certificate"></i>' : ''}
                    </div>
                    <div class="certificate-status">
                        <span class="status-badge ${statusClass}">${certificate.status || 'Active'}</span>
                        ${isDuplicate ? '<span class="duplicate-badge">Duplicate</span>' : ''}
                    </div>
                </div>
                
                <div class="certificate-photo">
                    ${certificate.photoUrl ? 
                        `<img src="${certificate.photoUrl}" alt="Student Photo" class="student-photo">` : 
                        '<div class="photo-placeholder"><i class="fas fa-user"></i></div>'
                    }
                </div>
                
                <div class="certificate-info">
                    <h3 class="student-name">${this.titleCase(certificate.studentName || 'Unknown Student')}</h3>
                    <div class="parent-info">
                        <div class="parent-detail">
                            <i class="fas fa-male"></i>
                            <span>Father: ${this.titleCase(certificate.fathersName || 'N/A')}</span>
                        </div>
                        <div class="parent-detail">
                            <i class="fas fa-female"></i>
                            <span>Mother: ${this.titleCase(certificate.mothersName || 'N/A')}</span>
                        </div>
                    </div>
                    
                    <div class="course-info">
                        <div class="course-detail">
                            <i class="fas fa-graduation-cap"></i>
                            <span>${certificate.type || 'N/A'}</span>
                        </div>
                        <div class="grade-detail">
                            <i class="fas fa-award"></i>
                            <span>Grade: ${certificate.grade || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="certificate-meta">
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Issued: ${issueDate}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-id-card"></i>
                            <span>Reg: ${certificate.registrationNumber || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="certificate-actions">
                    <button class="action-btn view-btn" onclick="event.stopPropagation(); showCertificateDetails(${certificate.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn download-btn" onclick="event.stopPropagation(); downloadCertificate(${certificate.id})" title="Download PDF">
                        <i class="fas fa-download"></i>
                    </button>
                    ${isDuplicate ? `
                        <button class="action-btn delete-btn" onclick="event.stopPropagation(); deleteCertificate(${certificate.id})" title="Delete Duplicate">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    updateStatistics() {
        // Total certificates
        const totalCount = document.getElementById('totalCertificatesCount');
        if (totalCount) {
            totalCount.textContent = this.certificates.length;
        }

        // Active certificates
        const activeCount = document.getElementById('activeCertificatesCount');
        if (activeCount) {
            const active = this.certificates.filter(cert => cert.status === 'issued' || cert.status === 'active' || !cert.status).length;
            activeCount.textContent = active;
        }

        // Duplicate certificates
        const duplicateCount = document.getElementById('duplicateCertificatesCount');
        if (duplicateCount) {
            const groups = {};
            this.certificates.forEach(cert => {
                const key = `${(cert.studentName || '').toLowerCase().trim()}_${(cert.fathersName || '').toLowerCase().trim()}`;
                if (!groups[key]) groups[key] = [];
                groups[key].push(cert);
            });
            
            let duplicates = 0;
            Object.values(groups).forEach(group => {
                if (group.length > 1) duplicates += group.length;
            });
            
            duplicateCount.textContent = duplicates;
        }

        // This month certificates
        const thisMonthCount = document.getElementById('thisMonthCount');
        if (thisMonthCount) {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const thisMonth = this.certificates.filter(cert => {
                if (!cert.issueDate) return false;
                const certDate = new Date(cert.issueDate);
                return certDate.getMonth() === currentMonth && certDate.getFullYear() === currentYear;
            }).length;
            thisMonthCount.textContent = thisMonth;
        }
    }

    getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'issued':
                return 'status-issued';
            case 'active':
                return 'status-active';
            case 'expired':
                return 'status-expired';
            default:
                return 'status-active';
        }
    }

    titleCase(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Global functions for button actions
async function showCertificateDetails(certificateId) {
    const certificate = issuedCertManager.certificates.find(cert => cert.id === certificateId);
    if (!certificate) return;

    const modal = document.getElementById('certificateModal');
    const modalBody = document.getElementById('certificateModalBody');
    
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div class="certificate-detail-view">
            <div class="detail-header">
                <div class="detail-photo">
                    ${certificate.photoUrl ? 
                        `<img src="${certificate.photoUrl}" alt="Student Photo" class="detail-student-photo">` : 
                        '<div class="detail-photo-placeholder"><i class="fas fa-user"></i></div>'
                    }
                </div>
                <div class="detail-basic-info">
                    <h2>${issuedCertManager.titleCase(certificate.studentName || 'Unknown Student')}</h2>
                    <p class="certificate-id">Certificate ID: CERT-${certificate.id}</p>
                    <p class="registration-number">Registration: ${certificate.registrationNumber || 'N/A'}</p>
                </div>
            </div>
            
            <div class="detail-sections">
                <div class="detail-section">
                    <h3><i class="fas fa-user"></i> Personal Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Student Name:</label>
                            <span>${issuedCertManager.titleCase(certificate.studentName || 'N/A')}</span>
                        </div>
                        <div class="detail-item">
                            <label>Father's Name:</label>
                            <span>${issuedCertManager.titleCase(certificate.fathersName || 'N/A')}</span>
                        </div>
                        <div class="detail-item">
                            <label>Mother's Name:</label>
                            <span>${issuedCertManager.titleCase(certificate.mothersName || 'N/A')}</span>
                        </div>
                        <div class="detail-item">
                            <label>Date of Birth:</label>
                            <span>${certificate.dateOfBirth ? new Date(certificate.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-graduation-cap"></i> Academic Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Course:</label>
                            <span>${certificate.type || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Duration:</label>
                            <span>${certificate.courseDuration || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Grade:</label>
                            <span>${certificate.grade || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Performance:</label>
                            <span>${certificate.performance || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Roll Number:</label>
                            <span>${certificate.rollNumber || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Exam Roll Number:</label>
                            <span>${certificate.examRollNumber || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-calendar"></i> Certificate Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Issue Date:</label>
                            <span>${certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Issue Session:</label>
                            <span>${certificate.issueSession || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="status-badge ${issuedCertManager.getStatusClass(certificate.status)}">${certificate.status || 'Active'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Valid Until:</label>
                            <span>${certificate.validUntil ? new Date(certificate.validUntil).toLocaleDateString() : 'Lifetime'}</span>
                        </div>
                    </div>
                </div>
                
                ${certificate.remarks ? `
                <div class="detail-section">
                    <h3><i class="fas fa-sticky-note"></i> Remarks</h3>
                    <p class="remarks-text">${certificate.remarks}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    // Set up modal action buttons
    const downloadBtn = document.getElementById('downloadCertBtn');
    const deleteBtn = document.getElementById('deleteCertBtn');
    
    if (downloadBtn) {
        downloadBtn.onclick = () => downloadCertificate(certificateId);
    }
    
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            closeCertificateModal();
            deleteCertificate(certificateId);
        };
    }

    modal.style.display = 'block';
}

function closeCertificateModal() {
    const modal = document.getElementById('certificateModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function downloadCertificate(certificateId) {
    // This would integrate with the existing PDF generation logic
    issuedCertManager.showNotification('PDF download functionality will be integrated with existing certificate generation', 'info');
}

async function deleteCertificate(certificateId) {
    if (!confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:4455/api/certificates/${certificateId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            issuedCertManager.showNotification('Certificate deleted successfully', 'success');
            await issuedCertManager.loadCertificates();
        } else {
            issuedCertManager.showNotification('Failed to delete certificate', 'error');
        }
    } catch (error) {
        console.error('Error deleting certificate:', error);
        issuedCertManager.showNotification('Error deleting certificate', 'error');
    }
}

async function refreshIssuedCertificates() {
    await issuedCertManager.loadCertificates();
    issuedCertManager.showNotification('Certificates refreshed successfully', 'success');
}

// Initialize the manager when DOM is loaded
let issuedCertManager;
document.addEventListener('DOMContentLoaded', () => {
    issuedCertManager = new IssuedCertificatesManager();
});