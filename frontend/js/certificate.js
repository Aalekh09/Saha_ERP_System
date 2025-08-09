// Check if user is logged in
if (!localStorage.getItem('isLoggedIn')) {
    window.location.replace('login.html');
    throw new Error('Not logged in');
}

// Set username from localStorage
const username = localStorage.getItem('username');
if (username) {
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = username;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables
    const certificateForm = document.getElementById('certificateForm');
    const studentName = document.getElementById('studentName');
    const courseName = document.getElementById('courseName');
    const certificateType = document.getElementById('certificateType');
    const studentIdInput = document.getElementById('studentIdInput');
    const previewCertificateBtn = document.getElementById('previewCertificate');
    const downloadCertificateBtn = document.getElementById('downloadCertificate');
    const printCertificateBtn = document.getElementById('printCertificate');
    const clearFormBtn = document.getElementById('clearForm');
    const fullscreenPreviewBtn = document.getElementById('fullscreenPreview');

    // Add real-time preview updates
    if (studentName) {
        studentName.addEventListener('input', updateLivePreview);
    }
    if (courseName) {
        courseName.addEventListener('input', updateLivePreview);
    }
    if (certificateType) {
        certificateType.addEventListener('change', updateLivePreview);
    }
    if (studentIdInput) {
        studentIdInput.addEventListener('input', updateLivePreview);
    }

    // Event Listeners
    if (certificateForm) {
        certificateForm.addEventListener('submit', handleCertificateGeneration);
    }
    if (previewCertificateBtn) {
        previewCertificateBtn.addEventListener('click', updateLivePreview);
    }
    if (downloadCertificateBtn) {
        downloadCertificateBtn.addEventListener('click', downloadCertificate);
    }
    if (printCertificateBtn) {
        printCertificateBtn.addEventListener('click', printCertificate);
    }
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }
    if (fullscreenPreviewBtn) {
        fullscreenPreviewBtn.addEventListener('click', openFullscreenPreview);
    }

    // Initialize live preview on page load
    updateLivePreview();

    // Live Preview Function
    function updateLivePreview() {
        console.log('updateLivePreview called');

        const studentNameValue = studentName ? studentName.value.trim() : '';
        const courseNameValue = courseName ? courseName.value.trim() : '';
        const certificateTypeValue = certificateType ? certificateType.value : 'Completion';
        const studentIdValue = studentIdInput ? studentIdInput.value.trim() : '';

        // Update student name
        const studentNameElement = document.querySelector('.student-name-new');
        if (studentNameElement) {
            studentNameElement.textContent = studentNameValue || '[Student Name]';
        }

        // Update course name
        const courseNameElement = document.querySelector('.course-name-new');
        if (courseNameElement) {
            courseNameElement.textContent = courseNameValue || '[Course Name]';
        }

        // Update certificate type
        const certificateTypeElement = document.querySelector('.certificate-type-new');
        if (certificateTypeElement) {
            certificateTypeElement.textContent = `CERTIFICATE OF ${certificateTypeValue.toUpperCase()}`;
        }

        // Update certificate ID
        const certificateIdElement = document.getElementById('certificateStudentId');
        if (certificateIdElement) {
            certificateIdElement.textContent = studentIdValue || generateCertificateId();
        }

        // Update issue date
        const issueDateElement = document.getElementById('issueDateNew');
        if (issueDateElement) {
            const today = new Date();
            const formattedDate = today.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            issueDateElement.textContent = formattedDate;
        }

        console.log('Live preview updated');
    }

    // Generate Certificate ID function
    function generateCertificateId() {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        return `SIMT-CERT-${year}-${month}-${randomNum}`;
    }

    // Clear Form Function
    function clearForm() {
        if (certificateForm) {
            certificateForm.reset();
            updateLivePreview();
            showNotification('Form cleared successfully', 'success');
        }
    }

    // Fullscreen Preview Function
    function openFullscreenPreview() {
        const certificateContainer = document.querySelector('.certificate-container-new');
        if (!certificateContainer) {
            showNotification('Certificate preview not found', 'error');
            return;
        }

        // Create fullscreen modal
        const fullscreenModal = document.createElement('div');
        fullscreenModal.className = 'fullscreen-modal';
        fullscreenModal.innerHTML = `
            <div class="fullscreen-overlay">
                <div class="fullscreen-content">
                    <div class="fullscreen-header">
                        <h3>Certificate Preview - Fullscreen</h3>
                        <button class="fullscreen-close" title="Close Fullscreen">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="fullscreen-certificate">
                        ${certificateContainer.outerHTML}
                    </div>
                </div>
            </div>
        `;

        // Add to body
        document.body.appendChild(fullscreenModal);

        // Add event listeners
        const closeBtn = fullscreenModal.querySelector('.fullscreen-close');
        const overlay = fullscreenModal.querySelector('.fullscreen-overlay');

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(fullscreenModal);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(fullscreenModal);
            }
        });

        // Close on ESC key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(fullscreenModal);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Handle Certificate Generation
    async function handleCertificateGeneration(e) {
        e.preventDefault();

        // Validate required fields
        if (!studentName || !studentName.value.trim()) {
            showNotification('Please enter student name', 'error');
            return;
        }

        if (!courseName || !courseName.value.trim()) {
            showNotification('Please enter course name', 'error');
            return;
        }

        try {
            showNotification('Generating certificate...', 'info');
            updateLivePreview();

            // Wait a moment for the preview to update
            setTimeout(async () => {
                await downloadCertificate();
            }, 500);

        } catch (error) {
            console.error('Error generating certificate:', error);
            showNotification('Error generating certificate', 'error');
        }
    }

    // Download Certificate Function
    async function downloadCertificate() {
        const certificateElement = document.querySelector('.certificate-template');

        if (!certificateElement) {
            console.error('Certificate element not found');
            showNotification('Certificate template not found', 'error');
            return;
        }

        try {
            showNotification('Generating certificate download...', 'info');
            await generateJPGDownload(certificateElement);
        } catch (error) {
            console.error('Download failed:', error);
            showNotification('Error generating certificate download', 'error');
        }
    }

    // Generate JPG Download
    async function generateJPGDownload(certificateElement) {
        // Create a wrapper div with proper styling
        const wrapper = document.createElement('div');
        wrapper.style.padding = '60px';
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.style.display = 'inline-block';
        wrapper.style.boxSizing = 'border-box';

        // Clone the certificate element
        const clonedCert = certificateElement.cloneNode(true);

        // Style the cloned certificate
        clonedCert.style.width = '1000px';
        clonedCert.style.height = 'auto';
        clonedCert.style.minHeight = '1400px';
        clonedCert.style.margin = '0';
        clonedCert.style.display = 'block';
        clonedCert.style.boxSizing = 'border-box';

        wrapper.appendChild(clonedCert);

        // Temporarily add wrapper to body (hidden)
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '-9999px';
        document.body.appendChild(wrapper);

        try {
            const canvas = await html2canvas(wrapper, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                letterRendering: true,
                scrollX: 0,
                scrollY: 0,
                width: wrapper.offsetWidth,
                height: wrapper.offsetHeight
            });

            // Convert canvas to JPG
            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            // Create download link
            const link = document.createElement('a');
            const studentNameForFile = studentName ? studentName.value.replace(/\s+/g, '_') : 'Student';
            link.download = `Certificate_${studentNameForFile}_FullHD.jpg`;
            link.href = imgData;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showNotification('Certificate downloaded successfully!', 'success');

        } finally {
            // Clean up
            document.body.removeChild(wrapper);
        }
    }

    // Print Certificate Function
    function printCertificate() {
        try {
            const certificateElement = document.querySelector('.certificate-template');
            if (!certificateElement) {
                showNotification('Certificate template not found for printing', 'error');
                return;
            }

            const printWindow = window.open('', '_blank');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Certificate Print</title>
                        <style>
                            @media print {
                                body { 
                                    margin: 0; 
                                    padding: 0; 
                                    background: white;
                                }
                                .certificate-template {
                                    width: 100%;
                                    height: 100vh;
                                    margin: 0;
                                    padding: 0;
                                    box-shadow: none;
                                    border: none;
                                }
                                * {
                                    -webkit-print-color-adjust: exact !important;
                                    color-adjust: exact !important;
                                }
                            }
                            body { 
                                margin: 0; 
                                padding: 0; 
                                background: white;
                            }
                            .certificate-template {
                                width: 100%;
                                margin: 0;
                                box-shadow: none;
                                border: none;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="certificate-template">${certificateElement.innerHTML}</div>
                        <script>
                            window.onload = function() {
                                setTimeout(function() {
                                    window.print();
                                    window.onafterprint = function() {
                                        window.close();
                                    };
                                }, 500);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
            showNotification('Print window opened', 'info');

        } catch (error) {
            console.error('Error printing certificate:', error);
            showNotification('Error printing certificate', 'error');
        }
    }

    // Enhanced notification system
    function showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.certificate-notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `certificate-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                    'linear-gradient(135deg, #3b82f6, #2563eb)'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-weight: 500;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }

    // Initialize bulk certificate functionality
    initializeBulkCertificates();
});

// Bulk Certificate Generation Functionality
function initializeBulkCertificates() {
    const bulkExcelFile = document.getElementById('bulkExcelFile');
    const uploadDropzone = document.getElementById('uploadDropzone');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFileBtn = document.getElementById('removeFile');
    const processBulkBtn = document.getElementById('processBulkCertificates');
    const downloadSampleBtn = document.getElementById('downloadSampleExcel');

    let uploadedFile = null;

    // Download sample Excel file
    if (downloadSampleBtn) {
        downloadSampleBtn.addEventListener('click', downloadSampleExcelFile);
    }

    // File upload handling
    if (uploadDropzone && bulkExcelFile) {
        uploadDropzone.addEventListener('click', () => bulkExcelFile.click());

        uploadDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadDropzone.classList.add('dragover');
        });

        uploadDropzone.addEventListener('dragleave', () => {
            uploadDropzone.classList.remove('dragover');
        });

        uploadDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadDropzone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });

        bulkExcelFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });
    }

    // Remove file
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', () => {
            uploadedFile = null;
            bulkExcelFile.value = '';
            fileInfo.style.display = 'none';
            uploadDropzone.style.display = 'block';
            processBulkBtn.disabled = true;
        });
    }

    // Process bulk certificates
    if (processBulkBtn) {
        processBulkBtn.addEventListener('click', processBulkCertificates);
    }

    function handleFileUpload(file) {
        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a valid Excel file (.xlsx or .xls)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            return;
        }

        uploadedFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = `(${(file.size / 1024).toFixed(1)} KB)`;

        uploadDropzone.style.display = 'none';
        fileInfo.style.display = 'flex';
        processBulkBtn.disabled = false;
    }

    function downloadSampleExcelFile() {
        // Create sample data
        const sampleData = [
            ['Student Name', 'Course Name', 'Student ID', 'Certificate Type'],
            ['John Doe', 'Web Development', 'STU001', 'Completion'],
            ['Jane Smith', 'Digital Marketing', 'STU002', 'Achievement'],
            ['Mike Johnson', 'Data Science', 'STU003', 'Excellence']
        ];

        // Create CSV content
        const csvContent = sampleData.map(row => row.join(',')).join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Certificate_Sample_Template.csv';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    }

    function processBulkCertificates() {
        alert('Bulk certificate processing functionality will be implemented soon!');
    }
}// D
// ebug function to check if all elements exist
function debugCertificateElements() {
    console.log('=== Certificate Elements Debug ===');

    const elements = {
        'studentName': document.getElementById('studentName'),
        'courseName': document.getElementById('courseName'),
        'certificateType': document.getElementById('certificateType'),
        'studentIdInput': document.getElementById('studentIdInput'),
        'student-name-new': document.querySelector('.student-name-new'),
        'course-name-new': document.querySelector('.course-name-new'),
        'certificate-type-new': document.querySelector('.certificate-type-new'),
        'certificateStudentId': document.getElementById('certificateStudentId'),
        'issueDateNew': document.getElementById('issueDateNew')
    };

    Object.entries(elements).forEach(([name, element]) => {
        console.log(`${name}:`, element ? '✓ Found' : '✗ Missing');
    });

    console.log('=== End Debug ===');
}

// Call debug function when page loads
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(debugCertificateElements, 1000);
});