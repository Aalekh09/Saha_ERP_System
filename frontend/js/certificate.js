document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const certificateForm = document.getElementById('certificateForm');
    const studentName = document.getElementById('studentName');
    const courseName = document.getElementById('courseName');
    const certificateType = document.getElementById('certificateType');
    const previewCertificateBtn = document.getElementById('previewCertificate');
    const downloadCertificateBtn = document.getElementById('downloadCertificate');
    const printCertificateBtn = document.getElementById('printCertificate');

    // Tab Navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the target panel from data attribute
            const targetPanel = this.getAttribute('data-target');
            
            // Hide all panels
            document.querySelectorAll('.tab-content').forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Show target panel
            if (targetPanel) {
                const panel = document.getElementById(targetPanel);
                if (panel) {
                    panel.classList.add('active');
                    
                    // Load content based on panel
                    switch(targetPanel) {
                        case 'dashboard-panel':
                            loadStudentList();
                            break;
                        case 'students-panel':
                            loadStudentList();
                            break;
                        case 'attendance-panel':
                            loadAttendanceList();
                            break;
                        case 'results-panel':
                            loadResultsList();
                            break;
                        case 'courses-panel':
                            loadCoursesList();
                            break;
                        case 'schedule-panel':
                            loadScheduleList();
                            break;
                        case 'certificates-panel':
                            loadCertificatesList();
                            break;
                        case 'templates-panel':
                            loadTemplatesList();
                            break;
                    }
                }
            }
        });
    });

    // Function to load student list
    async function loadStudentList() {
        try {
            const response = await fetch('/api/students');
            if (response.ok) {
                const students = await response.json();
                displayStudentList(students);
            } else {
                throw new Error('Failed to load students');
            }
        } catch (error) {
            console.error('Error loading students:', error);
            showNotification('Error loading student list', 'error');
        }
    }

    // Function to display student list
    function displayStudentList(students) {
        const dashboardPanel = document.getElementById('dashboard-panel');
        if (!dashboardPanel) return;

        const tableBody = dashboardPanel.querySelector('tbody');
        if (!tableBody) return;

        tableBody.innerHTML = students.map(student => `
            <tr>
                <td>${student.name}</td>
                <td>${student.rollNumber || '-'}</td>
                <td>${student.course || '-'}</td>
                <td>${student.email || '-'}</td>
                <td>${student.phone || '-'}</td>
                <td>
                    <button class="btn-icon" onclick="viewStudent('${student.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editStudent('${student.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Set default dates
    // const today = new Date(); // Removed
    // issueDate.valueAsDate = today; // Removed
    // validUntil.valueAsDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()); // Removed

    // Event Listeners
    certificateForm.addEventListener('submit', handleCertificateGeneration);
    previewCertificateBtn.addEventListener('click', showCertificatePreview);
    downloadCertificateBtn.addEventListener('click', downloadCertificate);
    printCertificateBtn.addEventListener('click', printCertificate);

    // Add real-time preview updates
    // Remove event listeners for date fields
    studentName.addEventListener('input', updatePreview);
    courseName.addEventListener('input', updatePreview);
    certificateType.addEventListener('change', updatePreview);
    const studentIdInput = document.getElementById('studentIdInput');
    studentIdInput.addEventListener('input', updatePreview);

    // Functions
    function updatePreview() {
        console.log('updatePreview called');
        const data = {
            student: {
                name: studentName.value.trim() || '[Student Name]',
                courseName: courseName.value.trim() || '[Course Name]',
                studentId: studentIdInput.value.trim() || '[ID]'
            },
            type: certificateType.value || 'Completion'
        };
     
        updatePreviewContent(data);
    }

    // Generate Certificate ID function
    function generateCertificateId(options = {}) {
        const type = options.type || 'Completion';
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        
        // Format: SIMT-COMP-2024-12-1234
        const typeCode = type.substring(0, 4).toUpperCase();
        return `SIMT-${typeCode}-${year}-${month}-${randomNum}`;
    }

    async function handleCertificateGeneration(e) {
        e.preventDefault();

        // Validate required fields
        if (!studentName.value.trim()) {
            showNotification('Please enter student name', 'error');
            return;
        }
        
        if (!courseName.value.trim()) {
            showNotification('Please enter course name', 'error');
            return;
        }

        const certificateData = {
            student: {
                name: studentName.value,
                courseName: courseName.value,
                studentId: studentIdInput.value || generateCertificateId({ type: certificateType.value })
            },
            type: certificateType.value,
            status: 'Active',
            certificateId: generateCertificateId({
                type: certificateType.value
            })
        };

        try {
            // Generate certificate locally (skip API call since it's not working)
            showNotification('Generating certificate...', 'info');
            updatePreviewContent(certificateData);
            
            // Wait a moment for the preview to update
            setTimeout(async () => {
                await downloadPDF();
            }, 500);
            
        } catch (error) {
            console.error('Error generating certificate:', error);
            showNotification('Error generating certificate', 'error');
        }
    }

    async function downloadPDF() {
        const certificateElement = document.querySelector('.certificate-template');
        
        if (!certificateElement) {
            console.error('Certificate element not found');
            showNotification('Certificate template not found', 'error');
            return;
        }

        try {
            // Prioritize JPG download for better quality and reliability
            showNotification('Generating Full HD certificate...', 'info');
            await generateJPGDownload(certificateElement);
            
        } catch (error) {
            console.error('JPG generation failed, trying PDF fallback:', error);
            showNotification('JPG failed, trying PDF...', 'info');
            
            try {
                if (typeof html2pdf !== 'undefined') {
                    await generatePDFDownload(certificateElement);
                } else {
                    throw new Error('PDF library not available');
                }
            } catch (pdfError) {
                console.error('Both JPG and PDF generation failed:', pdfError);
                showNotification('Error generating certificate download', 'error');
            }
        }
    }

    async function generatePDFDownload(certificateElement) {
        // Enhanced PDF generation optimized for the new certificate design
        const opt = {
            margin: [8, 8, 8, 8], // Adequate margins to prevent cutting
            filename: `Certificate_${studentName.value.replace(/\s+/g, '_') || 'Student'}.pdf`,
            image: { 
                type: 'jpeg', 
                quality: 0.92
            },
            html2canvas: { 
                scale: 2.5, // Higher scale for better quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                letterRendering: true,
                width: 794,  // A4 portrait width
                height: 1123, // A4 portrait height
                onclone: function(clonedDoc) {
                    // Optimize cloned document for PDF
                    const clonedCert = clonedDoc.querySelector('.certificate-template');
                    if (clonedCert) {
                        clonedCert.style.maxHeight = 'none';
                        clonedCert.style.overflow = 'visible';
                        clonedCert.style.height = 'auto';
                    }
                    
                    const clonedContainer = clonedDoc.querySelector('.certificate-container-new');
                    if (clonedContainer) {
                        clonedContainer.style.minHeight = '1050px'; // Ensure adequate height
                        clonedContainer.style.height = '1050px';
                        clonedContainer.style.overflow = 'visible';
                        clonedContainer.style.padding = '20px';
                    }
                    
                    // Ensure footer content is visible
                    const clonedFooter = clonedDoc.querySelector('.certificate-footer-new');
                    if (clonedFooter) {
                        clonedFooter.style.marginTop = '20px';
                        clonedFooter.style.paddingTop = '20px';
                        clonedFooter.style.pageBreakInside = 'avoid';
                    }
                    
                    // Ensure certificate info is visible
                    const clonedInfo = clonedDoc.querySelector('.certificate-info-new');
                    if (clonedInfo) {
                        clonedInfo.style.minWidth = '180px';
                        clonedInfo.style.fontSize = '12px';
                    }
                    
                    // Ensure images are properly sized
                    const images = clonedDoc.querySelectorAll('img');
                    images.forEach(img => {
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                    });
                }
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { 
                mode: ['avoid-all', 'css', 'legacy'] 
            }
        };

        await html2pdf().set(opt).from(certificateElement).save();
        showNotification('Certificate PDF downloaded successfully!', 'success');
    }

    async function generateJPGDownload(certificateElement) {
        // Create a wrapper div with equal padding for proper spacing
        const wrapper = document.createElement('div');
        wrapper.style.padding = '60px';
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.style.display = 'inline-block';
        wrapper.style.boxSizing = 'border-box';
        
        // Clone the certificate element
        const clonedCert = certificateElement.cloneNode(true);
        
        // Style the cloned certificate for optimal capture
        clonedCert.style.width = '1000px';
        clonedCert.style.height = 'auto';
        clonedCert.style.minHeight = '1400px';
        clonedCert.style.margin = '0';
        clonedCert.style.display = 'block';
        clonedCert.style.boxSizing = 'border-box';
        
        // Append cloned certificate to wrapper
        wrapper.appendChild(clonedCert);
        
        // Temporarily add wrapper to body (hidden)
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '-9999px';
        document.body.appendChild(wrapper);
        
        try {
            // Enhanced Full HD JPG generation with equal border spacing
            const canvas = await html2canvas(wrapper, {
                scale: 3, // High scale for Full HD quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                letterRendering: true,
                scrollX: 0,
                scrollY: 0,
                width: wrapper.offsetWidth,
                height: wrapper.offsetHeight,
                onclone: function(clonedDoc) {
                    // Ensure footer content is fully visible
                    const clonedFooter = clonedDoc.querySelector('.certificate-footer-new');
                    if (clonedFooter) {
                        clonedFooter.style.marginTop = '30px';
                        clonedFooter.style.paddingTop = '25px';
                        clonedFooter.style.position = 'relative';
                        clonedFooter.style.pageBreakInside = 'avoid';
                    }
                    
                    // Ensure certificate info is fully visible
                    const clonedInfo = clonedDoc.querySelector('.certificate-info-new');
                    if (clonedInfo) {
                        clonedInfo.style.minWidth = '250px';
                        clonedInfo.style.fontSize = '14px';
                        clonedInfo.style.lineHeight = '1.5';
                        clonedInfo.style.visibility = 'visible';
                        clonedInfo.style.display = 'flex';
                    }
                    
                    // Ensure signature area is visible
                    const clonedSignature = clonedDoc.querySelector('.signature-area-new');
                    if (clonedSignature) {
                        clonedSignature.style.visibility = 'visible';
                        clonedSignature.style.display = 'flex';
                    }
                    
                    // Ensure all text is crisp and visible
                    const allText = clonedDoc.querySelectorAll('*');
                    allText.forEach(element => {
                        element.style.webkitFontSmoothing = 'antialiased';
                        element.style.mozOsxFontSmoothing = 'grayscale';
                        element.style.textRendering = 'optimizeLegibility';
                    });
                    
                    // Ensure images are properly sized and crisp
                    const images = clonedDoc.querySelectorAll('img');
                    images.forEach(img => {
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        img.style.imageRendering = 'crisp-edges';
                        img.style.imageRendering = '-webkit-optimize-contrast';
                    });
                }
            });

            // Convert canvas to ultra high-quality JPG
            const imgData = canvas.toDataURL('image/jpeg', 1.0); // Maximum quality (100%)
            
            // Create download link
            const link = document.createElement('a');
            link.download = `Certificate_${studentName.value.replace(/\s+/g, '_') || 'Student'}_FullHD.jpg`;
            link.href = imgData;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('Full HD Certificate JPG downloaded successfully!', 'success');
            
        } finally {
            // Clean up - remove the temporary wrapper
            document.body.removeChild(wrapper);
        }
    }

    function showCertificatePreview() {
        updatePreview();
    }

    function updatePreviewContent(data) {
        console.log('updatePreviewContent called with data:', data);
        
        // Update certificate type
        const certificateTypeElement = document.querySelector('.certificate-type-new');
        if (certificateTypeElement) {
            certificateTypeElement.textContent = `CERTIFICATE OF ${data.type.toUpperCase()}`;
        }

        // Update student name
        const studentNameElement = document.querySelector('.student-name-new');
        if (studentNameElement) {
            studentNameElement.textContent = data.student.name || '[Student Name]';
        }

        // Update course name
        const courseNameElement = document.querySelector('.course-name-new');
        if (courseNameElement) {
            courseNameElement.textContent = data.student.courseName || '[Course Name]';
        }

        // Update certificate ID in footer
        const certificateStudentIdElement = document.getElementById('certificateStudentId');
        if (certificateStudentIdElement) {
            certificateStudentIdElement.textContent = data.certificateId || data.student.studentId || '[Certificate ID]';
        }

        // Update issue date
        const issueDateElement = document.getElementById('issueDateNew');
        if (issueDateElement) {
            const today = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            issueDateElement.textContent = today.toLocaleDateString('en-US', options);
        }

        // Update signatory information (static for now)
        const signatoryNameElement = document.querySelector('.signatory-name-new');
        if (signatoryNameElement) {
            signatoryNameElement.textContent = 'Aalekh';
        }

        const signatoryTitleElement = document.querySelector('.signatory-title-new');
        if (signatoryTitleElement) {
            signatoryTitleElement.textContent = 'Director';
        }
    }

    function formatDate(dateString) {
        // This function might not be needed if dates are removed, but keeping it for now
        if (!dateString || dateString === '[Date]') return '[Date]';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }


     // This function might not be needed for the professional portrait if there's no verification ID displayed
     // Keeping it in case it's used elsewhere or for future additions.
    // function generateVerificationId(certificateId) {
    //     // Generate a shorter verification ID based on the certificate ID
    //     return certificateId.split('-')[0] + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    // }

    async function downloadCertificate() {
        // Use the same optimized downloadPDF function
        await downloadPDF();
    }

    function printCertificate() {
        try {
            const certificateElement = document.querySelector('.certificate-template');
             if (!certificateElement) {
                 console.error('Certificate template element not found for printing.');
                 showNotification('Error: Certificate template not found for printing.', 'error');
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
                                    page-break-after: avoid;
                                    page-break-inside: avoid;
                                }
                                .certificate-theme-border {
                                    border: 2px solid #2c3e50 !important;
                                    padding: 2rem !important;
                                    background: white !important;
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
                        <div class="certificate-template"> ${certificateElement.innerHTML} </div>
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

             showNotification('Print window opened.', 'info');

        } catch (error) {
            console.error('Error printing certificate:', error);
            showNotification('Error printing certificate', 'error');
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Use a small delay to allow the element to be added before adding the show class for transition
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Automatically remove the notification after a few seconds
        setTimeout(() => {
            notification.classList.remove('show');
            // Remove the element after the transition ends
            notification.addEventListener('transitionend', () => {
                notification.remove();
            });
        }, 3000); // Notification stays for 3 seconds
    }

    // Add a placeholder viewCertificateDetails function if needed for the button
    // Keeping it in case it's called from other parts of the application
    window.viewCertificateDetails = function(certificateId) {
        console.log('View certificate details for ID:', certificateId);
        // Implement logic to show certificate details or preview for a generated certificate
        // This could involve fetching the certificate data by ID and populating the preview.
         showNotification(`Viewing details for certificate ID: ${certificateId}`, 'info');
    };


    // Load certificates when the page loads (Removed)
    // loadCertificates();

    // Don't call updatePreview on load to avoid auto-filling data
    // updatePreview();
});
// ===== BULK CERTIFICATE GENERATION FUNCTIONALITY =====

// Initialize bulk certificate functionality
function initializeBulkCertificates() {
    const bulkExcelFile = document.getElementById('bulkExcelFile');
    const uploadDropzone = document.getElementById('uploadDropzone');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFileBtn = document.getElementById('removeFile');
    const processBulkBtn = document.getElementById('processBulkCertificates');
    const downloadSampleBtn = document.getElementById('downloadSampleExcel');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

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

    async function processBulkCertificates() {
        if (!uploadedFile) {
            alert('Please upload an Excel file first');
            return;
        }

        try {
            processBulkBtn.disabled = true;
            progressContainer.style.display = 'block';
            progressText.textContent = 'Reading Excel file...';
            progressFill.style.width = '10%';

            // Read Excel file
            const studentData = await readExcelFile(uploadedFile);
            
            if (studentData.length === 0) {
                throw new Error('No valid data found in Excel file');
            }

            progressText.textContent = `Processing ${studentData.length} certificates...`;
            progressFill.style.width = '30%';

            // Generate certificates
            const certificates = await generateBulkCertificates(studentData);
            
            progressText.textContent = 'Creating ZIP file...';
            progressFill.style.width = '80%';

            // Create ZIP file
            await createAndDownloadZip(certificates);
            
            progressFill.style.width = '100%';
            progressText.textContent = 'Complete! ZIP file downloaded.';

            // Reset after 3 seconds
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressFill.style.width = '0%';
                processBulkBtn.disabled = false;
            }, 3000);

        } catch (error) {
            console.error('Error processing bulk certificates:', error);
            alert('Error processing certificates: ' + error.message);
            progressContainer.style.display = 'none';
            processBulkBtn.disabled = false;
        }
    }

    async function readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    // Process data (skip header row if exists)
                    const studentData = [];
                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (row[0] && row[1]) { // Name and Course are required
                            studentData.push({
                                name: row[0].toString().trim(),
                                course: row[1].toString().trim(),
                                studentId: row[2] ? row[2].toString().trim() : '',
                                certificateType: row[3] ? row[3].toString().trim() : 'Completion'
                            });
                        }
                    }
                    
                    resolve(studentData);
                } catch (error) {
                    reject(new Error('Failed to read Excel file: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    async function generateBulkCertificates(studentData) {
        const certificates = [];
        
        for (let i = 0; i < studentData.length; i++) {
            const student = studentData[i];
            
            // Update progress
            const progress = 30 + (i / studentData.length) * 50;
            progressFill.style.width = progress + '%';
            progressText.textContent = `Generating certificate ${i + 1} of ${studentData.length}...`;
            
            // Generate certificate image
            const certificateBlob = await generateCertificateImage(student);
            
            certificates.push({
                name: student.name,
                course: student.course,
                blob: certificateBlob,
                filename: `Certificate_${student.name.replace(/[^a-zA-Z0-9]/g, '_')}_${student.course.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`
            });
            
            // Small delay to prevent browser freezing
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return certificates;
    }

    async function generateCertificateImage(student) {
        // Create a temporary certificate element with the same design as preview
        const tempCertificate = createCertificateElement(student);
        document.body.appendChild(tempCertificate);
        
        try {
            // Use html2canvas to convert to image
            const canvas = await html2canvas(tempCertificate, {
                width: 1200,
                height: 850,
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            
            // Convert canvas to blob
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.95);
            });
        } finally {
            // Clean up temporary element
            document.body.removeChild(tempCertificate);
        }
    }

    function createCertificateElement(student) {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const certificateElement = document.createElement('div');
        certificateElement.style.position = 'absolute';
        certificateElement.style.left = '-9999px';
        certificateElement.style.width = '1200px';
        certificateElement.style.height = '850px';
        certificateElement.style.background = '#ffffff';
        
        certificateElement.innerHTML = `
            <div class="certificate-container-new" style="width: 1200px; height: 850px; position: relative; background: #ffffff; font-family: 'Inter', sans-serif;">
                <!-- Certificate Border Frame -->
                <div class="certificate-border-frame" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;">
                    <div class="border-outer" style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 8px solid #2c3e50; border-radius: 15px;"></div>
                    <div class="border-gold" style="position: absolute; top: 35px; left: 35px; right: 35px; bottom: 35px; border: 3px solid #f39c12; border-radius: 10px;"></div>
                    <div class="border-white" style="position: absolute; top: 45px; left: 45px; right: 45px; bottom: 45px; border: 2px solid #ecf0f1; border-radius: 8px;"></div>
                    <div class="border-inner" style="position: absolute; top: 55px; left: 55px; right: 55px; bottom: 55px; border: 1px solid #bdc3c7; border-radius: 6px;"></div>
                </div>
                
                <!-- Certificate Content -->
                <div class="certificate-content-new" style="position: absolute; top: 80px; left: 80px; right: 80px; bottom: 80px; display: flex; flex-direction: column; justify-content: space-between;">
                    <!-- Header Section -->
                    <div class="certificate-header-new" style="text-align: center; margin-bottom: 40px;">
                        <div class="institute-details-new">
                            <h1 class="institute-name-new" style="font-size: 42px; font-weight: 700; color: #2c3e50; margin: 0 0 10px 0; letter-spacing: 2px;">Saha Institute of Management & Technology</h1>
                            <div class="institute-subtitle-new" style="font-size: 18px; color: #7f8c8d; margin-bottom: 20px;">Center of Excellence in Education</div>
                            <div class="certificate-seal" style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #3498db, #2980b9); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                <div class="seal-inner" style="color: white; font-size: 32px;">
                                    <i class="fas fa-award"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Certificate Title -->
                    <div class="certificate-title-new" style="text-align: center; margin: 30px 0;">
                        <h2 class="certificate-type-new" style="font-size: 48px; font-weight: 700; color: #e74c3c; margin: 0; letter-spacing: 3px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">CERTIFICATE OF ${student.certificateType.toUpperCase()}</h2>
                    </div>
                    
                    <!-- Certificate Body -->
                    <div class="certificate-body-new" style="text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                        <div class="presentation-section-new" style="margin-bottom: 25px;">
                            <p class="presentation-text-new" style="font-size: 24px; color: #2c3e50; margin: 0;">This is to certify that</p>
                        </div>
                        
                        <div class="student-section-new" style="margin: 30px 0;">
                            <div class="student-name-container-new">
                                <h3 class="student-name-new" style="font-size: 52px; font-weight: 700; color: #27ae60; margin: 0; text-decoration: underline; text-decoration-color: #3498db; text-underline-offset: 10px;">${student.name}</h3>
                            </div>
                        </div>
                        
                        <div class="achievement-section-new" style="margin: 25px 0;">
                            <p class="achievement-text-new" style="font-size: 24px; color: #2c3e50; margin: 0;">has successfully completed the comprehensive course</p>
                        </div>
                        
                        <div class="course-section-new" style="margin: 30px 0;">
                            <div class="course-name-container-new">
                                <h4 class="course-name-new" style="font-size: 36px; font-weight: 600; color: #8e44ad; margin: 0; font-style: italic;">${student.course}</h4>
                            </div>
                        </div>
                        
                        <div class="completion-section-new" style="margin-top: 25px;">
                            <p class="completion-text-new" style="font-size: 20px; color: #2c3e50; margin: 0; font-style: italic;">with distinction and dedication to academic excellence</p>
                        </div>
                    </div>
                    
                    <!-- Certificate Footer -->
                    <div class="certificate-footer-new" style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px;">
                        <div class="signature-area-new">
                            <div class="signature-block-new" style="text-align: center;">
                                <div class="signature-line-new" style="width: 200px; height: 2px; background: #2c3e50; margin: 0 auto 10px;"></div>
                                <div class="signatory-info-new">
                                    <div class="signatory-name-new" style="font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">Aalekh</div>
                                    <div class="signatory-title-new" style="font-size: 14px; color: #7f8c8d;">Director</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="certificate-info-new" style="text-align: right;">
                            <div class="info-item-new" style="margin-bottom: 8px;">
                                <span class="info-label-new" style="font-size: 14px; color: #7f8c8d;">Certificate ID: </span>
                                <span class="info-value-new" style="font-size: 14px; color: #2c3e50; font-weight: 600;">${student.studentId || 'SIMT-' + Date.now().toString().substr(-6)}</span>
                            </div>
                            <div class="info-item-new">
                                <span class="info-label-new" style="font-size: 14px; color: #7f8c8d;">Date Issued: </span>
                                <span class="info-value-new" style="font-size: 14px; color: #2c3e50; font-weight: 600;">${currentDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Background Watermark -->
                <div class="certificate-watermark-new" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; z-index: 0;">
                    <div style="width: 300px; height: 300px; background: #2c3e50; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-graduation-cap" style="font-size: 150px; color: #ffffff;"></i>
                    </div>
                </div>
            </div>
        `;
        
        return certificateElement;
    }

    async function createAndDownloadZip(certificates) {
        // Create ZIP file using JSZip
        const zip = new JSZip();
        
        certificates.forEach(cert => {
            zip.file(cert.filename, cert.blob);
        });
        
        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // Download ZIP file
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SIMT_Certificates_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function downloadSampleExcelFile() {
        // Create sample data
        const sampleData = [
            ['Student Name', 'Course Name', 'Student ID', 'Certificate Type'],
            ['John Doe', 'Web Development', 'STU001', 'Completion'],
            ['Jane Smith', 'Data Science', 'STU002', 'Excellence'],
            ['Mike Johnson', 'Digital Marketing', 'STU003', 'Participation'],
            ['Sarah Wilson', 'Graphic Design', 'STU004', 'Achievement']
        ];

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(sampleData);
        
        // Set column widths
        ws['!cols'] = [
            { width: 20 }, // Student Name
            { width: 25 }, // Course Name
            { width: 15 }, // Student ID
            { width: 18 }  // Certificate Type
        ];
        
        XLSX.utils.book_append_sheet(wb, ws, 'Students');
        
        // Download file
        XLSX.writeFile(wb, 'SIMT_Certificate_Sample.xlsx');
    }
}

// Initialize bulk certificates when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add required libraries
    loadRequiredLibraries().then(() => {
        initializeBulkCertificates();
    });
});

// Load required libraries
function loadRequiredLibraries() {
    return new Promise((resolve) => {
        let loadedCount = 0;
        const totalLibraries = 3;
        
        function checkComplete() {
            loadedCount++;
            if (loadedCount === totalLibraries) {
                resolve();
            }
        }
        
        // Load XLSX library
        if (!window.XLSX) {
            const xlsxScript = document.createElement('script');
            xlsxScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            xlsxScript.onload = checkComplete;
            document.head.appendChild(xlsxScript);
        } else {
            checkComplete();
        }
        
        // Load JSZip library
        if (!window.JSZip) {
            const jszipScript = document.createElement('script');
            jszipScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            jszipScript.onload = checkComplete;
            document.head.appendChild(jszipScript);
        } else {
            checkComplete();
        }
        
        // Load html2canvas library
        if (!window.html2canvas) {
            const html2canvasScript = document.createElement('script');
            html2canvasScript.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            html2canvasScript.onload = checkComplete;
            document.head.appendChild(html2canvasScript);
        } else {
            checkComplete();
        }
    });
}