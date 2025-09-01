// Helper: Title Case
function titleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Function to check for pre-fill data and populate the form
function checkAndPreFillForm() {
    console.log('Checking for pre-fill data...');
    
    const preFillData = sessionStorage.getItem('certificatePreFillData');
    if (preFillData) {
        try {
            const data = JSON.parse(preFillData);
            console.log('Pre-fill data found:', data);
            
            // Pre-fill the form fields
            const form = document.getElementById('certificateForm');
            if (form) {
                // Student Information
                if (data.registration) document.getElementById('registration').value = data.registration;
                if (data.name) document.getElementById('name').value = data.name.toUpperCase();
                if (data.fathersname) document.getElementById('fathersname').value = data.fathersname.toUpperCase();
                if (data.mothersname) document.getElementById('mothersname').value = data.mothersname.toUpperCase();
                if (data.dob) document.getElementById('dob').value = data.dob;
                if (data.rollno) document.getElementById('rollno').value = data.rollno;
                
                // Academic Information
                if (data.erollno) document.getElementById('erollno').value = data.erollno;
                if (data.IssueSession) document.getElementById('IssueSession').value = data.IssueSession;
                if (data.duration) document.getElementById('duration').value = data.duration;
                if (data.performance) document.getElementById('performance').value = data.performance;
                if (data.certificate) document.getElementById('certificate').value = data.certificate.toUpperCase();
                if (data.Grade) document.getElementById('Grade').value = data.Grade;
                
                // Issue Information
                if (data.IssueDay) document.getElementById('IssueDay').value = data.IssueDay;
                if (data.IssueMonth) document.getElementById('IssueMonth').value = data.IssueMonth;
                if (data.IssueYear) document.getElementById('IssueYear').value = data.IssueYear;
                
                console.log('Form pre-filled successfully');
                
                // Show notification
                showPreFillNotification(data.name);
                
                // Scroll to the form
                setTimeout(() => {
                    form.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
            
            // Clear the session storage data after use
            sessionStorage.removeItem('certificatePreFillData');
            
        } catch (error) {
            console.error('Error parsing pre-fill data:', error);
            sessionStorage.removeItem('certificatePreFillData');
        }
    }
}

// Function to show pre-fill notification
function showPreFillNotification(studentName) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'prefill-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>Certificate form pre-filled for ${studentName.toUpperCase()}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .prefill-notification .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .prefill-notification .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            margin-left: 10px;
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Test function to manually show certificate details panel
function testCertificateDetails() {
    console.log('Test function called');
    const testData = {
        name: 'John Doe',
        registration: 'REG123456',
        certificate: 'Computer Science',
        Grade: 'A+'
    };
    
    console.log('Showing test certificate details with data:', testData);
    showCertificateDetails(testData, 'TEST-CERT-001');
}

// Global variable to store the last generated PDF
let lastGeneratedPDF = null;

// Function to show certificate details panel
function showCertificateDetails(data, certificateId, pdfBlob = null) {
    console.log('showCertificateDetails called with:', data, certificateId);
    
    const detailsPanel = document.getElementById('certificateDetailsPanel');
    console.log('Details panel element:', detailsPanel);
    
    if (!detailsPanel) {
        console.error('Certificate details panel not found!');
        return;
    }
    
    // Store the PDF blob for download functionality
    if (pdfBlob) {
        lastGeneratedPDF = pdfBlob;
    }
    
    // Show the certificate details panel
    detailsPanel.style.display = 'block';
    
    // Populate certificate details with null checks
    const detailStudentName = document.getElementById('detailStudentName');
    const detailRegistrationNo = document.getElementById('detailRegistrationNo');
    const detailIssueDate = document.getElementById('detailIssueDate');
    const detailCertificateId = document.getElementById('detailCertificateId');
    const detailCourseName = document.getElementById('detailCourseName');
    const detailGrade = document.getElementById('detailGrade');
    const detailStatus = document.getElementById('detailStatus');
    const detailFatherName = document.getElementById('detailFatherName');
    const detailMotherName = document.getElementById('detailMotherName');
    const detailPerformance = document.getElementById('detailPerformance');
    const detailDuration = document.getElementById('detailDuration');
    const detailIssueSession = document.getElementById('detailIssueSession');
    const certificateTimestamp = document.getElementById('certificateTimestamp');
    
    if (detailStudentName) detailStudentName.textContent = titleCase(data.name);
    if (detailRegistrationNo) detailRegistrationNo.textContent = data.registration;
    if (detailIssueDate) detailIssueDate.textContent = new Date().toLocaleDateString();
    if (detailCertificateId) detailCertificateId.textContent = certificateId || 'CERT-' + data.registration;
    if (detailCourseName) detailCourseName.textContent = titleCase(data.certificate);
    if (detailGrade) detailGrade.textContent = data.Grade;
    if (detailStatus) detailStatus.textContent = 'Issued';
    if (detailFatherName) detailFatherName.textContent = titleCase(data.fathersname || '-');
    if (detailMotherName) detailMotherName.textContent = titleCase(data.mothersname || '-');
    if (detailPerformance) detailPerformance.textContent = titleCase(data.performance || '-');
    if (detailDuration) detailDuration.textContent = data.duration || '-';
    if (detailIssueSession) detailIssueSession.textContent = data.IssueSession || '-';
    if (certificateTimestamp) certificateTimestamp.textContent = `Last updated: ${new Date().toLocaleString()}`;
    
    // Update status badge
    const statusElement = document.getElementById('certificateStatus');
    if (statusElement) {
        statusElement.textContent = 'Issued';
        statusElement.className = 'certificate-status status-issued';
    }
    
    console.log('Certificate details populated successfully');
    console.log('Certificate details panel updated');
}

// Function to load existing certificate data
async function loadExistingCertificates() {
    try {
        console.log('Loading existing certificates...');
        const response = await fetch(`https://aalekhapi.sahaedu.in/api/certificates`);
        
        if (response.ok) {
            const certificates = await response.json();
            console.log('Loaded certificates:', certificates);
            
            // Update the table with all certificates
            populateCertificatesTable(certificates);
            updateCertificateTimestamp();
        } else {
            console.error('Failed to load certificates');
            populateCertificatesTable([]);
        }
    } catch (error) {
        console.error('Error loading certificates:', error);
        populateCertificatesTable([]);
    }
}

// Function to display certificate data in the panel
function displayCertificateData(certificate) {
    console.log('Displaying certificate data:', certificate);
    
    // Add null checks for all elements
    const detailStudentName = document.getElementById('detailStudentName');
    const detailRegistrationNo = document.getElementById('detailRegistrationNo');
    const detailIssueDate = document.getElementById('detailIssueDate');
    const detailCertificateId = document.getElementById('detailCertificateId');
    const detailCourseName = document.getElementById('detailCourseName');
    const detailGrade = document.getElementById('detailGrade');
    const detailStatus = document.getElementById('detailStatus');
    const detailFatherName = document.getElementById('detailFatherName');
    const detailMotherName = document.getElementById('detailMotherName');
    const detailPerformance = document.getElementById('detailPerformance');
    const detailDuration = document.getElementById('detailDuration');
    const detailIssueSession = document.getElementById('detailIssueSession');
    const certificateTimestamp = document.getElementById('certificateTimestamp');
    const statusElement = document.getElementById('certificateStatus');
    
    if (detailStudentName) detailStudentName.textContent = certificate.studentName || certificate.student?.name || 'Unknown Student';
    if (detailRegistrationNo) detailRegistrationNo.textContent = certificate.registrationNumber || '-';
    if (detailIssueDate) detailIssueDate.textContent = certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : '-';
    if (detailCertificateId) detailCertificateId.textContent = certificate.id ? 'CERT-' + certificate.id : '-';
    if (detailCourseName) detailCourseName.textContent = certificate.type || '-';
    if (detailGrade) detailGrade.textContent = certificate.grade || '-';
    if (detailStatus) detailStatus.textContent = certificate.status || 'Active';
    if (detailFatherName) detailFatherName.textContent = certificate.fathersName || '-';
    if (detailMotherName) detailMotherName.textContent = certificate.mothersName || '-';
    if (detailPerformance) detailPerformance.textContent = certificate.performance || '-';
    if (detailDuration) detailDuration.textContent = certificate.courseDuration || '-';
    if (detailIssueSession) detailIssueSession.textContent = certificate.issueSession || '-';
    if (certificateTimestamp) certificateTimestamp.textContent = `Last updated: ${certificate.issueDate ? new Date(certificate.issueDate).toLocaleString() : 'Unknown'}`;
    
    // Update status badge
    if (statusElement) {
        statusElement.textContent = certificate.status || 'Active';
        statusElement.className = `certificate-status ${certificate.status === 'Issued' ? 'status-issued' : 'status-pending'}`;
    }
}

// Function to display empty certificate data
function displayEmptyCertificateData() {
    console.log('Displaying empty certificate data');
    
    // Add null checks for all elements
    const detailStudentName = document.getElementById('detailStudentName');
    const detailRegistrationNo = document.getElementById('detailRegistrationNo');
    const detailIssueDate = document.getElementById('detailIssueDate');
    const detailCertificateId = document.getElementById('detailCertificateId');
    const detailCourseName = document.getElementById('detailCourseName');
    const detailGrade = document.getElementById('detailGrade');
    const detailStatus = document.getElementById('detailStatus');
    const statusElement = document.getElementById('certificateStatus');
    
    if (detailStudentName) detailStudentName.textContent = 'No certificates found';
    if (detailRegistrationNo) detailRegistrationNo.textContent = '-';
    if (detailIssueDate) detailIssueDate.textContent = '-';
    if (detailCertificateId) detailCertificateId.textContent = '-';
    if (detailCourseName) detailCourseName.textContent = '-';
    if (detailGrade) detailGrade.textContent = '-';
    if (detailStatus) detailStatus.textContent = 'No Data';
    
    // Update status badge
    if (statusElement) {
        statusElement.textContent = 'No Data';
        statusElement.className = 'certificate-status status-pending';
    }
}

// Function to populate certificates table
function populateCertificatesTable(certificates) {
    const tableBody = document.getElementById('certificatesTableBody');
    const certificateCount = document.getElementById('certificateCount');
    
    if (!tableBody) {
        console.error('Certificates table body not found');
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (certificates.length === 0) {
        // Show no data row
        const noDataRow = document.createElement('tr');
        noDataRow.className = 'no-data-row';
        noDataRow.innerHTML = `
            <td colspan="8" class="no-data-cell">
                <div class="no-data-content">
                    <i class="fas fa-certificate"></i>
                    <p>No certificates found</p>
                    <small>Generate your first certificate using the form above</small>
                </div>
            </td>
        `;
        tableBody.appendChild(noDataRow);
        return;
    }
    
    // Group certificates by student name + father's name to detect potential duplicates
    const certificateGroups = {};
    let duplicateCount = 0;
    certificates.forEach(cert => {
        const key = `${(cert.studentName || '').toLowerCase().trim()}_${(cert.fathersName || '').toLowerCase().trim()}`;
        if (!certificateGroups[key]) {
            certificateGroups[key] = [];
        }
        certificateGroups[key].push(cert);
    });
    
    // Calculate duplicate statistics
    Object.values(certificateGroups).forEach(group => {
        if (group.length > 1) {
            duplicateCount += group.length;
        }
    });
    
    // Update certificate count with duplicate info
    if (certificateCount) {
        let countText = `${certificates.length} certificate${certificates.length !== 1 ? 's' : ''} found`;
        if (duplicateCount > 0) {
            countText += ` (${duplicateCount} duplicates detected)`;
        }
        certificateCount.textContent = countText;
        
        // Add duplicate warning if any found
        if (duplicateCount > 0) {
            certificateCount.style.color = '#f59e0b';
            certificateCount.innerHTML += ' <i class="fas fa-exclamation-triangle" style="margin-left: 8px;"></i>';
            
            // Show notification about duplicates
            const duplicateGroups = Object.values(certificateGroups).filter(group => group.length > 1).length;
            showCertificateNotification(
                `Warning: ${duplicateCount} duplicate certificates found in ${duplicateGroups} group${duplicateGroups !== 1 ? 's' : ''}. Please review and remove duplicates.`, 
                'info'
            );
        } else {
            certificateCount.style.color = '';
        }
    }

    // Populate table with certificates
    certificates.forEach((certificate, index) => {
        const groupKey = `${(certificate.studentName || '').toLowerCase().trim()}_${(certificate.fathersName || '').toLowerCase().trim()}`;
        const isDuplicate = certificateGroups[groupKey] && certificateGroups[groupKey].length > 1;
        
        const row = document.createElement('tr');
        if (isDuplicate) {
            row.classList.add('duplicate-certificate');
        }
        
        row.innerHTML = `
            <td class="certificate-id">
                CERT-${certificate.id || (index + 1)}
                ${isDuplicate ? '<i class="fas fa-exclamation-triangle duplicate-icon" title="Duplicate detected"></i>' : ''}
            </td>
            <td class="student-name">
                <div class="student-info-cell">
                    <div class="name">${certificate.studentName || certificate.student?.name || 'Unknown Student'}</div>
                    <div class="father-name">Father: ${certificate.fathersName || 'N/A'}</div>
                </div>
            </td>
            <td>${certificate.registrationNumber || '-'}</td>
            <td>${certificate.type || '-'}</td>
            <td>${certificate.grade || '-'}</td>
            <td>${certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : '-'}</td>
            <td>
                <span class="status-badge ${getStatusClass(certificate.status)}">
                    ${certificate.status || 'Active'}
                </span>
                ${isDuplicate ? '<div class="duplicate-badge">Duplicate</div>' : ''}
            </td>
            <td>
                <div class="table-actions">
                    <button class="table-action-btn btn-table-view" onclick="viewCertificateFromTable(${certificate.id})" title="View Certificate">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="table-action-btn btn-table-download" onclick="downloadCertificateFromTable(${certificate.id})" title="Download PDF">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="table-action-btn btn-table-edit" onclick="editCertificateFromTable(${certificate.id})" title="Edit Certificate">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${isDuplicate ? `<button class="table-action-btn btn-table-delete" onclick="deleteDuplicateCertificate(${certificate.id})" title="Delete Duplicate">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to get status class for styling
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'issued':
            return 'status-issued';
        case 'active':
            return 'status-active';
        case 'pending':
            return 'status-pending';
        default:
            return 'status-active';
    }
}

// Function to update certificate timestamp
function updateCertificateTimestamp() {
    const certificateTimestamp = document.getElementById('certificateTimestamp');
    if (certificateTimestamp) {
        certificateTimestamp.textContent = `Last updated: ${new Date().toLocaleString()}`;
    }
}

// Table action functions
function viewCertificateFromTable(certificateId) {
    console.log('Viewing certificate:', certificateId);
    if (lastGeneratedPDF) {
        const pdfUrl = URL.createObjectURL(lastGeneratedPDF);
        window.open(pdfUrl, '_blank');
    } else {
        alert('Certificate PDF not available. Please regenerate the certificate.');
    }
}

function downloadCertificateFromTable(certificateId) {
    console.log('Downloading certificate:', certificateId);
    if (lastGeneratedPDF) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(lastGeneratedPDF);
        link.download = `certificate_${certificateId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } else {
        alert('Certificate PDF not available. Please regenerate the certificate.');
    }
}

function editCertificateFromTable(certificateId) {
    console.log('Editing certificate:', certificateId);
    // Scroll to form for editing
    document.getElementById('certificateForm').scrollIntoView({ behavior: 'smooth' });
    // You could also pre-populate the form with certificate data here
}

// Function to filter certificates based on search
function filterCertificates() {
    const searchInput = document.getElementById('certificateSearchInput');
    const tableRows = document.querySelectorAll('#certificatesTableBody tr:not(.no-data-row)');
    
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;
    
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        row.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
    });
    
    // Update count
    const certificateCount = document.getElementById('certificateCount');
    if (certificateCount) {
        if (searchTerm) {
            certificateCount.textContent = `${visibleCount} certificate${visibleCount !== 1 ? 's' : ''} found (filtered)`;
        } else {
            certificateCount.textContent = `${tableRows.length} certificate${tableRows.length !== 1 ? 's' : ''} found`;
        }
    }
}

// Function to check for duplicate certificates
async function checkDuplicateCertificate(studentName, fathersName) {
    try {
        console.log('Checking for duplicate certificate:', { studentName, fathersName });
        
        const response = await fetch(`https://aalekhapi.sahaedu.in/api/certificates`);
        if (response.ok) {
            const certificates = await response.json();
            console.log('Existing certificates:', certificates);
            
            // Check for duplicate: same student name + father's name combination
            const duplicate = certificates.find(cert => 
                cert.studentName && cert.fathersName &&
                cert.studentName.toLowerCase().trim() === studentName.toLowerCase().trim() &&
                cert.fathersName.toLowerCase().trim() === fathersName.toLowerCase().trim()
            );
            
            if (duplicate) {
                console.log('Duplicate certificate found:', duplicate);
                return {
                    isDuplicate: true,
                    existingCertificate: duplicate
                };
            }
            
            return { isDuplicate: false };
        } else {
            console.error('Failed to fetch certificates for duplicate check');
            return { isDuplicate: false }; // Allow creation if we can't check
        }
    } catch (error) {
        console.error('Error checking for duplicates:', error);
        return { isDuplicate: false }; // Allow creation if we can't check
    }
}

// Function to show duplicate certificate warning
function showDuplicateWarning(existingCertificate) {
    const warningHtml = `
        <div class="duplicate-warning-overlay" id="duplicateWarningOverlay">
            <div class="duplicate-warning-modal">
                <div class="warning-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Duplicate Certificate Detected</h3>
                </div>
                <div class="warning-content">
                    <p><strong>A certificate already exists for this student:</strong></p>
                    <div class="existing-cert-info">
                        <div class="cert-detail">
                            <span class="label">Student Name:</span>
                            <span class="value">${titleCase(existingCertificate.studentName)}</span>
                        </div>
                        <div class="cert-detail">
                            <span class="label">Father's Name:</span>
                            <span class="value">${titleCase(existingCertificate.fathersName)}</span>
                        </div>
                        <div class="cert-detail">
                            <span class="label">Certificate ID:</span>
                            <span class="value">CERT-${existingCertificate.id}</span>
                        </div>
                        <div class="cert-detail">
                            <span class="label">Issue Date:</span>
                            <span class="value">${existingCertificate.issueDate ? new Date(existingCertificate.issueDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div class="cert-detail">
                            <span class="label">Course:</span>
                            <span class="value">${existingCertificate.type || 'N/A'}</span>
                        </div>
                    </div>
                    <p class="warning-message">
                        <i class="fas fa-info-circle"></i>
                        Only one certificate is allowed per student (same name + father's name combination).
                    </p>
                </div>
                <div class="warning-actions">
                    <button class="btn-warning-close" onclick="closeDuplicateWarning()">
                        <i class="fas fa-times"></i>
                        Close
                    </button>
                    <button class="btn-view-existing" onclick="viewExistingCertificate(${existingCertificate.id})">
                        <i class="fas fa-eye"></i>
                        View Existing Certificate
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add styles for the warning modal
    if (!document.getElementById('duplicateWarningStyles')) {
        const styles = document.createElement('style');
        styles.id = 'duplicateWarningStyles';
        styles.textContent = `
            .duplicate-warning-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease-out;
            }
            
            .duplicate-warning-modal {
                background: white;
                border-radius: 12px;
                padding: 0;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease-out;
            }
            
            .warning-header {
                background: #f59e0b;
                color: white;
                padding: 20px;
                border-radius: 12px 12px 0 0;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .warning-header i {
                font-size: 24px;
            }
            
            .warning-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }
            
            .warning-content {
                padding: 24px;
            }
            
            .existing-cert-info {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 16px;
                margin: 16px 0;
                border-left: 4px solid #f59e0b;
            }
            
            .cert-detail {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 4px 0;
            }
            
            .cert-detail:last-child {
                margin-bottom: 0;
            }
            
            .cert-detail .label {
                font-weight: 600;
                color: #374151;
            }
            
            .cert-detail .value {
                color: #6b7280;
                text-align: right;
            }
            
            .warning-message {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 12px;
                margin-top: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                color: #92400e;
            }
            
            .warning-actions {
                padding: 0 24px 24px;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            
            .btn-warning-close, .btn-view-existing {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            
            .btn-warning-close {
                background: #6b7280;
                color: white;
            }
            
            .btn-warning-close:hover {
                background: #4b5563;
            }
            
            .btn-view-existing {
                background: #3b82f6;
                color: white;
            }
            
            .btn-view-existing:hover {
                background: #2563eb;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            /* Duplicate certificate styles */
            .duplicate-certificate {
                background-color: #fef3c7 !important;
                border-left: 4px solid #f59e0b;
            }
            
            .duplicate-icon {
                color: #f59e0b;
                margin-left: 8px;
                font-size: 14px;
            }
            
            .student-info-cell {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .student-info-cell .name {
                font-weight: 600;
                color: #374151;
            }
            
            .student-info-cell .father-name {
                font-size: 12px;
                color: #6b7280;
                font-style: italic;
            }
            
            .duplicate-badge {
                background: #f59e0b;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                margin-top: 4px;
                display: inline-block;
                font-weight: 500;
            }
            
            .btn-table-delete {
                background: #ef4444 !important;
                color: white !important;
            }
            
            .btn-table-delete:hover {
                background: #dc2626 !important;
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add the warning to the page
    document.body.insertAdjacentHTML('beforeend', warningHtml);
}

// Function to close duplicate warning
function closeDuplicateWarning() {
    const overlay = document.getElementById('duplicateWarningOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Function to view existing certificate
function viewExistingCertificate(certificateId) {
    console.log('Viewing existing certificate:', certificateId);
    closeDuplicateWarning();
    
    // Scroll to the certificates table and highlight the existing certificate
    const certificatesTable = document.getElementById('certificatesTable');
    if (certificatesTable) {
        certificatesTable.scrollIntoView({ behavior: 'smooth' });
        
        // Highlight the existing certificate row
        setTimeout(() => {
            const rows = certificatesTable.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const certIdCell = row.querySelector('.certificate-id');
                if (certIdCell && certIdCell.textContent.includes(`CERT-${certificateId}`)) {
                    row.style.background = '#fef3c7';
                    row.style.border = '2px solid #f59e0b';
                    setTimeout(() => {
                        row.style.background = '';
                        row.style.border = '';
                    }, 3000);
                }
            });
        }, 500);
    }
}

// Function to delete duplicate certificate
async function deleteDuplicateCertificate(certificateId) {
    if (!confirm('Are you sure you want to delete this duplicate certificate? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`https://aalekhapi.sahaedu.in/api/certificates/${certificateId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log('Certificate deleted successfully');
            // Refresh the certificates table
            await loadExistingCertificates();
            
            // Show success notification
            showCertificateNotification('Duplicate certificate deleted successfully', 'success');
            
        } else {
            console.error('Failed to delete certificate');
            showCertificateNotification('Failed to delete certificate. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error deleting certificate:', error);
        showCertificateNotification('Error deleting certificate. Please try again.', 'error');
    }
}

// Function to show notification
function showCertificateNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `certificate-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('certificateNotificationStyles')) {
        const styles = document.createElement('style');
        styles.id = 'certificateNotificationStyles';
        styles.textContent = `
            .certificate-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
                max-width: 400px;
            }
            
            .certificate-notification.success {
                background: #10b981;
                color: white;
            }
            
            .certificate-notification.error {
                background: #ef4444;
                color: white;
            }
            
            .certificate-notification.info {
                background: #3b82f6;
                color: white;
            }
            
            .certificate-notification .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .certificate-notification .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0;
                margin-left: auto;
                opacity: 0.8;
            }
            
            .certificate-notification .notification-close:hover {
                opacity: 1;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Make functions globally accessible
window.closeDuplicateWarning = closeDuplicateWarning;
window.viewExistingCertificate = viewExistingCertificate;
window.deleteDuplicateCertificate = deleteDuplicateCertificate;
window.showCertificateNotification = showCertificateNotification;

// Function to save certificate to backend
async function saveCertificateToBackend(data) {
    try {
        const certificateData = {
            type: data.certificate || "Certificate",
            issueDate: new Date().toISOString().split('T')[0],
            validUntil: null,
            remarks: `Course: ${data.certificate || 'N/A'}, Duration: ${data.duration || 'N/A'}, Grade: ${data.Grade || 'N/A'}`,
            status: "Issued",
            // Additional fields for hardcopy certificate
            studentName: data.name,
            registrationNumber: data.registration,
            rollNumber: data.rollno,
            examRollNumber: data.erollno,
            courseDuration: data.duration,
            performance: data.performance,
            grade: data.Grade,
            issueSession: data.IssueSession,
            issueDay: parseInt(data.IssueDay),
            issueMonth: data.IssueMonth,
            issueYear: parseInt(data.IssueYear),
            fathersName: data.fathersname,
            mothersName: data.mothersname,
            dateOfBirth: data.dob
        };
        
        console.log('Sending certificate data to backend:', certificateData);
        
        const response = await fetch(`https://aalekhapi.sahaedu.in/api/certificates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(certificateData)
        });
        
        console.log('Backend response status:', response.status);
        console.log('Backend response headers:', response.headers);
        
        if (response.ok) {
            const savedCertificate = await response.json();
            console.log('Certificate saved successfully:', savedCertificate);
            return savedCertificate.id;
        } else {
            const errorText = await response.text();
            console.error('Failed to save certificate to backend. Status:', response.status);
            console.error('Error response:', errorText);
            return null;
        }
    } catch (error) {
        console.error('Error saving certificate:', error);
        console.error('Error details:', error.message);
        return null;
    }
}

// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing certificate page...');
    
    // Check for pre-fill data from student list
    checkAndPreFillForm();
    
    // Load existing certificates when page loads
    await loadExistingCertificates();
    
    // Add subject rows logic
    const subjectsArea = document.getElementById('subjectsArea');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    let subjectCount = 0;

    function addSubjectRow() {
        if (subjectCount >= 6) return;
        const tr = document.createElement('tr');
        tr.className = 'subject-row';
        tr.innerHTML = `
            <td><input type="text" name="subject${subjectCount}" placeholder="Subject Name" required></td>
            <td><input type="number" name="theory${subjectCount}" placeholder="Theory" min="0" max="30" required class="marks-input"></td>
            <td><input type="number" name="practical${subjectCount}" placeholder="Practical" min="0" max="70" required class="marks-input"></td>
            <td><input type="number" name="obtained${subjectCount}" placeholder="Obtained" min="0" max="100" required readonly style="background:#e9ecef;"></td>
            <td><button type="button" onclick="this.closest('tr').remove(); subjectCount--;">Remove</button></td>
        `;
        subjectsArea.appendChild(tr);
        subjectCount++;
    }

    // Add event listener to the table body for delegation
    subjectsArea.addEventListener('input', function(e) {
        if (e.target.classList.contains('marks-input')) {
            const row = e.target.closest('tr');
            const theoryInput = row.querySelector('input[name^="theory"]');
            const practicalInput = row.querySelector('input[name^="practical"]');
            const obtainedInput = row.querySelector('input[name^="obtained"]');

            const theory = parseInt(theoryInput.value, 10) || 0;
            const practical = parseInt(practicalInput.value, 10) || 0;

            // Cap the values to their max
            if (theory > 30) theoryInput.value = 30;
            if (practical > 70) practicalInput.value = 70;

            obtainedInput.value = (parseInt(theoryInput.value, 10) || 0) + (parseInt(practicalInput.value, 10) || 0);
        }
    });

    if (addSubjectBtn) {
        addSubjectBtn.onclick = addSubjectRow;
        // Add one row by default
        addSubjectRow();
    }

    // Custom file input label
    const fileInput = document.getElementById('photo');
    const fileInputLabel = document.querySelector('.file-input-label');
    if (fileInput && fileInputLabel) {
        fileInput.addEventListener('change', function() {
            fileInputLabel.textContent = this.files[0] ? this.files[0].name : 'Choose File';
        });
    }

    // Certificate details panel action buttons
    const viewCertificateBtn = document.getElementById('viewCertificateBtn');
    const downloadCertificateBtn = document.getElementById('downloadCertificateBtn');
    const printCertificateBtn = document.getElementById('printCertificateBtn');
    const editCertificateBtn = document.getElementById('editCertificateBtn');
    const refreshCertificatesBtn = document.getElementById('refreshCertificatesBtn');

    if (viewCertificateBtn) {
        viewCertificateBtn.addEventListener('click', function() {
            if (lastGeneratedPDF) {
                // Open certificate in new window for viewing
                const pdfUrl = URL.createObjectURL(lastGeneratedPDF);
                window.open(pdfUrl, '_blank');
            } else {
                alert('No certificate available for viewing. Please generate a certificate first.');
            }
        });
    }

    if (downloadCertificateBtn) {
        downloadCertificateBtn.addEventListener('click', function() {
            if (lastGeneratedPDF) {
                // Create download link from the stored PDF blob
                const link = document.createElement('a');
                link.href = URL.createObjectURL(lastGeneratedPDF);
                link.download = `certificate_${document.getElementById('detailRegistrationNo').textContent}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } else {
                alert('No certificate available for download. Please generate a certificate first.');
            }
        });
    }

    if (printCertificateBtn) {
        printCertificateBtn.addEventListener('click', function() {
            if (lastGeneratedPDF) {
                // Open print dialog for the certificate
                const pdfUrl = URL.createObjectURL(lastGeneratedPDF);
                const printWindow = window.open(pdfUrl, '_blank');
                printWindow.onload = function() {
                    printWindow.print();
                };
            } else {
                alert('No certificate available for printing. Please generate a certificate first.');
            }
        });
    }

    if (editCertificateBtn) {
        editCertificateBtn.addEventListener('click', function() {
            // Scroll to form for editing
            document.getElementById('certificateForm').scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (refreshCertificatesBtn) {
        refreshCertificatesBtn.addEventListener('click', async function() {
            console.log('Refreshing certificates...');
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            this.disabled = true;
            
            try {
                await loadExistingCertificates();
                console.log('Certificates refreshed successfully');
            } catch (error) {
                console.error('Error refreshing certificates:', error);
            } finally {
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                this.disabled = false;
            }
        });
    }

    // Add search functionality
    const certificateSearchInput = document.getElementById('certificateSearchInput');
    if (certificateSearchInput) {
        certificateSearchInput.addEventListener('input', filterCertificates);
    }

    const certificateForm = document.getElementById('certificateForm');
    if (certificateForm) {
        console.log('Certificate form found and event listener attached');
        certificateForm.onsubmit = async function(e) {
            console.log('Certificate form submitted');
            e.preventDefault();
            const form = e.target;
            // Gather form data
            const data = {};
            for (const el of form.elements) {
                if (el.name && el.type !== 'file') data[el.name] = el.value;
            }
            console.log('Form data gathered:', data);
            
            // Check for duplicate certificate before proceeding
            if (data.name && data.fathersname) {
                const duplicateCheck = await checkDuplicateCertificate(data.name, data.fathersname);
                if (duplicateCheck.isDuplicate) {
                    console.log('Duplicate certificate detected, showing warning');
                    showDuplicateWarning(duplicateCheck.existingCertificate);
                    return; // Stop form submission
                }
            }
            
            // Gather subjects
            const rows = [];
            for (let i = 0; i < 6; i++) {
                const subject = form[`subject${i}`];
                if (subject) {
                    rows.push({
                        subject: subject.value,
                        theory: form[`theory${i}`].value,
                        practical: form[`practical${i}`].value,
                        obtained: form[`obtained${i}`].value
                    });
                }
            }
            data.rows = rows;
            console.log('Subject rows gathered:', rows);
            
            // Prepare QR data as a formatted string for readability
            const qrDataString = `
Thank you for joining Saha Institute of Management & Technology!

Congratulations, ${titleCase(data.name)}!
You have successfully completed the course: ${titleCase(data.certificate)}.

We are proud of your achievement and wish you a bright future ahead.

- Saha Institute of Management & Technology`;

            // Generate QR code
            const qrDataUrl = await new Promise((resolve, reject) => {
                QRCode.toDataURL(qrDataString, { width: 200, margin: 2 }, (err, url) => {
                    if (err) reject(err);
                    else resolve(url);
                });
            });
            // Generate barcode (using registration number for reliability)
            JsBarcode("#barcodeCanvas", data.registration, { format: "CODE128", displayValue: false });
            const barcodeDataUrl = document.getElementById('barcodeCanvas').toDataURL("image/png");
            // Watermark
            const watermarkCanvas = document.getElementById('watermarkCanvas');
            const ctx = watermarkCanvas.getContext('2d');
            ctx.clearRect(0, 0, 400, 400);
            ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SAHA INSTITUTE', 200, 200);
            const watermarkDataUrl = watermarkCanvas.toDataURL('image/png');
            // Photo
            let photoDataUrl = watermarkDataUrl;
            const photoInput = form['photo'];
            if (photoInput.files && photoInput.files[0]) {
                photoDataUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.readAsDataURL(photoInput.files[0]);
                });
            }
            // Generate PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', margin: 1 });
            // Add images
            doc.addImage(barcodeDataUrl, 'PNG', 450, 70, 85, 14);
            doc.addImage(qrDataUrl, 'JPEG', 80, 100, 85, 80);
            doc.addImage(photoDataUrl, "JPEG", 450, 100, 85, 70);
            // Add text fields
            doc.setFontSize(14);
            doc.text(`${data.registration}`, 80, 80);
            doc.text(`${titleCase(data.name)}`, 220, 180);
            doc.text(`${titleCase(data.fathersname)}`, 220, 205);
            doc.text(`${titleCase(data.mothersname)}`, 220, 230);
            doc.text(`${data.dob}`, 440, 230);
            doc.text(`${data.rollno}`, 145, 260);
            doc.text(`${data.erollno}`, 310, 260);
            doc.text(`${data.IssueSession}`, 440, 260);
            doc.text(`${data.duration}`, 220, 290);
            doc.text(`${titleCase(data.performance)}`, 345, 340);
            doc.setFont("helvetica", "bold");
            doc.text(`${titleCase(data.certificate)}`, 300, 430, null, null, "center");
            // Table Headers
            const tableStartY = 465;
            const pageWidth = doc.internal.pageSize.width;
            const rectangleWidth = 440;
            const x = ((pageWidth - rectangleWidth) / 2) + 10;
            doc.setFontSize(11);
            doc.setLineWidth(2);
            doc.rect(x, tableStartY, rectangleWidth, 15);
            doc.text("S.NO", 95, tableStartY + 10);
            doc.text("Subject", 130, tableStartY + 10);
            doc.text("Total", 330, tableStartY + 10);
            doc.text("Theory", 365, tableStartY + 10);
            doc.text("Practical", 410, tableStartY + 10);
            doc.text("Obtained", 465, tableStartY + 10);
            // Add Rows
            let totalTheory = 0;
            let totalPractical = 0;
            let totalObtained = 0;
            const maxRows = 6;
            let maxMarks = 0;
            doc.setFont("times", "normal");
            for (let index = 0; index < maxRows; index++) {
                const rowY = tableStartY + 15 + index * 15;
                doc.rect(x, rowY, rectangleWidth, 15);
                if (rows[index] !== undefined) {
                    doc.text(`${index + 1}`, 95, rowY + 10);
                    doc.text(`${titleCase(rows[index].subject) || ""}`, 130, rowY + 10);
                    doc.text(`100`, 330, rowY + 10);
                    doc.text(`${rows[index].theory || ""}`, 365, rowY + 10);
                    doc.text(`${rows[index].practical || ""}`, 410, rowY + 10);
                    doc.text(`${rows[index].obtained || ""}`, 465, rowY + 10);
                    maxMarks += 100;
                    totalTheory += rows[index].theory ? parseInt(rows[index].theory, 10) : 0;
                    totalPractical += rows[index].practical ? parseInt(rows[index].practical, 10) : 0;
                    totalObtained += rows[index].obtained ? parseInt(rows[index].obtained, 10) : 0;
                }
            }
            // Add Total Row
            const totalRowY = tableStartY + 15 + maxRows * 15;
            doc.rect(x, totalRowY, rectangleWidth, 15);
            doc.text("Total", 130, totalRowY + 10);
            doc.text(`${maxMarks}`, 320, totalRowY + 10);
            doc.text(`${totalTheory}`, 365, totalRowY + 10);
            doc.text(`${totalPractical}`, 410, totalRowY + 10);
            doc.text(`${totalObtained}`, 465, totalRowY + 10);
            // Add Issue Details
            doc.setFontSize(16);
            doc.text(`${data.Grade}`, 240, 610);
            doc.text(`${data.IssueDay}`, 240, 635);
            doc.text(` ${titleCase(data.IssueMonth)} ${data.IssueYear}`, 355, 635);
            // Generate PDF blob for storage and download
            const pdfBlob = doc.output('blob');
            
            // Save PDF file immediately
            doc.save(`certificate_${data.registration}.pdf`);
            console.log('PDF saved successfully');
            
            // Save certificate to backend and refresh table
            console.log('Attempting to save certificate to backend...');
            const certificateId = await saveCertificateToBackend(data);
            console.log('Certificate saved to backend, ID:', certificateId);
            
            // Refresh the certificate table to show the new certificate
            await loadExistingCertificates();
            
            // Show success message
            if (certificateId) {
                alert('Certificate generated and saved successfully!');
            } else {
                alert('Certificate generated but failed to save to database. Please check the backend logs.');
            }
        };
    } else {
        console.error('Certificate form not found!');
    }
}); 