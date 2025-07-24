// Certificate Details Management
let currentCertificateId = null;
let currentCertificateData = null;

// Helper function for title case
function titleCase(str) {
    if (!str) return '-';
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Get certificate ID from URL parameters
function getCertificateIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load certificate details
async function loadCertificateDetails(certificateId) {
    try {
        showLoading();
        
        console.log('Loading certificate details for ID:', certificateId);
        
        const response = await fetch(`http://localhost:4455/api/certificates/${certificateId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const certificate = await response.json();
        console.log('Certificate data loaded:', certificate);
        
        currentCertificateData = certificate;
        populateCertificateDetails(certificate);
        showContent();
        
    } catch (error) {
        console.error('Error loading certificate details:', error);
        showError('Failed to load certificate details. Please check if the certificate exists and try again.');
    }
}

// Show loading state
function showLoading() {
    document.getElementById('loadingContainer').style.display = 'flex';
    document.getElementById('errorContainer').style.display = 'none';
    document.getElementById('certificateContent').style.display = 'none';
}

// Show error state
function showError(message) {
    document.getElementById('loadingContainer').style.display = 'none';
    document.getElementById('errorContainer').style.display = 'flex';
    document.getElementById('certificateContent').style.display = 'none';
    document.getElementById('errorMessage').textContent = message;
}

// Show content
function showContent() {
    document.getElementById('loadingContainer').style.display = 'none';
    document.getElementById('errorContainer').style.display = 'none';
    document.getElementById('certificateContent').style.display = 'block';
}

// Populate certificate details
function populateCertificateDetails(certificate) {
    // Overview Card
    document.getElementById('certificateTitle').textContent = certificate.type || 'Certificate';
    document.getElementById('certificateIdBadge').textContent = `CERT-${certificate.id}`;
    
    // Status
    const statusElement = document.getElementById('certificateStatusLarge');
    const status = certificate.status || 'Active';
    statusElement.textContent = status.toUpperCase();
    statusElement.className = `certificate-status-large ${getStatusClass(status)}-large`;
    
    // Last Updated
    document.getElementById('lastUpdated').textContent = formatDate(certificate.issueDate);
    
    // Quick Info
    document.getElementById('quickStudentName').textContent = titleCase(certificate.studentName) || 'Unknown Student';
    document.getElementById('quickCourse').textContent = titleCase(certificate.type) || '-';
    document.getElementById('quickGrade').textContent = certificate.grade || '-';
    document.getElementById('quickIssueDate').textContent = formatDate(certificate.issueDate);
    
    // Student Information
    document.getElementById('studentName').textContent = titleCase(certificate.studentName) || 'Unknown Student';
    document.getElementById('registrationNumber').textContent = certificate.registrationNumber || '-';
    document.getElementById('rollNumber').textContent = certificate.rollNumber || '-';
    document.getElementById('examRollNumber').textContent = certificate.examRollNumber || '-';
    document.getElementById('dateOfBirth').textContent = formatDate(certificate.dateOfBirth);
    document.getElementById('fatherName').textContent = titleCase(certificate.fathersName) || '-';
    document.getElementById('motherName').textContent = titleCase(certificate.mothersName) || '-';
    
    // Academic Information
    document.getElementById('courseName').textContent = titleCase(certificate.type) || '-';
    document.getElementById('courseDuration').textContent = certificate.courseDuration || '-';
    document.getElementById('finalGrade').textContent = certificate.grade || '-';
    document.getElementById('performance').textContent = titleCase(certificate.performance) || '-';
    document.getElementById('issueSession').textContent = certificate.issueSession || '-';
    
    // Certificate Information
    document.getElementById('certificateType').textContent = titleCase(certificate.type) || '-';
    document.getElementById('issueDate').textContent = formatDate(certificate.issueDate);
    document.getElementById('validUntil').textContent = certificate.validUntil ? formatDate(certificate.validUntil) : 'Lifetime';
    document.getElementById('certificateStatus').textContent = titleCase(certificate.status) || 'Active';
    
    // Additional Information
    document.getElementById('remarks').textContent = certificate.remarks || 'No additional remarks';
    
    // Populate timeline
    populateTimeline(certificate);
}

// Get status class for styling
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'issued':
            return 'status-issued';
        case 'active':
            return 'status-issued';
        case 'pending':
            return 'status-pending';
        default:
            return 'status-issued';
    }
}

// Populate certificate timeline
function populateTimeline(certificate) {
    const timeline = document.getElementById('certificateTimeline');
    timeline.innerHTML = '';
    
    const timelineItems = [
        {
            title: 'Certificate Generated',
            date: certificate.issueDate,
            description: `Certificate ${certificate.type} was generated for ${certificate.studentName || 'student'}`
        },
        {
            title: 'Status: ' + (certificate.status || 'Active'),
            date: certificate.issueDate,
            description: `Certificate status set to ${certificate.status || 'Active'}`
        }
    ];
    
    // Add valid until if exists
    if (certificate.validUntil) {
        timelineItems.push({
            title: 'Expiry Date',
            date: certificate.validUntil,
            description: 'Certificate will expire on this date'
        });
    }
    
    timelineItems.forEach((item, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-date">${formatDate(item.date)}</div>
                <div class="timeline-description">${item.description}</div>
            </div>
        `;
        timeline.appendChild(timelineItem);
    });
}

// Action functions
function viewCertificatePDF() {
    console.log('Viewing certificate PDF for ID:', currentCertificateId);
    // This would typically open a PDF viewer or generate the PDF
    alert('PDF viewing functionality would be implemented here. This would open the certificate PDF in a new window.');
}

function downloadCertificatePDF() {
    console.log('Downloading certificate PDF for ID:', currentCertificateId);
    // This would typically trigger a PDF download
    alert('PDF download functionality would be implemented here. This would download the certificate as a PDF file.');
}

function printCertificate() {
    console.log('Printing certificate for ID:', currentCertificateId);
    // This would typically open the print dialog for the certificate
    alert('Print functionality would be implemented here. This would open the print dialog for the certificate.');
}

function editCertificate() {
    console.log('Editing certificate for ID:', currentCertificateId);
    // Redirect to edit page or open edit modal
    window.location.href = `hardcopy-certificate.html?edit=${currentCertificateId}`;
}

function goBack() {
    // Go back to the previous page or certificate list
    if (document.referrer && document.referrer.includes('hardcopy-certificate.html')) {
        window.history.back();
    } else {
        window.location.href = 'hardcopy-certificate.html';
    }
}

function reloadCertificate() {
    if (currentCertificateId) {
        loadCertificateDetails(currentCertificateId);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Certificate details page loaded');
    
    // Get certificate ID from URL
    currentCertificateId = getCertificateIdFromURL();
    
    if (!currentCertificateId) {
        showError('No certificate ID provided. Please select a certificate from the list.');
        return;
    }
    
    console.log('Certificate ID from URL:', currentCertificateId);
    
    // Load certificate details
    loadCertificateDetails(currentCertificateId);
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    const certificateId = getCertificateIdFromURL();
    if (certificateId && certificateId !== currentCertificateId) {
        currentCertificateId = certificateId;
        loadCertificateDetails(certificateId);
    }
});

// Export functions for global access
window.viewCertificatePDF = viewCertificatePDF;
window.downloadCertificatePDF = downloadCertificatePDF;
window.printCertificate = printCertificate;
window.editCertificate = editCertificate;
window.goBack = goBack;
window.reloadCertificate = reloadCertificate;