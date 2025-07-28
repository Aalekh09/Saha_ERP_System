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
